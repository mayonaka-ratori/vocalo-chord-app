import type * as ToneType from 'tone';
import { getTone } from './engine';
import { playDrumStep } from './drummer';
import { playBassStep } from './bassist';
import { playBackingStep } from './backing';

import { drumPatterns } from '@/data/drum-patterns';
import { bassPatterns } from '@/data/bass-patterns';
import { backingPatterns } from '@/data/backing-patterns';

import { InstrumentPresetId } from '@/types/audio';
import { Section } from '@/types/music';

export interface PlaybackStateConfig {
  mode: 'section' | 'song';
  bpm: number;
  
  // Used in section mode
  chords: string[];
  drumPatternId: string;
  bassPatternId: string;
  backingPatternId: string;
  instrumentPresetId: InstrumentPresetId;
  
  // Used in song mode
  sections?: Section[];
  startSectionIndex?: number; // Starting section (can default to 0)
}

interface SectionBarMap {
  globalBar: number;
  sectionIndex: number;
  localBar: number;
  section: Section;
}

let Tone: typeof ToneType | null = null;
let playbackLoop: ToneType.Loop | null = null;
let currentConfig: PlaybackStateConfig | null = null;

let onBarChangeCallback: ((globalBar: number, localBar: number, sectionIndex: number) => void) | null = null;
let onSectionChangeCallback: ((sectionIndex: number) => void) | null = null;
let onPlaybackCompleteCallback: (() => void) | null = null;

let currentStepGlobal = 0; // 16th note steps elapsed
let sectionBarMap: SectionBarMap[] = [];

function buildSectionBarMap(sections: Section[]): SectionBarMap[] {
  const map: SectionBarMap[] = [];
  let globalBar = 0;
  sections.forEach((sec, idx) => {
    for (let r = 0; r < sec.repeat; r++) {
      for (let b = 0; b < sec.bars; b++) {
        map.push({
          globalBar,
          sectionIndex: idx,
          localBar: b,
          section: sec
        });
        globalBar++;
      }
    }
  });
  return map;
}

export function setPlaybackCallbacks(
  onBarChange: (globalBar: number, localBar: number, sectionIndex: number) => void,
  onSectionChange: (sectionIndex: number) => void,
  onPlaybackComplete: () => void
) {
  onBarChangeCallback = onBarChange;
  onSectionChangeCallback = onSectionChange;
  onPlaybackCompleteCallback = onPlaybackComplete;
}

export function updatePlaybackConfig(config: PlaybackStateConfig) {
  if (currentConfig) {
    currentConfig = config;
    if (Tone) Tone.Transport.bpm.value = config.bpm;
    if (config.mode === 'song' && config.sections) {
      sectionBarMap = buildSectionBarMap(config.sections);
    }
  }
}

export async function updateTempo(bpm: number) {
  Tone = await getTone();
  Tone.Transport.bpm.value = bpm;
}

