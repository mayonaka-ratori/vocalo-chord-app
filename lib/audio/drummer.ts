import { DrumPattern } from '@/types/audio';
import { getKick, getSnare, getHihat } from './engine';

export function playDrumStep(pattern: DrumPattern, stepIndex: number, time: number) {
  const kick = getKick();
  const snare = getSnare();
  const hihat = getHihat();
  
  if (!kick || !snare || !hihat) return;

  const currentStep = pattern.steps[stepIndex % pattern.steps.length];
  
  if (currentStep.kick) {
    kick.triggerAttackRelease('C1', '16n', time);
  }
  
  if (currentStep.snare) {
    snare.triggerAttackRelease('16n', time);
  }
  
  if (currentStep.hihatClosed) {
    hihat.triggerAttackRelease('16n', time);
  } else if (currentStep.hihatOpen) {
    // A slightly longer release for open hi-hat
    hihat.triggerAttackRelease('8n', time);
  }
}
