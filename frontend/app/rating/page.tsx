'use client';

import { DealStateProvider } from "@/contexts/DealStateContext";
import { BernardProvider } from "@/contexts/BernardContext";
import RatingIntelligenceHub from "@/components/bond-desk/RatingIntelligenceHub";

export default function RatingPage() {
  return (
    <DealStateProvider>
      <BernardProvider defaultMode="standard">
        <div
          className="min-h-screen text-[#EDE8DC] px-4 py-8 sm:px-8"
          style={{
            background:
              "radial-gradient(ellipse at 8% 0%, rgba(196,160,72,0.09) 0%, transparent 45%)," +
              "linear-gradient(180deg,#020b14 0%,#030A06 40%,#020b14 100%)",
          }}
        >
          <div className="mb-6 border-b border-white/[0.07] pb-4">
            <h1 className="font-[Cormorant_Garamond] text-4xl font-bold text-[#EDE8DC]">
              Rating Intelligence
            </h1>
            <p className="mt-1 font-[Space_Grotesk] text-sm text-[#7A9A82]">
              Moody&apos;s Mirror · S&P OPBA · Fitch Climate · Live dual-agency prediction
            </p>
          </div>
          <RatingIntelligenceHub />
        </div>
      </BernardProvider>
    </DealStateProvider>
  );
}
