"use client";
import React, { useState } from "react";
import { AlertTriangle, CheckCircle, Clock, FileText, RadioTower, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MoodysReconFeed } from "./MoodysReconFeed";
import SPReconFeed from "./SPReconFeed";
import MethodologyVersionDiff from "./MethodologyVersionDiff";

interface RatingAction {
  id: string;
  issuer: string;
  agency: "Moody's" | "S&P";
  date: Date;
  action: "upgrade" | "downgrade" | "affirm" | "watch";
  oldRating: string;
  newRating: string;
  outlook: "positive" | "stable" | "negative";
  rationale: string;
  affectedBonds: string[];
}

interface CreditMemo {
  id: string;
  issuer: string;
  date: Date;
  rating: string;
  outlook: string;
  strengths: string[];
  risks: string[];
  keyMetrics: Record<string, string>;
  recommendation: "buy" | "hold" | "sell";
}

const DEMO_RATING_ACTIONS: RatingAction[] = [
  {
    id: "ra-001",
    issuer: "NEST Mixed-Use Portfolio",
    agency: "Moody's",
    date: new Date(Date.now() - 86400000),
    action: "affirm",
    oldRating: "Baa1",
    newRating: "Baa1",
    outlook: "stable",
    rationale: "Strong occupancy trends and stable cash flows support current rating.",
    affectedBonds: ["bond-001"],
  },
  {
    id: "ra-002",
    issuer: "NEST Hospitality Portfolio",
    agency: "S&P",
    date: new Date(Date.now() - 172800000),
    action: "watch",
    oldRating: "Ba2",
    newRating: "Ba2",
    outlook: "negative",
    rationale: "Elevated debt levels and market softness warrant closer monitoring.",
    affectedBonds: ["bond-002"],
  },
  {
    id: "ra-003",
    issuer: "NEST CCRC Portfolio",
    agency: "Moody's",
    date: new Date(Date.now() - 259200000),
    action: "upgrade",
    oldRating: "Baa3",
    newRating: "Baa2",
    outlook: "stable",
    rationale: "Improved occupancy and operational efficiency drive upgrade.",
    affectedBonds: ["bond-004"],
  },
];

const DEMO_CREDIT_MEMOS: CreditMemo[] = [
  {
    id: "cm-001",
    issuer: "NEST Mixed-Use Portfolio",
    date: new Date(Date.now() - 604800000),
    rating: "Baa1",
    outlook: "Stable",
    strengths: ["Diversified tenant base across retail and office", "Strong location in high-traffic market", "Experienced management team", "Stable cash flows"],
    risks: ["Retail sector headwinds", "Office space oversupply in market", "Interest rate sensitivity"],
    keyMetrics: { DSCR: "1.45x", LTV: "62%", Occupancy: "94%", "Avg Lease Term": "5.2 years" },
    recommendation: "buy",
  },
  {
    id: "cm-002",
    issuer: "NEST Hospitality Portfolio",
    date: new Date(Date.now() - 1209600000),
    rating: "Ba2",
    outlook: "Negative",
    strengths: ["Premium brand positioning", "Strong RevPAR growth", "Renovation completed"],
    risks: ["Travel demand uncertainty", "Elevated leverage", "Labor cost inflation", "Competitive market pressure"],
    keyMetrics: { DSCR: "1.15x", LTV: "75%", Occupancy: "78%", RevPAR: "$185" },
    recommendation: "hold",
  },
];

