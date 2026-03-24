# ボカロ作曲アシスタント - プロジェクトルール

## プロジェクト概要
ボカロ（VOCALOID）楽曲制作者のための、コード進行＋バッキング作曲補助Webアプリ。
コード理論を知らない人でも直感的にコード進行を組み立て、リズムパターンを付けて試聴し、
MIDIとして書き出せる。有名曲のコード進行をプリセットや検索で取り込める。

詳細なペルソナとターゲットユーザーは @PERSONA.md を参照すること。

## 技術スタック（厳守）
- **フレームワーク**: Next.js 14+ (App Router, TypeScript)
- **スタイリング**: Tailwind CSS 3+ — **Vocacore Theme** (`voca-*`トークンのみ使用、slate-*/gray-*/zinc-*は禁止)
- **音声エンジン**: Tone.js 15+ 並びに smplr (SplendidGrandPiano + Soundfont, lazy-loaded)
- **MIDI書き出し**: midi-writer-js
- **状態管理**: Zustand
- **AI楽曲検索**: Gemini 2.5 Flash（Google AI Studio API、無料枠）
- **デプロイ**: Vercel
- **パッケージマネージャ**: npm

## コーディング規約

### TypeScript
- strict mode を常に有効にする
- `any` 型の使用を禁止する。型が不明な場合は `unknown` を使い、型ガードで絞り込む
- インターフェースは `I` プレフィックスを付けない（例: `ChordProgression`、`×IChordProgression`）
- 型定義は `types/` ディレクトリにまとめる

### React / Next.js
- コンポーネントは全て関数コンポーネント + React.FC は使わない（props を直接型付け）
- "use client" ディレクティブは必要なコンポーネントにのみ付ける
- サーバーコンポーネントをデフォルトとし、Tone.js 等ブラウザAPIを使う部分のみクライアントコンポーネントにする
- ファイル名は kebab-case（例: `chord-timeline.tsx`）
- コンポーネント名は PascalCase（例: `ChordTimeline`）

### スタイリング
- Tailwind CSS のユーティリティクラスを使う。カスタム CSS は最小限に留める
- **Vocacore トークンのみ使用**（`voca-*`）。`slate-*` `gray-*` `zinc-*` `pink-500` `orange-400` 等は禁止
- レスポンシブ対応は mobile-first で書く（sm: md: lg: のブレークポイントを使用）

### ファイル構成
- `app/` - Next.js App Router のページとAPIルート
- `components/` - UIコンポーネント（1ファイル1コンポーネント）
- `lib/audio/` - Tone.js 関連の音声処理ロジック
- `lib/music/` - 音楽理論関連（コード定義、移調、メロディ生成等）
- `lib/midi/` - MIDI書き出し
- `lib/store.ts` - Zustand ストア
- `data/` - プリセット、楽曲データ、パターン定義（純粋なデータのみ）
- `types/` - TypeScript 型定義

### コミット
- Conventional Commits 形式を使う
- 日本語でコミットメッセージのdescriptionを書く（例: `feat(preset): 丸サ進行プリセットを追加`）

## 絶対にやってはいけないこと
- テスト無しでAPIルートを作成すること
- Tone.js の AudioContext をサーバーサイドで初期化しようとすること
- 音楽データ（コード名、度数表記等）をハードコードすること。必ず `data/` のデータファイルを参照する
- `console.log` をプロダクションコードに残すこと
- 楽曲の歌詞データを含めること（著作権上の問題）
- Gemini API キーをクライアントサイドのコードに含めること
