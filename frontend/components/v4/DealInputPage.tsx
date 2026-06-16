"use client";
const _API = process.env.NEXT_PUBLIC_API_URL || "https://api.ardanedgecapital.com";
import { useRouter } from "next/navigation";
/**
 * Deal Input — Simple intake to create the deal vehicle.
 * Basics only: name, sponsor, sector/NAICS, deal type, rough size.
 * After submit the page transitions to the Intake Brainstorm view (ADR-0002):
 * Bernard produces a first-look memo + targeted gap Q&A. Founder reviews,
 * answers the gap-fillers, then Greenlights (→ Roots Stage 1 at /upload) or
 * Parks (saves answers, no advance).
 *
 * Bond structuring happens LATER after docs, credit, and rating are complete.
 */
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DEAL_TYPES = [
  { value: "ma_acquisition", label: "M&A Acquisition", description: "Financing a merger or acquisition — bond, bank, or equity" },
  { value: "construction", label: "Construction & Development", description: "New construction or substantial rehabilitation" },
  { value: "working_capital", label: "Working Capital", description: "Operating liquidity for an existing business" },
  { value: "equipment", label: "Equipment Finance", description: "Asset-backed financing matched to useful life" },
  { value: "real_estate", label: "Real Estate Acquisition", description: "Acquisition of stabilized real estate" },
  { value: "refunding", label: "Refunding / Refinancing", description: "Refinancing existing debt at better terms" },
  { value: "equity_raise", label: "Equity Raise / Capital Raise", description: "Equity placement — sponsor, LP, co-invest, or public" },
  { value: "ci_lending", label: "C&I Lending", description: "Commercial & industrial term loan or revolver" },
  { value: "bridge", label: "Bridge Financing", description: "Short-term bridge to permanent financing or sale" },
  { value: "mezzanine", label: "Mezzanine / Subordinated Debt", description: "Junior capital — mezz, second lien, preferred equity" },
  { value: "general_advisory", label: "General Advisory", description: "Evaluate the deal — we recommend the right capital solution" },
];

const SECTORS = [
  { value: "software_saas", label: "Software / SaaS", naics: "511210" },
  { value: "healthcare_services", label: "Healthcare Services", naics: "621" },
  { value: "business_services", label: "Business Services", naics: "561" },
  { value: "industrial_manufacturing", label: "Industrial Manufacturing", naics: "31-33" },
  { value: "distribution", label: "Distribution", naics: "423" },
  { value: "consumer_products", label: "Consumer Products", naics: "311-316" },
  { value: "trucking_logistics", label: "Trucking & Logistics", naics: "484" },
  { value: "specialty_contractors", label: "Specialty Contractors", naics: "238" },
  { value: "energy_services", label: "Energy Services", naics: "213" },
  { value: "financial_services", label: "Financial Services", naics: "523" },
  { value: "senior_living", label: "Senior Living / CCRC", naics: "623311" },
  { value: "hospitals", label: "Hospitals / Healthcare", naics: "622110" },
  { value: "charter_schools", label: "Charter Schools", naics: "611110" },
  { value: "higher_education", label: "Higher Education", naics: "611310" },
  { value: "affordable_multifamily", label: "Affordable Multifamily", naics: "531110" },
  { value: "hospitality", label: "Hotels & Hospitality", naics: "721110" },
  { value: "data_centers", label: "Data Centers", naics: "518210" },
];

const SPONSOR_TYPES = [
  { value: "pe_firm", label: "Private Equity Firm" },
  { value: "family_office", label: "Family Office" },
  { value: "strategic_acquirer", label: "Strategic Operating Company" },
  { value: "nonprofit", label: "501(c)(3) Nonprofit" },
  { value: "government", label: "Government Entity" },
  { value: "developer", label: "Real Estate Developer" },
];

const inputClass = "w-full rounded-lg border border-[#1E4A2E] bg-black/40 px-3 py-2.5 text-sm text-white placeholder:text-[#7A9A82] focus:border-[#C4A048]/50 focus:outline-none";
const labelClass = "block font-mono text-[0.6rem] uppercase tracking-wider text-[#7A9A82] mb-1.5";

