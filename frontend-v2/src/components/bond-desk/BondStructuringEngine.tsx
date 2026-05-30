import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useDealState, type Tranche, type Deal } from "@/contexts/DealStateContext";
import { useBernard } from "@/contexts/BernardContext";
import { trpc } from "@/lib/trpc";
import BernardNarrator from "./BernardNarrator";

const SERIES_COLORS: Record<string, string> = {
  A: "#C4A048",
  B: "#22d3ee",
  C: "#f59e0b",
  SUB: "#ef4444",
};

const GRADE_COLORS: Record<string, string> = {
  A: "text-emerald-400",
  "BBB+": "text-emerald-300",
  BBB: "text-cyan-400",
  "BBB-": "text-cyan-300",
  "BB+": "text-amber-400",
  BB: "text-amber-300",
  "Sub-IG": "text-rose-400",
};

export default function BondStructuringEngine() {
  const { state, setDeal, addTranche, removeTranche, setMetrics, log } = useDealState();
  const bernard = useBernard();
  const structureMutation = trpc.bondStructuring.structure.useMutation();

  const [dealForm, setDealForm] = useState({
    name: "", sponsor: "", total_project_cost_usd: "",
    stabilized_noi_usd: "", use_of_proceeds: "", sector: "office",
  });

  const [trancheForm, setTrancheForm] = useState({
    series: "A" as Tranche["series"],
    label: "Series A Senior",
    size_usd: "",
    coupon_pct: "7.0",
    spread_bps: "85",
    maturity_yrs: "10",
    ltc_pct: "75",
  });
  const [showTrancheForm, setShowTrancheForm] = useState(false);
  const [activeStress, setActiveStress] = useState<string>("base");

  // Call/Put optionality state
  const [showCallFields, setShowCallFields] = useState(false);
  const [showPutFields, setShowPutFields] = useState(false);
  const [callDate, setCallDate] = useState("");
  const [callPrice, setCallPrice] = useState("100");
  const [callType, setCallType] = useState<"par" | "make-whole" | "declining_premium">("par");
  const [putDate, setPutDate] = useState("");
  const [putTrigger, setPutTrigger] = useState<"rate_increase" | "covenant_breach" | "credit_downgrade">("rate_increase");
  const [callPutResult, setCallPutResult] = useState<{
    recommendation: string;
    rate_change_bps: number;
    estimated_client_saving_usd: number;
    net_client_benefit_usd: number;
    arrangement_fee_usd: number;
  } | null>(null);

  const callPutMutation = trpc.bondStructuring.callPutAnalysis.useMutation();

  const handleSetDeal = () => {
    const tpc = parseFloat(dealForm.total_project_cost_usd) || 0;
    const noi = parseFloat(dealForm.stabilized_noi_usd) || 0;
    if (tpc <= 0) return;
    const deal: Deal = {
      id: crypto.randomUUID(),
      name: dealForm.name || "New Deal",
      sponsor: dealForm.sponsor || "TBD",
      total_project_cost_usd: tpc,
      stabilized_noi_usd: noi,
      appraised_value_usd: tpc * 1.2,
      use_of_proceeds: dealForm.use_of_proceeds || "Construction",
      sector: dealForm.sector,
      phase: "structuring",
    };
    setDeal(deal);
    log("NEST", "deal_created", `${deal.name} — $${(tpc/1e6).toFixed(1)}M`);
    bernard.push({
      type: "deal_created",
      depths: {
        expert: `Deal set: $${(tpc/1e6).toFixed(0)}M TPC, $${(noi/1e6).toFixed(1)}M NOI.`,
        standard: `New deal "${deal.name}" initialized. $${(tpc/1e6).toFixed(0)}M project with $${(noi/1e6).toFixed(1)}M stabilized NOI. Add tranches to begin structuring.`,
        educational: `You've created a deal for "${deal.name}" with $${(tpc/1e6).toFixed(0)}M total project cost and $${(noi/1e6).toFixed(1)}M in stabilized NOI. NOI is the property's net operating income — the annual profit before debt service. This number determines how much debt the project can support. Now add tranches to build your capital stack.`,
      },
    });
  };

  const handleAddTranche = () => {
    const size = parseFloat(trancheForm.size_usd) || 0;
    if (size <= 0) return;
    const tranche: Tranche = {
      id: crypto.randomUUID(),
      series: trancheForm.series,
      label: trancheForm.label,
      size_usd: size,
      coupon_pct: parseFloat(trancheForm.coupon_pct) || 7.0,
      spread_bps: parseFloat(trancheForm.spread_bps) || 85,
      maturity_yrs: parseFloat(trancheForm.maturity_yrs) || 10,
      ltc_pct: parseFloat(trancheForm.ltc_pct) || 75,
      ...(showCallFields && callDate ? {
        call_schedule: [{ date: callDate, price: parseFloat(callPrice) || 100, type: callType }],
      } : {}),
      ...(showPutFields && putDate ? {
        put_schedule: [{ date: putDate, trigger: putTrigger }],
      } : {}),
    };
    addTranche(tranche);
    log("NEST", "tranche_added", `${tranche.label} — $${(size/1e6).toFixed(1)}M at ${tranche.coupon_pct}%`);
    setShowTrancheForm(false);
    setShowCallFields(false);
    setShowPutFields(false);
    setCallDate("");
    setCallPrice("100");
    setCallType("par");
    setPutDate("");
    setPutTrigger("rate_increase");
    setTrancheForm({ series: "B", label: "Series B Mezzanine", size_usd: "", coupon_pct: "11.0", spread_bps: "145", maturity_yrs: "7", ltc_pct: "7" });
  };

  // Recompute structure whenever tranches change
  useEffect(() => {
    if (!state.activeDeal || state.tranches.length === 0) return;
    structureMutation.mutate({
      deal: {
        total_project_cost_usd: state.activeDeal.total_project_cost_usd,
        stabilized_noi_usd: state.activeDeal.stabilized_noi_usd,
        appraised_value_usd: state.activeDeal.appraised_value_usd,
      },
      tranches: state.tranches.map((t) => ({
        series: t.series,
        size_usd: t.size_usd,
        coupon_pct: t.coupon_pct,
        spread_bps: t.spread_bps,
      })),
    }, {
      onSuccess: (data: any) => {
        setMetrics(data.metrics, data.stress);
        if (data.bernard) {
          bernard.push({
            type: "structure_updated",
            depths: data.bernard,
            data: data.metrics,
          });
        }
      },
    });
  }, [state.tranches]);

  const m = state.metrics;
  const totalStackHeight = state.tranches.reduce((s, t) => s + t.size_usd, 0);

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* LEFT: Deal Input + Tranche Builder (4 cols) */}
      <div className="col-span-4 space-y-4">
        {!state.activeDeal ? (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
            <h3 className="mb-3 font-[Cormorant_Garamond] text-lg font-semibold text-slate-200">
              Deal Setup
            </h3>
            <div className="space-y-2.5">
              <Input label="Project Name" value={dealForm.name} onChange={(v) => setDealForm({...dealForm, name: v})} placeholder="Jacaranda Trace" />
              <Input label="Sponsor" value={dealForm.sponsor} onChange={(v) => setDealForm({...dealForm, sponsor: v})} placeholder="Soparrow Capital" />
              <Input label="Total Project Cost ($)" value={dealForm.total_project_cost_usd} onChange={(v) => setDealForm({...dealForm, total_project_cost_usd: v})} placeholder="200000000" type="number" />
              <Input label="Stabilized NOI ($)" value={dealForm.stabilized_noi_usd} onChange={(v) => setDealForm({...dealForm, stabilized_noi_usd: v})} placeholder="16000000" type="number" />
              <Input label="Use of Proceeds" value={dealForm.use_of_proceeds} onChange={(v) => setDealForm({...dealForm, use_of_proceeds: v})} placeholder="Ground-up construction" />
              <select
                value={dealForm.sector}
                onChange={(e) => setDealForm({...dealForm, sector: e.target.value})}
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 font-mono text-xs text-slate-200"
              >
                <option value="office">Office</option>
                <option value="multifamily">Multifamily</option>
                <option value="industrial">Industrial</option>
                <option value="retail">Retail</option>
                <option value="healthcare">Healthcare</option>
                <option value="hospitality">Hospitality</option>
                <option value="mixed_use">Mixed Use</option>
              </select>
              <button
                onClick={handleSetDeal}
                className="w-full rounded-xl bg-gradient-to-r from-[#C4A048] to-[#E8C87A] px-4 py-2.5 font-[Space_Grotesk] text-sm font-semibold text-[#030A06] transition-all hover:shadow-[0_0_20px_rgba(196,160,72,0.3)]"
              >
                Initialize Deal
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-[Cormorant_Garamond] text-lg font-semibold text-slate-200">
                {state.activeDeal.name}
              </h3>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 font-mono text-[0.55rem] text-emerald-400">
                STRUCTURING
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono text-[0.65rem]">
              <div className="text-slate-500">TPC</div>
              <div className="text-right text-[#C4A048]">${(state.activeDeal.total_project_cost_usd/1e6).toFixed(0)}M</div>
              <div className="text-slate-500">NOI</div>
              <div className="text-right text-[#C4A048]">${(state.activeDeal.stabilized_noi_usd/1e6).toFixed(1)}M</div>
              <div className="text-slate-500">Sector</div>
              <div className="text-right text-slate-300 capitalize">{state.activeDeal.sector}</div>
            </div>
          </div>
        )}

        {/* Tranche List */}
        {state.activeDeal && (
          <div className="space-y-2">
            {state.tranches.map((t) => (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="group rounded-xl border border-white/[0.08] bg-white/[0.02] p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-6 w-6 rounded-md flex items-center justify-center font-mono text-[0.6rem] font-bold text-[#030A06]"
                      style={{ backgroundColor: SERIES_COLORS[t.series] ?? "#666" }}
                    >
                      {t.series}
                    </div>
                    <span className="font-[Space_Grotesk] text-sm text-slate-200">{t.label}</span>
                  </div>
                  <button
                    onClick={() => {
                      removeTranche(t.id);
                      log("NEST", "tranche_removed", t.label);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-400 transition-all text-xs"
                  >
                    x
                  </button>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 font-mono text-[0.6rem]">
                  <div><span className="text-slate-600">Size</span><br/><span className="text-[#C4A048]">${(t.size_usd/1e6).toFixed(0)}M</span></div>
                  <div><span className="text-slate-600">Coupon</span><br/><span className="text-slate-200">{t.coupon_pct}%</span></div>
                  <div><span className="text-slate-600">Spread</span><br/><span className="text-slate-200">{t.spread_bps}bp</span></div>
                </div>
                {((t as any).call_schedule?.length > 0 || (t as any).put_schedule?.length > 0) && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(t as any).call_schedule?.map((c: any, i: number) => (
                      <span key={`call-${i}`} className="rounded bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[0.5rem] text-emerald-400">
                        CALL: {c.type} @ {c.date?.slice(0, 7)}
                      </span>
                    ))}
                    {(t as any).put_schedule?.map((p: any, i: number) => (
                      <span key={`put-${i}`} className="rounded bg-cyan-500/15 px-1.5 py-0.5 font-mono text-[0.5rem] text-cyan-400">
                        PUT: {p.trigger} @ {p.date?.slice(0, 7)}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}

            {!showTrancheForm ? (
              <button
                onClick={() => setShowTrancheForm(true)}
                className="w-full rounded-xl border border-dashed border-white/10 py-3 font-mono text-xs text-slate-500 hover:border-[#C4A048]/30 hover:text-[#C4A048] transition-all"
              >
                + Add Tranche
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="rounded-xl border border-[#C4A048]/20 bg-[#C4A048]/[0.04] p-3 space-y-2"
              >
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={trancheForm.series}
                    onChange={(e) => {
                      const s = e.target.value as Tranche["series"];
                      const labels: Record<string, string> = { A: "Series A Senior", B: "Series B Mezzanine", C: "Series C Junior", SUB: "Subordinate/Equity" };
                      const coupons: Record<string, string> = { A: "7.0", B: "11.0", C: "14.0", SUB: "18.0" };
                      const spreads: Record<string, string> = { A: "85", B: "145", C: "225", SUB: "400" };
                      setTrancheForm({...trancheForm, series: s, label: labels[s] ?? s, coupon_pct: coupons[s] ?? "7.0", spread_bps: spreads[s] ?? "85"});
                    }}
                    className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 font-mono text-xs text-slate-200"
                  >
                    <option value="A">Series A</option>
                    <option value="B">Series B</option>
                    <option value="C">Series C</option>
                    <option value="SUB">Subordinate</option>
                  </select>
                  <Input label="" value={trancheForm.size_usd} onChange={(v) => setTrancheForm({...trancheForm, size_usd: v})} placeholder="Size ($)" type="number" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Input label="Coupon %" value={trancheForm.coupon_pct} onChange={(v) => setTrancheForm({...trancheForm, coupon_pct: v})} type="number" />
                  <Input label="Spread bp" value={trancheForm.spread_bps} onChange={(v) => setTrancheForm({...trancheForm, spread_bps: v})} type="number" />
                  <Input label="Maturity yr" value={trancheForm.maturity_yrs} onChange={(v) => setTrancheForm({...trancheForm, maturity_yrs: v})} type="number" />
                </div>
                {/* Call Schedule */}
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setShowCallFields(!showCallFields)}
                    className={`w-full rounded-lg border px-3 py-1.5 font-mono text-[0.6rem] transition-all ${
                      showCallFields
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : "border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-400"
                    }`}
                  >
                    {showCallFields ? "- Remove Call Option" : "+ Add Call Option"}
                  </button>
                  {showCallFields && (
                    <div className="grid grid-cols-3 gap-2">
                      <Input label="Call Date" value={callDate} onChange={setCallDate} placeholder="2028-06-01" />
                      <Input label="Call Price" value={callPrice} onChange={setCallPrice} placeholder="100" type="number" />
                      <div>
                        <label className="mb-0.5 block font-mono text-[0.55rem] uppercase tracking-wider text-slate-600">Call Type</label>
                        <select
                          value={callType}
                          onChange={(e) => setCallType(e.target.value as typeof callType)}
                          className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 font-mono text-xs text-slate-200"
                        >
                          <option value="par">Par</option>
                          <option value="make-whole">Make-Whole</option>
                          <option value="declining_premium">Declining Premium</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Put Schedule */}
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setShowPutFields(!showPutFields)}
                    className={`w-full rounded-lg border px-3 py-1.5 font-mono text-[0.6rem] transition-all ${
                      showPutFields
                        ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                        : "border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-400"
                    }`}
                  >
                    {showPutFields ? "- Remove Put Option" : "+ Add Put Option"}
                  </button>
                  {showPutFields && (
                    <div className="grid grid-cols-2 gap-2">
                      <Input label="Put Date" value={putDate} onChange={setPutDate} placeholder="2029-01-01" />
                      <div>
                        <label className="mb-0.5 block font-mono text-[0.55rem] uppercase tracking-wider text-slate-600">Put Trigger</label>
                        <select
                          value={putTrigger}
                          onChange={(e) => setPutTrigger(e.target.value as typeof putTrigger)}
                          className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 font-mono text-xs text-slate-200"
                        >
                          <option value="rate_increase">Rate Increase</option>
                          <option value="covenant_breach">Covenant Breach</option>
                          <option value="credit_downgrade">Credit Downgrade</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button onClick={handleAddTranche} className="flex-1 rounded-lg bg-[#C4A048] px-3 py-1.5 font-mono text-xs font-semibold text-[#030A06]">Add</button>
                  <button onClick={() => setShowTrancheForm(false)} className="rounded-lg border border-white/10 px-3 py-1.5 font-mono text-xs text-slate-500">Cancel</button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* CENTER: Capital Stack Viz + Metrics (5 cols) */}
      <div className="col-span-5 space-y-4">
        {m ? (
          <>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
              <h3 className="mb-3 font-[Cormorant_Garamond] text-base font-semibold text-slate-200">
                Capital Stack
              </h3>
              <div className="flex h-48 items-end gap-1">
                {state.tranches.map((t) => {
                  const pct = totalStackHeight > 0 ? (t.size_usd / totalStackHeight) * 100 : 0;
                  return (
                    <motion.div
                      key={t.id}
                      layout
                      initial={{ height: 0 }}
                      animate={{ height: `${pct}%` }}
                      transition={{ type: "spring", damping: 20 }}
                      className="group relative flex-1 rounded-t-lg cursor-pointer"
                      style={{ backgroundColor: SERIES_COLORS[t.series] ?? "#666", minHeight: 20 }}
                    >
                      <div className="absolute inset-x-0 bottom-2 text-center font-mono text-[0.55rem] font-bold text-[#030A06]">
                        {t.series}
                      </div>
                      <div className="absolute -top-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10 rounded-lg bg-black/90 px-3 py-2 font-mono text-[0.6rem] text-slate-200 whitespace-nowrap border border-white/10">
                        {t.label}: ${(t.size_usd/1e6).toFixed(0)}M · {t.coupon_pct}% · {t.spread_bps}bp
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <MetricCard label="Total Debt" value={`$${(m.total_debt_usd/1e6).toFixed(0)}M`} />
              <MetricCard label="CLTV" value={`${m.cltv_pct.toFixed(1)}%`} alert={m.ltv_alert} />
              <MetricCard label="Blended Coupon" value={`${m.blended_coupon_pct.toFixed(2)}%`} />
              <MetricCard label="DSCR" value={`${m.dscr.toFixed(2)}x`} grade={m.dscr >= 2.0 ? "A" : m.dscr >= 1.5 ? "BBB" : "Sub-IG"} />
              <MetricCard label="ICR" value={`${m.icr.toFixed(2)}x`} />
              <MetricCard label="Grade" value={m.obligor_grade} className={GRADE_COLORS[m.obligor_grade] ?? "text-slate-300"} />
            </div>

            {state.stress && (
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                <h4 className="mb-2 font-mono text-[0.6rem] uppercase tracking-wider text-slate-500">Stress Scenarios</h4>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(state.stress).map(([name, s]: [string, any]) => (
                    <button
                      key={name}
                      onClick={() => setActiveStress(name)}
                      className={`rounded-lg border p-2 text-left transition-all ${
                        activeStress === name
                          ? "border-cyan-500/40 bg-cyan-500/10"
                          : "border-white/5 bg-white/[0.02] hover:border-white/10"
                      }`}
                    >
                      <div className="font-mono text-[0.55rem] text-slate-400 capitalize">{name}</div>
                      <div className={`font-mono text-sm font-semibold ${
                        s.status === "green" ? "text-emerald-400" :
                        s.status === "yellow" ? "text-amber-400" :
                        s.status === "red" ? "text-rose-400" : "text-rose-600"
                      }`}>
                        {s.dscr.toFixed(2)}x
                      </div>
                      <div className="font-mono text-[0.5rem] text-slate-600">{s.outcome}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Call/Put Optionality Analysis */}
            {state.tranches.some((t: any) => t.call_schedule?.length > 0 || t.put_schedule?.length > 0) && (
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="font-mono text-[0.6rem] uppercase tracking-wider text-slate-500">Call/Put Optionality</h4>
                  <button
                    onClick={() => {
                      if (!state.activeDeal) return;
                      const firstCallTranche = state.tranches.find((t: any) => t.call_schedule?.length > 0);
                      callPutMutation.mutate({
                        current_rate_bps: firstCallTranche ? firstCallTranche.spread_bps : state.tranches[0].spread_bps,
                        original_rate_bps: firstCallTranche ? firstCallTranche.spread_bps + 50 : state.tranches[0].spread_bps + 50,
                        deal: { bond_face_usd: state.activeDeal.total_project_cost_usd },
                      }, {
                        onSuccess: (data: any) => setCallPutResult(data),
                      });
                    }}
                    disabled={callPutMutation.isPending}
                    className="rounded-lg bg-[#C4A048]/20 px-3 py-1 font-mono text-[0.6rem] text-[#C4A048] transition-all hover:bg-[#C4A048]/30 disabled:opacity-50"
                  >
                    {callPutMutation.isPending ? "Analyzing..." : "Run Analysis"}
                  </button>
                </div>

                {/* Tranche optionality summary */}
                <div className="mb-3 space-y-1">
                  {state.tranches.filter((t: any) => t.call_schedule?.length > 0 || t.put_schedule?.length > 0).map((t: any) => (
                    <div key={t.id} className="flex items-center gap-2 font-mono text-[0.55rem]">
                      <span className="text-slate-400">{t.label}:</span>
                      {t.call_schedule?.map((c: any, i: number) => (
                        <span key={`c-${i}`} className="text-emerald-400">CALL {c.type} @ {c.date?.slice(0, 7)}</span>
                      ))}
                      {t.put_schedule?.map((p: any, i: number) => (
                        <span key={`p-${i}`} className="text-cyan-400">PUT {p.trigger} @ {p.date?.slice(0, 7)}</span>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Analysis result */}
                {callPutResult && (
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[0.55rem] uppercase text-slate-500">Recommendation</span>
                      <span className={`rounded-full px-2 py-0.5 font-mono text-[0.6rem] font-bold ${
                        callPutResult.recommendation === "EXECUTE_CALL" ? "bg-emerald-500/20 text-emerald-400" :
                        callPutResult.recommendation === "CALL_ELIGIBLE" ? "bg-cyan-500/20 text-cyan-400" :
                        callPutResult.recommendation === "PUT_ALERT" ? "bg-rose-500/20 text-rose-400" :
                        callPutResult.recommendation === "MONITOR" ? "bg-amber-500/20 text-amber-400" :
                        "bg-slate-500/20 text-slate-400"
                      }`}>
                        {callPutResult.recommendation}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 font-mono text-[0.6rem]">
                      <div>
                        <span className="text-slate-600">Rate Change</span>
                        <div className={`text-sm font-semibold ${callPutResult.rate_change_bps < 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {callPutResult.rate_change_bps > 0 ? "+" : ""}{callPutResult.rate_change_bps}bp
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-600">Est. Savings</span>
                        <div className="text-sm font-semibold text-[#C4A048]">
                          ${(callPutResult.estimated_client_saving_usd / 1e3).toFixed(0)}K
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-600">Net Benefit</span>
                        <div className="text-sm font-semibold text-[#C4A048]">
                          ${(callPutResult.net_client_benefit_usd / 1e3).toFixed(0)}K
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-600">Arrangement Fee</span>
                        <div className="text-sm font-semibold text-slate-300">
                          ${(callPutResult.arrangement_fee_usd / 1e3).toFixed(0)}K
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-white/[0.06] bg-white/[0.01]">
            <p className="font-mono text-sm text-slate-600">
              {state.activeDeal ? "Add tranches to see the capital stack" : "Initialize a deal to begin"}
            </p>
          </div>
        )}
      </div>

      {/* RIGHT: Bernard Narrator (3 cols) */}
      <div className="col-span-3">
        <div className="sticky top-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 h-[calc(100vh-8rem)] overflow-hidden">
          <BernardNarrator />
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      {label && <label className="mb-0.5 block font-mono text-[0.55rem] uppercase tracking-wider text-slate-600">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-xs text-slate-200 placeholder:text-slate-700 focus:border-[#C4A048]/40 focus:outline-none"
      />
    </div>
  );
}

function MetricCard({ label, value, grade, alert, className }: {
  label: string; value: string; grade?: string; alert?: boolean; className?: string;
}) {
  return (
    <div className={`rounded-xl border p-3 ${alert ? "border-rose-500/30 bg-rose-500/[0.06]" : "border-white/[0.06] bg-white/[0.02]"}`}>
      <div className="font-mono text-[0.55rem] uppercase tracking-wider text-slate-600">{label}</div>
      <div className={`font-mono text-lg font-semibold ${className ?? "text-[#C4A048]"}`}>
        {value}
      </div>
      {grade && (
        <div className={`font-mono text-[0.5rem] ${GRADE_COLORS[grade] ?? "text-slate-400"}`}>{grade}</div>
      )}
    </div>
  );
}
