import { SmplrInstrumentId } from '@/types/music';

export interface VolumeProfile {
  chord: number;    // 0-127 for smplr, or dB for Tone.js
  bass: number;
  melody: number;
  drums: number;
}

/**
 * Calibrated for sampled instruments (piano has wide dynamic range)
 */
export const SMPLR_VOLUME_PROFILE: VolumeProfile = {
  chord: 85,      // chords slightly quieter to leave space
  bass: 100,      // bass prominent but not overwhelming
  melody: 95,     // melody sits on top
  drums: 60,      // drums are a guide, not dominant
};

/**
 * Calibrated for synth fallback (narrower dynamic range)
 */
export const SYNTH_VOLUME_PROFILE: VolumeProfile = {
  chord: -4,      // dB
  bass: -3,       // dB
  melody: -4,     // dB
  drums: -6,      // dB
};

export function getVolumeProfile(instrumentId: SmplrInstrumentId): VolumeProfile {
  return instrumentId === 'synth-fallback' ? SYNTH_VOLUME_PROFILE : SMPLR_VOLUME_PROFILE;
}
