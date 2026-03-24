# ボカロ作曲アシスタント (Vocalo Chord Assistant)

コード理論がわからなくても直感的にボカロ曲のアイデアを形にできるWebアプリ。コード進行・リズム・音色を選んでリアルタイムに試聴し、MIDIで書き出せる。

## Features

- 🎹 **6楽器**: Grand Piano, CP80, Wurlitzer, Acoustic Guitar, String Ensemble, Synth-fallback
- 🎸 **オートストラム**: アコースティックギター自動アルペジオ
- 🎵 **オクターブ倍音**: エレクトリックピアノ・アコースティックギターの豊かな音域
- 🔍 **48曲データベース + Gemini AI 楽曲検索**
- 🎼 **コード進行プリセット** 15種以上（丸サ進行、王道進行、カノン進行 等）
- 🥁 **ドラム / ベース / バッキングパターン選択**
- � **キー・BPM設定**（8キー対応）
- 📥 **MIDI書き出し**（コード / ベース / ドラム 3トラック分離）
- 🎵 **メロディガイド**・セクション構成テンプレート
- 📱 **スマートフォン完全対応**

## Tech Stack

- **Next.js 14+** (App Router, TypeScript strict)
- **Tailwind CSS** (Vocacore Theme — `voca-*` tokens)
- **Tone.js v15** (synth-fallback)
- **smplr** (SplendidGrandPiano + Soundfont サンプル音源)
- **Zustand** (状態管理)
- **Lucide Icons**
- **midi-writer-js** (MIDI書き出し)
- **Google Gemini API** (楽曲コード検索)

## Getting Started

```bash
git clone https://github.com/mayonaka-ratori/vocalo-chord-app.git
cd vocalo-chord-app
npm install
npm run dev
```

`.env.local` に `GEMINI_API_KEY` を設定すると楽曲検索が有効になります。

## Build & Deploy

```bash
npm run build
```

Vercel にデプロイ済み: <https://vocalo-chord-app.vercel.app/>

環境変数 `GEMINI_API_KEY` を Vercel の Environment Variables に設定すること。

## Audio Architecture

- 共有 AudioContext (`engine.ts`) — ユーザーインタラクション後に初期化
- Tone.js PolySynth を synth-fallback として常時使用可能
- smplr (SplendidGrandPiano / Soundfont) は動的インポートで遅延読み込み
- LRU キャッシュ最大3楽器 — smplr が失敗した場合は自動的に synth-fallback へ

## Design System

Vocacore Theme — ボカコレにインスパイアされたダークUI。全コンポーネントは `voca-*` Tailwind トークンを使用。

## Version

v1.9.0
