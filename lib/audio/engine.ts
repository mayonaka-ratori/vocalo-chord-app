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
let toneStarted = false;

// Instrument instances
let backingNode: BackingInstrumentNode | null = null;
let padSynth: ToneType.PolySynth | null = null;
let bassSynth: ToneType.MonoSynth | null = null;
let kickDrum: ToneType.MembraneSynth | null = null;
let snareDrum: ToneType.NoiseSynth | null = null;
let hihatDrum: ToneType.NoiseSynth | null = null;
let melodySynth: ToneType.Synth | null = null;
let melodyPart: ToneType.Part | null = null;
let melodyPreviewTimeout: NodeJS.Timeout | null = null;

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
 * Synchronous getter — returns cached Tone module or null.
 * Safe to call inside Transport Loop after initAudio() has been called.
 */
export function getToneSync(): typeof ToneType | null {
  return ToneModule;
}

/**
 * Ensure AudioContext is running and Tone is started.
 * MUST be called by user interaction.
 */
export async function ensureAudioReady(): Promise<AudioContext> {
  if (typeof window === 'undefined') {
    throw new Error('AudioContext is not available in SSR');
  }

  const Tone = await getTone();

  if (!toneStarted) {
    await Tone.start();
    toneStarted = true;
  }

  if (!sharedContext) {
    // tone v14+ uses Tone.context.rawContext to expose the underlying AudioContext
    sharedContext = Tone.getContext().rawContext as unknown as AudioContext;
  }

  if (sharedContext.state === 'suspended') {
    await sharedContext.resume();
  }

  return sharedContext;
}

/**
 * Get shared AudioContext (compatible with Tone.js and smplr)
 * Note: If called before ensureAudioReady, it might be suspended.
 */
export function getAudioContext(): AudioContext {
  if (typeof window === 'undefined') {
     throw new Error('AudioContext is not available in SSR');
  }

  if (!sharedContext) {
    // Fallback: if Tone is loaded, we can get the context.
    // If not, this is likely called too early.
    if (ToneModule) {
      sharedContext = ToneModule.getContext().rawContext as unknown as AudioContext;
    } else {
      throw new Error('AudioContext not initialized. Call ensureAudioReady() first in a user gesture.');
    }
  }
  return sharedContext;
}

/**
 * Initialize audio context and instruments
 * MUST be called by user interaction
 */
export async function initAudio(initialPresetId: InstrumentPresetId = 'release-cut-piano') {
  await ensureAudioReady();
  const Tone = await getTone();
  
  if (!backingNode) backingNode = await createBackingInstrument(Tone, initialPresetId);
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
export async function switchBackingInstrument(presetId: InstrumentPresetId) {
  if (!ToneModule) return;
  
  // Dispose old nodes
  if (backingNode) {
    backingNode.synth.dispose();
    backingNode.effects.forEach(eff => eff.dispose());
  }
  
  backingNode = await createBackingInstrument(ToneModule, presetId);
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
  melodySynth = null;
  melodyPart = null;
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
export const getMelodySynth = () => melodySynth;

/**
 * Preview a melody phrase
 */
export async function previewMelody(notes: { midi: number; duration: number; velocity?: number; beat: number }[], bpm: number, onComplete?: () => void) {
  const Tone = await getTone();
  if (!Tone) return;

  // Stop any existing preview
  stopMelodyPreview();

  const { playUnifiedMelody, stopUnifiedMelody } = await import('./unified-player');
  const secPerBeat = 60 / bpm;
  const startTime = Tone.now() + 0.1; // small buffer

  notes.forEach(note => {
    const noteTime = startTime + (note.beat * secPerBeat);
    const noteDuration = note.duration * secPerBeat;

    playUnifiedMelody(note.midi, {
      duration: noteDuration,
      time: noteTime,
      velocity: note.velocity ?? 80,
    });
  });

  // Calculate total duration
  const totalDuration = notes.reduce((max, n) => 
    Math.max(max, (n.beat + n.duration) * secPerBeat), 0);

  // Auto-complete trigger
  const timeoutId = setTimeout(() => {
    stopUnifiedMelody();
    if (onComplete) onComplete();
  }, (totalDuration + 0.2) * 1000);

  // Store timeoutId to clear if stopped manually
  melodyPreviewTimeout = timeoutId;
}

/**
 * Stop melody preview
 */
export function stopMelodyPreview() {
  if (melodyPreviewTimeout) {
    clearTimeout(melodyPreviewTimeout);
    melodyPreviewTimeout = null;
  }
  
  import('./unified-player').then(m => m.stopUnifiedMelody());

  if (melodyPart) {
    melodyPart.stop();
    melodyPart.dispose();
    melodyPart = null;
  }
}
