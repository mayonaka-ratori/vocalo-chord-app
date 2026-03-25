# ボカロ作曲アシスタント (Vocalo Chord Assistant)

コード理論がわからなくても直感的にボカロ曲のアイデアを形にできるWebアプリ。コード進行・リズム・音色を選んでリアルタイムに試聴し、MIDIで書き出せる。

## Features

- 🎹 **6楽器**: Grand Piano, CP80, Wurlitzer, Acoustic Guitar, String Ensemble, Synth-fallback
- 🎸 **オートストラム**: アコースティックギター自動アルペジオ
- 🎵 **オクターブ倍音**: エレクトリックピアノ・アコースティックギターの豊かな音域
- 🔍 **41曲データベース + Gemini AI 楽曲検索**
- 🎼 **コード進行プリセット** 21種（丸サ進行、王道進行、カノン進行 等）
- 🥁 **ドラム / ベース / バッキングパターン選択**
- 🎛️ **キー・BPM設定**（8キー対応、BPM 60〜220）
- 📥 **MIDI書き出し**（コード / ベース / ドラム 3トラック分離）
- 🎵 **メロディガイド**・セクション構成テンプレート
- 📱 **スマートフォン完全対応**

## Tech Stack

- **Next.js 16** (App Router, TypeScript strict)
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

v1.10.11

---

# Vocalo Chord Assistant (English)

A web app that lets you create VOCALOID song ideas intuitively, even without music theory knowledge. Select chord progressions, rhythms, and instruments to audition in real-time, then export as MIDI.

## Features

- 🎹 **6 Instruments**: Grand Piano, CP80, Wurlitzer, Acoustic Guitar, String Ensemble, Synth-fallback
- 🎸 **Auto-Strum**: Acoustic guitar automatic arpeggios
- 🎵 **Octave Harmonics**: Rich range for electric piano and acoustic guitar
- 🔍 **41 Song Database + Gemini AI Song Search**
- 🎼 **21 Chord Progression Presets** (Marunouchi, Standard, Canon, etc.)
- 🥁 **Drum / Bass / Backing Pattern Selection**
- 🎛️ **Key & BPM Settings** (8 keys, BPM 60-220)
- 📥 **MIDI Export** (3 separate tracks: chords, bass, drums)
- 🎵 **Melody Guide** & Section Structure Templates
- 📱 **Full Mobile Support**

## Tech Stack

- **Next.js 16** (App Router, TypeScript strict)
- **Tailwind CSS** (Vocacore Theme — `voca-*` tokens)
- **Tone.js v15** (synth-fallback)
- **smplr** (SplendidGrandPiano + Soundfont samples)
- **Zustand** (state management)
- **Lucide Icons**
- **midi-writer-js** (MIDI export)
- **Google Gemini API** (song chord search)

## Getting Started

```bash
git clone https://github.com/mayonaka-ratori/vocalo-chord-app.git
cd vocalo-chord-app
npm install
npm run dev
```

Set `GEMINI_API_KEY` in `.env.local` to enable song search.

## Build & Deploy

```bash
npm run build
```

Deployed on Vercel: <https://vocalo-chord-app.vercel.app/>

Set `GEMINI_API_KEY` in Vercel's Environment Variables.

## Audio Architecture

- Shared AudioContext (`engine.ts`) — initialized after user interaction
- Tone.js PolySynth always available as synth-fallback
- smplr (SplendidGrandPiano / Soundfont) lazy-loaded via dynamic import
- LRU cache for max 3 instruments — auto-fallback to synth-fallback on failure

## Design System

Vocacore Theme — dark UI inspired by Vocalo Chord. All components use `voca-*` Tailwind tokens.

## Version

v1.10.11
