import { BackingPattern } from '@/types/audio';
import { getChordNotes } from '@/lib/music/chords';
import { playUnifiedChord } from './unified-player';
import { getTone, getChordSynth } from './engine';

export async function playBackingStep(pattern: BackingPattern, stepIndex: number, time: number, currentChord: string) {
  if (!currentChord || currentChord === 'N.C.') return;

  const currentStep = pattern.steps[stepIndex % pattern.steps.length];
  if (currentStep.type === 'REST') return;

  // ストライドガード: このステップが何tick分かを計算し、最初のtickのみ発音する
  const Tone = await getTone();
  const stride16n = Math.round(
    Tone.Time(currentStep.duration).toSeconds() / Tone.Time('16n').toSeconds()
  );
  if (stepIndex % stride16n !== 0) return;

  // コードからの構成音計算
  const notes = getChordNotes(currentChord);
  if (notes.length === 0) return;

  // 和音用オクターブ指定 (バッキングは中音域)
  const baseOctave = 3;
  // ['C3', 'E3', 'G3'] のような配列にする
  const chordPitches = notes.map(note => `${note}${baseOctave}`);
  const rootPitch = `${notes[0]}${baseOctave}`;

  // Tone.js の音符の長さを秒数に変換 (smplr 用)
  const durationSeconds = Tone.Time(currentStep.duration).toSeconds();

  // 発音中の残留ボイスを解放してポリフォニー枯渇を防止
  try {
    const chordSynth = getChordSynth();
    if (chordSynth && typeof (chordSynth as { releaseAll?: () => void }).releaseAll === 'function') {
      (chordSynth as { releaseAll: () => void }).releaseAll();
    }
  } catch {}

  const triggerChord = (pitches: string[]) => {
    playUnifiedChord({
      notes: pitches,
      duration: durationSeconds,
      time: time,
      velocity: 90 // playUnifiedChord will scale this
    });
  };

  switch (currentStep.type) {
    case 'BLOCK':
      triggerChord(chordPitches);
      break;
    case 'ARP_ROOT':
      triggerChord([rootPitch]);
      break;
    case 'ARP_CHORD':
      const upperPitches = chordPitches.slice(1);
      triggerChord(upperPitches.length > 0 ? upperPitches : [rootPitch]);
      break;
  }
}
