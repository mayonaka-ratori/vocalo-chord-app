---
name: responsive-mobile
description: スマホレスポンシブ対応のUIパターンを提供する。モバイルUIの実装、タッチ操作の最適化、フローティング再生バーの実装時に使用する。レスポンシブデザイン、モバイル対応に関する作業で活用する。
---

# モバイルレスポンシブスキル

## 目的
スマホ（主にiPhone / Android）での操作体験を最適化するためのUIパターンとTailwind実装例を提供する。

## コアパターン

### 1. フローティング再生バー（最重要）
SpotifyやYouTube Musicと同様、画面下部に固定する再生コントロール。

```tsx
// components/floating-player.tsx
export function FloatingPlayer() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50
                    bg-voca-bg/95 backdrop-blur-lg border-t border-voca-border-subtle
                    px-4 py-3 flex items-center justify-between
                    safe-area-inset-bottom">
      {/* 現在のプリセット名 */}
      <div className="text-sm truncate flex-1 mr-3">
        <span className="text-voca-text-sub">王道進行</span>
        <span className="text-voca-text-muted ml-2">BPM 120</span>
      </div>

      {/* コントロール */}
      <div className="flex items-center gap-3">
        <button className="w-10 h-10 rounded-full bg-voca-accent-cyan
                          flex items-center justify-center text-voca-bg">
          ▶
        </button>
        <button className="w-10 h-10 rounded-full border border-voca-border-subtle
                          flex items-center justify-center text-voca-text">
          ⏹
        </button>
      </div>
    </div>
  );
}
```

### 2. コードグリッド（4列×2行）
```tsx
<div className="grid grid-cols-4 gap-2 md:flex md:gap-3">
  {chords.map((chord, i) => (
    <div key={i}
         className="aspect-square md:aspect-auto md:w-20 md:h-18
                    min-h-[56px] flex items-center justify-center font-chord
                    rounded-lg border border-voca-border-subtle text-base font-bold
                    text-voca-text bg-voca-bg-card
                    active:scale-95 transition-transform">
      {chord}
    </div>
  ))}
</div>
```

### 3. ボトムシートモーダル（コード編集）
```tsx
// スマホではフルスクリーンのボトムシート
<div className="fixed inset-0 z-50 md:flex md:items-center md:justify-center">
  {/* オーバーレイ */}
  <div className="absolute inset-0 bg-black/60" onClick={onClose} />

  {/* シート本体 */}
  <div className="absolute bottom-0 left-0 right-0
                  md:relative md:max-w-lg md:mx-auto
                  bg-voca-bg-card rounded-t-2xl md:rounded-2xl
                  border border-voca-border-subtle
                  max-h-[85vh] overflow-y-auto
                  animate-fadeInUp">
    {/* ドラッグハンドル（スマホのみ） */}
    <div className="md:hidden flex justify-center pt-3 pb-2">
      <div className="w-10 h-1 bg-voca-bg-section rounded-full" />
    </div>

    {/* コンテンツ */}
    {children}
  </div>
</div>
```

### 4. タブ切り替え（リズムパターン）
```tsx
// スマホではタブ、PCでは並列表示
<div className="md:hidden">
  <div className="flex border-b border-voca-border-subtle mb-4">
    {['ドラム', 'ベース', 'バッキング'].map(tab => (
      <button key={tab}
              className={`flex-1 py-3 text-sm font-medium
                         ${activeTab === tab
                           ? 'text-voca-accent-cyan border-b-2 border-voca-accent-cyan'
                           : 'text-voca-text-muted'}`}>
        {tab}
      </button>
    ))}
  </div>
  {/* activeTab に応じた内容を表示 */}
</div>

<div className="hidden md:block">
  {/* PC版: 3セクション並列表示 */}
</div>
```

### 5. セーフエリア対応（ノッチ、ホームバー）
```css
/* globals.css */
.safe-area-inset-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
```

```js
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      spacing: {
        'safe-b': 'env(safe-area-inset-bottom, 0px)',
      }
    }
  }
}
```

### 6. タッチフィードバック
```css
/* globals.css */
@media (hover: none) {
  .tap-highlight {
    -webkit-tap-highlight-color: rgba(224, 64, 251, 0.2); /* voca-accent-magenta */
  }
}
```

## スマホ固有の注意事項
- 横スクロールはなるべく避ける（ユーザーが気付かない）
- プリセットカードは縦スクロールの全幅カードにする
- テキスト入力は最小限にする（曲名検索以外はタップのみで操作可能に）
- 再生バーの下にコンテンツが隠れないよう、main に `pb-24` を付ける
- iOS Safari では AudioContext の制約が厳しいため、初回タップ時に必ず `Tone.start()` を呼ぶ

