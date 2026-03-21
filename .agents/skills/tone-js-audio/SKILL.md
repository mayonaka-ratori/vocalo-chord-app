---
name: tone-js-audio
description: Tone.js を使った音声再生の実装パターンを提供する。コード進行の再生、ドラムパターン、ベースライン、バッキングの実装時に使用する。Web Audio API やサウンド関連の機能を実装するときに活用する。
---

# Tone.js 音声実装スキル

## 目的
Tone.js を使った音声再生機能を正しく実装するためのパターンとベストプラクティスを提供する。

## 初期化パターン
```typescript
// ★ 必ずユーザーインタラクション後に呼ぶ
async function initAudio() {
  await Tone.start();
  // ここで各楽器を初期化
}
```

## SSR対策（Next.js必須）
```typescript
// Tone.js は dynamic import する
const Tone = await import('tone');
```
または
```typescript
// コンポーネントレベル
const ToneModule = dynamic(() => import('./ToneComponent'), { ssr: false });
```

## 推奨楽器構成
- **コードバッキング**: `Tone.PolySynth` (triangle or sine)
- **パッドサウンド**: `Tone.PolySynth` (sine, 長いattack/release)
- **ベース**: `Tone.MonoSynth` (sawtooth + lowpass filter)
- **キック**: `Tone.MembraneSynth`
- **スネア**: `Tone.NoiseSynth` (white, 短いdecay)
- **ハイハット**: `Tone.NoiseSynth` (white, 極短decay)
- **ピアノ音色**: `Tone.Sampler` + サンプル音源（遅延読み込み）

## タイミング制御
```typescript
// Tone.Loop で16分音符ごとにコールバック
const loop = new Tone.Loop((time) => {
  // time を使って triggerAttackRelease する（not Date.now()）
  synth.triggerAttackRelease(freq, duration, time);
}, "16n");

Tone.Transport.start();
loop.start(0);
```

## リソース管理
- 停止時は必ず loop.stop() → loop.dispose()
- Transport.stop() → Transport.cancel()
- 画面遷移時は全 dispose する（useEffect の cleanup）

詳細パターンは `references/tone-js-patterns.md` を参照すること。
