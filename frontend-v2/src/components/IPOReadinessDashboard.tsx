import { useState } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface GateResult {
  score: number;
  benchmark: string;
  current: string;
  gap: string;
}

interface IPOResult {
  overall_score: number;
  verdict: string;
  timeline: string;
  gates: Record<string, GateResult>;
  passing_gates: number;
  total_gates: number;
  critical_gaps: string[];
}

const VERDICT_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  IPO_READY: { bg: "bg-emerald-500/20 border-emerald-500/40", text: "text-emerald-400", label: "IPO Ready" },
  IPO_TRACK: { bg: "bg-cyan-500/20 border-cyan-500/40", text: "text-cyan-400", label: "On Track" },
  IPO_DEVELOPMENT: { bg: "bg-amber-500/20 border-amber-500/40", text: "text-amber-400", label: "Development Phase" },
  NOT_READY: { bg: "bg-rose-500/20 border-rose-500/40", text: "text-rose-400", label: "Not Ready" },
};

const GATE_LABELS: Record<string, string> = {
  revenue_scale: "Revenue Scale",
  revenue_growth: "Revenue Growth",
  profitability: "Profitability",
  audit_readiness: "Audit Readiness",
  governance: "Corporate Governance",
  market_position: "Market Position",
  legal_ip: "Legal & IP",
  investor_story: "Investor Story",
};

function getBarColor(score: number): string {
  if (score >= 70) return "#34d399";
  if (score >= 40) return "#fbbf24";
  return "#f87171";
}

