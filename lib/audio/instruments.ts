import type * as ToneType from 'tone';
import { InstrumentPresetId } from '@/types/audio';

export interface BackingInstrumentNode {
  synth: ToneType.PolySynth | ToneType.MonoSynth | ToneType.PluckSynth;
  effects: ToneType.ToneAudioNode[];
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

/**
 * カスタムバッキング音色ファクトリー
 */
export async function createBackingInstrument(
  Tone: typeof import('tone'),
  presetId: InstrumentPresetId
): Promise<BackingInstrumentNode> {
  let synth: ToneType.PolySynth | ToneType.MonoSynth | ToneType.PluckSynth;
  const effects: ToneType.ToneAudioNode[] = [];

  switch (presetId) {
    case 'release-cut-piano': {
      synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.001, decay: 0.08, sustain: 0.3, release: 0.01 },
        volume: -8
      });
      const reverb = new Tone.Reverb({ decay: 0.3, wet: 0.1 });
      await reverb.generate();
      effects.push(reverb);
      synth.chain(reverb, Tone.Destination);
      break;
    }
    case 'pluck-synth': {
      // Prompt suggested: Tone.PluckSynth ... or Tone.Synth sawtooth...
      // Tone.PluckSynth is often tricky to play polyphonically and volume/resonance.
      // Let's use PolySynth with sawtooth to support chords safely.
      synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.1 },
        volume: -10
      });
      const filter = new Tone.Filter({ type: 'lowpass', frequency: 2000 });
      effects.push(filter);
      synth.chain(filter, Tone.Destination);
      break;
    }
    case 'synth-pad': {
      synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.4, decay: 0.5, sustain: 0.8, release: 1.5 },
        volume: -12
      });
      // Set detune for the 2 voices? PolySynth doesn't easily do parallel detuned voices.
      // But we can add a Chorus to simulate it nicely.
      synth.set({ detune: 5 }); // Slight detune of all voices
      const chorus = new Tone.Chorus({ frequency: 1.5, depth: 0.7, delayTime: 3.5, wet: 0.5 }).start();
      effects.push(chorus);
      synth.chain(chorus, Tone.Destination);
      break;
    }
    case 'bell-tone': {
      synth = new Tone.PolySynth(Tone.FMSynth, {
        modulationIndex: 10,
        harmonicity: 3.5,
        envelope: { attack: 0.001, decay: 0.4, sustain: 0.1, release: 0.8 },
        volume: -12
      });
      synth.connect(Tone.Destination);
      break;
    }
    case 'rock-guitar': {
      synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.001, decay: 0.3, sustain: 0.6, release: 0.2 },
        volume: -10
      });
      const dist = new Tone.Distortion(0.8);
      const filter = new Tone.Filter({ type: 'lowpass', frequency: 3000 });
      effects.push(dist, filter);
      synth.chain(dist, filter, Tone.Destination);
      break;
    }
    case '8bit-chiptune': {
      synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'square' },
        envelope: { attack: 0.001, decay: 0.1, sustain: 0.5, release: 0.05 },
        volume: -18
      });
      const bitcrush = new Tone.BitCrusher({ bits: 4 });
      effects.push(bitcrush);
      synth.chain(bitcrush, Tone.Destination);
      break;
    }
    case 'strings': {
      synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.25, decay: 0.3, sustain: 0.7, release: 1.0 },
        volume: -12
      });
      const filter = new Tone.Filter({ type: 'lowpass', frequency: 4000 });
      const reverb = new Tone.Reverb({ decay: 2, wet: 0.2 });
      await reverb.generate();
      effects.push(filter, reverb);
      synth.chain(filter, reverb, Tone.Destination);
      break;
    }
    case 'edm-bass': {
      synth = new Tone.MonoSynth({
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.001, decay: 0.2, sustain: 0.5, release: 0.15 },
        volume: -5
      });
      const autoFilter = new Tone.AutoFilter({ frequency: 2, baseFrequency: 200, octaves: 2.5 }).start();
      effects.push(autoFilter);
      synth.chain(autoFilter, Tone.Destination);
      break;
    }
    default: {
      // Fallback similar to release-cut-piano
      synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.001, decay: 0.08, sustain: 0.3, release: 0.01 },
        volume: -8
      });
      synth.connect(Tone.Destination);
      break;
    }
  }

  return { synth, effects };
}