// ──────────────────────────────────────────────────────────────
// Intake Brainstorm types — mirror services/intake_brainstorm.py
// ──────────────────────────────────────────────────────────────
type EligibleBondType = {
  type: string;
  preferred: boolean | null;
  rationale: string;
  source_row_id?: string;
};

type Metric = {
  label: string;
  value: number | null;
  status: "pass" | "borderline" | "fail" | "unknown";
  per_grade?: Record<string, string>;
  note?: string;
};

type DealKillerFlag = {
  severity: "high" | "medium" | "low";
  category: string;
  message: string;
  source: string;
};

type FirstLookMemo = {
  bond_type_assessment: {
    naics_code?: string;
    naics_label?: string;
    sector?: string;
    deal_intent?: string;
    borrower_type?: string;
    preferred?: EligibleBondType[];
    ambiguous?: EligibleBondType[];
    alternatives?: EligibleBondType[];
    eligible_bond_types?: EligibleBondType[];
    feasibility_study_profile?: { required?: boolean; consultants?: string[]; note?: string };
    operating_framework_refs?: string[];
    engine_error?: string | null;
  };
  credit_profile_snapshot: {
    benchmarks: Record<string, Record<string, number>>;
    founder_inputs: Record<string, number | null>;
    metrics: Record<string, Metric>;
    suggested_grade: string | null;
    sub_ig_breach: boolean;
    source: string;
  };
  structural_template: {
    name: string;
    summary: string;
    irc_anchor?: string;
    bible_ref?: string;
    anchor_bond_type?: string | null;
    anchor_rationale?: string | null;
  };
  deal_killer_flags: DealKillerFlag[];
  narration?: Record<string, string>;
  _brainstorm_narration_pending?: boolean;
};

type GapQuestion = {
  id: string;
  prompt: string;
  field_type: "text" | "textarea" | "select" | "multiselect" | "number" | "yesno";
  options?: string[];
  why_we_ask: string;
  feeds_stage: string;
};

type BrainstormResponse = {
  deal_id: string;
  first_look_memo: FirstLookMemo;
  gap_questions: GapQuestion[];
  generated_at: string;
};

