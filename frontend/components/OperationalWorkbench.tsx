"use client";
import { useState, useEffect, useCallback } from "react";
import {
  AlertCircle, BarChart2, Bot, ChevronRight, FileCheck2,
  FilePlus2, FileText, Layers, Loader2, RefreshCw,
  Shield, Upload, Users, Zap, CheckCircle2, Clock, XCircle,
} from "lucide-react";
import api from "@/lib/api";

// ── Pipeline stage definitions ───────────────────────────────
const STAGES = [
  { id: "intake",    label: "INTAKE",     icon: FileText,    apiKey: "deals"           },
  { id: "docs",      label: "DOCS",       icon: Upload,      apiKey: "checklist"       },
  { id: "underwrite",label: "UNDERWRITE", icon: BarChart2,   apiKey: "intel"           },
  { id: "credit",    label: "CREDIT",     icon: Zap,         apiKey: "bondTools"       },
  { id: "memo",      label: "MEMO",       icon: FileCheck2,  apiKey: "memo"            },
  { id: "structure", label: "STRUCTURE",  icon: Layers,      apiKey: "bondStructuring" },
  { id: "surety",    label: "SURETY",     icon: Shield,      apiKey: "insurance"       },
  { id: "placement", label: "PLACEMENT",  icon: Users,       apiKey: "hawkeye"         },
] as const;

type StageId = typeof STAGES[number]["id"];

// ── Types ─────────────────────────────────────────────────────
interface Deal {
  id: string;
  name: string;
  status: string;
  readiness_score?: number;
  project?: { total_project_cost_usd?: number; asset_type?: string; state?: string };
}

interface StageResult {
  loading: boolean;
  data: Record<string, unknown> | null;
  error: string | null;
  ran: boolean;
}

// ── Helpers ──────────────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://web-production-5e8af.up.railway.app";

async function rawFetch<T = unknown>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    credentials: "include",
    ...options,
  });
  const json = await res.json() as { success: boolean; data: T; error?: string };
  if (!json.success) throw new Error(json.error || `${res.status}`);
  return json.data;
}

function fmt(v: unknown): string {
  if (v == null) return "—";
  if (typeof v === "number") return Number.isInteger(v) ? v.toLocaleString() : v.toFixed(2);
  return String(v);
}