export default function IPOReadinessDashboard() {
  const ipoMutation = trpc.eagleeye.ipoReadiness.useMutation();
  const [result, setResult] = useState<IPOResult | null>(null);

  const [form, setForm] = useState({
    company_name: "",
    revenue_usd: "",
    ebitda_usd: "",
    ebitda_margin_pct: "",
    revenue_growth_pct: "",
    has_big4_auditor: false,
    years_audited: "",
    independent_board_members: "",
    has_experienced_cfo: false,
    total_addressable_market_usd: "",
    market_share_pct: "",
    clean_cap_table: false,
    ip_protected: false,
    no_material_litigation: true,
    has_ir_capability: false,
    public_comparable_count: "",
  });

  const handleRun = () => {
    ipoMutation.mutate({
      revenue_usd: parseFloat(form.revenue_usd) || 0,
      ebitda_usd: parseFloat(form.ebitda_usd) || 0,
      ebitda_margin_pct: parseFloat(form.ebitda_margin_pct) || 0,
      revenue_growth_pct: parseFloat(form.revenue_growth_pct) || 0,
      has_big4_auditor: form.has_big4_auditor,
      years_audited: parseInt(form.years_audited) || 0,
      independent_board_members: parseInt(form.independent_board_members) || 0,
      has_experienced_cfo: form.has_experienced_cfo,
      total_addressable_market_usd: parseFloat(form.total_addressable_market_usd) || 0,
      market_share_pct: parseFloat(form.market_share_pct) || 0,
      clean_cap_table: form.clean_cap_table,
      ip_protected: form.ip_protected,
      no_material_litigation: form.no_material_litigation,
      has_ir_capability: form.has_ir_capability,
      public_comparable_count: parseInt(form.public_comparable_count) || 0,
    }, {
      onSuccess: (data: any) => setResult(data),
    });
  };

  // Demo prefill
  const handleDemoFill = () => {
    setForm({
      company_name: "Meridian Health Services",
      revenue_usd: "145000000",
      ebitda_usd: "21750000",
      ebitda_margin_pct: "15",
      revenue_growth_pct: "18",
      has_big4_auditor: true,
      years_audited: "2",
      independent_board_members: "2",
      has_experienced_cfo: true,
      total_addressable_market_usd: "8000000000",
      market_share_pct: "1.8",
      clean_cap_table: true,
      ip_protected: true,
      no_material_litigation: true,
      has_ir_capability: false,
      public_comparable_count: "4",
    });
  };

  const chartData = result
    ? Object.entries(result.gates).map(([key, gate]) => ({
        name: GATE_LABELS[key] ?? key,
        score: gate.score,
        key,
      }))
    : [];

  const v = result ? VERDICT_COLORS[result.verdict] ?? VERDICT_COLORS.NOT_READY : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-violet-200">
            IPO Readiness Assessment
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            Evaluate target company readiness for public markets across 8 institutional gateways
          </p>
        </div>
        <button
          onClick={handleDemoFill}
          className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[0.6rem] text-slate-400 hover:bg-white/[0.06] transition-all"
        >
          Load Demo
        </button>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Input Form */}
        <div className="col-span-4 space-y-3">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-2.5">
            <h4 className="font-mono text-[0.6rem] uppercase tracking-wider text-slate-500 mb-2">Financial Profile</h4>
            <FormInput label="Company" value={form.company_name} onChange={(v) => setForm({...form, company_name: v})} placeholder="Company name" />
            <FormInput label="Revenue ($)" value={form.revenue_usd} onChange={(v) => setForm({...form, revenue_usd: v})} type="number" placeholder="145000000" />
            <FormInput label="EBITDA ($)" value={form.ebitda_usd} onChange={(v) => setForm({...form, ebitda_usd: v})} type="number" placeholder="21750000" />
            <FormInput label="EBITDA Margin (%)" value={form.ebitda_margin_pct} onChange={(v) => setForm({...form, ebitda_margin_pct: v})} type="number" placeholder="15" />
            <FormInput label="Revenue Growth YoY (%)" value={form.revenue_growth_pct} onChange={(v) => setForm({...form, revenue_growth_pct: v})} type="number" placeholder="18" />
            <FormInput label="TAM ($)" value={form.total_addressable_market_usd} onChange={(v) => setForm({...form, total_addressable_market_usd: v})} type="number" placeholder="8000000000" />
            <FormInput label="Market Share (%)" value={form.market_share_pct} onChange={(v) => setForm({...form, market_share_pct: v})} type="number" placeholder="1.8" />
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-2.5">
            <h4 className="font-mono text-[0.6rem] uppercase tracking-wider text-slate-500 mb-2">Institutional Readiness</h4>
            <FormInput label="Years Audited" value={form.years_audited} onChange={(v) => setForm({...form, years_audited: v})} type="number" placeholder="3" />
            <FormInput label="Independent Directors" value={form.independent_board_members} onChange={(v) => setForm({...form, independent_board_members: v})} type="number" placeholder="3" />
            <FormInput label="Public Comps" value={form.public_comparable_count} onChange={(v) => setForm({...form, public_comparable_count: v})} type="number" placeholder="4" />
            <Toggle label="Big 4 Auditor" checked={form.has_big4_auditor} onChange={(v) => setForm({...form, has_big4_auditor: v})} />
            <Toggle label="Experienced CFO" checked={form.has_experienced_cfo} onChange={(v) => setForm({...form, has_experienced_cfo: v})} />
            <Toggle label="Clean Cap Table" checked={form.clean_cap_table} onChange={(v) => setForm({...form, clean_cap_table: v})} />
            <Toggle label="IP Protected" checked={form.ip_protected} onChange={(v) => setForm({...form, ip_protected: v})} />
            <Toggle label="No Material Litigation" checked={form.no_material_litigation} onChange={(v) => setForm({...form, no_material_litigation: v})} />
            <Toggle label="IR Capability" checked={form.has_ir_capability} onChange={(v) => setForm({...form, has_ir_capability: v})} />
          </div>

          <button
            onClick={handleRun}
            disabled={ipoMutation.isPending}
            className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-purple-400 px-4 py-2.5 font-[Space_Grotesk] text-sm font-semibold text-white transition-all hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] disabled:opacity-50"
          >
            {ipoMutation.isPending ? "Assessing..." : "Run IPO Readiness Assessment"}
          </button>
        </div>

        {/* Results */}
        <div className="col-span-8 space-y-4">
          {result ? (
            <>
              {/* Verdict Header */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl border p-5 ${v?.bg}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`font-[Cormorant_Garamond] text-2xl font-bold ${v?.text}`}>
                      {v?.label}
                    </div>
                    <p className="mt-1 font-[Space_Grotesk] text-sm text-slate-300">{result.timeline}</p>
                  </div>
                  <div className="text-right">
                    <div className={`font-mono text-4xl font-bold ${v?.text}`}>
                      {result.overall_score}
                    </div>
                    <div className="font-mono text-[0.6rem] text-slate-500">
                      {result.passing_gates}/{result.total_gates} gates passing
                    </div>
                  </div>
                </div>
                {result.critical_gaps.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="font-mono text-[0.55rem] text-rose-400">Critical gaps:</span>
                    {result.critical_gaps.map((gap) => (
                      <span key={gap} className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 font-mono text-[0.5rem] text-rose-300">
                        {GATE_LABELS[gap] ?? gap}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Gateway Chart */}
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                <h4 className="mb-3 font-mono text-[0.6rem] uppercase tracking-wider text-slate-500">
                  Gateway Scores
                </h4>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData} layout="vertical" margin={{ left: 120, right: 20, top: 5, bottom: 5 }}>
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} width={110} />
                    <Tooltip
                      contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                      formatter={(value: number) => [`${value}/100`, "Score"]}
                    />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20}>
                      {chartData.map((entry, i) => (
                        <Cell key={i} fill={getBarColor(entry.score)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Gate Details */}
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(result.gates).map(([key, gate]) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`rounded-xl border p-3 ${
                      gate.score >= 70 ? "border-emerald-500/20 bg-emerald-500/[0.04]" :
                      gate.score >= 40 ? "border-amber-500/20 bg-amber-500/[0.04]" :
                      "border-rose-500/20 bg-rose-500/[0.04]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-[Space_Grotesk] text-[0.75rem] font-medium text-slate-200">
                        {GATE_LABELS[key] ?? key}
                      </span>
                      <span className={`font-mono text-sm font-bold ${
                        gate.score >= 70 ? "text-emerald-400" :
                        gate.score >= 40 ? "text-amber-400" : "text-rose-400"
                      }`}>
                        {gate.score}/100
                      </span>
                    </div>
                    <div className="mt-1.5 space-y-1 font-mono text-[0.55rem]">
                      <div><span className="text-slate-600">Benchmark:</span> <span className="text-slate-400">{gate.benchmark}</span></div>
                      <div><span className="text-slate-600">Current:</span> <span className="text-[#C4A048]">{gate.current}</span></div>
                      <div><span className="text-slate-600">Gap:</span> <span className={gate.score >= 70 ? "text-emerald-400" : "text-amber-400"}>{gate.gap}</span></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-white/[0.06]">
              <div className="text-center">
                <div className="mb-2 text-3xl opacity-20">📊</div>
                <p className="font-mono text-sm text-slate-600">
                  Enter company details and run assessment
                </p>
                <p className="mt-1 font-mono text-[0.6rem] text-slate-700">
                  or click "Load Demo" to see a sample evaluation
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FormInput({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="mb-0.5 block font-mono text-[0.55rem] uppercase tracking-wider text-slate-600">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-xs text-slate-200 placeholder:text-slate-700 focus:border-violet-500/40 focus:outline-none"
      />
    </div>
  );
}

function Toggle({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-3 py-1.5"
    >
      <span className="font-mono text-[0.6rem] text-slate-400">{label}</span>
      <div className={`h-4 w-8 rounded-full transition-all ${checked ? "bg-violet-500" : "bg-slate-700"}`}>
        <div className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : "translate-x-0"}`} />
      </div>
    </button>
  );
}
