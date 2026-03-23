import type * as ToneType from 'tone';
import {
  createBackingInstrument,
  BackingInstrumentNode,
  createPadSynth,
  createBassSynth,
  createKick,
  createSnare,
  createHihat
} from './instruments';
import { InstrumentPresetId } from '@/types/audio';

// Dynamic import strategy for SSR safety
let ToneModule: typeof ToneType | null = null;
let sharedContext: AudioContext | null = null;

// Instrument instances
let backingNode: BackingInstrumentNode | null = null;
let padSynth: ToneType.PolySynth | null = null;
let bassSynth: ToneType.MonoSynth | null = null;
let kickDrum: ToneType.MembraneSynth | null = null;
let snareDrum: ToneType.NoiseSynth | null = null;
let hihatDrum: ToneType.NoiseSynth | null = null;
let melodySynth: ToneType.Synth | null = null;
let melodyPart: ToneType.Part | null = null;

/**
 * Get Tone.js module safely
 */
export async function getTone() {
  if (!ToneModule) {
    ToneModule = await import('tone');
  }
  return ToneModule;
}

/**
 * Get shared AudioContext (compatible with Tone.js and smplr)
 */
export async function getAudioContext(): Promise<AudioContext> {
  if (typeof window === 'undefined') {
    throw new Error('AudioContext is not available in SSR');
  }
  
  if (!sharedContext) {
    const Tone = await getTone();
    // tone v14+ uses Tone.context.rawContext to expose the underlying AudioContext
    sharedContext = Tone.getContext().rawContext as unknown as AudioContext;
  }
  return sharedContext;
}

/**
 * Initialize audio context and instruments
 * MUST be called by user interaction
 */
export async function initAudio(initialPresetId: InstrumentPresetId = 'release-cut-piano') {
  const Tone = await getTone();
  await Tone.start();
  
  if (!backingNode) backingNode = createBackingInstrument(Tone, initialPresetId);
  if (!padSynth) padSynth = createPadSynth(Tone);
  if (!bassSynth) bassSynth = createBassSynth(Tone);
  if (!kickDrum) kickDrum = createKick(Tone);
  if (!snareDrum) snareDrum = createSnare(Tone);
  if (!hihatDrum) hihatDrum = createHihat(Tone);
  if (!melodySynth) melodySynth = await createMelodySynth(Tone);
}

/**
 * Create a dedicated melody preview synth
 */
async function createMelodySynth(Tone: typeof ToneType): Promise<ToneType.Synth> {
  const synth = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.02, decay: 0.3, sustain: 0.4, release: 0.3 }
  }).toDestination();
  synth.volume.value = -6;
  return synth;
}

/**
 * Switch backing instrument during runtime
 */
export function switchBackingInstrument(presetId: InstrumentPresetId) {
  if (!ToneModule) return;
  
  // Dispose old nodes
  if (backingNode) {
    backingNode.synth.dispose();
    backingNode.effects.forEach(eff => eff.dispose());
  }
  
  backingNode = createBackingInstrument(ToneModule, presetId);
}

/**
 * Clean up all Tone objects (on unmount)
 */
export function disposeAudio() {
  if (backingNode) {
    backingNode.synth.dispose();
    backingNode.effects.forEach(eff => eff.dispose());
  }
  padSynth?.dispose();
  bassSynth?.dispose();
  kickDrum?.dispose();
  snareDrum?.dispose();
  hihatDrum?.dispose();
  melodySynth?.dispose();
  melodyPart?.dispose();

  backingNode = null;
  padSynth = null;
  bassSynth = null;
  kickDrum = null;
  snareDrum = null;
  hihatDrum = null;
}

export function isAudioReady() {
  return ToneModule !== null && backingNode !== null;
}

// Getters for instruments
export const getChordSynth = () => backingNode?.synth ?? null;
export const getPadSynth = () => padSynth;
export const getBassSynth = () => bassSynth;
export const getKick = () => kickDrum;
export const getSnare = () => snareDrum;
export const getHihat = () => hihatDrum;

/**
 * Preview a melody phrase
 */
export async function previewMelody(notes: { midi: number; duration: number }[], bpm: number, onComplete?: () => void) {
  const Tone = await getTone();
  if (!Tone || !melodySynth) return;

  // Stop any existing preview
  stopMelodyPreview();

  const secPerBeat = 60 / bpm;
  let currentTime = 0;

  const partEvents = notes.map(note => {
    const event = {
      time: currentTime,
      note: Tone.Frequency(note.midi, "midi").toNote(),
      duration: note.duration * secPerBeat
    };
    currentTime += note.duration * secPerBeat;
    return event;
  });

  melodyPart = new Tone.Part((time, value) => {
    melodySynth?.triggerAttackRelease(value.note, value.duration, time);
  }, partEvents).start(0);

  // If transport is not running, we need to handle it
  const transportWasRunning = Tone.Transport.state === 'started';
  
  // We use a separate end trigger because Part.loop is false by default
  const totalDuration = currentTime;
  Tone.Transport.scheduleOnce(() => {
    if (!transportWasRunning) {
      Tone.Transport.stop();
    }
    stopMelodyPreview();
    if (onComplete) onComplete();
  }, Tone.Transport.seconds + totalDuration + 0.1);

  if (!transportWasRunning) {
    Tone.Transport.bpm.value = bpm;
    Tone.Transport.start();
  }
}

/**
 * Stop melody preview
 */
export function stopMelodyPreview() {
  if (melodyPart) {
    melodyPart.stop();
    melodyPart.dispose();
    melodyPart = null;
  }
}
