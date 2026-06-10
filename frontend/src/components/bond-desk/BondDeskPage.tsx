import { DealStateProvider } from "@/contexts/DealStateContext";
import { BernardProvider } from "@/contexts/BernardContext";
import DealPulseTicker from "./DealPulseTicker";
import DealPipelineDashboard from "./DealPipelineDashboard";
import BondStructuringEngine from "./BondStructuringEngine";
import CMBSStackingDesk from "./CMBSStackingDesk";
import CounterpartySandbox from "./CounterpartySandbox";

export default function BondDeskPage() {
  return (
    <DealStateProvider>
      <BernardProvider defaultMode="standard">
        <main
          className="min-h-screen px-4 py-6 text-slate-100 sm:px-8"
          style={{
            background:
              "radial-gradient(circle at 12% 4%, rgba(34,211,238,0.12), transparent 28rem), " +
              "radial-gradient(circle at 84% 9%, rgba(196,160,72,0.10), transparent 25rem), " +
              "linear-gradient(135deg, #030A06 0%, #0D2218 50%, #030A06 100%)",
          }}
        >
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="font-[Cormorant_Garamond] text-3xl font-bold text-[#EDE8DC]">
                GENIE
              </h1>
              <p className="font-[Space_Grotesk] text-sm text-[#7A9A82]">
                Bond Arrangement Engine — Structure any debt vehicle
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[0.6rem] uppercase tracking-wider text-slate-500">
                Live Terminal
              </span>
            </div>
          </div>

          {/* Module 1: Deal Pulse Ticker */}
          <div className="mb-6">
            <DealPulseTicker />
          </div>

          {/* Deal Pipeline */}
          <div className="mb-6">
            <DealPipelineDashboard />
          </div>

          {/* Module 2: Bond Structuring Engine */}
          <div className="mb-8">
            <BondStructuringEngine />
          </div>

          {/* Module 4: Counterparty Sandboxes */}
          <div className="mb-6">
            <CounterpartySandbox />
          </div>

          {/* Divider */}
          <div className="my-8 border-t border-white/[0.06]" />

          {/* Module 3: CMBS Stacking Desk */}
          <CMBSStackingDesk />
        </main>
      </BernardProvider>
    </DealStateProvider>
  );
}
