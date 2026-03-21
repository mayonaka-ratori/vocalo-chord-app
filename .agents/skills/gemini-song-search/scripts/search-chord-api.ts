/**
 * Gemini API を使った楽曲コード進行検索のユーティリティ
 * 
 * このスクリプトは app/api/search-chords/route.ts から呼び出される。
 * 直接実行するものではなく、参照実装として skill に同梱している。
 * 
 * 使い方:
 *   import { searchChords } from './search-chord-api';
 *   const result = await searchChords("夜に駆ける");
 */

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

export const GEMINI_PROMPT_TEMPLATE = `
あなたは日本のポップス・ボカロ楽曲に詳しい音楽理論の専門家です。
以下の楽曲のコード進行を分析してください。

楽曲名: {{SONG_TITLE}}

以下の厳密なJSON形式のみで回答してください。余計な説明は不要です。
コード名は英語表記（C, Dm, Em7, Fmaj7 等）を使ってください。

{
  "title": "正式な曲名",
  "artist": "アーティスト名",
  "key": "メインキー（例: C, Am, G, F#m）",
  "bpm": BPMの数値,
  "sections": [
    {
      "label": "イントロ or Aメロ or Bメロ or サビ or Cメロ or アウトロ",
      "chords": ["コード1", "コード2", "コード3", "コード4"]
    }
  ],
  "confidence": "high（確信あり）or medium（おそらく正しい）or low（推測）"
}

注意:
- 各セクションのコードは4〜8個で表記する（1コード = 1小節）
- 分からないセクションは省略してよい
- confidence は楽曲の知名度と分析の確信度で判断する
`;
