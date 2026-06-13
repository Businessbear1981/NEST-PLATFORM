"use client";

import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
  ScatterChart, Scatter, CartesianGrid, Cell,
} from "recharts";
import { computeSHAP, HBO2_FEATURES, type CreditFeatures } from "@/lib/engines/shap";

const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "#0D2218",
    border: "1px solid rgba(196,160,72,0.3)",
    color: "#EDE8DC",
    fontFamily: "IBM Plex Mono, monospace",
    fontSize: "12px",
  },
};

const FEATURE_NAMES = ["dscr", "ltv", "icr", "cfLeverage", "bsLeverage", "dEbitda", "sponsorNW", "yearsInOperation", "occupancyRate"] as const;

// Generate 20 synthetic scatter data points for dependence plot
function buildDependencePlot(baseFeatures: CreditFeatures, featureKey: keyof CreditFeatures) {
  const base = baseFeatures[featureKey] as number;
  return Array.from({ length: 20 }, (_, i) => {
    const delta = -0.4 + (0.8 * i) / 19;
    const value = base * (1 + delta);
    const modified = { ...baseFeatures, [featureKey]: value };
    const result = computeSHAP(modified);
    const shapVal = (result.shapValues as unknown as Record<string, number>)[featureKey] ?? 0;
    return { featureValue: parseFloat(value.toFixed(3)), shapValue: parseFloat(shapVal.toFixed(4)) };
  });
}

// Color by interaction value magnitude
function cellColor(value: number): string {
  const abs = Math.abs(value);
  const intensity = Math.min(1, abs * 15);
  if (value > 0) {
    const hex = Math.round(intensity * 0x9A).toString(16).padStart(2, "0");
    return `rgba(196,160,72,${intensity * 0.8 + 0.1})`;
  }
  return `rgba(239,68,68,${intensity * 0.8 + 0.1})`;
}

