# NEST Platform — Domain Glossary

> This file captures the canonical meaning of domain terms used across the NEST platform.
> It is **not** a spec, a task list, or an architecture document.
> Implementation details belong in code; architectural decisions belong in `docs/adr/`.

---

## Deal

A **Deal** is the top-level envelope that tracks a single engagement through the firm's pipeline. Every Deal has a type, a status, contacts, documents, and notes. The Deal itself carries only the shared attributes common to all engagement types.

A Deal's **type** determines which business line governs its structuring and lifecycle. There are exactly **two business lines**:

- **Bond** — the flagship. Municipal/private bond origination, structuring, placement, and administration. M&A-sourced deals (via Merlin) are financed through bonds and live inside this module. Full workflow: intake, Roots (documents), credit analysis, tranche structuring, waterfall, covenants, draws, surety, placement, post-close monitoring.
- **Sparrow** — structured debt brokerage. Bridge loans, lines of credit, owner-occupied CRE, investment CRE, direct lending placement. LenderScout is the matching engine. Workflow is similar to Bond but significantly shorter on process. Has its own Roots desk, deal flow, and credit engine.

These two business lines are **separate modules** with separate workflows. A deal is assigned to one at intake and does not migrate between them. Cross-selling happens at the relationship level, not the deal level.

## M&A / Merlin

**M&A is not a separate business line.** Merlin (the M&A intelligence agent) is a sourcing and diligence tool that lives inside the Bond module. It finds acquisition targets, scores them, models IRR, and produces business plans — but the financing is always bonds. An M&A-sourced deal enters the Bond structuring pipeline like any other bond deal.

## Scout

A **Scout** is a persistent, cross-industry search profile that runs continuously against connected data sources (EMMA, EDGAR, county permits, UCC filings, FRED, etc.). Scouts are multi-dimensional — not limited to one sector or parameter. Example: "pre-revenue companies with public DoD contracts and EBITDA >$20M." Scouts also mirror partner organizations (Hylant, rating agencies) to handle operational back-and-forth processes with those partners.

A Scout can also be derived from a live deal — "find me more like this one" — enabling direct marketing of a process already in motion.

## Signal

A **Signal** is a raw intelligence hit from a data source, surfaced by a Scout. A Signal is not a prospect — it is unqualified information. Signals are scored by a multi-node system; when a Signal hits 3+ nodes, it graduates to a Prospect.

## Prospect

A **Prospect** is a graduated Signal that enters the marketing pipeline. Prospects live in the **Prospect Repository** and are engaged autonomously by the marketing desk (8-touch strategy, fireside chat invitations, webcasts, industry content). No manual trigger is required — the marketing sequence runs on its own across all channels (email, LinkedIn, events, content).

## Client

A **Client** is a Prospect who has engaged and entered an active relationship. There is no hard promotion gate between Prospect and Client — the main dashboard shows prospects and clients in various stages along a continuous pipeline. As engagement deepens, more platform tools engage automatically.

## Live Deal Correspondence

Every active deal receives its own correspondence address (email inbox or identifier). An AI agent mediates all inbound and outbound communication. Example: a rating agency sends a follow-up question → the agent captures it → surfaces it in the dashboard → the client answers → the agent records the answer, updates the relevant package, and checks the compliance box. All correspondence is logged in the deal repository.

## Payload

**Payload** is the cognitive operating system that sits above NEST and all other AE Labs properties. It is a military C2-style "power strip" interface — "Windows for AI, built on Claude." NEST is one workspace (tenant/plug) inside Payload. Payload is a separate codebase and a separate product. NEST's UI must ultimately conform to Payload's plug architecture and aesthetic language, but NEST is built and deployed independently.

Payload's architecture: 30+ sockets across six rails (BRAND, AI, SOCIAL, COMMERCE, INFRA, OPS). Every service is a "plug" implementing the same five-method contract (`status`, `connect`, `disconnect`, `fetch`, `emit`). NEST is a brand plug alongside MMY, Knock Knock, Finesse, Bitmoji, and AE Labs.

## OSINT

**OSINT** (Open Source Intelligence) is a platform-level intelligence capability — not NEST-specific. It builds ecosystem dossiers around any entity: clients, prospects, people, places, companies. It feeds into EagleEye, Aria, and any other tool that needs enriched entity data. OSINT is subject to ADR-0015 guardrails (audit logging, use-case declaration, no facial search of minors, rate limits).

## Sub-Industry Silo

A **Sub-Industry Silo** emerges organically from deal flow and Scout activity. When pattern clustering is detected in a sector (3+ deals or signals in the same NAICS grouping), the platform recognizes a silo and begins building specialized intelligence for that vertical. Silos are not manually created — they form as the firm's deal activity concentrates.

## BD — disambiguation

The acronym **BD** is overloaded in the platform. Always disambiguate:

