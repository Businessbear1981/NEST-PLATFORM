# GENIE — Bond Desk Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fragmented Bond Desk with a cinematic, module-composed arrangement terminal featuring a Deal Pulse Ticker, Bond Structuring Engine, CMBS Stacking Desk, and Bernard AI narration.

**Architecture:** Five React modules sharing a `DealStateContext` provider. Each module is an independent component in `frontend-v2/src/components/bond-desk/`. Backend adds 4 new endpoints to existing Flask blueprints. No new dependencies — uses recharts, framer-motion, Radix UI, and React Query already in the project.

**Tech Stack:** React 19 + TypeScript, Tailwind CSS, recharts, framer-motion, Radix UI, Flask, existing CreditEngine/call_claude from services/core.py

**Spec:** `docs/superpowers/specs/2026-05-21-bond-desk-genie-design.md`

---

## File Map

### New Files (Create)

| File | Responsibility |
|------|---------------|
| `frontend-v2/src/contexts/DealStateContext.tsx` | Shared deal state spine — activeDeal, capitalStack, marketSnapshot, auditLog |
| `frontend-v2/src/contexts/BernardContext.tsx` | Bernard narration provider — mode toggle, event queue, push/render |
| `frontend-v2/src/components/bond-desk/BondDeskPage.tsx` | Page layout composing all modules top-to-bottom |
| `frontend-v2/src/components/bond-desk/DealPulseTicker.tsx` | Market vitals + deal impact stream + issuance window gauge |
| `frontend-v2/src/components/bond-desk/BondStructuringEngine.tsx` | Individual deal structuring: tranche builder, capital stack viz, stress test |
| `frontend-v2/src/components/bond-desk/CMBSStackingDesk.tsx` | CMBS pool builder, waterfall visualization, leverage slider |
| `frontend-v2/src/components/bond-desk/BernardNarrator.tsx` | Inline Bernard renderer — cards, mode toggle, deal optimizer suggestions |
| `backend/routes/bond_structuring.py` | New endpoints: /structure, /deal-impact, /call-put-analysis, /pool-analysis |

### Existing Files (Modify)

| File | Changes |
|------|---------|
| `frontend-v2/src/lib/api.ts` | Add `bondStructuring` API namespace (4 endpoints) |
| `frontend-v2/src/lib/trpc.ts` | Add `bondStructuring` React Query hooks |
| `frontend-v2/src/App.tsx` | Replace `/bond-desk` route to use new BondDeskPage |
| `backend/app.py` | Register `bond_structuring_bp` blueprint |

---

## Task 1: Backend — Bond Structuring Endpoints

**Files:**
- Create: `backend/routes/bond_structuring.py`
- Modify: `backend/app.py` (add blueprint registration)

This task adds 4 new backend endpoints that power the entire Bond Desk. All computation uses the existing `CreditEngine` from `services/core.py`.

- [ ] **Step 1: Create the bond structuring route file**

```python
# backend/routes/bond_structuring.py
"""GENIE Bond Desk structuring, deal-impact, and pool analysis endpoints."""
from flask import Blueprint, jsonify, request
from datetime import datetime

bond_structuring_bp = Blueprint("bond_structuring", __name__)


def _ts():
    return datetime.utcnow().isoformat()


def _ok(data, code=200):
    return jsonify({"success": True, "data": data, "error": None, "timestamp": _ts()}), code


def _err(msg, code=400):
    return jsonify({"success": False, "data": None, "error": msg, "timestamp": _ts()}), code


# ── Structure a full capital stack ─────────────────────────────
@bond_structuring_bp.route("/structure", methods=["POST"])
def structure_deal():
    """Takes deal inputs + tranches, returns computed metrics, stress, grade, and Bernard narration."""
    body = request.get_json() or {}
    tranches = body.get("tranches", [])
    deal = body.get("deal", {})

    if not tranches:
        return _err("At least one tranche required")

    from services.core import credit, JPM, JIMMY_LEE, call_claude

    tpc = deal.get("total_project_cost_usd", 0)
    noi = deal.get("stabilized_noi_usd", 0)
    appraised = deal.get("appraised_value_usd", tpc * 1.2)

    # Compute per-tranche metrics
    total_debt = 0
    total_ds = 0
    weighted_coupon_num = 0
    weighted_spread_num = 0
    tranche_results = []

    for t in tranches:
        size = t.get("size_usd", 0)
        coupon = t.get("coupon_pct", 7.0)
        spread = t.get("spread_bps", 0)
        total_debt += size
        ds = size * coupon / 100
        total_ds += ds
        weighted_coupon_num += size * coupon
        weighted_spread_num += size * spread
        tranche_results.append({
            **t,
            "annual_debt_service_usd": round(ds),
        })

    # Aggregate metrics
    blended_coupon = round(weighted_coupon_num / total_debt, 3) if total_debt > 0 else 0
    blended_spread = round(weighted_spread_num / total_debt, 1) if total_debt > 0 else 0
    cltv = round(total_debt / appraised * 100, 2) if appraised > 0 else 0
    ltc = round(total_debt / tpc * 100, 2) if tpc > 0 else 0
    dscr = round(noi / total_ds, 3) if total_ds > 0 else 0
    icr = round(noi / (total_ds * 0.4), 3) if total_ds > 0 else 0
    ltv = cltv  # using CLTV as LTV proxy for grading

    # Grade using JPM benchmarks
    grade_result = credit.compute({
        "stabilized_noi_usd": noi,
        "a_tranche_usd": total_debt * 0.75,
        "b_tranche_usd": total_debt * 0.25,
        "a_coupon_pct": blended_coupon,
        "b_coupon_pct": blended_coupon + 4,
        "total_project_cost_usd": tpc,
        "appraised_value_usd": appraised,
        "ebitda_usd": noi,
    })

    # Stress test
    stress = credit.stress(noi, total_ds, tpc, total_debt)

    # Bernard narration at three depths
    action_summary = f"Capital stack: {len(tranches)} tranches, ${total_debt/1e6:.1f}M total, {blended_coupon:.2f}% blended coupon, CLTV {cltv:.1f}%, DSCR {dscr:.2f}x, grade {grade_result['obligor_grade']}"

    bernard = {
        "expert": f"{grade_result['obligor_grade']} grade. DSCR {dscr:.2f}x. CLTV {cltv:.1f}%.",
        "standard": f"{grade_result['obligor_grade']} grade structure. DSCR {dscr:.2f}x with {cltv:.1f}% CLTV. "
                     f"{'Investment grade — surety wrap eligible.' if dscr >= 1.5 else 'Sub-IG — requires enhancement.'}",
        "educational": f"This {len(tranches)}-tranche structure raises ${total_debt/1e6:.1f}M against a ${tpc/1e6:.1f}M project. "
                       f"The blended coupon of {blended_coupon:.2f}% produces ${total_ds/1e6:.2f}M annual debt service. "
                       f"With ${noi/1e6:.2f}M NOI, that gives you a {dscr:.2f}x DSCR — "
                       f"{'above the A-grade threshold of 2.0x. Strong position.' if dscr >= 2.0 else 'above BBB threshold of 1.5x. Solid but watch the spread.' if dscr >= 1.5 else 'below investment grade. The 1.5x DSCR floor is the line — you need more NOI or less debt.'} "
                       f"CLTV at {cltv:.1f}% {'is conservative.' if cltv <= 65 else 'is moderate.' if cltv <= 75 else 'is aggressive — LTV alert triggered.'}",
    }

    return _ok({
        "tranches": tranche_results,
        "metrics": {
            "total_debt_usd": round(total_debt),
            "total_debt_service_usd": round(total_ds),
            "blended_coupon_pct": blended_coupon,
            "blended_spread_bps": blended_spread,
            "cltv_pct": cltv,
            "ltc_pct": ltc,
            "dscr": dscr,
            "icr": icr,
            "obligor_grade": grade_result["obligor_grade"],
            "deal_score": grade_result["deal_score"],
            "deal_score_grade": grade_result["deal_score_grade"],
            "ltv_alert": grade_result["ltv_alert"],
        },
        "stress": stress,
        "bernard": bernard,
    })


# ── Deal impact from market movement ──────────────────────────
@bond_structuring_bp.route("/deal-impact", methods=["POST"])
def deal_impact():
    """Compute how a rate change impacts an active deal's stack."""
    body = request.get_json() or {}
    rate_delta_bps = body.get("rate_delta_bps", 0)
    current_stack = body.get("current_stack", {})
    deal = body.get("deal", {})

    blended_coupon = current_stack.get("blended_coupon_pct", 7.0)
    total_debt = current_stack.get("total_debt_usd", 0)
    noi = deal.get("stabilized_noi_usd", 0)

    # New coupon = old coupon + rate delta (simplified pass-through)
    new_coupon = blended_coupon + rate_delta_bps / 100
    old_ds = total_debt * blended_coupon / 100
    new_ds = total_debt * new_coupon / 100
    old_dscr = round(noi / old_ds, 3) if old_ds > 0 else 0
    new_dscr = round(noi / new_ds, 3) if new_ds > 0 else 0
    dscr_delta = round(new_dscr - old_dscr, 3)

    # Spread impact (10yr move typically moves IG spreads ~30% of magnitude)
    spread_impact_bps = round(rate_delta_bps * 0.3, 1)

    severity = "favorable" if rate_delta_bps < 0 else "watch" if abs(rate_delta_bps) <= 10 else "action"

    impact_text = (
        f"10yr {'+'if rate_delta_bps > 0 else ''}{rate_delta_bps}bp -> "
        f"coupon {blended_coupon:.2f}%->{new_coupon:.2f}% -> "
        f"DSCR buffer {'+' if dscr_delta > 0 else ''}{dscr_delta:.3f}x"
    )

    return _ok({
        "impact_text": impact_text,
        "severity": severity,
        "rate_delta_bps": rate_delta_bps,
        "coupon_old_pct": blended_coupon,
        "coupon_new_pct": round(new_coupon, 3),
        "dscr_old": old_dscr,
        "dscr_new": new_dscr,
        "dscr_delta": dscr_delta,
        "spread_impact_bps": spread_impact_bps,
        "ds_old_usd": round(old_ds),
        "ds_new_usd": round(new_ds),
    })


# ── Call/Put optionality analysis ─────────────────────────────
@bond_structuring_bp.route("/call-put-analysis", methods=["POST"])
def call_put_analysis():
    """Analyze call/put optionality for a tranche."""
    body = request.get_json() or {}
    from services.core import credit

    current_rate_bps = body.get("current_rate_bps", 0)
    orig_rate_bps = body.get("original_rate_bps", 0)
    deal = body.get("deal", {})

    result = credit.call_put_analysis(current_rate_bps, orig_rate_bps, deal)
    return _ok(result)


# ── CMBS pool analysis ────────────────────────────────────────
@bond_structuring_bp.route("/pool-analysis", methods=["POST"])
def pool_analysis():
    """Analyze a CMBS pool of multiple deals."""
    body = request.get_json() or {}
    deals = body.get("deals", [])

    if not deals:
        return _err("At least one deal required for pool analysis")

    from services.core import credit

    total_commitment = 0
    weighted_coupon_num = 0
    weighted_life_num = 0
    total_noi = 0
    total_ds = 0
    sector_counts = {}
    tranche_classes = {"senior": 0, "mezzanine": 0, "subordinate": 0, "equity": 0}

    for d in deals:
        commitment = d.get("total_debt_usd", 0)
        coupon = d.get("blended_coupon_pct", 7.0)
        wal = d.get("weighted_avg_life_yrs", 10)
        noi = d.get("stabilized_noi_usd", 0)
        ds = commitment * coupon / 100
        sector = d.get("sector", "other")

        total_commitment += commitment
        weighted_coupon_num += commitment * coupon
        weighted_life_num += commitment * wal
        total_noi += noi
        total_ds += ds
        sector_counts[sector] = sector_counts.get(sector, 0) + 1

        # Classify tranches into pool-level classes
        for t in d.get("tranches", []):
            series = t.get("series", "A").upper()
            if series == "A":
                tranche_classes["senior"] += t.get("size_usd", 0)
            elif series == "B":
                tranche_classes["mezzanine"] += t.get("size_usd", 0)
            elif series == "C":
                tranche_classes["subordinate"] += t.get("size_usd", 0)
            else:
                tranche_classes["equity"] += t.get("size_usd", 0)

    wac = round(weighted_coupon_num / total_commitment, 3) if total_commitment > 0 else 0
    wal = round(weighted_life_num / total_commitment, 2) if total_commitment > 0 else 0
    pool_dscr = round(total_noi / total_ds, 3) if total_ds > 0 else 0

    # Diversification score (0-100): more sectors + more deals = higher
    unique_sectors = len(sector_counts)
    deal_count = len(deals)
    diversification = min(100, round(unique_sectors * 15 + deal_count * 10))

    # Senior percentage
    senior_pct = round(tranche_classes["senior"] / total_commitment * 100, 1) if total_commitment > 0 else 0

    # Subordination levels (simplified)
    sub_total = tranche_classes["subordinate"] + tranche_classes["equity"]
    subordination_pct = round(sub_total / total_commitment * 100, 1) if total_commitment > 0 else 0

    return _ok({
        "pool_metrics": {
            "total_commitment_usd": round(total_commitment),
            "deal_count": deal_count,
            "wac_pct": wac,
            "wal_yrs": wal,
            "pool_dscr": pool_dscr,
            "diversification_score": diversification,
            "senior_pct": senior_pct,
            "subordination_pct": subordination_pct,
        },
        "tranche_classes": {k: round(v) for k, v in tranche_classes.items()},
        "sector_breakdown": sector_counts,
    })
```

