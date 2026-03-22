import { BassPattern } from '@/types/audio';
import { getBassSynth } from './engine';
import { getChordNotes } from '@/lib/music/chords';

export function playBassStep(pattern: BassPattern, stepIndex: number, time: number, currentChord: string) {
  const bass = getBassSynth();
  if (!bass || !currentChord || currentChord === 'N.C.') return;

  const currentStep = pattern.steps[stepIndex % pattern.steps.length];
  
  if (currentStep.type === 'REST') return;

  // コードからの構成音計算
  const notes = getChordNotes(currentChord);
  if (notes.length === 0) return;

  const rootNote = notes[0];
  const thirdNote = notes.length > 1 ? notes[1] : rootNote;
  const fifthNote = notes.length > 2 ? notes[2] : rootNote;
  
  // オクターブ指定 (ベースは低域で鳴らす)
  const baseOctave = 1;

  let pitchToPlay = `${rootNote}${baseOctave}`;
  
  switch (currentStep.type) {
    case 'ROOT':
      pitchToPlay = `${rootNote}${baseOctave}`;
      break;
    case 'THIRD':
      pitchToPlay = `${thirdNote}${baseOctave}`;
      break;
    case 'FIFTH':
      pitchToPlay = `${fifthNote}${baseOctave}`;
      break;
    case 'OCT':
      pitchToPlay = `${rootNote}${baseOctave + 1}`;
      break;
  }

  // ノート発音
  bass.triggerAttackRelease(pitchToPlay, currentStep.duration, time);
}
