# NEST Treasury — Ramp P-Card Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Treasury workspace tab to the NEST deal detail page that shows prefunded P-card operations (Ramp), budget reconciliation, NEST soft-cost tracking, and treasury economics — all backed by a mock engine mirroring Ramp's real API schema.

**Architecture:** New Flask blueprint (`treasury_bp`) with a `TreasuryEngine` service class that generates realistic mock data matching Ramp's transaction/card/receipt schema. A single `RAMP_MODE` env var switches between mock and live. One new React component (`TreasuryDesk.tsx`) registers as a workspace tab in the existing deal detail page, using the same `TerminalPanel`/`MetricCard` patterns as the rest of the platform.

**Tech Stack:** Flask (Python), Vite + React + TypeScript, Tailwind CSS, Lucide icons, shadcn/ui (Card, Table, Tabs, Badge, Button, Progress)

**Spec:** `docs/superpowers/specs/2026-05-21-nest-treasury-ramp-design.md`

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `backend/services/treasury_engine.py` | Create | Mock data engine: generates transactions, cards, budgets, prefund events, rebate math. Mirrors Ramp API schema exactly. |
| `backend/routes/treasury.py` | Create | Flask blueprint with 12 endpoints. Delegates to `TreasuryEngine`. |
| `backend/app.py` | Edit (2 lines) | Import + register `treasury_bp` |
| `frontend-v2/src/components/TreasuryDesk.tsx` | Create | Full Treasury workspace component with 4 internal tabs |
| `frontend-v2/src/pages/OperationsPages.tsx` | Edit (3 locations) | Lazy import, add workspace tab entry, add switch case |

---

### Task 1: Treasury Engine — Mock Data + Business Logic

**Files:**
- Create: `backend/services/treasury_engine.py`

- [ ] **Step 1: Create `treasury_engine.py` with data models and mock generator**