function fmtUsd(v: unknown): string {
  const n = Number(v);
  if (!n) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function StatusDot({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "#C4A048", intake: "#7A9A82", pipeline: "#C4A048",
    closing: "#E8C87A", closed: "#2D6B3D", dead: "#1E4A2E",
  };
  return (
    <span className="inline-block w-2 h-2 rounded-full flex-shrink-0"
      style={{ background: map[status?.toLowerCase()] ?? "#7A9A82" }} />
  );
}

function ReadinessRing({ score }: { score: number }) {
  const r = 18, c = 2 * Math.PI * r;
  const fill = (score / 100) * c;
  const color = score >= 75 ? "#C4A048" : score >= 50 ? "#E8C87A" : "#2D6B3D";
  return (
    <svg width={44} height={44} viewBox="0 0 44 44">
      <circle cx={22} cy={22} r={r} fill="none" stroke="#1E4A2E" strokeWidth={4} />
      <circle cx={22} cy={22} r={r} fill="none" stroke={color} strokeWidth={4}
        strokeDasharray={`${fill} ${c}`} strokeLinecap="round"
        transform="rotate(-90 22 22)" />
      <text x={22} y={27} textAnchor="middle" fontSize={11} fontFamily="IBM Plex Mono"
        fontWeight={700} fill={color}>{score}</text>
    </svg>
  );
}

function StatusBadge({ s }: { s: string }) {
  const colors: Record<string, string> = {
    active: "bg-[#C4A048]/15 text-[#C4A048] border-[#C4A048]/30",
    pipeline: "bg-[#C4A048]/15 text-[#C4A048] border-[#C4A048]/30",
    intake: "bg-[#7A9A82]/15 text-[#7A9A82] border-[#7A9A82]/30",
    closing: "bg-[#E8C87A]/15 text-[#E8C87A] border-[#E8C87A]/30",
    closed: "bg-[#2D6B3D]/20 text-[#7A9A82] border-[#2D6B3D]/40",
  };
  return (
    <span className={`font-mono text-[9px] tracking-widest uppercase px-2 py-0.5 rounded border ${colors[s?.toLowerCase()] ?? colors.intake}`}>
      {s ?? "unknown"}
    </span>
  );
}

// ── Stage result panel ────────────────────────────────────────
function StageResultPanel({ stageId, result, deal, onRun }: {
  stageId: StageId;
  result: StageResult;
  deal: Deal;
  onRun: (id: StageId) => void;
}) {
  const actionLabels: Record<StageId, string> = {
    intake:     "LOAD DEAL",
    docs:       "CHECK DOCUMENTS",
    underwrite: "RUN UNDERWRITE",
    credit:     "SCORE CREDIT",
    memo:       "GENERATE MEMO",
    structure:  "BUILD STRUCTURE",
    surety:     "ANALYZE SURETY",
    placement:  "MATCH INVESTORS",
  };

  const descriptions: Record<StageId, string> = {
    intake:     "Load deal record from database — name, status, project details, sponsor, readiness score.",
    docs:       "Pull document checklist — which financials are uploaded, what's missing, auto-advance gate.",
    underwrite: "RMA spread + NOI waterfall — occupancy, revenue, expenses, net operating income.",
    credit:     "DSCR / LTV / ICR ratios against JPMorgan A-grade benchmarks. Auto-grade.",
    memo:       "Generate executive credit memo via Morgan agent. Jacaranda PLOM as structural template.",
    structure:  "Design Series A + B bond stack — sizing, coupon, IO period, call/put schedule.",
    surety:     "Surety / LC analysis — Hylant carrier match, AUM-phase logic, coverage recommendation.",
    placement:  "Hawkeye investor match — book build, IOI collection, allocation schedule.",
  };

  return (
    <div className="flex flex-col h-full">
      {/* Description */}
      <p className="font-mono text-[10px] text-[#7A9A82] mb-4 leading-relaxed tracking-wide">
        {descriptions[stageId]}
      </p>

      {/* Action button */}
      <button
        onClick={() => onRun(stageId)}
        disabled={result.loading}
        className="flex items-center gap-2 px-4 py-2.5 bg-[#C4A048]/10 border border-[#C4A048]/40
          text-[#C4A048] font-mono text-[11px] tracking-widest uppercase hover:bg-[#C4A048]/20
          transition-colors disabled:opacity-40 disabled:cursor-not-allowed w-fit rounded"
      >
        {result.loading
          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
          : <Zap className="w-3.5 h-3.5" />}
        {result.loading ? "RUNNING…" : actionLabels[stageId]}
      </button>

      {/* Error */}
      {result.error && (
        <div className="mt-4 flex items-start gap-2 text-red-400 bg-red-900/10 border border-red-900/30 rounded p-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="font-mono text-[11px]">{result.error}</span>
        </div>
      )}

      {/* Data output */}
      {result.data && !result.loading && (
        <div className="mt-4 flex-1 overflow-y-auto">
          <DataTable data={result.data} stageId={stageId} />
        </div>
      )}

      {!result.ran && !result.loading && (
        <div className="mt-6 border border-dashed border-[#1E4A2E] rounded p-6 text-center">
          <p className="font-mono text-[10px] text-[#2D6B3D] tracking-widest uppercase">
            Press the action button to run this stage
          </p>
        </div>
      )}
    </div>
  );
}

// ── Data table — renders API output as financial rows ─────────
function DataTable({ data, stageId }: { data: Record<string, unknown>; stageId: StageId }) {
  const flatRows: [string, unknown][] = [];

  function flatten(obj: unknown, prefix = "") {
    if (obj == null || typeof obj !== "object") return;
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      const key = prefix ? `${prefix}.${k}` : k;
      if (typeof v === "object" && v !== null && !Array.isArray(v)) {
        flatten(v, key);
      } else if (!Array.isArray(v) || typeof v[0] !== "object") {
        flatRows.push([key, v]);
      }
    }
  }

  flatten(data);

  // Key metrics to surface prominently (stage-specific)
  const highlight: Record<StageId, string[]> = {
    intake:     ["name", "status", "readiness_score", "bond_face", "deal_type"],
    docs:       ["completeness_pct", "stage", "status", "missing_count"],
    underwrite: ["noi", "revenue", "occupancy_pct", "dscr", "ltv"],
    credit:     ["overall_grade", "dscr", "ltv", "icr", "cf_leverage"],
    memo:       ["type", "word_count"],
    structure:  ["series_a_face", "series_b_face", "blended_rate", "io_months"],
    surety:     ["recommendation", "phase", "coverage_pct", "carrier"],
    placement:  ["matched_count", "book_coverage_pct", "top_investor"],
  };

  const hi = new Set(highlight[stageId] ?? []);
  const hiRows = flatRows.filter(([k]) => hi.has(k.split(".").pop()!));
  const otherRows = flatRows.filter(([k]) => !hi.has(k.split(".").pop()!)).slice(0, 30);

  return (
    <div className="space-y-3">
      {hiRows.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {hiRows.map(([k, v]) => (
            <div key={k} className="bg-[#0D2218] border border-[#C4A048]/15 rounded p-2.5">
              <div className="font-mono text-[8px] text-[#7A9A82] tracking-widest uppercase mb-1">
                {k.split(".").pop()!.replace(/_/g, " ")}
              </div>
              <div className="font-mono text-[13px] text-[#C4A048] font-semibold">
                {typeof v === "number" && k.includes("usd") ? fmtUsd(v) : fmt(v)}
              </div>
            </div>
          ))}
        </div>
      )}

      {otherRows.length > 0 && (
        <table className="nest-table w-full">
          <thead>
            <tr><th className="text-left">FIELD</th><th>VALUE</th></tr>
          </thead>
          <tbody>
            {otherRows.map(([k, v]) => (
              <tr key={k}>
                <td className="text-left font-mono text-[10px]">{k.replace(/_/g, " ")}</td>
                <td className="font-mono text-[10px] text-right">
                  {typeof v === "boolean" ? (v ? "YES" : "NO") : fmt(v)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Raw memo content */}
      {stageId === "memo" && typeof (data as Record<string, unknown>).content === "string" && (
        <div className="bg-[#050F09] border border-[#C4A048]/10 rounded p-4 mt-2">
          <p className="font-mono text-[9px] text-[#7A9A82] tracking-widest uppercase mb-2">MEMO CONTENT</p>
          <pre className="font-mono text-[10px] text-[#EDE8DC] whitespace-pre-wrap leading-relaxed">
            {String((data as Record<string, unknown>).content).slice(0, 2000)}
          </pre>
        </div>
      )}
    </div>
  );
}

// ── Bernard strip ─────────────────────────────────────────────
function BernardStrip({ message, loading }: { message: string | null; loading: boolean }) {
  return (
    <div className="border-t border-[#1E4A2E] bg-black px-5 py-3 flex items-start gap-3 flex-shrink-0">
      <div className="w-7 h-7 rounded-full bg-[#0D2218] border border-[#C4A048]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Bot className="w-3.5 h-3.5 text-[#C4A048]" />
      </div>
      <div className="flex-1">
        <div className="font-mono text-[8px] text-[#C4A048] tracking-widest uppercase mb-1">BERNARD</div>
        {loading
          ? <div className="flex items-center gap-2 text-[#7A9A82]">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span className="font-mono text-[10px]">Analyzing…</span>
            </div>
          : <p className="font-mono text-[10px] text-[#EDE8DC] leading-relaxed">
              {message ?? "Select a deal and run a pipeline stage. I will narrate every result."}
            </p>}
      </div>
    </div>
  );
}

// ── Create deal modal ─────────────────────────────────────────
function CreateDealForm({ onCreated, onCancel }: { onCreated: (d: Deal) => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("cre_bond");
  const [size, setSize] = useState("");
  const [state, setState] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    if (!name.trim()) { setErr("Deal name required"); return; }
    setLoading(true); setErr(null);
    try {
      const d = await rawFetch<Deal>("/api/deals", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          project: { asset_type: type, total_project_cost_usd: Number(size) || 0, state },
          status: "intake",
        }),
      });
      onCreated(d);
    } catch (e) {
      setErr(String(e));
    } finally {
      setLoading(false);
    }
  }

  const inp = "w-full bg-[#0D2218] border border-[#1E4A2E] rounded px-3 py-2 font-mono text-[11px] text-[#EDE8DC] focus:border-[#C4A048]/50 focus:outline-none";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#030A06] border border-[#1E4A2E] rounded w-full max-w-sm mx-4">
        <div className="px-5 py-4 border-b border-[#1E4A2E]">
          <p className="nest-label">NEW DEAL</p>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div>
            <label className="nest-label block mb-1.5">DEAL NAME</label>
            <input className={inp} value={name} onChange={e => setName(e.target.value)} placeholder="Jacaranda Trace Series 2025" />
          </div>
          <div>
            <label className="nest-label block mb-1.5">TYPE</label>
            <select className={inp} value={type} onChange={e => setType(e.target.value)}>
              <option value="cre_bond">CRE Bond</option>
              <option value="construction">Construction</option>
              <option value="bridge">Bridge</option>
              <option value="ma">M&A</option>
            </select>
          </div>
          <div>
            <label className="nest-label block mb-1.5">DEAL SIZE (USD)</label>
            <input className={inp} value={size} onChange={e => setSize(e.target.value)} placeholder="205000000" type="number" />
          </div>
          <div>
            <label className="nest-label block mb-1.5">STATE</label>
            <input className={inp} value={state} onChange={e => setState(e.target.value)} placeholder="FL" maxLength={2} />
          </div>
          {err && <p className="font-mono text-[10px] text-red-400">{err}</p>}
        </div>
        <div className="px-5 py-4 border-t border-[#1E4A2E] flex gap-2">
          <button onClick={submit} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#C4A048]/10 border border-[#C4A048]/40 text-[#C4A048] font-mono text-[10px] tracking-widest uppercase hover:bg-[#C4A048]/20 transition-colors rounded disabled:opacity-40">
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <FilePlus2 className="w-3 h-3" />}
            CREATE
          </button>
          <button onClick={onCancel}
            className="px-4 py-2.5 border border-[#1E4A2E] text-[#7A9A82] font-mono text-[10px] tracking-widest uppercase hover:text-[#EDE8DC] transition-colors rounded">
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main workbench ────────────────────────────────────────────
export default function OperationalWorkbench() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [activeStage, setActiveStage] = useState<StageId>("intake");
  const [stageResults, setStageResults] = useState<Record<string, StageResult>>({});
  const [dealsLoading, setDealsLoading] = useState(true);
  const [dealsError, setDealsError] = useState<string | null>(null);
  const [bernardMsg, setBernardMsg] = useState<string | null>(null);
  const [bernardLoading, setBernardLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const freshResult = (): StageResult => ({ loading: false, data: null, error: null, ran: false });

  const loadDeals = useCallback(async () => {
    setDealsLoading(true); setDealsError(null);
    try {
      const data = await rawFetch<{ deals?: Deal[] } | Deal[]>("/api/deals");
      const list: Deal[] = Array.isArray(data) ? data : (data as { deals?: Deal[] }).deals ?? [];
      setDeals(list);
    } catch (e) {
      setDealsError(String(e));
    } finally {
      setDealsLoading(false);
    }
  }, []);

  useEffect(() => { loadDeals(); }, [loadDeals]);

  async function selectDeal(deal: Deal) {
    setSelectedDeal(deal);
    setActiveStage("intake");
    setStageResults({});
    // Auto-run intake stage
    runStage("intake", deal);
  }

  async function runStage(stageId: StageId, dealOverride?: Deal) {
    const deal = dealOverride ?? selectedDeal;
    if (!deal) return;

    setStageResults(prev => ({
      ...prev,
      [stageId]: { loading: true, data: null, error: null, ran: true },
    }));
    setBernardLoading(true);

    let result: Record<string, unknown> | null = null;
    let errMsg: string | null = null;

    try {
      switch (stageId) {
        case "intake": {
          const d = await rawFetch<Record<string, unknown>>(`/api/deals/${deal.id}`);
          result = d;
          break;
        }
        case "docs": {
          const d = await rawFetch<Record<string, unknown>>(`/api/deals/${deal.id}/checklist`);
          result = d;
          break;
        }
        case "underwrite": {
          const d = await rawFetch<Record<string, unknown>>("/api/intel/underwrite", {
            method: "POST",
            body: JSON.stringify({ deal_id: deal.id, deal }),
          });
          result = d;
          break;
        }
        case "credit": {
          const d = await rawFetch<Record<string, unknown>>("/api/bond-tools/credit", {
            method: "POST",
            body: JSON.stringify({ deal_id: deal.id, ...deal }),
          });
          result = d;
          break;
        }
        case "memo": {
          const d = await rawFetch<Record<string, unknown>>(`/api/deals/${deal.id}/memo`, {
            method: "POST",
            body: JSON.stringify({ memo_type: "executive_summary" }),
          });
          result = d;
          break;
        }
        case "structure": {
          const d = await rawFetch<Record<string, unknown>>("/api/bond-structuring/structure", {
            method: "POST",
            body: JSON.stringify({
              deal: { id: deal.id, ...deal },
              tranches: [
                { type: "series_a", ltc_pct: 75 },
                { type: "series_b", ltc_pct: 7 },
              ],
            }),
          });
          result = d;
          break;
        }
        case "surety": {
          const d = await rawFetch<Record<string, unknown>>("/api/insurance/analyze", {
            method: "POST",
            body: JSON.stringify({ deal_id: deal.id }),
          });
          result = d;
          break;
        }
        case "placement": {
          const d = await rawFetch<Record<string, unknown>>("/api/hawkeye/match", {
            method: "POST",
            body: JSON.stringify({ deal_id: deal.id, deal }),
          });
          result = d;
          break;
        }
      }
    } catch (e) {
      errMsg = String(e);
    }

    setStageResults(prev => ({
      ...prev,
      [stageId]: { loading: false, data: result, error: errMsg, ran: true },
    }));

    // Bernard narration
    try {
      const event = errMsg
        ? `Stage ${stageId} failed: ${errMsg}`
        : `Stage ${stageId} completed for deal "${deal.name}". Data: ${JSON.stringify(result).slice(0, 300)}`;
      const narration = await rawFetch<{ narration?: string; message?: string }>("/api/desks/bernard/narrate", {
        method: "POST",
        body: JSON.stringify({ event, deal_context: deal }),
      });
      setBernardMsg((narration as { narration?: string; message?: string }).narration
        ?? (narration as { narration?: string; message?: string }).message
        ?? "Stage complete.");
    } catch {
      setBernardMsg(errMsg ? `Stage ${stageId} failed. ${errMsg}` : `${stageId.toUpperCase()} stage complete.`);
    } finally {
      setBernardLoading(false);
    }
  }

  const currentResult = stageResults[activeStage] ?? freshResult();

  return (
    <div className="flex h-screen bg-black text-[#EDE8DC] overflow-hidden">

      {/* ── Deal list panel ─────────────────────────────────── */}
      <aside className="w-72 flex-shrink-0 border-r border-[#1E4A2E] bg-black flex flex-col">
        <div className="px-4 py-3 border-b border-[#1E4A2E] flex items-center justify-between">
          <span className="nest-label">DEAL PIPELINE</span>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1 px-2 py-1 bg-[#C4A048]/10 border border-[#C4A048]/30 rounded text-[#C4A048] font-mono text-[9px] tracking-widest uppercase hover:bg-[#C4A048]/20 transition-colors"
          >
            <FilePlus2 className="w-2.5 h-2.5" /> NEW
          </button>
        </div>

        {/* Refresh */}
        <div className="px-4 py-2 border-b border-[#1E4A2E]/50">
          <button onClick={loadDeals}
            className="flex items-center gap-1.5 text-[#7A9A82] hover:text-[#C4A048] transition-colors font-mono text-[9px] tracking-widest uppercase">
            <RefreshCw className={`w-2.5 h-2.5 ${dealsLoading ? "animate-spin" : ""}`} />
            {dealsLoading ? "LOADING…" : "REFRESH"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-1">
          {dealsError && (
            <div className="mx-3 mt-3 flex items-start gap-2 text-red-400 bg-red-900/10 border border-red-900/20 rounded p-2.5">
              <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
              <span className="font-mono text-[9px] leading-relaxed">{dealsError}</span>
            </div>
          )}

          {!dealsLoading && !dealsError && deals.length === 0 && (
            <p className="font-mono text-[9px] text-[#2D6B3D] tracking-widest uppercase px-4 py-4">
              No deals. Create one above.
            </p>
          )}

          {deals.map(deal => (
            <button key={deal.id} onClick={() => selectDeal(deal)}
              className={`w-full text-left px-4 py-3 border-b border-[#1E4A2E]/40 hover:bg-[#0D2218] transition-colors
                ${selectedDeal?.id === deal.id ? "bg-[#0D2218] border-l-2 border-l-[#C4A048]" : ""}`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-display text-[12px] text-[#EDE8DC] truncate">{deal.name}</span>
                <StatusDot status={deal.status} />
              </div>
              <div className="flex items-center justify-between">
                <StatusBadge s={deal.status} />
                {deal.readiness_score != null && (
                  <span className="font-mono text-[9px] text-[#7A9A82]">
                    {deal.readiness_score}% ready
                  </span>
                )}
              </div>
              {deal.project?.total_project_cost_usd ? (
                <div className="font-mono text-[9px] text-[#C4A048] mt-1">
                  {fmtUsd(deal.project.total_project_cost_usd)}
                  {deal.project.asset_type ? ` · ${deal.project.asset_type}` : ""}
                  {deal.project.state ? ` · ${deal.project.state}` : ""}
                </div>
              ) : null}
            </button>
          ))}
        </div>
      </aside>

      {/* ── Main workbench ────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {!selectedDeal ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <ChevronRight className="w-8 h-8 text-[#1E4A2E] mx-auto mb-3" />
              <p className="nest-label">SELECT A DEAL TO BEGIN</p>
              <p className="font-mono text-[10px] text-[#2D6B3D] mt-2">
                {deals.length > 0 ? `${deals.length} deals in pipeline` : "Create your first deal"}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Deal header */}
            <div className="px-6 py-4 border-b border-[#1E4A2E] bg-black flex items-center gap-4 flex-shrink-0">
              <ReadinessRing score={selectedDeal.readiness_score ?? 0} />
              <div className="flex-1 min-w-0">
                <h1 className="font-display text-xl text-[#EDE8DC] truncate">{selectedDeal.name}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <StatusBadge s={selectedDeal.status} />
                  {selectedDeal.project?.total_project_cost_usd ? (
                    <span className="font-mono text-[10px] text-[#7A9A82]">
                      {fmtUsd(selectedDeal.project.total_project_cost_usd)}
                    </span>
                  ) : null}
                  {selectedDeal.project?.asset_type ? (
                    <span className="font-mono text-[9px] text-[#2D6B3D] uppercase tracking-wider">
                      {selectedDeal.project.asset_type}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Pipeline stepper */}
            <div className="border-b border-[#1E4A2E] bg-black flex-shrink-0 overflow-x-auto">
              <div className="flex min-w-max">
                {STAGES.map((stage, i) => {
                  const res = stageResults[stage.id];
                  const isActive = activeStage === stage.id;
                  const isDone = res?.ran && !res.loading && !res.error && res.data;
                  const isFailed = res?.ran && !res.loading && res.error;
                  const Icon = stage.icon;
                  return (
                    <button key={stage.id} onClick={() => setActiveStage(stage.id)}
                      className={`flex flex-col items-center gap-1 px-4 py-3 border-b-2 transition-colors min-w-[80px]
                        ${isActive
                          ? "border-[#C4A048] text-[#C4A048]"
                          : isDone ? "border-[#2D6B3D] text-[#7A9A82] hover:text-[#C4A048]"
                          : isFailed ? "border-red-900 text-red-400"
                          : "border-transparent text-[#2D6B3D] hover:text-[#7A9A82]"}`}
                    >
                      <div className="relative">
                        <Icon className="w-4 h-4" />
                        {isDone && <CheckCircle2 className="w-2.5 h-2.5 text-[#C4A048] absolute -top-1 -right-1" />}
                        {isFailed && <XCircle className="w-2.5 h-2.5 text-red-400 absolute -top-1 -right-1" />}
                        {res?.loading && <Loader2 className="w-2.5 h-2.5 text-[#E8C87A] absolute -top-1 -right-1 animate-spin" />}
                      </div>
                      <span className="font-mono text-[8px] tracking-widest">{stage.label}</span>
                      {i < STAGES.length - 1 && (
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[#1E4A2E] text-xs pointer-events-none hidden" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stage content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="flex items-center gap-3 mb-4">
                <span className="nest-label">
                  {STAGES.find(s => s.id === activeStage)?.label} STAGE
                </span>
                {currentResult.ran && !currentResult.loading && !currentResult.error && (
                  <span className="flex items-center gap-1 font-mono text-[8px] text-[#C4A048] tracking-widest">
                    <CheckCircle2 className="w-2.5 h-2.5" /> COMPLETE
                  </span>
                )}
                {currentResult.ran && !currentResult.loading && currentResult.error && (
                  <span className="flex items-center gap-1 font-mono text-[8px] text-red-400 tracking-widest">
                    <XCircle className="w-2.5 h-2.5" /> ERROR
                  </span>
                )}
              </div>
              <StageResultPanel
                stageId={activeStage}
                result={currentResult}
                deal={selectedDeal}
                onRun={runStage}
              />
            </div>
          </>
        )}

        {/* Bernard strip — always pinned to bottom */}
        <BernardStrip message={bernardMsg} loading={bernardLoading} />
      </main>

      {showCreate && (
        <CreateDealForm
          onCreated={deal => { setShowCreate(false); setDeals(prev => [deal, ...prev]); selectDeal(deal); }}
          onCancel={() => setShowCreate(false)}
        />
      )}
    </div>
  );
}