- [ ] **Step 2: Register the blueprint in app.py**

In `backend/app.py`, add the import and registration alongside the existing blueprints. Find the line `app.register_blueprint(bond_tools_bp, url_prefix="/api/bond-tools")` and add below it:

```python
from routes.bond_structuring import bond_structuring_bp
app.register_blueprint(bond_structuring_bp, url_prefix="/api/bond-structuring")
```

- [ ] **Step 3: Test the endpoints manually**

Start the backend and verify each endpoint responds:

```bash
cd /c/Users/sgill/nest/backend
# Start server if not running
python app.py &

# Test /structure
curl -X POST http://localhost:8000/api/bond-structuring/structure \
  -H "Content-Type: application/json" \
  -d '{"deal":{"total_project_cost_usd":200000000,"stabilized_noi_usd":16000000},"tranches":[{"series":"A","size_usd":150000000,"coupon_pct":7.0,"spread_bps":85}]}'

# Test /deal-impact
curl -X POST http://localhost:8000/api/bond-structuring/deal-impact \
  -H "Content-Type: application/json" \
  -d '{"rate_delta_bps":3,"current_stack":{"blended_coupon_pct":7.0,"total_debt_usd":150000000},"deal":{"stabilized_noi_usd":16000000}}'

# Test /pool-analysis
curl -X POST http://localhost:8000/api/bond-structuring/pool-analysis \
  -H "Content-Type: application/json" \
  -d '{"deals":[{"total_debt_usd":150000000,"blended_coupon_pct":7.0,"stabilized_noi_usd":16000000,"sector":"office","tranches":[{"series":"A","size_usd":112000000},{"series":"B","size_usd":38000000}]}]}'
```

Expected: all return `{"success": true, "data": {...}}`.

- [ ] **Step 4: Commit**

```bash
git add backend/routes/bond_structuring.py backend/app.py
git commit -m "feat(backend): add GENIE bond structuring endpoints — /structure, /deal-impact, /call-put-analysis, /pool-analysis"
```

---

## Task 2: Frontend — API Client + React Query Hooks

**Files:**
- Modify: `frontend-v2/src/lib/api.ts`
- Modify: `frontend-v2/src/lib/trpc.ts`

Wire the new backend endpoints into the existing API layer so all Bond Desk modules can call them.

- [ ] **Step 1: Add bondStructuring namespace to api.ts**

At the end of `frontend-v2/src/lib/api.ts`, before the final export, add:

```typescript
// ── Bond Structuring (GENIE) ────────────────────────────────
export const bondStructuring = {
  structure: (params: {
    deal: Record<string, unknown>;
    tranches: Array<Record<string, unknown>>;
  }) =>
    nestFetch("/api/bond-structuring/structure", {
      method: "POST",
      body: JSON.stringify(params),
    }),
  dealImpact: (params: {
    rate_delta_bps: number;
    current_stack: Record<string, unknown>;
    deal: Record<string, unknown>;
  }) =>
    nestFetch("/api/bond-structuring/deal-impact", {
      method: "POST",
      body: JSON.stringify(params),
    }),
  callPutAnalysis: (params: Record<string, unknown>) =>
    nestFetch("/api/bond-structuring/call-put-analysis", {
      method: "POST",
      body: JSON.stringify(params),
    }),
  poolAnalysis: (params: { deals: Array<Record<string, unknown>> }) =>
    nestFetch("/api/bond-structuring/pool-analysis", {
      method: "POST",
      body: JSON.stringify(params),
    }),
};
```

- [ ] **Step 2: Add bondStructuring hooks to trpc.ts**

At the end of `frontend-v2/src/lib/trpc.ts`, before the `export const trpc` block, add:

```typescript
// ── Bond Structuring (GENIE) ───────────────────────────────────

const bondStructuring = {
  structure: m((input: { deal: Record<string, unknown>; tranches: Array<Record<string, unknown>> }) =>
    api.bondStructuring.structure(input)),
  dealImpact: m((input: { rate_delta_bps: number; current_stack: Record<string, unknown>; deal: Record<string, unknown> }) =>
    api.bondStructuring.dealImpact(input)),
  callPutAnalysis: m((input: Record<string, unknown>) =>
    api.bondStructuring.callPutAnalysis(input)),
  poolAnalysis: m((input: { deals: Array<Record<string, unknown>> }) =>
    api.bondStructuring.poolAnalysis(input)),
};
```

Then add `bondStructuring` to the `export const trpc` object:

```typescript
export const trpc = {
  auth,
  deals,
  approvals,
  bonds,
  mTargets,
  tenants,
  draws,
  covenants,
  powerstrip,
  bondWorkflow,
  eagleeye,
  hawkeye: hawkeyeHooks,
  ratingEsg,
  bondStructuring,  // <-- add this
  useUtils,
};
```

- [ ] **Step 3: Commit**

```bash
git add frontend-v2/src/lib/api.ts frontend-v2/src/lib/trpc.ts
git commit -m "feat(api): add GENIE bondStructuring API client + React Query hooks"
```

