import { useState } from "react";
import { Eye, Building2, TrendingUp } from "lucide-react";
import EagleEyeV2 from "./EagleEyeV2";
import EagleEyeMATab from "./EagleEyeMATab";
import EagleEyeCRETab from "./EagleEyeCRETab";

type TabKey = "signals" | "ma" | "cre";

const TABS: { key: TabKey; label: string; sub: string; icon: typeof Eye }[] = [
  { key: "signals", label: "Signal Feed", sub: "EDGAR · FRED · Permits", icon: Eye },
  { key: "ma", label: "M&A Targets", sub: "$30M–$150M Rev · Sub-$20M EBITDA", icon: TrendingUp },
  { key: "cre", label: "CRE Heat Map", sub: "Bridge Maturities · CMBS · Distressed", icon: Building2 },
];

export default function EagleEyeMain() {
  const [active, setActive] = useState<TabKey>("signals");

  return (
    <div className="space-y-4">
      {/* Engine selector */}
      <div className="rounded-[1.4rem] border border-[#C4A048]/20 bg-[#030A06] p-1.5">
        <div className="flex gap-1.5">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = active === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActive(tab.key)}
                className={`flex-1 rounded-xl px-3 py-2.5 text-left transition-all ${
                  isActive
                    ? "bg-[#0D2218] border border-[#C4A048]/30 shadow-[0_0_12px_rgba(196,160,72,0.08)]"
                    : "border border-transparent hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    size={14}
                    className={isActive ? "text-[#C4A048]" : "text-slate-500"}
                  />
                  <div className="min-w-0">
                    <div className={`text-[0.78rem] font-semibold leading-tight ${isActive ? "text-[#C4A048]" : "text-slate-400"}`}>
                      {tab.label}
                    </div>
                    <div className="font-mono text-[0.58rem] text-slate-600 truncate mt-0.5">{tab.sub}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      {active === "signals" && <EagleEyeV2 />}
      {active === "ma" && <EagleEyeMATab />}
      {active === "cre" && <EagleEyeCRETab />}
    </div>
  );
}
