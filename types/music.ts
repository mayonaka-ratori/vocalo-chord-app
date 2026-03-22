/**
 * 音楽理論・ドメインデータに関する型定義
 */
import { InstrumentPresetId } from '@/types/audio';

// 雰囲気タグ
export type MoodTag = 
  | 'エモい' 
  | '明るい' 
  | '切ない' 
  | 'オシャレ' 
  | '疾走感' 
  | '中毒性' 
  | 'ダーク' 
  | 'ボカロP'
  | '意外性';

/**
 * リハーモナイズ技法の種別
 */
export type VariationTechnique =
  | 'minor-iv'             // IV → IVm (サブドミナントマイナー)
  | 'secondary-dominant'   // IIIm → III7 など (セカンダリドミナント)
  | 'add-seventh'          // トライアド → セブンスコード
  | 'tritone-sub'          // V7 → bII7 (トリトーン代理)
  | 'diminished-pass'      // 全音差にdimを挟む
  | 'sus4-resolve'         // V → Vsus4
  | 'pedal-point'          // ペダルポイントを追加
  | 'modal-interchange'    // 同主調からの借用
  | 'two-five'             // II-V挿入
  | 'chromatic-approach'   // 半音アプローチコード
  | 'relative-major-minor'; // 平行調の切り替え

/**
 * コード進行バリエーション提案
 * ユーザーに「もっとエモく」「もっとオシャレに」といった変化を提示するための型
 */
export interface ChordVariation {
  id: string;
  name: string;              // 日本語ラベル (例: "エモさUP")
  icon: string;              // 絵文字アイコン
  description: string;       // 初心者向け日本語解説
  originalChords: string[];  // 変更前のコード配列
  modifiedChords: string[];  // 変更後のコード配列
  changedIndices: number[];  // 変更された小節インデックスの配列
  technique: VariationTechnique; // 使用したリハーモナイズ技法
  moodShift: string;         // 雰囲気の変化方向: "エモい", "オシャレ", "切ない", "ダーク", "明るい", "意外性"
  impactScore: number;       // インパクト度スコア (ソート用、1-10)
}

// コード表記におけるルート音
export type NoteName = 
  | 'C' | 'C#'| 'Db' | 'D' | 'D#' | 'Eb' | 'E' | 'F' | 'F#' | 'Gb' | 'G' | 'G#' | 'Ab' | 'A' | 'A#' | 'Bb' | 'B';

// ルートとクオリティを分離したコード情報
export interface ChordInfo {
  root: NoteName;
  quality: string;        // 'm', 'm7', 'maj7', '7', '', 'dim', etc...
  bass?: NoteName;        // オンコードの場合のベース音
  degree?: DegreeNotation; // 紐づく度数表記（文脈による）
}

// 度数表記
export type DegreeName = 
  | 'I' | 'IIm' | 'IIIm' | 'IV' | 'V' | 'VIm' | 'VIIdim'
  | 'IVmaj7' | 'III7' | 'VIm7' | 'IIm7' | 'V7' | 'I7'
  | 'IVm' | 'V7/II' | 'V7/VI' | string; // セカンダリードミナントなど拡張もあるので

export interface DegreeNotation {
  degree: DegreeName;
  duration: number; // 小節数（通常は 1）
}

// 楽曲セクションごとのコード定義 (Legacy)
export interface SongSection {
  label: string; // 'Aメロ', 'サビ' etc.
  chords: string[]; // ['Fmaj7', 'E7', 'Am7', 'C7']
}

export type SectionType =
  | 'intro'
  | 'verse1'      // Aメロ
  | 'verse1-v2'   // Aメロ パターン2
  | 'verse2'      // Bメロ
  | 'verse2-v2'   // Bメロ パターン2
  | 'chorus'      // サビ
  | 'chorus-v2'   // サビ パターン2
  | 'verse3'      // Cメロ
  | 'verse4'      // Dメロ
  | 'bridge'      // 間奏
  | 'outro';      // 後奏

export interface SectionTypeInfo {
  type: SectionType;
  name: string;          // Japanese display name
  shortName: string;     // 2-3 char abbreviation for mobile
  icon: string;          // Emoji
  defaultBars: number;   // Default bar count (4 or 8)
  description: string;   // One-line Japanese description
}

export interface Section {
  id: string;                    // Unique ID (nanoid or crypto.randomUUID)
  type: SectionType;
  label: string;                 // User-visible label, e.g. "Aメロ", "Aメロ パターン2"
  chords: string[];              // Chord names array (length = bar count)
  bars: number;                  // 4 or 8
  drumPatternId: string;
  bassPatternId: string;
  backingPatternId: string;
  instrumentPresetId: InstrumentPresetId;
  repeat: number;                // How many times to play (default 1)
}

export interface SongStructure {
  sections: Section[];
  totalBars: number;             // Computed: sum of all sections' bars * repeat
}

export interface StructureTemplate {
  id: string;
  name: string;                  // Japanese name
  description: string;           // Japanese description
  icon: string;
  sectionSequence: {
    type: SectionType;
    bars: number;
  }[];
}

// コード進行プリセットの型
export interface ChordPreset {
  id: string;               // kebab-case 一意識別子
  name: string;             // 日本語表示名
  nameEn: string;           // 英語表示名（検索用）
  description: string;      // 50文字以内の説明
  degrees: string[];        // 度数表記の配列（8小節 or 4小節）
  tags: MoodTag[];          // 雰囲気タグ
  famousSongs: string[];    // 使用有名曲（曲名のみ、歌詞は含めない）
  category: 'standard' | 'famous-song' | 'genre';
}

// 曲のキー情報
export interface KeyData {
  root: NoteName;
  scale: 'major' | 'minor';
}

// 曲データ (data/famous-songs.ts)
export interface FamousSong {
  id: string;
  title: string;
  artist: string;
  year: number;
  key: string;
  bpm: number;
  sections: SongSection[];
  tags: MoodTag[];
  /** 検索用別名（ひらがな・ローマ字・英語タイトルなど） */
  searchAliases?: string[];
  category?: 'citypop' | 'vocaloid' | 'vocaloP-artist' | 'recent-hit';
  source?: string;
}

// Gemini API の検索結果
export interface SongSearchResult {
  title: string;
  artist: string;
  key: string;
  bpm: number;
  sections: {
    label: string;
    chords: string[];
  }[];
  confidence: 'high' | 'medium' | 'low';
  source: 'local' | 'ai';
}

export interface SearchChordsResponse {
  results: SongSearchResult[];
  source: 'local' | 'ai';
  error?: string;
}
