"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, CartesianGrid, Cell, ReferenceLine,
} from "recharts";
import {
  scoreProperty, HBO2_SCAN,
  type PropertyScan, type EagleEyeScore,
} from "@/lib/engines/eagleeye";
import { logLocal } from "@/lib/engines/feedback";
import { Upload, CheckCircle, AlertTriangle, Eye, MapPin, ChevronRight, TrendingUp, X, Zap, RefreshCw } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://nest-platform-production.up.railway.app";

interface StateHeat {
  state: string;
  heat_score: number;
  signal_count: number;
  pipeline_usd: number;
  top_signal: string;
  deal_types: string[];
}

interface TopProperty {
  name: string;
  asset_type: string;
  state: string;
  city: string;
  signal_type: string;
  loan_amount_usd: number;
  maturity_months: number | null;
  estimated_noi_usd: number;
  opportunity_score: number;
  thesis: string;
}

interface SignalItem {
  id: string;
  entity: string;
  amount_usd: number;
  naics: string;
  state: string;
  county: string;
  detail: string;
  score: number;
  status: string;
  discoveredAt: string;
}

function naicsToBondType(naics: string): string {
  if (naics.startsWith("623")) return "Senior Housing Bond";
  if (naics.startsWith("621")) return "Healthcare Revenue Bond";
  if (naics.startsWith("236")) return "Construction Bond";
  if (naics.startsWith("531")) return "Industrial Revenue Bond";
  if (naics.startsWith("721")) return "Hospitality Revenue Bond";
  if (naics.startsWith("522")) return "Financial Revenue Bond";
  return "Revenue Bond";
}

function fmtM(n: number): string {
  if (!n) return "—";
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "#0D2218",
    border: "1px solid rgba(196,160,72,0.3)",
    color: "#EDE8DC",
    fontFamily: "IBM Plex Mono, monospace",
    fontSize: "12px",
  },
};

const distressBadge = (level: string) => {
  if (level === "DEEP_VALUE") return "border-emerald-500 bg-emerald-950 text-emerald-300";
  if (level === "DISTRESSED")  return "border-amber-500  bg-amber-950  text-amber-300";
  if (level === "WATCH")       return "border-blue-500   bg-blue-950   text-blue-300";
  return "border-[#2D6B3D] bg-[#1E4A2E] text-[#7A9A82]";
};

const recBadge = (rec: string) => {
  if (rec === "BUY")   return "bg-emerald-800 text-emerald-200";
  if (rec === "WATCH") return "bg-amber-800   text-amber-200";
  return "bg-red-900 text-red-300";
};

const heatColor = (score: number) =>
  score >= 80 ? "#C4A048" : score >= 65 ? "#7A9A82" : "#2D6B3D";

const trendDot = (trend: string) => {
  if (trend === "HOT")  return "bg-[#C4A048]";
  if (trend === "WARM") return "bg-amber-500";
  return "bg-[#7A9A82]";
};

const PROPERTY_TYPES = ["CCRC", "Senior Housing", "Multifamily", "Mixed Use", "Office", "Industrial"] as const;

