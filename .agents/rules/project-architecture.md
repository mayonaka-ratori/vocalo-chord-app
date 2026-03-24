---
trigger: always_on
description: プロジェクトのアーキテクチャルール
---

# アーキテクチャルール

## データフロー
- 全てのアプリケーション状態は Zustand ストア (`lib/store.ts`) で一元管理する
- コンポーネントは必要な状態のみを selector で購読する
- 音声再生ロジックは `lib/audio/` に隔離し、コンポーネントから直接 Tone.js を操作しない
- 音楽理論ロジック（移調、コード構成音計算等）は `lib/music/` に隔離する
- データ定義（プリセット、パターン等）は `data/` に置き、ロジックを含めない

## API ルート
- Gemini API 呼び出しは `app/api/` のサーバーサイドAPIルートでのみ行う
- APIルートには必ずレートリミットを設ける
- APIレスポンスの型を `types/` に定義する
- エラーハンドリングは try-catch で行い、ユーザーに適切なエラーメッセージを返す

## 音声エンジン (Tone.js + smplr)
- AudioContext は必ずユーザーインタラクション後に初期化する (`engine.ts` で一元管理)
- Tone.js PolySynth は synth-fallback として常時動作する。smplr に依存しない
- smplr (SplendidGrandPiano / Soundfont) は必ず dynamic import で遅延読み込みする
- 楽器は LRU キャッシュで最大3つが上限。超過時は最古をアンロードする
- smplr が失敗した場合は必ず synth-fallback にフォールバックし、音声パイプラインを絶対に山止しない
- 6楽器: Grand Piano (SplendidGrandPiano), CP80 / Wurlitzer / Acoustic Guitar / Strings (Soundfont), Synth-fallback (Tone.js)
- SSR時に Tone.js ・ smplr がインポートされないよう dynamic import を必ず使う

## パフォーマンス
- コンポーネントの不要な再レンダリングを防ぐため React.memo と useMemo を適切に使う
- 大きなデータファイル（楽曲データベース等）は dynamic import で遅延読み込みする
- 画像は next/image を使い、WebP/AVIF で最適化する
