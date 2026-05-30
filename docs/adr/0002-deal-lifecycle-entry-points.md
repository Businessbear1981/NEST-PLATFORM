# ADR-0002: Deal Lifecycle Entry Points & Intake Brainstorm

**Status:** Accepted · 2026-05-28
**Owners:** Sean Gilmore

## Context

The platform has two surfaces that look like Deal birth points: **EagleEye** (signals from EMMA / EDGAR / FINRA / OSINT) and **Deal Input** (manual sponsor-facing intake form with NAICS, loan amount, LTV, target rating). The Operating Framework v1 describes Stage 0 (Triage) as "the moment a sponsor provides asset class, location, project size, capital stack, timing, sponsor identity" — which maps cleanly to Deal Input.

The question the framework leaves open: does an EagleEye signal ever become a Deal automatically, or does a Deal only ever get born through Deal Input?

Separately, Sean has described an **Intake Brainstorm** step between Deal Input and Roots ingestion that is not in the Operating Framework's mechanical Stage 0 → Stage 1 sequence — a Bernard-driven preliminary assessment that helps founders decide whether to pursue a Deal *before* committing to the full document-collection workload.

## Decision

**There is one front door for Deal creation: the `deals` table row is only inserted by the Deal Input surface.** EagleEye does not insert into `deals`. EagleEye lives in its own `signals` / `prospects` tables and never auto-promotes.

**EagleEye carries a "Promote to Deal" action.** When a founder reviews an EagleEye signal and decides it's worth pursuing, clicking "Promote to Deal" pre-fills the Deal Input form with everything EagleEye already knows (asset class, location, sponsor identity, estimated size, comparable patterns), and the founder completes the remaining fields manually. The Promote action is a human judgment call, consistent with §4.15's principle that judgment lives in the human layer.

So there are two paths into the Deal lifecycle, both converging at Deal Input:

```
Inbound sponsor ─────────────────────────► Deal Input
                                              │
EagleEye signal → human review → Promote ──► Deal Input
                                              │
                                              ▼
                                       Stage 0 Triage
                                              │
                                              ▼
                                     Intake Brainstorm
                                              │
                                              ▼
                                  Stage 1 Roots Ingestion
```

**NAICS → bond type → required documents is a deterministic rules engine, not AI inference.** The NAICS code entered at Deal Input drives a structured backend lookup that returns the eligible bond type(s) (from Bible Appendix A — Bond Type Decision Table), the document checklist (from Bible Silo 4 — Documents), and the feasibility study requirements (whether one is needed, what kind — healthcare feasibility vs housing market study vs charter school enrollment study). The mapping lives as data, not inference. Bernard does not "decide" the bond type; Bernard *explains* the rule-engine output.

**The Intake Brainstorm is a Bernard surface that fires after Deal Input is submitted and before Roots kicks off.** It does two things simultaneously:

1. **First-look memo.** Bernard synthesizes the NAICS rule-engine output, the JPM credit benchmarks from `CLAUDE.md` (A-grade DSCR > 2.0, BBB+ > 1.75, etc.), comparable deal patterns from EMMA, and the structural template (e.g., Jacaranda Trace PLOM for senior living conduit), and produces a one-page "first look" memo. Sections: bond type assessment, credit profile snapshot, structural template recommendation, deal-killer flags.
2. **Gap-filling questions.** Bernard surfaces a targeted, structured Q&A back to the founder (and optionally the sponsor) to fill information not captured by Deal Input — sponsor history, project timeline, construction vs. stabilized, credit enhancement needs, existing bond/debt outstanding, special legal structure. Answers update the Deal record and feed Stage 1.

Founders review the first-look memo, answer the gap-fillers, then explicitly greenlight or kill. Only on greenlight does the Deal advance to Stage 1 (Roots document ingestion).

## Consequences

**Positive.** Single canonical insertion point for the `deals` table simplifies the database invariants and the audit story. EagleEye stays scoped as an intelligence layer feeding the front door, not an executor. The deterministic NAICS rules engine is testable, explainable, and avoids the failure mode of AI deciding the bond type and being wrong. The Intake Brainstorm gives founders a cheap "should we pursue" filter before the expensive document-collection process kicks off — protecting the team's time on deals that should never have advanced.

**Negative.** Founders must actively review and Promote EagleEye signals; there's no autopilot. For high-volume sourcing this could become a bottleneck — mitigated by EagleEye's scoring rendering only the highest-priority signals to the review queue. The NAICS rules engine must be kept current; bond-type eligibility changes (IRS rulings, Dodd-Frank-style legislative changes) require manual updates to the lookup data. The Intake Brainstorm adds a step that, if poorly executed, becomes friction; the platform must keep it tight (~5 minutes for the founder to review and answer).

**Platform impact.**

- EagleEye admin page (`/eagleeye-v2`) gets a "Promote to Deal" button on each signal/prospect row that transitions to Deal Input with prefilled fields via query string or session state.
- A new backend module — `services/naics_rules_engine.py` — implements the NAICS → bond type → docs → feasibility lookup, sourced from Bible Appendix A + C.
- A new Bernard surface — `services/intake_brainstorm.py` or extension of `preflight_service.py` — runs the first-look memo + gap-filling pipeline after Deal Input submission.
- Deal Input form's existing "complete the intake brainstorm" copy now maps to a real flow, not a stub.
