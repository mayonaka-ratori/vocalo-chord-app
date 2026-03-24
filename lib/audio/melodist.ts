import { useStore } from '@/lib/store';
import { playUnifiedMelody } from './unified-player';
import { getTone } from './engine';

/**
 * メロディのステップ再生
 * playback-manager.ts の Loop コールバックから 16n 毎に呼ばれる。
 * isMelodyEnabled が false の場合は即返却する。
 *
 * melodyPhrases の構造:
 *   - 6 エントリ (patternId ごとに 1 つ)
 *   - 各 phrase.notes の beat フィールドはパターン全体の先頭からの四分音符オフセット
 *     例: コードが 4 小節なら beat 0-15 (bar0=0-3, bar1=4-7, ...)
 *   - duration はビート単位 (float): 1 = 四分音符, 0.5 = 八分音符
 *   - midi は MIDI ノート番号 (integer)
 *
 * ステップ変換: 1 beat = 4 sixteenth-note steps
 *   note.beat * 4 = phrase 内での 16n ステップ位置
 */
export async function playMelodyStep(
  stepIndex: number,
  time: number,
): Promise<void> {
  const store = useStore.getState();

  if (!store.isMelodyEnabled) return;

  const { melodyPhrases, activeMelodyPatternId } = store;
  if (!melodyPhrases || melodyPhrases.length === 0) return;

  // アクティブなパターンを選択。未選択なら先頭を使う
  const phrase = activeMelodyPatternId
    ? melodyPhrases.find(p => p.patternId === activeMelodyPatternId)
    : melodyPhrases[0];

  if (!phrase || !phrase.notes || phrase.notes.length === 0) return;

  // フレーズ全体の 16n ステップ数 (totalBeats * 4)
  const phraseLengthSteps = phrase.totalBeats * 4;
  // フレーズをループさせるためのステップ位置
  const stepInPhrase = stepIndex % phraseLengthSteps;

  const Tone = await getTone();
  if (!Tone) return;

  const secPer16n = Tone.Time('16n').toSeconds();

  for (const note of phrase.notes) {
    // note.beat (四分音符) → 16n ステップに変換
    const noteStep = Math.round(note.beat * 4);

    if (noteStep === stepInPhrase) {
      const durationSeconds = note.duration * (secPer16n * 4); // beat → seconds
      playUnifiedMelody(note.midi, {
        duration: durationSeconds,
        time,
        velocity: note.velocity ?? 80,
      });
    }
  }
}
