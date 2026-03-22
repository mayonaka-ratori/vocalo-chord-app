# ボカロ作曲アシスタント 🎵

コード理論がわからなくても、直感的にボカロ曲のアイデアを形にできるWebアプリ。

## Features
- 🎹 有名コード進行プリセット（丸サ進行、王道進行、カノン進行など15種以上）
- 🔍 楽曲検索（ローカルDB + Gemini AI フォールバック）
- 🥁 リズムパターン選択（ドラム・ベース・バッキング）
- 🎵 リアルタイム再生（Tone.js）
- 📥 MIDI書き出し（3トラック分離）
- 📱 スマートフォン完全対応

## Getting Started

```bash
npm install
cp .env.local.example .env.local
# Edit .env.local and add your Gemini API key
npm run dev
```

## Tech Stack
- Next.js (App Router)
- Tailwind CSS
- Tone.js
- Zustand
- midi-writer-js
- Google Gemini API

## Deploy
Push to GitHub and connect to Vercel. Add `GEMINI_API_KEY` in Vercel Environment Variables.
