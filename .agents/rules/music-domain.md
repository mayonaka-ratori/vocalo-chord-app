---
trigger: model_decision
description: 音楽理論とドメイン知識のルール。コード進行やプリセット関連のコードを書く際に適用
---

# 音楽ドメインルール

## コード表記
- コード名は英語表記を使う: C, Dm, Em7, Fmaj7, G7, Am, Bdim
- フラット記号は `b` で表す: Bb, Eb, Ab
- シャープ記号は `#` で表す: F#, C#, G#
- 度数表記（ディグリーネーム）はローマ数字: I, IIm, IIIm, IV, V, VIm, VIIdim

## 日本語表示
ユーザー向けUIの日本語ラベルは以下を標準とする:
- トニック → 「安定」
- サブドミナント → 「展開」
- ドミナント → 「緊張」
- ダイアトニックコード → 「基本コード」
- ノンダイアトニックコード → 「スパイスコード」
- セカンダリードミナント → 「借用コード」
- テンションコード → 表記そのまま（Cmaj7等）
- 転調 → 「キーチェンジ」

## コード進行プリセット
プリセットデータは以下の形式に統一する:
```typescript
interface ChordPreset {
  id: string;              // kebab-case 一意識別子
  name: string;            // 日本語表示名
  nameEn: string;          // 英語表示名（検索用）
  description: string;     // 50文字以内の説明
  degrees: string[];       // 度数表記の配列（8小節 or 4小節）
  tags: MoodTag[];         // 雰囲気タグ
  famousSongs: string[];   // 使用有名曲（曲名のみ、歌詞は含めない）
  category: 'standard' | 'famous-song' | 'genre';
}
```

## 有名曲データ
- 曲名とアーティスト名のみ記載する。歌詞は絶対に含めない
- コード進行は独自に分析可能な情報であり著作権の対象外
- 出典がある場合は source フィールドに記載する
