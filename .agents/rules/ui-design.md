---
trigger: model_decision
description: UI/UXデザインのルール。UIコンポーネントを作成・変更する際に適用
---

# UI デザインルール

## デザインシステム (Vocacore Theme v1.9)

**絶対ルール: 全コンポーネントは voca-* Tailwindトークンのみ使用する。slate-*, gray-*, zinc-*, pink-500, orange-400, emerald-*, amber-* は禁止。**

### カラートークン
- 背景: `bg-voca-bg` (#0D0D14), `bg-voca-bg-card` (#16162A), `bg-voca-bg-section` (#1E1E3A), `bg-voca-bg-elevated` (#222244)
- アクセント: `voca-accent-cyan` (#00E5FF), `voca-accent-magenta` (#E040FB), `voca-accent-purple` (#7C4DFF)
- テキスト: `text-voca-text` (#F0F0F8), `text-voca-text-sub` (#8888AA), `text-voca-text-muted` (#555570)
- ボーダー: `border-voca-border-subtle` (#2A2A4A)
- グラデーション: `gradient-hero` (cyan→purple→magenta), `gradient-card` (cyan→magenta)
- グロー: `shadow-glow-cyan`, `shadow-glow-magenta`, `shadow-glow-purple`, `shadow-glow-pink`, `shadow-glow-blue`

### アニメーション
- 表示: `animate-fadeInUp`, `animate-slideInRight`
- 強調: `animate-pulseGlow`
- インタラクティブカード: `hover:scale-[1.02]` + `transition-transform duration-200`
- ボタンホバー: `hover:scale-105` 0.2s
- border-radius: カード `rounded-xl`、ボタン `rounded-lg`、タグ `rounded-full`

### フォント
- コード名: `font-chord` (JetBrains Mono)

## レスポンシブ設計（Mobile-First）
- ブレークポイント: sm(640px), md(768px), lg(1024px)
- タップターゲットは最低 44x44px
- スマホでは:
  - コード表示は 4列×2行 のグリッド
  - プリセットは縦積みカード（横スクロールではない）
  - リズムパターンはタブ切り替え（ドラム/ベース/バッキング）
  - 再生コントロールは画面下部に固定フローティングバー
  - モーダルはフルスクリーンのボトムシート
- PCでは:
  - コード表示は横一列
  - サイドバー or 2カラムレイアウト可

## アクセシビリティ
- 色だけで情報を伝えない（色＋テキストラベル）
- フォーカス状態を視覚的に明確にする
- aria-label を適切に付与する
- キーボード操作でも一通り使えるようにする

## アニメーション
- 再生中のコードハイライト: 0.2s ease のトランジション
- ボタンホバー: transform scale(1.02-1.05)、0.2s
- モーダル: フェードイン 0.2s + スライドアップ（スマホ）
- 過度なアニメーションは避ける。パフォーマンスを優先
