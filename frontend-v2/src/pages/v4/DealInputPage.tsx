/**
 * Deal Input — Simple intake to create the deal vehicle.
 * Basics only: name, sponsor, sector/NAICS, deal type, rough size.
 * The deal then moves through the pipeline where intelligence builds at each stage.
 * Bond structuring happens LATER after docs, credit, and rating are complete.
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DEAL_TYPES = [
  { value: "ma_acquisition", label: "M&A Acquisition", description: "Bond financing a merger or acquisition" },
  { value: "construction", label: "Construction & Development", description: "New construction — senior living, multifamily, hospital" },
  { value: "working_capital", label: "Working Capital", description: "Operating liquidity for an existing business" },
  { value: "equipment", label: "Equipment Finance", description: "Asset-backed financing matched to useful life" },
  { value: "real_estate", label: "Real Estate Acquisition", description: "Acquisition of stabilized real estate" },
  { value: "refunding", label: "Refunding", description: "Refinancing existing bond debt at lower rates" },
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

const inputClass = "w-full rounded-lg border border-slate-700 bg-black/40 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-[#C4A048]/50 focus:outline-none";
const labelClass = "block font-mono text-[0.6rem] uppercase tracking-wider text-slate-400 mb-1.5";

export default function DealInputPage() {
  const [, setLocation] = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [dealId, setDealId] = useState("");

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

  const selectedSector = SECTORS.find((s) => s.value === sector);

  async function submitDeal() {
    if (!dealName.trim() || !borrowerName.trim()) return;
    setSubmitting(true);
    try {
      // Create the deal record
      const res = await fetch("/api/deals", {
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
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDealId(data.data?.id || data.data?.deal_id || "new");
        setSubmitted(true);

        // Initialize in workflow pipeline
        await fetch("/api/workflow/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deal_id: data.data?.id || "new",
            deal_type: dealType,
            source: "direct_intake",
          }),
        });
      }
    } finally { setSubmitting(false); }
  }

  if (submitted) {
    return (
      <div className="space-y-6">
        <Card className="border-emerald-500/30 bg-[#0D2218]">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-emerald-400">✓</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "Cormorant Garamond, serif" }}>Deal Created</h2>
            <p className="text-slate-400 mb-1">{dealName} — {DEAL_TYPES.find(d => d.value === dealType)?.label}</p>
            <p className="text-slate-500 text-sm mb-6">{borrowerName} · {selectedSector?.label} · NAICS {selectedSector?.naics}</p>

            <div className="flex gap-1 rounded-xl border border-white/10 bg-black/30 p-2 mb-6">
              {["Intake", "Docs", "Credit", "Rating", "Structure", "Enhance", "Place", "Close", "Admin"].map((stage, i) => (
                <div key={stage} className={`flex-1 text-center rounded-lg py-2 ${i === 0 ? "bg-[#C4A048]/15 border border-[#C4A048]/30" : ""}`}>
                  <p className={`font-mono text-[0.5rem] uppercase ${i === 0 ? "text-[#C4A048]" : "text-slate-600"}`}>{stage}</p>
                </div>
              ))}
            </div>

            <p className="text-sm text-slate-300 mb-6">
              Deal is now in the pipeline. Next step: <strong className="text-[#C4A048]">upload documents to Roots</strong> so the intelligence engine can analyze financials, generate the credit memo, and prepare the structuring recommendation.
            </p>

            <div className="flex gap-3 justify-center">
              <Button onClick={() => setLocation("/roots")} className="bg-[#C4A048] text-[#030A06] hover:bg-[#E8C87A]">
                Upload Documents →
              </Button>
              <Button onClick={() => setLocation("/deals")} variant="outline" className="border-slate-600 text-slate-300">
                View Pipeline
              </Button>
              <Button onClick={() => { setSubmitted(false); setDealName(""); setBorrowerName(""); }} variant="outline" className="border-slate-600 text-slate-300">
                New Deal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-[1.8rem] border border-[#C4A048]/25 bg-[#060E1A] p-5 text-slate-100 sm:p-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(196,160,72,0.17),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.76),rgba(2,6,23,0.96))]" />
        <div className="relative">
          <div className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-[#C4A048]">Stage 0 · Intake</div>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white" style={{ fontFamily: "Cormorant Garamond, serif" }}>New Deal Intake</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Enter the basics to create the deal. The platform builds intelligence as the deal moves through the pipeline — documents → credit analysis → rating → then Bernard recommends the optimal bond structure.
          </p>
        </div>
      </section>

      {/* Single form — all fields visible */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Deal basics */}
        <Card className="border-slate-700/60 bg-[#0D2218]">
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
        <Card className="border-slate-700/60 bg-[#0D2218]">
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
          <p className="font-mono text-[0.6rem] uppercase tracking-wider text-slate-500 mb-3">What happens next</p>
          <div className="flex gap-1">
            {[
              { label: "Intake", desc: "You are here", active: true },
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
                <p className={`font-mono text-[0.5rem] uppercase font-bold ${s.active ? "text-[#C4A048]" : "text-slate-600"}`}>{s.label}</p>
                <p className="font-mono text-[0.45rem] text-slate-600 mt-0.5">{s.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex gap-3">
        <Button onClick={submitDeal} disabled={submitting || !dealName.trim() || !borrowerName.trim()}
          className="bg-[#C4A048] text-[#030A06] hover:bg-[#E8C87A] px-8 py-3 text-sm font-semibold">
          {submitting ? "Creating Deal..." : "Create Deal & Enter Pipeline →"}
        </Button>
      </div>
    </div>
  );
}
