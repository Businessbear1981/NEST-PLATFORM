'use client'

import { useState } from "react";
import {
  Mail, Phone, FileText, Send, Clock, CheckCircle, XCircle,
  ChevronDown, ChevronUp, Users, Target, Zap, Calendar,
  BarChart3, MessageSquare, Copy, AlertCircle
} from "lucide-react";

// ── Inlined types from eagleEyeDemo ─────────────────────────────

type TouchType =
  | "email_welcome"
  | "email_intel"
  | "call"
  | "content_drip"
  | "case_study"
  | "targeted_intel"
  | "direct_ask"
  | "close";

type TouchOutcome =
  | "sent"
  | "opened"
  | "clicked"
  | "replied"
  | "voicemail"
  | "connected"
  | "meeting_booked"
  | "no_answer"
  | "pending";

interface Touch {
  touchNumber: number;
  type: TouchType;
  label: string;
  content: string;
  outcome: TouchOutcome;
  date: string | null;
  notes: string;
}

interface BoxingOutProspect {
  id: string;
  signalId: string;
  pitchId: string | null;
  firmName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactTitle: string;
  source: string;
  currentTouch: number;
  status: "cold" | "warm" | "hot" | "meeting_booked" | "converted" | "recycled";
  touches: Touch[];
  emailOpens: number;
  emailClicks: number;
  nextTouchDate: string;
  nextTouchType: TouchType;
  notes: string;
  createdAt: string;
}

interface ContentItem {
  id: string;
  prospectId: string;
  type: "market_intel" | "case_study" | "trend_report" | "targeted_intel";
  title: string;
  body: string;
  status: "draft" | "approved" | "sent";
  scheduledFor: string;
}

// ── Inlined helpers ─────────────────────────────────────────────

const PROSPECT_STATUS_COLORS: Record<string, string> = {
  cold: "border-slate-400/40 bg-slate-500/15 text-slate-300",
  warm: "border-amber-300/40 bg-amber-300/15 text-amber-200",
  hot: "border-red-400/40 bg-red-500/15 text-red-200",
  meeting_booked: "border-emerald-300/40 bg-emerald-400/15 text-emerald-200",
  converted: "border-green-300/40 bg-green-400/15 text-green-200",
  recycled: "border-slate-400/40 bg-slate-500/15 text-slate-300",
};

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Demo data ───────────────────────────────────────────────────

