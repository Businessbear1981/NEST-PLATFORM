/**
 * Deal Input — Comprehensive deal entry driven by Operating Framework + Use Case Manual.
 *
 * Flow: Deal Type → Sector/NAICS → Borrower Profile → Financial Inputs → Bond Selection
 *       → Structure → Covenants → Enhancement → Run Intelligence Engine
 *
 * Parameters from:
 * - M&A Use Case Manual Ch.1 (Section 3 intake, Section 5 math, Section 6 bond types)
 * - Operating Framework Appendix F (Universal Credit Policy)
 * - Bible Silo 1-18 (bond mechanics, amortization, optionality)
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";

// ── Deal Types (Use Case Manual template) ─────────────────────
const DEAL_TYPES = [
  { value: "ma_acquisition", label: "M&A Acquisition Bond", description: "Bond financing a merger or acquisition. Replaces bank syndicated debt or dilutive PE." },
  { value: "construction", label: "Construction & Development", description: "Bond financing new construction — senior living, multifamily, hospital, charter school." },
  { value: "working_capital", label: "Working Capital", description: "Revolving or term bond for operating liquidity needs." },
  { value: "equipment", label: "Equipment Finance", description: "Asset-backed bond matched to equipment depreciation schedule." },
  { value: "real_estate", label: "Real Estate Acquisition", description: "Bond financing acquisition of stabilized real estate — CRE, multifamily, hospitality." },
  { value: "refunding", label: "Refunding", description: "Refinancing existing bond debt at lower rates. Current refunding within 90 days permitted." },
];

// ── Sectors with NAICS codes and typical multiples ────────────
const SECTORS = [
  { value: "software_saas", label: "Software / SaaS", naics: "511210", multiples: "8-15x EBITDA", leverage: "4.0-6.5x" },
  { value: "healthcare_services", label: "Healthcare Services", naics: "621", multiples: "8-14x EBITDA", leverage: "4.0-6.5x" },
  { value: "business_services", label: "Business Services", naics: "561", multiples: "6-10x EBITDA", leverage: "3.5-5.5x" },
  { value: "industrial_manufacturing", label: "Industrial Manufacturing", naics: "31-33", multiples: "6-9x EBITDA", leverage: "3.5-5.5x" },
  { value: "distribution", label: "Distribution", naics: "423", multiples: "6-8x EBITDA", leverage: "3.0-5.0x" },
  { value: "consumer_products", label: "Consumer Products", naics: "311-316", multiples: "8-12x EBITDA", leverage: "3.5-5.5x" },
  { value: "trucking_logistics", label: "Trucking & Logistics", naics: "484", multiples: "4-6x EBITDA", leverage: "2.5-4.0x" },
  { value: "specialty_contractors", label: "Specialty Contractors", naics: "238", multiples: "5-7x EBITDA", leverage: "2.5-4.5x" },
  { value: "energy_services", label: "Energy Services", naics: "213", multiples: "4-7x EBITDA", leverage: "2.5-4.0x" },
  { value: "financial_services", label: "Financial Services", naics: "523", multiples: "8-12x EBITDA", leverage: "4.0-6.0x" },
  { value: "senior_living", label: "Senior Living / CCRC", naics: "623311", multiples: "8-12x EBITDA", leverage: "3.5-5.5x" },
  { value: "hospitals", label: "Hospitals / Healthcare", naics: "622110", multiples: "N/A (revenue bond)", leverage: "N/A" },
  { value: "charter_schools", label: "Charter Schools", naics: "611110", multiples: "N/A (revenue bond)", leverage: "N/A" },
  { value: "affordable_multifamily", label: "Affordable Multifamily (PAB)", naics: "531110", multiples: "N/A (cap rate)", leverage: "N/A" },
  { value: "hospitality", label: "Hotels & Hospitality", naics: "721110", multiples: "8-12x EBITDA", leverage: "3.0-5.0x" },
  { value: "data_centers", label: "Data Centers", naics: "518210", multiples: "12-20x EBITDA", leverage: "4.5-7.0x" },
];

// ── Bond Types ────────────────────────────────────────────────
const BOND_TYPES = [
  { value: "taxable_senior_secured", label: "Taxable Senior Secured", description: "Most common for M&A, corporate, equipment" },
  { value: "tax_exempt_501c3", label: "Tax-Exempt 501(c)(3)", description: "Qualifying nonprofits — hospitals, senior living, charter schools" },
  { value: "tax_exempt_pab_142", label: "Tax-Exempt PAB (IRC §142)", description: "Private activity — affordable multifamily, exempt facilities" },
  { value: "governmental", label: "Governmental Purpose", description: "State and local government issuers" },
  { value: "taxable_corporate", label: "Taxable Corporate", description: "Investment grade middle-market corporates" },
  { value: "project_finance", label: "Senior Secured Project Finance", description: "Stand-alone projects — RE-backed, infrastructure, data centers" },
  { value: "cash_collateralized_lc", label: "Cash-Collateralized LC", description: "Sponsor cash collateralizes LC — produces AAA-equivalent pricing" },
];

// ── Amortization Patterns ─────────────────────────────────────
const AMORT_TYPES = [
  { value: "level_debt_service", label: "Level Debt Service", description: "Equal annual payments — standard for 30yr tax-exempt" },
  { value: "ascending", label: "Ascending", description: "Increasing payments over time — matches revenue growth" },
  { value: "bullet", label: "Bullet (Interest Only)", description: "IO throughout, principal at maturity — short-term or construction" },
  { value: "io_then_amort", label: "IO Period + Amortization", description: "18-36mo IO (integration/construction), then level amort" },
  { value: "serial_with_term", label: "Serial with Term", description: "Serial maturities early, term bonds later — hospital/education standard" },
  { value: "custom", label: "Custom Schedule", description: "Tailored to project cash flow profile" },
];

// ── Enhancement Types ─────────────────────────────────────────
const ENHANCEMENTS = [
  { value: "none", label: "None (Standalone)", rating_impact: "Based on borrower credit" },
  { value: "bond_insurance", label: "Bond Insurance (BAM / Assured Guaranty)", rating_impact: "Lifts to AA (insurer rating)" },
  { value: "loc", label: "Letter of Credit", rating_impact: "Lifts to LC bank short-term rating" },
  { value: "surety", label: "Surety Bond", rating_impact: "+1 to +3 notches" },
  { value: "federal_guarantee", label: "Federal Guarantee (FHA/USDA/GNMA)", rating_impact: "AAA equivalent" },
  { value: "cash_collateralized_lc", label: "Cash-Collateralized LC", rating_impact: "AAA equivalent — sponsor cash deployed" },
];

// ── Sponsor Types ─────────────────────────────────────────────
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
const sectionClass = "rounded-[1.25rem] border border-slate-700/60 bg-[#0D2218]/80 p-5";

export default function DealInputPage() {
  const [activeTab, setActiveTab] = useState("deal");
  const [result, setResult] = useState<any>(null);

  // ── Deal Type ──────────────────────────────────
  const [dealType, setDealType] = useState("ma_acquisition");
  const [sector, setSector] = useState("business_services");
  const [sponsorType, setSponsorType] = useState("pe_firm");

  // ── Borrower / Sponsor ─────────────────────────
  const [dealName, setDealName] = useState("");
  const [borrowerName, setBorrowerName] = useState("");
  const [sponsorName, setSponsorName] = useState("");
  const [sponsorExperience, setSponsorExperience] = useState("10");
  const [sponsorAUM, setSponsorAUM] = useState("");

  // ── Financials ─────────────────────────────────
  const [revenue, setRevenue] = useState("");
  const [ebitda, setEbitda] = useState("");
  const [acquisitionMultiple, setAcquisitionMultiple] = useState("");
  const [sponsorEquityPct, setSponsorEquityPct] = useState("30");
  const [rolloverEquity, setRolloverEquity] = useState("0");
  const [sellerNote, setSellerNote] = useState("0");
  const [netDebt, setNetDebt] = useState("0");
  const [txExpenses, setTxExpenses] = useState("0");

  // ── For non-M&A deals ──────────────────────────
  const [totalProjectCost, setTotalProjectCost] = useState("");
  const [noi, setNoi] = useState("");
  const [capRate, setCapRate] = useState("6.5");
  const [equipmentCost, setEquipmentCost] = useState("");

  // ── Bond Structure ─────────────────────────────
  const [bondType, setBondType] = useState("taxable_senior_secured");
  const [amortType, setAmortType] = useState("io_then_amort");
  const [tenorYears, setTenorYears] = useState("7");
  const [ioPeriodMonths, setIoPeriodMonths] = useState("18");

  // ── Optionality ────────────────────────────────
  const [ncPeriod, setNcPeriod] = useState("3");
  const [parCallAfter, setParCallAfter] = useState(true);
  const [stepDownPremium, setStepDownPremium] = useState(true);
  const [makeWhole, setMakeWhole] = useState(false);
  const [putOption, setPutOption] = useState(false);

  // ── Covenants ──────────────────────────────────
  const [dscrCovenant, setDscrCovenant] = useState("1.20");
  const [leverageCeiling, setLeverageCeiling] = useState("5.5");
  const [additionalBondsTest, setAdditionalBondsTest] = useState(true);
  const [restrictedPayments, setRestrictedPayments] = useState(true);
  const [distributionTrap, setDistributionTrap] = useState("1.10");
  const [covenantHolidayMonths, setCovenantHolidayMonths] = useState("18");

  // ── Enhancement ────────────────────────────────
  const [enhancement, setEnhancement] = useState("none");

  const selectedSector = SECTORS.find((s) => s.value === sector);

  const sizeMutation = trpc.intel.size.useMutation({
    onSuccess: (data) => { setResult(data); setActiveTab("result"); },
  });

  function runSizing() {
    const base: Record<string, unknown> = {
      deal_type: dealType,
      sector,
      sponsor_equity_pct: parseFloat(sponsorEquityPct) / 100,
      rollover_equity: parseFloat(rolloverEquity) || 0,
      seller_note: parseFloat(sellerNote) || 0,
      net_debt_at_close: parseFloat(netDebt) || 0,
      transaction_expenses: parseFloat(txExpenses) || 0,
    };
    if (dealType === "ma_acquisition") {
      base.ebitda = parseFloat(ebitda) || 0;
      base.acquisition_multiple = parseFloat(acquisitionMultiple) || 0;
    } else if (dealType === "construction") {
      base.total_project_cost = parseFloat(totalProjectCost) || 0;
    } else if (dealType === "real_estate") {
      base.noi = parseFloat(noi) || 0;
      base.cap_rate = parseFloat(capRate) / 100;
    } else if (dealType === "equipment") {
      base.equipment_cost = parseFloat(equipmentCost) || 0;
    } else if (dealType === "working_capital") {
      base.annual_revenue = parseFloat(revenue) || 0;
    }
    sizeMutation.mutate(base);
  }

  const tabs = [
    { key: "deal", label: "1. Deal Type" },
    { key: "borrower", label: "2. Borrower" },
    { key: "financials", label: "3. Financials" },
    { key: "bond", label: "4. Bond Type" },
    { key: "structure", label: "5. Structure" },
    { key: "covenants", label: "6. Covenants" },
    { key: "enhancement", label: "7. Enhancement" },
    { key: "result", label: "8. Result" },
  ];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[1.8rem] border border-[#C4A048]/25 bg-[#060E1A] p-5 text-slate-100 shadow-[0_0_85px_rgba(196,160,72,0.13)] sm:p-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(196,160,72,0.17),transparent_34%),radial-gradient(circle_at_86%_4%,rgba(45,107,61,0.12),transparent_30%),linear-gradient(135deg,rgba(15,23,42,0.76),rgba(2,6,23,0.96))]" />
        <div className="relative">
          <div className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-[#C4A048]">Bond Desk · Deal Entry · Intelligence Engine</div>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl" style={{ fontFamily: "Cormorant Garamond, serif" }}>New Deal Input</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
            Complete deal entry per the Operating Framework and Use Case Manual. Select deal type, sector, financials — the Intelligence Engine sizes the bond, grades the credit, builds the covenant package, and predicts the rating.
          </p>
        </div>
      </section>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap gap-1">
          {tabs.map((t) => (
            <TabsTrigger key={t.key} value={t.key} className="text-xs">{t.label}</TabsTrigger>
          ))}
        </TabsList>

        {/* TAB 1: Deal Type */}
        <TabsContent value="deal" className="mt-6 space-y-4">
          <div className={sectionClass}>
            <h3 className="text-sm font-semibold text-[#C4A048] mb-4">Deal Type</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {DEAL_TYPES.map((dt) => (
                <button key={dt.value} onClick={() => setDealType(dt.value)}
                  className={`text-left rounded-xl border p-3 transition ${dealType === dt.value ? "border-[#C4A048]/50 bg-[#C4A048]/10" : "border-white/10 bg-white/[0.03] hover:border-white/20"}`}>
                  <p className="text-sm font-semibold text-white">{dt.label}</p>
                  <p className="text-[0.65rem] text-slate-400 mt-1">{dt.description}</p>
                </button>
              ))}
            </div>
          </div>
          <div className={sectionClass}>
            <h3 className="text-sm font-semibold text-[#C4A048] mb-4">Sector / NAICS</h3>
            <select value={sector} onChange={(e) => setSector(e.target.value)} className={inputClass}>
              {SECTORS.map((s) => <option key={s.value} value={s.value}>{s.label} — NAICS {s.naics} — {s.multiples}</option>)}
            </select>
            {selectedSector && (
              <div className="mt-3 grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <p className="font-mono text-[0.6rem] uppercase text-slate-500">NAICS</p>
                  <p className="font-mono text-lg text-[#C4A048]">{selectedSector.naics}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <p className="font-mono text-[0.6rem] uppercase text-slate-500">Typical Multiples</p>
                  <p className="font-mono text-lg text-white">{selectedSector.multiples}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <p className="font-mono text-[0.6rem] uppercase text-slate-500">Leverage Capacity</p>
                  <p className="font-mono text-lg text-white">{selectedSector.leverage}</p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* TAB 2: Borrower */}
        <TabsContent value="borrower" className="mt-6">
          <div className={sectionClass}>
            <h3 className="text-sm font-semibold text-[#C4A048] mb-4">Borrower & Sponsor Profile</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelClass}>Deal Name</label><input value={dealName} onChange={(e) => setDealName(e.target.value)} placeholder="Project Sunrise Acquisition" className={inputClass} /></div>
              <div><label className={labelClass}>Borrower / Target</label><input value={borrowerName} onChange={(e) => setBorrowerName(e.target.value)} placeholder="Sunrise Senior Living, LLC" className={inputClass} /></div>
              <div><label className={labelClass}>Sponsor</label><input value={sponsorName} onChange={(e) => setSponsorName(e.target.value)} placeholder="Apex Capital Partners" className={inputClass} /></div>
              <div><label className={labelClass}>Sponsor Type</label>
                <select value={sponsorType} onChange={(e) => setSponsorType(e.target.value)} className={inputClass}>
                  {SPONSOR_TYPES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div><label className={labelClass}>Sponsor Experience (years)</label><input type="number" value={sponsorExperience} onChange={(e) => setSponsorExperience(e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Sponsor AUM / Net Worth ($)</label><input type="number" value={sponsorAUM} onChange={(e) => setSponsorAUM(e.target.value)} placeholder="800000000" className={inputClass} /></div>
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: Financials — dynamic by deal type */}
        <TabsContent value="financials" className="mt-6">
          <div className={sectionClass}>
            <h3 className="text-sm font-semibold text-[#C4A048] mb-4">Financial Inputs — {DEAL_TYPES.find((d) => d.value === dealType)?.label}</h3>

            {dealType === "ma_acquisition" && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div><label className={labelClass}>Annual Revenue ($)</label><input type="number" value={revenue} onChange={(e) => setRevenue(e.target.value)} placeholder="25000000" className={inputClass} /></div>
                <div><label className={labelClass}>Adjusted EBITDA ($)</label><input type="number" value={ebitda} onChange={(e) => setEbitda(e.target.value)} placeholder="4000000" className={inputClass} /></div>
                <div><label className={labelClass}>Acquisition Multiple (x)</label><input type="number" value={acquisitionMultiple} onChange={(e) => setAcquisitionMultiple(e.target.value)} placeholder="7.0" step="0.5" className={inputClass} /></div>
                <div><label className={labelClass}>Sponsor Equity (%)</label><input type="number" value={sponsorEquityPct} onChange={(e) => setSponsorEquityPct(e.target.value)} placeholder="30" className={inputClass} /></div>
                <div><label className={labelClass}>Rollover Equity ($)</label><input type="number" value={rolloverEquity} onChange={(e) => setRolloverEquity(e.target.value)} placeholder="0" className={inputClass} /></div>
                <div><label className={labelClass}>Seller Note ($)</label><input type="number" value={sellerNote} onChange={(e) => setSellerNote(e.target.value)} placeholder="0" className={inputClass} /></div>
                <div><label className={labelClass}>Net Debt at Close ($)</label><input type="number" value={netDebt} onChange={(e) => setNetDebt(e.target.value)} placeholder="2000000" className={inputClass} /></div>
                <div><label className={labelClass}>Transaction Expenses ($)</label><input type="number" value={txExpenses} onChange={(e) => setTxExpenses(e.target.value)} placeholder="1500000" className={inputClass} /></div>
              </div>
            )}

            {dealType === "construction" && (
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>Total Project Cost ($)</label><input type="number" value={totalProjectCost} onChange={(e) => setTotalProjectCost(e.target.value)} placeholder="173000000" className={inputClass} /></div>
                <div><label className={labelClass}>Sponsor Equity (%)</label><input type="number" value={sponsorEquityPct} onChange={(e) => setSponsorEquityPct(e.target.value)} placeholder="25" className={inputClass} /></div>
              </div>
            )}

            {dealType === "real_estate" && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div><label className={labelClass}>Net Operating Income ($)</label><input type="number" value={noi} onChange={(e) => setNoi(e.target.value)} placeholder="3500000" className={inputClass} /></div>
                <div><label className={labelClass}>Cap Rate (%)</label><input type="number" value={capRate} onChange={(e) => setCapRate(e.target.value)} placeholder="6.5" step="0.25" className={inputClass} /></div>
                <div><label className={labelClass}>Sponsor Equity (%)</label><input type="number" value={sponsorEquityPct} onChange={(e) => setSponsorEquityPct(e.target.value)} placeholder="30" className={inputClass} /></div>
              </div>
            )}

            {dealType === "equipment" && (
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>Equipment Cost ($)</label><input type="number" value={equipmentCost} onChange={(e) => setEquipmentCost(e.target.value)} placeholder="5000000" className={inputClass} /></div>
                <div><label className={labelClass}>Useful Life (years)</label><input type="number" value={tenorYears} onChange={(e) => setTenorYears(e.target.value)} placeholder="7" className={inputClass} /></div>
              </div>
            )}

            {dealType === "working_capital" && (
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>Annual Revenue ($)</label><input type="number" value={revenue} onChange={(e) => setRevenue(e.target.value)} placeholder="25000000" className={inputClass} /></div>
                <div><label className={labelClass}>WC as % of Revenue</label><input type="number" value="15" className={inputClass} disabled /></div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* TAB 4: Bond Type */}
        <TabsContent value="bond" className="mt-6">
          <div className={sectionClass}>
            <h3 className="text-sm font-semibold text-[#C4A048] mb-4">Bond Type Selection</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {BOND_TYPES.map((bt) => (
                <button key={bt.value} onClick={() => setBondType(bt.value)}
                  className={`text-left rounded-xl border p-3 transition ${bondType === bt.value ? "border-[#C4A048]/50 bg-[#C4A048]/10" : "border-white/10 bg-white/[0.03] hover:border-white/20"}`}>
                  <p className="text-sm font-semibold text-white">{bt.label}</p>
                  <p className="text-[0.65rem] text-slate-400 mt-1">{bt.description}</p>
                </button>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* TAB 5: Structure */}
        <TabsContent value="structure" className="mt-6 space-y-4">
          <div className={sectionClass}>
            <h3 className="text-sm font-semibold text-[#C4A048] mb-4">Amortization</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {AMORT_TYPES.map((a) => (
                <button key={a.value} onClick={() => setAmortType(a.value)}
                  className={`text-left rounded-xl border p-3 transition ${amortType === a.value ? "border-[#C4A048]/50 bg-[#C4A048]/10" : "border-white/10 bg-white/[0.03] hover:border-white/20"}`}>
                  <p className="text-sm font-semibold text-white">{a.label}</p>
                  <p className="text-[0.65rem] text-slate-400 mt-1">{a.description}</p>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div><label className={labelClass}>Tenor (years)</label><input type="number" value={tenorYears} onChange={(e) => setTenorYears(e.target.value)} className={inputClass} /></div>
              {amortType === "io_then_amort" && (
                <div><label className={labelClass}>IO Period (months)</label><input type="number" value={ioPeriodMonths} onChange={(e) => setIoPeriodMonths(e.target.value)} className={inputClass} /></div>
              )}
            </div>
          </div>
          <div className={sectionClass}>
            <h3 className="text-sm font-semibold text-[#C4A048] mb-4">Call / Put Optionality</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><label className={labelClass}>Non-Call Period (years)</label><input type="number" value={ncPeriod} onChange={(e) => setNcPeriod(e.target.value)} className={inputClass} /></div>
              <label className="flex items-center gap-2 text-sm text-white cursor-pointer"><input type="checkbox" checked={parCallAfter} onChange={(e) => setParCallAfter(e.target.checked)} /> Par Call After NC</label>
              <label className="flex items-center gap-2 text-sm text-white cursor-pointer"><input type="checkbox" checked={stepDownPremium} onChange={(e) => setStepDownPremium(e.target.checked)} /> Step-Down Premium</label>
              <label className="flex items-center gap-2 text-sm text-white cursor-pointer"><input type="checkbox" checked={makeWhole} onChange={(e) => setMakeWhole(e.target.checked)} /> Make-Whole Call</label>
              <label className="flex items-center gap-2 text-sm text-white cursor-pointer"><input type="checkbox" checked={putOption} onChange={(e) => setPutOption(e.target.checked)} /> Investor Put Option</label>
            </div>
          </div>
        </TabsContent>

        {/* TAB 6: Covenants */}
        <TabsContent value="covenants" className="mt-6">
          <div className={sectionClass}>
            <h3 className="text-sm font-semibold text-[#C4A048] mb-4">Covenant Package</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div><label className={labelClass}>DSCR Covenant (x)</label><input type="number" value={dscrCovenant} onChange={(e) => setDscrCovenant(e.target.value)} step="0.05" className={inputClass} /></div>
              <div><label className={labelClass}>Leverage Ceiling (x)</label><input type="number" value={leverageCeiling} onChange={(e) => setLeverageCeiling(e.target.value)} step="0.5" className={inputClass} /></div>
              <div><label className={labelClass}>Distribution Trap DSCR (x)</label><input type="number" value={distributionTrap} onChange={(e) => setDistributionTrap(e.target.value)} step="0.05" className={inputClass} /></div>
              <label className="flex items-center gap-2 text-sm text-white cursor-pointer"><input type="checkbox" checked={additionalBondsTest} onChange={(e) => setAdditionalBondsTest(e.target.checked)} /> Additional Bonds Test</label>
              <label className="flex items-center gap-2 text-sm text-white cursor-pointer"><input type="checkbox" checked={restrictedPayments} onChange={(e) => setRestrictedPayments(e.target.checked)} /> Restricted Payments</label>
              {dealType === "ma_acquisition" && (
                <div><label className={labelClass}>Covenant Holiday (months)</label><input type="number" value={covenantHolidayMonths} onChange={(e) => setCovenantHolidayMonths(e.target.value)} className={inputClass} /></div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* TAB 7: Enhancement */}
        <TabsContent value="enhancement" className="mt-6">
          <div className={sectionClass}>
            <h3 className="text-sm font-semibold text-[#C4A048] mb-4">Credit Enhancement</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ENHANCEMENTS.map((e) => (
                <button key={e.value} onClick={() => setEnhancement(e.value)}
                  className={`text-left rounded-xl border p-3 transition ${enhancement === e.value ? "border-[#C4A048]/50 bg-[#C4A048]/10" : "border-white/10 bg-white/[0.03] hover:border-white/20"}`}>
                  <p className="text-sm font-semibold text-white">{e.label}</p>
                  <p className="text-[0.65rem] text-[#C4A048] mt-1">{e.rating_impact}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6">
            <Button onClick={runSizing} disabled={sizeMutation.isPending} size="lg"
              className="bg-[#C4A048] text-[#030A06] hover:bg-[#E8C87A] text-sm font-semibold px-8 py-3">
              {sizeMutation.isPending ? "Running Intelligence Engine..." : "Run Bond Sizing →"}
            </Button>
          </div>
        </TabsContent>

        {/* TAB 8: Result */}
        <TabsContent value="result" className="mt-6 space-y-4">
          {result && (
            <>
              {/* Valuation */}
              {result.valuation && (
                <Card className="border-[#C4A048]/20 bg-[#0D2218]">
                  <CardHeader><CardTitle className="text-[#C4A048]" style={{ fontFamily: "Cormorant Garamond" }}>Valuation & Sizing</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4">
                      {[
                        ["EBITDA", `$${(result.valuation.ebitda / 1e6).toFixed(1)}M`],
                        ["Multiple", `${result.valuation.multiple}x`],
                        ["Enterprise Value", `$${(result.valuation.enterprise_value / 1e6).toFixed(1)}M`],
                        ["In Range?", result.valuation.multiple_in_range ? "YES" : "HIGH"],
                      ].map(([l, v]) => (
                        <div key={l as string}><p className="font-mono text-[0.6rem] uppercase text-slate-500">{l}</p><p className="font-mono text-xl text-white">{v}</p></div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Capital Structure */}
              {result.capital_structure && (
                <Card className="border-emerald-500/20 bg-[#0D2218]">
                  <CardHeader><CardTitle className="text-emerald-400" style={{ fontFamily: "Cormorant Garamond" }}>Capital Structure</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div><p className="font-mono text-[0.6rem] uppercase text-slate-500">Senior Bond</p><p className="font-mono text-2xl text-[#C4A048]">${(result.capital_structure.senior_bond / 1e6).toFixed(1)}M</p></div>
                      <div><p className="font-mono text-[0.6rem] uppercase text-slate-500">Senior Leverage</p><p className="font-mono text-2xl text-white">{result.capital_structure.senior_leverage}x</p></div>
                      <div><p className="font-mono text-[0.6rem] uppercase text-slate-500">Total Leverage</p><p className="font-mono text-2xl text-white">{result.capital_structure.total_leverage}x</p></div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Sources & Uses */}
              {result.sources_and_uses && (
                <div className="grid grid-cols-2 gap-4">
                  <Card className="border-slate-700 bg-[#0D2218]">
                    <CardHeader><CardTitle className="text-sm text-[#C4A048]">Sources</CardTitle></CardHeader>
                    <CardContent>{Object.entries(result.sources_and_uses.sources).map(([k, v]: [string, any]) => (
                      <div key={k} className="flex justify-between py-1.5 border-b border-white/5 last:border-0"><span className="text-xs text-slate-400">{k.replace(/_/g, " ")}</span><span className="font-mono text-xs text-white">${(v / 1e6).toFixed(2)}M</span></div>
                    ))}</CardContent>
                  </Card>
                  <Card className="border-slate-700 bg-[#0D2218]">
                    <CardHeader><CardTitle className="text-sm text-[#C4A048]">Uses</CardTitle></CardHeader>
                    <CardContent>{Object.entries(result.sources_and_uses.uses).map(([k, v]: [string, any]) => (
                      <div key={k} className="flex justify-between py-1.5 border-b border-white/5 last:border-0"><span className="text-xs text-slate-400">{k.replace(/_/g, " ")}</span><span className="font-mono text-xs text-white">${(v / 1e6).toFixed(2)}M</span></div>
                    ))}</CardContent>
                  </Card>
                </div>
              )}

              {/* Credit & Readiness */}
              {result.credit && (
                <Card className="border-slate-700 bg-[#0D2218]">
                  <CardHeader><CardTitle className="text-[#C4A048]" style={{ fontFamily: "Cormorant Garamond" }}>Credit Assessment</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div><p className="font-mono text-[0.6rem] uppercase text-slate-500">DSCR</p><p className="font-mono text-2xl text-white">{result.credit.dscr}x</p></div>
                      <div><p className="font-mono text-[0.6rem] uppercase text-slate-500">Grade</p><p className="font-mono text-2xl text-[#C4A048]">{result.credit.grade}</p></div>
                      <div><p className="font-mono text-[0.6rem] uppercase text-slate-500">Meets Floor</p><p className={`font-mono text-2xl ${result.credit.meets_universal_floor ? "text-emerald-400" : "text-red-400"}`}>{result.credit.meets_universal_floor ? "PASS" : "FAIL"}</p></div>
                    </div>
                    {result.readiness_flags?.map((f: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 py-1">
                        <span className={`w-2 h-2 rounded-full ${f.status === "pass" ? "bg-emerald-500" : f.status === "warn" ? "bg-yellow-500" : "bg-red-500"}`} />
                        <span className="text-xs text-slate-300">{f.message}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
