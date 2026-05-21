# NEST Treasury — Ramp P-Card Integration

**Date:** 2026-05-21
**Author:** Sean Gilmore / Claude
**Status:** Approved
**Module location:** Deal detail workspace tab ("Treasury (Ramp)")

---

## 1. Problem

Construction bond projects ($100M–$500M+) disburse proceeds through manual draw requests wired to checking accounts. Expense tracking is retroactive, misallocation is caught in audits (if at all), and there is zero rebate on spend. Trustees receive unstructured invoices with no automated categorization.

## 2. Solution

Replace the traditional disbursement path with a **prefunded P-card program powered by Ramp**. Every dollar of bond proceeds flows through Ramp cards. The draw IS the prefunding event — the card balance can never exceed what was drawn. The entire audit trail (vendor, category, receipt, timestamp) is automatic.

NEST operates in two phases per deal:

- **Pre-close:** NEST fronts soft costs (legal, Moody's, audit, hosting, T&E) on NEST's own Ramp card. Client reimburses from bond proceeds at close. NEST keeps the rebate — pure margin on costs recovered at par.
- **Post-close:** Client receives their own prefunded P-card. Draw proceeds load the card. Client spends against loaded balance. NEST provides visibility, controls, budget mapping, and reconciliation.

## 3. Economics

| Metric | Value |
|--------|-------|
| Ramp rebate rate | 1.0–1.5% on spend |
| Example: $200M spend over 3yr construction | $2–3M rebate |
| NEST pre-close soft costs (per deal) | $2–5M |
| NEST rebate on fronted costs | $20–75K per deal |
| Portfolio effect (10 active deals) | $200–750K/yr rebate income |

**NEST revenue model:** NEST earns rebate on its own pre-close spend (reimbursed at par). Post-close rebate accrues to client as a selling point. NEST monetizes through bond structuring, placement, and platform fees.

## 4. Architecture

### 4.1 Where Treasury Lives

Treasury is a **new workspace tab** in the existing deal detail page (`OperationsPages.tsx → OperationsDealDetailPage`). It joins the existing tab family:

```
Workspace tabs:
  Bond stack | Roots | Client deposit | Insurance/Surety | Rating |
  Intake/Modeling | Draws/Covenants | Agent ops | Admin/Compliance | Treasury (Ramp)
```

It is part of the invoice/payment module family alongside `ClientDepositPlatform`, `DrawManagement`, `InvoiceList`, `DepositTracker`, and `PaymentProcessing`.

### 4.2 Dual-Mode Data Engine

The backend uses a **mock data engine that mirrors Ramp's exact API schema**. One config flag (`RAMP_MODE=mock|live`) switches between:

- `mock` — realistic generated data matching Ramp's transaction/card/receipt schema
- `live` — real Ramp API calls via their REST API

The frontend never knows the difference. Every field, every data shape, every response format matches Ramp's actual API so the swap is zero-code on the frontend.

### 4.3 Backend

**New files:**

- `backend/routes/treasury.py` — REST endpoints (blueprint: `treasury_bp`, prefix `/api/treasury`)
- `backend/services/treasury_engine.py` — business logic + mock/live Ramp adapter

**Endpoints:**

```
GET  /api/treasury/:dealId/overview          — summary stats (spend, budget, rebate, card count)
GET  /api/treasury/:dealId/transactions      — paginated Ramp transactions for the deal
GET  /api/treasury/:dealId/cards             — virtual cards issued (per vendor/category)
GET  /api/treasury/:dealId/budget            — budget allocations vs. actual spend by category
GET  /api/treasury/:dealId/draws             — draw-to-prefund cycle history
GET  /api/treasury/:dealId/reconciliation    — Ramp txns mapped to draw line items
GET  /api/treasury/:dealId/rebate            — rebate accrued, projected, and realized
POST /api/treasury/:dealId/prefund           — initiate a prefund cycle (draw → card load)
POST /api/treasury/:dealId/cards             — issue a new virtual card for a vendor/category

GET  /api/treasury/nest/soft-costs           — NEST's own pre-close spend across all deals
GET  /api/treasury/nest/reimbursement/:dealId — generate reimbursement package for a deal
GET  /api/treasury/portfolio                 — portfolio-wide treasury economics dashboard
```

**Response format (per CLAUDE.md):**

```python
{
    "success": True,
    "data": { ... },
    "error": None,
    "timestamp": "2026-05-21T14:30:00Z"
}
```

### 4.4 Frontend Component

**New file:** `frontend-v2/src/components/TreasuryDesk.tsx`

Single component registered as a workspace tab. Internal tab structure:

```
TreasuryDesk
├── Tab: P-Card Operations (default)
│   ├── Prefund Cycle Panel
│   │   ├── Current card balance (loaded vs. spent)
│   │   ├── Last draw → prefund event
│   │   ├── "Request Prefund" action (routes through approval rail)
│   │   └── Prefund history timeline
│   ├── Virtual Cards Grid
│   │   ├── Card per vendor/category (e.g., "Moody's — Rating", "Turner — GC")
│   │   ├── Each card shows: limit, spent, remaining, last txn
│   │   └── "Issue Card" action
│   └── Live Transaction Feed
│       ├── Real-time (or near-real-time) Ramp transactions
│       ├── Category, vendor, amount, receipt status, timestamp
│       └── Filter by category, date range, amount
│
├── Tab: Budget & Reconciliation
│   ├── Budget Allocation Table
│   │   ├── Category | Budgeted | Drawn | Spent | Remaining
│   │   ├── Hard costs, soft costs, T&E, insurance, legal, rating, hosting
│   │   └── Variance alerts (over-budget categories flagged red)
│   ├── Draw ↔ Spend Reconciliation
│   │   ├── Each draw mapped to its corresponding card spend
│   │   ├── Unreconciled amounts flagged
│   │   └── Export reconciliation report
│   └── Spend Velocity Chart
│       ├── Monthly burn rate vs. construction schedule
│       └── Projected budget exhaustion date
│
├── Tab: NEST Soft Costs (pre-close)
│   ├── NEST Card Spend for This Deal
│   │   ├── Line items: legal, Moody's, audit, hosting, T&E
│   │   ├── Running total
│   │   └── Rebate earned on this spend
│   ├── Reimbursement Package
│   │   ├── Auto-generated invoice to client
│   │   ├── Itemized with Ramp receipt backup
│   │   └── Status: draft / sent / paid
│   └── Cross-Deal Summary (NEST portfolio)
│       ├── Total soft costs fronted across all deals
│       └── Total rebate income earned
│
└── Tab: Treasury Economics
    ├── Rebate Dashboard
    │   ├── Accrued | Projected | Realized
    │   ├── By deal, by category, by time period
    │   └── Rebate rate tier (volume-based)
    ├── Cost Savings vs. Traditional
    │   ├── Eliminated: manual reconciliation hours
    │   ├── Eliminated: misallocation risk
    │   ├── Added: automatic categorization
    │   └── Added: rebate income (net new)
    └── Compliance Score
        ├── % transactions with matched receipts
        ├── % transactions auto-categorized
        ├── % budget categories within threshold
        └── Trustee-ready export button
```

### 4.5 Ramp API Schema (Mock Mirror)

The mock engine generates data matching these Ramp API objects:

**Transaction:**
```json
{
  "id": "txn_abc123",
  "card_id": "card_xyz",
  "merchant_name": "Moody's Investors Service",
  "merchant_category_code": "7372",
  "amount": 125000.00,
  "currency": "USD",
  "state": "CLEARED",
  "receipts": [{ "id": "rcpt_1", "receipt_url": "..." }],
  "memo": "Annual rating review — Series 2025A",
  "category": { "id": "cat_rating", "name": "Rating & Grading" },
  "accounting_categories": [{ "id": "ac_1", "name": "Soft Costs — Rating" }],
  "created_at": "2026-05-15T09:30:00Z",
  "settled_at": "2026-05-17T00:00:00Z"
}
```

**Card:**
```json
{
  "id": "card_xyz",
  "display_name": "Moody's — Rating Services",
  "card_program_id": "prog_nest_001",
  "last_four": "4821",
  "state": "ACTIVE",
  "spending_restrictions": {
    "amount": 500000.00,
    "interval": "YEARLY",
    "categories": ["7372"],
    "blocked_categories": []
  },
  "total_spent": 125000.00,
  "available_balance": 375000.00,
  "card_holder": { "first_name": "Sean", "last_name": "Gilmore" }
}
```

**Prefund event (NEST-defined, not Ramp native):**
```json
{
  "id": "pf_001",
  "deal_id": "deal-1",
  "draw_id": "draw_007",
  "amount": 8000000.00,
  "funded_at": "2026-05-01T10:00:00Z",
  "card_program_id": "prog_nest_001",
  "status": "funded",
  "approval_id": "appr_042"
}
```

### 4.6 Integration Points

| System | Integration |
|--------|-------------|
| **Approval Rail** | Prefund requests route through existing `ApprovalRail` component. No card loads without human gate. |
| **Draw Management** | `DrawManagement` links to Treasury — a draw marked "treasury-prefund" auto-populates the prefund cycle panel. |
| **Bernard** | Bernard can narrate treasury status: "Your Moody's card has $375K remaining. Last transaction was $125K on May 15th." |
| **Bond Desk** | Treasury economics feed into bond economics — rebate income shows as a line item in deal P&L. |
| **Invoice module** | NEST soft cost reimbursement generates an invoice through the existing `InvoiceList` system. |

### 4.7 Demo Data

For the investor demo, the mock engine generates a realistic $500M project:

- **Project:** Jacaranda Trace Phase II (mirrors the PLOM reference deal)
- **Construction period:** 36 months
- **Total budget:** $487M across 12 categories
- **Active virtual cards:** 18 (one per major vendor/category)
- **Transaction history:** 240 transactions over 6 simulated months
- **Draws:** 6 monthly draws, each prefunding $8–12M
- **Rebate accrued:** $847K (on $84.7M spent to date)
- **NEST soft costs:** $3.2M fronted pre-close, $48K rebate earned
- **Receipt match rate:** 97.3%
- **Budget variance:** 2 categories amber (within 5%), 0 red

## 5. Visual Treatment

Per CLAUDE.md brand guidelines:

- **Primary tone:** Gold (`#C4A048`) — this is a financial instrument module
- **Card balances and dollar figures:** IBM Plex Mono
- **Headings:** Cormorant Garamond
- **Body:** Space Grotesk
- **Background:** `--nest-void` / `--nest-navy` dark terminal aesthetic
- **Status indicators:** Cyan (active/funded), Gold (financial figures), Red (over-budget/blocked), Green (reconciled/matched)
- **Card component style:** Matches existing `CommandCard` / `TerminalPanel` patterns from `OperationsPages.tsx`

## 6. File Manifest

| File | Action | Purpose |
|------|--------|---------|
| `backend/routes/treasury.py` | Create | REST endpoints |
| `backend/services/treasury_engine.py` | Create | Business logic + mock/live Ramp adapter |
| `frontend-v2/src/components/TreasuryDesk.tsx` | Create | Main Treasury workspace component |
| `frontend-v2/src/pages/OperationsPages.tsx` | Edit | Add "Treasury (Ramp)" tab + lazy import |
| `backend/app.py` | Edit | Register `treasury_bp` blueprint |

## 7. Not In Scope (v1)

- Real Ramp API integration (mock-first, live swap when API keys arrive)
- Ramp webhook listeners (real-time transaction push)
- Multi-entity Ramp account management
- Automated card issuance (UI-triggered, not rule-based)
- Trustee portal (external-facing reconciliation view)
- Contractor onboarding flow (accepting card payments)

## 8. Patent / IP Note

The concept of routing bond draw proceeds through a prefunded corporate card program for automatic expense categorization, misallocation prevention, and rebate capture appears to be novel in construction finance. This architecture — where the disbursement mechanism IS the control mechanism — has no direct precedent in municipal bond or construction lending practice. Consider provisional patent filing.
