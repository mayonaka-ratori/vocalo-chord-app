/**
 * 音声エンジン（Tone.js連携）関連の型定義
 */

// ドラムパターンのステップ（16分音符単位。長さを数値で保つかbooleanで保つか。ここではシンプルに打つか打たないか）
export interface DrumPatternStep {
  kick: boolean;
  snare: boolean;
  hihatClosed: boolean;
  hihatOpen?: boolean;
}

// ドラムパターンの定義
export interface DrumPattern {
  id: string;
  name: string;        // '4つ打ち', 'エイトビート' など
  description?: string;
  steps: DrumPatternStep[]; // 長さは通常 16 (1小節) か 32 (2小節)
}

// ベースパターンのステップ
// 0: root, 4: third, 7: fifth, 'OCT': octave up root, 空文字は休符
export type BassNoteType = 'ROOT' | 'THIRD' | 'FIFTH' | 'OCT' | 'REST';

export interface BassPatternStep {
  type: BassNoteType;
  duration: '16n' | '8n' | '4n' | '2n' | '1m'; // 発音する長さ
}

export interface BassPattern {
  id: string;
  name: string;
  description?: string;
  steps: BassPatternStep[];
}

// バッキングパターンのステップ（コード進行の弾き方）
// BLOCK: 全音同時発音, ARP: 分散和音
export type BackingNoteType = 'BLOCK' | 'ARP_ROOT' | 'ARP_CHORD' | 'REST';

export interface BackingPatternStep {
  type: BackingNoteType;
  duration: '16n' | '8n' | '4n' | '2n' | '1m'; 
}

export interface BackingPattern {
  id: string;
  name: string;
  description?: string;
  steps: BackingPatternStep[];
}

export type InstrumentType = 'CHORD' | 'PAD' | 'BASS' | 'KICK' | 'SNARE' | 'HIHAT';
