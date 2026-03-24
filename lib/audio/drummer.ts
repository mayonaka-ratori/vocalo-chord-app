import { DrumPattern } from '@/types/audio';
import { getKick, getSnare, getHihat, getTone } from './engine';
import { SYNTH_VOLUME_PROFILE } from './volume-config';

export async function playDrumStep(pattern: DrumPattern, stepIndex: number, time: number) {
  const kick = getKick();
  const snare = getSnare();
  const hihat = getHihat();
  
  if (!kick || !snare || !hihat) return;

  const currentStep = pattern.steps[stepIndex % pattern.steps.length];
  const Tone = await getTone();
  const gain = Tone.dbToGain(SYNTH_VOLUME_PROFILE.drums);
  
  if (currentStep.kick) {
    kick.triggerAttackRelease('C1', '16n', time, gain);
  }
  
  if (currentStep.snare) {
    snare.triggerAttackRelease('16n', time, gain);
  }
  
  if (currentStep.hihatClosed) {
    hihat.triggerAttackRelease('16n', time, gain);
  } else if (currentStep.hihatOpen) {
    // A slightly longer release for open hi-hat
    hihat.triggerAttackRelease('8n', time, gain);
  }
}