export async function startPlayback(config: PlaybackStateConfig) {
  Tone = await getTone();
  if (!Tone) return;

  currentConfig = config;
  Tone.Transport.bpm.value = config.bpm;
  
  if (playbackLoop) {
    playbackLoop.stop();
    playbackLoop.dispose();
  }

  currentStepGlobal = 0;

  if (config.mode === 'song' && config.sections) {
    sectionBarMap = buildSectionBarMap(config.sections);
    // Find step offset if we want to start from a specific section
    // Currently, let's just start from 0 mapping (beginning of song)
    // Could add advance to startSectionIndex later.
  }

  // Pre-notify UI
  if (config.mode === 'song' && sectionBarMap.length > 0) {
    if (onSectionChangeCallback) onSectionChangeCallback(0);
    if (onBarChangeCallback) onBarChangeCallback(0, 0, 0);
  } else {
    if (onBarChangeCallback) onBarChangeCallback(0, 0, -1);
  }

  let lastReportedBar = -1;
  let currentSectionIndexInternal = -1;
  let currentInstrumentId = config.mode === 'song' && config.sections 
      ? config.sections[0].instrumentPresetId 
      : config.instrumentPresetId;
      
  // Ensure starting instrument is correct
  const { isAudioReady, switchBackingInstrument } = await import('./engine');
  if (isAudioReady()) {
    switchBackingInstrument(currentInstrumentId);
  }

  const stepsPerBar = 16;

  playbackLoop = new Tone.Loop((time) => {
    if (!currentConfig) return;

    const globalBarFloor = Math.floor(currentStepGlobal / stepsPerBar);

    let activeBar = 0;
    let localBar = 0;
    let sectionIdx = -1;
    let currentChord = 'C';
    let currentDrumPatternId = currentConfig.drumPatternId;
    let currentBassPatternId = currentConfig.bassPatternId;
    let currentBackingPatternId = currentConfig.backingPatternId;

    if (currentConfig.mode === 'song') {
      if (globalBarFloor >= sectionBarMap.length) {
        // Playback complete
        Tone!.Draw.schedule(() => {
          if (onPlaybackCompleteCallback) onPlaybackCompleteCallback();
          stopPlayback();
        }, time);
        return;
      }

      const mapNode = sectionBarMap[globalBarFloor];
      activeBar = globalBarFloor;
      localBar = mapNode.localBar;
      sectionIdx = mapNode.sectionIndex;
      currentChord = mapNode.section.chords[localBar] || 'C';
      
      currentDrumPatternId = mapNode.section.drumPatternId;
      currentBassPatternId = mapNode.section.bassPatternId;
      currentBackingPatternId = mapNode.section.backingPatternId;

      // Handle Section Transition
      if (currentStepGlobal % stepsPerBar === 0 && sectionIdx !== currentSectionIndexInternal) {
        currentSectionIndexInternal = sectionIdx;
        
        // Check if instrument changed
        if (mapNode.section.instrumentPresetId !== currentInstrumentId) {
          currentInstrumentId = mapNode.section.instrumentPresetId;
          Tone!.Draw.schedule(() => {
            switchBackingInstrument(currentInstrumentId);
          }, time - 0.05); // slightly before to prevent gap
        }

        Tone!.Draw.schedule(() => {
          if (onSectionChangeCallback) onSectionChangeCallback(sectionIdx);
        }, time);
      }

    } else {
      // Loop single section (flat mode)
      activeBar = globalBarFloor % currentConfig.chords.length;
      localBar = activeBar;
      currentChord = currentConfig.chords[activeBar];
    }

    if (currentStepGlobal % stepsPerBar === 0 && activeBar !== lastReportedBar) {
      lastReportedBar = activeBar;
      Tone!.Draw.schedule(() => {
        if (onBarChangeCallback) onBarChangeCallback(activeBar, localBar, sectionIdx);
      }, time);
    }

    // Resolve patterns
    const dPattern = drumPatterns.find(p => p.id === currentDrumPatternId) || null;
    const bPattern = bassPatterns.find(p => p.id === currentBassPatternId) || null;
    const bkPattern = backingPatterns.find(p => p.id === currentBackingPatternId) || null;

    if (dPattern) playDrumStep(dPattern, currentStepGlobal, time);
    if (bPattern) playBassStep(bPattern, currentStepGlobal, time, currentChord);
    if (bkPattern) playBackingStep(bkPattern, currentStepGlobal, time, currentChord);

    currentStepGlobal++;

  }, '16n');

  playbackLoop.start(0);
  Tone!.Transport.start();
}

export async function stopPlayback() {
  if (!Tone) return;

  const { stopAllUnified } = await import('./unified-player');
  await stopAllUnified();

  Tone.Transport.stop();
  
  if (playbackLoop) {
    playbackLoop.stop();
    playbackLoop.dispose();
    playbackLoop = null;
  }
  
  currentStepGlobal = 0;
}
