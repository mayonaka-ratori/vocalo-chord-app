# Fix and Deploy

Audit, fix, build-verify, and deploy the application.

## Steps

1. **Read & Map**: Read `app/page.tsx` and `components/main-app-content.tsx`. List every component, its import status, and render position. Report findings before making changes.

2. **Fix Issues**: Based on Step 1 findings, fix layout order, missing components, broken imports, or incorrect state connections. Keep changes minimal.

3. **Grep for Legacy Tokens**:
   ```bash
   grep -rn "slate\|bg-gray\|text-gray\|border-gray\|bg-zinc" components/ app/ lib/ --include="*.tsx" --include="*.ts" --include="*.css"
   ```
Replace any findings with voca-* equivalents.

## Build Verification

```bash
npx tsc --noEmit
npm run lint
npm run build
```

All three must pass with 0 errors, 0 warnings. Fix any issues.

## Commit & Push

```bash
git add .
git commit -m "fix: audit and deploy (v<version>)"
git push origin main
```

Report (in Japanese): List changed files, what was broken, what was fixed, build results.