---

## Task 3: DealStateContext — The Shared Spine

**Files:**
- Create: `frontend-v2/src/contexts/DealStateContext.tsx`

The central nervous system. Every Bond Desk module reads from and writes to this context.

- [ ] **Step 1: Create the context file**

```typescript
// frontend-v2/src/contexts/DealStateContext.tsx
import { createContext, useContext, useReducer, useCallback, type ReactNode } from "react";

// ── Types ───────────────────────────────────────────────────────

export interface Tranche {
  id: string;
  series: "A" | "B" | "C" | "SUB";
  label: string;
  size_usd: number;
  coupon_pct: number;
  spread_bps: number;
  maturity_yrs: number;
  ltc_pct: number;
  call_schedule?: Array<{ date: string; price: number; type: string }>;
  put_schedule?: Array<{ date: string; trigger: string }>;
}

export interface Deal {
  id: string;
  name: string;
  sponsor: string;
  total_project_cost_usd: number;
  stabilized_noi_usd: number;
  appraised_value_usd: number;
  use_of_proceeds: string;
  sector: string;
  phase: "sourcing" | "structuring" | "placement" | "closing";
}

export interface MarketSnapshot {
  treasury_10yr: number;
  treasury_5yr: number;
  sofr: number;
  ig_spread_bps: number;
  vix: number;
  updated_at: string;
  prev_treasury_10yr: number;
}

export interface StackMetrics {
  total_debt_usd: number;
  total_debt_service_usd: number;
  blended_coupon_pct: number;
  blended_spread_bps: number;
  cltv_pct: number;
  ltc_pct: number;
  dscr: number;
  icr: number;
  obligor_grade: string;
  deal_score: number;
  deal_score_grade: string;
  ltv_alert: boolean;
}

export interface StressResult {
  [scenario: string]: {
    description: string;
    dscr: number;
    status: string;
    outcome: string;
  };
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  detail: string;
  token_id?: string;
}

export interface PoolDeal {
  deal: Deal;
  tranches: Tranche[];
  metrics: StackMetrics;
}

export interface IssuanceWindow {
  status: "open" | "narrowing" | "closed";
  hours_remaining: number;
  confidence: number;
  summary: string;
}

// ── State Shape ─────────────────────────────────────────────────

interface DealState {
  activeDeal: Deal | null;
  tranches: Tranche[];
  metrics: StackMetrics | null;
  stress: StressResult | null;
  marketSnapshot: MarketSnapshot;
  cmbsPool: PoolDeal[];
  issuanceWindow: IssuanceWindow;
  auditLog: AuditEntry[];
  dealOptimizerOn: boolean;
}

const DEFAULT_MARKET: MarketSnapshot = {
  treasury_10yr: 4.28,
  treasury_5yr: 4.05,
  sofr: 5.33,
  ig_spread_bps: 112,
  vix: 18.5,
  updated_at: new Date().toISOString(),
  prev_treasury_10yr: 4.25,
};

const INITIAL_STATE: DealState = {
  activeDeal: null,
  tranches: [],
  metrics: null,
  stress: null,
  marketSnapshot: DEFAULT_MARKET,
  cmbsPool: [],
  issuanceWindow: { status: "open", hours_remaining: 72, confidence: 0.78, summary: "Favorable conditions — price this week." },
  auditLog: [],
  dealOptimizerOn: true,
};

// ── Actions ─────────────────────────────────────────────────────

type Action =
  | { type: "SET_DEAL"; deal: Deal }
  | { type: "ADD_TRANCHE"; tranche: Tranche }
  | { type: "UPDATE_TRANCHE"; id: string; updates: Partial<Tranche> }
  | { type: "REMOVE_TRANCHE"; id: string }
  | { type: "SET_METRICS"; metrics: StackMetrics; stress: StressResult }
  | { type: "SET_MARKET"; snapshot: MarketSnapshot }
  | { type: "ADD_TO_POOL"; poolDeal: PoolDeal }
  | { type: "REMOVE_FROM_POOL"; dealId: string }
  | { type: "SET_ISSUANCE_WINDOW"; window: IssuanceWindow }
  | { type: "LOG"; entry: Omit<AuditEntry, "id" | "timestamp"> }
  | { type: "TOGGLE_OPTIMIZER" }
  | { type: "RESET" };

function reducer(state: DealState, action: Action): DealState {
  switch (action.type) {
    case "SET_DEAL":
      return { ...state, activeDeal: action.deal, tranches: [], metrics: null, stress: null };
    case "ADD_TRANCHE":
      return { ...state, tranches: [...state.tranches, action.tranche] };
    case "UPDATE_TRANCHE":
      return {
        ...state,
        tranches: state.tranches.map((t) =>
          t.id === action.id ? { ...t, ...action.updates } : t
        ),
      };
    case "REMOVE_TRANCHE":
      return { ...state, tranches: state.tranches.filter((t) => t.id !== action.id) };
    case "SET_METRICS":
      return { ...state, metrics: action.metrics, stress: action.stress };
    case "SET_MARKET":
      return { ...state, marketSnapshot: action.snapshot };
    case "ADD_TO_POOL":
      return { ...state, cmbsPool: [...state.cmbsPool, action.poolDeal] };
    case "REMOVE_FROM_POOL":
      return { ...state, cmbsPool: state.cmbsPool.filter((p) => p.deal.id !== action.dealId) };
    case "SET_ISSUANCE_WINDOW":
      return { ...state, issuanceWindow: action.window };
    case "LOG":
      return {
        ...state,
        auditLog: [
          ...state.auditLog,
          { ...action.entry, id: crypto.randomUUID(), timestamp: new Date().toISOString() },
        ],
      };
    case "TOGGLE_OPTIMIZER":
      return { ...state, dealOptimizerOn: !state.dealOptimizerOn };
    case "RESET":
      return INITIAL_STATE;
    default:
      return state;
  }
}

// ── Context ─────────────────────────────────────────────────────

interface DealStateContextType {
  state: DealState;
  dispatch: React.Dispatch<Action>;
  setDeal: (deal: Deal) => void;
  addTranche: (tranche: Tranche) => void;
  updateTranche: (id: string, updates: Partial<Tranche>) => void;
  removeTranche: (id: string) => void;
  setMetrics: (metrics: StackMetrics, stress: StressResult) => void;
  setMarket: (snapshot: MarketSnapshot) => void;
  addToPool: (poolDeal: PoolDeal) => void;
  removeFromPool: (dealId: string) => void;
  log: (actor: string, action: string, detail: string) => void;
}

const DealStateContext = createContext<DealStateContextType | null>(null);

export function DealStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const setDeal = useCallback((deal: Deal) => dispatch({ type: "SET_DEAL", deal }), []);
  const addTranche = useCallback((tranche: Tranche) => dispatch({ type: "ADD_TRANCHE", tranche }), []);
  const updateTranche = useCallback((id: string, updates: Partial<Tranche>) => dispatch({ type: "UPDATE_TRANCHE", id, updates }), []);
  const removeTranche = useCallback((id: string) => dispatch({ type: "REMOVE_TRANCHE", id }), []);
  const setMetrics = useCallback((metrics: StackMetrics, stress: StressResult) => dispatch({ type: "SET_METRICS", metrics, stress }), []);
  const setMarket = useCallback((snapshot: MarketSnapshot) => dispatch({ type: "SET_MARKET", snapshot }), []);
  const addToPool = useCallback((poolDeal: PoolDeal) => dispatch({ type: "ADD_TO_POOL", poolDeal }), []);
  const removeFromPool = useCallback((dealId: string) => dispatch({ type: "REMOVE_FROM_POOL", dealId }), []);
  const log = useCallback((actor: string, action: string, detail: string) =>
    dispatch({ type: "LOG", entry: { actor, action, detail } }), []);

  return (
    <DealStateContext.Provider value={{
      state, dispatch, setDeal, addTranche, updateTranche, removeTranche,
      setMetrics, setMarket, addToPool, removeFromPool, log,
    }}>
      {children}
    </DealStateContext.Provider>
  );
}

export function useDealState() {
  const ctx = useContext(DealStateContext);
  if (!ctx) throw new Error("useDealState must be used within DealStateProvider");
  return ctx;
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend-v2/src/contexts/DealStateContext.tsx
git commit -m "feat: add DealStateContext — shared state spine for Bond Desk modules"
```

---

## Task 4: BernardContext — Narration Provider

**Files:**
- Create: `frontend-v2/src/contexts/BernardContext.tsx`

Manages Bernard's mode, event queue, and push interface. Every module calls `useBernard()` to submit narration events.

- [ ] **Step 1: Create the context file**

