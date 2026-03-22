import { parseChord, getNoteIndex, getNoteFromIndex } from './chords';

/**
 * コードを指定した半音数分だけ移調（トランスポーズ）する
 * 文字列の切り貼り（'C' -> 'Db'）ではなく、インデックスベースで正確に計算する
 * 
 * @param chordName コアのコード文字列（例：'Cmaj7', 'F#m7b5'）
 * @param semitones 移調する半音の数（正負の整数、例 +2 = 1音上げる、-1 = 半音下げる）
 * @returns 移調後のコード名
 */
export function transposeChord(chordName: string, semitones: number): string {
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