export default function RatingIntelligence() {
  const [selectedAction, setSelectedAction] = useState<RatingAction | null>(DEMO_RATING_ACTIONS[0]);
  const [memoDraft, setMemoDraft] = useState("No memo draft routed yet.");
  const [reconPulse, setReconPulse] = useState(0);
  const reconEvents = [
    "Moody's office-watch update received",
    "S&P hospitality stress trigger received",
    "Methodology threshold delta synced to affected-deal queue",
  ];
  const currentReconEvent = reconPulse === 0 ? "Awaiting next agency feed pulse." : reconEvents[(reconPulse - 1) % reconEvents.length];

  const getActionColor = (action: RatingAction["action"]) => {
    switch (action) {
      case "upgrade":
        return "bg-emerald-500/20 text-emerald-100 border-emerald-500/30";
      case "downgrade":
        return "bg-red-500/20 text-red-100 border-red-500/30";
      case "watch":
        return "bg-yellow-500/20 text-yellow-100 border-yellow-500/30";
      case "affirm":
        return "bg-blue-500/20 text-blue-100 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-100 border-gray-500/30";
    }
  };

  const getOutlookIcon = (outlook: string) => {
    switch (outlook) {
      case "positive":
        return <TrendingUp className="h-4 w-4 text-emerald-400" />;
      case "negative":
        return <TrendingDown className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-cyan-300/20 bg-slate-950/80 p-6 shadow-[0_0_50px_rgba(34,211,238,0.08)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="flex items-center gap-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-cyan-200">
              <RadioTower size={14} /> Rating Intelligence & Recon · working demo console
            </p>
            <h1 className="mt-2 text-3xl font-bold text-foreground">Rating Intelligence & Recon</h1>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-muted-foreground">
              Moody's and S&P recon feeds, rating actions, memo routing, and methodology-diff rescoring are exposed as separate interactive workflows instead of static cards.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-slate-500">Actions</p>
              <p className="text-lg font-semibold text-cyan-100">{DEMO_RATING_ACTIONS.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-slate-500">Memos</p>
              <p className="text-lg font-semibold text-amber-100">{DEMO_CREDIT_MEMOS.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-slate-500">Mode</p>
              <p className="text-lg font-semibold text-emerald-100">LIVE</p>
            </div>
          </div>
        </div>
      </div>

      <Card className="border-cyan-300/20 bg-[#06111d]/90 p-4 text-slate-100">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="flex items-center gap-2 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-cyan-200">
              <RadioTower size={14} /> Recon subscription pulse
            </p>
            <p className="mt-1 text-sm text-slate-300">
              Pulse {reconPulse}: {currentReconEvent}
            </p>
          </div>
          <Button
            type="button"
            onClick={() => setReconPulse((current) => current + 1)}
            className="w-fit bg-cyan-600 text-white hover:bg-cyan-500"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Pulse Recon Subscription
          </Button>
        </div>
      </Card>

      <Tabs defaultValue="actions" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="moodys">Moody's</TabsTrigger>
          <TabsTrigger value="sp">S&P</TabsTrigger>
          <TabsTrigger value="memos">Memos</TabsTrigger>
          <TabsTrigger value="methodology">Methodology</TabsTrigger>
          <TabsTrigger value="routing">Routing</TabsTrigger>
        </TabsList>

        <TabsContent value="actions" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="h-fit border-border p-4 lg:col-span-1">
              <h2 className="mb-3 text-sm font-semibold text-foreground">Recent Actions</h2>
              <div className="space-y-2">
                {DEMO_RATING_ACTIONS.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => setSelectedAction(action)}
                    className={`w-full rounded-lg border p-3 text-left transition-all ${
                      selectedAction?.id === action.id ? "border-cyan-500/50 bg-cyan-500/10" : "border-border hover:border-border/80 hover:bg-muted/30"
                    }`}
                  >
                    <div className="mb-1 flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-muted-foreground">{action.agency}</p>
                        <p className="truncate text-sm font-semibold text-foreground">{action.issuer}</p>
                      </div>
                      <Badge variant="outline" className={`whitespace-nowrap text-xs ${getActionColor(action.action)}`}>
                        {action.action.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{action.date.toLocaleDateString()}</p>
                  </button>
                ))}
              </div>
            </Card>

            {selectedAction && (
              <Card className="border-cyan-500/30 bg-cyan-500/5 p-6 lg:col-span-2">
                <div className="space-y-6">
                  <div>
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-foreground">{selectedAction.issuer}</h3>
                        <p className="text-sm text-muted-foreground">{selectedAction.agency} • {selectedAction.date.toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getOutlookIcon(selectedAction.outlook)}
                        <Badge variant="outline" className={`text-xs ${getActionColor(selectedAction.action)}`}>{selectedAction.action.toUpperCase()}</Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 rounded-lg bg-muted/30 p-4">
                      <div>
                        <p className="mb-1 text-xs text-muted-foreground">Previous Rating</p>
                        <p className="text-2xl font-bold text-foreground">{selectedAction.oldRating}</p>
                      </div>
                      <div className="flex items-center justify-center">
                        {selectedAction.action === "upgrade" ? <TrendingUp className="h-6 w-6 text-emerald-400" /> : selectedAction.action === "downgrade" ? <TrendingDown className="h-6 w-6 text-red-400" /> : <span className="text-muted-foreground">→</span>}
                      </div>
                      <div>
                        <p className="mb-1 text-xs text-muted-foreground">New Rating</p>
                        <p className="text-2xl font-bold text-foreground">{selectedAction.newRating}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-foreground">Rationale</h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">{selectedAction.rationale}</p>
                  </div>

                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-foreground">Affected Bonds</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedAction.affectedBonds.map((bond) => <Badge key={bond} variant="secondary">{bond}</Badge>)}
                    </div>
                  </div>

                  <Button
                    className="bg-cyan-600 text-white hover:bg-cyan-500"
                    onClick={() => setMemoDraft(`${selectedAction.agency} ${selectedAction.action} action for ${selectedAction.issuer} routed into credit memo update queue.`)}
                  >
                    <FileText className="mr-2 h-4 w-4" /> Route Action to Memo Draft
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="moodys" className="mt-4">
          <MoodysReconFeed />
        </TabsContent>

        <TabsContent value="sp" className="mt-4">
          <SPReconFeed />
        </TabsContent>

        <TabsContent value="memos" className="mt-4 space-y-4">
          {DEMO_CREDIT_MEMOS.map((memo) => (
            <Card key={memo.id} className="border-border p-6">
              <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
                <div><p className="mb-1 text-xs text-muted-foreground">Issuer</p><p className="text-lg font-bold text-foreground">{memo.issuer}</p></div>
                <div><p className="mb-1 text-xs text-muted-foreground">Rating</p><p className="text-lg font-bold text-amber-400">{memo.rating}</p></div>
                <div><p className="mb-1 text-xs text-muted-foreground">Outlook</p><p className="text-lg font-bold text-blue-400">{memo.outlook}</p></div>
                <div><p className="mb-1 text-xs text-muted-foreground">Recommendation</p><Badge className={memo.recommendation === "buy" ? "bg-emerald-500/20 text-emerald-100" : memo.recommendation === "hold" ? "bg-yellow-500/20 text-yellow-100" : "bg-red-500/20 text-red-100"}>{memo.recommendation.toUpperCase()}</Badge></div>
              </div>

              <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-emerald-400">Strengths</h4>
                  <ul className="space-y-2">{memo.strengths.map((strength) => <li key={strength} className="flex items-start gap-2 text-sm text-foreground"><CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" /><span>{strength}</span></li>)}</ul>
                </div>
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-red-400">Risks</h4>
                  <ul className="space-y-2">{memo.risks.map((risk) => <li key={risk} className="flex items-start gap-2 text-sm text-foreground"><AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" /><span>{risk}</span></li>)}</ul>
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-sm font-semibold text-foreground">Key Metrics</h4>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {Object.entries(memo.keyMetrics).map(([key, value]) => <div key={key} className="rounded-lg bg-muted/30 p-3"><p className="mb-1 text-xs text-muted-foreground">{key}</p><p className="text-lg font-bold text-cyan-400">{value}</p></div>)}
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="methodology" className="mt-4">
          <MethodologyVersionDiff />
        </TabsContent>

        <TabsContent value="routing" className="mt-4">
          <Card className="border-emerald-300/20 bg-emerald-400/5 p-6">
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-emerald-200">Memo routing status</p>
            <h3 className="mt-2 text-xl font-semibold text-foreground">Credit memo queue is interactive</h3>
            <p className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-muted-foreground">{memoDraft}</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Use the Actions tab to route a rating event, then return here to verify the visible state change. Moody's, S&P, and methodology feeds each maintain their own acknowledgement/routing state.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
