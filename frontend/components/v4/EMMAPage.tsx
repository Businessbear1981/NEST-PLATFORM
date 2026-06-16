"use client";
const _API = process.env.NEXT_PUBLIC_API_URL || "https://api.ardanedgecapital.com";
/**
 * EMMA — MSRB Electronic Municipal Market Access.
 * Muni bond corpus, comparable transactions, sector templates, parsing.
 *
 * Wired to /api/emma/stats, /api/emma/comps, /api/emma/templates, /api/emma/search.
 * Brand: gold on dark forest, no purple.
 */
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SECTORS = [
  { value: "senior_living", label: "Senior Living / CCRC" },
  { value: "hospitals", label: "Hospitals" },
  { value: "charter_schools", label: "Charter Schools" },
  { value: "higher_education", label: "Higher Education" },
  { value: "affordable_multifamily", label: "Affordable Multifamily" },
  { value: "market_rate_multifamily", label: "Market-Rate Multifamily" },
  { value: "hospitality", label: "Hotels & Hospitality" },
  { value: "data_centers", label: "Data Centers" },
  { value: "solid_waste", label: "Solid Waste" },
  { value: "industrial_manufacturing", label: "Industrial" },
  { value: "distribution", label: "Distribution" },
  { value: "corporate_ma", label: "Corporate M&A" },
];

const STATES = ["FL","TX","CA","NY","WA","OR","IL","PA","OH","GA","NC","AZ","CO","MA","NJ","VA"];

type Bond = {
  borrower?: string;
  issuer?: string;
  state?: string;
  sector?: string;
  naics_code?: string;
  par_amount?: number;
  coupon_rate?: number;
  tax_status?: string;
  security_type?: string;
  amortization?: string;
  maturity_date?: string;
  dated_date?: string;
  cusip?: string;
  ratings?: { sp?: string; moodys?: string; fitch?: string; kbra?: string };
  enhancement?: { type?: string; provider?: string; enhanced_rating?: string };
  counterparties?: { underwriter?: string; bond_counsel?: string; trustee?: string; financial_advisor?: string };
  reserves?: { dsrf?: number; dsrf_type?: string; cap_i_reserve?: number; operating_reserve?: number };
  covenant_package?: { dscr_threshold?: number; additional_bonds_test?: string; distribution_trap?: number };
  status?: string;
  stage?: string;
};

type Stats = {
  total_parsed: number;
  valid_parsed: number;
  errors: number;
  by_sector: Record<string, number>;
  by_state: Record<string, number>;
};

const fmtUSD = (n?: number) => {
  if (!n) return "—";
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
};