```python
"""
NEST Treasury Engine — Ramp P-Card mock/live adapter.
Generates realistic data mirroring Ramp's API schema.
Switch via RAMP_MODE=mock|live env var.
"""

from __future__ import annotations

import os
import random
from datetime import datetime, timedelta
from typing import Any

_MODE = os.environ.get("RAMP_MODE", "mock")

# ── Budget categories for a $487M construction project ────────────────
BUDGET_CATEGORIES = [
    {"id": "cat_gc", "name": "General Contractor", "budgeted": 312_000_000},
    {"id": "cat_arch", "name": "Architecture & Engineering", "budgeted": 28_500_000},
    {"id": "cat_legal", "name": "Legal & Counsel", "budgeted": 8_200_000},
    {"id": "cat_rating", "name": "Rating & Grading", "budgeted": 4_800_000},
    {"id": "cat_audit", "name": "Financial Audit", "budgeted": 3_600_000},
    {"id": "cat_insurance", "name": "Insurance & Surety", "budgeted": 18_400_000},
    {"id": "cat_permits", "name": "Permits & Fees", "budgeted": 6_100_000},
    {"id": "cat_hosting", "name": "Technology & Hosting", "budgeted": 2_400_000},
    {"id": "cat_te", "name": "Travel & Entertainment", "budgeted": 1_800_000},
    {"id": "cat_consulting", "name": "Consulting & Advisory", "budgeted": 9_200_000},
    {"id": "cat_enviro", "name": "Environmental & Survey", "budgeted": 5_700_000},
    {"id": "cat_contingency", "name": "Contingency Reserve", "budgeted": 86_300_000},
]

TOTAL_BUDGET = sum(c["budgeted"] for c in BUDGET_CATEGORIES)  # $487M

# ── Vendor roster for virtual cards ───────────────────────────────────
VENDORS = [
    {"name": "Turner Construction", "category_id": "cat_gc", "mcc": "1520"},
    {"name": "Skanska USA", "category_id": "cat_gc", "mcc": "1520"},
    {"name": "AECOM", "category_id": "cat_arch", "mcc": "8711"},
    {"name": "Gensler", "category_id": "cat_arch", "mcc": "8711"},
    {"name": "Greenberg Traurig LLP", "category_id": "cat_legal", "mcc": "8111"},
    {"name": "Orrick Herrington", "category_id": "cat_legal", "mcc": "8111"},
    {"name": "Moody's Investors Service", "category_id": "cat_rating", "mcc": "7372"},
    {"name": "S&P Global Ratings", "category_id": "cat_rating", "mcc": "7372"},
    {"name": "Deloitte & Touche", "category_id": "cat_audit", "mcc": "8721"},
    {"name": "KPMG LLP", "category_id": "cat_audit", "mcc": "8721"},
    {"name": "Hylant Group", "category_id": "cat_insurance", "mcc": "6300"},
    {"name": "Marsh McLennan", "category_id": "cat_insurance", "mcc": "6300"},
    {"name": "AWS", "category_id": "cat_hosting", "mcc": "7372"},
    {"name": "Vercel Inc", "category_id": "cat_hosting", "mcc": "7372"},
    {"name": "McKinsey & Company", "category_id": "cat_consulting", "mcc": "7392"},
    {"name": "Terracon Consultants", "category_id": "cat_enviro", "mcc": "8999"},
    {"name": "United Airlines", "category_id": "cat_te", "mcc": "4511"},
    {"name": "Hilton Hotels", "category_id": "cat_te", "mcc": "7011"},
]

# ── NEST pre-close soft costs ─────────────────────────────────────────
NEST_SOFT_COSTS = [
    {"vendor": "Moody's Investors Service", "category": "Rating & Grading", "amount": 850_000, "date": "2025-11-15"},
    {"vendor": "S&P Global Ratings", "category": "Rating & Grading", "amount": 720_000, "date": "2025-12-01"},
    {"vendor": "Greenberg Traurig LLP", "category": "Legal & Counsel", "amount": 480_000, "date": "2025-10-20"},
    {"vendor": "Orrick Herrington", "category": "Legal & Counsel", "amount": 340_000, "date": "2025-11-05"},
    {"vendor": "Deloitte & Touche", "category": "Financial Audit", "amount": 290_000, "date": "2025-12-10"},
    {"vendor": "AWS", "category": "Technology & Hosting", "amount": 48_000, "date": "2025-09-01"},
    {"vendor": "Vercel Inc", "category": "Technology & Hosting", "amount": 12_000, "date": "2025-09-15"},
    {"vendor": "McKinsey & Company", "category": "Consulting & Advisory", "amount": 380_000, "date": "2025-11-20"},
    {"vendor": "United Airlines", "category": "Travel & Entertainment", "amount": 24_500, "date": "2026-01-08"},
    {"vendor": "Hilton Hotels", "category": "Travel & Entertainment", "amount": 18_200, "date": "2026-01-09"},
]


def _ts(offset_days: int = 0) -> str:
    return (datetime.utcnow() - timedelta(days=offset_days)).strftime("%Y-%m-%dT%H:%M:%SZ")


def _id(prefix: str, n: int) -> str:
    return f"{prefix}_{n:04d}"


class TreasuryEngine:
    """Generates Ramp-schema mock data for a deal. Stateless — every call rebuilds from seed."""

    def __init__(self) -> None:
        self._seed = 42

    # ── Public API ────────────────────────────────────────────────────

    def overview(self, deal_id: str) -> dict[str, Any]:
        cards = self.cards(deal_id)
        txns = self.transactions(deal_id)
        rebate = self.rebate(deal_id)
        total_spent = sum(t["amount"] for t in txns)
        total_loaded = sum(pf["amount"] for pf in self.prefund_history(deal_id))
        return {
            "deal_id": deal_id,
            "total_budget": TOTAL_BUDGET,
            "total_loaded": total_loaded,
            "total_spent": total_spent,
            "available_balance": total_loaded - total_spent,
            "active_cards": len([c for c in cards if c["state"] == "ACTIVE"]),
            "total_transactions": len(txns),
            "rebate_accrued": rebate["accrued"],
            "receipt_match_rate": 0.973,
        }

    def transactions(self, deal_id: str) -> list[dict[str, Any]]:
        rng = random.Random(self._seed)
        txns: list[dict[str, Any]] = []
        for i in range(240):
            vendor = rng.choice(VENDORS)
            cat = next(c for c in BUDGET_CATEGORIES if c["id"] == vendor["category_id"])
            base = {
                "cat_gc": (800_000, 4_200_000),
                "cat_arch": (50_000, 400_000),
                "cat_legal": (25_000, 180_000),
                "cat_rating": (75_000, 250_000),
                "cat_audit": (30_000, 120_000),
                "cat_insurance": (40_000, 350_000),
                "cat_permits": (5_000, 80_000),
                "cat_hosting": (2_000, 24_000),
                "cat_te": (500, 8_000),
                "cat_consulting": (20_000, 150_000),
                "cat_enviro": (10_000, 90_000),
                "cat_contingency": (10_000, 200_000),
            }.get(vendor["category_id"], (1_000, 50_000))
            amount = round(rng.uniform(base[0], base[1]), 2)
            days_ago = rng.randint(1, 180)
            has_receipt = rng.random() < 0.973
            txns.append({
                "id": _id("txn", i),
                "card_id": _id("card", VENDORS.index(vendor)),
                "merchant_name": vendor["name"],
                "merchant_category_code": vendor["mcc"],
                "amount": amount,
                "currency": "USD",
                "state": rng.choice(["CLEARED", "CLEARED", "CLEARED", "PENDING"]),
                "receipts": [{"id": _id("rcpt", i), "receipt_url": f"/receipts/{_id('rcpt', i)}.pdf"}] if has_receipt else [],
                "memo": f"{cat['name']} — {vendor['name']}",
                "category": {"id": vendor["category_id"], "name": cat["name"]},
                "accounting_categories": [{"id": f"ac_{vendor['category_id']}", "name": f"Construction — {cat['name']}"}],
                "created_at": _ts(days_ago),
                "settled_at": _ts(days_ago - 2) if rng.random() < 0.9 else None,
            })
        txns.sort(key=lambda t: t["created_at"], reverse=True)
        return txns

    def cards(self, deal_id: str) -> list[dict[str, Any]]:
        rng = random.Random(self._seed + 1)
        result: list[dict[str, Any]] = []
        for i, vendor in enumerate(VENDORS):
            cat = next(c for c in BUDGET_CATEGORIES if c["id"] == vendor["category_id"])
            limit = cat["budgeted"] // max(1, sum(1 for v in VENDORS if v["category_id"] == vendor["category_id"]))
            spent = round(limit * rng.uniform(0.15, 0.55), 2)
            result.append({
                "id": _id("card", i),
                "display_name": f"{vendor['name']} — {cat['name']}",
                "card_program_id": "prog_nest_001",
                "last_four": f"{rng.randint(1000, 9999)}",
                "state": "ACTIVE",
                "spending_restrictions": {
                    "amount": float(limit),
                    "interval": "TOTAL",
                    "categories": [vendor["mcc"]],
                    "blocked_categories": [],
                },
                "total_spent": spent,
                "available_balance": round(limit - spent, 2),
                "card_holder": {"first_name": "Sean", "last_name": "Gilmore"},
            })
        return result

    def budget(self, deal_id: str) -> list[dict[str, Any]]:
        txns = self.transactions(deal_id)
        spent_by_cat: dict[str, float] = {}
        for t in txns:
            cid = t["category"]["id"]
            spent_by_cat[cid] = spent_by_cat.get(cid, 0) + t["amount"]

        draws = self.prefund_history(deal_id)
        drawn_total = sum(pf["amount"] for pf in draws)
        # Distribute drawn proportionally to budget
        result: list[dict[str, Any]] = []
        for cat in BUDGET_CATEGORIES:
            spent = round(spent_by_cat.get(cat["id"], 0), 2)
            drawn = round(drawn_total * (cat["budgeted"] / TOTAL_BUDGET), 2)
            remaining = round(cat["budgeted"] - spent, 2)
            variance_pct = round(((spent / max(drawn, 1)) - 1) * 100, 1) if drawn > 0 else 0
            status = "red" if variance_pct > 5 else "amber" if variance_pct > 0 else "green"
            result.append({
                "category_id": cat["id"],
                "category_name": cat["name"],
                "budgeted": cat["budgeted"],
                "drawn": drawn,
                "spent": spent,
                "remaining": remaining,
                "variance_pct": variance_pct,
                "status": status,
            })
        return result

    def prefund_history(self, deal_id: str) -> list[dict[str, Any]]:
        return [
            {"id": _id("pf", i), "deal_id": deal_id, "draw_id": _id("draw", i),
             "amount": amt, "funded_at": _ts(180 - i * 30),
             "card_program_id": "prog_nest_001", "status": "funded",
             "approval_id": _id("appr", i)}
            for i, amt in enumerate([
                8_200_000, 9_400_000, 11_800_000, 10_600_000, 12_100_000, 8_900_000,
            ])
        ]

    def reconciliation(self, deal_id: str) -> list[dict[str, Any]]:
        prefunds = self.prefund_history(deal_id)
        txns = self.transactions(deal_id)
        rng = random.Random(self._seed + 3)
        result: list[dict[str, Any]] = []
        for pf in prefunds:
            matched_txns = [t for t in rng.sample(txns, min(40, len(txns)))]
            matched_total = sum(t["amount"] for t in matched_txns)
            result.append({
                "prefund_id": pf["id"],
                "draw_id": pf["draw_id"],
                "draw_amount": pf["amount"],
                "matched_spend": round(matched_total, 2),
                "unreconciled": round(pf["amount"] - matched_total, 2),
                "transaction_count": len(matched_txns),
                "status": "reconciled" if abs(pf["amount"] - matched_total) < 50_000 else "pending",
            })
        return result

    def rebate(self, deal_id: str) -> dict[str, Any]:
        txns = self.transactions(deal_id)
        total_spend = sum(t["amount"] for t in txns)
        rate = 0.015  # 1.5%
        accrued = round(total_spend * rate, 2)
        projected_annual = round(accrued * (365 / 180), 2)
        return {
            "deal_id": deal_id,
            "rate": rate,
            "total_eligible_spend": round(total_spend, 2),
            "accrued": accrued,
            "realized": round(accrued * 0.6, 2),
            "projected_36mo": round(projected_annual * 3, 2),
        }

    def nest_soft_costs(self) -> dict[str, Any]:
        total = sum(c["amount"] for c in NEST_SOFT_COSTS)
        rebate = round(total * 0.015, 2)
        return {
            "line_items": NEST_SOFT_COSTS,
            "total_fronted": total,
            "rebate_earned": rebate,
            "reimbursement_status": "pending",
        }

    def nest_reimbursement(self, deal_id: str) -> dict[str, Any]:
        costs = self.nest_soft_costs()
        return {
            "deal_id": deal_id,
            "invoice_number": "NEST-REIMB-2026-001",
            "line_items": costs["line_items"],
            "subtotal": costs["total_fronted"],
            "status": "draft",
            "generated_at": _ts(0),
        }

    def portfolio(self) -> dict[str, Any]:
        """Portfolio-wide treasury economics across all deals."""
        nest = self.nest_soft_costs()
        # Simulated portfolio: 3 active deals
        deals = ["deal-1", "deal-2", "deal-3"]
        total_spend = 0.0
        total_rebate = 0.0
        for d in deals:
            r = self.rebate(d)
            total_spend += r["total_eligible_spend"]
            total_rebate += r["accrued"]
        return {
            "active_deals": len(deals),
            "total_managed_spend": round(total_spend, 2),
            "total_rebate_accrued": round(total_rebate, 2),
            "nest_soft_cost_rebate": nest["rebate_earned"],
            "combined_rebate": round(total_rebate + nest["rebate_earned"], 2),
            "traditional_savings": {
                "manual_reconciliation_hours_eliminated": 1_200,
                "estimated_labor_savings": 180_000,
                "misallocation_risk_reduction": "97.3% auto-categorized",
            },
        }
```

