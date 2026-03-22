// @ts-expect-error - midi-writer-js lacks proper TypeScript definitions
import * as MidiWriter from 'midi-writer-js';
import { drumPatterns } from '@/data/drum-patterns';
import { bassPatterns } from '@/data/bass-patterns';
import { getNoteIndex } from '@/lib/music/chords';
import { NoteName } from '@/types/music';
import { Section } from '@/types/music';

// ---------------------------------------------------------------------------
// Constants & Configuration
// ---------------------------------------------------------------------------

const CHORD_OCTAVE = 4;
const BASS_OCTAVE = 2;

// midi-writer-js duration string
// '1' = whole note, '2' = half, '4' = quarter, '8' = 8th, '16' = 16th
const DUR_16TH = '16';

// General MIDI Percussion Mapping (Channel 10)
const DRUM_KICK = 36;        // Acoustic Bass Drum
const DRUM_SNARE = 38;       // Acoustic Snare
const DRUM_HIHAT_CLOSED = 42;// Closed Hi-Hat
const DRUM_HIHAT_OPEN = 46;  // Open Hi-Hat

export type ExportConfig = {
  mode: 'section';
  chords: string[];
  tempo: number;
  drumPatternId: string;
  bassPatternId: string;
} | {
  mode: 'song';
  sections: Section[];
  tempo: number;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parses a chord symbol and returns an array of MIDI pitches.
 * Simplistic implementation supporting basic triads and 7ths.
 */
function chordToMidiPitches(chordName: string, octave: number): number[] {
  if (!chordName || chordName === 'N.C.') return [];

  const rootMatch = chordName.match(/^[A-G][#b]?/);
  if (!rootMatch) return [];

  const rootStr = rootMatch[0];
  const rootIndex = getNoteIndex(rootStr as NoteName);
  const baseMidi = octave * 12 + 12 + rootIndex; // Convert to MIDI standard (C4 = 60)

  const pitches = [baseMidi, baseMidi + 4, baseMidi + 7]; // Major triad

  // Simple modifier parsing
  if (chordName.includes('m') && !chordName.includes('maj')) {
    pitches[1] = baseMidi + 3; // minor third
  }
  if (chordName.includes('dim')) {
    pitches[1] = baseMidi + 3;
    pitches[2] = baseMidi + 6;
  }
  if (chordName.includes('aug')) {
    pitches[2] = baseMidi + 8;
  }
  if (chordName.includes('7')) {
    if (chordName.includes('maj7') || chordName.includes('M7')) {
      pitches.push(baseMidi + 11); // major 7th
    } else if (chordName.includes('m7b5')) {
      pitches[1] = baseMidi + 3;
      pitches[2] = baseMidi + 6;
      pitches.push(baseMidi + 10);
    } else {
      pitches.push(baseMidi + 10); // dominant 7th
    }
  }

  return pitches;
}

/** Returns the root pitch note for bass. */
function chordRootPitch(chordName: string, octave: number): number {
  if (!chordName || chordName === 'N.C.') return 0;
  const rootMatch = chordName.match(/^[A-G][#b]?/);
  if (!rootMatch) return 0;
  const rootIndex = getNoteIndex(rootMatch[0] as NoteName);
  return octave * 12 + 12 + rootIndex;
}

function chordRootOctavePitch(chordName: string, octave: number): number {
  return chordRootPitch(chordName, octave + 1);
}

/** Convert pattern duration strings to midi-writer durations */
function bassStepDuration(dur: string): string {
  switch (dur) {
    case '16n': return '16';
    case '8n': return '8';
    case '4n': return '4';
    case '8n.': return '8d';
    case '2n': return '2';
    case '1m': return '1';
    default: return '16';
  }
}

// ---------------------------------------------------------------------------
// Track Builders
// ---------------------------------------------------------------------------

function buildChordTrack(
  allChords: string[],
  tempo: number,
  ticksPerBar: number
): InstanceType<typeof MidiWriter.Track> {
  const track = new MidiWriter.Track();
  track.setTempo(tempo);
  track.setTimeSignature(4, 4, 24, 8);
  track.addTrackName('Chords');
  
  track.addEvent(new MidiWriter.ProgramChangeEvent({ instrument: 0 }));

  allChords.forEach((chordName, barIndex) => {
    if (chordName !== 'N.C.') {
      const pitches = chordToMidiPitches(chordName, CHORD_OCTAVE);
      const velocity = 80;

      const event = new MidiWriter.NoteEvent({
        pitch: pitches,
        duration: '1', 
        startTick: barIndex * ticksPerBar,
        velocity: velocity,
      });
      track.addEvent(event);
    }
  });

  return track;
}

function buildBassTrack(
  allChords: string[],
  allBassPatternIds: string[],
  tempo: number,
  ticksPerBar: number,
  ticksPer16th: number
): InstanceType<typeof MidiWriter.Track> {
  const track = new MidiWriter.Track();
  track.setTempo(tempo);
  track.addTrackName('Bass');
  
  track.addEvent(new MidiWriter.ProgramChangeEvent({ instrument: 32 }));

  allBassPatternIds.forEach((bId, barIndex) => {
    const bassPattern = bassPatterns.find(p => p.id === bId) || bassPatterns[0];
    const chordName = allChords[barIndex];

    if (chordName !== 'N.C.') {
      const rootPitch = chordRootPitch(chordName, BASS_OCTAVE);
      const octPitch = chordRootOctavePitch(chordName, BASS_OCTAVE);

      bassPattern.steps.forEach((step, stepIndex) => {
        if (step.type !== 'REST') {
          const pitch = step.type === 'OCT' ? octPitch : rootPitch;
          track.addEvent(
            new MidiWriter.NoteEvent({
              pitch: [pitch],
              duration: bassStepDuration(step.duration),
              velocity: 90,
              startTick: barIndex * ticksPerBar + (stepIndex * ticksPer16th),
            })
          );
        }
      });
    }
  });

  return track;
}

function buildDrumTrack(
  allDrumPatternIds: string[],
  tempo: number,
  ticksPerBar: number,
  ticksPer16th: number
): InstanceType<typeof MidiWriter.Track> {
  const track = new MidiWriter.Track();
  track.setTempo(tempo);
  track.addTrackName('Drums');

  allDrumPatternIds.forEach((dId, barIndex) => {
    const drumPattern = drumPatterns.find(p => p.id === dId) || drumPatterns[0];

    drumPattern.steps.forEach((step, stepIndex) => {
      const pitches: number[] = [];
      if (step.kick) pitches.push(DRUM_KICK);
      if (step.snare) pitches.push(DRUM_SNARE);
      if (step.hihatClosed) pitches.push(DRUM_HIHAT_CLOSED);
      if (step.hihatOpen) pitches.push(DRUM_HIHAT_OPEN);

      if (pitches.length > 0) {
        track.addEvent(
          new MidiWriter.NoteEvent({
            pitch: pitches,
            duration: DUR_16TH,
            channel: 10,
            velocity: 100,
            startTick: barIndex * ticksPerBar + (stepIndex * ticksPer16th),
          })
        );
      }
    });
  });

  return track;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function exportToMidi(config: ExportConfig): Blob {
  const { tempo } = config;

  let allChords: string[] = [];
  let allBassPatternIds: string[] = [];
  let allDrumPatternIds: string[] = [];

  if (config.mode === 'section') {
    // Current section
    allChords = allChords.concat(config.chords);
    allBassPatternIds = allBassPatternIds.concat(Array(config.chords.length).fill(config.bassPatternId));
    allDrumPatternIds = allDrumPatternIds.concat(Array(config.chords.length).fill(config.drumPatternId));
  } else {
    config.sections.forEach(section => {
      for (let i = 0; i < section.repeat; i++) {
        allChords = allChords.concat(section.chords);
        allBassPatternIds = allBassPatternIds.concat(Array(section.chords.length).fill(section.bassPatternId));
        allDrumPatternIds = allDrumPatternIds.concat(Array(section.chords.length).fill(section.drumPatternId));
      }
    });
  }

  const ticksPerBeat = 128; // Standard midi-writer-js ticksperbeat
  const beatsPerBar = 4;
  const ticksPerBar = ticksPerBeat * beatsPerBar;
  const ticksPer16th = ticksPerBeat / 4;

  const chordTrack = buildChordTrack(allChords, tempo, ticksPerBar);
  const bassTrack = buildBassTrack(allChords, allBassPatternIds, tempo, ticksPerBar, ticksPer16th);
  const drumTrack = buildDrumTrack(allDrumPatternIds, tempo, ticksPerBar, ticksPer16th);

  const writer = new MidiWriter.Writer([chordTrack, bassTrack, drumTrack]);
  const uint8 = writer.buildFile();
  
  return new Blob([uint8], { type: 'audio/midi' });
}
