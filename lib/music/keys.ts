import { NoteName, KeyData, DegreeName } from '@/types/music';
import { getNoteIndex, getNoteFromIndexForKey } from './chords';

// ダイアトニックスケールの半音間隔（メジャースケール）
const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];

// ダイアトニックコードのクオリティと度数名
export const DIATONIC_CHORDS = [
  { degree: 'I', quality: 'M7', func: 'Tonic' },
  { degree: 'IIm7', quality: 'm7', func: 'Subdominant' },
  { degree: 'IIIm7', quality: 'm7', func: 'Tonic' }, // 代理
  { degree: 'IVM7', quality: 'M7', func: 'Subdominant' },
  { degree: 'V7', quality: '7', func: 'Dominant' },
  { degree: 'VIm7', quality: 'm7', func: 'Tonic' }, // 平行調
  { degree: 'VIIm7b5', quality: 'm7b5', func: 'Dominant' } // 代理
];

/**
 * フルダイアトニックコード（度数表記）のリストを返す
 * @param key ルート音（'C', 'G'など）とスケール（major/minor）
 */
export function getDiatonicChords(key: KeyData): { note: NoteName, degree: string, quality: string }[] {
  const rootIndex = getNoteIndex(key.root);
  const scaleIntervals = MAJOR_SCALE_INTERVALS; // 一旦メジャーのみ想定
  
  return scaleIntervals.map((interval, i) => {
    const noteIndex = (rootIndex + interval) % 12;
    const note = getNoteFromIndexForKey(noteIndex, key.root);
    const { degree, quality } = DIATONIC_CHORDS[i];
    
    return { note, degree, quality };
  });
}

/**
 * コードが持つ機能（Tonic, Subdominant, Dominant）を判定する
 * 簡易なルールベースでの判定
 */
export function getChordFunction(degree: DegreeName): 'Tonic' | 'Subdominant' | 'Dominant' | 'Other' {
  // 文字列前方一致で判定
  if (degree.startsWith('IIm') || degree.startsWith('IV')) {
    return 'Subdominant';
  }
  if (degree.startsWith('IIIm') || degree.startsWith('VIm') || degree === 'I' || degree === 'Imaj7' || degree === 'I7') {
    return 'Tonic';
  }
  if (degree.startsWith('V') && !degree.startsWith('VIm')) {
    return 'Dominant';
  }
  
  // セカンダリードミナント等は特殊処理するか Other
  return 'Other';
}
