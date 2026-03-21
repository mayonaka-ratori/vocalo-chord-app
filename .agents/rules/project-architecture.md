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

## Tone.js 関連
- AudioContext は必ずユーザーインタラクション後に初期化する
- 全ての Tone.js オブジェクトは `lib/audio/engine.ts` で管理し、適切に dispose する
- サーバーサイドレンダリング時に Tone.js がインポートされないよう dynamic import を使う

## パフォーマンス
- コンポーネントの不要な再レンダリングを防ぐため React.memo と useMemo を適切に使う
- 大きなデータファイル（楽曲データベース等）は dynamic import で遅延読み込みする
- 画像は next/image を使い、WebP/AVIF で最適化する
