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

// Instrument instances
let backingNode: BackingInstrumentNode | null = null;
let padSynth: ToneType.PolySynth | null = null;
let bassSynth: ToneType.MonoSynth | null = null;
let kickDrum: ToneType.MembraneSynth | null = null;
let snareDrum: ToneType.NoiseSynth | null = null;
let hihatDrum: ToneType.NoiseSynth | null = null;

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