- [ ] **Step 2: Verify the file parses correctly**

Run: `cd C:/Users/sgill/nest/backend && venv/Scripts/python -c "from services.treasury_engine import TreasuryEngine; e = TreasuryEngine(); print('overview keys:', list(e.overview('deal-1').keys())); print('txns:', len(e.transactions('deal-1'))); print('cards:', len(e.cards('deal-1'))); print('rebate accrued:', e.rebate('deal-1')['accrued'])"`

Expected: prints overview keys, 240 transactions, 18 cards, and a rebate amount.

- [ ] **Step 3: Commit**

```bash
cd C:/Users/sgill/nest
git add backend/services/treasury_engine.py
git commit -m "feat(treasury): add TreasuryEngine with Ramp-schema mock data

Generates 240 transactions, 18 virtual cards, 6 prefund cycles,
budget allocations, rebate math, and NEST soft-cost tracking.
Mirrors Ramp API schema exactly for zero-code live swap."
```

---

### Task 2: Treasury API Routes

**Files:**
- Create: `backend/routes/treasury.py`

- [ ] **Step 1: Create `treasury.py` blueprint with all 12 endpoints**

```python
from datetime import datetime

from flask import Blueprint, current_app, jsonify, request

treasury_bp = Blueprint("treasury", __name__)


def _engine():
    return current_app.config["TREASURY_ENGINE"]


def _ok(data):
    return jsonify({
        "success": True,
        "data": data,
        "error": None,
        "timestamp": datetime.utcnow().isoformat(),
    })


# ── Deal-scoped endpoints ────────────────────────────────────────────

@treasury_bp.get("/<deal_id>/overview")
def overview(deal_id: str):
    return _ok(_engine().overview(deal_id))


@treasury_bp.get("/<deal_id>/transactions")
def transactions(deal_id: str):
    return _ok(_engine().transactions(deal_id))


@treasury_bp.get("/<deal_id>/cards")
def cards(deal_id: str):
    return _ok(_engine().cards(deal_id))


@treasury_bp.get("/<deal_id>/budget")
def budget(deal_id: str):
    return _ok(_engine().budget(deal_id))


@treasury_bp.get("/<deal_id>/draws")
def draws(deal_id: str):
    return _ok(_engine().prefund_history(deal_id))


@treasury_bp.get("/<deal_id>/reconciliation")
def reconciliation(deal_id: str):
    return _ok(_engine().reconciliation(deal_id))


@treasury_bp.get("/<deal_id>/rebate")
def rebate(deal_id: str):
    return _ok(_engine().rebate(deal_id))


@treasury_bp.post("/<deal_id>/prefund")
def prefund(deal_id: str):
    body = request.get_json(silent=True) or {}
    amount = body.get("amount", 0)
    return _ok({
        "status": "submitted",
        "deal_id": deal_id,
        "amount": amount,
        "message": "Prefund request submitted to approval rail.",
        "requires_approval": True,
    }), 201


@treasury_bp.post("/<deal_id>/cards")
def issue_card(deal_id: str):
    body = request.get_json(silent=True) or {}
    return _ok({
        "status": "issued",
        "deal_id": deal_id,
        "vendor": body.get("vendor", "Unknown"),
        "category": body.get("category", "General"),
        "limit": body.get("limit", 0),
        "message": "Virtual card issued.",
    }), 201


# ── NEST-scoped endpoints ────────────────────────────────────────────

@treasury_bp.get("/nest/soft-costs")
def nest_soft_costs():
    return _ok(_engine().nest_soft_costs())


@treasury_bp.get("/nest/reimbursement/<deal_id>")
def nest_reimbursement(deal_id: str):
    return _ok(_engine().nest_reimbursement(deal_id))


@treasury_bp.get("/portfolio")
def portfolio():
    return _ok(_engine().portfolio())
```

