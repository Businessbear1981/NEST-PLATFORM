import React, { useMemo, useState } from "react";
import { BarChart3, Calculator, LineChart, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

interface ScenarioInputs {
  occupancy: number;
  rateShock: number;
  expenseInflation: number;
  exitCap: number;
}

const BASE_CASE = { name: "Base Case", dscr: 1.42, irr: 13.1, equity: 48.5, risk: "Supportable" };
const PRESETS = [
  BASE_CASE,
  { name: "Rates +150bp", dscr: 1.23, irr: 10.2, equity: 40.8, risk: "Watch" },
  { name: "Lease-up Delay", dscr: 1.17, irr: 9.4, equity: 37.2, risk: "Approval Gate" },
  { name: "Upside Occupancy", dscr: 1.55, irr: 15.7, equity: 55.9, risk: "Strong" },
];

export function StressScenarioBuilder() {
  const [inputs, setInputs] = useState<ScenarioInputs>({ occupancy: 91, rateShock: 75, expenseInflation: 4.2, exitCap: 6.4 });
  const [saved, setSaved] = useState(false);

  const results = useMemo(() => {
    const occupancyImpact = (inputs.occupancy - 90) * 0.018;
    const rateImpact = inputs.rateShock * -0.00125;
    const expenseImpact = (inputs.expenseInflation - 3.5) * -0.035;
    const capImpact = (inputs.exitCap - 6.2) * -1.35;
    const dscr = Math.max(0.75, 1.38 + occupancyImpact + rateImpact + expenseImpact);
    const irr = Math.max(3, 12.2 + (inputs.occupancy - 90) * 0.22 - inputs.rateShock * 0.018 - (inputs.expenseInflation - 3.5) * 0.55 - (inputs.exitCap - 6.2) * 1.9);
    const equity = Math.max(15, 45 + (inputs.occupancy - 90) * 1.1 + capImpact - inputs.rateShock * 0.055 - (inputs.expenseInflation - 3.5) * 1.4);
    const risk = dscr < 1.2 ? "Approval Gate" : dscr < 1.3 ? "Watch" : dscr > 1.5 ? "Strong" : "Supportable";
    return { name: "Custom Stress", dscr, irr, equity, risk };
  }, [inputs]);

  const allScenarios = [results, ...PRESETS];
  const updateInput = (key: keyof ScenarioInputs, value: number) => {
    setSaved(false);
    setInputs((current) => ({ ...current, [key]: value }));
  };

  return (
    <Card className="border-emerald-300/25 bg-[#07140d]/90 p-5 text-slate-100 shadow-[0_0_42px_rgba(52,211,153,0.10)]">
      <div className="mb-5 flex flex-col gap-3 border-b border-white/10 pb-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="flex items-center gap-2 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-emerald-200">
            <LineChart size={14} /> Stress scenario builder · live comparison
          </p>
          <h2 className="mt-2 font-mono text-lg font-semibold uppercase tracking-[0.05em] text-white">Modeling desk scenario lab</h2>
          <p className="mt-1 text-sm leading-6 text-slate-400">
            Adjust operating and market assumptions to see DSCR, IRR, equity value, and approval-risk state update immediately.
          </p>
        </div>
        <Badge className="w-fit border border-emerald-300/30 bg-emerald-400/10 text-emerald-100">{saved ? "SAVED TO MODEL" : "UNSAVED STRESS"}</Badge>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="space-y-5 rounded-2xl border border-white/10 bg-black/25 p-4">
          {([
            ["occupancy", "Occupancy", 50, 100, "%"],
            ["rateShock", "Rate Shock", 0, 250, "bp"],
            ["expenseInflation", "Expense Inflation", 0, 12, "%"],
            ["exitCap", "Exit Cap", 4, 10, "%"],
          ] as const).map(([key, label, min, max, suffix]) => (
            <div key={key}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-200">{label}</span>
                <span className="font-mono text-emerald-200">{inputs[key].toFixed(key === "rateShock" ? 0 : 1)}{suffix}</span>
              </div>
              <Slider value={[inputs[key]]} min={min} max={max} step={key === "rateShock" ? 5 : 0.1} onValueChange={(value) => updateInput(key, value[0])} />
            </div>
          ))}

          <div className="grid grid-cols-3 gap-2 pt-2 text-center">
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3"><p className="text-xs text-slate-500">DSCR</p><p className="font-mono text-lg font-semibold text-cyan-100">{results.dscr.toFixed(2)}x</p></div>
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3"><p className="text-xs text-slate-500">IRR</p><p className="font-mono text-lg font-semibold text-emerald-100">{results.irr.toFixed(1)}%</p></div>
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3"><p className="text-xs text-slate-500">Equity</p><p className="font-mono text-lg font-semibold text-amber-100">${results.equity.toFixed(1)}M</p></div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSaved(false);
                setInputs({ occupancy: 82, rateShock: 200, expenseInflation: 8, exitCap: 7.4 });
              }}
              className="border-amber-300/35 bg-amber-400/10 text-amber-100 hover:bg-amber-400/20"
            >
              Apply Downside Stress
            </Button>
            <Button onClick={() => setSaved(true)} className="bg-emerald-600 text-white hover:bg-emerald-500">
              {saved ? <RefreshCw className="mr-2 h-4 w-4" /> : <Calculator className="mr-2 h-4 w-4" />}
              {saved ? "Re-save Scenario" : "Save Scenario to Deal Model"}
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-300/20 bg-black/30 p-5">
          <p className="mb-3 flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-slate-500"><BarChart3 size={14} /> Scenario comparison chart</p>
          <div className="space-y-3">
            {allScenarios.map((scenario) => {
              const maxDscr = 1.65;
              const barWidth = Math.min(100, (scenario.dscr / maxDscr) * 100);
              const isRisky = scenario.risk === "Approval Gate" || scenario.risk === "Watch";
              return (
                <div key={scenario.name} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                  <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-mono text-sm font-semibold uppercase tracking-[0.04em] text-white">{scenario.name}</p>
                      <p className="text-xs text-slate-500">DSCR {scenario.dscr.toFixed(2)}x · IRR {scenario.irr.toFixed(1)}% · Equity ${scenario.equity.toFixed(1)}M</p>
                    </div>
                    <Badge variant="outline" className={isRisky ? "border-amber-300/40 bg-amber-300/10 text-amber-100" : "border-emerald-300/35 bg-emerald-400/10 text-emerald-100"}>{scenario.risk}</Badge>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <div className={isRisky ? "h-full bg-amber-400" : "h-full bg-emerald-400"} style={{ width: `${barWidth}%` }} />
                  </div>
                  <div className="mt-2 flex justify-end text-xs text-slate-500">
                    {scenario.dscr >= BASE_CASE.dscr ? <TrendingUp size={14} className="mr-1 text-emerald-300" /> : <TrendingDown size={14} className="mr-1 text-red-300" />}
                    vs. base DSCR {(scenario.dscr - BASE_CASE.dscr).toFixed(2)}x
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}
