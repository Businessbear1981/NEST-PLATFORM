"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target, Send, Mail, Phone, Copy, ChevronDown, ChevronUp,
  Zap, Shield, Clock, ArrowUpRight, Check, Loader2, Crosshair
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BullseyePitch, formatMoney } from "@/shared/eagleEyeDemo";

// ── Props ────────────────────────────────────────────────────────

interface BullseyePitchEngineProps {
  pitches: BullseyePitch[];
  onDeployOutreach: (pitchId: string) => void;
  onApprovePitch: (pitchId: string) => void;
  onGeneratePitch: () => void;
  isGenerating?: boolean;
}

// ── Status Colors ────────────────────────────────────────────────

const PITCH_STATUS_COLORS: Record<string, string> = {
  draft: "border-[#2D6B3D]/30 bg-[#2D6B3D]/15 text-[#EDE8DC]",
  approved: "border-emerald-300/30 bg-emerald-400/15 text-emerald-200",
  deployed: "border-[#C4A048]/30 bg-[#C4A048]/15 text-[#E8C87A]",
  converted: "border-amber-300/30 bg-amber-400/15 text-amber-100",
};

// ── Main Component ───────────────────────────────────────────────

export default function BullseyePitchEngine({
  pitches,
  onDeployOutreach,
  onApprovePitch,
  onGeneratePitch,
  isGenerating = false,
}: BullseyePitchEngineProps) {
  const [expandedPitch, setExpandedPitch] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, Set<string>>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
            { label: "Draft", value: draftCount, tone: "text-[#EDE8DC]" },
            { label: "Approved", value: approvedCount, tone: "text-emerald-200" },
            { label: "Deployed", value: deployedCount, tone: "text-[#E8C87A]" },
            { label: "Converted", value: convertedCount, tone: "text-amber-100" },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <p className="font-mono text-[0.52rem] uppercase tracking-[0.14em] text-[#7A9A82]">{stat.label}</p>
              <p className={`font-mono text-lg font-semibold ${stat.tone}`}>{stat.value}</p>
            </div>
          ))}
        </div>
        <Button
          onClick={onGeneratePitch}
          disabled={isGenerating}
          className="rounded-xl border border-amber-300/35 bg-amber-400/12 px-4 py-2 font-mono text-[0.68rem] font-semibold uppercase text-amber-100 hover:bg-amber-400/20"
        >
          {isGenerating ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Zap className="mr-2 h-3.5 w-3.5" />}
          {isGenerating ? "Bernard Generating..." : "Generate New Pitch"}
        </Button>
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
                    <p className="mt-1 text-sm text-[#7A9A82]">
                      <ArrowUpRight size={12} className="inline mr-1" />
                      Approach: <span className="text-[#E8C87A]">{pitch.targetFirm}</span> — {pitch.targetContact} ({pitch.targetTitle})
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isExpanded ? <ChevronUp size={16} className="text-[#7A9A82]" /> : <ChevronDown size={16} className="text-[#7A9A82]" />}
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
                        icon={<Shield size={12} className="text-[#C4A048]" />}
                        isOpen={isSectionOpen(pitch.id, "whyThem")}
                        onToggle={() => toggleSection(pitch.id, "whyThem")}
                        defaultOpen
                      >
                        <ul className="space-y-1">
                          {pitch.whyThem.map((item, i) => (
                            <li key={i} className="flex gap-2 font-mono text-[0.72rem] text-[#EDE8DC]">
                              <span className="text-[#C4A048] mt-0.5">•</span> {item}
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
                            <li key={i} className="flex gap-2 font-mono text-[0.72rem] text-[#EDE8DC]">
                              <span className="text-emerald-400 mt-0.5">•</span> {item}
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
                              <span className="text-red-400 mt-0.5">⚡</span> {item}
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
                              <span className="text-amber-400 mt-0.5">→</span> {item}
                            </li>
                          ))}
                        </ul>
                      </CollapsibleSection>

                      {/* APPROACH STRATEGY */}
                      <CollapsibleSection
                        title="APPROACH STRATEGY"
                        icon={<ArrowUpRight size={12} className="text-[#EDE8DC]" />}
                        isOpen={isSectionOpen(pitch.id, "approach")}
                        onToggle={() => toggleSection(pitch.id, "approach")}
                      >
                        <p className="font-mono text-[0.72rem] text-[#EDE8DC]">{pitch.approachStrategy}</p>
                        {pitch.warmIntroPath && (
                          <p className="mt-2 rounded-lg border-l-2 border-amber-400/30 bg-amber-400/5 px-3 py-1.5 font-mono text-[0.68rem] text-amber-200/70">
                            Warm intro: {pitch.warmIntroPath}
                          </p>
                        )}
                      </CollapsibleSection>

                      {/* EMAIL TEMPLATE */}
                      <CollapsibleSection
                        title="EMAIL TEMPLATE"
                        icon={<Mail size={12} className="text-[#C4A048]" />}
                        isOpen={isSectionOpen(pitch.id, "email")}
                        onToggle={() => toggleSection(pitch.id, "email")}
                      >
                        <div className="relative">
                          <pre className="rounded-xl border border-white/10 bg-black/50 p-4 font-mono text-[0.72rem] leading-5 text-[#EDE8DC] whitespace-pre-wrap overflow-x-auto">
                            {pitch.emailTemplate}
                          </pre>
                          <Button
                            onClick={(e) => { e.stopPropagation(); copyToClipboard(pitch.emailTemplate, `email_${pitch.id}`); }}
                            className="absolute top-2 right-2 rounded-lg border border-white/10 bg-black/60 px-2 py-1 font-mono text-[0.56rem] text-[#7A9A82] hover:text-white hover:bg-black/80"
                          >
                            {copiedId === `email_${pitch.id}` ? <><Check size={10} className="mr-1 text-emerald-300" /> Copied!</> : <><Copy size={10} className="mr-1" /> Copy</>}
                          </Button>
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
                          <pre className="rounded-xl border border-white/10 bg-black/50 p-4 font-mono text-[0.72rem] leading-5 text-[#EDE8DC] whitespace-pre-wrap overflow-x-auto">
                            {pitch.callScript}
                          </pre>
                          <Button
                            onClick={(e) => { e.stopPropagation(); copyToClipboard(pitch.callScript, `call_${pitch.id}`); }}
                            className="absolute top-2 right-2 rounded-lg border border-white/10 bg-black/60 px-2 py-1 font-mono text-[0.56rem] text-[#7A9A82] hover:text-white hover:bg-black/80"
                          >
                            {copiedId === `call_${pitch.id}` ? <><Check size={10} className="mr-1 text-emerald-300" /> Copied!</> : <><Copy size={10} className="mr-1" /> Copy</>}
                          </Button>
                        </div>
                      </CollapsibleSection>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2 border-t border-white/5">
                        <Button
                          onClick={() => onDeployOutreach(pitch.id)}
                          className="rounded-xl border border-[#C4A048]/35 bg-[#C4A048]/12 px-4 py-2 font-mono text-[0.62rem] font-semibold uppercase text-[#EDE8DC] hover:bg-[#C4A048]/20"
                        >
                          <Send size={12} className="mr-1.5" /> Deploy Outreach
                        </Button>
                        {pitch.status === "draft" && (
                          <Button
                            onClick={() => onApprovePitch(pitch.id)}
                            className="rounded-xl border border-emerald-300/35 bg-emerald-400/12 px-4 py-2 font-mono text-[0.62rem] font-semibold uppercase text-emerald-100 hover:bg-emerald-400/20"
                          >
                            <Check size={12} className="mr-1.5" /> Approve
                          </Button>
                        )}
                        <Button
                          onClick={() => copyToClipboard(pitch.emailTemplate, `email_btn_${pitch.id}`)}
                          className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-2 font-mono text-[0.62rem] font-semibold uppercase text-[#EDE8DC] hover:bg-white/[0.06]"
                        >
                          {copiedId === `email_btn_${pitch.id}` ? <><Check size={12} className="mr-1.5 text-emerald-300" /> Copied!</> : <><Mail size={12} className="mr-1.5" /> Copy Email</>}
                        </Button>
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
        <span className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#7A9A82]">{title}</span>
        {show ? <ChevronUp size={12} className="text-[#7A9A82] ml-auto" /> : <ChevronDown size={12} className="text-[#7A9A82] ml-auto" />}
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
