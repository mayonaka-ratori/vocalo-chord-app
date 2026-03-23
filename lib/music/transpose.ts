import { parseChord, getNoteIndex, getNoteFromIndex, degreeToChordInC } from './chords';
import { NoteName } from '@/types/music';

/**
 * コードを指定した半音数、またはキー間（'C' -> 'G' など）で移調（トランスポーズ）する
 * 文字列の切り貼り（'C' -> 'Db'）ではなく、インデックスベースで正確に計算する
 * 
 * @param chordName コアのコード文字列（例：'Cmaj7', 'F#m7b5'）
 * @param semitonesOrFromKey 移調する半音の数、または元のキー ('C'など)
 * @param toKey 移調先のキー（semitonesOrFromKey が文字列の場合に必須）
 * @returns 移調後のコード名
 */
export function transposeChord(chordName: string, semitones: number): string;
export function transposeChord(chordName: string, fromKey: string, toKey: string): string;
export function transposeChord(
  chordName: string, 
  semitonesOrFromKey: number | string, 
  toKey?: string
): string {
  if (chordName === 'N.C.' || chordName === '') return chordName;

  let semitones: number;

  if (typeof semitonesOrFromKey === 'number') {
    semitones = semitonesOrFromKey;
  } else {
    // キー指定による計算 ('C' -> 'G' 等)
    const fromIndex = getNoteIndex(semitonesOrFromKey as NoteName);
    const toIndex = getNoteIndex(toKey as NoteName);
    semitones = toIndex - fromIndex;
  }
  
  // コード名から構成要素をパース
  const { root, quality, bass } = parseChord(chordName);
  
  // ルート音をインデックス化して半音移動
  const rootIndex = getNoteIndex(root);
  const transposedRoot = getNoteFromIndex(rootIndex + semitones);
  
  // ベース音の移調（オンコードの場合）
  if (bass) {
    const bassIndex = getNoteIndex(bass);
    const transposedBass = getNoteFromIndex(bassIndex + semitones);
    return `${transposedRoot}${quality}/${transposedBass}`;
  }
  
  return `${transposedRoot}${quality}`;
}

/**
 * コード進行（配列）をまとめて移調するヘルパー
 */
export function transposeProgression(chords: string[], semitones: number): string[] {
  return chords.map(chord => transposeChord(chord, semitones));
}

/**
 * 度数表記を指定したキーのコード名に変換する
 * @param degree 'I', 'IVm' などの度数文字列
 * @param key 'C', 'G' などのキー
 * @returns 変換後のコード名
 */
export function degreeToChord(degree: string, key: string): string {
  const chordInC = degreeToChordInC(degree);
  if (chordInC === degree) return degree; // 度数表記ではなかった場合
  
  return transposeChord(chordInC, 'C', key);
}