- **Business Development (BD)** — the deal-sourcing and outreach function performed by the BD Desk and Aria. Routes live at `/api/bd/*`; engine is `services/bd_engine.py`. This is what *Bullseye Pitch* and *Boxing Out* drive.
- **Broker-Dealer (BD)** — a FINRA-registered entity authorized to place securities and collect placement / success fees. NEST is **not** a registered Broker-Dealer in its v1 form (see *Placement Partner* below). Code that touches placement licensing, supervisory state, or success-fee math should live under a `broker_dealer` namespace, never under `bd_engine`.

Whenever "BD" appears in user-facing copy, label it `Business Development` or `Broker-Dealer` explicitly. Internal code should use the full noun in module names.

## Licensing path (hybrid, locked)

NEST is pursuing a **layered licensing strategy** to maximize lawful fee capture across muni and non-muni transactions while minimizing time-to-first-direct-fee.

**Track 1 — Municipal Advisor (fast, NEST-direct on muni).** Sean Gilmore takes **Series 50** (~6 weeks study) and **Series 54** (~6 weeks study), then NEST Advisors LLC registers with MSRB as a Municipal Advisor. Total: ~4-5 months. Once active, NEST collects **transaction-based Advisory/Arrangement fees directly** on any muni transaction (501(c)(3), PAB §142, governmental purpose). This covers ~80% of the visible v1 pipeline — Jacaranda Trace, Convivial St. Petersburg, Palmetto Ridge, Meridian Cove, Life Star Pointe Loop.

