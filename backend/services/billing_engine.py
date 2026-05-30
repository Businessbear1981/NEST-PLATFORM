"""
NEST Billing Engine — Fee calculation, invoicing, payment tracking.

Fee mechanics are governed by ADR-0001 (Operating Model — Layered Licensing Path)
and the CONTEXT.md domain glossary entries for Advisory Fee, Arrangement Fee,
Trail Fee, Placement Fee, and Placement Partner.

Every Deal carries a `regulatory_path` enum that determines which fee schedule
applies. See ADR-0001 for the four phases and the SEC/FINRA substance-over-form
test that drives the Path A construction.

`regulatory_path` values:
- `path_a_advisory_partnered` — NEST as advisor; external Placement Partner places.
                                Arrangement Fee construction required:
                                flat dollars / tiered by par band, NEVER % of par,
                                milestone-tied to delivered work product,
                                owed regardless of placement outcome.
- `ma_nest_direct`            — NEST Advisors LLC as MSRB-registered Municipal Advisor.
                                Transaction-based fees permissible directly.
- `bd_sponsored_via_britehorn`— Sean as Britehorn-sponsored registered rep.
                                Transaction-based commission permissible via Britehorn.
- `bd_nest_direct`            — NEST BD LLC as FINRA member firm.
                                Placement fees permissible directly.

Two distinct views are produced from any Deal:
1. NEST P&L view  (`nest_pnl`)         — only the lines NEST actually collects.
2. Cost of Issuance (`cost_of_issuance`) — every fee line for the Official Statement,
                                          including counterparty fees that flow to
                                          third parties (Bond Counsel, Trustee, FA,
                                          Surety, Rating, Feasibility, etc.).

The fee is for:
1. Access to institutional bond market
2. Structural expertise — knowing which structure to use
3. Counterparty relationships — rating agencies, trustees, counsel
4. Execution — actually closing the deal
5. 30-year administration — recurring revenue engine
"""
from __future__ import annotations
from datetime import datetime, timedelta
from typing import Any


# ---------------------------------------------------------------------------
# FEE_SCHEDULE_DIRECT  — % of par lines.
#
# Permissible ONLY when `regulatory_path` is one of:
#   - `ma_nest_direct`             (NEST as MSRB Municipal Advisor, on muni Deals)
#   - `bd_nest_direct`             (NEST-owned FINRA Broker-Dealer)
#   - `bd_sponsored_via_britehorn` (Sean as Britehorn registered rep, commission
#                                   flows as personal income from Britehorn —
#                                   NOT to NEST Advisors directly. See ADR-0001
#                                   "Negative" consequences.)
#
# This is the original "Bible Silo 5" schedule. It is preserved verbatim for the
# licensed paths; it MUST NOT be used under `path_a_advisory_partnered`.
# ---------------------------------------------------------------------------
FEE_SCHEDULE_DIRECT = {
    "structuring": {
        "rate_pct": 0.025,  # 2.5% of par (midpoint of 2-3%)
        "earned_at": "closing",
        "description": "Bond structuring, credit analysis, rating advisory, document coordination",
    },
    "placement": {
        "rate_pct": 0.0075,  # 0.75% of par (midpoint of 0.5-1%)
        "earned_at": "pricing",
        "description": "Investor matching, book building, pricing, allocation through BD partner",
    },
    "administration": {
        "rate_bps": 62.5,  # 62.5 bps annually (midpoint of 50-75)
        "earned_at": "monthly",
        "lifecycle_years": 30,
        "description": "Ongoing bond administration — debt service, covenant monitoring, EMMA filings, trustee coordination",
    },
    "commitment": {
        "rate_pct": 0.00375,  # 37.5 bps (midpoint of 25-50)
        "earned_at": "commitment_letter",
        "description": "Commitment to provide financing — locks in deal team capacity",
    },
    "advisory": {
        "rate_flat": 50_000,  # Minimum advisory fee
        "earned_at": "engagement",
        "description": "Financial advisory services — deal evaluation, capital structure recommendation",
    },
    "expense_reimbursement": {
        "description": "Pass-through of out-of-pocket expenses — rating agency fees, legal, travel",
        "earned_at": "closing",
    },
}

# Back-compat alias. The legacy name `FEE_SCHEDULE` is retained so any import
# path that pre-dates the ADR-0001 refactor continues to resolve. New code must
# use `FEE_SCHEDULE_DIRECT` or `FEE_SCHEDULE_PATH_A` explicitly.
FEE_SCHEDULE = FEE_SCHEDULE_DIRECT