function BondCard({ bond }: { bond: Bond }) {
  const ratingStr = [bond.ratings?.sp, bond.ratings?.moodys, bond.ratings?.fitch, bond.ratings?.kbra]
    .filter(Boolean).join(" / ") || "NR";
  return (
    <Card className="border-[#C4A048]/20 bg-[#0D2218]/80 hover:border-[#C4A048]/40 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <p className="font-[Cormorant_Garamond] text-lg text-amber-100 truncate">{bond.borrower || bond.issuer || "Unnamed"}</p>
            <p className="font-mono text-[0.55rem] uppercase tracking-wider text-[#7A9A82] mt-0.5">
              {bond.issuer && bond.borrower && bond.borrower !== bond.issuer ? `via ${bond.issuer}` : ""}
              {bond.cusip ? ` · CUSIP ${bond.cusip}` : ""}
            </p>
          </div>
          <Badge variant="outline" className="shrink-0 border-[#C4A048]/40 bg-[#C4A048]/10 text-[#C4A048] font-mono text-[0.55rem] uppercase tracking-wider">
            {ratingStr}
          </Badge>
        </div>
        <div className="grid grid-cols-4 gap-2 mt-3 font-mono text-[0.65rem]">
          <div>
            <p className="text-[#7A9A82] text-[0.5rem] uppercase tracking-wider">Par</p>
            <p className="text-[#C4A048] mt-0.5">{fmtUSD(bond.par_amount)}</p>
          </div>
          <div>
            <p className="text-[#7A9A82] text-[0.5rem] uppercase tracking-wider">Coupon</p>
            <p className="text-amber-100 mt-0.5">{bond.coupon_rate != null ? `${bond.coupon_rate}%` : "—"}</p>
          </div>
          <div>
            <p className="text-[#7A9A82] text-[0.5rem] uppercase tracking-wider">State</p>
            <p className="text-amber-100 mt-0.5">{bond.state || "—"}</p>
          </div>
          <div>
            <p className="text-[#7A9A82] text-[0.5rem] uppercase tracking-wider">Sector</p>
            <p className="text-amber-100 mt-0.5 truncate">{(bond.sector || "—").replace(/_/g, " ")}</p>
          </div>
        </div>
        {bond.enhancement?.type && bond.enhancement.type !== "none" && (
          <div className="mt-3 pt-2 border-t border-white/5 flex items-center gap-2 font-mono text-[0.55rem]">
            <span className="text-[#7A9A82] uppercase tracking-wider">Enhancement</span>
            <span className="text-emerald-300">{bond.enhancement.type}</span>
            {bond.enhancement.provider && <span className="text-[#7A9A82]">· {bond.enhancement.provider}</span>}
            {bond.enhancement.enhanced_rating && <Badge variant="outline" className="border-emerald-400/30 bg-emerald-400/10 text-emerald-200 font-mono text-[0.5rem]">→ {bond.enhancement.enhanced_rating}</Badge>}
          </div>
        )}
        {bond.counterparties && (bond.counterparties.underwriter || bond.counterparties.bond_counsel || bond.counterparties.trustee) && (
          <div className="mt-2 grid grid-cols-2 gap-1 font-mono text-[0.55rem] text-[#7A9A82]">
            {bond.counterparties.underwriter && <div><span className="text-[#7A9A82] uppercase tracking-wider">Uw </span>{bond.counterparties.underwriter}</div>}
            {bond.counterparties.bond_counsel && <div><span className="text-[#7A9A82] uppercase tracking-wider">BC </span>{bond.counterparties.bond_counsel}</div>}
            {bond.counterparties.trustee && <div><span className="text-[#7A9A82] uppercase tracking-wider">Tr </span>{bond.counterparties.trustee}</div>}
            {bond.counterparties.financial_advisor && <div><span className="text-[#7A9A82] uppercase tracking-wider">FA </span>{bond.counterparties.financial_advisor}</div>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function EMMAPage() {
  const [activeTab, setActiveTab] = useState("comps");
  const [stats, setStats] = useState<Stats | null>(null);

  // Comps tab state
  const [compsSector, setCompsSector] = useState("senior_living");
  const [compsState, setCompsState] = useState("");
  const [compsMinPar, setCompsMinPar] = useState("");
  const [compsMaxPar, setCompsMaxPar] = useState("");
  const [comps, setComps] = useState<Bond[]>([]);
  const [compsLoading, setCompsLoading] = useState(false);

  // Search tab state
  const [searchIssuer, setSearchIssuer] = useState("");
  const [searchState, setSearchState] = useState("");
  const [searchResults, setSearchResults] = useState<Bond[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Templates tab state
  const [templateSector, setTemplateSector] = useState("senior_living");
  const [template, setTemplate] = useState<any>(null);

  // Load stats on mount + auto-load CCRC comps as starting state
  useEffect(() => {
    fetch(`${_API}/api/emma/stats`).then(r => r.json()).then(d => { if (d.success) setStats(d.data); }).catch(() => {});
    runComps("senior_living", "", "", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runComps(sector: string, st: string, min: string, max: string) {
    setCompsLoading(true);
    try {
      const params = new URLSearchParams();
      if (sector) params.set("sector", sector);
      if (st) params.set("state", st);
      if (min) params.set("min_par", String(Number(min) * 1e6));
      if (max) params.set("max_par", String(Number(max) * 1e6));
      params.set("limit", "20");
      const r = await fetch(`${_API}/api/emma/comps?${params}`);
      const d = await r.json();
      if (d.success) setComps((d.data?.comps as Bond[]) || []);
    } finally {
      setCompsLoading(false);
    }
  }

  async function runSearch() {
    setSearchLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchIssuer) params.set("issuer", searchIssuer);
      if (searchState) params.set("state", searchState);
      params.set("limit", "20");
      const r = await fetch(`${_API}/api/emma/search?${params}`);
      const d = await r.json();
      if (d.success) setSearchResults((d.data?.results as Bond[]) || []);
    } finally {
      setSearchLoading(false);
    }
  }

  async function loadTemplate() {
    const r = await fetch(`${_API}/api/emma/templates?sector=${templateSector}`);
    const d = await r.json();
    if (d.success) setTemplate(d.data);
  }

  // Sector tiles (sorted by count desc)
  const sectorTiles = stats ? Object.entries(stats.by_sector || {}).sort((a, b) => b[1] - a[1]) : [];

  return (
    <div className="space-y-6">
      {/* Hero — gold on dark forest, no purple */}
      <section className="relative overflow-hidden rounded-[1.8rem] border border-[#C4A048]/25 bg-[#060E1A] p-5 text-[#EDE8DC] shadow-[0_0_85px_rgba(196,160,72,0.08)] sm:p-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(196,160,72,0.12),transparent_34%),linear-gradient(135deg,rgba(13,34,24,0.76),rgba(3,10,6,0.96))]" />
        <div className="relative grid gap-5 lg:grid-cols-[1fr_0.6fr]">
          <div>
            <div className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-[#C4A048]">EMMA · MSRB Electronic Municipal Market Access</div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-amber-100 sm:text-5xl" style={{ fontFamily: "Cormorant Garamond, serif" }}>EMMA Intelligence</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#EDE8DC]">
              Municipal bond corpus. Parse Official Statements into structured profiles. Find comparable transactions by sector, size, rating, and state.
              Generate sector templates from real market data.
            </p>
          </div>
          {stats && (
            <div className="grid grid-cols-2 gap-3">
              <Card className="border-[#C4A048]/20 bg-white/[0.03]"><CardContent className="p-3">
                <p className="font-mono text-[0.55rem] uppercase tracking-wider text-[#7A9A82]">Parsed Bonds</p>
                <p className="mt-1 font-mono text-2xl text-[#C4A048]">{stats.total_parsed}</p>
                <p className="font-mono text-[0.55rem] text-[#7A9A82] mt-0.5">{stats.valid_parsed} valid · {stats.errors} errors</p>
              </CardContent></Card>
              <Card className="border-[#C4A048]/20 bg-white/[0.03]"><CardContent className="p-3">
                <p className="font-mono text-[0.55rem] uppercase tracking-wider text-[#7A9A82]">Sectors Covered</p>
                <p className="mt-1 font-mono text-2xl text-amber-100">{Object.keys(stats.by_sector || {}).length}</p>
                <p className="font-mono text-[0.55rem] text-[#7A9A82] mt-0.5">{Object.keys(stats.by_state || {}).length} states</p>
              </CardContent></Card>
            </div>
          )}
        </div>
      </section>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-[480px]">
          <TabsTrigger value="comps">Comps</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* COMPS — primary tab; banker-facing */}
        <TabsContent value="comps" className="mt-6 space-y-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="min-w-[200px]">
              <p className="font-mono text-[0.55rem] uppercase tracking-wider text-[#7A9A82] mb-1">Sector</p>
              <select value={compsSector} onChange={e => setCompsSector(e.target.value)} className="w-full rounded-lg border border-[#C4A048]/20 bg-black/40 px-3 py-2 text-sm text-amber-100">
                {SECTORS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="w-24">
              <p className="font-mono text-[0.55rem] uppercase tracking-wider text-[#7A9A82] mb-1">State</p>
              <select value={compsState} onChange={e => setCompsState(e.target.value)} className="w-full rounded-lg border border-[#C4A048]/20 bg-black/40 px-3 py-2 text-sm text-amber-100">
                <option value="">All</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="w-32">
              <p className="font-mono text-[0.55rem] uppercase tracking-wider text-[#7A9A82] mb-1">Par Min ($M)</p>
              <input type="number" value={compsMinPar} onChange={e => setCompsMinPar(e.target.value)} placeholder="0" className="w-full rounded-lg border border-[#C4A048]/20 bg-black/40 px-3 py-2 text-sm text-amber-100" />
            </div>
            <div className="w-32">
              <p className="font-mono text-[0.55rem] uppercase tracking-wider text-[#7A9A82] mb-1">Par Max ($M)</p>
              <input type="number" value={compsMaxPar} onChange={e => setCompsMaxPar(e.target.value)} placeholder="No limit" className="w-full rounded-lg border border-[#C4A048]/20 bg-black/40 px-3 py-2 text-sm text-amber-100" />
            </div>
            <Button onClick={() => runComps(compsSector, compsState, compsMinPar, compsMaxPar)} disabled={compsLoading}
              className="border border-[#C4A048]/40 bg-[#C4A048]/15 hover:bg-[#C4A048]/25 text-[#C4A048] font-mono text-xs uppercase tracking-wider">
              {compsLoading ? "Loading…" : "Find Comparables"}
            </Button>
          </div>

          {comps.length === 0 && !compsLoading && (
            <Card className="border-white/[0.06] bg-white/[0.02]"><CardContent className="p-6 text-center">
              <p className="font-mono text-xs text-[#7A9A82]">No comparable bonds returned for these filters.</p>
            </CardContent></Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {comps.map((b, i) => <BondCard key={b.cusip || i} bond={b} />)}
          </div>
        </TabsContent>

        {/* SEARCH */}
        <TabsContent value="search" className="mt-6 space-y-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[280px]">
              <p className="font-mono text-[0.55rem] uppercase tracking-wider text-[#7A9A82] mb-1">Issuer / Borrower Name</p>
              <input value={searchIssuer} onChange={e => setSearchIssuer(e.target.value)} onKeyDown={e => e.key === "Enter" && runSearch()}
                placeholder="e.g., Jacaranda Trace, Florida Development Finance Corp"
                className="w-full rounded-lg border border-[#C4A048]/20 bg-black/40 px-4 py-2 text-sm text-amber-100 placeholder:text-[#7A9A82]" />
            </div>
            <div className="w-24">
              <p className="font-mono text-[0.55rem] uppercase tracking-wider text-[#7A9A82] mb-1">State</p>
              <select value={searchState} onChange={e => setSearchState(e.target.value)} className="w-full rounded-lg border border-[#C4A048]/20 bg-black/40 px-3 py-2 text-sm text-amber-100">
                <option value="">All</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <Button onClick={runSearch} disabled={searchLoading}
              className="border border-[#C4A048]/40 bg-[#C4A048]/15 hover:bg-[#C4A048]/25 text-[#C4A048] font-mono text-xs uppercase tracking-wider">
              {searchLoading ? "Searching…" : "Search"}
            </Button>
          </div>

          {searchResults.length === 0 && (
            <Card className="border-white/[0.06] bg-white/[0.02]"><CardContent className="p-6 text-center">
              <p className="font-mono text-xs text-[#7A9A82]">{searchLoading ? "Searching…" : "Enter an issuer name and hit Search."}</p>
            </CardContent></Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {searchResults.map((b, i) => <BondCard key={b.cusip || i} bond={b} />)}
          </div>
        </TabsContent>

        {/* TEMPLATES */}
        <TabsContent value="templates" className="mt-6 space-y-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1 max-w-md">
              <p className="font-mono text-[0.55rem] uppercase tracking-wider text-[#7A9A82] mb-1">Sector</p>
              <select value={templateSector} onChange={e => setTemplateSector(e.target.value)} className="w-full rounded-lg border border-[#C4A048]/20 bg-black/40 px-3 py-2 text-sm text-amber-100">
                {SECTORS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <Button onClick={loadTemplate}
              className="border border-[#C4A048]/40 bg-[#C4A048]/15 hover:bg-[#C4A048]/25 text-[#C4A048] font-mono text-xs uppercase tracking-wider">
              Load Template
            </Button>
          </div>
          {template && (
            <Card className="border-[#C4A048]/20 bg-[#0D2218]/80">
              <CardHeader>
                <CardTitle className="font-[Cormorant_Garamond] text-amber-100 text-xl">
                  {(template.sector || templateSector).replace(/_/g, " ")} · Default Structure
                </CardTitle>
                <Badge variant="outline" className="w-fit border-[#C4A048]/40 bg-[#C4A048]/10 text-[#C4A048] font-mono text-[0.55rem] uppercase tracking-wider">
                  {template.sample_size > 0 ? `${template.sample_size} bonds analyzed` : "Sector default"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                {template.template && Object.entries(template.template).map(([k, v]) => (
                  <div key={k} className="flex items-start justify-between gap-3 py-1 border-b border-white/5 last:border-0">
                    <span className="font-mono text-[0.6rem] uppercase tracking-wider text-[#7A9A82]">{k.replace(/_/g, " ")}</span>
                    <span className="font-mono text-xs text-amber-100 text-right">{typeof v === "object" ? JSON.stringify(v) : String(v)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Sector + State distribution at bottom */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-[#C4A048]/15 bg-[#0D2218]/60">
            <CardHeader><CardTitle className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-[#C4A048]">Corpus by Sector</CardTitle></CardHeader>
            <CardContent className="space-y-1.5">
              {sectorTiles.map(([sector, count]) => (
                <div key={sector} className="flex items-center justify-between font-mono text-xs">
                  <span className="text-[#EDE8DC]">{sector.replace(/_/g, " ")}</span>
                  <span className="text-[#C4A048]">{count}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="border-[#C4A048]/15 bg-[#0D2218]/60">
            <CardHeader><CardTitle className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-[#C4A048]">Corpus by State</CardTitle></CardHeader>
            <CardContent className="space-y-1.5">
              {Object.entries(stats.by_state || {}).sort((a, b) => b[1] - a[1]).map(([st, count]) => (
                <div key={st} className="flex items-center justify-between font-mono text-xs">
                  <span className="text-[#EDE8DC]">{st}</span>
                  <span className="text-[#C4A048]">{count}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
