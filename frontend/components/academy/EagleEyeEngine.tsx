"use client";

import React, { useState, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, CartesianGrid, Cell, ReferenceLine,
} from "recharts";
import {
  scoreProperty, getMarketHeatData, HBO2_SCAN,
  type PropertyScan, type EagleEyeScore,
} from "@/lib/engines/eagleeye";
import { logLocal } from "@/lib/engines/feedback";
import { Upload, CheckCircle, AlertTriangle, Eye, MapPin } from "lucide-react";

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

  const marketData = getMarketHeatData();

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

  // Chart data
  const heatBarData = marketData.map((m) => ({
    market: m.market.replace(" ", "\n"),
    label: m.market,
    score: m.heatScore,
    deals: m.dealCount,
    trend: m.trend,
  }));

  const scatterData = marketData.map((m) => ({
    x: parseFloat((m.avgCapRate * 100).toFixed(2)),
    y: m.avgDSCR,
    market: m.market,
    deals: m.dealCount,
    heat: m.heatScore,
  }));

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

      {/* Market Heat Map */}
      <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] p-6">
        <h3 className="font-serif text-lg text-[#C4A048] mb-4">Market Heat Map — Top CRE Markets</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={heatBarData} margin={{ top: 10, right: 20, left: 0, bottom: 50 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E4A2E" />
            <XAxis
              dataKey="label"
              tick={{ fill: "#7A9A82", fontSize: 9, fontFamily: "IBM Plex Mono" }}
              angle={-35}
              textAnchor="end"
              interval={0}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "#7A9A82", fontSize: 10, fontFamily: "IBM Plex Mono" }}
            />
            <Tooltip
              {...TOOLTIP_STYLE}
              formatter={(v: number, _: string, props) => [
                `${v} / ${props.payload?.deals ?? 0} deals`,
                "Heat Score",
              ]}
            />
            <ReferenceLine y={75} stroke="#C4A048" strokeDasharray="4 4" label={{ value: "75 — HOT", fill: "#C4A048", fontSize: 9 }} />
            <Bar dataKey="score" radius={[4, 4, 0, 0]}>
              {heatBarData.map((entry, i) => (
                <Cell key={`cell-${i}`} fill={heatColor(entry.score)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cap Rate vs DSCR scatter */}
      <div className="bg-[#0D2218] rounded-2xl border border-[#C4A048]/20 p-6">
        <h3 className="font-serif text-lg text-[#C4A048] mb-4">Cap Rate vs DSCR — Market Positioning</h3>
        <ResponsiveContainer width="100%" height={220}>
          <ScatterChart margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E4A2E" />
            <XAxis
              dataKey="x"
              name="Cap Rate %"
              tick={{ fill: "#7A9A82", fontSize: 10, fontFamily: "IBM Plex Mono" }}
              tickFormatter={(v) => `${v}%`}
              label={{ value: "Cap Rate (%)", position: "insideBottom", fill: "#7A9A82", fontSize: 10, dy: 15 }}
            />
            <YAxis
              dataKey="y"
              name="DSCR"
              tick={{ fill: "#7A9A82", fontSize: 10, fontFamily: "IBM Plex Mono" }}
              domain={[1.4, 2.0]}
              label={{ value: "DSCR", angle: -90, position: "insideLeft", fill: "#7A9A82", fontSize: 10, dx: -5 }}
            />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-[#0D2218] border border-[#C4A048]/30 rounded-lg p-3 font-mono text-xs text-[#EDE8DC]">
                    <div className="text-[#C4A048] mb-1 font-semibold">{d.market}</div>
                    <div>Cap Rate: {d.x}%</div>
                    <div>DSCR: {d.y}</div>
                    <div className="text-[#7A9A82]">{d.deals} live deals</div>
                  </div>
                );
              }}
            />
            <Scatter data={scatterData} fill="#C4A048" opacity={0.85} r={7} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Market table */}
      <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1E4A2E]">
          <h3 className="font-serif text-lg text-[#C4A048]">Market Intelligence Table</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-[#1E4A2E]">
                {["Market", "State", "Deals", "Avg Cap Rate", "Avg DSCR", "Heat Score", "Trend"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[#7A9A82]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {marketData
                .sort((a, b) => b.heatScore - a.heatScore)
                .map((m, i) => (
                  <tr key={i} className="border-b border-[#1E4A2E]/50 hover:bg-[#1E4A2E]/20">
                    <td className="px-4 py-3 text-[#EDE8DC]">{m.market}</td>
                    <td className="px-4 py-3 text-[#7A9A82]">{m.state}</td>
                    <td className="px-4 py-3 text-[#EDE8DC]">{m.dealCount}</td>
                    <td className="px-4 py-3 text-[#C4A048]">{(m.avgCapRate * 100).toFixed(1)}%</td>
                    <td className="px-4 py-3 text-[#C4A048]">{m.avgDSCR.toFixed(2)}×</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-full max-w-[80px] bg-[#1E4A2E] h-1.5 rounded-full">
                          <div
                            className="h-1.5 rounded-full"
                            style={{ width: `${m.heatScore}%`, backgroundColor: heatColor(m.heatScore) }}
                          />
                        </div>
                        <span className="text-[#EDE8DC]">{m.heatScore}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5">
                        <span className={`inline-block w-2 h-2 rounded-full ${trendDot(m.trend)}`} />
                        <span className="text-[#EDE8DC]">{m.trend}</span>
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
