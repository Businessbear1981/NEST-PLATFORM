/**
 * Preflight Interview — Bernard-driven Q&A run at Deal Input (Stage 0).
 * Answers persist server-side per deal_id and become the foundation of the
 * credit memo. The deal cannot advance to Roots until the interview reaches
 * the memo-ready threshold (backend: answered >= 75%).
 */
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const API = "";

type Question = {
  id: string;
  question: string;
  why?: string;
  answered: boolean;
  answer: string | null;
};

type Section = {
  id: string;
  title: string;
  credit_memo_section?: string;
  questions: Question[];
  total: number;
  answered: number;
  complete: boolean;
};

type Status = {
  total_questions: number;
  answered: number;
  pct: number;
  ready_for_memo: boolean;
};

export default function PreflightInterview({ dealId, onComplete }: { dealId: string; onComplete: () => void }) {
  const [sections, setSections] = useState<Section[]>([]);
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [answeredIds, setAnsweredIds] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);
  const [brainstormId, setBrainstormId] = useState<string | null>(null);
  const [brainstorms, setBrainstorms] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`${API}/api/preflight/${dealId}/questions`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setSections(d.data.sections || []);
          setStatus(d.data.status || null);
          const seeded = new Set<string>();
          const seededDrafts: Record<string, string> = {};
          for (const s of d.data.sections || []) {
            for (const q of s.questions) {
              if (q.answered) seeded.add(q.id);
              if (q.answer) seededDrafts[q.id] = q.answer;
            }
          }
          setAnsweredIds(seeded);
          setDrafts(seededDrafts);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [dealId]);

  const submitAnswer = useCallback(async (qid: string) => {
    const answer = (drafts[qid] || "").trim();
    if (!answer) return;
    setSavingId(qid);
    try {
      const res = await fetch(`${API}/api/preflight/${dealId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ question_id: qid, answer }),
      });
      const d = await res.json();
      if (d.success) {
        setStatus(d.data.status);
        setAnsweredIds((prev) => new Set(prev).add(qid));
      }
    } finally {
      setSavingId(null);
    }
  }, [dealId, drafts]);

  const askBernard = useCallback(async (qid: string) => {
    setBrainstormId(qid);
    try {
      const res = await fetch(`${API}/api/preflight/${dealId}/brainstorm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ question_id: qid }),
      });
      const d = await res.json();
      if (d.success) setBrainstorms((prev) => ({ ...prev, [qid]: d.data.brainstorm }));
    } finally {
      setBrainstormId(null);
    }
  }, [dealId]);

  const pct = status?.pct ?? 0;
  const ready = status?.ready_for_memo ?? false;

  return (
    <div className="space-y-5">
      {/* Header + progress */}
      <section className="relative overflow-hidden rounded-[1.8rem] border border-[#C4A048]/25 bg-[#060E1A] p-5 text-slate-100 sm:p-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(196,160,72,0.17),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.76),rgba(2,6,23,0.96))]" />
        <div className="relative">
          <div className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-[#C4A048]">Stage 0 · Preflight Interview</div>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white" style={{ fontFamily: "Cormorant Garamond, serif" }}>Bernard's Interview</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Answer Bernard's questions to build the deal narrative. These responses become the foundation of the credit memo and determine the document package Roots will request. Stuck on one? Ask Bernard to brainstorm.
          </p>
          <div className="mt-4 max-w-md">
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[0.6rem] uppercase tracking-wider text-slate-400">Interview Progress</span>
              <span className="font-mono text-sm font-bold text-[#C4A048]">{pct}%</span>
            </div>
            <Progress value={pct} className="h-2" />
            <p className="font-mono text-[0.55rem] text-slate-500 mt-1">
              {status?.answered ?? 0}/{status?.total_questions ?? 0} answered · {ready ? "memo-ready" : `${Math.max(0, Math.ceil((status?.total_questions ?? 0) * 0.75) - (status?.answered ?? 0))} more to reach memo-ready`}
            </p>
          </div>
        </div>
      </section>

      {loading && <p className="font-mono text-xs text-slate-500">Loading interview…</p>}

      {/* Sections */}
      {sections.map((section) => {
        const sectionAnswered = section.questions.filter((q) => answeredIds.has(q.id)).length;
        return (
          <Card key={section.id} className="border-slate-700/60 bg-[#0D2218]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[#C4A048]" style={{ fontFamily: "Cormorant Garamond, serif" }}>{section.title}</h3>
                <Badge variant="outline" className="text-[0.5rem] border-slate-600 text-slate-400">
                  {sectionAnswered}/{section.questions.length}
                </Badge>
              </div>
              <div className="space-y-4">
                {section.questions.map((q) => {
                  const done = answeredIds.has(q.id);
                  return (
                    <div key={q.id} className="rounded-lg border border-white/5 bg-black/20 p-3">
                      <div className="flex items-start gap-2">
                        <span className={`mt-1 w-2 h-2 shrink-0 rounded-full ${done ? "bg-emerald-500" : "bg-slate-600"}`} />
                        <div className="flex-1">
                          <p className="text-sm text-slate-200">{q.question}</p>
                          {q.why && <p className="mt-1 text-[0.65rem] text-slate-500 italic">Why it matters: {q.why}</p>}
                          <textarea
                            value={drafts[q.id] || ""}
                            onChange={(e) => setDrafts((prev) => ({ ...prev, [q.id]: e.target.value }))}
                            rows={3}
                            placeholder="Your answer…"
                            className="mt-2 w-full resize-vertical rounded-lg border border-slate-700 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-[#C4A048]/50 focus:outline-none"
                          />
                          <div className="mt-2 flex items-center gap-2">
                            <Button
                              onClick={() => submitAnswer(q.id)}
                              disabled={savingId === q.id || !(drafts[q.id] || "").trim()}
                              className="h-7 bg-[#C4A048] px-3 text-[0.65rem] font-semibold text-[#030A06] hover:bg-[#E8C87A] disabled:opacity-50"
                            >
                              {savingId === q.id ? "Saving…" : done ? "Update" : "Save Answer"}
                            </Button>
                            <Button
                              onClick={() => askBernard(q.id)}
                              disabled={brainstormId === q.id}
                              variant="outline"
                              className="h-7 border-slate-600 px-3 text-[0.65rem] text-slate-300 hover:bg-white/5"
                            >
                              {brainstormId === q.id ? "Bernard thinking…" : "Ask Bernard"}
                            </Button>
                            {done && <span className="font-mono text-[0.55rem] text-emerald-400">saved</span>}
                          </div>
                          {brainstorms[q.id] && (
                            <div className="mt-2 rounded-lg border border-[#C4A048]/20 bg-[#060E1A] p-3">
                              <p className="font-mono text-[0.55rem] uppercase tracking-wider text-[#C4A048] mb-1">Bernard</p>
                              <p className="whitespace-pre-wrap text-xs text-slate-300">{brainstorms[q.id]}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Advance gate */}
      <div className="flex items-center gap-3">
        <Button
          onClick={onComplete}
          disabled={!ready}
          className="bg-[#C4A048] px-8 py-3 text-sm font-semibold text-[#030A06] hover:bg-[#E8C87A] disabled:opacity-40"
        >
          {ready ? "Interview Complete — Continue to Roots →" : `Answer ${Math.max(0, Math.ceil((status?.total_questions ?? 0) * 0.75) - (status?.answered ?? 0))} more to continue`}
        </Button>
        {!ready && <span className="font-mono text-[0.6rem] text-slate-500">The interview must reach memo-ready before the deal advances.</span>}
      </div>
    </div>
  );
}