export default function SHAPSuite() {
  const [shapResult, setShapResult] = useState<ReturnType<typeof computeSHAP> | null>(null);
  const [dependenceFeature, setDependenceFeature] = useState<keyof CreditFeatures>("dscr");

  const handleComputeSHAP = () => {
    setShapResult(computeSHAP(HBO2_FEATURES));
  };

  // Force plot data for Recharts horizontal bar
  const forcePlotData = shapResult
    ? [...shapResult.forcePlot].sort((a, b) => Math.abs(b.shapValue) - Math.abs(a.shapValue))
    : [];

  // Interaction matrix (9x9)
  const interactionMatrix: Record<string, Record<string, number>> = {};
  if (shapResult) {
    FEATURE_NAMES.forEach((f1) => {
      interactionMatrix[f1] = {};
      FEATURE_NAMES.forEach((f2) => {
        const found = shapResult.shapInteractions.find(
          (i) => (i.feature1 === f1 && i.feature2 === f2) || (i.feature1 === f2 && i.feature2 === f1)
        );
        interactionMatrix[f1][f2] = found ? found.value : 0;
      });
    });
  }

  // TreeSHAP nodes
  const treeNodes = [
    {
      condition: `DSCR ${HBO2_FEATURES.dscr >= 1.75 ? "≥" : "<"} 1.75`,
      result: HBO2_FEATURES.dscr >= 1.75 ? "+0.15" : "−0.18",
      pass: HBO2_FEATURES.dscr >= 1.75,
    },
    {
      condition: `LTV ${HBO2_FEATURES.ltv <= 62 ? "≤" : ">"} 62%`,
      result: HBO2_FEATURES.ltv <= 62 ? "+0.09" : "−0.12",
      pass: HBO2_FEATURES.ltv <= 62,
    },
    {
      condition: `ICR ${HBO2_FEATURES.icr >= 2.75 ? "≥" : "<"} 2.75`,
      result: HBO2_FEATURES.icr >= 2.75 ? "+0.07" : "−0.08",
      pass: HBO2_FEATURES.icr >= 2.75,
    },
  ];

  // Dependence scatter data
  const dependenceData = shapResult ? buildDependencePlot(HBO2_FEATURES, dependenceFeature) : [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-serif text-[#EDE8DC]">SHAP Explainability Suite — HBO2</h2>
        <button
          onClick={handleComputeSHAP}
          className="bg-[#C4A048] hover:bg-[#E8C87A] text-[#030A06] font-mono font-semibold px-8 py-3 rounded-xl"
        >
          Compute SHAP
        </button>
      </div>

      {shapResult && (
        <>
          {/* Prediction badge */}
          <div className="flex items-center gap-4">
            <div className="text-sm font-mono text-[#7A9A82]">Model Prediction:</div>
            <div className="text-2xl font-mono text-[#C4A048]">{shapResult.prediction?.toFixed(3)}</div>
            {shapResult.prediction > 0.6 ? (
              <span className="bg-[#C4A048] text-[#030A06] font-mono text-sm px-4 py-1 rounded-full">Investment Grade</span>
            ) : (
              <span className="bg-red-800 text-red-200 font-mono text-sm px-4 py-1 rounded-full">Sub-IG</span>
            )}
          </div>

          {/* Force Plot — Recharts horizontal BarChart */}
          <div className="bg-[#0D2218] rounded-2xl border border-[#C4A048]/20 p-6">
            <h3 className="font-serif text-lg text-[#C4A048] mb-2">Force Plot</h3>
            <div className="text-xs font-mono text-[#7A9A82] mb-4">
              Base: {shapResult.baseValue?.toFixed(3)} → Prediction: {shapResult.prediction?.toFixed(3)}
            </div>
            <ResponsiveContainer width="100%" height={forcePlotData.length * 32 + 40}>
              <BarChart layout="vertical" data={forcePlotData} margin={{ left: 100, right: 60, top: 5, bottom: 5 }}>
                <XAxis
                  type="number"
                  domain={[-0.3, 0.3]}
                  tickFormatter={(v: number) => v.toFixed(2)}
                  tick={{ fill: "#7A9A82", fontSize: 10, fontFamily: "IBM Plex Mono" }}
                />
                <YAxis
                  type="category"
                  dataKey="feature"
                  width={95}
                  tick={{ fill: "#EDE8DC", fontSize: 10, fontFamily: "IBM Plex Mono" }}
                />
                <Tooltip
                  {...TOOLTIP_STYLE}
                  formatter={(v: number, _: string, props) => [
                    `${v >= 0 ? "+" : ""}${v.toFixed(3)} (val: ${props.payload?.value ?? ""})`,
                    "SHAP",
                  ]}
                />
                <ReferenceLine x={0} stroke="#7A9A82" />
                <Bar dataKey="shapValue" radius={[0, 2, 2, 0]}>
                  {forcePlotData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.shapValue >= 0 ? "#C4A048" : "#EF4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-6 text-xs font-mono mt-2">
              <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 bg-[#C4A048] rounded-sm" /> Positive impact</span>
              <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 bg-red-600 rounded-sm" /> Negative impact</span>
            </div>
          </div>

          {/* Interaction Heatmap — 9x9 CSS grid */}
          <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] p-6">
            <h3 className="font-serif text-lg text-[#C4A048] mb-4">Interaction Heatmap</h3>
            <div className="overflow-x-auto">
              <div className="inline-block">
                {/* Header row */}
                <div className="flex">
                  <div className="w-28 shrink-0" />
                  {FEATURE_NAMES.map((f) => (
                    <div key={f} className="w-16 text-center text-[9px] font-mono text-[#7A9A82] truncate px-0.5 shrink-0">{f}</div>
                  ))}
                </div>
                {/* Data rows */}
                {FEATURE_NAMES.map((f1) => (
                  <div key={f1} className="flex items-center">
                    <div className="w-28 text-right text-[9px] font-mono text-[#7A9A82] pr-2 shrink-0 truncate">{f1}</div>
                    {FEATURE_NAMES.map((f2) => {
                      const val = interactionMatrix[f1]?.[f2] ?? 0;
                      return (
                        <div
                          key={f2}
                          title={`${f1} × ${f2}: ${val.toFixed(4)}`}
                          className="w-16 h-7 shrink-0 flex items-center justify-center text-[8px] font-mono text-[#EDE8DC] border border-[#030A06]"
                          style={{ backgroundColor: cellColor(val) }}
                        >
                          {val !== 0 ? val.toFixed(3) : ""}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TreeSHAP viz */}
          <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] p-6">
            <h3 className="font-serif text-lg text-[#C4A048] mb-6">TreeSHAP Decision Path</h3>
            <div className="flex flex-col items-center gap-0">
              {treeNodes.map((node, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className={`border-2 rounded-xl px-6 py-3 font-mono text-sm flex items-center gap-4 ${
                    node.pass ? "border-[#C4A048] bg-[#1E4A2E]" : "border-red-500 bg-red-950/30"
                  }`}>
                    <span className="text-[#EDE8DC]">{node.condition}</span>
                    <span className={`font-semibold ${node.pass ? "text-[#C4A048]" : "text-red-400"}`}>
                      {node.pass ? "PASS" : "FAIL"}
                    </span>
                    <span className={`text-sm ${node.pass ? "text-emerald-400" : "text-red-400"}`}>{node.result}</span>
                  </div>
                  {i < treeNodes.length - 1 && (
                    <div className={`w-0.5 h-6 ${node.pass ? "bg-[#C4A048]" : "bg-red-500"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Dependence Plot — ScatterChart */}
          <div className="bg-[#0D2218] rounded-2xl border border-[#C4A048]/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg text-[#C4A048]">Dependence Plot</h3>
              <select
                value={dependenceFeature}
                onChange={(e) => setDependenceFeature(e.target.value as keyof CreditFeatures)}
                className="bg-[#1E4A2E] border border-[#2D6B3D] rounded-lg px-3 py-1.5 font-mono text-sm text-[#EDE8DC] focus:outline-none focus:border-[#C4A048]"
              >
                {FEATURE_NAMES.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E4A2E" />
                <XAxis
                  dataKey="featureValue"
                  name={dependenceFeature}
                  tick={{ fill: "#7A9A82", fontSize: 11, fontFamily: "IBM Plex Mono" }}
                  label={{ value: dependenceFeature, position: "insideBottom", fill: "#7A9A82", fontSize: 11, dy: 10 }}
                />
                <YAxis
                  dataKey="shapValue"
                  name="SHAP"
                  tick={{ fill: "#7A9A82", fontSize: 11, fontFamily: "IBM Plex Mono" }}
                  tickFormatter={(v: number) => v.toFixed(3)}
                />
                <Tooltip {...TOOLTIP_STYLE} cursor={{ strokeDasharray: "3 3" }} />
                <ReferenceLine y={0} stroke="#7A9A82" strokeDasharray="4 4" />
                <Scatter data={dependenceData} fill="#C4A048" opacity={0.8} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Plot */}
          <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] p-6">
            <h3 className="font-serif text-lg text-[#C4A048] mb-6">Summary Plot — Mean |SHAP|</h3>
            <div className="space-y-2">
              {shapResult.summary.map((item, i) => {
                const maxAbs = shapResult.summary[0]?.meanAbsShap ?? 1;
                const width = Math.round((item.meanAbsShap / maxAbs) * 240);
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 text-right text-xs font-mono text-[#7A9A82]">#{i + 1}</div>
                    <div className="w-36 text-xs font-mono text-[#EDE8DC] truncate">{item.feature}</div>
                    <div style={{ width: `${width}px`, height: "14px" }} className="bg-[#2D6B3D] rounded-sm" />
                    <div className="text-xs font-mono text-[#7A9A82]">{item.meanAbsShap.toFixed(3)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {!shapResult && (
        <div className="flex items-center justify-center h-48 text-[#7A9A82] font-mono text-sm border border-dashed border-[#1E4A2E] rounded-2xl">
          Click Compute SHAP to run explainability analysis
        </div>
      )}
    </div>
  );
}
