---
trigger: always_on
description: TypeScript/React のコードスタイルガイド
---

# コードスタイルルール

## TypeScript
- `type` より `interface` を優先する（拡張性のため）。ただし union type は `type` を使う
- enum は使わず、`as const` オブジェクト + typeof パターンを使う
- optional chaining (`?.`) と nullish coalescing (`??`) を活用する
- 配列操作は `for` ループより `map`, `filter`, `reduce` を優先する

## React コンポーネント
- Props の型は同一ファイル内でコンポーネントの直上に定義する
- 状態の初期化は関数を使う: `useState(() => computeInitial())`
- useEffect の依存配列は ESLint ルールに厳密に従う
- イベントハンドラは `handle` プレフィックス: `handleClick`, `handleChordSelect`
- コンポーネントのexportは名前付きexportのみ（default export はpage.tsxのみ）

## インポート順序
1. React / Next.js
2. 外部ライブラリ（tone, zustand, midi-writer-js）
3. 内部 lib/
4. 内部 components/
5. 内部 data/
6. 内部 types/
7. スタイル
各グループ間は空行で区切る
