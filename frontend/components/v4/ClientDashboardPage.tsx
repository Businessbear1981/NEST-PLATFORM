"use client";
/**
 * Client Dashboard — the borrower/sponsor's view of their deal.
 *
 * Shows: readiness score, rating trajectory, action items, blockers,
 * questionnaire, document review, and Bernard concierge.
 *
 * The client is a PARTICIPANT — they see exactly what moves the needle
 * and what's blocking their deal from advancing.
 */
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const API = "";

export default function ClientDashboardPage() {
  const [dealId] = useState("jacaranda-2026");
  const [dashboard, setDashboard] = useState<any>(null);
  const [questionnaire, setQuestionnaire] = useState<any>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [bernardMessages, setBernardMessages] = useState<any[]>([
    { role: "bernard", message: "Welcome to your NEST Advisors deal portal. I'm Bernard — I'll help you understand exactly where your deal stands and what's needed to move it forward. Ask me anything." },
  ]);
  const [bernardInput, setBernardInput] = useState("");
  const [bernardLoading, setBernardLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Mock readiness and rating data (would come from real deal)
  const readiness = {
    score: 68,
    docs_complete: 3,
    docs_required: 7,
    questions_answered: 8,
    questions_total: 22,
    rating_current: "BBB-",
    rating_target: "A",
    blockers: [
      { id: 1, type: "document", severity: "critical", message: "Audited financial statements needed — 2023 and 2024", action: "Upload via Documents tab" },
      { id: 2, type: "financial", severity: "warning", message: "DSCR at 1.15x — needs to reach 1.20x for investment grade covenant", action: "Increase NOI or reduce debt service" },
      { id: 3, type: "question", severity: "info", message: "Sponsor track record details needed for credit memo", action: "Answer in Questionnaire tab" },
    ],
    improvements: [
      { lever: "Add bond insurance (BAM or Assured Guaranty)", impact: "Rating lifts to AA — saves ~80bps in coupon", effort: "Application + 15-40bps annual premium" },
      { lever: "Increase equity contribution from 25% to 30%", impact: "Improves LTV and leverage ratios — potential 1 notch upgrade", effort: "Additional $2.5M sponsor equity" },
      { lever: "Fund DSRF at MADS", impact: "Reserve provides bondholder cushion — positive for rating", effort: "~$1.2M set aside at closing from bond proceeds" },
    ],
  };

  useEffect(() => {
    fetch(`${API}/api/client/${dealId}/dashboard`)
      .then(r => r.json())
      .then(d => { if (d.success) setDashboard(d.data); })
      .catch(() => {});
  }, [dealId]);

  async function sendBernardMessage() {
    if (!bernardInput.trim()) return;
    const msg = bernardInput;
    setBernardInput("");
    setBernardMessages(prev => [...prev, { role: "client", message: msg }]);
    setBernardLoading(true);

    try {
      const res = await fetch(`${API}/api/client/${dealId}/bernard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      if (data.success) {
        setBernardMessages(prev => [...prev, {
          role: "bernard",
          message: data.data.response,
          note: data.data.note,
        }]);
      }
    } catch {
      setBernardMessages(prev => [...prev, { role: "bernard", message: "Connection issue — please try again." }]);
    } finally {
      setBernardLoading(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }

  async function submitResponse(questionId: string) {
    const answer = responses[questionId];
    if (!answer?.trim()) return;
    await fetch(`${API}/api/client/${dealId}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question_id: questionId, response: answer }),
    });
  }

  return (
    <div className="space-y-6">
      {/* Hero — Deal Summary + Readiness */}
      <section className="relative overflow-hidden rounded-[1.8rem] border border-[#C4A048]/25 bg-[#060E1A] p-5 text-slate-100 sm:p-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(196,160,72,0.12),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.76),rgba(2,6,23,0.96))]" />
        <div className="relative grid gap-5 lg:grid-cols-[1fr_0.5fr]">
          <div>
            <div className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-[#C4A048]">Client Portal · Your Deal Dashboard</div>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-white" style={{ fontFamily: "Cormorant Garamond, serif" }}>Jacaranda Trace — Series 2026</h1>
            <p className="mt-2 text-sm text-slate-400">Convivial Jacaranda Trace, LLC · Venice, FL · 501(c)(3) CCRC</p>

            {/* Action Items */}
            <div className="flex gap-3 mt-4">
              {readiness.blockers.filter(b => b.severity === "critical").length > 0 && (
                <Badge variant="destructive" className="text-xs">{readiness.blockers.filter(b => b.severity === "critical").length} Critical Items</Badge>
              )}
              <Badge variant="outline" className="text-xs border-[#C4A048]/30 text-[#C4A048]">
                {readiness.questions_total - readiness.questions_answered} Questions Pending
              </Badge>
              <Badge variant="outline" className="text-xs border-slate-500 text-slate-400">
                {readiness.docs_required - readiness.docs_complete} Docs Needed
              </Badge>
            </div>
          </div>

          {/* Readiness Score */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none" stroke={readiness.score >= 80 ? "#10b981" : readiness.score >= 50 ? "#C4A048" : "#ef4444"}
                  strokeWidth="8" strokeLinecap="round" strokeDasharray={`${readiness.score * 2.64} 264`} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-3xl font-black text-white">{readiness.score}%</span>
                <span className="font-mono text-[0.5rem] uppercase text-slate-500">Ready</span>
              </div>
            </div>
            <div className="flex gap-4 mt-3 text-center">
              <div>
                <p className="font-mono text-lg font-bold text-slate-400">{readiness.rating_current}</p>
                <p className="font-mono text-[0.5rem] text-slate-600">Current</p>
              </div>
              <div className="text-[#C4A048]">→</div>
              <div>
                <p className="font-mono text-lg font-bold text-[#C4A048]">{readiness.rating_target}</p>
                <p className="font-mono text-[0.5rem] text-slate-600">Target</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-[640px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="questionnaire">Questionnaire</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="bernard">Talk to Bernard</TabsTrigger>
        </TabsList>

        {/* Overview — Blockers + Improvements */}
        <TabsContent value="overview" className="mt-6 space-y-4">
          {/* Blockers */}
          <Card className="border-red-500/20 bg-[#0D2218]">
            <CardHeader><CardTitle className="text-red-400 text-sm">Action Required — What's Blocking Your Deal</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {readiness.blockers.map((b) => (
                <div key={b.id} className={`flex items-start gap-3 rounded-lg border p-3 ${
                  b.severity === "critical" ? "border-red-500/30 bg-red-500/5" :
                  b.severity === "warning" ? "border-yellow-500/20 bg-yellow-500/5" :
                  "border-slate-700 bg-white/[0.02]"
                }`}>
                  <span className={`mt-0.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    b.severity === "critical" ? "bg-red-500" : b.severity === "warning" ? "bg-yellow-500" : "bg-blue-500"
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-white">{b.message}</p>
                    <p className="text-xs text-slate-500 mt-1">{b.action}</p>
                  </div>
                  <Badge variant={b.severity === "critical" ? "destructive" : "secondary"} className="text-[0.55rem]">{b.type}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* How to Improve Rating */}
          <Card className="border-[#C4A048]/20 bg-[#0D2218]">
            <CardHeader><CardTitle className="text-[#C4A048] text-sm" style={{ fontFamily: "Cormorant Garamond" }}>How to Improve Your Rating</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {readiness.improvements.map((imp, i) => (
                <div key={i} className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{imp.lever}</p>
                      <p className="text-xs text-emerald-400 mt-1">{imp.impact}</p>
                    </div>
                    <Badge variant="outline" className="text-[0.55rem] border-slate-600 text-slate-400 whitespace-nowrap">{imp.effort}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Progress Bars */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="border-slate-700 bg-[#0D2218]">
              <CardContent className="p-4">
                <p className="font-mono text-[0.6rem] uppercase text-slate-500">Documents</p>
                <p className="font-mono text-2xl font-bold text-white mt-1">{readiness.docs_complete}/{readiness.docs_required}</p>
                <Progress value={(readiness.docs_complete / readiness.docs_required) * 100} className="mt-2 h-1.5" />
              </CardContent>
            </Card>
            <Card className="border-slate-700 bg-[#0D2218]">
              <CardContent className="p-4">
                <p className="font-mono text-[0.6rem] uppercase text-slate-500">Questions</p>
                <p className="font-mono text-2xl font-bold text-white mt-1">{readiness.questions_answered}/{readiness.questions_total}</p>
                <Progress value={(readiness.questions_answered / readiness.questions_total) * 100} className="mt-2 h-1.5" />
              </CardContent>
            </Card>
            <Card className="border-slate-700 bg-[#0D2218]">
              <CardContent className="p-4">
                <p className="font-mono text-[0.6rem] uppercase text-slate-500">Rating Path</p>
                <p className="font-mono text-2xl font-bold text-[#C4A048] mt-1">{readiness.rating_current} → {readiness.rating_target}</p>
                <Progress value={60} className="mt-2 h-1.5" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Questionnaire */}
        <TabsContent value="questionnaire" className="mt-6 space-y-3">
          {[
            { id: "deal_thesis", section: "Transaction Overview", question: "What is this deal? In one paragraph — what are we financing and why?", answered: false },
            { id: "sponsor_background", section: "Sponsor & Management", question: "Please provide background on your organization — years in operation, similar projects completed, key team members.", answered: false },
            { id: "business_description", section: "Business Analysis", question: "Describe your project in detail — what services you provide, who your customers are, and what makes your operation unique.", answered: false },
            { id: "revenue_model", section: "Business Analysis", question: "How does revenue work? Is it recurring (monthly fees, leases) or transactional? What percentage is contractually committed?", answered: false },
            { id: "proforma_assumptions", section: "Financial Analysis", question: "Walk us through the key assumptions in your financial projections — revenue growth, stabilization timeline, occupancy targets.", answered: false },
            { id: "equity_contribution", section: "Sources & Uses", question: "How much equity is being contributed? Is it cash at closing or deferred? Is there rollover equity?", answered: false },
            { id: "top_risks", section: "Risk Factors", question: "What are the top 3-5 risks you see in this project? What could go wrong, and what mitigants exist?", answered: false },
          ].map((q) => (
            <Card key={q.id} className={`border-slate-700 bg-[#0D2218] ${q.answered ? "opacity-60" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-[0.55rem] border-slate-600 text-slate-400">{q.section}</Badge>
                  {q.answered && <Badge variant="default" className="text-[0.55rem]">Answered</Badge>}
                </div>
                <p className="text-sm text-white mb-3">{q.question}</p>
                <textarea
                  value={responses[q.id] || ""}
                  onChange={(e) => setResponses(prev => ({ ...prev, [q.id]: e.target.value }))}
                  rows={3}
                  placeholder="Type your response..."
                  className="w-full rounded-lg border border-slate-700 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600 resize-vertical"
                />
                <div className="flex gap-2 mt-2">
                  <Button onClick={() => submitResponse(q.id)} size="sm" className="bg-[#C4A048] text-[#030A06] hover:bg-[#E8C87A] text-xs">
                    Submit Response
                  </Button>
                  <Button variant="outline" size="sm" className="border-slate-600 text-slate-400 text-xs"
                    onClick={() => { setActiveTab("bernard"); setBernardInput(`Help me answer: ${q.question}`); }}>
                    Ask Bernard for Help
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Documents for Review */}
        <TabsContent value="documents" className="mt-6 space-y-3">
          <Card className="border-slate-700 bg-[#0D2218]">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-slate-400">Documents pending your review will appear here.</p>
              <p className="text-xs text-slate-600 mt-1">Credit memos, term sheets, engagement letters — review and sign electronically.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bernard Chat */}
        <TabsContent value="bernard" className="mt-6">
          <Card className="border-[#C4A048]/20 bg-[#0D2218]">
            <CardHeader>
              <CardTitle className="text-[#C4A048] text-sm flex items-center gap-2">
                Bernard — Your Deal Concierge
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-[0.55rem]">Online</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 overflow-y-auto mb-4 space-y-3">
                {bernardMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "client" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-xl px-4 py-2.5 ${
                      msg.role === "client"
                        ? "bg-[#C4A048]/10 border border-[#C4A048]/25 text-white"
                        : "bg-white/[0.04] border border-white/10 text-slate-300"
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      {msg.note && <p className="text-xs text-emerald-400 mt-1">{msg.note}</p>}
                    </div>
                  </div>
                ))}
                {bernardLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-slate-400">
                      Bernard is thinking...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="flex gap-2">
                <input
                  value={bernardInput}
                  onChange={(e) => setBernardInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendBernardMessage()}
                  placeholder="Ask Bernard anything about your deal..."
                  className="flex-1 rounded-xl border border-slate-700 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600"
                />
                <Button onClick={sendBernardMessage} disabled={bernardLoading} className="bg-[#C4A048] text-[#030A06] hover:bg-[#E8C87A]">
                  Send
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