# ---------------------------------------------------------------------------
# FEE_SCHEDULE_PATH_A — Advisory Fee bundle under `path_a_advisory_partnered`.
#
# Per CONTEXT.md "Arrangement Fee" and ADR-0001 "Notes":
#   "The substance of the Arrangement Fee must be advisory, not brokerage.
#    SEC and FINRA evaluate substance over form. To remain on the advisory
#    side of the line:
#      - Quantum is fixed dollars or tiered by deal-size band, not %.
#      - Payment milestones tie to specific deliverables, not solely closing.
#      - The fee remains owed if the deal terminates after the deliverable.
#      - The fee scales with work, not with placement success."
#
# Tier breaks are by par band ($M of par). The Engagement Retainer + Arrangement
# Fee + Trail Fee triplet together constitutes the Advisory Fee bundle that
# NEST may lawfully collect under Path A. Placement Fee under Path A flows
# to the external Placement Partner (Britehorn in v1) — see PLACEMENT_PARTNER_FEE
# below. It does NOT appear in NEST's P&L except via an explicit
# `nest_rev_share_pct` carve-out in the Placement Partner engagement letter.
# ---------------------------------------------------------------------------
FEE_SCHEDULE_PATH_A = {
    # Engagement Retainer — paid up front at engagement letter execution.
    # Tiered by par band; flat dollars, not % of par. Non-refundable for work
    # performed; partially refundable per engagement letter wind-down schedule.
    "engagement_retainer": {
        "earned_at": "engagement",
        "description": "Engagement Retainer — paid at engagement letter execution; covers initial diligence, structuring kickoff, and working-group formation.",
        # par_min_usd (inclusive), par_max_usd (exclusive), retainer_usd
        "tiers": [
            (0,            50_000_000,   25_000),   # < $50M par
            (50_000_000,   100_000_000,  40_000),   # $50-100M par
            (100_000_000,  250_000_000,  60_000),   # $100-250M par
            (250_000_000,  500_000_000,  80_000),   # $250-500M par
            (500_000_000,  None,        100_000),   # $500M+ par
        ],
    },

    # Arrangement Fee — the lawful advisory-side payment for the structuring
    # and arrangement work product (structuring spec, financial model, rating
    # package, document coordination, working-group orchestration). Tiered FLAT
    # dollars by par band. NEVER % of par — that would be transaction-based
    # compensation and constitute unregistered broker activity under SEC/FINRA
    # substance-over-form analysis. See CONTEXT.md "Arrangement Fee".
    #
    # Milestone split per CONTEXT.md: 25% engagement letter, 25% credit memo,
    # 25% rating obtained, 25% closing. The fee remains owed for completed
    # milestones even if the Deal terminates pre-close.
    "arrangement_fee": {
        "earned_at": "milestones",  # see ARRANGEMENT_FEE_MILESTONES
        "description": "Arrangement Fee — flat advisory fee for structuring work product. Tiered by par band; NEVER % of par. Milestone-tied per CONTEXT.md and ADR-0001 substance-over-form constraint.",
        # par_min_usd (inclusive), par_max_usd (exclusive), arrangement_fee_usd
        "tiers": [
            (0,            50_000_000,   200_000),  # < $50M par
            (50_000_000,   100_000_000,  300_000),  # $50-100M par   per task spec
            (100_000_000,  250_000_000,  500_000),  # $100-250M par  per task spec
            (250_000_000,  None,         750_000),  # $250M+ par     per task spec
        ],
    },

    # Trail Fee — ongoing post-close advisory: covenant monitoring, refunding-
    # window surveillance, ramp-up support, rating-recap analysis. Paid by the
    # Borrower under a separate Trail engagement letter; NOT netted from bond
    # payments. Annual flat dollars, tiered by par band. See CONTEXT.md "Trail Fee".
    "trail_fee": {
        "earned_at": "annual_post_close",
        "description": "Trail Fee — annual flat advisory fee for post-close monitoring (covenants, refunding window, ramp-up, rating recap). Paid by Borrower under separate Trail engagement letter, not netted from bond payments.",
        "lifecycle_years": 30,
        # par_min_usd (inclusive), par_max_usd (exclusive), trail_fee_usd_annual
        "tiers": [
            (0,            50_000_000,   24_000),
            (50_000_000,   100_000_000,  36_000),
            (100_000_000,  250_000_000,  48_000),
            (250_000_000,  None,         60_000),
        ],
    },
}

# Arrangement Fee milestone split. Sums to 1.0. Per CONTEXT.md "Arrangement Fee".
ARRANGEMENT_FEE_MILESTONES = [
    {"id": "engagement",  "pct": 0.25, "name": "Engagement Letter Executed"},
    {"id": "credit_memo", "pct": 0.25, "name": "Credit Memo Delivered"},
    {"id": "rating",      "pct": 0.25, "name": "Rating Obtained"},
    {"id": "closing",     "pct": 0.25, "name": "Bond Closed"},
]


# ---------------------------------------------------------------------------
# PLACEMENT_PARTNER_FEE — flows to the external Placement Partner under
# `path_a_advisory_partnered`. This is the SUCCESS FEE on bond placement,
# collected by the Placement Partner under its FINRA BD license (Britehorn,
# initially). Per CONTEXT.md "Placement Fee" and "Placement Partner":
# only a FINRA-registered BD may collect this; NEST may share via an
# explicit `nest_rev_share_pct` carve-out in the Placement Partner engagement
# agreement.
# ---------------------------------------------------------------------------
PLACEMENT_PARTNER_FEE = {
    "rate_pct": 0.0075,  # 75 bps of par — market mid; actual quoted per Deal
    "earned_at": "pricing",
    "collected_by": "placement_partner",  # NOT NEST under Path A
    "description": "Placement Fee — collected by external Placement Partner (Britehorn in v1) under its FINRA BD license. Under Path A this is NOT NEST revenue except via nest_rev_share_pct carve-out.",
}


# ---------------------------------------------------------------------------
# Milestone-based billing schedule (legacy, used by % of par direct schedule).
# Preserved for back-compat with routes that consume `.calculate_deal_fees()`.
# ---------------------------------------------------------------------------
BILLING_MILESTONES = [
    {"id": "engagement",     "name": "Engagement Letter Executed", "fee_type": "advisory",      "pct_of_total": 0},
    {"id": "commitment",     "name": "Commitment Letter Issued",   "fee_type": "commitment",    "pct_of_total": 0.05},
    {"id": "rating",         "name": "Rating Obtained",            "fee_type": None,            "pct_of_total": 0},
    {"id": "pricing",        "name": "Bond Priced",                "fee_type": "placement",     "pct_of_total": 0.10},
    {"id": "closing",        "name": "Bond Closed",                "fee_type": "structuring",   "pct_of_total": 0.85},
    {"id": "administration", "name": "Ongoing Administration",     "fee_type": "administration","pct_of_total": 0},
]


