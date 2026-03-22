import type * as ToneType from 'tone';

/**
 * コード動作用ポリフォニックシンセ
 */
export function createChordSynth(Tone: typeof ToneType) {
  return new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.05, decay: 0.1, sustain: 0.8, release: 1 },
    volume: -10,
  }).toDestination();
}

/**
 * パッド用シンセ（柔らかく背景を支える）
 */
export function createPadSynth(Tone: typeof ToneType) {
  return new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 0.5, decay: 0.1, sustain: 0.8, release: 2 },
    volume: -15,
  }).toDestination();
}

/**
 * ベース用モノフォニックシンセ
 */
export function createBassSynth(Tone: typeof ToneType) {
  const synth = new Tone.MonoSynth({
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.5, release: 0.5 },
    filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.5, release: 0.5, baseFrequency: 100, octaves: 4 },
    volume: -8,
  });
  return synth.toDestination();
}

/**
 * キックドラム用シンセ
 */
export function createKick(Tone: typeof ToneType) {
  return new Tone.MembraneSynth({
    volume: -5,
  }).toDestination();
}

/**
 * スネアドラム用シンセ
 */
export function createSnare(Tone: typeof ToneType) {
  return new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.2, sustain: 0 },
    volume: -12,
  }).toDestination();
}

/**
 * ハイハット用シンセ
 */
export function createHihat(Tone: typeof ToneType) {
  return new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.05, sustain: 0 },
    volume: -15,
  }).toDestination();
}
