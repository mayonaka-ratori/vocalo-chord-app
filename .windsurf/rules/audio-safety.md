---
trigger: glob
globs: lib/audio/**/*.ts, hooks/use-playback.ts
description: Web Audio safety rules for Tone.js and smplr integration
---

# Audio Engine Rules

- Single shared AudioContext via `getAudioContext()` in engine.ts
- NEVER create AudioContext at module scope or import time
- Always call `ensureAudioReady()` before any audio operation
- Guard browser APIs with `typeof window !== 'undefined'` 
- All smplr imports MUST be dynamic: `const { SplendidGrandPiano } = await import('smplr')` 
- Every instrument load MUST have try-catch with Soundfont fallback
- MAX_LOADED = 3 instruments (LRU eviction)
- synth-fallback uses ONLY Tone.js — zero smplr dependency
- If smplr fails, audio pipeline must NEVER break — always fall back to Tone.js
