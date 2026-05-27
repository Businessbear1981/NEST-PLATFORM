'use client'
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target, Send, Mail, Phone, Copy, ChevronDown, ChevronUp,
  Zap, Shield, Clock, ArrowUpRight, Check, Loader2, Crosshair
} from "lucide-react";

// ── Inline Types ────────────────────────────────────────────────

interface BullseyePitch {
  id: string;
  signalEntity: string;
  targetFirm: string;
  targetContact: string;
  targetTitle: string;
  status: "draft" | "approved" | "deployed" | "converted";
  whyThem: string[];
  whyThisDeal: string[];
  whyNow: string[];
  nestRole: string[];
  approachStrategy: string;
  warmIntroPath?: string;
  emailTemplate: string;
  callScript: string;
}

function formatMoney(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
}

// ── Demo Data ───────────────────────────────────────────────────

const DEMO_PITCHES: BullseyePitch[] = [
  {
    id: "pitch-001",
    signalEntity: "Jacaranda Trace CCRC — $231M Senior Living",
    targetFirm: "Pimco Private Credit",
    targetContact: "Sarah Chen",
    targetTitle: "MD, Real Assets",
    status: "approved",
    whyThem: [
      "Pimco allocated $4.2B to senior living credit in 2024",
      "Sarah Chen led their Sunrise Senior portfolio — same CCRC structure",
      "They prefer 7-10yr duration which matches our Series A profile",
    ],
    whyThisDeal: [
      "1.80x DSCR with surety-enhanced credit — investment grade pathway",
      "FL LGFC conduit provides tax-exempt savings of 180-220bps",
      "NEST structures the full stack: A + B tranche + IO pre-fund",
    ],
    whyNow: [
      "Pimco's Q2 allocation window opens June 1 — 3 weeks to present",
      "Rising 10yr treasury makes locked-rate deals more attractive",
      "Competitor deal (Brookdale refi) fell through — capital seeking deployment",
    ],
    nestRole: [
      "Structure Series A ($173M) at 6.75% with Hylant surety wrap",
      "Layer Series B ($40M) for bank AUM conversion at 12% coupon",
      "Pre-fund 18mo IO from proceeds — zero cash drag during construction",
      "Full closing in 45 days via NEST bond desk automation",
    ],
    approachStrategy: "Warm intro via Josh Edwards → Pimco LP relations. Follow up with deal teaser + 2-page credit summary.",
    warmIntroPath: "Josh Edwards → Mike Torres (Pimco LP) → Sarah Chen",
    emailTemplate: `Subject: Jacaranda Trace — $231M Senior Living | Surety-Enhanced A-Grade Structure

Sarah,

Josh Edwards suggested I reach out. We're structuring a $231M CCRC bond through the Florida LGFC conduit — the kind of deal your team led with the Sunrise portfolio.

Three things that matter:
1. 1.80x DSCR with Hylant surety wrap — investment grade pathway
2. Pre-funded IO eliminates cash drag during 24mo construction
3. Series A at 6.75% with 7yr duration — fits your allocation profile

We close in 45 days. Full credit package ready for your review.

Worth 20 minutes this week?

Sean Gilmore
NEST Advisors`,
    callScript: `Sarah, this is Sean Gilmore with NEST Advisors. Josh Edwards suggested I call.

We're structuring a $231M senior living bond — same CCRC profile as your Sunrise portfolio. Investment grade pathway with surety enhancement, 1.80x DSCR, 6.75% Series A.

We close in 45 days. Can I send you the credit package?`,
  },
  {
    id: "pitch-002",
    signalEntity: "St. Petersburg Mixed-Use — $172.5M Construction",
    targetFirm: "Nuveen Real Estate",
    targetContact: "David Park",
    targetTitle: "SVP, Municipal Credit",
    status: "draft",
    whyThem: [
      "Nuveen holds $42B in muni credit — largest buyer in the space",
      "David Park's team bought 3 FL conduit deals in the last 18 months",
      "Their ESG mandate favors mixed-use urban infill projects",
    ],
    whyThisDeal: [
      "Mixed-use: 280 units + 45K SF retail in downtown St. Pete",
      "City TIF district provides additional credit support",
      "NEST B-tranche overlay converts bank AUM to bond collateral",
    ],
    whyNow: [
      "Nuveen's muni desk is 12% under-allocated for Q2",
      "St. Pete city council approved TIF on May 15 — deal is now structurable",
    ],
    nestRole: [
      "Structure $130M Series A at investment grade via FL conduit",
      "Layer $42.5M Series B with bank AUM conversion",
      "Coordinate Hylant surety for credit enhancement",
      "45-day close with full NEST bond desk automation",
    ],
    approachStrategy: "Direct outreach — David Park spoke at IMN conference, referenced appetite for FL conduit paper.",
    emailTemplate: `Subject: St. Pete Mixed-Use — $172.5M FL Conduit | TIF-Supported

David,

Your comments at IMN about FL conduit appetite caught our attention. We're structuring a $172.5M mixed-use bond through FL LGFC — 280 units + retail in downtown St. Pete with city TIF support.

NEST structures the full capital stack in 45 days. Worth a conversation?

Sean Gilmore
NEST Advisors`,
    callScript: `David, Sean Gilmore with NEST Advisors. I caught your IMN comments on FL conduit appetite.

We have a $172.5M mixed-use in St. Pete — TIF supported, FL LGFC conduit. 280 units plus retail. Full capital stack structured in 45 days.

Can I send you the summary?`,
  },
];

