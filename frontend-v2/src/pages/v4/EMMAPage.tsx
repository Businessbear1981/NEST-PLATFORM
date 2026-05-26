/**
 * EMMA Intelligence Layer — Municipal bond data, OS parsing,
 * sector templates, comparable transactions.
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";

const SECTORS = [
  "senior_living", "hospitals", "charter_schools", "higher_education",
  "affordable_multifamily", "market_rate_multifamily", "hotels_hospitality",
  "data_centers", "solid_waste", "water_sewer", "corporate_ma",
];

export default function EMMAPage() {
  const [activeTab, setActiveTab] = useState("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchState, setSearchState] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [templateSector, setTemplateSector] = useState("senior_living");
  const [template, setTemplate] = useState<any>(null);
  const [osText, setOsText] = useState("");
  const [parseResult, setParseResult] = useState<any>(null);
  const [parsing, setParsing] = useState(false);

  const statsQuery = trpc.emma.stats.useQuery();

  async function search() {
    const res = await fetch(`/api/emma/search?issuer=${encodeURIComponent(searchQuery)}&state=${searchState}&limit=20`);
    const data = await res.json();
    if (data.success) setSearchResults(data.data.results || []);
  }

  async function getTemplate() {
    const res = await fetch(`/api/emma/templates?sector=${templateSector}`);
    const data = await res.json();
    if (data.success) setTemplate(data.data);
  }

  async function parseOS() {
    if (!osText.trim()) return;
    setParsing(true);
    const res = await fetch("/api/emma/parse", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: osText }) });
    const data = await res.json();
    if (data.success) setParseResult(data.data);
    setParsing(false);
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[1.8rem] border border-purple-300/25 bg-[#060E1A] p-5 text-slate-100 shadow-[0_0_85px_rgba(168,85,247,0.11)] sm:p-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(168,85,247,0.15),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.76),rgba(2,6,23,0.96))]" />
        <div className="relative grid gap-5 lg:grid-cols-[1fr_0.6fr]">
          <div>
            <div className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-purple-200">EMMA · Electronic Municipal Market Access</div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl" style={{ fontFamily: "Cormorant Garamond, serif" }}>EMMA Intelligence</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">Every muni bond ever issued, structured, rated, insured, and funded. Parse Official Statements into structured profiles. Generate sector templates from real market data. Find comparable transactions.</p>
          </div>
          {statsQuery.data && (
            <div className="grid grid-cols-2 gap-3">
              <Card className="border-white/10 bg-white/[0.04]"><CardContent className="p-3">
                <p className="font-mono text-[0.6rem] uppercase text-slate-500">Parsed Bonds</p>
                <p className="mt-1 text-2xl font-black text-purple-300">{(statsQuery.data as any)?.total_parsed || 0}</p>
              </CardContent></Card>
              <Card className="border-white/10 bg-white/[0.04]"><CardContent className="p-3">
                <p className="font-mono text-[0.6rem] uppercase text-slate-500">Sectors</p>
                <p className="mt-1 text-2xl font-black text-white">{Object.keys((statsQuery.data as any)?.by_sector || {}).length}</p>
              </CardContent></Card>
            </div>
          )}
        </div>
      </section>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-[640px]">
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="parse">Parse OS</TabsTrigger>
          <TabsTrigger value="comps">Comps</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="mt-6 space-y-4">
          <div className="flex gap-3">
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && search()}
              placeholder="Search by issuer name, CUSIP, or keyword..." className="flex-1 rounded-xl border border-slate-700 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-slate-600" />
            <select value={searchState} onChange={(e) => setSearchState(e.target.value)} className="rounded-xl border border-slate-700 bg-black/40 px-3 py-2 text-sm text-white">
              <option value="">All States</option>
              {["FL","TX","CA","NY","WA","OR","IL","PA","OH","GA","NC","AZ","CO","MA","NJ"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <Button onClick={search} className="bg-purple-600 hover:bg-purple-700 px-6">Search</Button>
          </div>
          {searchResults.length > 0 && <div className="space-y-2">
            {searchResults.map((r: any, i: number) => (
              <Card key={i} className="border-slate-700 bg-[#0D2218]"><CardContent className="p-3 text-xs text-slate-300">{JSON.stringify(r).slice(0, 300)}</CardContent></Card>
            ))}
          </div>}
        </TabsContent>

        <TabsContent value="templates" className="mt-6 space-y-4">
          <div className="flex gap-3">
            <select value={templateSector} onChange={(e) => setTemplateSector(e.target.value)} className="flex-1 rounded-xl border border-slate-700 bg-black/40 px-3 py-2 text-sm text-white">
              {SECTORS.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
            </select>
            <Button onClick={getTemplate} className="bg-purple-600 hover:bg-purple-700">Generate Template</Button>
          </div>
          {template && (
            <Card className="border-purple-500/20 bg-[#0D2218]">
              <CardHeader>
                <CardTitle className="text-purple-300 text-sm">Default Template: {template.sector?.replace(/_/g, " ")}</CardTitle>
                <Badge variant="outline">{template.sample_size > 0 ? `${template.sample_size} bonds analyzed` : template.source || "Operating Framework defaults"}</Badge>
              </CardHeader>
              <CardContent>
                <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">{JSON.stringify(template.template, null, 2)}</pre>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="parse" className="mt-6 space-y-4">
          <p className="text-xs text-slate-400">Paste Official Statement text → Claude AI extracts 30+ structural fields (par, coupon, maturity, covenants, reserves, enhancement, rating, counterparties)</p>
          <textarea value={osText} onChange={(e) => setOsText(e.target.value)} rows={10} placeholder="Paste Official Statement text here..."
            className="w-full rounded-xl border border-slate-700 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-slate-600 resize-vertical font-mono" />
          <Button onClick={parseOS} disabled={parsing || !osText.trim()} className="bg-purple-600 hover:bg-purple-700">
            {parsing ? "Parsing with Claude AI..." : "Parse Official Statement"}
          </Button>
          {parseResult && (
            <Card className="border-purple-500/20 bg-[#0D2218]">
              <CardContent className="p-4">
                <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">{JSON.stringify(parseResult, null, 2)}</pre>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="comps" className="mt-6">
          <Card className="border-slate-700 bg-[#0D2218]"><CardContent className="p-6">
            <p className="text-sm text-slate-300">Comparable transaction search — filter parsed bonds by sector, size, rating, state, tax status. Populated as Official Statements are parsed into the bond structure database.</p>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
