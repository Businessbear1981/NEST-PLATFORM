# Vercel Dashboard Action Required

## One-Click Change Needed

The `vercel.json` now builds from the `frontend/` subdirectory (Next.js 14), but the
Vercel project's **Root Directory** setting must also be updated to match.

### Steps

1. Go to: https://vercel.com/ardan-edge-capital/nest-platform/settings
2. Scroll to **General → Root Directory**
3. Type: `frontend`
4. Click **Save**

That's it. The next git push to `main` will build V3 (Next.js 14 App Router) instead of V2 (Vite).

---

## Why this matters

Vercel uses the Root Directory setting to resolve relative paths and detect the framework.
Without setting it to `frontend`, Vercel resolves paths from the repo root and the Next.js
framework detection may not fire correctly, even though `vercel.json` specifies `"framework": "nextjs"`.

---

## Project reference

- Project: nest-platform
- Project ID: prj_wdWBgl3hTUBVehES5TpIj432UMrA
- Domain: nestadvisors.tech
- Watches: NEST-PLATFORM/main