```typescript
// frontend-v2/src/contexts/BernardContext.tsx
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type BernardMode = "expert" | "standard" | "educational";

export interface BernardEvent {
  id: string;
  timestamp: string;
  type: string;
  depths: {
    expert: string;
    standard: string;
    educational: string;
  };
  data?: Record<string, unknown>;
  isOptimizer?: boolean;
}

interface BernardContextType {
  mode: BernardMode;
  setMode: (mode: BernardMode) => void;
  optimizerOn: boolean;
  toggleOptimizer: () => void;
  events: BernardEvent[];
  push: (event: Omit<BernardEvent, "id" | "timestamp">) => void;
  clear: () => void;
}

const BernardContext = createContext<BernardContextType | null>(null);

export function BernardProvider({ children, defaultMode = "standard" }: { children: ReactNode; defaultMode?: BernardMode }) {
  const [mode, setMode] = useState<BernardMode>(defaultMode);
  const [optimizerOn, setOptimizerOn] = useState(true);
  const [events, setEvents] = useState<BernardEvent[]>([]);

  const push = useCallback((event: Omit<BernardEvent, "id" | "timestamp">) => {
    setEvents((prev) => [
      { ...event, id: crypto.randomUUID(), timestamp: new Date().toISOString() },
      ...prev,
    ].slice(0, 50)); // keep last 50 events
  }, []);

  const clear = useCallback(() => setEvents([]), []);
  const toggleOptimizer = useCallback(() => setOptimizerOn((v) => !v), []);

  return (
    <BernardContext.Provider value={{ mode, setMode, optimizerOn, toggleOptimizer, events, push, clear }}>
      {children}
    </BernardContext.Provider>
  );
}

export function useBernard() {
  const ctx = useContext(BernardContext);
  if (!ctx) throw new Error("useBernard must be used within BernardProvider");
  return ctx;
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend-v2/src/contexts/BernardContext.tsx
git commit -m "feat: add BernardContext — mode toggle, event queue, push interface"
```

---

## Task 5: BernardNarrator — Inline Renderer

**Files:**
- Create: `frontend-v2/src/components/bond-desk/BernardNarrator.tsx`

Renders Bernard's narration cards in the right column of the structuring engine. Includes mode toggle and optimizer switch.

- [ ] **Step 1: Create the component directory and file**

```bash
mkdir -p frontend-v2/src/components/bond-desk
```

```typescript
// frontend-v2/src/components/bond-desk/BernardNarrator.tsx
import { useBernard, type BernardMode } from "@/contexts/BernardContext";
import { motion, AnimatePresence } from "framer-motion";

const MODE_LABELS: Record<BernardMode, string> = {
  expert: "Expert",
  standard: "Standard",
  educational: "Educational",
};

const MODE_COLORS: Record<BernardMode, string> = {
  expert: "border-amber-500/60 bg-amber-500/10",
  standard: "border-cyan-500/60 bg-cyan-500/10",
  educational: "border-emerald-500/60 bg-emerald-500/10",
};

export default function BernardNarrator() {
  const { mode, setMode, optimizerOn, toggleOptimizer, events } = useBernard();

  return (
    <div className="flex h-full flex-col">
      {/* Header + Mode Toggle */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-[Cormorant_Garamond] text-sm font-semibold tracking-wide text-slate-200">
            Bernard
          </span>
        </div>
        <div className="flex gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-0.5">
          {(["expert", "standard", "educational"] as BernardMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-md px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider transition-all ${
                mode === m
                  ? "bg-white/15 text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {m[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Optimizer Toggle */}
      <button
        onClick={toggleOptimizer}
        className={`mb-3 flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-wider transition-all ${
          optimizerOn
            ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
            : "border-white/10 bg-white/[0.02] text-slate-500"
        }`}
      >
        <div className={`h-1.5 w-1.5 rounded-full ${optimizerOn ? "bg-amber-400" : "bg-slate-600"}`} />
        Deal Optimizer {optimizerOn ? "ON" : "OFF"}
      </button>

      {/* Event Cards */}
      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {events
            .filter((e) => !e.isOptimizer || optimizerOn)
            .map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: -12, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className={`rounded-xl border p-3 ${
                  event.isOptimizer
                    ? "border-amber-500/25 bg-amber-500/[0.06]"
                    : MODE_COLORS[mode]
                }`}
              >
                {event.isOptimizer && (
                  <div className="mb-1 font-mono text-[0.5rem] uppercase tracking-widest text-amber-400">
                    Optimizer
                  </div>
                )}
                <p className="font-[Space_Grotesk] text-[0.75rem] leading-relaxed text-slate-200">
                  {event.depths[mode]}
                </p>
                <div className="mt-1.5 font-mono text-[0.5rem] text-slate-600">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </div>
              </motion.div>
            ))}
        </AnimatePresence>

        {events.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-2 text-2xl opacity-30">B</div>
            <p className="font-mono text-[0.6rem] text-slate-600">
              Bernard is watching. Add a tranche to begin.
            </p>
          </div>
        )}
      </div>

      {/* Mode Description */}
      <div className="mt-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
        <p className="font-mono text-[0.55rem] text-slate-500">
          {mode === "expert" && "Headlines only. You know what you're doing."}
          {mode === "standard" && "Key implications surfaced. Expands on complex moves."}
          {mode === "educational" && "Full cause-and-effect chains. Every decision explained."}
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend-v2/src/components/bond-desk/BernardNarrator.tsx
git commit -m "feat: add BernardNarrator — inline narration cards with mode toggle"
```

---

## Task 6: DealPulseTicker — Market Band

**Files:**
- Create: `frontend-v2/src/components/bond-desk/DealPulseTicker.tsx`

The animated band at the top of Bond Desk: market vitals (left), deal impact stream (center), issuance window gauge (right).

- [ ] **Step 1: Create the component**

```typescript
// frontend-v2/src/components/bond-desk/DealPulseTicker.tsx
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDealState, type MarketSnapshot } from "@/contexts/DealStateContext";
import { useBernard } from "@/contexts/BernardContext";
import { trpc } from "@/lib/trpc";

interface ImpactLine {
  id: string;
  text: string;
  severity: "favorable" | "watch" | "action";
}

const SEVERITY_COLORS = {
  favorable: "text-emerald-400",
  watch: "text-amber-400",
  action: "text-rose-400",
};

export default function DealPulseTicker() {
  const { state, setMarket } = useDealState();
  const bernard = useBernard();
  const [impactLines, setImpactLines] = useState<ImpactLine[]>([]);
  const [visibleLine, setVisibleLine] = useState(0);
  const prevRatesRef = useRef(state.marketSnapshot.treasury_10yr);

  // Fetch live market rates every 15s
  const marketQuery = trpc.powerstrip.marketRates.useQuery(undefined, {
    refetchInterval: 15_000,
    staleTime: 10_000,
  });

  // When market data arrives, update context and compute deal impact
  const dealImpactMutation = trpc.bondStructuring.dealImpact.useMutation();

  useEffect(() => {
    if (!marketQuery.data) return;
    const raw = marketQuery.data as Record<string, any>;
    const newSnapshot: MarketSnapshot = {
      treasury_10yr: raw.treasury_10yr_pct ?? raw.treasury_10yr ?? 4.28,
      treasury_5yr: raw.treasury_5yr_pct ?? raw.treasury_5yr ?? 4.05,
      sofr: raw.sofr_pct ?? raw.sofr ?? 5.33,
      ig_spread_bps: (raw.ig_spread ?? 1.12) * 100,
      vix: raw.vix ?? 18.5,
      updated_at: raw.timestamp ?? new Date().toISOString(),
      prev_treasury_10yr: prevRatesRef.current,
    };
    prevRatesRef.current = newSnapshot.treasury_10yr;
    setMarket(newSnapshot);

    // Compute deal impact if we have an active deal with tranches
    if (state.metrics && state.activeDeal) {
      const delta = Math.round((newSnapshot.treasury_10yr - newSnapshot.prev_treasury_10yr) * 100);
      if (delta !== 0) {
        dealImpactMutation.mutate({
          rate_delta_bps: delta,
          current_stack: {
            blended_coupon_pct: state.metrics.blended_coupon_pct,
            total_debt_usd: state.metrics.total_debt_usd,
          },
          deal: {
            stabilized_noi_usd: state.activeDeal.stabilized_noi_usd,
          },
        }, {
          onSuccess: (data: any) => {
            setImpactLines((prev) => [{
              id: crypto.randomUUID(),
              text: data.impact_text,
              severity: data.severity,
            }, ...prev].slice(0, 20));
          },
        });
      }
    }
  }, [marketQuery.data]);

  // Rotate visible impact line every 4s
  useEffect(() => {
    if (impactLines.length <= 1) return;
    const interval = setInterval(() => {
      setVisibleLine((v) => (v + 1) % impactLines.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [impactLines.length]);

  const mkt = state.marketSnapshot;
  const delta10yr = Math.round((mkt.treasury_10yr - mkt.prev_treasury_10yr) * 100);
  const win = state.issuanceWindow;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-r from-[#040a12] via-[#06101c] to-[#040a12] px-6 py-4">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-cyan-500/[0.03] via-transparent to-amber-500/[0.03]" />

      <div className="relative grid grid-cols-12 gap-4">
        {/* LEFT — Market Vitals (3 cols) */}
        <div className="col-span-3 flex flex-col gap-1.5">
          <div className="mb-1 font-mono text-[0.5rem] uppercase tracking-[0.15em] text-slate-600">
            Market Vitals
          </div>
          <RateChip label="10yr" value={mkt.treasury_10yr} delta={delta10yr} suffix="%" />
          <RateChip label="SOFR" value={mkt.sofr} suffix="%" />
          <RateChip label="IG Spd" value={mkt.ig_spread_bps} suffix="bp" />
          <RateChip label="VIX" value={mkt.vix} />
        </div>

        {/* CENTER — Deal Impact Stream (6 cols) */}
        <div className="col-span-6 flex flex-col items-center justify-center">
          <div className="mb-1 font-mono text-[0.5rem] uppercase tracking-[0.15em] text-slate-600">
            Deal Impact
          </div>
          <div className="relative h-8 w-full overflow-hidden">
            <AnimatePresence mode="wait">
              {impactLines.length > 0 ? (
                <motion.div
                  key={impactLines[visibleLine]?.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className={`absolute inset-0 flex items-center justify-center font-mono text-[0.7rem] ${
                    SEVERITY_COLORS[impactLines[visibleLine]?.severity ?? "watch"]
                  }`}
                >
                  {impactLines[visibleLine]?.text}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex h-full items-center justify-center font-mono text-[0.65rem] text-slate-600"
                >
                  {state.activeDeal
                    ? "Monitoring deal impact..."
                    : "Set up a deal to see live market impact"}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {impactLines.length > 1 && (
            <div className="mt-1 flex gap-1">
              {impactLines.slice(0, 5).map((_, i) => (
                <div
                  key={i}
                  className={`h-1 w-1 rounded-full transition-all ${
                    i === visibleLine ? "bg-cyan-400" : "bg-slate-700"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — Issuance Window (3 cols) */}
        <div className="col-span-3 flex flex-col items-end gap-1">
          <div className="mb-1 font-mono text-[0.5rem] uppercase tracking-[0.15em] text-slate-600">
            Issuance Window
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${
                win.status === "open"
                  ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                  : win.status === "narrowing"
                    ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)] animate-pulse"
                    : "bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
              }`}
            />
            <span className="font-mono text-sm font-semibold text-slate-200 uppercase">
              {win.status}
            </span>
          </div>
          <span className="font-mono text-[0.6rem] text-slate-500">
            {win.hours_remaining}hr window · {Math.round(win.confidence * 100)}% conf
          </span>
          <span className="font-[Space_Grotesk] text-[0.6rem] text-slate-400 italic">
            {win.summary}
          </span>
        </div>
      </div>
    </div>
  );
}

function RateChip({ label, value, delta, suffix = "" }: {
  label: string;
  value: number;
  delta?: number;
  suffix?: string;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="font-mono text-[0.55rem] uppercase tracking-wider text-slate-600">
        {label}
      </span>
      <div className="flex items-baseline gap-1.5">
        <span className="font-mono text-[0.75rem] font-semibold text-[#C4A048]">
          {typeof value === "number" ? value.toFixed(2) : value}{suffix}
        </span>
        {delta !== undefined && delta !== 0 && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`font-mono text-[0.55rem] ${delta > 0 ? "text-rose-400" : "text-emerald-400"}`}
          >
            {delta > 0 ? "+" : ""}{delta}bp
          </motion.span>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend-v2/src/components/bond-desk/DealPulseTicker.tsx
git commit -m "feat: add DealPulseTicker — market vitals, deal impact stream, issuance window"
```

