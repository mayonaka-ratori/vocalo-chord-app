import { BackingPattern } from '@/types/audio';
import { getChordSynth } from './engine';
import { getChordNotes } from '@/lib/music/chords';

export function playBackingStep(pattern: BackingPattern, stepIndex: number, time: number, currentChord: string) {
  const synth = getChordSynth();
  if (!synth || !currentChord || currentChord === 'N.C.') return;

  const currentStep = pattern.steps[stepIndex % pattern.steps.length];
  
  if (currentStep.type === 'REST') return;

  // コードからの構成音計算
  const notes = getChordNotes(currentChord);
  if (notes.length === 0) return;

  // 和音用オクターブ指定 (バッキングは中音域)
  const baseOctave = 3;
  // ['C3', 'E3', 'G3'] のような配列にする
  const chordPitches = notes.map(note => `${note}${baseOctave}`);
  
  const rootPitch = `${notes[0]}${baseOctave}`;

  switch (currentStep.type) {
    case 'BLOCK':
      synth.triggerAttackRelease(chordPitches, currentStep.duration, time);
      break;
    case 'ARP_ROOT':
      synth.triggerAttackRelease(rootPitch, currentStep.duration, time);
      break;
    case 'ARP_CHORD':
      // ARPのバリエーションとして、ルート以外の和音を鳴らすなど
      // ここでは簡単に上の音2つを鳴らすとする
      const upperPitches = chordPitches.slice(1);
      if (upperPitches.length > 0) {
         synth.triggerAttackRelease(upperPitches, currentStep.duration, time);
      } else {
         synth.triggerAttackRelease(rootPitch, currentStep.duration, time);
      }
      break;
  }
}
