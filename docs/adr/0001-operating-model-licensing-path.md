# ADR-0001: Operating Model — Layered Licensing Path

**Status:** Accepted · 2026-05-28
**Owners:** Sean Gilmore (lead Registered Principal), Josh Edwards (Co-Founder)

## Context

NEST Advisors performs work that crosses three regulatory regimes: advisory (no securities license required), municipal advisor (MSRB), and broker-dealer (FINRA). Whether NEST can directly collect a transaction-based fee on a given Deal depends entirely on which license is active at the time of the transaction.

The naive options each have a problem:

- **Stay advisory-only forever.** NEST never collects placement / success fees on its own; all transaction-based economics flow through outside firms. Permanent margin compression.
- **Stand up a NEST-owned Broker-Dealer immediately.** ~12-18 months including Series 7 + 24 + 63 study, FINRA application, capital reserve, compliance program. Zero revenue from placement during that window. High capital + ops cost.
- **Wait to charge anything until licensed.** Kills runway. Jacaranda Trace, Convivial St. Petersburg, and the rest of the visible pipeline cannot close, generate cash, or build the firm's track record.

A fourth path emerged from the v1 partner landscape: **Britehorn Securities** (FINRA BD #36402) operates as a platform broker-dealer, hosting 40+ outside-banker registered reps under their license. This is Britehorn's stated business model, not an exception. NEST's principals can register *at Britehorn* and collect transaction-based commissions through Britehorn while NEST Advisors LLC separately collects advisory fees.

A fifth path also exists: **Municipal Advisor registration (MSRB, Series 50 + 54)**. Far faster than full BD stand-up, and lets NEST directly collect transaction-based fees on muni transactions — which is ~80% of the visible pipeline (senior living, CCRC, charter schools, affordable housing).

## Decision

NEST executes a **layered licensing strategy** combining all three lawful capture mechanisms:

| Track | Vehicle | Licenses required | Captures fees on | Timeline |
|---|---|---|---|---|
| **Today** | NEST Advisors LLC (advisory) | None | Advisory work product on any Deal | Now |
| **Track 1 (fast, ~3 mo)** | Sean as registered rep at Britehorn Securities | Series 7 + 24 + 63 | Transaction-based commissions on any Deal placed through Britehorn — muni or non-muni | ~3 months |
| **Track 2 (fast, ~4-5 mo)** | NEST Advisors LLC as Municipal Advisor | Series 50 + 54 | Direct transaction-based Advisory/Arrangement fees on muni transactions | ~4-5 months |
| **Track 3 (long-term, optional)** | NEST Broker-Dealer LLC | Track 1 licenses + FINRA member firm | Direct placement fees on all transactions | ~12-18 months |

**The interim Path A construction applies to every Deal that proceeds to placement before Track 1 or Track 2 is live.** Under Path A, NEST collects an Advisory Fee bundle (Engagement Retainer + Arrangement Fee + Trail Fee, structured to avoid % of par and tied to delivered work product); placement flows through a Placement Partner (Britehorn, initially) which collects the Placement Fee under its own BD license.

**Britehorn Securities is the inaugural Placement Partner and Sean's Track 1 host BD.** Outreach launched 2026-05-29 with three asset packages (HBO2 Therapeutics, Celebrity Crush, Jacaranda Trace) framed as platform engagement, not transactional. See `reference_britehorn.md` and `project_brett_outreach.md` in memory for active campaign state.

**Every Deal in the platform carries a `regulatory_path` enum** that determines fee mechanics, counterparty composition, and disclosure language at the time of the transaction:

- `path_a_advisory_partnered` — NEST as advisor; external Placement Partner places. Arrangement Fee construction required.
- `bd_sponsored_via_britehorn` — Sean as Britehorn-sponsored registered rep. Transaction-based commission permissible via Britehorn.
- `ma_nest_direct` — NEST Advisors LLC as MSRB-registered MA. Transaction-based fee permissible directly.
- `bd_nest_direct` — NEST BD LLC as FINRA member firm. Placement fee permissible directly.

## Consequences

**Positive.** Time-to-first-direct-fee on muni reduces from ~12-18 months to ~3 months (Sean at Britehorn covers everything; MA registration follows). Capital outlay deferred — no NEST BD stand-up required to start generating placement-side economics. Compatible with shipping Jacaranda + St. Petersburg this quarter.

**Negative.** Sean's brokerage commissions during the Britehorn-sponsored phase flow as personal income from Britehorn, not as NEST revenue — accounting complexity. Britehorn's compliance program governs Sean's deals during the sponsorship; supervisory state is split between NEST advisory and Britehorn brokerage. Britehorn keeps a share of every brokered fee, capping NEST's pure-NEST margin. Track 3 (NEST-owned BD) is now optional rather than required, so the firm may stay on Britehorn's platform indefinitely if economics work — that's a strategic decision the firm can make later.

**Platform impact.** Every Deal record requires a `regulatory_path` field, and the Fee Generator (see `services/billing_engine.py`) must split NEST-collected fee lines from Placement Partner fee lines per ADR-0001 path. The Series 7 + 24 (Track 1) and Series 50 + 54 (Track 2) study modules are v1 platform surfaces — Sean studies while running deals.

## Notes

This decision is informed by the substance-over-form test the SEC and FINRA apply to advisory vs brokerage activity. The Arrangement Fee construction (no % of par, milestone-tied to delivered work product, owed regardless of placement outcome) is the standard lawful structure for advisory-side compensation by an unregistered firm. Confirm with securities counsel before papering each engagement letter.

This ADR supersedes any prior implicit assumption that NEST would stand up a Broker-Dealer as a prerequisite to revenue. NEST never required its own BD; it required *access to* a BD's license, which Britehorn provides under Track 1.