const DEMO_BOXINGOUT_PROSPECTS: BoxingOutProspect[] = [
  {
    id: "prospect_001",
    signalId: "ma_001",
    pitchId: "pitch_001",
    firmName: "Summit Growth Partners",
    contactName: "Mike Chen",
    contactEmail: "mchen@summitgrowth.com",
    contactPhone: "(415) 555-0147",
    contactTitle: "Managing Partner",
    source: "Bullseye — NexGen HVAC pitch",
    currentTouch: 6,
    status: "warm",
    touches: [
      { touchNumber: 1, type: "email_welcome", label: "Welcome + Market Intel", content: "Intro email with Bay Area HVAC consolidation data", outcome: "opened", date: "2026-05-01T09:00:00Z", notes: "Opened twice, no reply" },
      { touchNumber: 2, type: "email_intel", label: "Market Intel Drop", content: "PE HVAC rollup trend report — 3 deals in Bay Area Q1 2026", outcome: "clicked", date: "2026-05-04T10:00:00Z", notes: "Clicked link to full report" },
      { touchNumber: 3, type: "call", label: "Cold Call #1", content: "Intro call — referenced email, mentioned NexGen opportunity", outcome: "voicemail", date: "2026-05-06T14:30:00Z", notes: "Left VM, mentioned ComfortFlow synergy angle" },
      { touchNumber: 4, type: "content_drip", label: "Content — HVAC Market Analysis", content: "Bernard-generated HVAC services M&A activity report", outcome: "opened", date: "2026-05-11T09:00:00Z", notes: "Opened, forwarded to team (tracking pixel on forward)" },
      { touchNumber: 5, type: "case_study", label: "Case Study", content: "How NEST structured a $40M services acquisition in 45 days", outcome: "clicked", date: "2026-05-15T10:00:00Z", notes: "Clicked through to case study. Spent 3 min on page." },
      { touchNumber: 6, type: "call", label: "Cold Call #2", content: "Follow up — he answered. 4 min call. Interested but busy through June.", outcome: "connected", date: "2026-05-18T15:00:00Z", notes: "CONNECTED. Said 'send me something specific.' Bullseye package going out." },
    ],
    emailOpens: 4,
    emailClicks: 2,
    nextTouchDate: "2026-05-25T09:00:00Z",
    nextTouchType: "targeted_intel",
    notes: "Connected on Call #2. Sending Bullseye NexGen package as targeted intel. Mike asked for specifics. This is warming up.",
    createdAt: "2026-05-01T08:00:00Z",
  },
  {
    id: "prospect_002",
    signalId: "ma_002",
    pitchId: "pitch_002",
    firmName: "Valor Healthcare Partners",
    contactName: "James Wright",
    contactEmail: "jwright@valorhcp.com",
    contactPhone: "(212) 555-0293",
    contactTitle: "Partner",
    source: "Bullseye — Cascadia Senior Services pitch",
    currentTouch: 3,
    status: "cold",
    touches: [
      { touchNumber: 1, type: "email_welcome", label: "Welcome + Healthcare Intel", content: "Intro + PNW healthcare M&A trends", outcome: "opened", date: "2026-05-10T09:00:00Z", notes: "Opened once" },
      { touchNumber: 2, type: "email_intel", label: "Market Intel Drop", content: "Home health reimbursement rate analysis — CMS 2026 outlook", outcome: "sent", date: "2026-05-13T10:00:00Z", notes: "No open detected yet" },
      { touchNumber: 3, type: "call", label: "Cold Call #1", content: "Intro call referencing Pacific Home Health portfolio", outcome: "no_answer", date: "2026-05-16T14:00:00Z", notes: "No answer, no voicemail option" },
    ],
    emailOpens: 1,
    emailClicks: 0,
    nextTouchDate: "2026-05-23T09:00:00Z",
    nextTouchType: "content_drip",
    notes: "Low engagement so far. Need to find better angle or alternate contact at Valor.",
    createdAt: "2026-05-10T08:00:00Z",
  },
  {
    id: "prospect_003",
    signalId: "cre_001",
    pitchId: "pitch_003",
    firmName: "Diversified Real Estate Capital",
    contactName: "Maria Gonzalez",
    contactEmail: "mgonzalez@drec.com",
    contactPhone: "(480) 555-0381",
    contactTitle: "Managing Director, Opportunistic Fund",
    source: "Bullseye — Fiesta Mall dark zone pitch",
    currentTouch: 8,
    status: "meeting_booked",
    touches: [
      { touchNumber: 1, type: "email_welcome", label: "Welcome + AZ Retail Intel", content: "Intro + Mesa retail repositioning trends", outcome: "opened", date: "2026-04-20T09:00:00Z", notes: "Opened, replied asking for more detail" },
      { touchNumber: 2, type: "email_intel", label: "Mesa TIF District Analysis", content: "Bernard-generated TIF subsidy analysis for Mesa", outcome: "clicked", date: "2026-04-23T10:00:00Z", notes: "Clicked, downloaded PDF" },
      { touchNumber: 3, type: "call", label: "Cold Call #1", content: "Referenced TIF analysis. She knew the property.", outcome: "connected", date: "2026-04-25T11:00:00Z", notes: "CONNECTED. 8 min call. She's looked at this site before but couldn't make equity math work. Interested in bond approach." },
      { touchNumber: 4, type: "content_drip", label: "Dark Zone Concept Paper", content: "Bernard-generated whitepaper: 'When Equity Fails, Bonds Prevail'", outcome: "clicked", date: "2026-04-30T09:00:00Z", notes: "Clicked, forwarded to investment committee (tracked)" },
      { touchNumber: 5, type: "case_study", label: "Bond-Financed Retail Conversion", content: "Case study: Similar dark zone conversion, $18M bond, 14-month execution", outcome: "clicked", date: "2026-05-05T10:00:00Z", notes: "Forwarded to 2 team members" },
      { touchNumber: 6, type: "call", label: "Cold Call #2", content: "Follow up on case study. She wants to meet.", outcome: "connected", date: "2026-05-08T14:00:00Z", notes: "CONNECTED. 12 min call. Wants to bring her IC chair to a meeting. Scheduling for May 28." },
      { touchNumber: 7, type: "targeted_intel", label: "Fiesta Mall Full Package", content: "Bullseye pitch + bond structure + TIF analysis + comparable conversions", outcome: "clicked", date: "2026-05-12T09:00:00Z", notes: "Full package sent. She confirmed receipt and shared with IC chair." },
      { touchNumber: 8, type: "direct_ask", label: "Meeting Confirmation", content: "Confirmed meeting May 28 — Maria + IC Chair + Sean + bond desk", outcome: "replied", date: "2026-05-15T10:00:00Z", notes: "MEETING BOOKED: May 28, 2pm PT. Video call. Maria + Tom Reeves (IC Chair)." },
    ],
    emailOpens: 8,
    emailClicks: 5,
    nextTouchDate: "2026-05-28T14:00:00Z",
    nextTouchType: "close",
    notes: "MEETING MAY 28. Maria is sold on the concept. IC Chair Tom Reeves needs to see the bond structure math. Prep: full Bullseye package + Bond Desk proforma + TIF subsidy numbers.",
    createdAt: "2026-04-20T08:00:00Z",
  },
  {
    id: "prospect_004",
    signalId: "ma_003",
    pitchId: null,
    firmName: "Greenfield Industrial Partners",
    contactName: "David Park",
    contactEmail: "dpark@greenfieldip.com",
    contactPhone: "(214) 555-0512",
    contactTitle: "Senior Partner",
    source: "PE Landscape — Lone Star Waste signal",
    currentTouch: 1,
    status: "cold",
    touches: [
      { touchNumber: 1, type: "email_welcome", label: "Welcome + TX Waste Intel", content: "Intro + Texas waste services M&A landscape report", outcome: "pending", date: "2026-05-20T09:00:00Z", notes: "Queued for send today" },
    ],
    emailOpens: 0,
    emailClicks: 0,
    nextTouchDate: "2026-05-23T10:00:00Z",
    nextTouchType: "email_intel",
    notes: "New prospect. Greenfield is building TX waste platform — EcoHaul + Metro Disposal. Lone Star is the missing piece. Bullseye pitch being generated.",
    createdAt: "2026-05-20T08:00:00Z",
  },
];