// ── Status Colors ────────────────────────────────────────────────

const PITCH_STATUS_COLORS: Record<string, string> = {
  draft: "border-slate-400/30 bg-slate-500/15 text-slate-300",
  approved: "border-emerald-300/30 bg-emerald-400/15 text-emerald-200",
  deployed: "border-cyan-300/30 bg-cyan-400/15 text-cyan-200",
  converted: "border-amber-300/30 bg-amber-400/15 text-amber-100",
};

// ── Collapsible Section ──────────────────────────────────────────

function CollapsibleSection({
  title,
  icon,
  isOpen,
  onToggle,
  defaultOpen = false,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const show = isOpen || defaultOpen;

  return (
    <div className="mt-3">
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className="flex items-center gap-2 w-full text-left"
      >
        {icon}
        <span className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-slate-400">{title}</span>
        {show ? <ChevronUp size={12} className="text-slate-500 ml-auto" /> : <ChevronDown size={12} className="text-slate-500 ml-auto" />}
      </button>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 pl-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Page Component ─────────────────────────────────────────

export default function MarketingPage() {
  const [pitches, setPitches] = useState<BullseyePitch[]>(DEMO_PITCHES);
  const [expandedPitch, setExpandedPitch] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, Set<string>>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const draftCount = pitches.filter(p => p.status === "draft").length;
  const approvedCount = pitches.filter(p => p.status === "approved").length;
  const deployedCount = pitches.filter(p => p.status === "deployed").length;
  const convertedCount = pitches.filter(p => p.status === "converted").length;

  function toggleSection(pitchId: string, section: string) {
    setExpandedSections(prev => {
      const current = prev[pitchId] ?? new Set<string>();
      const next = new Set(current);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return { ...prev, [pitchId]: next };
    });
  }

  function isSectionOpen(pitchId: string, section: string): boolean {
    return expandedSections[pitchId]?.has(section) ?? false;
  }

  async function copyToClipboard(text: string, id: string) {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function onGeneratePitch() {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/marketing/generate-pitch", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (data.pitch) setPitches(prev => [data.pitch, ...prev]);
      }
    } catch {
      /* swallow */
    } finally {
      setIsGenerating(false);
    }
  }

  function onDeployOutreach(pitchId: string) {
    setPitches(prev => prev.map(p => p.id === pitchId ? { ...p, status: "deployed" as const } : p));
  }

  function onApprovePitch(pitchId: string) {
    setPitches(prev => prev.map(p => p.id === pitchId ? { ...p, status: "approved" as const } : p));
  }

  return (
    <div className="space-y-6">
      {/* Tagline Banner */}
      <div className="rounded-2xl border border-amber-300/20 bg-gradient-to-r from-amber-400/5 via-amber-400/10 to-amber-400/5 p-4">
        <div className="flex items-center gap-3">
          <Crosshair size={20} className="text-amber-100" />
          <div>
            <p className="font-serif text-lg text-amber-100">
              Never show up empty-handed.
            </p>
            <p className="mt-0.5 font-mono text-[0.68rem] text-amber-200/60">
              NEST STRUCTURES A DEBT VEHICLE AT ANY LEVEL IN 45 DAYS
            </p>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          {[
            { label: "Total", value: pitches.length, tone: "text-white" },
            { label: "Draft", value: draftCount, tone: "text-slate-300" },
            { label: "Approved", value: approvedCount, tone: "text-emerald-200" },
            { label: "Deployed", value: deployedCount, tone: "text-cyan-200" },
            { label: "Converted", value: convertedCount, tone: "text-amber-100" },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <p className="font-mono text-[0.52rem] uppercase tracking-[0.14em] text-slate-500">{stat.label}</p>
              <p className={`font-mono text-lg font-semibold ${stat.tone}`}>{stat.value}</p>
            </div>
          ))}
        </div>
        <button
          onClick={onGeneratePitch}
          disabled={isGenerating}
          className="rounded-xl border border-amber-300/35 bg-amber-400/12 px-4 py-2 font-mono text-[0.68rem] font-semibold uppercase text-amber-100 hover:bg-amber-400/20 disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin inline" /> : <Zap className="mr-2 h-3.5 w-3.5 inline" />}
          {isGenerating ? "Bernard Generating..." : "Generate New Pitch"}
        </button>
      </div>

      {/* Pitch Cards */}
      <div className="space-y-4">
        {pitches.map(pitch => {
          const isExpanded = expandedPitch === pitch.id;

          return (
            <article
              key={pitch.id}
              className="rounded-2xl border border-white/10 bg-black/35 overflow-hidden transition hover:border-white/20"
            >
              {/* Card Header */}
              <div
                className="p-4 cursor-pointer"
                onClick={() => setExpandedPitch(isExpanded ? null : pitch.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Target size={14} className="text-amber-100" />
                      <h3 className="font-mono text-sm font-semibold text-white">{pitch.signalEntity}</h3>
                      <span className={`rounded-full border px-2 py-0.5 font-mono text-[0.56rem] font-semibold uppercase ${PITCH_STATUS_COLORS[pitch.status]}`}>
                        {pitch.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-400">
                      <ArrowUpRight size={12} className="inline mr-1" />
                      Approach: <span className="text-cyan-200">{pitch.targetFirm}</span> — {pitch.targetContact} ({pitch.targetTitle})
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-white/5 px-4 pb-4 space-y-3">

                      {/* WHY THEM */}
                      <CollapsibleSection
                        title="WHY THEM"
                        icon={<Shield size={12} className="text-cyan-300" />}
                        isOpen={isSectionOpen(pitch.id, "whyThem")}
                        onToggle={() => toggleSection(pitch.id, "whyThem")}
                        defaultOpen
                      >
                        <ul className="space-y-1">
                          {pitch.whyThem.map((item, i) => (
                            <li key={i} className="flex gap-2 font-mono text-[0.72rem] text-slate-300">
                              <span className="text-cyan-400 mt-0.5">&bull;</span> {item}
                            </li>
                          ))}
                        </ul>
                      </CollapsibleSection>

                      {/* WHY THIS DEAL */}
                      <CollapsibleSection
                        title="WHY THIS DEAL"
                        icon={<Target size={12} className="text-emerald-300" />}
                        isOpen={isSectionOpen(pitch.id, "whyDeal")}
                        onToggle={() => toggleSection(pitch.id, "whyDeal")}
                        defaultOpen
                      >
                        <ul className="space-y-1">
                          {pitch.whyThisDeal.map((item, i) => (
                            <li key={i} className="flex gap-2 font-mono text-[0.72rem] text-slate-300">
                              <span className="text-emerald-400 mt-0.5">&bull;</span> {item}
                            </li>
                          ))}
                        </ul>
                      </CollapsibleSection>

                      {/* WHY NOW */}
                      <CollapsibleSection
                        title="WHY NOW"
                        icon={<Clock size={12} className="text-red-300" />}
                        isOpen={isSectionOpen(pitch.id, "whyNow")}
                        onToggle={() => toggleSection(pitch.id, "whyNow")}
                      >
                        <ul className="space-y-1">
                          {pitch.whyNow.map((item, i) => (
                            <li key={i} className="flex gap-2 font-mono text-[0.72rem] text-red-200/80">
                              <span className="text-red-400 mt-0.5">&#x26A1;</span> {item}
                            </li>
                          ))}
                        </ul>
                      </CollapsibleSection>

                      {/* NEST'S ROLE */}
                      <CollapsibleSection
                        title="NEST'S ROLE — 45 DAY CLOSE"
                        icon={<Zap size={12} className="text-amber-300" />}
                        isOpen={isSectionOpen(pitch.id, "nestRole")}
                        onToggle={() => toggleSection(pitch.id, "nestRole")}
                        defaultOpen
                      >
                        <ul className="space-y-1">
                          {pitch.nestRole.map((item, i) => (
                            <li key={i} className="flex gap-2 font-mono text-[0.72rem] text-amber-100/80">
                              <span className="text-amber-400 mt-0.5">&rarr;</span> {item}
                            </li>
                          ))}
                        </ul>
                      </CollapsibleSection>

                      {/* APPROACH STRATEGY */}
                      <CollapsibleSection
                        title="APPROACH STRATEGY"
                        icon={<ArrowUpRight size={12} className="text-slate-300" />}
                        isOpen={isSectionOpen(pitch.id, "approach")}
                        onToggle={() => toggleSection(pitch.id, "approach")}
                      >
                        <p className="font-mono text-[0.72rem] text-slate-300">{pitch.approachStrategy}</p>
                        {pitch.warmIntroPath && (
                          <p className="mt-2 rounded-lg border-l-2 border-amber-400/30 bg-amber-400/5 px-3 py-1.5 font-mono text-[0.68rem] text-amber-200/70">
                            Warm intro: {pitch.warmIntroPath}
                          </p>
                        )}
                      </CollapsibleSection>

                      {/* EMAIL TEMPLATE */}
                      <CollapsibleSection
                        title="EMAIL TEMPLATE"
                        icon={<Mail size={12} className="text-cyan-300" />}
                        isOpen={isSectionOpen(pitch.id, "email")}
                        onToggle={() => toggleSection(pitch.id, "email")}
                      >
                        <div className="relative">
                          <pre className="rounded-xl border border-white/10 bg-black/50 p-4 font-mono text-[0.72rem] leading-5 text-slate-300 whitespace-pre-wrap overflow-x-auto">
                            {pitch.emailTemplate}
                          </pre>
                          <button
                            onClick={(e) => { e.stopPropagation(); copyToClipboard(pitch.emailTemplate, `email_${pitch.id}`); }}
                            className="absolute top-2 right-2 rounded-lg border border-white/10 bg-black/60 px-2 py-1 font-mono text-[0.56rem] text-slate-400 hover:text-white hover:bg-black/80"
                          >
                            {copiedId === `email_${pitch.id}` ? <><Check size={10} className="mr-1 text-emerald-300 inline" /> Copied!</> : <><Copy size={10} className="mr-1 inline" /> Copy</>}
                          </button>
                        </div>
                      </CollapsibleSection>

                      {/* CALL SCRIPT */}
                      <CollapsibleSection
                        title="CALL SCRIPT (30 SEC)"
                        icon={<Phone size={12} className="text-emerald-300" />}
                        isOpen={isSectionOpen(pitch.id, "call")}
                        onToggle={() => toggleSection(pitch.id, "call")}
                      >
                        <div className="relative">
                          <pre className="rounded-xl border border-white/10 bg-black/50 p-4 font-mono text-[0.72rem] leading-5 text-slate-300 whitespace-pre-wrap overflow-x-auto">
                            {pitch.callScript}
                          </pre>
                          <button
                            onClick={(e) => { e.stopPropagation(); copyToClipboard(pitch.callScript, `call_${pitch.id}`); }}
                            className="absolute top-2 right-2 rounded-lg border border-white/10 bg-black/60 px-2 py-1 font-mono text-[0.56rem] text-slate-400 hover:text-white hover:bg-black/80"
                          >
                            {copiedId === `call_${pitch.id}` ? <><Check size={10} className="mr-1 text-emerald-300 inline" /> Copied!</> : <><Copy size={10} className="mr-1 inline" /> Copy</>}
                          </button>
                        </div>
                      </CollapsibleSection>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2 border-t border-white/5">
                        <button
                          onClick={() => onDeployOutreach(pitch.id)}
                          className="rounded-xl border border-cyan-300/35 bg-cyan-400/12 px-4 py-2 font-mono text-[0.62rem] font-semibold uppercase text-cyan-100 hover:bg-cyan-400/20"
                        >
                          <Send size={12} className="mr-1.5 inline" /> Deploy Outreach
                        </button>
                        {pitch.status === "draft" && (
                          <button
                            onClick={() => onApprovePitch(pitch.id)}
                            className="rounded-xl border border-emerald-300/35 bg-emerald-400/12 px-4 py-2 font-mono text-[0.62rem] font-semibold uppercase text-emerald-100 hover:bg-emerald-400/20"
                          >
                            <Check size={12} className="mr-1.5 inline" /> Approve
                          </button>
                        )}
                        <button
                          onClick={() => copyToClipboard(pitch.emailTemplate, `email_btn_${pitch.id}`)}
                          className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-2 font-mono text-[0.62rem] font-semibold uppercase text-slate-300 hover:bg-white/[0.06]"
                        >
                          {copiedId === `email_btn_${pitch.id}` ? <><Check size={12} className="mr-1.5 text-emerald-300 inline" /> Copied!</> : <><Mail size={12} className="mr-1.5 inline" /> Copy Email</>}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </article>
          );
        })}
      </div>
    </div>
  );
}