---

## Task 7: BondStructuringEngine — The Core Tool

**Files:**
- Create: `frontend-v2/src/components/bond-desk/BondStructuringEngine.tsx`

Three-column layout: tranche builder (left), capital stack visualization (center), Bernard narrator (right). This is the largest component and the heart of the demo.

- [ ] **Step 1: Create the component**

```typescript
// frontend-v2/src/components/bond-desk/BondStructuringEngine.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useDealState, type Tranche, type Deal } from "@/contexts/DealStateContext";
import { useBernard } from "@/contexts/BernardContext";
import { trpc } from "@/lib/trpc";
import BernardNarrator from "./BernardNarrator";

const SERIES_COLORS: Record<string, string> = {
  A: "#C4A048",   // NEST gold
  B: "#22d3ee",   // cyan
  C: "#f59e0b",   // amber
  SUB: "#ef4444", // red
};

const GRADE_COLORS: Record<string, string> = {
  A: "text-emerald-400",
  "BBB+": "text-emerald-300",
  BBB: "text-cyan-400",
  "BBB-": "text-cyan-300",
  "BB+": "text-amber-400",
  BB: "text-amber-300",
  "Sub-IG": "text-rose-400",
};

export default function BondStructuringEngine() {
  const { state, setDeal, addTranche, removeTranche, setMetrics, log } = useDealState();
  const bernard = useBernard();
  const structureMutation = trpc.bondStructuring.structure.useMutation();

  // ── Deal Input Form ───────────────────────────────────────────
  const [dealForm, setDealForm] = useState({
    name: "", sponsor: "", total_project_cost_usd: "",
    stabilized_noi_usd: "", use_of_proceeds: "", sector: "office",
  });

  // ── Tranche Form ──────────────────────────────────────────────
  const [trancheForm, setTrancheForm] = useState({
    series: "A" as Tranche["series"],
    label: "Series A Senior",
    size_usd: "",
    coupon_pct: "7.0",
    spread_bps: "85",
    maturity_yrs: "10",
    ltc_pct: "75",
  });
  const [showTrancheForm, setShowTrancheForm] = useState(false);

  // ── Active stress scenario ────────────────────────────────────
  const [activeStress, setActiveStress] = useState<string>("base");

  // Set deal on form completion
  const handleSetDeal = () => {
    const tpc = parseFloat(dealForm.total_project_cost_usd) || 0;
    const noi = parseFloat(dealForm.stabilized_noi_usd) || 0;
    if (tpc <= 0) return;
    const deal: Deal = {
      id: crypto.randomUUID(),
      name: dealForm.name || "New Deal",
      sponsor: dealForm.sponsor || "TBD",
      total_project_cost_usd: tpc,
      stabilized_noi_usd: noi,
      appraised_value_usd: tpc * 1.2,
      use_of_proceeds: dealForm.use_of_proceeds || "Construction",
      sector: dealForm.sector,
      phase: "structuring",
    };
    setDeal(deal);
    log("NEST", "deal_created", `${deal.name} — $${(tpc/1e6).toFixed(1)}M`);
    bernard.push({
      type: "deal_created",
      depths: {
        expert: `Deal set: $${(tpc/1e6).toFixed(0)}M TPC, $${(noi/1e6).toFixed(1)}M NOI.`,
        standard: `New deal "${deal.name}" initialized. $${(tpc/1e6).toFixed(0)}M project with $${(noi/1e6).toFixed(1)}M stabilized NOI. Add tranches to begin structuring.`,
        educational: `You've created a deal for "${deal.name}" with $${(tpc/1e6).toFixed(0)}M total project cost and $${(noi/1e6).toFixed(1)}M in stabilized NOI. NOI is the property's net operating income — the annual profit before debt service. This number determines how much debt the project can support. Now add tranches to build your capital stack.`,
      },
    });
  };

  // Add tranche
  const handleAddTranche = () => {
    const size = parseFloat(trancheForm.size_usd) || 0;
    if (size <= 0) return;
    const tranche: Tranche = {
      id: crypto.randomUUID(),
      series: trancheForm.series,
      label: trancheForm.label,
      size_usd: size,
      coupon_pct: parseFloat(trancheForm.coupon_pct) || 7.0,
      spread_bps: parseFloat(trancheForm.spread_bps) || 85,
      maturity_yrs: parseFloat(trancheForm.maturity_yrs) || 10,
      ltc_pct: parseFloat(trancheForm.ltc_pct) || 75,
    };
    addTranche(tranche);
    log("NEST", "tranche_added", `${tranche.label} — $${(size/1e6).toFixed(1)}M at ${tranche.coupon_pct}%`);
    setShowTrancheForm(false);
    // Reset form
    setTrancheForm({ series: "B", label: "Series B Mezzanine", size_usd: "", coupon_pct: "11.0", spread_bps: "145", maturity_yrs: "7", ltc_pct: "7" });
  };

  // Recompute structure whenever tranches change
  useEffect(() => {
    if (!state.activeDeal || state.tranches.length === 0) return;
    structureMutation.mutate({
      deal: {
        total_project_cost_usd: state.activeDeal.total_project_cost_usd,
        stabilized_noi_usd: state.activeDeal.stabilized_noi_usd,
        appraised_value_usd: state.activeDeal.appraised_value_usd,
      },
      tranches: state.tranches.map((t) => ({
        series: t.series,
        size_usd: t.size_usd,
        coupon_pct: t.coupon_pct,
        spread_bps: t.spread_bps,
      })),
    }, {
      onSuccess: (data: any) => {
        setMetrics(data.metrics, data.stress);
        // Push Bernard narration from backend
        if (data.bernard) {
          bernard.push({
            type: "structure_updated",
            depths: data.bernard,
            data: data.metrics,
          });
        }
      },
    });
  }, [state.tranches]);

  const m = state.metrics;
  const totalStackHeight = state.tranches.reduce((s, t) => s + t.size_usd, 0);

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* ── LEFT: Deal Input + Tranche Builder (4 cols) ────────── */}
      <div className="col-span-4 space-y-4">
        {/* Deal Setup */}
        {!state.activeDeal ? (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
            <h3 className="mb-3 font-[Cormorant_Garamond] text-lg font-semibold text-slate-200">
              Deal Setup
            </h3>
            <div className="space-y-2.5">
              <Input label="Project Name" value={dealForm.name} onChange={(v) => setDealForm({...dealForm, name: v})} placeholder="Jacaranda Trace" />
              <Input label="Sponsor" value={dealForm.sponsor} onChange={(v) => setDealForm({...dealForm, sponsor: v})} placeholder="Soparrow Capital" />
              <Input label="Total Project Cost ($)" value={dealForm.total_project_cost_usd} onChange={(v) => setDealForm({...dealForm, total_project_cost_usd: v})} placeholder="200000000" type="number" />
              <Input label="Stabilized NOI ($)" value={dealForm.stabilized_noi_usd} onChange={(v) => setDealForm({...dealForm, stabilized_noi_usd: v})} placeholder="16000000" type="number" />
              <Input label="Use of Proceeds" value={dealForm.use_of_proceeds} onChange={(v) => setDealForm({...dealForm, use_of_proceeds: v})} placeholder="Ground-up construction" />
              <select
                value={dealForm.sector}
                onChange={(e) => setDealForm({...dealForm, sector: e.target.value})}
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 font-mono text-xs text-slate-200"
              >
                <option value="office">Office</option>
                <option value="multifamily">Multifamily</option>
                <option value="industrial">Industrial</option>
                <option value="retail">Retail</option>
                <option value="healthcare">Healthcare</option>
                <option value="hospitality">Hospitality</option>
                <option value="mixed_use">Mixed Use</option>
              </select>
              <button
                onClick={handleSetDeal}
                className="w-full rounded-xl bg-gradient-to-r from-[#C4A048] to-[#E8C87A] px-4 py-2.5 font-[Space_Grotesk] text-sm font-semibold text-[#030A06] transition-all hover:shadow-[0_0_20px_rgba(196,160,72,0.3)]"
              >
                Initialize Deal
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-[Cormorant_Garamond] text-lg font-semibold text-slate-200">
                {state.activeDeal.name}
              </h3>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 font-mono text-[0.55rem] text-emerald-400">
                STRUCTURING
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono text-[0.65rem]">
              <div className="text-slate-500">TPC</div>
              <div className="text-right text-[#C4A048]">${(state.activeDeal.total_project_cost_usd/1e6).toFixed(0)}M</div>
              <div className="text-slate-500">NOI</div>
              <div className="text-right text-[#C4A048]">${(state.activeDeal.stabilized_noi_usd/1e6).toFixed(1)}M</div>
              <div className="text-slate-500">Sector</div>
              <div className="text-right text-slate-300 capitalize">{state.activeDeal.sector}</div>
            </div>
          </div>
        )}

        {/* Tranche List */}
        {state.activeDeal && (
          <div className="space-y-2">
            {state.tranches.map((t) => (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="group rounded-xl border border-white/[0.08] bg-white/[0.02] p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-6 w-6 rounded-md flex items-center justify-center font-mono text-[0.6rem] font-bold text-[#030A06]"
                      style={{ backgroundColor: SERIES_COLORS[t.series] ?? "#666" }}
                    >
                      {t.series}
                    </div>
                    <span className="font-[Space_Grotesk] text-sm text-slate-200">{t.label}</span>
                  </div>
                  <button
                    onClick={() => {
                      removeTranche(t.id);
                      log("NEST", "tranche_removed", t.label);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-400 transition-all text-xs"
                  >
                    x
                  </button>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 font-mono text-[0.6rem]">
                  <div><span className="text-slate-600">Size</span><br/><span className="text-[#C4A048]">${(t.size_usd/1e6).toFixed(0)}M</span></div>
                  <div><span className="text-slate-600">Coupon</span><br/><span className="text-slate-200">{t.coupon_pct}%</span></div>
                  <div><span className="text-slate-600">Spread</span><br/><span className="text-slate-200">{t.spread_bps}bp</span></div>
                </div>
              </motion.div>
            ))}

            {/* Add Tranche Button / Form */}
            {!showTrancheForm ? (
              <button
                onClick={() => setShowTrancheForm(true)}
                className="w-full rounded-xl border border-dashed border-white/10 py-3 font-mono text-xs text-slate-500 hover:border-[#C4A048]/30 hover:text-[#C4A048] transition-all"
              >
                + Add Tranche
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="rounded-xl border border-[#C4A048]/20 bg-[#C4A048]/[0.04] p-3 space-y-2"
              >
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={trancheForm.series}
                    onChange={(e) => {
                      const s = e.target.value as Tranche["series"];
                      const labels: Record<string, string> = { A: "Series A Senior", B: "Series B Mezzanine", C: "Series C Junior", SUB: "Subordinate/Equity" };
                      const coupons: Record<string, string> = { A: "7.0", B: "11.0", C: "14.0", SUB: "18.0" };
                      const spreads: Record<string, string> = { A: "85", B: "145", C: "225", SUB: "400" };
                      setTrancheForm({...trancheForm, series: s, label: labels[s] ?? s, coupon_pct: coupons[s] ?? "7.0", spread_bps: spreads[s] ?? "85"});
                    }}
                    className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 font-mono text-xs text-slate-200"
                  >
                    <option value="A">Series A</option>
                    <option value="B">Series B</option>
                    <option value="C">Series C</option>
                    <option value="SUB">Subordinate</option>
                  </select>
                  <Input label="" value={trancheForm.size_usd} onChange={(v) => setTrancheForm({...trancheForm, size_usd: v})} placeholder="Size ($)" type="number" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Input label="Coupon %" value={trancheForm.coupon_pct} onChange={(v) => setTrancheForm({...trancheForm, coupon_pct: v})} type="number" />
                  <Input label="Spread bp" value={trancheForm.spread_bps} onChange={(v) => setTrancheForm({...trancheForm, spread_bps: v})} type="number" />
                  <Input label="Maturity yr" value={trancheForm.maturity_yrs} onChange={(v) => setTrancheForm({...trancheForm, maturity_yrs: v})} type="number" />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleAddTranche} className="flex-1 rounded-lg bg-[#C4A048] px-3 py-1.5 font-mono text-xs font-semibold text-[#030A06]">Add</button>
                  <button onClick={() => setShowTrancheForm(false)} className="rounded-lg border border-white/10 px-3 py-1.5 font-mono text-xs text-slate-500">Cancel</button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* ── CENTER: Capital Stack Viz + Metrics (5 cols) ──────── */}
      <div className="col-span-5 space-y-4">
        {m ? (
          <>
            {/* Capital Stack Bar */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
              <h3 className="mb-3 font-[Cormorant_Garamond] text-base font-semibold text-slate-200">
                Capital Stack
              </h3>
              <div className="flex h-48 items-end gap-1">
                {state.tranches.map((t) => {
                  const pct = totalStackHeight > 0 ? (t.size_usd / totalStackHeight) * 100 : 0;
                  return (
                    <motion.div
                      key={t.id}
                      layout
                      initial={{ height: 0 }}
                      animate={{ height: `${pct}%` }}
                      transition={{ type: "spring", damping: 20 }}
                      className="group relative flex-1 rounded-t-lg cursor-pointer"
                      style={{ backgroundColor: SERIES_COLORS[t.series] ?? "#666", minHeight: 20 }}
                    >
                      <div className="absolute inset-x-0 bottom-2 text-center font-mono text-[0.55rem] font-bold text-[#030A06]">
                        {t.series}
                      </div>
                      {/* Tooltip */}
                      <div className="absolute -top-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10 rounded-lg bg-black/90 px-3 py-2 font-mono text-[0.6rem] text-slate-200 whitespace-nowrap border border-white/10">
                        {t.label}: ${(t.size_usd/1e6).toFixed(0)}M · {t.coupon_pct}% · {t.spread_bps}bp
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-2">
              <MetricCard label="Total Debt" value={`$${(m.total_debt_usd/1e6).toFixed(0)}M`} />
              <MetricCard label="CLTV" value={`${m.cltv_pct.toFixed(1)}%`} alert={m.ltv_alert} />
              <MetricCard label="Blended Coupon" value={`${m.blended_coupon_pct.toFixed(2)}%`} />
              <MetricCard label="DSCR" value={`${m.dscr.toFixed(2)}x`} grade={m.dscr >= 2.0 ? "A" : m.dscr >= 1.5 ? "BBB" : "Sub-IG"} />
              <MetricCard label="ICR" value={`${m.icr.toFixed(2)}x`} />
              <MetricCard label="Grade" value={m.obligor_grade} className={GRADE_COLORS[m.obligor_grade] ?? "text-slate-300"} />
            </div>

            {/* Stress Test Strip */}
            {state.stress && (
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                <h4 className="mb-2 font-mono text-[0.6rem] uppercase tracking-wider text-slate-500">Stress Scenarios</h4>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(state.stress).map(([name, s]: [string, any]) => (
                    <button
                      key={name}
                      onClick={() => setActiveStress(name)}
                      className={`rounded-lg border p-2 text-left transition-all ${
                        activeStress === name
                          ? "border-cyan-500/40 bg-cyan-500/10"
                          : "border-white/5 bg-white/[0.02] hover:border-white/10"
                      }`}
                    >
                      <div className="font-mono text-[0.55rem] text-slate-400 capitalize">{name}</div>
                      <div className={`font-mono text-sm font-semibold ${
                        s.status === "green" ? "text-emerald-400" :
                        s.status === "yellow" ? "text-amber-400" :
                        s.status === "red" ? "text-rose-400" : "text-rose-600"
                      }`}>
                        {s.dscr.toFixed(2)}x
                      </div>
                      <div className="font-mono text-[0.5rem] text-slate-600">{s.outcome}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-white/[0.06] bg-white/[0.01]">
            <p className="font-mono text-sm text-slate-600">
              {state.activeDeal ? "Add tranches to see the capital stack" : "Initialize a deal to begin"}
            </p>
          </div>
        )}
      </div>

      {/* ── RIGHT: Bernard Narrator (3 cols) ─────────────────── */}
      <div className="col-span-3">
        <div className="sticky top-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 h-[calc(100vh-8rem)] overflow-hidden">
          <BernardNarrator />
        </div>
      </div>
    </div>
  );
}

// ── Shared sub-components ────────────────────────────────────────

function Input({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      {label && <label className="mb-0.5 block font-mono text-[0.55rem] uppercase tracking-wider text-slate-600">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-xs text-slate-200 placeholder:text-slate-700 focus:border-[#C4A048]/40 focus:outline-none"
      />
    </div>
  );
}

function MetricCard({ label, value, grade, alert, className }: {
  label: string; value: string; grade?: string; alert?: boolean; className?: string;
}) {
  return (
    <div className={`rounded-xl border p-3 ${alert ? "border-rose-500/30 bg-rose-500/[0.06]" : "border-white/[0.06] bg-white/[0.02]"}`}>
      <div className="font-mono text-[0.55rem] uppercase tracking-wider text-slate-600">{label}</div>
      <div className={`font-mono text-lg font-semibold ${className ?? "text-[#C4A048]"}`}>
        {value}
      </div>
      {grade && (
        <div className={`font-mono text-[0.5rem] ${GRADE_COLORS[grade] ?? "text-slate-400"}`}>{grade}</div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend-v2/src/components/bond-desk/BondStructuringEngine.tsx
git commit -m "feat: add BondStructuringEngine — tranche builder, capital stack viz, stress test, Bernard narration"
```

