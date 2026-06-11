import { useState, useMemo, useEffect } from "react";
import { Eye, Briefcase, Building2, Crosshair, Target, Search, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import api from "@/lib/api";
import EagleEyeHeatMap from "./EagleEyeHeatMap";
import EagleEyeSignalDetail from "./EagleEyeSignalDetail";
import BullseyePitchEngine from "./BullseyePitchEngine";
import BoxingOutTracker from "./BoxingOutTracker";
import IPOReadinessDashboard from "./IPOReadinessDashboard";
import {
  DEMO_BULLSEYE_PITCHES,
  DEMO_BOXINGOUT_PROSPECTS, DEMO_CONTENT_QUEUE,
  EagleEyeSignal, MASignal, CRESignal, STATUS_COLORS, formatMoney,
} from "@/shared/eagleEyeDemo";

// ── Signal Card (shared) ─────────────────────────────────────────

function SignalCard({
  signal,
  onClick,
}: {
  signal: EagleEyeSignal;
  onClick: () => void;
}) {
  const isMA = signal.category === "ma";
  const maSignal = isMA ? (signal as MASignal) : null;
  const creSignal = !isMA ? (signal as CRESignal) : null;

  return (
    <article
      onClick={onClick}
      className="cursor-pointer rounded-2xl border border-white/10 bg-black/35 p-4 transition hover:border-white/20 hover:bg-black/45"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {isMA ? <Briefcase size={14} className="text-cyan-300" /> : <Building2 size={14} className="text-emerald-300" />}
            <h3 className="font-mono text-sm font-semibold text-white">{signal.entity}</h3>
            <span className={`rounded-full border px-2 py-0.5 font-mono text-[0.56rem] font-semibold uppercase ${STATUS_COLORS[signal.status]}`}>
              {signal.status}
            </span>
            <span className={`rounded-full border px-2 py-0.5 font-mono text-[0.52rem] uppercase ${isMA ? "border-cyan-300/20 bg-cyan-400/8 text-cyan-200" : "border-emerald-300/20 bg-emerald-400/8 text-emerald-200"}`}>
              {isMA ? "M&A" : "CRE"}
            </span>
            {creSignal?.darkZone && (
              <span className="rounded-full border border-red-400/30 bg-red-500/10 px-2 py-0.5 font-mono text-[0.52rem] uppercase text-red-300">
                Dark Zone
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-400 line-clamp-2">{signal.description}</p>
          <div className="mt-2 flex items-center gap-4 font-mono text-[0.62rem] text-slate-500">
            <span><MapPin size={11} className="inline" /> {signal.city}, {signal.state}</span>
            <span>NAICS {signal.naics}</span>
            {maSignal?.ownership && !maSignal.ownership.bankerEngaged && (
              <span className="text-emerald-400">No banker engaged</span>
            )}
            {maSignal?.ownership && maSignal.ownership.generation >= 3 && (
              <span className="text-red-300">Gen {maSignal.ownership.generation}</span>
            )}
          </div>
          {/* M&A dimension badges */}
          {isMA && maSignal && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {maSignal.announcedEquityRaise && (
                <span className="rounded-full border border-red-400/40 bg-red-500/15 px-2 py-0.5 font-mono text-[0.52rem] font-semibold uppercase text-red-300">
                  Equity Raise
                </span>
              )}
              {maSignal.syndicatedLoanSignal === "hot" && (
                <span className="rounded-full border border-amber-400/40 bg-amber-400/15 px-2 py-0.5 font-mono text-[0.52rem] font-semibold uppercase text-amber-300">
                  Syndicated
                </span>
              )}
              {maSignal.syndicatedLoanSignal !== "hot" && maSignal.hasSyndicatedDebt && (
                <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 font-mono text-[0.52rem] font-semibold uppercase text-amber-400">
                  Syndicated
                </span>
              )}
              {maSignal.recentRefinancing && (
                <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-2 py-0.5 font-mono text-[0.52rem] font-semibold uppercase text-amber-300">
                  Refi
                </span>
              )}
              {maSignal.marketGrowthPct != null && maSignal.marketGrowthPct > 10 && (
                <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 font-mono text-[0.52rem] font-semibold text-emerald-300">
                  {maSignal.marketGrowthPct}% CAGR
                </span>
              )}
              {maSignal.marketGrowthPct != null && maSignal.marketGrowthPct >= 5 && maSignal.marketGrowthPct <= 10 && (
                <span className="rounded-full border border-amber-400/25 bg-amber-400/8 px-2 py-0.5 font-mono text-[0.52rem] font-semibold text-amber-400">
                  {maSignal.marketGrowthPct}% CAGR
                </span>
              )}
              {maSignal.revenueStreams != null && (
                <span className="rounded-full border border-slate-400/25 bg-slate-500/10 px-2 py-0.5 font-mono text-[0.52rem] text-slate-400">
                  {maSignal.revenueStreams} streams
                </span>
              )}
              {maSignal.techEnabled && (
                <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 font-mono text-[0.52rem] font-semibold uppercase text-cyan-300">
                  Tech-Enabled
                </span>
              )}
            </div>
          )}
        </div>
        <div className="text-right space-y-1">
          <p className="font-mono text-lg font-semibold text-amber-100">
            {isMA ? formatMoney((signal as MASignal).revenueUsd) : formatMoney((signal as CRESignal).amountUsd)}
          </p>
          {maSignal && (
            <p className="font-mono text-[0.62rem] text-slate-400">
              EBITDA: {formatMoney(maSignal.ebitdaUsd)}
              {maSignal.ebitdaUsd < 20_000_000 && <span className="text-red-300 ml-1">(sub-$20M)</span>}
            </p>
          )}
          {creSignal?.darkZone && (
            <p className="font-mono text-[0.62rem] text-red-300">
              Cap: {creSignal.darkZone.currentCapRate}% · DSCR: {creSignal.darkZone.dscr}x
            </p>
          )}
          <div className="flex items-center justify-end gap-1">
            <Target size={12} className={isMA ? "text-cyan-300" : "text-emerald-300"} />
            <span className="font-mono text-sm font-semibold text-white">{signal.score}/100</span>
          </div>
        </div>
      </div>
    </article>
  );
}

// ── Main Dashboard ───────────────────────────────────────────────

export default function EagleEyeScoutDashboard({ summaryMode }: { summaryMode?: boolean }) {
  const [mainTab, setMainTab] = useState("ma");
  const [activeState, setActiveState] = useState<string | null>(null);
  const [selectedSignalId, setSelectedSignalId] = useState<string | null>(null);
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);

  // ── Live signals state ─────────────────────────────────────────
  const [signals, setSignals] = useState<EagleEyeSignal[]>([]);
  const [signalsLoading, setSignalsLoading] = useState(true);

  useEffect(() => {
    api.eagleeye.signals()
      .then((data) => {
        const arr = Array.isArray(data) ? (data as EagleEyeSignal[]) : [];
        setSignals(arr);
      })
      .catch(() => setSignals([]))
      .finally(() => setSignalsLoading(false));
  }, []);

  // ── Find-similar state ────────────────────────────────────────
  const [fsState, setFsState] = useState("");
  const [fsSector, setFsSector] = useState("senior_living");
  const [fsAmount, setFsAmount] = useState("");
  const [fsBorrower, setFsBorrower] = useState("");
  const [fsLoading, setFsLoading] = useState(false);
  const [fsResults, setFsResults] = useState<unknown[]>([]);

  async function handleFindSimilar() {
    if (!fsBorrower || !fsState || !fsAmount) return;
    setFsLoading(true);
    setFsResults([]);
    try {
      const data = await api.eagleeye.findSimilar({
        borrower: fsBorrower,
        sector: fsSector,
        state: fsState,
        par_amount: Number(fsAmount) * 1_000_000,
      });
      setFsResults(Array.isArray(data) ? (data as unknown[]) : []);
    } catch {
      setFsResults([]);
    } finally {
      setFsLoading(false);
    }
  }

  // Combine all signals
  const allSignals: EagleEyeSignal[] = useMemo(() => signals, [signals]);

  // Selected signal for detail panel
  const selectedSignal = useMemo(
    () => allSignals.find(s => s.id === selectedSignalId) ?? null,
    [allSignals, selectedSignalId],
  );

  // Filtered signals by tab + state
  const filteredSignals = useMemo(() => {
    let filtered = allSignals;
    if (mainTab === "ma") filtered = filtered.filter(s => s.category === "ma");
    if (mainTab === "cre") filtered = filtered.filter(s => s.category === "cre");
    if (activeState) filtered = filtered.filter(s => s.state === activeState);
    return filtered.sort((a, b) => b.score - a.score);
  }, [allSignals, mainTab, activeState]);

  // Pipeline value
  const totalPipeline = useMemo(
    () => allSignals
      .filter(s => s.status === "hot" || s.status === "warm")
      .reduce((sum, s) => sum + (s.category === "ma" ? (s as MASignal).revenueUsd : (s as CRESignal).amountUsd), 0),
    [allSignals],
  );

  const hotCount = allSignals.filter(s => s.status === "hot").length;
  const maCount = allSignals.filter(s => s.category === "ma").length;
  const creCount = allSignals.filter(s => s.category === "cre").length;

  // Handlers
  function handleGeneratePitch() {
    setIsGeneratingPitch(true);
    setTimeout(() => setIsGeneratingPitch(false), 3000);
  }

  // ── Summary Mode ───────────────────────────────────────────────
  if (summaryMode) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-2 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-cyan-200">
          <Eye size={14} /> EagleEye Scout
        </div>
        <div className="mt-3 grid grid-cols-4 gap-3">
          <div>
            <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-slate-500">M&A Signals</p>
            <p className="font-mono text-xl font-semibold text-cyan-200">{maCount}</p>
          </div>
          <div>
            <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-slate-500">CRE Signals</p>
            <p className="font-mono text-xl font-semibold text-emerald-200">{creCount}</p>
          </div>
          <div>
            <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-slate-500">Hot Leads</p>
            <p className="font-mono text-xl font-semibold text-red-200">{hotCount}</p>
          </div>
          <div>
            <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-slate-500">Pipeline</p>
            <p className="font-mono text-xl font-semibold text-amber-100">{formatMoney(totalPipeline)}</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Full Dashboard ─────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-cyan-200">
            <Eye size={17} /> EagleEye — Deal Intelligence Radar
          </div>
          <p className="mt-1 text-sm text-slate-400">
            M&A intelligence, CRE development signals, Bullseye offensive pitches, Boxing Out contact cadence.
          </p>
        </div>
        <div className="text-right">
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-6 gap-3">
        {[
          { label: "Total Signals", value: `${allSignals.length}`, tone: "text-white" },
          { label: "M&A Targets", value: `${maCount}`, tone: "text-cyan-200" },
          { label: "CRE Deals", value: `${creCount}`, tone: "text-emerald-200" },
          { label: "Hot Leads", value: `${hotCount}`, tone: "text-red-200" },
          { label: "Pipeline", value: formatMoney(totalPipeline), tone: "text-amber-100" },
          { label: "Bullseye Pitches", value: `${DEMO_BULLSEYE_PITCHES.length}`, tone: "text-amber-200" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
            <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-slate-500">{s.label}</p>
            <p className={`font-mono text-lg font-semibold ${s.tone}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Find Similar Deals */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 space-y-3">
        <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-amber-200">Find Similar Deals</p>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="font-mono text-[0.56rem] uppercase tracking-[0.12em] text-slate-500">Borrower</label>
            <input
              value={fsBorrower}
              onChange={e => setFsBorrower(e.target.value)}
              placeholder="e.g. Jacaranda Trace"
              className="rounded-lg border border-white/10 bg-black/35 px-3 py-1.5 font-mono text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-white/25"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-mono text-[0.56rem] uppercase tracking-[0.12em] text-slate-500">State</label>
            <input
              value={fsState}
              onChange={e => setFsState(e.target.value.toUpperCase().slice(0, 2))}
              placeholder="FL"
              className="w-16 rounded-lg border border-white/10 bg-black/35 px-3 py-1.5 font-mono text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-white/25"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-mono text-[0.56rem] uppercase tracking-[0.12em] text-slate-500">Sector</label>
            <select
              value={fsSector}
              onChange={e => setFsSector(e.target.value)}
              className="rounded-lg border border-white/10 bg-black/35 px-3 py-1.5 font-mono text-xs text-white focus:outline-none focus:border-white/25"
            >
              <option value="senior_living">Senior Living</option>
              <option value="healthcare">Healthcare</option>
              <option value="multifamily">Multifamily</option>
              <option value="industrial">Industrial</option>
              <option value="data_centers">Data Centers</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-mono text-[0.56rem] uppercase tracking-[0.12em] text-slate-500">Amount ($M)</label>
            <input
              type="number"
              value={fsAmount}
              onChange={e => setFsAmount(e.target.value)}
              placeholder="172.5"
              className="w-24 rounded-lg border border-white/10 bg-black/35 px-3 py-1.5 font-mono text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-white/25"
            />
          </div>
          <Button
            onClick={handleFindSimilar}
            disabled={fsLoading || !fsBorrower || !fsState || !fsAmount}
            className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 font-mono text-[0.68rem] font-semibold uppercase text-amber-200 hover:bg-amber-400/20 disabled:opacity-40"
          >
            {fsLoading ? <Loader2 size={13} className="animate-spin mr-1 inline" /> : null}
            Find Similar Deals
          </Button>
        </div>
        {fsResults.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-slate-500">{fsResults.length} comparable{fsResults.length !== 1 ? "s" : ""}</p>
            {(fsResults as Array<Record<string, unknown>>).map((comp, i) => (
              <article key={i} className="rounded-xl border border-white/10 bg-black/35 p-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-mono text-sm font-semibold text-white">{String(comp.entity ?? comp.name ?? comp.borrower ?? "—")}</p>
                    <p className="mt-0.5 text-[0.7rem] text-slate-400 line-clamp-2">{String(comp.description ?? comp.deal_thesis ?? "")}</p>
                    <div className="mt-1 flex items-center gap-3 font-mono text-[0.58rem] text-slate-500">
                      {comp.state ? <span><MapPin size={10} className="inline" /> {String(comp.state)}</span> : null}
                      {comp.sector ? <span>{String(comp.sector)}</span> : null}
                      {comp.naics ? <span>NAICS {String(comp.naics)}</span> : null}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    {comp.par_amount != null && (
                      <p className="font-mono text-base font-semibold text-amber-100">{formatMoney(Number(comp.par_amount))}</p>
                    )}
                    {comp.similarity_score != null && (
                      <p className="font-mono text-[0.62rem] text-slate-400">Match: {String(comp.similarity_score)}%</p>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Main Tabs */}
      <Tabs value={mainTab} onValueChange={(v) => { setMainTab(v); setActiveState(null); }}>
        <TabsList className="w-fit rounded-xl border border-white/10 bg-black/45">
          <TabsTrigger value="ma" className="font-mono text-[0.68rem] uppercase">
            <Briefcase size={13} className="mr-1" /> M&A Intelligence
          </TabsTrigger>
          <TabsTrigger value="cre" className="font-mono text-[0.68rem] uppercase">
            <Building2 size={13} className="mr-1" /> CRE / Development
          </TabsTrigger>
          <TabsTrigger value="bullseye" className="font-mono text-[0.68rem] uppercase">
            <Crosshair size={13} className="mr-1" /> Bullseye
          </TabsTrigger>
          <TabsTrigger value="boxingout" className="font-mono text-[0.68rem] uppercase">
            <Target size={13} className="mr-1" /> Boxing Out
          </TabsTrigger>
          <TabsTrigger value="ipo" className="font-mono text-[0.68rem] uppercase">
            <Search size={13} className="mr-1" /> IPO Readiness
          </TabsTrigger>
        </TabsList>

        {/* ── M&A TAB ─────────────────────────────────────────── */}
        <TabsContent value="ma" className="mt-4 space-y-4">
          {/* Heat Map */}
          <div className="rounded-2xl border border-white/10 overflow-hidden">
            <EagleEyeHeatMap
              signals={allSignals}
              activeState={activeState}
              onSignalClick={(id) => setSelectedSignalId(id)}
              onStateFilter={setActiveState}
              category="ma"
            />
          </div>

          {/* State filter indicator */}
          {activeState && (
            <div className="flex items-center gap-2">
              <span className="font-mono text-[0.62rem] text-slate-400">
                Filtered: <span className="text-cyan-200">{activeState}</span>
              </span>
              <Button
                onClick={() => setActiveState(null)}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 font-mono text-[0.56rem] text-slate-400 hover:bg-white/[0.06]"
              >
                Clear
              </Button>
            </div>
          )}

          {/* Signal Feed */}
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-cyan-200">
              M&A Signals — ${30}M-$150M Rev, Sub-$20M EBITDA
            </h3>
            <span className="font-mono text-[0.62rem] text-slate-500">
              {filteredSignals.length} signals
            </span>
          </div>
          <div className="space-y-3">
            {signalsLoading ? (
              <p className="font-mono text-[0.68rem] text-slate-500 flex items-center gap-2">
                <Loader2 size={13} className="animate-spin" /> Loading signals...
              </p>
            ) : filteredSignals.map(signal => (
              <SignalCard
                key={signal.id}
                signal={signal}
                onClick={() => setSelectedSignalId(signal.id)}
              />
            ))}
          </div>
        </TabsContent>

        {/* ── CRE TAB ─────────────────────────────────────────── */}
        <TabsContent value="cre" className="mt-4 space-y-4">
          {/* Heat Map */}
          <div className="rounded-2xl border border-white/10 overflow-hidden">
            <EagleEyeHeatMap
              signals={allSignals}
              activeState={activeState}
              onSignalClick={(id) => setSelectedSignalId(id)}
              onStateFilter={setActiveState}
              category="cre"
            />
          </div>

          {activeState && (
            <div className="flex items-center gap-2">
              <span className="font-mono text-[0.62rem] text-slate-400">
                Filtered: <span className="text-emerald-200">{activeState}</span>
              </span>
              <Button
                onClick={() => setActiveState(null)}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 font-mono text-[0.56rem] text-slate-400 hover:bg-white/[0.06]"
              >
                Clear
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <h3 className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-emerald-200">
              CRE / Development — Dark Zone, Maturing Loans, Permits, Distress
            </h3>
            <span className="font-mono text-[0.62rem] text-slate-500">
              {filteredSignals.length} signals
            </span>
          </div>
          <div className="space-y-3">
            {signalsLoading ? (
              <p className="font-mono text-[0.68rem] text-slate-500 flex items-center gap-2">
                <Loader2 size={13} className="animate-spin" /> Loading signals...
              </p>
            ) : filteredSignals.map(signal => (
              <SignalCard
                key={signal.id}
                signal={signal}
                onClick={() => setSelectedSignalId(signal.id)}
              />
            ))}
          </div>
        </TabsContent>

        {/* ── BULLSEYE TAB ────────────────────────────────────── */}
        <TabsContent value="bullseye" className="mt-4">
          <BullseyePitchEngine
            pitches={DEMO_BULLSEYE_PITCHES}
            onDeployOutreach={(id) => console.log("Deploy outreach:", id)}
            onApprovePitch={(id) => console.log("Approve pitch:", id)}
            onGeneratePitch={handleGeneratePitch}
            isGenerating={isGeneratingPitch}
          />
        </TabsContent>

        {/* ── BOXING OUT TAB ──────────────────────────────────── */}
        <TabsContent value="boxingout" className="mt-4">
          <BoxingOutTracker
            prospects={DEMO_BOXINGOUT_PROSPECTS}
            contentQueue={DEMO_CONTENT_QUEUE}
            onLogCall={(id) => console.log("Log call:", id)}
            onSendNext={(id) => console.log("Send next:", id)}
            onApproveContent={(id) => console.log("Approve content:", id)}
            onSendContent={(id) => console.log("Send content:", id)}
          />
        </TabsContent>

        {/* ── IPO READINESS TAB ──────────────────────────────── */}
        <TabsContent value="ipo" className="mt-4">
          <IPOReadinessDashboard />
        </TabsContent>
      </Tabs>

      {/* Signal Detail Panel (slide-out) */}
      <EagleEyeSignalDetail
        signal={selectedSignal}
        open={!!selectedSignal}
        onClose={() => setSelectedSignalId(null)}
        onDeployOutreach={(id) => { console.log("Deploy outreach:", id); setSelectedSignalId(null); }}
        onGenerateBullseye={(id) => { console.log("Generate bullseye:", id); setMainTab("bullseye"); setSelectedSignalId(null); }}
        onSendToRoots={(id) => { console.log("Send to roots:", id); setSelectedSignalId(null); }}
      />
    </div>
  );
}
