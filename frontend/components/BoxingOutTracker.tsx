"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Phone, FileText, Send, Clock, CheckCircle, XCircle,
  ChevronDown, ChevronUp, Users, Target, Zap, Calendar,
  BarChart3, MessageSquare, Copy, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BoxingOutProspect, ContentItem, Touch, TouchOutcome,
  PROSPECT_STATUS_COLORS, formatDate
} from "@/shared/eagleEyeDemo";

// ── Props ────────────────────────────────────────────────────────

interface BoxingOutTrackerProps {
  prospects: BoxingOutProspect[];
  contentQueue: ContentItem[];
  onLogCall: (prospectId: string) => void;
  onSendNext: (prospectId: string) => void;
  onApproveContent: (contentId: string) => void;
  onSendContent: (contentId: string) => void;
}

// ── Outcome colors ───────────────────────────────────────────────

const OUTCOME_COLORS: Record<TouchOutcome, string> = {
  sent: "text-slate-400 bg-slate-500/15 border-slate-400/30",
  opened: "text-amber-200 bg-amber-400/15 border-amber-300/30",
  clicked: "text-[#E8C87A] bg-[#C4A048]/15 border-[#C4A048]/30",
  replied: "text-emerald-200 bg-emerald-400/15 border-emerald-300/30",
  voicemail: "text-slate-300 bg-slate-500/15 border-slate-400/30",
  connected: "text-green-200 bg-green-400/15 border-green-300/30",
  meeting_booked: "text-amber-100 bg-amber-400/20 border-amber-300/40",
  no_answer: "text-red-300 bg-red-500/15 border-red-400/30",
  pending: "text-slate-500 bg-slate-600/15 border-slate-500/30",
};

const TOUCH_TYPE_ICONS: Record<string, typeof Mail> = {
  email_welcome: Mail,
  email_intel: Mail,
  call: Phone,
  content_drip: FileText,
  case_study: FileText,
  targeted_intel: Target,
  direct_ask: Zap,
  close: CheckCircle,
};

const CONTENT_TYPE_COLORS: Record<string, string> = {
  market_intel: "border-[#C4A048]/30 bg-[#C4A048]/10 text-[#E8C87A]",
  case_study: "border-emerald-300/30 bg-emerald-400/10 text-emerald-200",
  trend_report: "border-amber-300/30 bg-amber-400/10 text-amber-200",
  targeted_intel: "border-red-300/30 bg-red-400/10 text-red-200",
};

// ── Cadence Reference ────────────────────────────────────────────

const CADENCE_STEPS = [
  { num: 1, label: "Welcome Email", type: "email" },
  { num: 2, label: "Market Intel", type: "email" },
  { num: 3, label: "Call #1", type: "call" },
  { num: 4, label: "Content Drip", type: "email" },
  { num: 5, label: "Case Study", type: "email" },
  { num: 6, label: "Call #2", type: "call" },
  { num: 7, label: "Targeted Intel", type: "email" },
  { num: 8, label: "Direct Ask", type: "email" },
  { num: 9, label: "Call #3", type: "call" },
  { num: 10, label: "Close / Recycle", type: "close" },
];

// ── Main Component ───────────────────────────────────────────────

