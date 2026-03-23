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
  chord: 70,      // chords slightly quieter to leave space
  bass: 85,       // bass prominent but not overwhelming
  melody: 95,     // melody sits on top
  drums: 60,      // drums are a guide, not dominant
};

/**
 * Calibrated for synth fallback (narrower dynamic range)
 */
export const SYNTH_VOLUME_PROFILE: VolumeProfile = {
  chord: -8,      // dB
  bass: -6,       // dB
  melody: -4,     // dB
  drums: -12,     // dB
};

export function getVolumeProfile(instrumentId: SmplrInstrumentId): VolumeProfile {
  return instrumentId === 'synth-fallback' ? SYNTH_VOLUME_PROFILE : SMPLR_VOLUME_PROFILE;
}
