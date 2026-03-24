---
name: setup-project
description: Next.js プロジェクトの初期セットアップを行う
---

# プロジェクト初期セットアップ

## ステップ

1. **Next.js プロジェクト作成**
   - `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"` を実行
   - 既にファイルがある場合は上書き確認する

2. **追加パッケージインストール**
   ```bash
   npm install tone zustand midi-writer-js smplr
   npm install -D @types/node
   ```
   - `smplr` はビルド時ではなくランタイム時に lazy-load される。追加設定不要

3. **ディレクトリ構造作成**
   ```
   mkdir -p components lib/audio lib/music lib/midi data types
   ```

4. **Tailwind 設定 (Vocacore Theme)**
   - `tailwind.config.ts` に `voca-*` トークンを定義する（`.agents/rules/ui-design.md` のカラートークン一覧を参照）
   - `globals.css` に CSS カスタムプロパティを定義
   - **`slate-*` `gray-*` 等のデフォルトトークンは使わない。voca-* のみ**

5. **Zustand ストア初期化**
   - `lib/store.ts` にアプリ状態の初期定義を作成

6. **基本型定義**
   - `types/music.ts` にコード・プリセット・パターンの型を定義
   - `types/audio.ts` に音声エンジンの型を定義

7. **検証**
   - `npm run dev` が正常に動作することを確認
   - ブラウザでトップページが表示されることを確認
