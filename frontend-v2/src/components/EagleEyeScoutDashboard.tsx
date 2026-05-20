import { useState } from "react";
import { Loader2, Eye, Target, ArrowUpRight, Search, Zap, MapPin, Building2, Briefcase, FileText, TrendingUp, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";

const statusColors: Record<string, string> = {
  hot: "border-red-400/40 bg-red-500/15 text-red-200",
  warm: "border-amber-300/40 bg-amber-300/15 text-amber-200",
  review: "border-cyan-300/40 bg-cyan-400/15 text-cyan-200",
  passed: "border-slate-400/40 bg-slate-500/15 text-slate-300",
  converted: "border-emerald-300/40 bg-emerald-400/15 text-emerald-200",
};

function formatMoney(val: number) {
  if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(1)}B`;
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val}`;
}

// ── Seeded M&A signals ──────────────────────────────────────────
const MA_SIGNALS = [
  { id: "ma_1", type: "edgar_8k", entity: "Redwood Healthcare REIT", target: "3 nursing care facilities (King County, WA)", ev_usd: 89_000_000, ebitda_usd: 8_900_000, multiple: "10.0x", naics: "6231", state: "WA", score: 82, status: "hot" },
  { id: "ma_2", type: "edgar_sc13d", entity: "Pacific Senior Holdings", target: "Activist stake — 9.2% ownership, board seats demanded", ev_usd: 340_000_000, ebitda_usd: 28_000_000, multiple: "12.1x", naics: "6232", state: "CA", score: 71, status: "warm" },
  { id: "ma_3", type: "press_release", entity: "Meridian Health Partners", target: "Strategic review announced — exploring sale or merger", ev_usd: 156_000_000, ebitda_usd: 14_500_000, multiple: "10.8x", naics: "6232", state: "AZ", score: 65, status: "warm" },
  { id: "ma_4", type: "distress_signal", entity: "Cascadia Wellness Group", target: "Covenant breach — DSCR 1.08x, lender waiver expiring Q3", ev_usd: 67_000_000, ebitda_usd: 5_200_000, multiple: "12.9x", naics: "6232", state: "OR", score: 58, status: "review" },
];

// ── Seeded Real Estate signals ──────────────────────────────────
const RE_SIGNALS = [
  { id: "re_1", type: "ucc_filing", entity: "Jacaranda Trace Holdings LLC", detail: "UCC-1 filing — $231M blanket lien, senior living CCRC", amount_usd: 231_000_000, naics: "6232", state: "FL", county: "Ventura", source: "FL Secretary of State", score: 92, status: "hot" },
  { id: "re_2", type: "permit", entity: "Meridian Cove Senior Living LLC", detail: "Building permit issued — 220-unit assisted living, Phase I", amount_usd: 145_000_000, naics: "6232", state: "AZ", county: "Maricopa", source: "Maricopa County Permits", score: 78, status: "warm" },
  { id: "re_3", type: "title_transfer", entity: "Cascadia Development Partners", detail: "Title transfer — 14-acre commercial parcel, zoned mixed-use", amount_usd: 67_000_000, naics: "5311", state: "CA", county: "Orange", source: "Orange County Recorder", score: 55, status: "review" },
  { id: "re_4", type: "permit", entity: "Lone Star Senior Communities", detail: "Site plan approved — 180-unit memory care + AL campus", amount_usd: 112_000_000, naics: "6232", state: "TX", county: "Travis", source: "Travis County Planning", score: 74, status: "warm" },
  { id: "re_5", type: "ucc_filing", entity: "Summit View Health Campus LLC", detail: "UCC-3 amendment — additional collateral, construction draw", amount_usd: 88_000_000, naics: "6232", state: "WA", county: "Pierce", source: "WA SOS", score: 61, status: "review" },
];

const MA_TYPE_LABELS: Record<string, string> = {
  edgar_8k: "8-K Filing", edgar_sc13d: "SC 13D", press_release: "Press Release", distress_signal: "Distress Signal",
};
const RE_TYPE_LABELS: Record<string, string> = {
  ucc_filing: "UCC Filing", permit: "Building Permit", title_transfer: "Title Transfer",
};

