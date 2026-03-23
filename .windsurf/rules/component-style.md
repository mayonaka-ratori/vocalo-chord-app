---
trigger: glob
globs: components/**/*.tsx, app/**/*.tsx
description: UI component styling and SSR safety rules
---

# Component Rules

- Use voca-* Tailwind tokens exclusively. Never slate/gray/zinc/neutral.
- Components accessing window/document/navigator at render time must use `dynamic(..., { ssr: false })` 
- All touch targets must be >= 44px on mobile
- Collapsible panels: closed by default on mobile, open on desktop
- Loading states: use `animate-pulse` with magenta accent
- Error states: use `text-voca-semantic-error` with clear user-facing message