const DEMO_CONTENT_QUEUE: ContentItem[] = [
  {
    id: "content_001",
    prospectId: "prospect_001",
    type: "targeted_intel",
    title: "NexGen HVAC — Full Bullseye Package for Summit Growth",
    body: "Complete pitch deck: NexGen HVAC acquisition thesis, ComfortFlow bolt-on synergies, $35M bond structure, 45-day close timeline, exit analysis.",
    status: "approved",
    scheduledFor: "2026-05-25T09:00:00Z",
  },
  {
    id: "content_002",
    prospectId: "prospect_002",
    type: "market_intel",
    title: "PNW Home Health M&A: Q2 2026 Activity Report",
    body: "Bernard-generated analysis of home health M&A activity in Pacific Northwest. 4 transactions closed in Q1, average multiple 9.1x. Medicare reimbursement stabilization creating acquisition window.",
    status: "draft",
    scheduledFor: "2026-05-23T09:00:00Z",
  },
  {
    id: "content_003",
    prospectId: "prospect_004",
    type: "trend_report",
    title: "TX Waste Services Consolidation — PE Landscape 2026",
    body: "Bernard-generated trend report: 3 PE-backed platforms actively rolling up TX waste. Fund sizes, deployment rates, target profiles. Greenfield IP leading with 4 acquisitions.",
    status: "draft",
    scheduledFor: "2026-05-26T09:00:00Z",
  },
  {
    id: "content_004",
    prospectId: "prospect_003",
    type: "case_study",
    title: "Bond-Financed Retail Conversion: The Gateway Project",
    body: "Detailed case study of a similar dark zone retail conversion. $18M bond, 14-month execution, 2.1x return. Includes bond structure, timeline, TIF subsidy mechanics.",
    status: "sent",
    scheduledFor: "2026-05-05T10:00:00Z",
  },
];