export default function EagleEyeScoutDashboard({ dealId, summaryMode }: { dealId?: string; summaryMode?: boolean }) {
  const [subTab, setSubTab] = useState("all");
  const [scoutNaics, setScoutNaics] = useState("6232");

  const signalsQuery = trpc.eagleeye.signals.useQuery();
  const statsQuery = trpc.eagleeye.stats.useQuery();
  const scoutMutation = trpc.eagleeye.scout.useMutation({ onSuccess: () => signalsQuery.refetch() });
  const convertMutation = trpc.eagleeye.convert.useMutation({ onSuccess: () => { signalsQuery.refetch(); statsQuery.refetch(); } });

  // M&A scout
  const maScoutMutation = trpc.powerstrip.route.useMutation();

  const apiSignals = (signalsQuery.data as any)?.signals ?? [];
  const stats = statsQuery.data as any;

  // Combined pipeline value
  const totalPipeline = (stats?.pipeline_usd ?? 0) +
    MA_SIGNALS.filter((s) => s.status === "hot" || s.status === "warm").reduce((sum, s) => sum + s.ev_usd, 0) +
    RE_SIGNALS.filter((s) => s.status === "hot" || s.status === "warm").reduce((sum, s) => sum + s.amount_usd, 0);

  if (summaryMode) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-2 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-cyan-200">
          <Eye size={14} /> EagleEye Scout
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <div>
            <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-slate-500">RE Signals</p>
            <p className="font-mono text-xl font-semibold text-white">{RE_SIGNALS.length}</p>
          </div>
          <div>
            <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-slate-500">M&A Signals</p>
            <p className="font-mono text-xl font-semibold text-cyan-200">{MA_SIGNALS.length}</p>
          </div>
          <div>
            <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-slate-500">Pipeline</p>
            <p className="font-mono text-xl font-semibold text-amber-100">{formatMoney(totalPipeline)}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-cyan-200">
            <Eye size={17} /> EagleEye — Deal Sourcing Engine
          </div>
          <p className="mt-1 text-sm text-slate-400">M&A intelligence, real estate development signals, UCC filings, permits, EDGAR — scored and ranked.</p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: "Total Signals", value: `${RE_SIGNALS.length + MA_SIGNALS.length + apiSignals.length}`, tone: "text-white" },
          { label: "M&A Targets", value: `${MA_SIGNALS.length}`, tone: "text-cyan-200" },
          { label: "RE Deals", value: `${RE_SIGNALS.length}`, tone: "text-emerald-200" },
          { label: "Hot Leads", value: `${MA_SIGNALS.filter((s) => s.status === "hot").length + RE_SIGNALS.filter((s) => s.status === "hot").length}`, tone: "text-red-200" },
          { label: "Pipeline", value: formatMoney(totalPipeline), tone: "text-amber-100" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
            <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-slate-500">{s.label}</p>
            <p className={`font-mono text-lg font-semibold ${s.tone}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Sub-tabs */}
      <Tabs value={subTab} onValueChange={setSubTab}>
        <TabsList className="w-fit rounded-xl border border-white/10 bg-black/45">
          <TabsTrigger value="all" className="font-mono text-[0.68rem] uppercase"><Eye size={13} className="mr-1" /> All</TabsTrigger>
          <TabsTrigger value="ma" className="font-mono text-[0.68rem] uppercase"><Briefcase size={13} className="mr-1" /> M&A</TabsTrigger>
          <TabsTrigger value="re" className="font-mono text-[0.68rem] uppercase"><Building2 size={13} className="mr-1" /> Real Estate</TabsTrigger>
          <TabsTrigger value="scout" className="font-mono text-[0.68rem] uppercase"><Search size={13} className="mr-1" /> AI Scout</TabsTrigger>
        </TabsList>

        {/* ── ALL SIGNALS ─────────────────────────────────────────── */}
        <TabsContent value="all" className="mt-4 space-y-3">
          {[...RE_SIGNALS.map((s) => ({ ...s, category: "re" as const })), ...MA_SIGNALS.map((s) => ({ ...s, category: "ma" as const }))]
            .sort((a, b) => b.score - a.score)
            .map((sig) => (
              <SignalCard key={sig.id} signal={sig} onConvert={() => {}} />
            ))}
        </TabsContent>

        {/* ── M&A SIGNALS ─────────────────────────────────────────── */}
        <TabsContent value="ma" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-cyan-200">M&A Intelligence — EDGAR, Distress, Activist</h3>
            <Button
              onClick={() => maScoutMutation.mutate({
                taskType: "ma_analysis",
                prompt: "Scan for M&A opportunities in senior living (NAICS 6232) and nursing care (6231) across FL, TX, AZ, CA, WA. Look for: companies under strategic review, activist stakes >5%, covenant breaches signaling distress, and recent 8-K acquisition filings. List top 3 targets with entity name, state, estimated EV, EV/EBITDA multiple, and a 1-sentence thesis. Jimmy Lee tone.",
              })}
              disabled={maScoutMutation.isPending}
              className="rounded-xl border border-cyan-300/35 bg-cyan-400/12 px-4 py-2 font-mono text-[0.68rem] font-semibold uppercase text-cyan-100 hover:bg-cyan-400/20"
            >
              {maScoutMutation.isPending ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Globe className="mr-2 h-3.5 w-3.5" />}
              Run M&A Scout
            </Button>
          </div>

          {maScoutMutation.data && (
            <div className="rounded-2xl border border-cyan-300/25 bg-black/35 p-5">
              <div className="flex items-center gap-2 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-cyan-200">
                <Zap size={14} /> AI M&A Intelligence Report
              </div>
              <p className="mt-3 whitespace-pre-wrap font-mono text-sm leading-6 text-slate-300">
                {(maScoutMutation.data as any).content}
              </p>
            </div>
          )}

          <div className="space-y-3">
            {MA_SIGNALS.map((sig) => (
              <article key={sig.id} className="rounded-2xl border border-white/10 bg-black/35 p-4 transition hover:border-cyan-300/25">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Briefcase size={14} className="text-cyan-300" />
                      <h3 className="font-mono text-sm font-semibold text-white">{sig.entity}</h3>
                      <span className={`rounded-full border px-2 py-0.5 font-mono text-[0.56rem] font-semibold uppercase ${statusColors[sig.status]}`}>{sig.status}</span>
                      <span className="rounded-full border border-cyan-300/20 bg-cyan-400/8 px-2 py-0.5 font-mono text-[0.52rem] uppercase text-cyan-200">{MA_TYPE_LABELS[sig.type] ?? sig.type}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-400">{sig.target}</p>
                    <div className="mt-2 flex items-center gap-4 font-mono text-[0.62rem] text-slate-500">
                      <span><MapPin size={11} className="inline" /> {sig.state}</span>
                      <span>NAICS {sig.naics}</span>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-mono text-lg font-semibold text-amber-100">{formatMoney(sig.ev_usd)}</p>
                    <p className="font-mono text-[0.62rem] text-slate-400">EV/EBITDA: {sig.multiple}</p>
                    <div className="flex items-center justify-end gap-1">
                      <Target size={12} className="text-cyan-300" />
                      <span className="font-mono text-sm font-semibold text-cyan-100">{sig.score}/100</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </TabsContent>

        {/* ── REAL ESTATE SIGNALS ─────────────────────────────────── */}
        <TabsContent value="re" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-emerald-200">Real Estate Development — UCC, Permits, Title</h3>
            <div className="flex gap-2">
              <select value={scoutNaics} onChange={(e) => setScoutNaics(e.target.value)} className="rounded-xl border border-emerald-300/20 bg-black/45 px-3 py-2 font-mono text-[0.72rem] text-slate-100 outline-none">
                <option value="6232">Assisted Living</option>
                <option value="6231">Nursing Care</option>
                <option value="5311">Property Mgmt</option>
                <option value="2361">Construction</option>
              </select>
              <Button
                onClick={() => scoutMutation.mutate({ naics: scoutNaics, states: ["FL", "TX", "AZ", "CA", "WA"] })}
                disabled={scoutMutation.isPending}
                className="rounded-xl border border-emerald-300/35 bg-emerald-400/12 px-4 py-2 font-mono text-[0.68rem] font-semibold uppercase text-emerald-100 hover:bg-emerald-400/20"
              >
                {scoutMutation.isPending ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Search className="mr-2 h-3.5 w-3.5" />}
                Run RE Scout
              </Button>
            </div>
          </div>

          {scoutMutation.data && (
            <div className="rounded-2xl border border-emerald-300/25 bg-black/35 p-5">
              <div className="flex items-center gap-2 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-emerald-200">
                <Zap size={14} /> AI Real Estate Scout — {(scoutMutation.data as any).naics_desc}
              </div>
              <p className="mt-3 whitespace-pre-wrap font-mono text-sm leading-6 text-slate-300">{(scoutMutation.data as any).ai_results}</p>
            </div>
          )}

          <div className="space-y-3">
            {RE_SIGNALS.map((sig) => (
              <article key={sig.id} className="rounded-2xl border border-white/10 bg-black/35 p-4 transition hover:border-emerald-300/25">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="text-emerald-300" />
                      <h3 className="font-mono text-sm font-semibold text-white">{sig.entity}</h3>
                      <span className={`rounded-full border px-2 py-0.5 font-mono text-[0.56rem] font-semibold uppercase ${statusColors[sig.status]}`}>{sig.status}</span>
                      <span className="rounded-full border border-emerald-300/20 bg-emerald-400/8 px-2 py-0.5 font-mono text-[0.52rem] uppercase text-emerald-200">{RE_TYPE_LABELS[sig.type] ?? sig.type}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-400">{sig.detail}</p>
                    <div className="mt-2 flex items-center gap-4 font-mono text-[0.62rem] text-slate-500">
                      <span><MapPin size={11} className="inline" /> {sig.state} · {sig.county}</span>
                      <span>NAICS {sig.naics}</span>
                      <span>{sig.source}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-lg font-semibold text-amber-100">{formatMoney(sig.amount_usd)}</p>
                    <div className="mt-1 flex items-center justify-end gap-1">
                      <Target size={12} className="text-emerald-300" />
                      <span className="font-mono text-sm font-semibold text-emerald-100">{sig.score}/100</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </TabsContent>

        {/* ── AI SCOUT ────────────────────────────────────────────── */}
        <TabsContent value="scout" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => scoutMutation.mutate({ naics: "6232", states: ["FL", "TX", "AZ", "CA", "WA"] })}
              disabled={scoutMutation.isPending}
              className="rounded-xl border border-emerald-300/35 bg-emerald-400/12 px-4 py-3 font-mono text-[0.72rem] font-semibold uppercase text-emerald-100 hover:bg-emerald-400/20"
            >
              <Building2 className="mr-2 h-4 w-4" /> Scout Real Estate Deals
            </Button>
            <Button
              onClick={() => maScoutMutation.mutate({
                taskType: "ma_analysis",
                prompt: "Find 3 M&A acquisition targets in senior living/healthcare (NAICS 6231, 6232) with EV $50M-$500M. Include: entity, state, estimated EV, EV/EBITDA, thesis. Jimmy Lee tone.",
              })}
              disabled={maScoutMutation.isPending}
              className="rounded-xl border border-cyan-300/35 bg-cyan-400/12 px-4 py-3 font-mono text-[0.72rem] font-semibold uppercase text-cyan-100 hover:bg-cyan-400/20"
            >
              <Briefcase className="mr-2 h-4 w-4" /> Scout M&A Targets
            </Button>
          </div>

          {scoutMutation.data && (
            <div className="rounded-2xl border border-emerald-300/25 bg-black/35 p-5">
              <h4 className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-emerald-200">RE Scout Results</h4>
              <p className="mt-2 whitespace-pre-wrap font-mono text-sm leading-6 text-slate-300">{(scoutMutation.data as any).ai_results}</p>
            </div>
          )}
          {maScoutMutation.data && (
            <div className="rounded-2xl border border-cyan-300/25 bg-black/35 p-5">
              <h4 className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-cyan-200">M&A Scout Results</h4>
              <p className="mt-2 whitespace-pre-wrap font-mono text-sm leading-6 text-slate-300">{(maScoutMutation.data as any).content}</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Shared signal card ──────────────────────────────────────────
function SignalCard({ signal, onConvert }: { signal: any; onConvert: () => void }) {
  const isMA = signal.category === "ma";
  return (
    <article className="rounded-2xl border border-white/10 bg-black/35 p-4 transition hover:border-white/20">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {isMA ? <Briefcase size={14} className="text-cyan-300" /> : <Building2 size={14} className="text-emerald-300" />}
            <h3 className="font-mono text-sm font-semibold text-white">{signal.entity}</h3>
            <span className={`rounded-full border px-2 py-0.5 font-mono text-[0.56rem] font-semibold uppercase ${statusColors[signal.status]}`}>{signal.status}</span>
            <span className={`rounded-full border px-2 py-0.5 font-mono text-[0.52rem] uppercase ${isMA ? "border-cyan-300/20 bg-cyan-400/8 text-cyan-200" : "border-emerald-300/20 bg-emerald-400/8 text-emerald-200"}`}>
              {isMA ? "M&A" : "RE Dev"}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">{signal.target ?? signal.detail}</p>
          <div className="mt-2 flex items-center gap-3 font-mono text-[0.62rem] text-slate-500">
            <span><MapPin size={11} className="inline" /> {signal.state}{signal.county ? ` · ${signal.county}` : ""}</span>
            <span>NAICS {signal.naics}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-lg font-semibold text-amber-100">{formatMoney(signal.ev_usd ?? signal.amount_usd)}</p>
          {signal.multiple && <p className="font-mono text-[0.62rem] text-slate-400">{signal.multiple}</p>}
          <div className="mt-1 flex items-center justify-end gap-1">
            <Target size={12} className={isMA ? "text-cyan-300" : "text-emerald-300"} />
            <span className="font-mono text-sm font-semibold text-white">{signal.score}/100</span>
          </div>
        </div>
      </div>
    </article>
  );
}