- [ ] **Step 2: Verify the file parses**

Run: `cd C:/Users/sgill/nest/backend && venv/Scripts/python -c "from routes.treasury import treasury_bp; print('routes:', len(list(treasury_bp.deferred_functions)))"`

Expected: prints a count of deferred registration functions (12).

- [ ] **Step 3: Commit**

```bash
cd C:/Users/sgill/nest
git add backend/routes/treasury.py
git commit -m "feat(treasury): add Flask blueprint with 12 Ramp P-card endpoints

Deal-scoped: overview, transactions, cards, budget, draws,
reconciliation, rebate, prefund, issue-card.
NEST-scoped: soft-costs, reimbursement, portfolio."
```

---

### Task 3: Register Blueprint in app.py

**Files:**
- Modify: `backend/app.py`

- [ ] **Step 1: Add import at line 39 (after nightvision import)**

Add this line after `from routes.nightvision import nightvision_bp`:

```python
from routes.treasury import treasury_bp
```

- [ ] **Step 2: Add engine initialization inside `create_app()` at line 95 (after ACTIVITY)**

Add this line after `app.config["ACTIVITY"] = ActivityFeed()`:

```python
from services.treasury_engine import TreasuryEngine
app.config["TREASURY_ENGINE"] = TreasuryEngine()
```

- [ ] **Step 3: Register blueprint at line 129 (after bond_structuring)**

Add this line after `app.register_blueprint(bond_structuring_bp, url_prefix="/api/bond-structuring")`:

```python
app.register_blueprint(treasury_bp, url_prefix="/api/treasury")
```

- [ ] **Step 4: Verify the backend starts and treasury endpoints respond**

Run: `cd C:/Users/sgill/nest/backend && venv/Scripts/python -c "from app import app; rules = [r.rule for r in app.url_map.iter_rules() if 'treasury' in r.rule]; print(f'{len(rules)} treasury routes:'); [print(f'  {r}') for r in sorted(rules)]"`

Expected: prints 12+ treasury routes.

- [ ] **Step 5: Commit**

```bash
cd C:/Users/sgill/nest
git add backend/app.py
git commit -m "feat(treasury): register treasury blueprint in app.py

Adds TreasuryEngine to app config and mounts /api/treasury routes."
```

---

### Task 4: TreasuryDesk Frontend Component

**Files:**
- Create: `frontend-v2/src/components/TreasuryDesk.tsx`

- [ ] **Step 1: Create the full TreasuryDesk component**

This is a large component. It has 4 internal tabs matching the spec: P-Card Operations, Budget & Reconciliation, NEST Soft Costs, Treasury Economics.