---

## Task 8: CMBSStackingDesk — Pool Builder

**Files:**
- Create: `frontend-v2/src/components/bond-desk/CMBSStackingDesk.tsx`

Pool builder with waterfall visualization and leverage slider.

- [ ] **Step 1: Create the component**

```typescript
// frontend-v2/src/components/bond-desk/CMBSStackingDesk.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { useDealState, type PoolDeal } from "@/contexts/DealStateContext";
import { useBernard } from "@/contexts/BernardContext";
import { trpc } from "@/lib/trpc";

const CLASS_COLORS: Record<string, string> = {
  senior: "#C4A048",
  mezzanine: "#22d3ee",
  subordinate: "#f59e0b",
  equity: "#ef4444",
};

export default function CMBSStackingDesk() {
  const { state, addToPool, removeFromPool, log } = useDealState();
  const bernard = useBernard();
  const poolMutation = trpc.bondStructuring.poolAnalysis.useMutation();
  const [subordination, setSubordination] = useState(18);

  // Available deals = deals with metrics that are NOT already in the pool
  // For demo, we'll show any deal that's been structured in this session
  const poolDealIds = new Set(state.cmbsPool.map((p) => p.deal.id));

  const handleAddToPool = () => {
    if (!state.activeDeal || !state.metrics || state.tranches.length === 0) return;
    if (poolDealIds.has(state.activeDeal.id)) return;

    const poolDeal: PoolDeal = {
      deal: state.activeDeal,
      tranches: [...state.tranches],
      metrics: { ...state.metrics },
    };
    addToPool(poolDeal);
    log("NEST", "pool_add", `${state.activeDeal.name} added to CMBS pool`);

    // Trigger pool analysis
    const allDeals = [...state.cmbsPool, poolDeal].map((p) => ({
      total_debt_usd: p.metrics.total_debt_usd,
      blended_coupon_pct: p.metrics.blended_coupon_pct,
      stabilized_noi_usd: p.deal.stabilized_noi_usd,
      sector: p.deal.sector,
      weighted_avg_life_yrs: 10,
      tranches: p.tranches.map((t) => ({ series: t.series, size_usd: t.size_usd })),
    }));
    poolMutation.mutate({ deals: allDeals }, {
      onSuccess: (data: any) => {
        const pm = data.pool_metrics;
        bernard.push({
          type: "pool_updated",
          depths: {
            expert: `Pool: ${pm.deal_count} deals, $${(pm.total_commitment_usd/1e6).toFixed(0)}M, ${pm.wac_pct.toFixed(2)}% WAC, ${pm.pool_dscr.toFixed(2)}x DSCR.`,
            standard: `Added ${state.activeDeal!.name} to pool. ${pm.deal_count} deals totaling $${(pm.total_commitment_usd/1e6).toFixed(0)}M. Diversification score: ${pm.diversification_score}/100. Pool DSCR: ${pm.pool_dscr.toFixed(2)}x.`,
            educational: `Adding ${state.activeDeal!.name} brings the CMBS pool to ${pm.deal_count} deals with $${(pm.total_commitment_usd/1e6).toFixed(0)}M total commitment. The weighted average coupon (WAC) is ${pm.wac_pct.toFixed(2)}% — this is what investors receive on average. Diversification score of ${pm.diversification_score}/100 reflects how spread out the pool is across sectors and deals. Higher diversification generally means lower risk and better ratings. Pool DSCR of ${pm.pool_dscr.toFixed(2)}x ${pm.pool_dscr >= 1.5 ? 'is investment grade.' : 'needs improvement.'}`,
          },
        });
      },
    });
  };

  const handleRemoveFromPool = (dealId: string) => {
    const deal = state.cmbsPool.find((p) => p.deal.id === dealId);
    removeFromPool(dealId);
    if (deal) {
      log("NEST", "pool_remove", `${deal.deal.name} removed from CMBS pool`);
    }
  };

  const poolMetrics = poolMutation.data as any;
  const totalPool = state.cmbsPool.reduce((s, p) => s + p.metrics.total_debt_usd, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-[Cormorant_Garamond] text-xl font-semibold text-slate-200">
            CMBS Stacking Desk
          </h2>
          <p className="font-mono text-[0.6rem] text-slate-500">
            Pool structured deals into a CMBS offering
          </p>
        </div>
        {totalPool > 0 && (
          <div className="rounded-xl border border-[#C4A048]/20 bg-[#C4A048]/10 px-4 py-2">
            <div className="font-mono text-[0.55rem] text-[#C4A048]/60">Pool Commitment</div>
            <div className="font-mono text-lg font-semibold text-[#C4A048]">
              ${(totalPool / 1e6).toFixed(0)}M
            </div>
          </div>
        )}
      </div>

      {/* Pool Builder Row */}
      <div className="grid grid-cols-12 gap-4">
        {/* Current Deal → Add to Pool */}
        <div className="col-span-4">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
            <h4 className="mb-2 font-mono text-[0.6rem] uppercase tracking-wider text-slate-500">
              Active Deal
            </h4>
            {state.activeDeal && state.metrics ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="font-[Space_Grotesk] text-sm text-slate-200">{state.activeDeal.name}</div>
                  <div className="mt-1 grid grid-cols-2 gap-1 font-mono text-[0.6rem]">
                    <span className="text-slate-500">Debt</span>
                    <span className="text-right text-[#C4A048]">${(state.metrics.total_debt_usd/1e6).toFixed(0)}M</span>
                    <span className="text-slate-500">Grade</span>
                    <span className="text-right text-slate-200">{state.metrics.obligor_grade}</span>
                    <span className="text-slate-500">DSCR</span>
                    <span className="text-right text-slate-200">{state.metrics.dscr.toFixed(2)}x</span>
                  </div>
                </div>
                <button
                  onClick={handleAddToPool}
                  disabled={poolDealIds.has(state.activeDeal.id)}
                  className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 px-4 py-2 font-mono text-xs font-semibold text-[#030A06] disabled:opacity-30 transition-all hover:shadow-[0_0_16px_rgba(34,211,238,0.3)]"
                >
                  {poolDealIds.has(state.activeDeal.id) ? "Already in Pool" : "Add to CMBS Pool"}
                </button>
              </div>
            ) : (
              <p className="font-mono text-[0.65rem] text-slate-600">
                Structure a deal above to add it to the pool
              </p>
            )}
          </div>
        </div>

        {/* Pool Deals */}
        <div className="col-span-8">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
            <h4 className="mb-2 font-mono text-[0.6rem] uppercase tracking-wider text-slate-500">
              CMBS Pool ({state.cmbsPool.length} deals)
            </h4>
            {state.cmbsPool.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {state.cmbsPool.map((p) => (
                  <motion.div
                    key={p.deal.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="group rounded-xl border border-cyan-500/20 bg-cyan-500/[0.04] p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-[Space_Grotesk] text-sm text-slate-200">{p.deal.name}</span>
                      <button
                        onClick={() => handleRemoveFromPool(p.deal.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-400 text-xs transition-all"
                      >
                        x
                      </button>
                    </div>
                    <div className="mt-1 flex gap-3 font-mono text-[0.55rem] text-slate-400">
                      <span>${(p.metrics.total_debt_usd/1e6).toFixed(0)}M</span>
                      <span>{p.metrics.obligor_grade}</span>
                      <span>{p.metrics.dscr.toFixed(2)}x</span>
                      <span className="capitalize">{p.deal.sector}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-white/[0.06]">
                <p className="font-mono text-[0.65rem] text-slate-600">No deals in pool yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Waterfall + Pool Economics */}
      {poolMetrics && state.cmbsPool.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {/* Tranche Waterfall */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
            <h4 className="mb-3 font-mono text-[0.6rem] uppercase tracking-wider text-slate-500">
              Tranche Waterfall
            </h4>
            <div className="space-y-1.5">
              {Object.entries(poolMetrics.tranche_classes as Record<string, number>)
                .filter(([, v]) => v > 0)
                .map(([cls, amount]) => {
                  const pct = totalPool > 0 ? (amount / totalPool) * 100 : 0;
                  return (
                    <div key={cls} className="flex items-center gap-3">
                      <div className="w-20 font-mono text-[0.6rem] capitalize text-slate-400">{cls}</div>
                      <div className="flex-1 h-6 rounded-md bg-white/[0.04] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6 }}
                          className="h-full rounded-md"
                          style={{ backgroundColor: CLASS_COLORS[cls] ?? "#666" }}
                        />
                      </div>
                      <div className="w-16 text-right font-mono text-[0.6rem] text-[#C4A048]">
                        ${(amount/1e6).toFixed(0)}M
                      </div>
                      <div className="w-10 text-right font-mono text-[0.55rem] text-slate-500">
                        {pct.toFixed(0)}%
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Leverage Slider */}
            <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[0.55rem] uppercase tracking-wider text-slate-500">
                  Push Leverage
                </span>
                <span className="font-mono text-xs text-amber-400">{subordination}% sub</span>
              </div>
              <input
                type="range"
                min={5}
                max={30}
                value={subordination}
                onChange={(e) => setSubordination(parseInt(e.target.value))}
                className="mt-2 w-full accent-[#C4A048]"
              />
              <div className="mt-1 flex justify-between font-mono text-[0.5rem] text-slate-600">
                <span>Max Leverage (5%)</span>
                <span>Conservative (30%)</span>
              </div>
            </div>
          </div>

          {/* Pool Economics */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
            <h4 className="mb-3 font-mono text-[0.6rem] uppercase tracking-wider text-slate-500">
              Pool Economics
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <PoolStat label="Total Commitment" value={`$${(poolMetrics.pool_metrics.total_commitment_usd/1e6).toFixed(0)}M`} />
              <PoolStat label="Deals" value={poolMetrics.pool_metrics.deal_count} />
              <PoolStat label="WAC" value={`${poolMetrics.pool_metrics.wac_pct.toFixed(2)}%`} />
              <PoolStat label="WAL" value={`${poolMetrics.pool_metrics.wal_yrs.toFixed(1)} yrs`} />
              <PoolStat label="Pool DSCR" value={`${poolMetrics.pool_metrics.pool_dscr.toFixed(2)}x`} />
              <PoolStat label="Diversification" value={`${poolMetrics.pool_metrics.diversification_score}/100`} />
              <PoolStat label="Senior %" value={`${poolMetrics.pool_metrics.senior_pct.toFixed(0)}%`} />
              <PoolStat label="Subordination" value={`${poolMetrics.pool_metrics.subordination_pct.toFixed(0)}%`} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PoolStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
      <div className="font-mono text-[0.5rem] uppercase tracking-wider text-slate-600">{label}</div>
      <div className="font-mono text-sm font-semibold text-[#C4A048]">{value}</div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend-v2/src/components/bond-desk/CMBSStackingDesk.tsx
git commit -m "feat: add CMBSStackingDesk — pool builder, tranche waterfall, leverage slider"
```

