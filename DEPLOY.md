# NEST Platform — Deployment Bible
> Stack: Flask/Python on Railway · Next.js 14 on Vercel · Supabase (tquotedgiapmivitjipn)
> GitHub: Businessbear1981/NEST-PLATFORM · Updated: 2026-06-13

---

## SECTION 1: ONE-SHOT CLEAN DEPLOY

```powershell
# From C:\Users\sgill\nest
cd C:\Users\sgill\nest\frontend
npm run build          # MUST pass locally before pushing

cd C:\Users\sgill\nest
git add .
git commit -m "your message"
git push origin main   # triggers Railway (backend) + Vercel (frontend) auto-deploy
```

Do not push if `npm run build` fails. Fix the build error first.

---

## SECTION 2: VERIFY THE DEPLOY

After pushing, verify in this exact order:

1. **GitHub Actions**: https://github.com/Businessbear1981/NEST-PLATFORM/actions — wait for green checkmark
2. **Vercel**: https://vercel.com/ardan-edge-capital/nest-platform — watch for READY state (not Building)
3. **Railway**: https://railway.app — watch for "Active" healthy deployment
4. **Health check**: https://web-production-5e8af.up.railway.app/api/health — must return `{"status":"healthy"}`
5. **Audit page**: https://nest-platform.vercel.app/audit — open in browser, confirm all green

If any step fails, do not open a deal meeting. Fix first.

---

## SECTION 3: ENVIRONMENT VARIABLES

### Vercel (frontend)
Set at: https://vercel.com/ardan-edge-capital/nest-platform/settings/environment-variables

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://tquotedgiapmivitjipn.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard > Project Settings > API > anon/public |
| `NEXT_PUBLIC_API_URL` | `https://web-production-5e8af.up.railway.app` |
| `NEXT_TELEMETRY_DISABLED` | `1` |
| `NEST_DEMO_MODE` | `1` (bypasses auth for investor demo) |

### Railway (backend)
Set in Railway dashboard > your service > Variables tab:

| Variable | Value |
|----------|-------|
| `SUPABASE_URL` | `https://tquotedgiapmivitjipn.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Supabase dashboard > Project Settings > API > service_role (secret) |
| `ANTHROPIC_API_KEY` | https://console.anthropic.com/account/keys |
| `JWT_SECRET` | Generate: `openssl rand -hex 32` |
| `FLASK_ENV` | `production` |
| `PORT` | Auto-set by Railway — do not override |

### GitHub Actions secrets
Set at: https://github.com/Businessbear1981/NEST-PLATFORM/settings/secrets/actions

| Secret | Value |
|--------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Same as Vercel |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same as Vercel |
| `NEXT_PUBLIC_API_URL` | Same as Vercel |
| `NEST_VERCEL_URL` | `https://nest-platform.vercel.app` |

---

## SECTION 4: COMMON FAILURES AND EXACT FIXES

| Symptom | Cause | Fix |
|---------|-------|-----|
| Vercel shows ERROR before build starts | `vercel.json` has invalid field | Remove `rootDirectory`, `buildCommand`, or `outputDirectory` from `vercel.json` — those are dashboard-only and cause instant ERROR |
| CI blocks on push | Hardcoded Railway URL in source | `grep -rn "web-production-" frontend/` — remove any hits |
| Build passes CI but Vercel shows old code | Vercel linked to wrong repo | vercel.com > project Settings > Git > confirm repo is `Businessbear1981/NEST-PLATFORM` |
| `/api/*` returns 404 on Vercel | `NEXT_PUBLIC_API_URL` not set | Add to Vercel env vars + redeploy |
| Health check shows missing env vars | Secrets not in Vercel dashboard | Set all `NEXT_PUBLIC_*` vars in Vercel > Settings > Environment Variables |
| Railway deploy fails on startup | pip install error | Check `backend/requirements.txt`; `pip install -r requirements.txt` locally to confirm |
| Supabase table missing | Migration not applied | Run SQL manually — see Section 5 |
| gevent import error on Railway | gevent not in requirements | Add `gevent` to `backend/requirements.txt` |

---

## SECTION 5: SUPABASE — MANUAL MIGRATION

Supabase CLI is not linked to the remote project. Run all migrations manually:

1. Go to https://supabase.com/dashboard/project/tquotedgiapmivitjipn/sql/new
2. Copy the full contents of the migration file from `supabase/migrations/[filename].sql`
3. Paste into the SQL editor and click **Run**
4. Verify: `SELECT COUNT(*) FROM [table_name];`

**Migration run order:**
1. `20260613000000_rls_policies.sql`
2. `20260613000001_engine_runs.sql`
3. `20260613000002_seed_parameters.sql`

Run them in order. Each migration may depend on tables created by the previous one.

---

## SECTION 6: LOCAL DEV

```powershell
# Backend — runs on port 8000
cd C:\Users\sgill\nest\backend
python app.py

# Frontend — runs on port 8100
cd C:\Users\sgill\nest\frontend
npm run dev
```

Access at: http://localhost:8100

The frontend proxies `/api/*` to `$NEXT_PUBLIC_API_URL/api/*` via `next.config.js` rewrites.
For local dev, set `NEXT_PUBLIC_API_URL=http://localhost:8000` in `frontend/.env.local`.

---

## SECTION 7: QUICK DIAGNOSTICS

```powershell
# Check what's live
curl https://web-production-5e8af.up.railway.app/api/health
curl https://nest-platform.vercel.app/api/health

# Check git before pushing
git log --oneline -5
git status

# Run local build before pushing (catches 95% of build failures)
cd C:\Users\sgill\nest\frontend
npm run build
```

---

## SECTION 8: INVESTOR DEMO CHECKLIST

Before any investor demo, complete every item:

- [ ] `npm run build` passes locally with zero errors
- [ ] Push to `main` and wait for Vercel READY state
- [ ] Open https://nest-platform.vercel.app/audit in browser — all checks green
- [ ] Test `/dashboard`, `/bond-desk`, `/eagleeye`, `/deals` in incognito window
- [ ] Confirm https://web-production-5e8af.up.railway.app/api/health returns `{"status":"healthy"}`
- [ ] Backup: have `localhost:8100` running locally as fallback if anything breaks live

---

## QUICK REFERENCE

| Resource | URL |
|----------|-----|
| Frontend (live) | https://nest-platform.vercel.app |
| Backend (live) | https://web-production-5e8af.up.railway.app |
| Supabase dashboard | https://supabase.com/dashboard/project/tquotedgiapmivitjipn |
| Vercel project | https://vercel.com/ardan-edge-capital/nest-platform |
| GitHub repo | https://github.com/Businessbear1981/NEST-PLATFORM |
| Railway | https://railway.app |