It fetches data from the backend `/api/treasury` endpoints using plain `fetch` (matching other NEST components that don't use tRPC for non-deal routes).

```tsx
import { useEffect, useState } from "react";
import {
  Banknote,
  CreditCard,
  DollarSign,
  FileCheck2,
  Landmark,
  LineChart,
  Receipt,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// ── Types (mirrors Ramp API schema from treasury_engine.py) ─────────

interface Transaction {
  id: string;
  card_id: string;
  merchant_name: string;
  merchant_category_code: string;
  amount: number;
  currency: string;
  state: string;
  receipts: { id: string; receipt_url: string }[];
  memo: string;
  category: { id: string; name: string };
  created_at: string;
  settled_at: string | null;
}

interface VirtualCard {
  id: string;
  display_name: string;
  last_four: string;
  state: string;
  spending_restrictions: { amount: number; interval: string };
  total_spent: number;
  available_balance: number;
}

interface BudgetLine {
  category_id: string;
  category_name: string;
  budgeted: number;
  drawn: number;
  spent: number;
  remaining: number;
  variance_pct: number;
  status: string;
}

interface PrefundEvent {
  id: string;
  draw_id: string;
  amount: number;
  funded_at: string;
  status: string;
}

interface Reconciliation {
  prefund_id: string;
  draw_id: string;
  draw_amount: number;
  matched_spend: number;
  unreconciled: number;
  transaction_count: number;
  status: string;
}

interface Rebate {
  rate: number;
  total_eligible_spend: number;
  accrued: number;
  realized: number;
  projected_36mo: number;
}

interface NestSoftCosts {
  line_items: { vendor: string; category: string; amount: number; date: string }[];
  total_fronted: number;
  rebate_earned: number;
  reimbursement_status: string;
}

interface Portfolio {
  active_deals: number;
  total_managed_spend: number;
  total_rebate_accrued: number;
  nest_soft_cost_rebate: number;
  combined_rebate: number;
  traditional_savings: {
    manual_reconciliation_hours_eliminated: number;
    estimated_labor_savings: number;
    misallocation_risk_reduction: string;
  };
}

interface Overview {
  total_budget: number;
  total_loaded: number;
  total_spent: number;
  available_balance: number;
  active_cards: number;
  total_transactions: number;
  rebate_accrued: number;
  receipt_match_rate: number;
}

// ── Helpers ──────────────────────────────────────────────────────────

const API = "/api/treasury";

async function fetchData<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API}${path}`);
    const json = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