---

## Task 9: BondDeskPage — Composition + App.tsx Wiring

**Files:**
- Create: `frontend-v2/src/components/bond-desk/BondDeskPage.tsx`
- Modify: `frontend-v2/src/App.tsx`

Compose all modules into the Bond Desk page and wire the route.

- [ ] **Step 1: Create the page component**

```typescript
// frontend-v2/src/components/bond-desk/BondDeskPage.tsx
import { DealStateProvider } from "@/contexts/DealStateContext";
import { BernardProvider } from "@/contexts/BernardContext";
import DealPulseTicker from "./DealPulseTicker";
import BondStructuringEngine from "./BondStructuringEngine";
import CMBSStackingDesk from "./CMBSStackingDesk";

export default function BondDeskPage() {
  return (
    <DealStateProvider>
      <BernardProvider defaultMode="standard">
        <main
          className="min-h-screen px-4 py-6 text-slate-100 sm:px-8"
          style={{
            background:
              "radial-gradient(circle at 12% 4%, rgba(34,211,238,0.12), transparent 28rem), " +
              "radial-gradient(circle at 84% 9%, rgba(196,160,72,0.10), transparent 25rem), " +
              "linear-gradient(135deg, #030A06 0%, #0D2218 50%, #030A06 100%)",
          }}
        >
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="font-[Cormorant_Garamond] text-3xl font-bold text-[#EDE8DC]">
                GENIE
              </h1>
              <p className="font-[Space_Grotesk] text-sm text-[#7A9A82]">
                Bond Arrangement Engine — Structure any debt vehicle
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[0.6rem] uppercase tracking-wider text-slate-500">
                Live Terminal
              </span>
            </div>
          </div>

          {/* Module 1: Deal Pulse Ticker */}
          <div className="mb-6">
            <DealPulseTicker />
          </div>

          {/* Module 2: Bond Structuring Engine */}
          <div className="mb-8">
            <BondStructuringEngine />
          </div>

          {/* Divider */}
          <div className="my-8 border-t border-white/[0.06]" />

          {/* Module 3: CMBS Stacking Desk */}
          <CMBSStackingDesk />
        </main>
      </BernardProvider>
    </DealStateProvider>
  );
}
```