**Track 2 — BD-Sponsored Registered Rep at Britehorn (fast, non-muni and M&A).** Sean takes **Series 7 + 24 + 63** (~3 months study) and registers as a **registered representative at Britehorn Securities** (FINRA BD #36402) under their existing license. This is Britehorn's stated platform business — hosting outside bankers under their BD. Once registered, Sean can collect **transaction-based commissions on any deal placed through Britehorn**, with NEST simultaneously collecting Advisory Fees on the same engagements. Total: ~3 months — dramatically faster than standing up a NEST-owned BD. See *Britehorn (active Placement Partner)* below.

**Track 3 — NEST-owned Broker-Dealer (optional, long-term).** If economics ever justify leaving the Britehorn platform, NEST stands up its own Broker-Dealer LLC. Total: ~12-18 months including FINRA application, capital reserve, and supervisory program. Not on the v1 critical path.

**Operating phases.** Every Deal carries a `regulatory_path` enum that determines fee mechanics, counterparty composition, and disclosure language:

| Phase | Window | `regulatory_path` for muni Deals | `regulatory_path` for non-muni Deals |
|---|---|---|---|
| 1. Pre-license | months 0-3 | `path_a_advisory_partnered` (NEST as advisor; Britehorn places) | `path_a_advisory_partnered` |
| 2. Sean licensed at Britehorn, MA pending | months 3-5 | `path_a_advisory_partnered` + Sean rep commission via Britehorn | `bd_sponsored_via_britehorn` (Sean as rep collects commissions; NEST collects advisory) |
| 3. MA active | months 5+ | `ma_nest_direct` (NEST collects direct on muni) | `bd_sponsored_via_britehorn` |
| 4. NEST-owned BD (optional) | months 12-18+ | `ma_nest_direct` or `bd_nest_direct` | `bd_nest_direct` |

Series 50/54 and Series 7/24/63 study modules are both v1 surfaces. The Arrangement Fee construction (no % of par, milestone-tied, work-product-substance) applies to every Deal under `path_a_advisory_partnered`. Under `ma_nest_direct`, `bd_sponsored_via_britehorn`, or `bd_nest_direct`, transaction-based fees are permissible by the relevant licensed entity (NEST as MA, Sean as Britehorn rep, NEST BD respectively).

## Britehorn — active Placement Partner

**Britehorn Securities** (FINRA BD #36402, HQ Denver, second office Delray Beach FL) is NEST's inaugural Placement Partner and the host BD for Sean's Track 2 sponsorship. Primary contact: **Brett Story**, Founding Partner (brett@britehorn.com).

Britehorn operates as a **platform broker-dealer** — they host 40+ outside bankers under their license rather than running a centralized M&A shop. This is the operating model NEST is engaging: Britehorn provides FINRA cover; NEST runs the mandates. Britehorn's affiliated middle-market IB is **Britehorn Partners**.

The Brett engagement is framed not as "buy our deals" but as **platform engagement / BD-sponsorship**, with three live deals attached as proof-of-pipeline (HBO2 Therapeutics, Celebrity Crush, Jacaranda Trace). Launch target was 2026-05-29.

Britehorn appears in the Counterparty schema in two distinct ways:
- As an **entity-level `bd_sponsor` Counterparty** (relationship across all Deals where Sean acts as a Britehorn-sponsored rep) — Brett is the firm Contact, the relationship is enterprise-wide
- As a **per-Deal `placement_partner` Counterparty** (when Britehorn places a specific Deal even outside the sponsorship relationship)

Public M&A track record is thin (Aug 2025: Requordit; specialty sauce manufacturer; ~6 deals tracked through Sep 2025). **Zero publicly visible healthcare/biotech deals** — material sector-fit flag when pitching HBO2.

## Advisory Fee

An **Advisory Fee** is what NEST charges and keeps directly for structuring, modeling, feasibility consulting, credit memo preparation, rating agency engagement, and surety placement work. These activities are advisory in nature and do not require FINRA Broker-Dealer registration. Advisory Fees are billed by NEST Advisors LLC.

The Advisory Fee category is an umbrella that includes the **Engagement Retainer**, the **Arrangement Fee** (see below), and the **Trail Fee** for post-close advisory.

## Arrangement Fee

An **Arrangement Fee** is the lawful, advisory-side payment to NEST for the structuring and arrangement work performed on a Deal — the work product itself (structuring spec, financial model, rating package, document coordination, working group orchestration), not the placement.

The substance of the Arrangement Fee must be advisory, not brokerage. SEC and FINRA evaluate substance over form. To remain on the advisory side of the line:

- **Quantum is fixed dollars or tiered by deal-size band**, not calculated as a percentage of par.
- **Payment milestones tie to specific deliverables**, not solely to deal closing. A typical engagement: 25% on engagement letter execution, 25% on credit memo delivery, 25% on rating obtained, 25% on closing.
- **The fee remains owed if the deal terminates** after the deliverable has been performed (or has a documented termination/wind-down schedule).
- **The fee scales with work, not with placement success**. Larger deals justify tier-up because they require more analytical depth, not because the placement is bigger.

A fee that is calculated as a percentage of par, paid only at close, and contingent on placement success is treated as **transaction-based compensation** and constitutes unregistered broker activity. Such fees may only be collected through a registered Broker-Dealer (i.e., the Placement Partner — see *Placement Fee*).

ADR-0002 will memorialize this structure and the supporting counsel review (queued).

## Trail Fee

A **Trail Fee** is the ongoing, periodic fee paid to NEST after closing for post-close advisory: covenant monitoring, refunding-window surveillance, ramp-up support, rating-recap analysis. Trail Fees are typically annual fixed dollars or annual hourly-banded, not bps-of-par. They are paid by the Borrower under the Trail engagement letter, not netted from bond payments.

## Placement Fee

A **Placement Fee** is the success fee paid when bonds (or other securities) are sold to investors. Under U.S. securities law, only a FINRA-registered Broker-Dealer may collect a Placement Fee. In NEST's v1 operating model, Placement Fees flow through a **Placement Partner** (see below), not through NEST Advisors. Once NEST's principals complete Series 7 + 24 + 63 and stand up a NEST Broker-Dealer entity, Placement Fees can flow to that entity directly.

## Placement Partner

A **Placement Partner** is an external, FINRA-registered Broker-Dealer that places bonds on NEST's behalf. The Placement Partner collects the Placement Fee and may share economics with NEST per the engagement agreement. Examples in the v1 universe include the original underwriter on a refunding (e.g., Piper Sandler on Jacaranda Trace's Series 2025), boutique muni BDs, and insurance-affiliated BDs such as Hylant's. Every Deal that proceeds to placement must record its Placement Partner.

## Contact

A **Contact** is an entry in NEST's universal address book. A Contact is either a **person** (David Rosenberg, MD at Greenberg Traurig) or a **firm** (Greenberg Traurig the firm). Person Contacts link to a firm Contact via `firm_id`. Contact fields include name, email, phone, title, firm, LinkedIn, OSINT dossier reference, free-form notes, and a `serves_as` array enumerating which Counterparty roles this Contact is qualified to fill (e.g., a Greenberg Traurig partner has `serves_as = ["bond_counsel"]`).

A Contact exists independently of any Deal. The same Contact can become a Counterparty on many Deals over time. Contacts also include Sean's professional network — CFOs met at NIC, former JPMorgan colleagues, etc. — that have not yet (or may never) become Counterparties.

The "partners database" surface is a filtered view of Contacts where `type = "firm"` and `serves_as` includes at least one role.

## Counterparty

A **Counterparty** is a **role assignment on a specific Deal** that points at a Contact. The Counterparty record carries the Deal-specific facts: which role (`bond_counsel`, `trustee`, `financial_advisor`, `surety_carrier`, `placement_partner`, `rating_agent`, `feasibility_consultant`, `construction_lender`, `underwriter_counsel`, `muni_advisor`), what fee economics apply for this role on this Deal, what the engagement letter says, and the named Contact filling the role.

The same Contact may be the bond counsel Counterparty on eight Deals; each is a separate Counterparty row. Counterparty fee economics are deal-specific even when the Contact is the same firm — Greenberg Traurig may quote $250k on a $50M deal and $400k on a $231M deal.

Fee math is attached to the Counterparty role, not to the Contact. OSINT enrichment is attached to the Contact, and rides along to every Counterparty that names it.