# Regulatory paths that may use the % of par direct schedule.
DIRECT_FEE_PATHS = frozenset({
    "ma_nest_direct",
    "bd_nest_direct",
    "bd_sponsored_via_britehorn",
})

PATH_A = "path_a_advisory_partnered"


def _tier_lookup(tiers: list[tuple], par: float) -> float:
    """Return the tier value for `par` from a list of (min, max, value) tuples."""
    for lo, hi, value in tiers:
        if par >= lo and (hi is None or par < hi):
            return value
    # Fall through — should not happen given open-ended top tier.
    return tiers[-1][2]


def _regulatory_path(deal: dict) -> str:
    """Default to Path A per ADR-0001 phase 1 (pre-license)."""
    return deal.get("regulatory_path") or PATH_A


class BillingEngine:
    """Calculates fees, generates invoices, tracks payments.

    Dispatches on `deal["regulatory_path"]` per ADR-0001. See module docstring
    for the four path values and their fee mechanics.
    """

    # ---------------------------------------------------------------- dispatch

    def calculate_deal_fees(self, deal: dict) -> dict:
        """Calculate all fees for a deal.

        Routes to `_calculate_path_a_fees` for `path_a_advisory_partnered`
        (the ADR-0001 phase-1 construction) and to `_calculate_direct_fees`
        for the licensed paths (`ma_nest_direct`, `bd_nest_direct`,
        `bd_sponsored_via_britehorn`).

        Existing route callers depend on this signature returning a dict with
        keys: `bond_amount`, `fees`, `administration`, `totals`, `milestones`.
        Both branches preserve that shape.
        """
        path = _regulatory_path(deal)
        if path == PATH_A:
            return self._calculate_path_a_fees(deal)
        if path in DIRECT_FEE_PATHS:
            return self._calculate_direct_fees(deal)
        # Unknown / future path — fail closed to Path A (most restrictive).
        return self._calculate_path_a_fees(deal)

    # ---------------------------------------------------------------- Path A

    def _calculate_path_a_fees(self, deal: dict) -> dict:
        """Advisory Fee bundle under `path_a_advisory_partnered`.

        Per ADR-0001 + CONTEXT.md "Arrangement Fee": NEST collects only
        Engagement Retainer + Arrangement Fee + Trail Fee. Placement Fee
        flows to the external Placement Partner under its BD license.
        """
        par = deal.get("bond_amount", 0) or 0

        engagement_retainer = _tier_lookup(
            FEE_SCHEDULE_PATH_A["engagement_retainer"]["tiers"], par
        )
        arrangement_fee = _tier_lookup(
            FEE_SCHEDULE_PATH_A["arrangement_fee"]["tiers"], par
        )
        trail_fee_annual = _tier_lookup(
            FEE_SCHEDULE_PATH_A["trail_fee"]["tiers"], par
        )
        trail_lifecycle = trail_fee_annual * FEE_SCHEDULE_PATH_A["trail_fee"]["lifecycle_years"]

        # Placement Partner Fee — flows to external BD, not NEST.
        placement_partner_fee = round(par * PLACEMENT_PARTNER_FEE["rate_pct"])

        total_at_closing_nest = engagement_retainer + arrangement_fee

        # Arrangement Fee milestone breakout.
        arrangement_milestones = [
            {
                "id": f"arrangement_{m['id']}",
                "name": f"Arrangement Fee — {m['name']}",
                "fee_type": "arrangement_fee",
                "pct_of_total": m["pct"],
                "amount": round(arrangement_fee * m["pct"]),
            }
            for m in ARRANGEMENT_FEE_MILESTONES
        ]

        milestones = [
            {
                "id": "engagement",
                "name": "Engagement Letter Executed",
                "fee_type": "engagement_retainer",
                "pct_of_total": 0,
                "amount": engagement_retainer,
            },
            *arrangement_milestones,
            {
                "id": "placement_partner",
                "name": "Placement Fee — collected by Placement Partner",
                "fee_type": "placement_partner_fee",
                "pct_of_total": 0,
                "amount": placement_partner_fee,
                "collected_by": "placement_partner",
                "nest_collects": False,
            },
            {
                "id": "trail",
                "name": "Trail Fee (Annual, Post-Close)",
                "fee_type": "trail_fee",
                "pct_of_total": 0,
                "amount": trail_fee_annual,
            },
        ]

        return {
            "regulatory_path": PATH_A,
            "bond_amount": par,
            "fees": {
                # Path A bundle (NEST collects)
                "engagement_retainer": {
                    "amount": engagement_retainer,
                    "description": FEE_SCHEDULE_PATH_A["engagement_retainer"]["description"],
                    "earned_at": "engagement",
                    "collected_by": "nest",
                },
                "arrangement_fee": {
                    "amount": arrangement_fee,
                    "description": FEE_SCHEDULE_PATH_A["arrangement_fee"]["description"],
                    "earned_at": "milestones",
                    "milestones": ARRANGEMENT_FEE_MILESTONES,
                    "collected_by": "nest",
                },
                "trail_fee": {
                    "amount_annual": trail_fee_annual,
                    "amount_lifecycle": trail_lifecycle,
                    "description": FEE_SCHEDULE_PATH_A["trail_fee"]["description"],
                    "earned_at": "annual_post_close",
                    "collected_by": "nest",
                },
                # Placement Partner Fee (flows externally under Path A)
                "placement_partner_fee": {
                    "amount": placement_partner_fee,
                    "description": PLACEMENT_PARTNER_FEE["description"],
                    "earned_at": "pricing",
                    "collected_by": "placement_partner",
                    "nest_collects": False,
                },
            },
            # Back-compat shim. Path A has no recurring bps-of-par administration.
            # The Trail Fee plays the recurring-revenue role under Path A.
            "administration": {
                "annual": trail_fee_annual,
                "monthly": round(trail_fee_annual / 12),
                "lifecycle_years": FEE_SCHEDULE_PATH_A["trail_fee"]["lifecycle_years"],
                "lifecycle_total": trail_lifecycle,
                "description": "Trail Fee (Path A recurring) — see CONTEXT.md 'Trail Fee'.",
            },
            "totals": {
                "at_closing": total_at_closing_nest,
                "annual_admin": trail_fee_annual,
                "lifecycle_total": total_at_closing_nest + trail_lifecycle,
                "as_pct_of_par": round(total_at_closing_nest / par * 100, 2) if par else 0,
            },
            "milestones": milestones,
        }

    # ----------------------------------------------------------- Direct paths

    def _calculate_direct_fees(self, deal: dict) -> dict:
        """% of par schedule. Permissible under the licensed paths only.

        Preserves the original `calculate_deal_fees` shape verbatim so that
        existing routes (`generate_invoice`, `generate_admin_invoice`,
        `deal_economics`) continue to operate without modification.
        """
        par = deal.get("bond_amount", 0) or 0

        structuring = round(par * FEE_SCHEDULE_DIRECT["structuring"]["rate_pct"])
        placement = round(par * FEE_SCHEDULE_DIRECT["placement"]["rate_pct"])
        commitment = round(par * FEE_SCHEDULE_DIRECT["commitment"]["rate_pct"])
        advisory = FEE_SCHEDULE_DIRECT["advisory"]["rate_flat"]
        admin_annual = round(par * FEE_SCHEDULE_DIRECT["administration"]["rate_bps"] / 10000)
        admin_monthly = round(admin_annual / 12)
        admin_lifecycle = admin_annual * FEE_SCHEDULE_DIRECT["administration"]["lifecycle_years"]

        total_closing = structuring + placement + commitment + advisory
        total_lifecycle = total_closing + admin_lifecycle

        return {
            "regulatory_path": _regulatory_path(deal),
            "bond_amount": par,
            "fees": {
                "advisory":    {"amount": advisory,    "description": FEE_SCHEDULE_DIRECT["advisory"]["description"],    "earned_at": "engagement"},
                "commitment":  {"amount": commitment,  "description": FEE_SCHEDULE_DIRECT["commitment"]["description"],  "earned_at": "commitment_letter"},
                "placement":   {"amount": placement,   "description": FEE_SCHEDULE_DIRECT["placement"]["description"],   "earned_at": "pricing"},
                "structuring": {"amount": structuring, "description": FEE_SCHEDULE_DIRECT["structuring"]["description"], "earned_at": "closing"},
            },
            "administration": {
                "annual": admin_annual,
                "monthly": admin_monthly,
                "lifecycle_years": 30,
                "lifecycle_total": admin_lifecycle,
                "description": FEE_SCHEDULE_DIRECT["administration"]["description"],
            },
            "totals": {
                "at_closing": total_closing,
                "annual_admin": admin_annual,
                "lifecycle_total": total_lifecycle,
                "as_pct_of_par": round(total_closing / par * 100, 2) if par else 0,
            },
            "milestones": [
                {**m, "amount": self._milestone_amount(m, deal)} for m in BILLING_MILESTONES
            ],
        }

    def _milestone_amount(self, milestone: dict, deal: dict) -> float:
        par = deal.get("bond_amount", 0) or 0
        fee_type = milestone.get("fee_type")
        if not fee_type:
            return 0
        if fee_type == "advisory":
            return FEE_SCHEDULE_DIRECT["advisory"]["rate_flat"]
        if fee_type == "commitment":
            return round(par * FEE_SCHEDULE_DIRECT["commitment"]["rate_pct"])
        if fee_type == "placement":
            return round(par * FEE_SCHEDULE_DIRECT["placement"]["rate_pct"])
        if fee_type == "structuring":
            return round(par * FEE_SCHEDULE_DIRECT["structuring"]["rate_pct"])
        if fee_type == "administration":
            return round(par * FEE_SCHEDULE_DIRECT["administration"]["rate_bps"] / 10000)
        return 0

    # ------------------------------------------------------------- NEST P&L

    def nest_pnl(self, deal: dict) -> dict:
        """NEST's actual P&L view of a Deal — only lines NEST collects.

        Under `path_a_advisory_partnered` (ADR-0001 phase 1-2):
            Engagement Retainer + Arrangement Fee + Trail Fee (recurring)
            + optional `nest_rev_share_pct` of Placement Partner Fee
              (per Placement Partner engagement letter).

        Under `ma_nest_direct` / `bd_nest_direct`:
            Full direct schedule (advisory + commitment + placement + structuring
            + ongoing administration).

        Under `bd_sponsored_via_britehorn`:
            NEST Advisors collects advisory-side lines; the BD commission is
            personal income to Sean from Britehorn and is NOT NEST revenue.
            See ADR-0001 "Negative" consequences. We surface the advisory
            bundle here and note the commission separately.

        Return shape:
            {
                "regulatory_path":  <str>,
                "bond_amount":      <int>,
                "lines": [
                    {"label", "amount", "earned_at", "recurring", "note"}, ...
                ],
                "totals": {
                    "at_closing":      <int>,   # one-time NEST revenue at close
                    "annual_recurring":<int>,   # NEST annual after close
                    "lifecycle_total": <int>,   # one-time + lifecycle recurring
                },
                "notes": [<str>, ...],          # disclosure / accounting notes
            }
        """
        path = _regulatory_path(deal)
        par = deal.get("bond_amount", 0) or 0

        if path == PATH_A:
            fees = self._calculate_path_a_fees(deal)
            lines: list[dict] = [
                {
                    "label": "Engagement Retainer",
                    "amount": fees["fees"]["engagement_retainer"]["amount"],
                    "earned_at": "engagement",
                    "recurring": False,
                    "note": "Flat, tiered by par band. Non-refundable for work performed.",
                },
                {
                    "label": "Arrangement Fee",
                    "amount": fees["fees"]["arrangement_fee"]["amount"],
                    "earned_at": "milestones (25/25/25/25)",
                    "recurring": False,
                    "note": "Flat tiered fee, NEVER % of par. Owed for completed milestones even if Deal terminates.",
                },
                {
                    "label": "Trail Fee (annual)",
                    "amount": fees["fees"]["trail_fee"]["amount_annual"],
                    "earned_at": "annual_post_close",
                    "recurring": True,
                    "note": "Annual flat, separate engagement letter. Lifecycle: 30yr.",
                },
            ]
            notes = [
                "Path A: NEST may only collect the Advisory Fee bundle per ADR-0001 substance-over-form constraint.",
                "Placement Fee flows to external Placement Partner (Britehorn in v1) — NOT NEST revenue except via nest_rev_share_pct.",
            ]
            # Optional explicit rev share on Placement Partner Fee.
            placement_partner_fee = fees["fees"]["placement_partner_fee"]["amount"]
            rev_share_pct = float(deal.get("nest_rev_share_pct") or 0)
            if rev_share_pct > 0 and placement_partner_fee > 0:
                rev_share_amount = round(placement_partner_fee * rev_share_pct)
                lines.append({
                    "label": f"Placement Partner Fee — NEST rev share ({rev_share_pct*100:.1f}%)",
                    "amount": rev_share_amount,
                    "earned_at": "pricing",
                    "recurring": False,
                    "note": "Per Placement Partner engagement letter carve-out. Requires written agreement; do not accrue without one.",
                })

            at_closing = sum(l["amount"] for l in lines if not l["recurring"])
            annual_recurring = sum(l["amount"] for l in lines if l["recurring"])
            lifecycle_total = at_closing + annual_recurring * FEE_SCHEDULE_PATH_A["trail_fee"]["lifecycle_years"]

            return {
                "regulatory_path": path,
                "bond_amount": par,
                "lines": lines,
                "totals": {
                    "at_closing": at_closing,
                    "annual_recurring": annual_recurring,
                    "lifecycle_total": lifecycle_total,
                },
                "notes": notes,
            }

        # Direct schedule paths.
        fees = self._calculate_direct_fees(deal)
        lines = [
            {"label": "Advisory Fee",    "amount": fees["fees"]["advisory"]["amount"],    "earned_at": "engagement",        "recurring": False, "note": "Flat minimum."},
            {"label": "Commitment Fee",  "amount": fees["fees"]["commitment"]["amount"],  "earned_at": "commitment_letter", "recurring": False, "note": "% of par."},
            {"label": "Placement Fee",   "amount": fees["fees"]["placement"]["amount"],   "earned_at": "pricing",           "recurring": False, "note": "% of par. Requires active license on relevant path."},
            {"label": "Structuring Fee", "amount": fees["fees"]["structuring"]["amount"], "earned_at": "closing",           "recurring": False, "note": "% of par."},
            {"label": "Administration (annual)", "amount": fees["administration"]["annual"], "earned_at": "monthly", "recurring": True, "note": f"{FEE_SCHEDULE_DIRECT['administration']['rate_bps']} bps annually."},
        ]
        notes = [f"Direct path: {path}. Full % of par schedule permissible under active license per ADR-0001."]

        if path == "bd_sponsored_via_britehorn":
            # Per ADR-0001: Sean's BD commission is personal income from
            # Britehorn, not NEST revenue. Strip the Placement Fee line out
            # of the NEST P&L and surface it as a note.
            placement_line = next((l for l in lines if l["label"] == "Placement Fee"), None)
            if placement_line:
                lines = [l for l in lines if l["label"] != "Placement Fee"]
                notes.append(
                    f"BD commission of ~${placement_line['amount']:,.0f} flows to Sean personally from Britehorn, NOT to NEST Advisors. See ADR-0001 'Negative' consequences."
                )

        at_closing = sum(l["amount"] for l in lines if not l["recurring"])
        annual_recurring = sum(l["amount"] for l in lines if l["recurring"])
        lifecycle_total = at_closing + annual_recurring * FEE_SCHEDULE_DIRECT["administration"]["lifecycle_years"]

        return {
            "regulatory_path": path,
            "bond_amount": par,
            "lines": lines,
            "totals": {
                "at_closing": at_closing,
                "annual_recurring": annual_recurring,
                "lifecycle_total": lifecycle_total,
            },
            "notes": notes,
        }

    # --------------------------------------------------- Cost of Issuance

    def cost_of_issuance(self, deal: dict) -> dict:
        """Cost of Issuance schedule — itemized for the Official Statement.

        Every fee line on the Deal, regardless of who collects it. Includes:
            - NEST fees (path-dependent)
            - Placement Partner Fee
            - Counterparty fees read from `deal["counterparties"]`
              (each role assignment with a `fee` field — see CONTEXT.md
              "Counterparty"). Roles include bond_counsel, trustee,
              financial_advisor, surety_carrier, rating_agent,
              feasibility_consultant, underwriter_counsel, muni_advisor.
            - Capitalized interest reserve (if specified on deal)
            - Debt Service Reserve Fund (DSRF) (if specified on deal)
            - Cost of Issuance contingency (default 1.0% of par, override
              via `deal["coi_contingency_pct"]`).

        Return shape:
            {
                "regulatory_path": <str>,
                "bond_amount": <int>,
                "rows": [
                    {"line_item", "payee", "amount", "category", "source"}, ...
                ],
                "totals": {
                    "nest_fees":           <int>,
                    "placement_partner":   <int>,
                    "professional_fees":   <int>,  # bond counsel, FA, trustee, etc.
                    "rating_and_surety":   <int>,
                    "reserves":            <int>,  # cap-i + DSRF
                    "contingency":         <int>,
                    "total_coi":           <int>,
                    "as_pct_of_par":       <float>,
                },
            }
        """
        path = _regulatory_path(deal)
        par = deal.get("bond_amount", 0) or 0
        rows: list[dict] = []

        # --- NEST fees ----------------------------------------------------
        if path == PATH_A:
            path_a = self._calculate_path_a_fees(deal)
            rows.append({
                "line_item": "Engagement Retainer (NEST Advisors)",
                "payee": "NEST Advisors LLC",
                "amount": path_a["fees"]["engagement_retainer"]["amount"],
                "category": "nest_fees",
                "source": "FEE_SCHEDULE_PATH_A",
            })
            rows.append({
                "line_item": "Arrangement Fee (NEST Advisors)",
                "payee": "NEST Advisors LLC",
                "amount": path_a["fees"]["arrangement_fee"]["amount"],
                "category": "nest_fees",
                "source": "FEE_SCHEDULE_PATH_A",
            })
            # Trail Fee is post-close recurring; not paid from issuance proceeds.
            # We list one year as a disclosure footnote, not a closing-funded line.
            rows.append({
                "line_item": "Trail Fee (Year 1, NOT issuance-funded)",
                "payee": "NEST Advisors LLC",
                "amount": path_a["fees"]["trail_fee"]["amount_annual"],
                "category": "nest_fees_recurring",
                "source": "FEE_SCHEDULE_PATH_A",
            })
            # Placement Partner Fee — appears in COI under Path A.
            rows.append({
                "line_item": "Placement Fee (Placement Partner)",
                "payee": (deal.get("placement_partner") or "Placement Partner TBD"),
                "amount": path_a["fees"]["placement_partner_fee"]["amount"],
                "category": "placement_partner",
                "source": "PLACEMENT_PARTNER_FEE",
            })
        else:
            direct = self._calculate_direct_fees(deal)
            rows.append({
                "line_item": "Advisory Fee (NEST)",
                "payee": "NEST Advisors LLC",
                "amount": direct["fees"]["advisory"]["amount"],
                "category": "nest_fees",
                "source": "FEE_SCHEDULE_DIRECT",
            })
            rows.append({
                "line_item": "Commitment Fee (NEST)",
                "payee": "NEST Advisors LLC",
                "amount": direct["fees"]["commitment"]["amount"],
                "category": "nest_fees",
                "source": "FEE_SCHEDULE_DIRECT",
            })
            rows.append({
                "line_item": "Structuring Fee (NEST)",
                "payee": "NEST Advisors LLC",
                "amount": direct["fees"]["structuring"]["amount"],
                "category": "nest_fees",
                "source": "FEE_SCHEDULE_DIRECT",
            })
            placement_payee = "NEST Advisors LLC" if path in {"ma_nest_direct", "bd_nest_direct"} else (
                deal.get("placement_partner") or "Britehorn Securities"
            )
            placement_category = "nest_fees" if path in {"ma_nest_direct", "bd_nest_direct"} else "placement_partner"
            rows.append({
                "line_item": "Placement Fee",
                "payee": placement_payee,
                "amount": direct["fees"]["placement"]["amount"],
                "category": placement_category,
                "source": "FEE_SCHEDULE_DIRECT",
            })

        # --- Counterparty roles ------------------------------------------
        # Schema per CONTEXT.md "Counterparty": list of role assignments,
        # each with at minimum {role, contact_name|firm_name, fee}. Roles
        # mapped to category buckets for the totals breakdown.
        counterparty_category = {
            "bond_counsel":           "professional_fees",
            "underwriter_counsel":    "professional_fees",
            "issuer_counsel":         "professional_fees",
            "borrower_counsel":       "professional_fees",
            "financial_advisor":      "professional_fees",
            "muni_advisor":           "professional_fees",
            "trustee":                "professional_fees",
            "paying_agent":           "professional_fees",
            "verification_agent":     "professional_fees",
            "feasibility_consultant": "professional_fees",
            "rating_agent":           "rating_and_surety",
            "surety_carrier":         "rating_and_surety",
            "bond_insurer":           "rating_and_surety",
        }

        for cp in (deal.get("counterparties") or []):
            role = (cp.get("role") or "").lower()
            payee = cp.get("firm_name") or cp.get("contact_name") or cp.get("name") or role.replace("_", " ").title()
            fee = cp.get("fee") or 0
            try:
                fee = int(round(float(fee)))
            except (TypeError, ValueError):
                fee = 0
            category = counterparty_category.get(role, "professional_fees")
            rows.append({
                "line_item": role.replace("_", " ").title() if role else "Counterparty Fee",
                "payee": payee,
                "amount": fee,
                "category": category,
                "source": "deal.counterparties",
            })

        # --- Reserves and contingency ------------------------------------
        cap_i = int(deal.get("capitalized_interest_reserve") or 0)
        if cap_i > 0:
            rows.append({
                "line_item": "Capitalized Interest Reserve",
                "payee": "Trustee (held in escrow)",
                "amount": cap_i,
                "category": "reserves",
                "source": "deal.capitalized_interest_reserve",
            })
        dsrf = int(deal.get("debt_service_reserve_fund") or deal.get("dsrf") or 0)
        if dsrf > 0:
            rows.append({
                "line_item": "Debt Service Reserve Fund (DSRF)",
                "payee": "Trustee (held in escrow)",
                "amount": dsrf,
                "category": "reserves",
                "source": "deal.debt_service_reserve_fund",
            })
        contingency_pct = float(deal.get("coi_contingency_pct") or 0.01)  # 1.0% default
        contingency = round(par * contingency_pct)
        if contingency > 0:
            rows.append({
                "line_item": f"Cost of Issuance Contingency ({contingency_pct*100:.2f}% of par)",
                "payee": "Issuer (contingency line)",
                "amount": contingency,
                "category": "contingency",
                "source": "deal.coi_contingency_pct (default 1.0%)",
            })

        # --- Totals ------------------------------------------------------
        def _sum(cat: str) -> int:
            return int(sum(r["amount"] for r in rows if r["category"] == cat))

        nest_fees_total = _sum("nest_fees")  # excludes recurring trail
        placement_partner_total = _sum("placement_partner")
        professional_fees_total = _sum("professional_fees")
        rating_surety_total = _sum("rating_and_surety")
        reserves_total = _sum("reserves")
        contingency_total = _sum("contingency")

        total_coi = (
            nest_fees_total
            + placement_partner_total
            + professional_fees_total
            + rating_surety_total
            + reserves_total
            + contingency_total
        )

        return {
            "regulatory_path": path,
            "bond_amount": par,
            "rows": rows,
            "totals": {
                "nest_fees": nest_fees_total,
                "placement_partner": placement_partner_total,
                "professional_fees": professional_fees_total,
                "rating_and_surety": rating_surety_total,
                "reserves": reserves_total,
                "contingency": contingency_total,
                "total_coi": total_coi,
                "as_pct_of_par": round(total_coi / par * 100, 2) if par else 0,
            },
        }

    # ----------------------------------------------------------- Invoicing

    def generate_invoice(self, deal: dict, milestone_id: str, invoice_number: str = None) -> dict:
        """Generate an invoice for a specific milestone.

        Path-aware: under Path A, line items pull from FEE_SCHEDULE_PATH_A
        (engagement retainer / arrangement-fee milestone slices / trail fee).
        Under the licensed paths, the original % of par lines are used.
        """
        path = _regulatory_path(deal)
        fees = self.calculate_deal_fees(deal)
        milestone = next((m for m in fees["milestones"] if m["id"] == milestone_id), None)

        if not milestone:
            return {"error": f"Milestone {milestone_id} not found"}

        if not invoice_number:
            invoice_number = f"NEST-{deal.get('id', 'XXX')[:8].upper()}-{milestone_id[:4].upper()}-{datetime.utcnow().strftime('%Y%m')}"

        invoice = {
            "invoice_number": invoice_number,
            "date": datetime.utcnow().strftime("%Y-%m-%d"),
            "due_date": (datetime.utcnow() + timedelta(days=30)).strftime("%Y-%m-%d"),
            "bill_to": {
                "name": deal.get("borrower", "Client"),
                "deal": deal.get("name", ""),
            },
            "from": {
                "name": "NEST Advisors",
                "address": "Sean Gilmore & Josh Edwards, Co-Founders",
                "entity": "Arden Edge Capital x Soparrow Capital",
            },
            "regulatory_path": path,
            "milestone": milestone["name"],
            "line_items": [],
            "subtotal": 0,
            "status": "draft",
        }

        par = deal.get("bond_amount", 0) or 0

        if path == PATH_A:
            # Path A line items.
            if milestone_id == "engagement":
                invoice["line_items"].append({
                    "description": f"Engagement Retainer — flat by par band (${par:,.0f} par)",
                    "amount": _tier_lookup(FEE_SCHEDULE_PATH_A["engagement_retainer"]["tiers"], par),
                })
            elif milestone_id.startswith("arrangement_"):
                slice_pct = next((m["pct"] for m in ARRANGEMENT_FEE_MILESTONES if f"arrangement_{m['id']}" == milestone_id), 0)
                af = _tier_lookup(FEE_SCHEDULE_PATH_A["arrangement_fee"]["tiers"], par)
                invoice["line_items"].append({
                    "description": f"Arrangement Fee — {milestone['name']} ({int(slice_pct*100)}% of ${af:,.0f} tier)",
                    "amount": round(af * slice_pct),
                    "note": "Flat tiered Arrangement Fee per ADR-0001. NOT % of par. Owed for completed work product.",
                })
            elif milestone_id == "trail":
                invoice["line_items"].append({
                    "description": "Trail Fee — annual flat advisory (post-close monitoring)",
                    "amount": _tier_lookup(FEE_SCHEDULE_PATH_A["trail_fee"]["tiers"], par),
                    "note": "Billed annually under separate Trail engagement letter. Not netted from bond payments.",
                })
            elif milestone_id == "placement_partner":
                invoice["line_items"].append({
                    "description": "Placement Fee — collected by Placement Partner, NOT NEST. Disclosure only.",
                    "amount": 0,
                    "note": "Under Path A this flows to the external Placement Partner (Britehorn in v1). Not a NEST receivable.",
                })
        else:
            # Direct path line items (preserved from original logic).
            if milestone_id == "engagement":
                invoice["line_items"].append({
                    "description": "Financial Advisory Fee — deal evaluation, capital structure recommendation",
                    "amount": FEE_SCHEDULE_DIRECT["advisory"]["rate_flat"],
                })
            elif milestone_id == "commitment":
                invoice["line_items"].append({
                    "description": f"Commitment Fee — {FEE_SCHEDULE_DIRECT['commitment']['rate_pct']*100:.2f}% of ${par:,.0f} par",
                    "amount": round(par * FEE_SCHEDULE_DIRECT["commitment"]["rate_pct"]),
                })
            elif milestone_id == "pricing":
                invoice["line_items"].append({
                    "description": f"Placement Fee — {FEE_SCHEDULE_DIRECT['placement']['rate_pct']*100:.2f}% of ${par:,.0f} par",
                    "amount": round(par * FEE_SCHEDULE_DIRECT["placement"]["rate_pct"]),
                })
            elif milestone_id == "closing":
                invoice["line_items"].append({
                    "description": f"Structuring Fee — {FEE_SCHEDULE_DIRECT['structuring']['rate_pct']*100:.1f}% of ${par:,.0f} par",
                    "amount": round(par * FEE_SCHEDULE_DIRECT["structuring"]["rate_pct"]),
                })
                invoice["line_items"].append({
                    "description": "Expense Reimbursement — rating agency fees, legal, travel (actual costs)",
                    "amount": 0,
                    "note": "Amount to be confirmed with expense report",
                })

        invoice["subtotal"] = sum(item["amount"] for item in invoice["line_items"])
        return invoice

    def generate_admin_invoice(self, deal: dict, period: str) -> dict:
        """Generate monthly/quarterly recurring invoice.

        Under Path A this is the Trail Fee (annual flat, prorated to period).
        Under the licensed paths this is the bps-of-par administration fee.
        """
        path = _regulatory_path(deal)
        par = deal.get("bond_amount", 0) or 0

        if path == PATH_A:
            annual = _tier_lookup(FEE_SCHEDULE_PATH_A["trail_fee"]["tiers"], par)
            monthly = round(annual / 12)
            label = "Trail Fee"
            detail = "Post-close advisory: covenant monitoring, refunding-window surveillance, ramp-up support, rating-recap analysis."
            rate_str = f"Annual flat ${annual:,.0f} (par band ${par:,.0f}). Path A — see ADR-0001."
        else:
            annual = round(par * FEE_SCHEDULE_DIRECT["administration"]["rate_bps"] / 10000)
            monthly = round(annual / 12)
            label = "Bond Administration"
            detail = "Debt service calculation, covenant monitoring, EMMA filings, trustee coordination, reserve management"
            rate_str = f"{FEE_SCHEDULE_DIRECT['administration']['rate_bps']} bps annually on ${par:,.0f} par"

        return {
            "invoice_number": f"NEST-ADMIN-{deal.get('id', 'XXX')[:8].upper()}-{period}",
            "date": datetime.utcnow().strftime("%Y-%m-%d"),
            "due_date": (datetime.utcnow() + timedelta(days=15)).strftime("%Y-%m-%d"),
            "bill_to": {"name": deal.get("borrower", "Client"), "deal": deal.get("name", "")},
            "from": {"name": "NEST Advisors"},
            "regulatory_path": path,
            "period": period,
            "line_items": [
                {
                    "description": f"{label} — {period}",
                    "detail": detail,
                    "amount": monthly,
                    "rate": rate_str,
                },
            ],
            "subtotal": monthly,
            "status": "draft",
        }

    # ------------------------------------------------------------- Economics

    def deal_economics(self, deal: dict) -> dict:
        """Full economic analysis of a Deal for NEST — what do we earn?

        Wraps `nest_pnl(deal)` so existing callers continue to see the
        legacy {revenue_at_closing, recurring_revenue, ramp_rebate,
        total_economics} shape, but the underlying numbers now correctly
        reflect the regulatory path per ADR-0001.
        """
        path = _regulatory_path(deal)
        par = deal.get("bond_amount", 0) or 0
        pnl = self.nest_pnl(deal)

        # Ramp rebate (if construction deal with P-card) — unchanged.
        ramp_eligible_spend = (deal.get("total_project_cost") or 0) * 0.60
        ramp_rebate_annual = round(ramp_eligible_spend * 0.015 / 3)
        ramp_rebate_total = round(ramp_eligible_spend * 0.015)

        # Map pnl lines back into a legacy-shaped revenue_at_closing dict.
        revenue_at_closing: dict[str, Any] = {}
        if path == PATH_A:
            fees = self._calculate_path_a_fees(deal)
            revenue_at_closing = {
                "engagement_retainer": fees["fees"]["engagement_retainer"]["amount"],
                "arrangement_fee":     fees["fees"]["arrangement_fee"]["amount"],
                # Disclosure only — NOT NEST revenue under Path A.
                "placement_partner_fee_disclosure": fees["fees"]["placement_partner_fee"]["amount"],
                "total": pnl["totals"]["at_closing"],
            }
        else:
            fees = self._calculate_direct_fees(deal)
            revenue_at_closing = {
                "structuring_fee": fees["fees"]["structuring"]["amount"],
                "placement_fee":   fees["fees"]["placement"]["amount"],
                "commitment_fee":  fees["fees"]["commitment"]["amount"],
                "advisory_fee":    fees["fees"]["advisory"]["amount"],
                "total":           pnl["totals"]["at_closing"],
            }

        recurring_annual = pnl["totals"]["annual_recurring"]
        lifecycle_years = FEE_SCHEDULE_PATH_A["trail_fee"]["lifecycle_years"] if path == PATH_A \
            else FEE_SCHEDULE_DIRECT["administration"]["lifecycle_years"]
        recurring_lifecycle = recurring_annual * lifecycle_years

        return {
            "deal": deal.get("name", ""),
            "regulatory_path": path,
            "bond_amount": par,
            "revenue_at_closing": revenue_at_closing,
            "recurring_revenue": {
                "administration_annual": recurring_annual,
                "administration_monthly": round(recurring_annual / 12),
                "administration_30yr": recurring_lifecycle,
            },
            "ramp_rebate": {
                "eligible_spend": round(ramp_eligible_spend),
                "rebate_rate": 0.015,
                "annual_estimate": ramp_rebate_annual,
                "total_estimate": ramp_rebate_total,
            },
            "total_economics": {
                "year_1": pnl["totals"]["at_closing"] + recurring_annual + ramp_rebate_annual,
                "year_2_onwards": recurring_annual,
                "lifetime_30yr": pnl["totals"]["at_closing"] + recurring_lifecycle + ramp_rebate_total,
            },
            "pnl_notes": pnl["notes"],
        }
