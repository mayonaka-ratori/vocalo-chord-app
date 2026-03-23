import { BassPattern } from '@/types/audio';
import { getChordNotes } from '@/lib/music/chords';
import { playUnifiedBass } from './unified-player';
import { getTone } from './engine';

export async function playBassStep(pattern: BassPattern, stepIndex: number, time: number, currentChord: string) {
  if (!currentChord || currentChord === 'N.C.') return;

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

  // Tone.js の音符の長さを秒数に変換 (smplr 用)
  const Tone = await getTone();
  const durationSeconds = Tone.Time(currentStep.duration).toSeconds();

  // ノート発音
  playUnifiedBass(pitchToPlay, durationSeconds, time, 80);
}
