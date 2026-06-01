# NEST Platform — Claude Code Master Context

## Project Identity
- **Platform**: NEST — Private Bond Structuring · PE Fund · M&A Intelligence · Capital Markets
- **Venture**: Arden Edge Capital × Soparrow Capital
- **CEO**: Sean Gilmore (18yr JPMorgan — top banker 11x nationally)
- **Co-Founder**: Josh Edwards (Soparrow Capital)
- **Location**: Pacific Northwest
- **Insurance Partner**: Hylant Insurance (surety, specialty lines)
- **Bond Blueprint**: Jacaranda Trace PLOM (Series 2025, $231M, Florida LGFC)

## Stack — Never Deviate
- **Backend**: Flask (Python), port 8000, folder: `nest/backend/`
- **Frontend**: Next.js 14 App Router, port 8100, folder: `nest/frontend/`
- **Database**: Supabase (PostgreSQL + Realtime + Auth)
- **AI**: Anthropic Claude API — model: `claude-sonnet-4-20250514`
- **Auth**: JWT (flask-jwt-extended) + Supabase Auth
- **Realtime**: Flask-SocketIO
- **Payments**: Stripe
- **Email**: SendGrid
- **Deploy**: Railway (backend) + Vercel (frontend)

## Brand — Always Apply
```
Colors:
  --nest-void:    #030A06   (primary background)
  --nest-forest:  #0D2218   (card backgrounds)
  --nest-green:   #1E4A2E   (mid surfaces)
  --nest-pine:    #2D6B3D   (accents)
  --nest-navy:    #060E1A   (deep sections)
  --nest-gold:    #C4A048   (primary accent — all financial figures)
  --nest-gold-hi: #E8C87A   (hover states)
  --nest-sage:    #7A9A82   (secondary text)
  --nest-cream:   #EDE8DC   (primary text)

Fonts:
  Headings:  Cormorant Garamond (serif)
  Body:      Space Grotesk (sans)
  Data/Code: IBM Plex Mono (mono — ALL financial figures use this)
```

## Voice — Every AI Output
- **Tone**: Jimmy Lee (JPMorgan legend) — direct, decisive, no hedging, no passive voice
- **Rules**: Lead with conclusion · One idea per sentence · Numbers are authority
- **Banned words**: may, might, could, potentially, approximately, it seems
- **System prompt name**: Morgan (memo/content agent)
- **Every memo references**: Jacaranda Trace PLOM as structural template

## Agent Fleet (15 agents)
```
Vector       — Call/put timing (14 market signals, 15-min intervals)
Apex         — Short position manager (TLT puts, T-note futures, IRS)
Chain        — Blockchain execution (ERC-1400, smart contract calls)
Atlas        — Financial modeling (10yr proforma, stress scenarios)
Morgan       — Memo + marketing writer (Jimmy Lee tone, Claude API)
Sterling     — Investor placement (CRM, book building, AEC token)
Bridge       — Perm debt monitoring (18mo before stabilization)
Quantum      — HFT fund optimizer ($32.4M AUM, 21.3% YTD)
Maxwell      — Credit analyst (DSCR, LTV, LGD, obligor grade)
Aria         — Client + BD outreach (cold/warm, follow-up sequences)
Merlin       — M&A intelligence (NAICS scan, scoring, business plans)
LenderScout  — Direct lender sourcing (800+ lenders, match engine)
Prometheus   — Financial modeling engine (proforma, feasibility, audit sim)
Sentinel     — Risk assessment engine (7 dimensions, automated alerts)
Blaze        — Elite marketing engine (market intel, decks, content calendar)
```

## JP Morgan Credit Benchmarks (hardcode these everywhere)
```
A-grade:  DSCR>2.0, CF_leverage<1.5, BS_leverage<2.0, LTV<55%, D/EBITDA<4.5, ICR>3.5
BBB+:     DSCR>1.75, CF_leverage<1.75, BS_leverage<2.25, LTV<62%, D/EBITDA<5.5, ICR>2.75
BBB-:     DSCR>1.5, CF_leverage<2.0, BS_leverage<2.5, LTV<70%, D/EBITDA<6.5, ICR>2.25
Sub-IG:   DSCR<1.5 (any single breach = sub-investment grade)
```

## Capital Structure (NEST model — always use this)
```
Series A:  75% LTC · Investment grade · Hylant surety / LC · 6.5-7.5% coupon
Series B:  +7% (82% CLTV) · B/BBB · Bank managed · 10-14% coupon
IO:        Pre-funded from proceeds · No cash drag during construction
Reserve:   2.5% maturity reserve escrowed · Returned at maturity
HFT Fund:  B tranche AUM → Quantum agent → 15-25% target return
LC Phase:  AUM $0-15M=surety · $15-40M=hybrid · $40-80M=LC dominant · $80M+=self-collateralized
```

## File Naming Conventions
```
backend/agents/[name].py         — one file per agent
backend/services/[name].py       — business logic
backend/routes/[noun].py         — REST endpoints (plural nouns)
backend/models/[noun].py         — SQLAlchemy models (singular)
frontend/app/(public)/           — no auth required
frontend/app/(auth)/             — login/signup pages
frontend/app/client/             — authenticated clients
frontend/app/admin/              — NEST team only
frontend/components/[Domain]/    — grouped by feature
```

## API Response Format (always)
```python
return jsonify({
    "success": True,
    "data": {},
    "error": None,
    "timestamp": datetime.utcnow().isoformat()
}), 200
```

## Ports
```
NEST Backend:  8000
NEST Frontend: 8100
(CreditFix uses 3000/5000 — do not collide)
```

## Agent skills

### Issue tracker

GitHub Issues on `BusinessBear1981/NEST-ADVISORS-V3`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context repo. `CONTEXT.md` and `docs/adr/` at the root. See `docs/agents/domain.md`.