export default function DealInputPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [dealId, setDealId] = useState("");

  // Intake Brainstorm view state
  const [brainstorm, setBrainstorm] = useState<BrainstormResponse | null>(null);
  const [loadingBrainstorm, setLoadingBrainstorm] = useState(false);
  const [brainstormError, setBrainstormError] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [parking, setParking] = useState(false);
  const [greenlighting, setGreenlighting] = useState(false);
  const [parkedConfirmation, setParkedConfirmation] = useState(false);

  // Basic intake fields only
  const [dealName, setDealName] = useState("");
  const [dealType, setDealType] = useState("ma_acquisition");
  const [sector, setSector] = useState("business_services");
  const [borrowerName, setBorrowerName] = useState("");
  const [sponsorName, setSponsorName] = useState("");
  const [sponsorType, setSponsorType] = useState("pe_firm");
  const [projectSize, setProjectSize] = useState("");
  const [state, setState] = useState("");
  const [description, setDescription] = useState("");

  // Promote-to-Deal provenance — populated from URL query params when arriving
  // from EagleEye. Captured into the eventual POST body so the backend can
  // attribute the deal to its originating signal. ADR-0002: the deals row is
  // STILL inserted only by this form's submitDeal() — EagleEye never inserts.
  const [sourceSignalId, setSourceSignalId] = useState<string>("");
  const [sourceChannel, setSourceChannel] = useState<string>("");

  // Read URL query params on mount and prefill the form.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromSignal = params.get("from_signal") || "";
    const source = params.get("source") || "";
    const qpNaics = params.get("naics") || "";
    const qpState = params.get("state") || "";
    const qpSector = params.get("sector") || "";
    const qpEntity = params.get("entity") || "";
    const qpSize = params.get("estimated_size") || "";

    if (fromSignal) setSourceSignalId(fromSignal);
    if (source) setSourceChannel(source);

    // entity → Project / Deal Name (closest existing field).
    if (qpEntity) setDealName(qpEntity);
    // state → State select (only set if it matches our supported 2-letter list).
    if (qpState && qpState.length === 2) setState(qpState.toUpperCase());
    // estimated_size → Project Size (numeric input).
    if (qpSize) setProjectSize(qpSize);

    // sector / naics → Sector select. Try sector slug first, then NAICS match.
    if (qpSector) {
      const bySlug = SECTORS.find((s) => s.value === qpSector);
      if (bySlug) {
        setSector(bySlug.value);
        return;
      }
    }
    if (qpNaics) {
      const byNaics = SECTORS.find((s) => s.naics === qpNaics);
      if (byNaics) setSector(byNaics.value);
    }
  }, []);

  const selectedSector = SECTORS.find((s) => s.value === sector);

  async function submitDeal() {
    if (!dealName.trim() || !borrowerName.trim()) return;
    setSubmitting(true);
    try {
      // Create the deal record. ADR-0002: this is the SINGLE insertion point
      // for the `deals` table — EagleEye never inserts directly.
      const res = await fetch(`${_API}/api/deals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: dealName,
          deal_type: dealType,
          sector,
          naics: selectedSector?.naics || "",
          borrower: borrowerName,
          sponsor: sponsorName,
          sponsor_type: sponsorType,
          project_size: parseFloat(projectSize) || 0,
          state,
          description,
          status: "intake",
          // Provenance — backend may ignore unknown fields safely.
          source_signal_id: sourceSignalId || null,
          source_channel: sourceChannel || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const newId = data.data?.id || data.data?.deal_id || "new";
        setDealId(newId);

        // Initialize in workflow pipeline (existing behavior preserved).
        await fetch(`${_API}/api/workflow/init`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deal_id: newId,
            deal_type: dealType,
            source: "direct_intake",
          }),
        });

        // Transition to the Intake Brainstorm view (ADR-0002). Same page,
        // conditional render keyed off `dealId`.
        await loadBrainstorm(newId);
      }
    } finally { setSubmitting(false); }
  }

  async function loadBrainstorm(id: string) {
    setLoadingBrainstorm(true);
    setBrainstormError(null);
    try {
      const r = await fetch(`${_API}/api/intake-brainstorm/${id}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const json = await r.json();
      if (json.success) {
        setBrainstorm(json.data as BrainstormResponse);
      } else {
        setBrainstormError(json.error || "Failed to load brainstorm");
      }
    } catch (e: any) {
      setBrainstormError(e?.message || "Network error");
    } finally {
      setLoadingBrainstorm(false);
    }
  }

  async function handleGreenlight() {
    if (!dealId) return;
    setGreenlighting(true);
    try {
      // Save responses, then advance to Roots Stage 1.
      await fetch(`${_API}/api/intake-brainstorm/${dealId}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses }),
      });
      const r = await fetch(`${_API}/api/intake-brainstorm/${dealId}/greenlight`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const json = await r.json();
      if (json.success) {
        router.push(json.data?.next_route || "/upload");
      }
    } finally { setGreenlighting(false); }
  }

  async function handlePark() {
    if (!dealId) return;
    setParking(true);
    try {
      await fetch(`${_API}/api/intake-brainstorm/${dealId}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses }),
      });
      const r = await fetch(`${_API}/api/intake-brainstorm/${dealId}/park`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const json = await r.json();
      if (json.success) {
        setParkedConfirmation(true);
      }
    } finally { setParking(false); }
  }

  // ───────────────────────────────────────────────────────────
  // Intake Brainstorm view (after dealId is set)
  // ───────────────────────────────────────────────────────────
  if (dealId && (brainstorm || loadingBrainstorm || brainstormError)) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <section className="relative overflow-hidden rounded-[1.8rem] border border-[#C4A048]/25 bg-[#060E1A] p-5 text-[#EDE8DC] sm:p-7">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(196,160,72,0.17),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.76),rgba(2,6,23,0.96))]" />
          <div className="relative">
            <div className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-[#C4A048]">Stage 0 · Intake Brainstorm</div>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-white" style={{ fontFamily: "Cormorant Garamond, serif" }}>Bernard's First Look</h1>
            <p className="mt-2 max-w-2xl text-sm text-[#7A9A82]">
              {dealName} · {selectedSector?.label} · NAICS {selectedSector?.naics}{state ? ` · ${state}` : ""}
            </p>
            <p className="mt-1 max-w-2xl text-xs text-[#7A9A82]">
              Review the memo, answer the gap questions, then greenlight to advance to Roots — or park if the deal needs more work before document collection.
            </p>
            {parkedConfirmation && (
              <Badge variant="outline" className="mt-3 border-emerald-400/30 bg-emerald-400/15 text-emerald-200 font-mono text-[0.6rem] uppercase tracking-wider">
                Saved · Deal parked. Answers persisted to the deal record.
              </Badge>
            )}
            {brainstorm?.first_look_memo?._brainstorm_narration_pending && (
              <Badge variant="outline" className="mt-3 ml-2 border-amber-400/30 bg-amber-400/15 text-amber-200 font-mono text-[0.6rem] uppercase tracking-wider">
                Narration pending · Claude offline, deterministic memo only
              </Badge>
            )}
          </div>
        </section>

        {loadingBrainstorm && (
          <Card className="border-[#1E4A2E]/60 bg-[#0D2218]"><CardContent className="p-8 text-center text-[#7A9A82]">Running brainstorm…</CardContent></Card>
        )}
        {brainstormError && (
          <Card className="border-red-500/30 bg-[#0D2218]"><CardContent className="p-6 text-red-300 text-sm">{brainstormError}</CardContent></Card>
        )}

        {brainstorm && (
          <>
            {/* Two-column: memo on left, gap Q&A on right */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: First-Look Memo */}
              <div className="space-y-4">
                {/* Bond Type Assessment */}
                <Card className="border-[#1E4A2E]/60 bg-[#0D2218]">
                  <CardHeader><CardTitle className="text-[#C4A048] text-sm">Bond Type Assessment</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {brainstorm.first_look_memo.bond_type_assessment.engine_error ? (
                      <p className="text-sm text-amber-300">{brainstorm.first_look_memo.bond_type_assessment.engine_error}</p>
                    ) : (
                      <>
                        <p className="font-mono text-[0.6rem] uppercase tracking-wider text-[#7A9A82]">
                          NAICS {brainstorm.first_look_memo.bond_type_assessment.naics_code} · {brainstorm.first_look_memo.bond_type_assessment.naics_label}
                        </p>
                        {(brainstorm.first_look_memo.bond_type_assessment.preferred || []).map((b) => (
                          <div key={b.type} className="rounded-lg border border-[#C4A048]/30 bg-[#C4A048]/5 p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-semibold text-[#C4A048]" style={{ fontFamily: "Cormorant Garamond, serif" }}>{b.type}</span>
                              <Badge variant="outline" className="border-[#C4A048]/40 text-[#C4A048] font-mono text-[0.55rem] uppercase">Preferred</Badge>
                            </div>
                            <p className="text-xs text-[#EDE8DC]">{b.rationale}</p>
                            {b.source_row_id && <p className="mt-1 font-mono text-[0.55rem] text-[#7A9A82]">Source: {b.source_row_id}</p>}
                          </div>
                        ))}
                        {(brainstorm.first_look_memo.bond_type_assessment.alternatives || []).map((b) => (
                          <div key={b.type} className="rounded-lg border border-[#1E4A2E]/60 bg-black/20 p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-[#EDE8DC]">{b.type}</span>
                              <Badge variant="outline" className="border-[#1E4A2E] text-[#7A9A82] font-mono text-[0.55rem] uppercase">Alternative</Badge>
                            </div>
                            <p className="text-xs text-[#7A9A82]">{b.rationale}</p>
                          </div>
                        ))}
                        {brainstorm.first_look_memo.narration?.bond_type_assessment && (
                          <p className="text-xs italic text-[#7A9A82] border-l-2 border-[#C4A048]/40 pl-3">{brainstorm.first_look_memo.narration.bond_type_assessment}</p>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Credit Profile Snapshot */}
                <Card className="border-[#1E4A2E]/60 bg-[#0D2218]">
                  <CardHeader><CardTitle className="text-[#C4A048] text-sm">Credit Profile Snapshot</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    <p className="font-mono text-[0.55rem] uppercase tracking-wider text-[#7A9A82]">
                      Suggested grade: <span className="text-[#C4A048]">{brainstorm.first_look_memo.credit_profile_snapshot.suggested_grade || "Unknown"}</span>
                      {brainstorm.first_look_memo.credit_profile_snapshot.sub_ig_breach && <span className="ml-2 text-red-400">· Sub-IG breach</span>}
                    </p>
                    <div className="space-y-1.5">
                      {Object.entries(brainstorm.first_look_memo.credit_profile_snapshot.metrics).map(([key, m]) => (
                        <div key={key} className="flex items-center justify-between rounded-md border border-[#1E4A2E]/40 bg-black/20 px-3 py-2">
                          <span className="font-mono text-[0.65rem] uppercase tracking-wider text-[#7A9A82]">{m.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-[#EDE8DC]">{m.value ?? "—"}</span>
                            <Badge variant="outline" className={
                              m.status === "pass" ? "border-emerald-500/40 text-emerald-300 font-mono text-[0.55rem] uppercase" :
                              m.status === "borderline" ? "border-amber-500/40 text-amber-300 font-mono text-[0.55rem] uppercase" :
                              m.status === "fail" ? "border-red-500/40 text-red-300 font-mono text-[0.55rem] uppercase" :
                              "border-[#1E4A2E] text-[#7A9A82] font-mono text-[0.55rem] uppercase"
                            }>{m.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="font-mono text-[0.5rem] text-[#7A9A82] mt-2">Source: {brainstorm.first_look_memo.credit_profile_snapshot.source}</p>
                    {brainstorm.first_look_memo.narration?.credit_profile_snapshot && (
                      <p className="text-xs italic text-[#7A9A82] border-l-2 border-[#C4A048]/40 pl-3 mt-2">{brainstorm.first_look_memo.narration.credit_profile_snapshot}</p>
                    )}
                  </CardContent>
                </Card>

                {/* Structural Template */}
                <Card className="border-[#1E4A2E]/60 bg-[#0D2218]">
                  <CardHeader><CardTitle className="text-[#C4A048] text-sm">Structural Template</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-white" style={{ fontFamily: "Cormorant Garamond, serif" }}>{brainstorm.first_look_memo.structural_template.name}</p>
                    <p className="text-xs text-[#EDE8DC]">{brainstorm.first_look_memo.structural_template.summary}</p>
                    {brainstorm.first_look_memo.structural_template.irc_anchor && (
                      <p className="font-mono text-[0.6rem] text-[#7A9A82]">IRC: {brainstorm.first_look_memo.structural_template.irc_anchor}</p>
                    )}
                    {brainstorm.first_look_memo.structural_template.bible_ref && (
                      <p className="font-mono text-[0.55rem] text-[#7A9A82]">{brainstorm.first_look_memo.structural_template.bible_ref}</p>
                    )}
                    {brainstorm.first_look_memo.narration?.structural_template && (
                      <p className="text-xs italic text-[#7A9A82] border-l-2 border-[#C4A048]/40 pl-3 mt-2">{brainstorm.first_look_memo.narration.structural_template}</p>
                    )}
                  </CardContent>
                </Card>

                {/* Deal-Killer Flags */}
                <Card className="border-[#1E4A2E]/60 bg-[#0D2218]">
                  <CardHeader><CardTitle className="text-[#C4A048] text-sm">Deal-Killer Flags</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {brainstorm.first_look_memo.deal_killer_flags.length === 0 ? (
                      <p className="text-xs text-emerald-300">No flags raised. Deal cleanly clears intake heuristics.</p>
                    ) : (
                      brainstorm.first_look_memo.deal_killer_flags.map((f, i) => (
                        <div key={i} className="rounded-md border border-[#1E4A2E]/40 bg-black/20 p-2.5">
                          <div className="flex items-start gap-2">
                            <Badge variant="outline" className={
                              f.severity === "high" ? "border-red-500/40 text-red-300 font-mono text-[0.55rem] uppercase mt-0.5" :
                              f.severity === "medium" ? "border-amber-500/40 text-amber-300 font-mono text-[0.55rem] uppercase mt-0.5" :
                              "border-[#1E4A2E] text-[#7A9A82] font-mono text-[0.55rem] uppercase mt-0.5"
                            }>{f.severity}</Badge>
                            <div className="flex-1">
                              <p className="text-xs text-[#EDE8DC]">{f.message}</p>
                              <p className="font-mono text-[0.5rem] text-[#7A9A82] mt-1">{f.category} · {f.source}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    {brainstorm.first_look_memo.narration?.deal_killer_flags && (
                      <p className="text-xs italic text-[#7A9A82] border-l-2 border-[#C4A048]/40 pl-3 mt-2">{brainstorm.first_look_memo.narration.deal_killer_flags}</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right: Gap-Filling Q&A */}
              <Card className="border-[#1E4A2E]/60 bg-[#0D2218] h-fit">
                <CardHeader>
                  <CardTitle className="text-[#C4A048] text-sm">Gap-Filling Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xs text-[#7A9A82]">
                    {brainstorm.gap_questions.length} targeted questions to fill the information Deal Input didn't capture. Answers feed Stage 1.
                  </p>
                  {brainstorm.gap_questions.map((q) => (
                    <div key={q.id}>
                      <label className={labelClass}>{q.prompt}</label>
                      {q.field_type === "select" && q.options ? (
                        <select
                          value={responses[q.id] || ""}
                          onChange={(e) => setResponses({ ...responses, [q.id]: e.target.value })}
                          className={inputClass}
                        >
                          <option value="">Select...</option>
                          {q.options.map((o) => <option key={o} value={o}>{o.replace(/_/g, " ")}</option>)}
                        </select>
                      ) : q.field_type === "textarea" ? (
                        <textarea
                          value={responses[q.id] || ""}
                          onChange={(e) => setResponses({ ...responses, [q.id]: e.target.value })}
                          rows={3}
                          className={`${inputClass} resize-vertical`}
                        />
                      ) : q.field_type === "yesno" ? (
                        <select
                          value={responses[q.id] || ""}
                          onChange={(e) => setResponses({ ...responses, [q.id]: e.target.value })}
                          className={inputClass}
                        >
                          <option value="">Select...</option>
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      ) : (
                        <input
                          type={q.field_type === "number" ? "number" : "text"}
                          value={responses[q.id] || ""}
                          onChange={(e) => setResponses({ ...responses, [q.id]: e.target.value })}
                          className={inputClass}
                        />
                      )}
                      <p className="mt-1 font-mono text-[0.55rem] text-[#7A9A82]">Why: {q.why_we_ask}</p>
                      <p className="font-mono text-[0.5rem] text-[#7A9A82]">→ {q.feeds_stage}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Action bar */}
            <Card className="border-white/10 bg-black/30">
              <CardContent className="p-4 flex flex-wrap gap-3 items-center justify-between">
                <p className="text-xs text-[#7A9A82] max-w-xl">
                  Greenlight advances the deal to Roots Stage 1 (document ingestion). Park saves your answers without advancing — useful if you need to gather more sponsor information first.
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={handlePark}
                    disabled={parking || greenlighting}
                    variant="outline"
                    className="border-[#1E4A2E] text-[#EDE8DC]"
                  >
                    {parking ? "Parking…" : "Park"}
                  </Button>
                  <Button
                    onClick={handleGreenlight}
                    disabled={parking || greenlighting}
                    className="bg-[#C4A048] text-[#030A06] hover:bg-[#E8C87A] px-6 font-semibold"
                  >
                    {greenlighting ? "Advancing…" : "Greenlight → Advance to Roots"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-[1.8rem] border border-[#C4A048]/25 bg-[#060E1A] p-5 text-[#EDE8DC] sm:p-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(196,160,72,0.17),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.76),rgba(2,6,23,0.96))]" />
        <div className="relative">
          <div className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-[#C4A048]">Stage 0 · Intake</div>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white" style={{ fontFamily: "Cormorant Garamond, serif" }}>New Deal Intake</h1>
          {sourceSignalId && (
            <Badge
              variant="outline"
              className="mt-3 border-[#C4A048]/30 bg-[#C4A048]/15 text-[#E8C87A] font-mono text-[0.6rem] uppercase tracking-wider"
            >
              Promoted from EagleEye signal: {sourceSignalId}
            </Badge>
          )}
          <p className="mt-2 max-w-2xl text-sm text-[#7A9A82]">
            Enter the basics to create the deal. After submit, Bernard runs the Intake Brainstorm — a first-look memo plus targeted gap questions — before the deal advances to Roots document ingestion.
          </p>
        </div>
      </section>

      {/* Single form — all fields visible */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Deal basics */}
        <Card className="border-[#1E4A2E]/60 bg-[#0D2218]">
          <CardHeader><CardTitle className="text-[#C4A048] text-sm">Deal Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className={labelClass}>Deal Name</label>
              <input value={dealName} onChange={(e) => setDealName(e.target.value)} placeholder="Project Sunrise Acquisition" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Deal Type</label>
              <select value={dealType} onChange={(e) => setDealType(e.target.value)} className={inputClass}>
                {DEAL_TYPES.map((dt) => <option key={dt.value} value={dt.value}>{dt.label} — {dt.description}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Sector / NAICS</label>
              <select value={sector} onChange={(e) => setSector(e.target.value)} className={inputClass}>
                {SECTORS.map((s) => <option key={s.value} value={s.value}>{s.label} — NAICS {s.naics}</option>)}
              </select>
              {selectedSector && (
                <p className="mt-1 font-mono text-[0.6rem] text-[#C4A048]">NAICS {selectedSector.naics}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Estimated Project Size ($)</label>
              <input type="number" value={projectSize} onChange={(e) => setProjectSize(e.target.value)} placeholder="28000000" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>State</label>
              <select value={state} onChange={(e) => setState(e.target.value)} className={inputClass}>
                <option value="">Select state...</option>
                {["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Right: Sponsor + description */}
        <Card className="border-[#1E4A2E]/60 bg-[#0D2218]">
          <CardHeader><CardTitle className="text-[#C4A048] text-sm">Borrower & Sponsor</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className={labelClass}>Borrower / Obligor</label>
              <input value={borrowerName} onChange={(e) => setBorrowerName(e.target.value)} placeholder="Sunrise Senior Living LLC" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Sponsor</label>
              <input value={sponsorName} onChange={(e) => setSponsorName(e.target.value)} placeholder="Apex Capital Partners" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Sponsor Type</label>
              <select value={sponsorType} onChange={(e) => setSponsorType(e.target.value)} className={inputClass}>
                {SPONSOR_TYPES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Project Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
                placeholder="Brief description of the project, use of proceeds, and any relevant context..."
                className={`${inputClass} resize-vertical`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline preview */}
      <Card className="border-white/10 bg-black/30">
        <CardContent className="p-4">
          <p className="font-mono text-[0.6rem] uppercase tracking-wider text-[#7A9A82] mb-3">What happens next</p>
          <div className="flex gap-1">
            {[
              { label: "Intake", desc: "You are here", active: true },
              { label: "Brainstorm", desc: "Bernard first look" },
              { label: "Documents", desc: "Upload to Roots" },
              { label: "Credit", desc: "Memo + grading" },
              { label: "Rating", desc: "Moody's / S&P" },
              { label: "Structure", desc: "Bernard brainstorm" },
              { label: "Enhancement", desc: "Surety / LOC" },
              { label: "Placement", desc: "Investor matching" },
              { label: "Close", desc: "Closing checklist" },
              { label: "Admin", desc: "30yr lifecycle" },
            ].map((s) => (
              <div key={s.label} className={`flex-1 rounded-lg px-2 py-2 text-center ${s.active ? "bg-[#C4A048]/10 border border-[#C4A048]/30" : "bg-white/[0.02]"}`}>
                <p className={`font-mono text-[0.5rem] uppercase font-bold ${s.active ? "text-[#C4A048]" : "text-[#7A9A82]"}`}>{s.label}</p>
                <p className="font-mono text-[0.45rem] text-[#7A9A82] mt-0.5">{s.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex gap-3">
        <Button onClick={submitDeal} disabled={submitting || !dealName.trim() || !borrowerName.trim()}
          className="bg-[#C4A048] text-[#030A06] hover:bg-[#E8C87A] px-8 py-3 text-sm font-semibold">
          {submitting ? "Creating Deal..." : "Create Deal & Run Brainstorm →"}
        </Button>
      </div>
    </div>
  );
}