// ── Outcome colors ───────────────────────────────────────────────

const OUTCOME_COLORS: Record<TouchOutcome, string> = {
  sent: "text-slate-400 bg-slate-500/15 border-slate-400/30",
  opened: "text-amber-200 bg-amber-400/15 border-amber-300/30",
  clicked: "text-cyan-200 bg-cyan-400/15 border-cyan-300/30",
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
  market_intel: "border-cyan-300/30 bg-cyan-400/10 text-cyan-200",
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

export default function BoxingOutTracker() {
  const [expandedProspect, setExpandedProspect] = useState<string | null>(null);
  const [showCadence, setShowCadence] = useState(false);

  const prospects = DEMO_BOXINGOUT_PROSPECTS;
  const contentQueue = DEMO_CONTENT_QUEUE;

  const onLogCall = (prospectId: string) => { console.log("Log call:", prospectId); };
  const onSendNext = (prospectId: string) => { console.log("Send next:", prospectId); };
  const onApproveContent = (contentId: string) => { console.log("Approve:", contentId); };
  const onSendContent = (contentId: string) => { console.log("Send content:", contentId); };

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
        <button
          onClick={() => setShowCadence(!showCadence)}
          className="rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 font-mono text-[0.62rem] uppercase text-slate-300 hover:bg-white/[0.06] flex items-center"
        >
          {showCadence ? <ChevronUp size={13} className="mr-1" /> : <ChevronDown size={13} className="mr-1" />}
          Cadence Reference
        </button>
      </div>

      {/* Cadence Reference (collapsible) */}
      {showCadence && (
        <div className="overflow-hidden transition-all">
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
        </div>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-6 gap-3">
        {[
          { label: "Active", value: activeCount, tone: "text-white", icon: Users },
          { label: "Hot", value: hotCount, tone: "text-red-200", icon: Zap },
          { label: "Meetings", value: meetingsCount, tone: "text-amber-100", icon: Calendar },
          { label: "Converted", value: convertedCount, tone: "text-emerald-200", icon: CheckCircle },
          { label: "Content Queue", value: contentReady, tone: "text-cyan-200", icon: FileText },
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
        <div className="flex items-center gap-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-cyan-200">
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
          <button
            onClick={onLogCall}
            className="rounded-lg border border-green-300/25 bg-green-400/10 px-3 py-1.5 font-mono text-[0.62rem] uppercase text-green-200 hover:bg-green-400/20 flex items-center"
          >
            <Phone size={11} className="mr-1" /> Log Call
          </button>
          <button
            onClick={onSendNext}
            className="rounded-lg border border-cyan-300/25 bg-cyan-400/10 px-3 py-1.5 font-mono text-[0.62rem] uppercase text-cyan-200 hover:bg-cyan-400/20 flex items-center"
          >
            <Send size={11} className="mr-1" /> Send Next
          </button>
        </div>
        <button
          onClick={onToggle}
          className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[0.62rem] uppercase text-slate-400 hover:bg-white/[0.06] flex items-center"
        >
          {expanded ? <ChevronUp size={11} className="mr-1" /> : <ChevronDown size={11} className="mr-1" />}
          {expanded ? "Hide" : "History"}
        </button>
      </div>

      {/* Expanded Touch Timeline */}
      {expanded && (
        <div className="overflow-hidden transition-all">
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
        </div>
      )}
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
            <button
              onClick={onApprove}
              className="rounded-lg border border-amber-300/25 bg-amber-400/10 px-3 py-1 font-mono text-[0.56rem] uppercase text-amber-200 hover:bg-amber-400/20 flex items-center"
            >
              <CheckCircle size={10} className="mr-1" /> Approve
            </button>
          )}
          <button
            onClick={onSend}
            className="rounded-lg border border-emerald-300/25 bg-emerald-400/10 px-3 py-1 font-mono text-[0.56rem] uppercase text-emerald-200 hover:bg-emerald-400/20 flex items-center"
          >
            <Send size={10} className="mr-1" /> Send Now
          </button>
        </div>
      )}
    </div>
  );
}