export default function EagleEyeEngine() {
  const [scan, setScan]               = useState<PropertyScan>({ ...HBO2_SCAN });
  const [score, setScore]             = useState<EagleEyeScore | null>(null);
  const [isDragging, setIsDragging]   = useState(false);
  const [droppedFile, setDroppedFile] = useState<string | null>(null);
  const [parsing, setParsing]         = useState(false);

  // Live heat map state
  const [heatStates, setHeatStates]           = useState<StateHeat[]>([]);
  const [topProperties, setTopProperties]     = useState<TopProperty[]>([]);
  const [signals, setSignals]                 = useState<SignalItem[]>([]);
  const [heatLoading, setHeatLoading]         = useState(true);
  const [selectedState, setSelectedState]     = useState<string | null>(null);
  const [selectedSignal, setSelectedSignal]   = useState<SignalItem | null>(null);
  const [promoting, setPromoting]             = useState<string | null>(null);
  const [promotedIds, setPromotedIds]         = useState<Set<string>>(new Set());

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/eagleeye/cre-heatmap`).then(r => r.json()).catch(() => ({})),
      fetch(`${API}/api/eagleeye/signals`).then(r => r.json()).catch(() => ({})),
    ]).then(([heat, sig]) => {
      if (heat?.data?.states)          setHeatStates(heat.data.states);
      if (heat?.data?.top_properties)  setTopProperties(heat.data.top_properties);
      if (sig?.data?.signals)          setSignals(sig.data.signals);
    }).finally(() => setHeatLoading(false));
  }, []);

  async function promoteSig(sig: SignalItem) {
    setPromoting(sig.id);
    try {
      const r = await fetch(`${API}/api/eagleeye/promote/${sig.id}`, { method: "POST" });
      const json = await r.json();
      if (json.success) {
        setPromotedIds(prev => new Set([...prev, sig.id]));
        setSignals(prev => prev.map(s => s.id === sig.id ? { ...s, status: "promoted" } : s));
      }
    } finally {
      setPromoting(null);
    }
  }

  const stateSignals = selectedState ? signals.filter(s => s.state === selectedState || s.state === "US") : [];
  const topPropsForState = selectedState ? topProperties.filter(p => p.state === selectedState) : topProperties;

  function runScan() {
    const result = scoreProperty(scan);
    setScore(result);
    logLocal({
      engine: "eagleeye",
      dealName: scan.propertyName,
      inputs: scan as unknown as Record<string, unknown>,
      outputs: result as unknown as Record<string, unknown>,
    });
  }

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const simulateParse = useCallback((filename: string) => {
    setDroppedFile(filename);
    setParsing(true);
    setTimeout(() => {
      setParsing(false);
      setScan({ ...HBO2_SCAN });
      setScore(null);
    }, 1400);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) simulateParse(file.name);
  }, [simulateParse]);

  const onFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) simulateParse(file.name);
  }, [simulateParse]);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-serif text-[#EDE8DC] flex items-center gap-3">
            <Eye className="w-8 h-8 text-[#C4A048]" /> Eagle Eye — Property Intelligence
          </h2>
          <p className="text-[#7A9A82] font-mono text-sm mt-1">
            Distressed CRE + CCRC scanner · NEST acquisition engine
          </p>
        </div>
        <button
          onClick={runScan}
          className="bg-[#C4A048] hover:bg-[#E8C87A] text-[#030A06] font-mono font-semibold px-8 py-3 rounded-xl transition-colors"
        >
          Run Scan
        </button>
      </div>

      {/* Drag & Drop upload */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => document.getElementById("ee-file-input")?.click()}
        className={`relative rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all select-none ${
          isDragging
            ? "border-[#C4A048] bg-[#C4A048]/8 scale-[1.01]"
            : "border-[#1E4A2E] hover:border-[#2D6B3D] bg-[#0D2218]"
        }`}
      >
        <input
          id="ee-file-input"
          type="file"
          accept=".csv,.xlsx,.xls,.pdf"
          className="hidden"
          onChange={onFileInput}
        />
        {parsing ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#C4A048] border-t-transparent rounded-full animate-spin" />
            <div className="font-mono text-sm text-[#C4A048]">Parsing {droppedFile}…</div>
            <div className="font-mono text-xs text-[#7A9A82]">Extracting property metrics</div>
          </div>
        ) : droppedFile ? (
          <div className="flex flex-col items-center gap-2">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
            <div className="font-mono text-sm text-emerald-400">{droppedFile} — loaded</div>
            <div className="font-mono text-xs text-[#7A9A82]">Inputs auto-populated · edit below</div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload className="w-10 h-10 text-[#7A9A82]" />
            <div className="font-mono text-sm text-[#EDE8DC]">Drop property sheet here</div>
            <div className="font-mono text-xs text-[#7A9A82]">CSV · XLSX · PDF — or click to browse</div>
            <div className="mt-1 font-mono text-[10px] text-[#2D6B3D]">Accepts: rent rolls, T12 operating statements, appraisals</div>
          </div>
        )}
      </div>

      {/* Input form */}
      <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] p-6">
        <h3 className="font-serif text-xl text-[#C4A048] mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5" /> Property Inputs
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {([
            ["Property Name",     "propertyName",  "text"],
            ["Address / Market",  "address",       "text"],
            ["Market",            "market",        "text"],
            ["Units",             "units",         "number"],
            ["Asking Price ($)",  "askingPrice",   "number"],
            ["NOI ($)",           "noi",           "number"],
            ["Occupancy (%)",     "occupancy",     "number"],
            ["Year Built",        "yearBuilt",     "number"],
            ["Loan Maturity",     "loanMaturity",  "text"],
          ] as [string, keyof PropertyScan, string][]).map(([label, key, type]) => (
            <div key={key as string}>
              <label className="block text-xs text-[#7A9A82] font-mono mb-1">{label}</label>
              <input
                type={type}
                value={(scan as unknown as Record<string, string | number>)[key as string] ?? ""}
                onChange={(e) =>
                  setScan((prev) => ({
                    ...prev,
                    [key]: type === "number" ? Number(e.target.value) : e.target.value,
                  }))
                }
                className="w-full bg-[#1E4A2E] border border-[#2D6B3D] rounded-lg px-3 py-2 font-mono text-sm text-[#EDE8DC] focus:outline-none focus:border-[#C4A048]"
              />
            </div>
          ))}

          <div>
            <label className="block text-xs text-[#7A9A82] font-mono mb-1">Property Type</label>
            <select
              value={scan.propertyType}
              onChange={(e) =>
                setScan((prev) => ({
                  ...prev,
                  propertyType: e.target.value as PropertyScan["propertyType"],
                }))
              }
              className="w-full bg-[#1E4A2E] border border-[#2D6B3D] rounded-lg px-3 py-2 font-mono text-sm text-[#EDE8DC] focus:outline-none focus:border-[#C4A048]"
            >
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Score results */}
      {score && (
        <div className="space-y-6">

          {/* Hero score */}
          <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] p-6">
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <div className="text-xs text-[#7A9A82] font-mono mb-1">EAGLE EYE SCORE</div>
                <div className="text-7xl font-mono text-[#C4A048] leading-none">{score.overall}</div>
                <div className="text-xs text-[#7A9A82] font-mono mt-1">/ 100</div>
              </div>
              <div className="flex flex-col gap-3">
                <span className={`font-mono text-sm px-4 py-1.5 rounded-full border ${distressBadge(score.distressLevel)}`}>
                  {score.distressLevel.replace("_", " ")}
                </span>
                <span className={`font-mono text-sm px-4 py-1.5 rounded-full text-center ${recBadge(score.recommendation)}`}>
                  {score.recommendation}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 ml-auto">
                {[
                  ["Cap Rate",        `${(score.capRate * 100).toFixed(2)}%`],
                  ["Price / Unit",    `$${Math.round(score.pricePerUnit / 1000)}K`],
                  ["Financial Score", `${score.financialHealth} / 70`],
                  ["Location Score",  `${score.locationScore} / 20`],
                ].map(([label, value]) => (
                  <div key={label as string} className="bg-[#1E4A2E] rounded-xl p-3">
                    <div className="text-xs text-[#7A9A82] font-mono mb-1">{label}</div>
                    <div className="text-lg text-[#C4A048] font-mono">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Intelligence signals */}
          {score.signals.length > 0 && (
            <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-[#C4A048]" />
                <h3 className="font-mono text-sm uppercase tracking-widest text-[#7A9A82]">
                  Intelligence Signals
                </h3>
              </div>
              <div className="space-y-2">
                {score.signals.map((sig, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm font-mono text-[#EDE8DC]">
                    <span className="text-[#C4A048] shrink-0">›</span>
                    {sig}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!score && (
        <div className="flex items-center justify-center h-20 text-[#7A9A82] font-mono text-sm border border-dashed border-[#1E4A2E] rounded-2xl">
          Enter inputs and click Run Scan
        </div>
      )}

      {/* Live Market Heat Map */}
      <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1E4A2E] flex items-center justify-between">
          <h3 className="font-serif text-lg text-[#C4A048] flex items-center gap-2">
            <TrendingUp size={18} /> Deal Opportunities — Live Heat Map
          </h3>
          {heatLoading && <RefreshCw size={14} className="animate-spin text-[#7A9A82]" />}
          {selectedState && (
            <button onClick={() => { setSelectedState(null); setSelectedSignal(null); }}
              className="flex items-center gap-1 font-mono text-xs text-[#7A9A82] hover:text-white">
              <X size={12} /> Clear filter
            </button>
          )}
        </div>

        {heatStates.length === 0 && !heatLoading && (
          <div className="px-6 py-8 text-center font-mono text-xs text-[#7A9A82]">
            No live market data — check backend connection
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-[#1E4A2E]">
                {["State", "Opportunities", "Pipeline", "Top Signal", "Deal Types", "Heat", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[#7A9A82]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {heatStates.map((m, i) => (
                <tr key={i}
                  onClick={() => { setSelectedState(m.state === selectedState ? null : m.state); setSelectedSignal(null); }}
                  className={`border-b border-[#1E4A2E]/50 cursor-pointer transition-colors ${
                    selectedState === m.state ? "bg-[#C4A048]/8 border-l-2 border-l-[#C4A048]" : "hover:bg-[#1E4A2E]/20"
                  }`}>
                  <td className="px-4 py-3 font-bold text-[#EDE8DC]">{m.state}</td>
                  <td className="px-4 py-3 text-[#C4A048] font-bold">{m.signal_count}</td>
                  <td className="px-4 py-3 text-[#EDE8DC]">{fmtM(m.pipeline_usd)}</td>
                  <td className="px-4 py-3 text-[#7A9A82] max-w-[200px] truncate" title={m.top_signal}>{m.top_signal}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(m.deal_types || []).slice(0, 2).map(t => (
                        <span key={t} className="px-1.5 py-0.5 rounded bg-[#1E4A2E] text-[#7A9A82] text-[10px]">{t.replace(/_/g, " ")}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-[#1E4A2E] h-1.5 rounded-full">
                        <div className="h-1.5 rounded-full" style={{ width: `${m.heat_score}%`, backgroundColor: heatColor(m.heat_score) }} />
                      </div>
                      <span className="text-[#EDE8DC]">{m.heat_score}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><ChevronRight size={12} className="text-[#7A9A82]" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deal Opportunities for selected state */}
      {selectedState && (
        <div className="bg-[#0D2218] rounded-2xl border border-[#C4A048]/20 overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1E4A2E]">
            <h3 className="font-serif text-lg text-[#C4A048]">
              {selectedState} — Deal Opportunities ({topPropsForState.length + stateSignals.length})
            </h3>
          </div>

          {/* Top Properties from heat map */}
          {topPropsForState.length > 0 && (
            <div className="px-6 py-4 border-b border-[#1E4A2E]/50">
              <p className="font-mono text-[0.55rem] uppercase tracking-widest text-[#7A9A82] mb-3">AI-Identified Targets</p>
              <div className="space-y-2">
                {topPropsForState.map((p, i) => (
                  <button key={i} onClick={() => setSelectedSignal({
                    id: `prop_${i}`, entity: p.name, amount_usd: p.loan_amount_usd,
                    naics: p.asset_type === "senior_living" ? "6232" : "5311",
                    state: p.state, county: p.city, detail: p.thesis,
                    score: p.opportunity_score, status: "warm", discoveredAt: new Date().toISOString(),
                  })}
                    className="w-full text-left rounded-xl border border-[#1E4A2E] p-3 hover:border-[#C4A048]/40 hover:bg-[#1E4A2E]/30 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm text-[#EDE8DC]">{p.name}</span>
                      <span className="font-mono text-[0.6rem] text-[#C4A048] font-bold">{p.opportunity_score}/100</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 font-mono text-[0.6rem] text-[#7A9A82]">
                      <span>{p.city}, {p.state}</span>
                      <span>{p.asset_type.replace(/_/g, " ")}</span>
                      <span>{fmtM(p.loan_amount_usd)}</span>
                      <span className="text-amber-400">{p.signal_type.replace(/_/g, " ")}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* EDGAR Signals */}
          {stateSignals.length > 0 && (
            <div className="px-6 py-4">
              <p className="font-mono text-[0.55rem] uppercase tracking-widest text-[#7A9A82] mb-3">EDGAR Signals ({stateSignals.length})</p>
              <div className="space-y-2">
                {stateSignals.map((sig) => (
                  <button key={sig.id} onClick={() => setSelectedSignal(sig)}
                    className={`w-full text-left rounded-xl border p-3 transition-all ${
                      selectedSignal?.id === sig.id
                        ? "border-[#C4A048]/60 bg-[#C4A048]/8"
                        : "border-[#1E4A2E] hover:border-[#C4A048]/30 hover:bg-[#1E4A2E]/30"
                    }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm text-[#EDE8DC]">{sig.entity || "Unknown Entity"}</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-[0.5rem] px-1.5 py-0.5 rounded uppercase ${
                          sig.status === "promoted" ? "bg-emerald-900 text-emerald-300" : "bg-amber-900 text-amber-300"
                        }`}>{sig.status}</span>
                        <span className="font-mono text-[0.6rem] text-[#C4A048]">{sig.score}/100</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-1 font-mono text-[0.6rem] text-[#7A9A82]">
                      <span>{naicsToBondType(sig.naics)}</span>
                      {sig.amount_usd > 0 && <span>{fmtM(sig.amount_usd)}</span>}
                      <span>{new Date(sig.discoveredAt).toLocaleDateString()}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {topPropsForState.length === 0 && stateSignals.length === 0 && (
            <div className="px-6 py-8 text-center font-mono text-xs text-[#7A9A82]">
              No signals found for {selectedState} — run EagleEye scanner to discover opportunities
            </div>
          )}
        </div>
      )}

      {/* Deal Detail Panel */}
      {selectedSignal && (
        <div className="bg-[#030A06] rounded-2xl border border-[#C4A048]/40 p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-mono text-[0.55rem] uppercase tracking-widest text-[#7A9A82] mb-1">Deal Overview</p>
              <h3 className="font-serif text-2xl text-[#EDE8DC]">{selectedSignal.entity}</h3>
            </div>
            <button onClick={() => setSelectedSignal(null)} className="text-[#7A9A82] hover:text-white">
              <X size={18} />
            </button>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              ["Bond Type",   naicsToBondType(selectedSignal.naics)],
              ["Deal Size",   fmtM(selectedSignal.amount_usd)],
              ["Market",      `${selectedSignal.county || "—"}, ${selectedSignal.state}`],
              ["Signal Score", `${selectedSignal.score} / 100`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-[#0D2218] border border-[#1E4A2E] p-3">
                <p className="font-mono text-[0.55rem] uppercase tracking-widest text-[#7A9A82] mb-1">{label}</p>
                <p className="font-mono text-sm text-[#C4A048] font-semibold">{value}</p>
              </div>
            ))}
          </div>

          {/* Signals */}
          {selectedSignal.detail && (
            <div className="rounded-xl bg-[#0D2218] border border-[#1E4A2E] p-4">
              <p className="font-mono text-[0.55rem] uppercase tracking-widest text-[#7A9A82] mb-2 flex items-center gap-1.5">
                <AlertTriangle size={10} /> Intelligence Signal
              </p>
              <p className="font-mono text-xs text-[#EDE8DC] leading-relaxed">{selectedSignal.detail}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            {promotedIds.has(selectedSignal.id) || selectedSignal.status === "promoted" ? (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-900/30 border border-emerald-500/30 px-5 py-3 font-mono text-sm text-emerald-300">
                <CheckCircle size={14} /> Promoted to Pipeline
              </div>
            ) : (
              <button
                onClick={() => promoteSig(selectedSignal)}
                disabled={!!promoting}
                className="flex items-center gap-2 rounded-xl bg-[#C4A048] hover:bg-[#E8C87A] text-[#030A06] font-mono font-semibold text-sm px-6 py-3 transition-colors disabled:opacity-50"
              >
                {promoting === selectedSignal.id ? (
                  <><RefreshCw size={14} className="animate-spin" /> Promoting…</>
                ) : (
                  <><Zap size={14} /> Promote to Prospect</>
                )}
              </button>
            )}
            <span className="font-mono text-[0.6rem] text-[#7A9A82]">
              Promoting adds this deal to your NEST pipeline as a sourced prospect
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