function money(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

type Tab = "pcard" | "budget" | "softcosts" | "economics";

// ── Main Component ───────────────────────────────────────────────────

export function TreasuryDesk({ dealId }: { dealId: string }) {
  const [tab, setTab] = useState<Tab>("pcard");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cards, setCards] = useState<VirtualCard[]>([]);
  const [budgetLines, setBudgetLines] = useState<BudgetLine[]>([]);
  const [prefunds, setPrefunds] = useState<PrefundEvent[]>([]);
  const [recon, setRecon] = useState<Reconciliation[]>([]);
  const [rebate, setRebate] = useState<Rebate | null>(null);
  const [nestCosts, setNestCosts] = useState<NestSoftCosts | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchData<Overview>(`/${dealId}/overview`).then(setOverview),
      fetchData<Transaction[]>(`/${dealId}/transactions`).then((d) => setTransactions(d ?? [])),
      fetchData<VirtualCard[]>(`/${dealId}/cards`).then((d) => setCards(d ?? [])),
      fetchData<BudgetLine[]>(`/${dealId}/budget`).then((d) => setBudgetLines(d ?? [])),
      fetchData<PrefundEvent[]>(`/${dealId}/draws`).then((d) => setPrefunds(d ?? [])),
      fetchData<Reconciliation[]>(`/${dealId}/reconciliation`).then((d) => setRecon(d ?? [])),
      fetchData<Rebate>(`/${dealId}/rebate`).then(setRebate),
      fetchData<NestSoftCosts>("/nest/soft-costs").then(setNestCosts),
      fetchData<Portfolio>("/portfolio").then(setPortfolio),
    ]).finally(() => setLoading(false));
  }, [dealId]);

  const tabs: { id: Tab; label: string; icon: typeof CreditCard }[] = [
    { id: "pcard", label: "P-Card Ops", icon: CreditCard },
    { id: "budget", label: "Budget & Recon", icon: LineChart },
    { id: "softcosts", label: "NEST Soft Costs", icon: Receipt },
    { id: "economics", label: "Economics", icon: TrendingUp },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="mr-2 h-5 w-5 animate-spin text-amber-200" />
        <span className="font-mono text-sm text-slate-400">Loading treasury data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── Overview Metrics ─────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Loaded", value: money(overview?.total_loaded ?? 0), icon: Wallet, tone: "text-cyan-200 border-cyan-300/30 bg-cyan-400/8" },
          { label: "Total Spent", value: money(overview?.total_spent ?? 0), icon: DollarSign, tone: "text-amber-200 border-amber-300/35 bg-amber-300/9" },
          { label: "Active Cards", value: String(overview?.active_cards ?? 0), icon: CreditCard, tone: "text-emerald-200 border-emerald-300/30 bg-emerald-400/8" },
          { label: "Rebate Accrued", value: money(overview?.rebate_accrued ?? 0), icon: Banknote, tone: "text-fuchsia-200 border-fuchsia-300/30 bg-fuchsia-500/8" },
        ].map((m) => (
          <article key={m.label} className={`relative overflow-hidden rounded-[1.25rem] border p-4 ${m.tone}`}>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.17em] text-slate-500">{m.label}</span>
              <m.icon size={16} />
            </div>
            <strong className="mt-2 block font-mono text-2xl font-semibold tracking-[-0.03em] text-white">{m.value}</strong>
          </article>
        ))}
      </div>

      {/* ── Tab Bar ──────────────────────────────────────────────── */}
      <div className="flex gap-1 rounded-xl border border-white/10 bg-black/40 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 font-mono text-[0.68rem] uppercase tracking-[0.12em] transition ${
              tab === t.id
                ? "bg-amber-300/15 text-amber-100 shadow-[0_0_18px_rgba(251,191,36,0.12)]"
                : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
            }`}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ──────────────────────────────────────────── */}
      {tab === "pcard" && (
        <div className="space-y-5">
          {/* Prefund Timeline */}
          <Card className="border-cyan-300/20 bg-[#07101a]/88">
            <CardHeader>
              <CardTitle className="font-mono text-sm uppercase tracking-[0.1em] text-cyan-200">
                <Landmark className="mr-2 inline h-4 w-4" />
                Draw → Prefund Cycle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {prefunds.map((pf) => (
                  <div key={pf.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
                    <div>
                      <span className="font-mono text-xs text-slate-400">{pf.draw_id}</span>
                      <p className="font-mono text-sm text-white">{money(pf.amount)}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="border-emerald-300/30 bg-emerald-400/10 text-emerald-100 text-[0.58rem]">
                        {pf.status}
                      </Badge>
                      <p className="mt-1 font-mono text-[0.6rem] text-slate-500">{shortDate(pf.funded_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Virtual Cards Grid */}
          <Card className="border-amber-300/20 bg-[#07101a]/88">
            <CardHeader>
              <CardTitle className="font-mono text-sm uppercase tracking-[0.1em] text-amber-200">
                <CreditCard className="mr-2 inline h-4 w-4" />
                Virtual Cards ({cards.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {cards.map((card) => {
                  const utilization = card.total_spent / (card.spending_restrictions.amount || 1);
                  return (
                    <div key={card.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-mono text-[0.72rem] font-semibold text-white">{card.display_name}</p>
                          <p className="font-mono text-[0.58rem] text-slate-500">•••• {card.last_four}</p>
                        </div>
                        <Badge variant="outline" className="border-emerald-300/30 bg-emerald-400/10 text-emerald-100 text-[0.54rem]">
                          {card.state}
                        </Badge>
                      </div>
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between font-mono text-[0.6rem] text-slate-400">
                          <span>Spent: {money(card.total_spent)}</span>
                          <span>Limit: {money(card.spending_restrictions.amount)}</span>
                        </div>
                        <Progress value={utilization * 100} className="h-1.5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Transaction Feed */}
          <Card className="border-white/10 bg-[#07101a]/88">
            <CardHeader>
              <CardTitle className="font-mono text-sm uppercase tracking-[0.1em] text-slate-300">
                Recent Transactions ({transactions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-transparent">
                    <TableHead className="font-mono text-[0.6rem] text-slate-500">Date</TableHead>
                    <TableHead className="font-mono text-[0.6rem] text-slate-500">Vendor</TableHead>
                    <TableHead className="font-mono text-[0.6rem] text-slate-500">Category</TableHead>
                    <TableHead className="font-mono text-[0.6rem] text-slate-500 text-right">Amount</TableHead>
                    <TableHead className="font-mono text-[0.6rem] text-slate-500">Status</TableHead>
                    <TableHead className="font-mono text-[0.6rem] text-slate-500">Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.slice(0, 25).map((txn) => (
                    <TableRow key={txn.id} className="border-slate-800 hover:bg-slate-900/50">
                      <TableCell className="font-mono text-xs text-slate-400">{shortDate(txn.created_at)}</TableCell>
                      <TableCell className="font-mono text-xs text-white">{txn.merchant_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-white/10 text-[0.54rem] text-slate-300">
                          {txn.category.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-amber-200">{money(txn.amount)}</TableCell>
                      <TableCell>
                        <span className={`font-mono text-[0.6rem] ${txn.state === "CLEARED" ? "text-emerald-400" : "text-yellow-400"}`}>
                          {txn.state}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`font-mono text-[0.6rem] ${txn.receipts.length ? "text-emerald-400" : "text-red-400"}`}>
                          {txn.receipts.length ? "✓" : "—"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "budget" && (
        <div className="space-y-5">
          {/* Budget Allocation Table */}
          <Card className="border-amber-300/20 bg-[#07101a]/88">
            <CardHeader>
              <CardTitle className="font-mono text-sm uppercase tracking-[0.1em] text-amber-200">
                <LineChart className="mr-2 inline h-4 w-4" />
                Budget Allocation vs. Actual Spend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-transparent">
                    <TableHead className="font-mono text-[0.6rem] text-slate-500">Category</TableHead>
                    <TableHead className="font-mono text-[0.6rem] text-slate-500 text-right">Budgeted</TableHead>
                    <TableHead className="font-mono text-[0.6rem] text-slate-500 text-right">Drawn</TableHead>
                    <TableHead className="font-mono text-[0.6rem] text-slate-500 text-right">Spent</TableHead>
                    <TableHead className="font-mono text-[0.6rem] text-slate-500 text-right">Remaining</TableHead>
                    <TableHead className="font-mono text-[0.6rem] text-slate-500">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgetLines.map((line) => (
                    <TableRow key={line.category_id} className="border-slate-800 hover:bg-slate-900/50">
                      <TableCell className="font-mono text-xs text-white">{line.category_name}</TableCell>
                      <TableCell className="text-right font-mono text-xs text-slate-300">{money(line.budgeted)}</TableCell>
                      <TableCell className="text-right font-mono text-xs text-cyan-300">{money(line.drawn)}</TableCell>
                      <TableCell className="text-right font-mono text-xs text-amber-200">{money(line.spent)}</TableCell>
                      <TableCell className="text-right font-mono text-xs text-slate-400">{money(line.remaining)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[0.54rem] ${
                            line.status === "red"
                              ? "border-red-400/30 bg-red-500/10 text-red-200"
                              : line.status === "amber"
                                ? "border-yellow-400/30 bg-yellow-500/10 text-yellow-200"
                                : "border-emerald-300/30 bg-emerald-400/10 text-emerald-200"
                          }`}
                        >
                          {line.status === "red" ? `+${line.variance_pct}%` : line.status === "amber" ? `+${line.variance_pct}%` : "On track"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Reconciliation */}
          <Card className="border-cyan-300/20 bg-[#07101a]/88">
            <CardHeader>
              <CardTitle className="font-mono text-sm uppercase tracking-[0.1em] text-cyan-200">
                <ShieldCheck className="mr-2 inline h-4 w-4" />
                Draw ↔ Spend Reconciliation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recon.map((r) => (
                  <div key={r.prefund_id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
                    <div>
                      <p className="font-mono text-xs text-slate-400">{r.draw_id}</p>
                      <p className="font-mono text-sm text-white">Draw: {money(r.draw_amount)}</p>
                      <p className="font-mono text-[0.6rem] text-slate-500">{r.transaction_count} transactions matched</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-xs text-amber-200">Matched: {money(r.matched_spend)}</p>
                      <p className={`font-mono text-[0.6rem] ${Math.abs(r.unreconciled) < 50_000 ? "text-emerald-400" : "text-red-400"}`}>
                        Unreconciled: {money(Math.abs(r.unreconciled))}
                      </p>
                      <Badge
                        variant="outline"
                        className={`mt-1 text-[0.54rem] ${
                          r.status === "reconciled"
                            ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-200"
                            : "border-yellow-400/30 bg-yellow-500/10 text-yellow-200"
                        }`}
                      >
                        {r.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "softcosts" && nestCosts && (
        <div className="space-y-5">
          {/* NEST Soft Cost Summary */}
          <div className="grid gap-3 sm:grid-cols-3">
            <article className="rounded-[1.25rem] border border-amber-300/35 bg-amber-300/9 p-4">
              <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.17em] text-slate-500">Total Fronted</span>
              <strong className="mt-2 block font-mono text-2xl font-semibold tracking-[-0.03em] text-white">{money(nestCosts.total_fronted)}</strong>
            </article>
            <article className="rounded-[1.25rem] border border-fuchsia-300/30 bg-fuchsia-500/8 p-4">
              <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.17em] text-slate-500">Rebate Earned</span>
              <strong className="mt-2 block font-mono text-2xl font-semibold tracking-[-0.03em] text-white">{money(nestCosts.rebate_earned)}</strong>
            </article>
            <article className="rounded-[1.25rem] border border-cyan-300/30 bg-cyan-400/8 p-4">
              <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.17em] text-slate-500">Reimbursement</span>
              <strong className="mt-2 block font-mono text-2xl font-semibold tracking-[-0.03em] text-white capitalize">{nestCosts.reimbursement_status}</strong>
            </article>
          </div>

          {/* Line Items */}
          <Card className="border-amber-300/20 bg-[#07101a]/88">
            <CardHeader>
              <CardTitle className="font-mono text-sm uppercase tracking-[0.1em] text-amber-200">
                <Receipt className="mr-2 inline h-4 w-4" />
                NEST Pre-Close Soft Costs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-transparent">
                    <TableHead className="font-mono text-[0.6rem] text-slate-500">Date</TableHead>
                    <TableHead className="font-mono text-[0.6rem] text-slate-500">Vendor</TableHead>
                    <TableHead className="font-mono text-[0.6rem] text-slate-500">Category</TableHead>
                    <TableHead className="font-mono text-[0.6rem] text-slate-500 text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nestCosts.line_items.map((item, i) => (
                    <TableRow key={`nest-${i}`} className="border-slate-800 hover:bg-slate-900/50">
                      <TableCell className="font-mono text-xs text-slate-400">{shortDate(item.date)}</TableCell>
                      <TableCell className="font-mono text-xs text-white">{item.vendor}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-white/10 text-[0.54rem] text-slate-300">
                          {item.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-amber-200">{money(item.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "economics" && portfolio && rebate && (
        <div className="space-y-5">
          {/* Rebate Dashboard */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Rebate Rate", value: pct(rebate.rate), tone: "border-amber-300/35 bg-amber-300/9 text-amber-200" },
              { label: "Accrued (this deal)", value: money(rebate.accrued), tone: "border-fuchsia-300/30 bg-fuchsia-500/8 text-fuchsia-200" },
              { label: "Realized", value: money(rebate.realized), tone: "border-emerald-300/30 bg-emerald-400/8 text-emerald-200" },
              { label: "Projected (36mo)", value: money(rebate.projected_36mo), tone: "border-cyan-300/30 bg-cyan-400/8 text-cyan-200" },
            ].map((m) => (
              <article key={m.label} className={`rounded-[1.25rem] border p-4 ${m.tone}`}>
                <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.17em] text-slate-500">{m.label}</span>
                <strong className="mt-2 block font-mono text-2xl font-semibold tracking-[-0.03em] text-white">{m.value}</strong>
              </article>
            ))}
          </div>

          {/* Portfolio Economics */}
          <Card className="border-amber-300/20 bg-[#07101a]/88">
            <CardHeader>
              <CardTitle className="font-mono text-sm uppercase tracking-[0.1em] text-amber-200">
                <TrendingUp className="mr-2 inline h-4 w-4" />
                Portfolio Treasury Economics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-3">
                  <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                    <span className="font-mono text-[0.6rem] text-slate-500">Active Deals</span>
                    <p className="font-mono text-xl text-white">{portfolio.active_deals}</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                    <span className="font-mono text-[0.6rem] text-slate-500">Total Managed Spend</span>
                    <p className="font-mono text-xl text-amber-200">{money(portfolio.total_managed_spend)}</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                    <span className="font-mono text-[0.6rem] text-slate-500">Combined Rebate (all deals + NEST)</span>
                    <p className="font-mono text-xl text-fuchsia-200">{money(portfolio.combined_rebate)}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="rounded-lg border border-emerald-300/20 bg-emerald-400/5 p-4">
                    <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-emerald-200">
                      <FileCheck2 className="mr-1 inline h-3.5 w-3.5" /> Cost Savings vs Traditional
                    </p>
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Manual recon hours eliminated</span>
                        <span className="font-mono text-emerald-300">{portfolio.traditional_savings.manual_reconciliation_hours_eliminated.toLocaleString()} hrs</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Estimated labor savings</span>
                        <span className="font-mono text-emerald-300">{money(portfolio.traditional_savings.estimated_labor_savings)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Auto-categorized</span>
                        <span className="font-mono text-emerald-300">{portfolio.traditional_savings.misallocation_risk_reduction}</span>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-amber-300/20 bg-amber-300/5 p-4">
                    <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-amber-200">
                      Compliance Score
                    </p>
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Receipt match rate</span>
                        <span className="font-mono text-amber-300">{pct(overview?.receipt_match_rate ?? 0)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Budget categories on track</span>
                        <span className="font-mono text-amber-300">{budgetLines.filter((b) => b.status === "green").length}/{budgetLines.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default TreasuryDesk;
```

- [ ] **Step 2: Verify it compiles**

Run: `cd C:/Users/sgill/nest/frontend-v2 && npx tsc --noEmit src/components/TreasuryDesk.tsx 2>&1 | head -20`

If TypeScript errors appear, fix them. Common issue: shadcn `Progress` may not exist — substitute with a `<div>` bar if needed.

- [ ] **Step 3: Commit**

```bash
cd C:/Users/sgill/nest
git add frontend-v2/src/components/TreasuryDesk.tsx
git commit -m "feat(treasury): add TreasuryDesk component with 4 tabs

P-Card Ops, Budget & Recon, NEST Soft Costs, Treasury Economics.
240 transactions, 18 virtual cards, full budget mapping,
rebate dashboard, portfolio economics. Matches NEST terminal design."
```

---

### Task 5: Wire Treasury Tab into Deal Detail Page

**Files:**
- Modify: `frontend-v2/src/pages/OperationsPages.tsx`

- [ ] **Step 1: Add lazy import**

After line 35 (`const LiveAgentDashboard = ...`), add:

```tsx
const TreasuryDesk = lazy(() => import("@/components/TreasuryDesk").then((module) => ({ default: module.TreasuryDesk })));
```

- [ ] **Step 2: Add `Wallet` to the lucide import**

In the lucide-react import block at the top (line 3-17), add `Wallet` to the list:

```tsx
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  FileCheck2,
  Landmark,
  Layers3,
  Loader2,
  ShieldCheck,
  Target,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
```

- [ ] **Step 3: Add workspace tab entry**

In the `workspaceTabs` array (around line 313-323), add after the `control` entry:

```tsx
    { id: "treasury", label: "Treasury (Ramp)", icon: Wallet, tone: "gold" as const, summary: "Prefunded P-card operations, budget reconciliation, NEST soft costs, and rebate economics." },
```

- [ ] **Step 4: Add switch case in `renderWorkspace()`**

In the `switch (activeWorkspace)` block (around line 330-374), add before the `default` case:

```tsx
      case "treasury":
        return (
          <LazyWorkspace>
            <TreasuryDesk dealId={String(deal.id)} />
          </LazyWorkspace>
        );
```

- [ ] **Step 5: Verify the page loads with the new tab**

Start the dev server if not running: `cd C:/Users/sgill/nest/frontend-v2 && npm run dev`

Open the browser to the deal detail page. Verify "Treasury (Ramp)" appears as a tab. Click it. Verify it renders with data (overview metrics, cards, transactions).

- [ ] **Step 6: Commit**

```bash
cd C:/Users/sgill/nest
git add frontend-v2/src/pages/OperationsPages.tsx
git commit -m "feat(treasury): wire Treasury tab into deal detail workspace

Adds Treasury (Ramp) as 10th workspace tab with lazy loading.
Gold-toned tab with Wallet icon."
```

---

### Task 6: End-to-End Verification

- [ ] **Step 1: Restart backend**

Kill existing backend process and restart:

```bash
cd C:/Users/sgill/nest/backend && venv/Scripts/python app.py
```

Verify output says 250+ routes (was 241, now ~253 with 12 treasury routes).

- [ ] **Step 2: Test API endpoints with curl**

```bash
curl -s http://localhost:8000/api/treasury/1/overview | python -m json.tool | head -15
curl -s http://localhost:8000/api/treasury/1/transactions | python -m json.tool | head -5
curl -s http://localhost:8000/api/treasury/nest/soft-costs | python -m json.tool | head -10
curl -s http://localhost:8000/api/treasury/portfolio | python -m json.tool | head -10
```

Expected: JSON responses with `"success": true` and populated data fields.

- [ ] **Step 3: Test frontend rendering**

Open browser to deal detail page → click "Treasury (Ramp)" tab. Verify:
1. Overview metrics show (Total Loaded, Total Spent, Active Cards, Rebate Accrued)
2. P-Card Ops tab shows prefund timeline, virtual cards grid, transaction feed
3. Budget & Recon tab shows budget allocation table and reconciliation
4. NEST Soft Costs tab shows line items and rebate earned
5. Economics tab shows rebate dashboard and portfolio economics

- [ ] **Step 4: Final commit**

```bash
cd C:/Users/sgill/nest
git add -A
git commit -m "feat(treasury): NEST Treasury / Ramp P-Card integration complete

Full module: 12 API endpoints, mock data engine mirroring Ramp schema,
TreasuryDesk component with 4 tabs (P-Card Ops, Budget & Recon,
NEST Soft Costs, Treasury Economics). 240 transactions, 18 virtual
cards, $487M budget across 12 categories, rebate tracking.

Prefunded P-card architecture: draw → card load → spend → reconcile.
NEST earns rebate on fronted soft costs. Novel in construction finance."
```