export default function BoxingOutTracker({
  prospects,
  contentQueue,
  onLogCall,
  onSendNext,
  onApproveContent,
  onSendContent,
}: BoxingOutTrackerProps) {
  const [expandedProspect, setExpandedProspect] = useState<string | null>(null);
  const [showCadence, setShowCadence] = useState(false);

  // Stats
  const activeCount = prospects.filter(p => !["converted", "recycled"].includes(p.status)).length;
  const hotCount = prospects.filter(p => p.status === "hot").length;
  const meetingsCount = prospects.filter(p => p.status === "meeting_booked").length;
  const convertedCount = prospects.filter(p => p.status === "converted").length;
  const contentReady = contentQueue.filter(c => c.status === "approved" || c.status === "draft").length;
  const avgTouches = prospects.length > 0
    ? Math.round(prospects.reduce((sum, p) => sum + p.currentTouch, 0) / prospects.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-amber-100">
            <Target size={17} /> Boxing Out — Contact Cadence Engine
          </div>
          <p className="mt-1 text-sm text-slate-400">
            8-10 touches to close. Stay around the basket. Every prospect tracked, every touch logged.
          </p>
        </div>
        <Button
          onClick={() => setShowCadence(!showCadence)}
          className="rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 font-mono text-[0.62rem] uppercase text-slate-300 hover:bg-white/[0.06]"
        >
          {showCadence ? <ChevronUp size={13} className="mr-1" /> : <ChevronDown size={13} className="mr-1" />}
          Cadence Reference
        </Button>
      </div>

      {/* Cadence Reference (collapsible) */}
      <AnimatePresence>
        {showCadence && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-amber-300/20 bg-amber-400/5 p-4">
              <div className="grid grid-cols-5 gap-2">
                {CADENCE_STEPS.map(step => (
                  <div key={step.num} className="flex items-center gap-2 rounded-lg border border-white/5 bg-black/20 px-2 py-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400/20 font-mono text-[0.56rem] font-bold text-amber-200">
                      {step.num}
                    </span>
                    <span className="font-mono text-[0.56rem] text-slate-300">{step.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Bar */}
      <div className="grid grid-cols-6 gap-3">
        {[
          { label: "Active", value: activeCount, tone: "text-white", icon: Users },
          { label: "Hot", value: hotCount, tone: "text-red-200", icon: Zap },
          { label: "Meetings", value: meetingsCount, tone: "text-amber-100", icon: Calendar },
          { label: "Converted", value: convertedCount, tone: "text-emerald-200", icon: CheckCircle },
          { label: "Content Queue", value: contentReady, tone: "text-[#E8C87A]", icon: FileText },
          { label: "Avg Touches", value: avgTouches, tone: "text-slate-200", icon: BarChart3 },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
            <div className="flex items-center gap-1.5">
              <stat.icon size={11} className="text-slate-500" />
              <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-slate-500">{stat.label}</p>
            </div>
            <p className={`mt-1 font-mono text-lg font-semibold ${stat.tone}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Prospect Cards */}
      <div className="space-y-3">
        {prospects.map(prospect => (
          <ProspectCard
            key={prospect.id}
            prospect={prospect}
            expanded={expandedProspect === prospect.id}
            onToggle={() => setExpandedProspect(expandedProspect === prospect.id ? null : prospect.id)}
            onLogCall={() => onLogCall(prospect.id)}
            onSendNext={() => onSendNext(prospect.id)}
          />
        ))}
      </div>

      {/* Content Queue */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#E8C87A]">
          <FileText size={14} /> Content Queue — Bernard Auto-Generated
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {contentQueue.map(item => (
            <ContentCard
              key={item.id}
              item={item}
              onApprove={() => onApproveContent(item.id)}
              onSend={() => onSendContent(item.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Prospect Card ────────────────────────────────────────────────

function ProspectCard({
  prospect,
  expanded,
  onToggle,
  onLogCall,
  onSendNext,
}: {
  prospect: BoxingOutProspect;
  expanded: boolean;
  onToggle: () => void;
  onLogCall: () => void;
  onSendNext: () => void;
}) {
  const progressPct = (prospect.currentTouch / 10) * 100;
  const lastTouch = prospect.touches[prospect.touches.length - 1];
  const isMeetingBooked = prospect.status === "meeting_booked";

  return (
    <article
      className={`rounded-2xl border bg-black/35 p-4 transition ${
        isMeetingBooked
          ? "border-amber-300/40 shadow-[0_0_20px_rgba(196,160,72,0.15)]"
          : "border-white/10 hover:border-white/20"
      }`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-mono text-sm font-semibold text-white">{prospect.firmName}</h3>
            <span className={`rounded-full border px-2 py-0.5 font-mono text-[0.56rem] font-semibold uppercase ${PROSPECT_STATUS_COLORS[prospect.status]}`}>
              {prospect.status.replace("_", " ")}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-slate-400">
            {prospect.contactName} — {prospect.contactTitle}
          </p>
          <p className="mt-1 font-mono text-[0.56rem] text-slate-500">
            Source: {prospect.source}
          </p>
        </div>

        {/* Touch progress + engagement */}
        <div className="text-right space-y-1">
          <p className="font-mono text-sm font-semibold text-white">
            Touch {prospect.currentTouch}/10
          </p>
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex items-center justify-end gap-2 font-mono text-[0.56rem] text-slate-500">
            <span><Mail size={9} className="inline" /> {prospect.emailOpens} opens</span>
            <span>{prospect.emailClicks} clicks</span>
          </div>
        </div>
      </div>

      {/* Last / Next touch */}
      <div className="mt-3 flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2">
        <div className="flex-1">
          <p className="font-mono text-[0.52rem] uppercase tracking-[0.12em] text-slate-500">Last Touch</p>
          <p className="font-mono text-[0.68rem] text-slate-300">
            {lastTouch?.label} — {lastTouch?.date ? formatDate(lastTouch.date) : "—"}
            {lastTouch && (
              <span className={`ml-2 inline-block rounded-full border px-1.5 py-0 font-mono text-[0.5rem] uppercase ${OUTCOME_COLORS[lastTouch.outcome]}`}>
                {lastTouch.outcome.replace("_", " ")}
              </span>
            )}
          </p>
        </div>
        <div className="flex-1">
          <p className="font-mono text-[0.52rem] uppercase tracking-[0.12em] text-slate-500">Next Touch</p>
          <p className="font-mono text-[0.68rem] text-amber-100">
            {prospect.nextTouchType.replace("_", " ")} — {formatDate(prospect.nextTouchDate)}
          </p>
        </div>
      </div>

      {/* Notes */}
      {prospect.notes && (
        <p className="mt-2 rounded-lg border-l-2 border-amber-400/30 bg-amber-400/5 px-3 py-1.5 font-mono text-[0.68rem] text-amber-100/80">
          {prospect.notes}
        </p>
      )}

      {/* Actions + Expand */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            onClick={onLogCall}
            className="rounded-lg border border-green-300/25 bg-green-400/10 px-3 py-1.5 font-mono text-[0.62rem] uppercase text-green-200 hover:bg-green-400/20"
          >
            <Phone size={11} className="mr-1" /> Log Call
          </Button>
          <Button
            onClick={onSendNext}
            className="rounded-lg border border-[#C4A048]/25 bg-[#C4A048]/10 px-3 py-1.5 font-mono text-[0.62rem] uppercase text-[#E8C87A] hover:bg-[#C4A048]/20"
          >
            <Send size={11} className="mr-1" /> Send Next
          </Button>
        </div>
        <Button
          onClick={onToggle}
          className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[0.62rem] uppercase text-slate-400 hover:bg-white/[0.06]"
        >
          {expanded ? <ChevronUp size={11} className="mr-1" /> : <ChevronDown size={11} className="mr-1" />}
          {expanded ? "Hide" : "History"}
        </Button>
      </div>

      {/* Expanded Touch Timeline */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 border-t border-white/5 pt-4">
              <p className="mb-3 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Touch Timeline
              </p>
              <div className="relative ml-3 space-y-3 border-l border-white/10 pl-5">
                {prospect.touches.map(touch => (
                  <TouchTimelineItem key={touch.touchNumber} touch={touch} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}

// ── Touch Timeline Item ──────────────────────────────────────────

function TouchTimelineItem({ touch }: { touch: Touch }) {
  const Icon = TOUCH_TYPE_ICONS[touch.type] || MessageSquare;

  return (
    <div className="relative">
      {/* Dot on timeline */}
      <div className="absolute -left-[1.625rem] top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-white/20 bg-[#0D2218]">
        <Icon size={8} className="text-slate-400" />
      </div>

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[0.62rem] font-semibold text-white">
              #{touch.touchNumber} — {touch.label}
            </span>
            <span className={`rounded-full border px-1.5 py-0 font-mono text-[0.5rem] uppercase ${OUTCOME_COLORS[touch.outcome]}`}>
              {touch.outcome.replace("_", " ")}
            </span>
          </div>
          {touch.notes && (
            <p className="mt-0.5 font-mono text-[0.62rem] text-slate-500">{touch.notes}</p>
          )}
        </div>
        <span className="font-mono text-[0.56rem] text-slate-600">
          {touch.date ? formatDate(touch.date) : "—"}
        </span>
      </div>
    </div>
  );
}

// ── Content Queue Card ───────────────────────────────────────────

function ContentCard({
  item,
  onApprove,
  onSend,
}: {
  item: ContentItem;
  onApprove: () => void;
  onSend: () => void;
}) {
  const typeColor = CONTENT_TYPE_COLORS[item.type] || "border-white/10 bg-white/5 text-slate-300";

  return (
    <div className="rounded-xl border border-white/10 bg-black/35 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`rounded-full border px-2 py-0.5 font-mono text-[0.52rem] uppercase ${typeColor}`}>
              {item.type.replace("_", " ")}
            </span>
            <span className={`rounded-full border px-2 py-0.5 font-mono text-[0.52rem] uppercase ${
              item.status === "sent"
                ? "border-green-300/30 bg-green-400/10 text-green-200"
                : item.status === "approved"
                ? "border-amber-300/30 bg-amber-400/10 text-amber-200"
                : "border-slate-400/30 bg-slate-500/10 text-slate-300"
            }`}>
              {item.status}
            </span>
          </div>
          <h4 className="mt-1.5 font-mono text-[0.72rem] font-semibold text-white">{item.title}</h4>
          <p className="mt-1 font-mono text-[0.62rem] text-slate-400 line-clamp-2">{item.body}</p>
          <p className="mt-1.5 font-mono text-[0.56rem] text-slate-600">
            <Clock size={9} className="mr-1 inline" />
            Scheduled: {formatDate(item.scheduledFor)}
          </p>
        </div>
      </div>
      {item.status !== "sent" && (
        <div className="mt-3 flex gap-2">
          {item.status === "draft" && (
            <Button
              onClick={onApprove}
              className="rounded-lg border border-amber-300/25 bg-amber-400/10 px-3 py-1 font-mono text-[0.56rem] uppercase text-amber-200 hover:bg-amber-400/20"
            >
              <CheckCircle size={10} className="mr-1" /> Approve
            </Button>
          )}
          <Button
            onClick={onSend}
            className="rounded-lg border border-emerald-300/25 bg-emerald-400/10 px-3 py-1 font-mono text-[0.56rem] uppercase text-emerald-200 hover:bg-emerald-400/20"
          >
            <Send size={10} className="mr-1" /> Send Now
          </Button>
        </div>
      )}
    </div>
  );
}
