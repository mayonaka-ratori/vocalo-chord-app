import type * as ToneType from 'tone';
import {
  createChordSynth,
  createPadSynth,
  createBassSynth,
  createKick,
  createSnare,
  createHihat
} from './instruments';

// Dynamic import strategy for SSR safety
let ToneModule: typeof ToneType | null = null;

// Instrument instances
let chordSynth: ToneType.PolySynth | null = null;
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
export async function initAudio() {
  const Tone = await getTone();
  await Tone.start();
  
  if (!chordSynth) chordSynth = createChordSynth(Tone);
  if (!padSynth) padSynth = createPadSynth(Tone);
  if (!bassSynth) bassSynth = createBassSynth(Tone);
  if (!kickDrum) kickDrum = createKick(Tone);
  if (!snareDrum) snareDrum = createSnare(Tone);
  if (!hihatDrum) hihatDrum = createHihat(Tone);
}

/**
 * Clean up all Tone objects (on unmount)
 */
export function disposeAudio() {
  chordSynth?.dispose();
  padSynth?.dispose();
  bassSynth?.dispose();
  kickDrum?.dispose();
  snareDrum?.dispose();
  hihatDrum?.dispose();

  chordSynth = null;
  padSynth = null;
  bassSynth = null;
  kickDrum = null;
  snareDrum = null;
  hihatDrum = null;
}

export function isAudioReady() {
  return ToneModule !== null && chordSynth !== null;
}

// Getters for instruments
export const getChordSynth = () => chordSynth;
export const getPadSynth = () => padSynth;
export const getBassSynth = () => bassSynth;
export const getKick = () => kickDrum;
export const getSnare = () => snareDrum;
export const getHihat = () => hihatDrum;
