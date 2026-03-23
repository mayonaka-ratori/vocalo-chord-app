# Vocalo Chord Assistant — Project Context

## Tech Stack
- Next.js 14 App Router, TypeScript strict mode, Tailwind CSS, Zustand
- Audio: Tone.js + smplr (lazy-loaded, shared AudioContext)
- Deploy: Vercel

## Design System (Vocacore Theme)
- ALL colors use `voca-*` Tailwind tokens. NEVER use slate, gray, zinc, neutral.
- Backgrounds: bg-voca-bg (#0D0D14), bg-voca-bg-card (#16162A), bg-voca-bg-section (#1E1E3A), bg-voca-bg-elevated (#222244)
- Accents: accent-cyan (#00E5FF), accent-magenta (#E040FB), accent-purple (#7C4DFF)
- Text: text-voca-text (#F0F0F8), text-voca-text-sub (#8888AA), text-voca-text-muted (#7C7C9C)
- Primary buttons: `bg-voca-accent-cyan text-voca-bg font-bold rounded-lg` 
- Cards: `bg-voca-bg-card border border-voca-border-subtle rounded-xl` 
- Active/selected: `border-voca-accent-cyan shadow-glow-cyan` 

## Code Standards
- No `any` type. No `@ts-ignore`. Strict TypeScript.
- All audio/browser API access MUST be inside useEffect or async functions (SSR safety).
- Components using browser APIs MUST use `dynamic(() => import(...), { ssr: false })`.
- Before committing, all three must pass with 0 errors: `npm run lint`, `npm run build`, `npx tsc --noEmit` 
- Report summaries in Japanese.

## Architecture
- Page entry: `app/page.tsx` → `components/main-app-content.tsx` 
- State: `lib/store.ts` (Zustand)
- Audio pipeline: `lib/audio/engine.ts` → `lib/audio/unified-player.ts` → `lib/audio/smplr-provider.ts` 
- synth-fallback (Tone.js) must ALWAYS work independently of smplr
