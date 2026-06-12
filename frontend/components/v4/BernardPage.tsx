"use client";
/**
 * Bernard — CEO / Platform Orchestrator
 * Dedicated page (not just the concierge overlay).
 * Ask anything, route tasks, tutorial/gate/wrap-up at decision points.
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";

const QUICK_QUESTIONS = [
  "What is NEST's current deal pipeline?",
  "Explain the Universal Credit Policy",
  "How do the Mirror Agents predict ratings?",
  "What structural levers improve a BBB to A rating?",
  "Walk me through an M&A acquisition bond sizing",
  "What desks are involved in a new deal?",
];

export default function BernardPage() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [mode, setMode] = useState<"ask" | "route" | "tutorial">("ask");

  const askMutation = trpc.bernard.ask.useMutation({ onSuccess: (data) => setResponse(data) });
  const routeMutation = trpc.bernard.route.useMutation({ onSuccess: (data) => setResponse(data) });
  const tutorialMutation = trpc.bernard.tutorial.useMutation({ onSuccess: (data) => setResponse(data) });

  const loading = askMutation.isPending || routeMutation.isPending || tutorialMutation.isPending;

  function submit() {
    if (!question.trim()) return;
    if (mode === "ask") askMutation.mutate({ question });
    else if (mode === "route") routeMutation.mutate({ task: question });
    else tutorialMutation.mutate({ decisionPoint: question });
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[1.8rem] border border-[#C4A048]/25 bg-[#060E1A] p-5 text-[#EDE8DC] shadow-[0_0_85px_rgba(196,160,72,0.11)] sm:p-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(196,160,72,0.17),transparent_34%),radial-gradient(circle_at_86%_4%,rgba(45,107,61,0.15),transparent_30%),linear-gradient(135deg,rgba(15,23,42,0.76),rgba(2,6,23,0.96))]" />
        <div className="relative">
          <div className="flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-[#C4A048]">
            Orca C-Suite · CEO Agent
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl" style={{ fontFamily: "Cormorant Garamond, serif" }}>
            Bernard
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#EDE8DC]">
            CEO and platform orchestrator. Ask anything about NEST operations, deals, bond mechanics, or the organizational structure. Route tasks to the correct desk. Get tutorial explanations at decision points.
          </p>
        </div>
      </section>

      {/* Mode Tabs */}
      <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
        <TabsList className="grid w-full grid-cols-3 lg:w-[480px]">
          <TabsTrigger value="ask">Ask Bernard</TabsTrigger>
          <TabsTrigger value="route">Route Task</TabsTrigger>
          <TabsTrigger value="tutorial">Tutorial / Gate</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Input */}
      <div className="flex gap-3">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder={
            mode === "ask" ? "Ask anything about NEST operations..."
            : mode === "route" ? "Describe a task to route to the right desk..."
            : "Describe a decision point for tutorial/gate/wrap-up..."
          }
          className="flex-1 rounded-xl border border-[#C4A048]/20 bg-[#0D2218] px-4 py-3 text-sm text-[#EDE8DC] placeholder:text-[#7A9A82]/60 focus:border-[#C4A048]/50 focus:outline-none"
        />
        <Button onClick={submit} disabled={loading} className="bg-[#C4A048] text-[#030A06] hover:bg-[#E8C87A] px-6">
          {loading ? "Thinking..." : "Send"}
        </Button>
      </div>

      {/* Quick Questions */}
      <div className="flex flex-wrap gap-2">
        {QUICK_QUESTIONS.map((q) => (
          <button key={q} onClick={() => { setQuestion(q); setMode("ask"); }}
            className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-[#7A9A82] hover:border-[#C4A048]/30 hover:text-[#C4A048] transition">
            {q}
          </button>
        ))}
      </div>

      {/* Response */}
      {response && (
        <Card className="border-[#C4A048]/20 bg-[#0D2218]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CardTitle className="text-[#C4A048]" style={{ fontFamily: "Cormorant Garamond, serif" }}>Bernard</CardTitle>
              {response.routed_to && (
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                  Routed: {response.routed_to}
                </Badge>
              )}
              {response.requires_acknowledgment && (
                <Badge variant="outline" className="border-[#C4A048]/30 text-[#C4A048]">
                  Gate — Requires Acknowledgment
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-[#EDE8DC]">
              {response.response || response.tutorial || response.routing || JSON.stringify(response, null, 2)}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
