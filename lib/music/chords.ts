import { ChordInfo, NoteName } from '@/types/music';

// 全12半音（シャープ表記）
export const NOTES_SHARP: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
// フラット表記（必要に応じて）
export const NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

/**
 * コード名からルートとクオリティをパースする
 * 例: 'Cmaj7' -> { root: 'C', quality: 'maj7' }
 * 例: 'F#m7b5' -> { root: 'F#', quality: 'm7b5' }
 */
export function parseChord(chordName: string): ChordInfo {
  // 簡易的なパース：最初の1文字〜2文字がルート、残りがクオリティ
  // (ベース音指定 'Am/G' などの対応も考慮)
  const slashIndex = chordName.indexOf('/');
  let mainChord = chordName;
  let bass: NoteName | undefined = undefined;

  if (slashIndex !== -1) {
    mainChord = chordName.substring(0, slashIndex);
    bass = chordName.substring(slashIndex + 1) as NoteName; // 厳密にはバリデーションが必要
  }

  // ルート音の抽出 (A-G から始まり、# か b が続く場合はそれも含める)
  const match = mainChord.match(/^([A-G][#b]?)(.*)$/);
  
  if (!match) {
    // パース失敗時のデフォルト
    return { root: 'C', quality: '' };
  }

  const [, rootStr, qualityStr] = match;

  return {
    root: rootStr as NoteName,
    quality: qualityStr,
    bass
  };
}

/**
 * ノート名を半音インデックス（0-11）に変換する
 */
export function getNoteIndex(note: NoteName): number {
  let index = NOTES_SHARP.indexOf(note);
  if (index === -1) {
    // シャープ系で見つからなければフラット配列で探す
    index = NOTES_FLAT.indexOf(note);
  }
  return index !== -1 ? index : 0;
}

/**
 * 半音インデックスをノート名（シャープ優先）に変換する
 */
export function getNoteFromIndex(index: number): NoteName {
  const normalizedIndex = ((index % 12) + 12) % 12; // 負の数にも対応
  return NOTES_SHARP[normalizedIndex];
}

/**
 * クオリティから構成音のインターバル（半音数）の配列を返す
 * 例: 'm' -> [0, 3, 7] (ルート、マイナー3度、完全5度)
 */
export function getIntervals(quality: string): number[] {
  // 主要なコードの構成音定義
  switch (quality) {
    case '': 
    case 'M': 
      return [0, 4, 7]; // メジャー
    case 'm': 
      return [0, 3, 7]; // マイナー
    case '7': 
      return [0, 4, 7, 10]; // セブンス
    case 'm7': 
      return [0, 3, 7, 10]; // マイナーセブンス
    case 'maj7': 
    case 'M7':
      return [0, 4, 7, 11]; // メジャーセブンス
    case 'dim': 
      return [0, 3, 6]; // ディミニッシュ
    case 'm7b5': 
      return [0, 3, 6, 10]; // マイナーセブンスフラットファイブ (ハーフディミニッシュ)
    case 'aug': 
      return [0, 4, 8]; // オーギュメント
    case 'sus4': 
      return [0, 5, 7]; // サスフォー
    case 'add9': 
      return [0, 4, 7, 14]; // アドナインス
    default:
      // 未知のクオリティはメジャーとして一旦扱う（フォールバック）
      return [0, 4, 7];
  }
}

/**
 * コード名から構成音（のノート名）の配列を計算する
 * @param chordName 'C', 'Am7', 'F#m7b5' などのコード名
 * @returns 構成音の配列 (例：'Cmaj7' -> ['C', 'E', 'G', 'B'])
 */
export function getChordNotes(chordName: string): NoteName[] {
  const { root, quality } = parseChord(chordName);
  const rootIndex = getNoteIndex(root);
  const intervals = getIntervals(quality);
  
  const notes = intervals.map(interval => getNoteFromIndex(rootIndex + interval));
  
  // オンコードの場合、ベース音を先頭に追加/置換するかは要件による
  // ここではシンプルにベース音と構成音を分離して使いたいケースが多いので
  // 文字列としての構成音だけを返す
  
  return notes;
}