- [ ] **Step 2: Update App.tsx to use the new Bond Desk page**

In `frontend-v2/src/App.tsx`, replace the existing `/bond-desk` route import and route definition.

Add import at the top:
```typescript
import BondDeskPage from "./components/bond-desk/BondDeskPage";
```

Replace the existing `/bond-desk` route line:
```typescript
// OLD:
<Route path={"/bond-desk"}>{() => <main className="min-h-screen bg-[#03060b] px-4 py-6 text-slate-100 sm:px-8"><BondArrangementEngine /></main>}</Route>

// NEW:
<Route path={"/bond-desk"} component={BondDeskPage} />
```

- [ ] **Step 3: Verify the frontend builds**

```bash
cd /c/Users/sgill/nest/frontend-v2
npm run build
```

Expected: no TypeScript errors, build completes.

- [ ] **Step 4: Start dev server and load the page**

```bash
cd /c/Users/sgill/nest/frontend-v2
npm run dev
```

Open `http://localhost:5173/bond-desk` (or whatever port Vite uses). Verify:
- GENIE header renders
- Deal Pulse Ticker shows market vitals with fallback data
- Deal Setup form appears
- Filling in deal form + adding a tranche triggers Bernard narration
- Capital stack visualization appears with colored bars
- Stress scenarios render below the stack
- CMBS section appears at bottom

- [ ] **Step 5: Commit**

```bash
git add frontend-v2/src/components/bond-desk/BondDeskPage.tsx frontend-v2/src/App.tsx
git commit -m "feat: add BondDeskPage composition + wire /bond-desk route to GENIE"
```

---

## Task 10: Integration Smoke Test

**Files:** None (testing only)

Verify the full loop: frontend → backend → response → UI update → Bernard narration.

- [ ] **Step 1: Start both servers**

```bash
# Terminal 1: Backend
cd /c/Users/sgill/nest/backend && python app.py

# Terminal 2: Frontend
cd /c/Users/sgill/nest/frontend-v2 && npm run dev
```

- [ ] **Step 2: Walk through the full workflow**

1. Navigate to `/bond-desk`
2. Fill in deal: "Jacaranda Trace", "Soparrow Capital", TPC $200M, NOI $16M, sector "mixed_use"
3. Click "Initialize Deal" — Bernard should narrate
4. Add tranche: Series A, $150M, 7% coupon, 85bp spread
5. Capital stack should appear with metrics (DSCR, CLTV, grade)
6. Bernard should narrate the structure
7. Add tranche: Series B, $25M, 11% coupon, 145bp spread
8. Stack updates, stress test appears
9. Toggle Bernard modes: Expert → Standard → Educational — cards should change content
10. Click "Add to CMBS Pool" — pool section should populate
11. Check ticker: market vitals should show (with fallback data if backend market route returns defaults)

- [ ] **Step 3: Fix any issues found**

Address TypeScript errors, API call failures, or rendering issues found during testing.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: GENIE Bond Desk v1 — complete demo-ready arrangement terminal"
```

---

## Summary

| Task | Component | What It Produces |
|------|-----------|-----------------|
| 1 | Backend endpoints | /structure, /deal-impact, /call-put-analysis, /pool-analysis |
| 2 | API + hooks | Frontend can call all new endpoints via trpc pattern |
| 3 | DealStateContext | Shared state spine with typed actions and reducer |
| 4 | BernardContext | Narration provider with 3-mode toggle |
| 5 | BernardNarrator | Inline card renderer with mode switch and optimizer toggle |
| 6 | DealPulseTicker | Market band with deal impact stream |
| 7 | BondStructuringEngine | Core structuring tool — tranche builder, stack viz, stress, Bernard |
| 8 | CMBSStackingDesk | Pool builder with waterfall and leverage slider |
| 9 | BondDeskPage + routing | Page composition and /bond-desk route |
| 10 | Smoke test | Full loop verification |

**Total new files:** 8
**Total modified files:** 4
**Estimated commits:** 10
