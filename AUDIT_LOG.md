# Audit Log

## 2026-04-13 — Axis 2/3/5 audit (commit `aed72cf` 以前)

### Axis 3: 状態管理
| ID | ファイル | 対応 |
|----|----------|------|
| A3-1 | `lib/store.ts:181` | `setKey()` が structure mode で `sections[].chords` を転調しない致命的バグを修正 |
| A3-2 | `lib/store.ts:299` | `randomize()` で smplr の `activeInstrumentId` も同時にランダム化するよう修正 |

### Axis 5: 音楽ロジック
| ID | ファイル | 対応 |
|----|----------|------|
| A5-1 | `lib/music/chords.ts` | `isFlatKey()` + `getNoteFromIndexForKey()` を追加。フラット系キー（Bb/Eb/Ab 等）で正しい表記を返す |
| A5-2 | `lib/music/keys.ts` | `getDiatonicChords()` で `getNoteFromIndexForKey` を使用、フラットキー対応 |
| A5-3 | `lib/music/melody.ts` | `NoteGenContext` に `keyRoot` を追加し、全 8 ジェネレータと `makeNote()` を通じてキー対応ノート名を生成 |
| A5-4 | `lib/music/melody.ts:254` | melody ID をランダム生成から `${id}-${chordsKey}` の安定形式に変更 |

### Axis 2: オーディオ
| ID | ファイル | 対応 |
|----|----------|------|
| A2-1 | `components/main-app-content.tsx` | `useEffect` cleanup で `disposeAudio()` を呼び、ページ離脱時にリソースを解放 |
| A2-2 | `lib/audio/engine.ts:221` | `stopMelodyPreview()` を `async/await` に変更し fire-and-forget を解消 |
| A2-3 | `lib/audio/smplr-provider.ts:87` | `loadingPromises.get(id)` の `undefined` を `?? Promise.resolve()` でガード |
| A2-4 | `lib/audio/smplr-provider.ts:195` | 同期関数 `getAudioContext()` への不要な `await` を除去 |

---

## 2026-04-13 — Axis 1/4/6 audit (commit `60a58b2`)

### Axis 6: セキュリティ
| ID | ファイル | 対応 |
|----|----------|------|
| A6-1 | `.env.local.example` | 実キーをダミー値 `your_gemini_api_key_here` に差し替え |
| A6-2 | `app/api/search-chords/route.ts` | `MAX_QUERY_LENGTH=200` 制限追加、超過時 400 返却 |
| A6-3 | 同上 | x-forwarded-for ベースのレート制限は中リスクとして現状維持（コメント注記） |

### Axis 1: コード品質
| ID | ファイル | 対応 |
|----|----------|------|
| A1-1 | `lib/audio/playback-manager.ts` | `Tone.Draw.schedule()` 内の `switchBackingInstrument()` 呼び出し削除（同期コンテキストで await 不可、誤音源再生の原因） |
| A1-3 | `lib/audio/unified-player.ts` | `console.warn` × 3 を `NODE_ENV !== 'production'` ガード下に移動 |
| A1-4 | `lib/audio/smplr-provider.ts` | `console.error` × 5 を同ガード下に移動 |
| A1-5 | `lib/store.ts` | `console.error` をガード下に移動；ハードコードの `smplrIds` を `INSTRUMENT_PRESETS.filter(p => p.requiresNetwork)` で導出に変更 |

### Axis 4: アクセシビリティ
| ID | ファイル | 対応 |
|----|----------|------|
| A4-1 | `components/section-nav.tsx` | `role="tablist/tab"`, `aria-selected`, `←→` キーボードナビ実装 |
| A4-2 | `components/section-overview.tsx` | `div+onClick` → `<button>` 変換 |
| A4-3 | `components/floating-player.tsx` | `div+onClick` コントロール群 → `<button>` 変換 |
| A4-4 | `components/melody-guide-panel.tsx` | トグルに `aria-pressed`、プレビュー状態に `aria-live="polite"` 追加 |
| A4-5 | `components/chord-edit-modal.tsx` | `useFocusTrap` フック適用、Escape でクローズ |
| A4-6 | `components/structure-template-picker.tsx` | 同上 |
| A4-7 | `components/variation-panel.tsx` | SIMPLE/EXPERT トグルに `aria-pressed` 追加 |
| A4-8 | `components/instrument-selector.tsx` | ドロップダウンボタンに `aria-expanded`, `aria-haspopup="listbox"` 追加 |
| A4-9 | `components/rhythm-selector.tsx` | `role="tablist/tab/tabpanel"`, `aria-selected`, `aria-controls`, `aria-labelledby`, `hidden` で ARIA タブ複合ウィジェット完全実装 |
| A4-10 | `tailwind.config.ts` | `voca-text-muted` を `#7C7C9C` → `#9494B0` に変更（WCAG AA コントラスト比 ≥4.5:1 達成） |
| 新規 | `hooks/use-focus-trap.ts` | モーダル向け汎用フォーカストラップフック |

### /simplify リファクタリング
| ファイル | 内容 |
|----------|------|
| `lib/music/variation.ts` | ローカルの `isFlatNotation` / `noteFromIndexForKey` を削除し `chords.ts` の `getNoteFromIndexForKey` に統一 |
| `lib/store.ts` | `smplrIds` ハードコードを `INSTRUMENT_PRESETS` 起点に変更（単一ソース化） |
| `components/melody-guide-panel.tsx` | `melodyPhrases.indexOf(phrase)` (O(n²)) → `map` の `phraseIndex` に修正 |
| `lib/music/melody.ts` | `chordsKey` 生成時に `#` → `s` 置換を追加（`C#m` と `Cm` の ID 衝突を修正） |
| `hooks/use-focus-trap.ts` | マウント時の二重 `getFocusable()` 呼び出しを簡略化 |
