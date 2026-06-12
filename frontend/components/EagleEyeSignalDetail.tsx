"use client";
import { X, MapPin, Building2, Briefcase, Users, FileText, Zap, Target, Send, ArrowUpRight, AlertTriangle, Shield, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  EagleEyeSignal, MASignal, CRESignal, STATUS_COLORS,
  formatMoney, formatDate,
} from "@/shared/eagleEyeDemo";

// ── Props ────────────────────────────────────────────────────────

interface EagleEyeSignalDetailProps {
  signal: EagleEyeSignal | null;
  open: boolean;
  onClose: () => void;
  onDeployOutreach: (signalId: string) => void;
  onGenerateBullseye: (signalId: string) => void;
  onSendToRoots: (signalId: string) => void;
}

// ── Helpers ──────────────────────────────────────────────────────

function isMA(signal: EagleEyeSignal): signal is MASignal {
  return signal.category === "ma";
}

function isCRE(signal: EagleEyeSignal): signal is CRESignal {
  return signal.category === "cre";
}

// ── Main Component ───────────────────────────────────────────────

export default function EagleEyeSignalDetail({
  signal,
  open,
  onClose,
  onDeployOutreach,
  onGenerateBullseye,
  onSendToRoots,
}: EagleEyeSignalDetailProps) {
  if (!signal) return null;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-[520px] max-w-[90vw] overflow-y-auto border-l border-white/10 bg-[#0D2218] p-0"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-white/10 bg-[#0D2218]/95 backdrop-blur px-5 py-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {isMA(signal) ? (
                  <Briefcase size={14} className="text-[#C4A048]" />
                ) : (
                  <Building2 size={14} className="text-emerald-300" />
                )}
                <h2 className="font-mono text-base font-semibold text-white">{signal.entity}</h2>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <span className={`rounded-full border px-2 py-0.5 font-mono text-[0.56rem] font-semibold uppercase ${STATUS_COLORS[signal.status]}`}>
                  {signal.status}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[0.56rem] uppercase text-[#EDE8DC]">
                  {isMA(signal) ? "M&A" : "CRE"}
                </span>
                <span className="font-mono text-[0.62rem] text-[#7A9A82]">
                  <MapPin size={10} className="inline mr-0.5" />
                  {signal.city}, {signal.state}
                </span>
                <span className="font-mono text-[0.62rem] text-[#7A9A82]">
                  NAICS {signal.naics}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Target size={14} className={isMA(signal) ? "text-[#C4A048]" : "text-emerald-300"} />
                  <span className="font-mono text-xl font-bold text-white">{signal.score}</span>
                  <span className="font-mono text-[0.62rem] text-[#7A9A82]">/100</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 space-y-5">
          {/* Financial Summary */}
          <div className="grid grid-cols-3 gap-3">
            {isMA(signal) ? (
              <>
                <FinStat label="Revenue" value={formatMoney(signal.revenueUsd)} />
                <FinStat label="EBITDA" value={formatMoney(signal.ebitdaUsd)} highlight={signal.ebitdaUsd < 20_000_000} highlightLabel="Below $20M bank threshold" />
                <FinStat label="EV Multiple" value={signal.evMultiple} />
              </>
            ) : (
              <>
                <FinStat label="Deal Size" value={formatMoney(signal.amountUsd)} />
                {signal.sqft && <FinStat label="Sq Ft" value={signal.sqft.toLocaleString()} />}
                {signal.acreage && <FinStat label="Acres" value={signal.acreage.toString()} />}
                {signal.units && <FinStat label="Units" value={signal.units.toString()} />}
                {signal.darkZone && <FinStat label="Cap Rate" value={`${signal.darkZone.currentCapRate}%`} highlight highlightLabel="Dark Zone" />}
              </>
            )}
          </div>

          {/* M&A-specific sections */}
          {isMA(signal) && (
            <>
              {/* Ownership Intelligence */}
              <Section title="OWNERSHIP INTELLIGENCE" icon={<Users size={12} className="text-amber-300" />}>
                <div className="space-y-1.5">
                  <InfoRow label="Founder" value={signal.ownership.founderName} />
                  <InfoRow label="Age" value={signal.ownership.founderAge.toString()} warn={signal.ownership.founderAge >= 65} />
                  <InfoRow label="Generation" value={`${signal.ownership.generation}${signal.ownership.generation === 3 ? " (70%+ failure rate)" : ""}`} warn={signal.ownership.generation >= 3} />
                  <InfoRow label="Succession Plan" value={signal.ownership.successionPlan ? "Yes" : "None"} warn={!signal.ownership.successionPlan} />
                  <InfoRow label="PE Sponsor" value={signal.ownership.peSponsor ?? "None — open field"} good={!signal.ownership.peSponsor} />
                  <InfoRow label="Banker Engaged" value={signal.ownership.bankerEngaged ? "Yes" : "No — clean field"} good={!signal.ownership.bankerEngaged} />
                  {signal.ownership.boardAdvisors.length > 0 && (
                    <InfoRow label="Advisors" value={signal.ownership.boardAdvisors.join(", ")} />
                  )}
                </div>
              </Section>

              {/* PE Landscape */}
              <Section title="PE LANDSCAPE" icon={<Shield size={12} className="text-[#C4A048]" />}>
                <div className="space-y-3">
                  {signal.peLandscape.map((pe, i) => (
                    <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                      <p className="font-mono text-[0.72rem] font-semibold text-[#E8C87A]">{pe.name}</p>
                      <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1">
                        <InfoRow label="Fund" value={pe.fundSize} small />
                        <InfoRow label="Mandate" value={pe.mandate} small />
                        <InfoRow label="Recent Deals" value={`${pe.recentAcquisitions} in 12mo`} small />
                        <InfoRow label="Deployed" value={`${pe.deploymentPct}%`} small />
                        <InfoRow label="Contact" value={`${pe.contactName} (${pe.contactTitle})`} small />
                      </div>
                    </div>
                  ))}
                </div>
              </Section>

              {/* Portco Signaling */}
              {signal.portcoSignals.length > 0 && (
                <Section title="PORTCO SIGNALING" icon={<Briefcase size={12} className="text-emerald-300" />}>
                  <div className="space-y-2">
                    {signal.portcoSignals.map((pc, i) => (
                      <div key={i} className="rounded-lg border border-white/5 bg-white/[0.02] p-2">
                        <p className="font-mono text-[0.72rem] text-white">
                          {pc.name} <span className="text-[#7A9A82]">({pc.sponsor}, {pc.revenue})</span>
                        </p>
                        <p className="mt-0.5 font-mono text-[0.62rem] text-emerald-200/70">{pc.relevance}</p>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Capital Formation */}
              {signal.capitalFormation.length > 0 && (
                <Section title="CAPITAL FORMATION" icon={<DollarSign size={12} className="text-amber-300" />}>
                  <ul className="space-y-1">
                    {signal.capitalFormation.map((item, i) => (
                      <li key={i} className="flex gap-2 font-mono text-[0.72rem] text-[#EDE8DC]">
                        <span className="text-amber-400 mt-0.5">•</span> {item}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {/* UCC Filings */}
              {signal.uccFilings.length > 0 && (
                <Section title="UCC FILINGS" icon={<FileText size={12} className="text-red-300" />}>
                  <div className="space-y-2">
                    {signal.uccFilings.map((ucc, i) => (
                      <div key={i} className="rounded-lg border border-red-400/10 bg-red-500/5 p-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[0.68rem] font-semibold text-white">{ucc.filingType}</span>
                          <span className="font-mono text-[0.68rem] text-amber-100">{formatMoney(ucc.amount)}</span>
                        </div>
                        <p className="font-mono text-[0.62rem] text-[#7A9A82]">
                          {ucc.lender} · {ucc.date}
                        </p>
                        <p className="mt-0.5 font-mono text-[0.62rem] text-[#7A9A82]">{ucc.detail}</p>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </>
          )}

          {/* CRE-specific sections */}
          {isCRE(signal) && (
            <>
              {/* Dark Zone Analysis */}
              {signal.darkZone && (
                <Section
                  title="DARK ZONE ANALYSIS"
                  icon={<AlertTriangle size={12} className="text-red-400" />}
                  highlight
                >
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <FinStat label="Current Cap Rate" value={`${signal.darkZone.currentCapRate}%`} />
                      <FinStat label="Market Cap Rate" value={`${signal.darkZone.marketCapRate}%`} />
                      <FinStat label="Current NOI" value={formatMoney(signal.darkZone.currentNOI)} />
                      <FinStat label="DSCR" value={signal.darkZone.dscr.toFixed(2)} highlight={signal.darkZone.dscr < 1.0} highlightLabel="Below 1.0x" />
                    </div>
                    <div className="rounded-lg border border-red-400/15 bg-red-500/5 p-3">
                      <p className="font-mono text-[0.62rem] font-semibold uppercase text-red-300">Why Equity Fails</p>
                      <p className="mt-1 font-mono text-[0.72rem] text-[#EDE8DC]">{signal.darkZone.whyEquityFails}</p>
                    </div>
                    <div className="rounded-lg border border-emerald-400/15 bg-emerald-500/5 p-3">
                      <p className="font-mono text-[0.62rem] font-semibold uppercase text-emerald-300">Bond Structure Viable</p>
                      <p className="mt-1 font-mono text-[0.72rem] text-[#EDE8DC]">{signal.darkZone.bondCouponViable}</p>
                    </div>
                    <div className="rounded-lg border border-amber-400/15 bg-amber-500/5 p-3">
                      <p className="font-mono text-[0.62rem] font-semibold uppercase text-amber-200">Bond Structure Summary</p>
                      <p className="mt-1 font-mono text-[0.72rem] text-amber-100/80">{signal.darkZone.bondStructureSummary}</p>
                    </div>
                  </div>
                </Section>
              )}

              {/* Maturing Loan */}
              {signal.maturingLoan && (
                <Section title="MATURING LOAN" icon={<Clock size={12} className="text-amber-300" />}>
                  <div className="space-y-1.5">
                    <InfoRow label="Lender" value={signal.maturingLoan.lender} />
                    <InfoRow label="Original" value={formatMoney(signal.maturingLoan.originalAmount)} />
                    <InfoRow label="Current Balance" value={formatMoney(signal.maturingLoan.currentBalance)} />
                    <InfoRow label="Maturity" value={signal.maturingLoan.maturityDate} warn />
                    <InfoRow label="Rate" value={signal.maturingLoan.currentRate} />
                    <InfoRow label="Type" value={signal.maturingLoan.loanType} />
                  </div>
                </Section>
              )}

              {/* Environmental */}
              {signal.environmentalStatus && (
                <Section title="ENVIRONMENTAL STATUS" icon={<AlertTriangle size={12} className="text-yellow-300" />}>
                  <p className="font-mono text-[0.72rem] text-[#EDE8DC]">{signal.environmentalStatus}</p>
                </Section>
              )}

              {/* Permit / Rezoning */}
              {(signal.permitDetails || signal.rezoningStatus) && (
                <Section title="PERMIT / REZONING" icon={<FileText size={12} className="text-emerald-300" />}>
                  {signal.rezoningStatus && <p className="font-mono text-[0.72rem] text-emerald-200/80">{signal.rezoningStatus}</p>}
                  {signal.permitDetails && <p className="mt-1 font-mono text-[0.72rem] text-[#EDE8DC]">{signal.permitDetails}</p>}
                </Section>
              )}

              {/* MEP Changes */}
              {signal.mepChanges && (
                <Section title="MEP CHANGE ORDERS" icon={<AlertTriangle size={12} className="text-red-300" />}>
                  <p className="font-mono text-[0.72rem] text-red-200/80">{signal.mepChanges}</p>
                </Section>
              )}

              {/* Owner Intel */}
              <Section title="OWNER INTELLIGENCE" icon={<Users size={12} className="text-[#EDE8DC]" />}>
                <p className="font-mono text-[0.72rem] text-[#EDE8DC]">{signal.ownerIntel}</p>
              </Section>
            </>
          )}

          {/* AI Deal Thesis — both types */}
          <div className="rounded-xl border-l-4 border-amber-400/50 bg-amber-400/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={12} className="text-amber-300" />
              <span className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-amber-200">
                AI Deal Thesis — Bernard
              </span>
            </div>
            <p className="font-mono text-[0.72rem] leading-5 text-amber-100/80">
              {signal.dealThesis}
            </p>
          </div>

          {/* Source + Date */}
          <div className="flex items-center justify-between font-mono text-[0.56rem] text-[#7A9A82]">
            <span>Source: {signal.source}</span>
            <span>Discovered: {formatDate(signal.discoveredAt)}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 border-t border-white/5 pt-4">
            <Button
              onClick={() => onDeployOutreach(signal.id)}
              className="rounded-xl border border-[#C4A048]/35 bg-[#C4A048]/12 px-4 py-2 font-mono text-[0.62rem] font-semibold uppercase text-[#EDE8DC] hover:bg-[#C4A048]/20"
            >
              <Send size={12} className="mr-1.5" /> Deploy Outreach
            </Button>
            <Button
              onClick={() => onGenerateBullseye(signal.id)}
              className="rounded-xl border border-amber-300/35 bg-amber-400/12 px-4 py-2 font-mono text-[0.62rem] font-semibold uppercase text-amber-100 hover:bg-amber-400/20"
            >
              <Target size={12} className="mr-1.5" /> Generate Bullseye
            </Button>
            <Button
              onClick={() => onSendToRoots(signal.id)}
              className="rounded-xl border border-emerald-300/35 bg-emerald-400/12 px-4 py-2 font-mono text-[0.62rem] font-semibold uppercase text-emerald-100 hover:bg-emerald-400/20"
            >
              <ArrowUpRight size={12} className="mr-1.5" /> Send to Roots
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ── Sub-components ───────────────────────────────────────────────

function Section({
  title,
  icon,
  highlight = false,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  highlight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl border p-3 ${highlight ? "border-red-400/20 bg-red-500/5" : "border-white/5 bg-white/[0.02]"}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#7A9A82]">{title}</span>
      </div>
      {children}
    </div>
  );
}

function FinStat({
  label,
  value,
  highlight = false,
  highlightLabel,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  highlightLabel?: string;
}) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2">
      <p className="font-mono text-[0.52rem] uppercase tracking-[0.12em] text-[#7A9A82]">{label}</p>
      <p className="font-mono text-base font-semibold text-amber-100">{value}</p>
      {highlight && highlightLabel && (
        <p className="font-mono text-[0.52rem] text-red-300 mt-0.5">{highlightLabel}</p>
      )}
    </div>
  );
}

function InfoRow({
  label,
  value,
  warn = false,
  good = false,
  small = false,
}: {
  label: string;
  value: string;
  warn?: boolean;
  good?: boolean;
  small?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className={`font-mono ${small ? "text-[0.56rem]" : "text-[0.62rem]"} text-[#7A9A82]`}>{label}</span>
      <span className={`font-mono ${small ? "text-[0.56rem]" : "text-[0.68rem]"} text-right ${warn ? "text-red-300" : good ? "text-emerald-300" : "text-[#EDE8DC]"}`}>
        {value}
      </span>
    </div>
  );
}
