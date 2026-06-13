"use client";
const _API = process.env.NEXT_PUBLIC_API_URL || "";
/**
 * Licensing Study — Series 50 / 54 / 7 / 24/63 curriculum + progress.
 *
 * Per ADR-0001 (Layered Licensing Path):
 *   Track 1 — Britehorn-sponsored registered rep (Series 7 + 24 + 63)
 *   Track 2 — NEST as MSRB Municipal Advisor (Series 50 + 54)
 *
 * Inner tabs per exam: Curriculum · Practice Questions · Quiz · [Midterm] · [Final]
 */
import { useEffect, useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

type ExamCode = "series_50" | "series_54" | "series_7" | "series_24_63";

type Subsection = {
  id: string;
  title: string;
  estimated_minutes?: number;
};

type Section = {
  id: string;
  title: string;
  description: string;
  estimated_minutes: number;
  weight_pct?: number;
  content_source: string;
  subsections?: Subsection[];
};

type Curriculum = {
  code: ExamCode;
  name: string;
  long_name: string;
  regulator: string;
  track: string;
  format: string;
  question_count: number;
  duration_minutes: number;
  passing_score_pct: number;
  content_source: string;
  sections: Section[];
};

type Status = "not_started" | "in_progress" | "completed";

type ProgressEntry = {
  status: Status;
  score: number | null;
  time_spent_minutes: number;
  completed_at: string | null;
  notes: string | null;
};

type QuestionOption = { A: string; B: string; C: string; D: string };

type Question = {
  id: string;
  exam: string;
  section: string;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  options: QuestionOption;
  correct: "A" | "B" | "C" | "D";
  explanation: string;
};

const EXAMS: { code: ExamCode; label: string }[] = [
  { code: "series_50",    label: "Series 50" },
  { code: "series_54",    label: "Series 54" },
  { code: "series_7",     label: "Series 7" },
  { code: "series_24_63", label: "Series 24/63" },
];

const STATUS_COPY: Record<Status, string> = {
  not_started: "Not started",
  in_progress:  "In progress",
  completed:    "Completed",
};

function statusBadgeClass(status: Status) {
  switch (status) {
    case "completed":
      return "border-emerald-400/40 bg-emerald-400/10 text-emerald-200";
    case "in_progress":
      return "border-[#C4A048]/50 bg-[#C4A048]/15 text-[#E8C87A]";
    default:
      return "border-white/15 bg-white/[0.03] text-[#7A9A82]";
  }
}

function difficultyClass(d: string) {
  switch (d) {
    case "easy":   return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
    case "hard":   return "border-red-400/30 bg-red-400/10 text-red-300";
    default:       return "border-[#C4A048]/30 bg-[#C4A048]/10 text-[#E8C87A]";
  }
}

function fmtMinutes(mins: number | undefined) {
  if (!mins) return "—";
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function fmtCountdown(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ── Practice Questions Panel ──────────────────────────────────────────────────

function PracticePanel({ exam }: { exam: ExamCode }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [idx, setIdx]             = useState(0);
  const [selected, setSelected]   = useState<string | null>(null);
  const [revealed, setRevealed]   = useState(false);
  const [score, setScore]         = useState({ correct: 0, total: 0 });
  const [loading, setLoading]     = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${_API}/api/study/questions?exam=${exam}&limit=20`);
      const json = await res.json();
      if (json.success) setQuestions(json.data.questions || []);
    } catch { /* swallow */ }
    setLoading(false);
  }, [exam]);

  useEffect(() => {
    load();
    setIdx(0);
    setSelected(null);
    setRevealed(false);
    setScore({ correct: 0, total: 0 });
  }, [load]);

  const q = questions[idx];

  function handleSubmit() {
    if (!selected || !q) return;
    setRevealed(true);
    setScore((s) => ({
      correct: s.correct + (selected === q.correct ? 1 : 0),
      total: s.total + 1,
    }));
  }

  function handleNext() {
    setSelected(null);
    setRevealed(false);
    if (idx + 1 < questions.length) {
      setIdx((i) => i + 1);
    } else {
      // Reload a fresh set
      load();
      setIdx(0);
    }
  }

  if (loading) return <LoadingCard label="Loading practice questions…" />;
  if (!q) return <EmptyCard label="No questions available for this exam yet." />;

  return (
    <div className="space-y-4">
      {/* Score strip */}
      <div className="flex items-center justify-between rounded-lg border border-white/10 bg-[#0D2218] px-4 py-2">
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[#7A9A82]">
          Score
        </span>
        <span className="font-mono text-sm text-white">
          {score.correct} / {score.total}
          {score.total > 0 && (
            <span className="ml-2 text-[#C4A048]">
              ({Math.round((score.correct / score.total) * 100)}%)
            </span>
          )}
        </span>
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[#7A9A82]">
          Q {idx + 1} / {questions.length}
        </span>
      </div>

      {/* Question card */}
      <Card className="border-[#1E4A2E] bg-[#0D2218]">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <Badge variant="outline" className={difficultyClass(q.difficulty)}>
              {q.difficulty}
            </Badge>
            <CardTitle className="text-sm leading-6 text-white" style={{ fontFamily: "Cormorant Garamond, serif" }}>
              {q.question}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {(["A", "B", "C", "D"] as const).map((opt) => {
            let cls = "border-white/10 bg-white/[0.02] text-[#EDE8DC] hover:bg-white/[0.06]";
            if (revealed) {
              if (opt === q.correct) cls = "border-emerald-400/50 bg-emerald-400/15 text-emerald-200";
              else if (opt === selected) cls = "border-red-400/50 bg-red-400/10 text-red-300";
              else cls = "border-white/5 bg-transparent text-[#7A9A82]";
            } else if (selected === opt) {
              cls = "border-[#C4A048]/60 bg-[#C4A048]/15 text-[#E8C87A]";
            }
            return (
              <button
                key={opt}
                disabled={revealed}
                onClick={() => setSelected(opt)}
                className={`flex w-full items-start gap-3 rounded-lg border px-3 py-2 text-left text-xs transition-all ${cls}`}
              >
                <span className="shrink-0 font-mono font-bold">{opt}.</span>
                <span>{q.options[opt]}</span>
              </button>
            );
          })}

          {!revealed && (
            <Button
              disabled={!selected}
              className="mt-2 bg-[#C4A048] text-[#0D2218] hover:bg-[#E8C87A]"
              onClick={handleSubmit}
            >
              Submit Answer
            </Button>
          )}

          {revealed && (
            <div className="mt-3 space-y-3">
              <div className={`rounded-lg border px-4 py-3 text-xs leading-5 ${selected === q.correct ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200" : "border-red-400/40 bg-red-400/10 text-red-200"}`}>
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] mb-1">
                  {selected === q.correct ? "✓ Correct" : `✗ Incorrect — Answer: ${q.correct}`}
                </p>
                {q.explanation}
              </div>
              <Button
                className="bg-[#C4A048] text-[#0D2218] hover:bg-[#E8C87A]"
                onClick={handleNext}
              >
                Next Question →
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Quiz Panel (10 questions, timed) ─────────────────────────────────────────

function QuizPanel({ exam, section }: { exam: ExamCode; section: Section | null }) {
  type QuizState = "setup" | "active" | "result";
  const [state, setState]       = useState<QuizState>("setup");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers]   = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 min
  const [loading, setLoading]   = useState(false);
  const timerRef                = useRef<ReturnType<typeof setInterval> | null>(null);

  const startQuiz = useCallback(async () => {
    setLoading(true);
    const sectionParam = section ? `&section_id=${section.id}` : "";
    try {
      const res = await fetch(`${_API}/api/study/quiz?exam=${exam}${sectionParam}&count=10`);
      const json = await res.json();
      if (json.success) {
        setQuestions(json.data.questions || []);
        setAnswers({});
        setTimeLeft(600);
        setState("active");
      }
    } catch { /* swallow */ }
    setLoading(false);
  }, [exam, section]);

  useEffect(() => {
    if (state === "active") {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current!);
            setState("result");
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state]);

  function submitQuiz() {
    if (timerRef.current) clearInterval(timerRef.current);
    setState("result");
  }

  if (state === "setup") {
    return (
      <Card className="border-[#1E4A2E] bg-[#0D2218]">
        <CardContent className="space-y-4 p-6">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[#C4A048]">
            Quiz — 10 Questions · 10 Minutes
          </p>
          <p className="text-sm text-[#EDE8DC]">
            {section
              ? `Topic: ${section.title}`
              : "All sections — randomly sampled from the full question bank."}
          </p>
          <Button
            disabled={loading}
            className="bg-[#C4A048] text-[#0D2218] hover:bg-[#E8C87A]"
            onClick={startQuiz}
          >
            {loading ? "Loading…" : "Start Quiz"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const numCorrect = questions.filter((q) => answers[q.id] === q.correct).length;
  const scorePct = questions.length ? Math.round((numCorrect / questions.length) * 100) : 0;
  const passed = scorePct >= 70;

  if (state === "result") {
    return (
      <div className="space-y-4">
        {/* Score summary */}
        <Card className={`border ${passed ? "border-emerald-400/40 bg-emerald-400/[0.06]" : "border-red-400/30 bg-red-400/[0.05]"}`}>
          <CardContent className="p-5">
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[#C4A048] mb-2">
              Quiz Result
            </p>
            <p className="text-3xl font-black text-white" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
              {numCorrect} / {questions.length}
              <span className={`ml-3 text-xl ${passed ? "text-emerald-300" : "text-red-300"}`}>
                {scorePct}% {passed ? "✓ Pass" : "✗ Below 70%"}
              </span>
            </p>
          </CardContent>
        </Card>
        {/* Review wrong answers */}
        {questions.filter((q) => answers[q.id] !== q.correct).map((q) => (
          <Card key={q.id} className="border-red-400/20 bg-[#0D2218]">
            <CardContent className="p-4 space-y-2">
              <p className="text-xs text-[#EDE8DC] font-semibold">{q.question}</p>
              <p className="text-xs text-red-300">Your answer: {answers[q.id] ? `${answers[q.id]}. ${q.options[answers[q.id] as keyof QuestionOption]}` : "Not answered"}</p>
              <p className="text-xs text-emerald-300">Correct: {q.correct}. {q.options[q.correct]}</p>
              <p className="text-xs text-[#7A9A82] leading-5">{q.explanation}</p>
            </CardContent>
          </Card>
        ))}
        <Button className="bg-[#C4A048] text-[#0D2218] hover:bg-[#E8C87A]" onClick={() => setState("setup")}>
          Retake Quiz
        </Button>
      </div>
    );
  }

  // Active quiz
  return (
    <div className="space-y-4">
      {/* Timer bar */}
      <div className="flex items-center justify-between rounded-lg border border-white/10 bg-[#0D2218] px-4 py-2">
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[#7A9A82]">Time</span>
        <span className={`font-mono text-sm font-bold ${timeLeft < 60 ? "text-red-300" : "text-white"}`}>
          {fmtCountdown(timeLeft)}
        </span>
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[#7A9A82]">
          {Object.keys(answers).length} / {questions.length} answered
        </span>
      </div>
      {/* All questions */}
      {questions.map((q, i) => (
        <Card key={q.id} className="border-[#1E4A2E] bg-[#0D2218]">
          <CardHeader className="pb-2">
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="shrink-0 border-white/10 text-[#7A9A82] font-mono text-[0.55rem]">
                Q{i + 1}
              </Badge>
              <p className="text-xs leading-5 text-[#EDE8DC]">{q.question}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {(["A", "B", "C", "D"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                className={`flex w-full items-start gap-2 rounded-lg border px-3 py-1.5 text-left text-xs transition-all ${
                  answers[q.id] === opt
                    ? "border-[#C4A048]/60 bg-[#C4A048]/15 text-[#E8C87A]"
                    : "border-white/10 bg-white/[0.02] text-[#EDE8DC] hover:bg-white/[0.06]"
                }`}
              >
                <span className="shrink-0 font-mono font-bold">{opt}.</span>
                <span>{q.options[opt]}</span>
              </button>
            ))}
          </CardContent>
        </Card>
      ))}
      <Button className="w-full bg-[#C4A048] text-[#0D2218] hover:bg-[#E8C87A]" onClick={submitQuiz}>
        Submit Quiz
      </Button>
    </div>
  );
}

// ── Full Exam Panel (Midterm / Final — Series 7 only) ─────────────────────────

function FullExamPanel({
  examType,
  label,
  questionTarget,
  durationMinutes,
}: {
  examType: "midterm" | "final";
  label: string;
  questionTarget: number;
  durationMinutes: number;
}) {
  type ExamState = "setup" | "active" | "result";
  const [state, setState]         = useState<ExamState>("setup");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers]     = useState<Record<string, string>>({});
  const [flagged, setFlagged]     = useState<Set<string>>(new Set());
  const [currentQ, setCurrentQ]   = useState(0);
  const [timeLeft, setTimeLeft]   = useState(durationMinutes * 60);
  const [loading, setLoading]     = useState(false);
  const [breakdown, setBreakdown] = useState<Record<string, { correct: number; total: number }>>({});
  const timerRef                  = useRef<ReturnType<typeof setInterval> | null>(null);

  async function startExam() {
    setLoading(true);
    try {
      const res = await fetch(`${_API}/api/study/exam?type=${examType}&exam=series_7`);
      const json = await res.json();
      if (json.success) {
        setQuestions(json.data.questions || []);
        setAnswers({});
        setFlagged(new Set());
        setCurrentQ(0);
        setTimeLeft(durationMinutes * 60);
        setState("active");
      }
    } catch { /* swallow */ }
    setLoading(false);
  }

  useEffect(() => {
    if (state === "active") {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current!);
            finishExam();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  function finishExam() {
    if (timerRef.current) clearInterval(timerRef.current);
    // Build section breakdown
    const bd: Record<string, { correct: number; total: number }> = {};
    questions.forEach((q) => {
      const sec = q.section;
      if (!bd[sec]) bd[sec] = { correct: 0, total: 0 };
      bd[sec].total++;
      if (answers[q.id] === q.correct) bd[sec].correct++;
    });
    setBreakdown(bd);
    setState("result");
  }

  function toggleFlag(id: string) {
    setFlagged((f) => {
      const n = new Set(f);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  const q = questions[currentQ];
  const numCorrect = questions.filter((q) => answers[q.id] === q.correct).length;
  const scorePct = questions.length ? Math.round((numCorrect / questions.length) * 100) : 0;
  const passed = scorePct >= 72;

  if (state === "setup") {
    return (
      <Card className="border-[#1E4A2E] bg-[#0D2218]">
        <CardContent className="space-y-4 p-6">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[#C4A048]">
            {label} · {questionTarget} Questions · {fmtMinutes(durationMinutes)}
          </p>
          <p className="text-sm text-[#EDE8DC]">
            Full Series 7 exam simulation. Navigator sidebar lets you jump between questions and flag for review.
            Passing score: 72%.
          </p>
          <Button
            disabled={loading}
            className="bg-[#C4A048] text-[#0D2218] hover:bg-[#E8C87A]"
            onClick={startExam}
          >
            {loading ? "Building exam…" : `Start ${label}`}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (state === "result") {
    return (
      <div className="space-y-4">
        <Card className={`border ${passed ? "border-emerald-400/40 bg-emerald-400/[0.06]" : "border-red-400/30 bg-red-400/[0.05]"}`}>
          <CardContent className="p-6 space-y-2">
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[#C4A048]">
              {label} Score
            </p>
            <p className="text-4xl font-black text-white" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
              {scorePct}%
              <span className={`ml-4 text-2xl ${passed ? "text-emerald-300" : "text-red-300"}`}>
                {passed ? "✓ PASS" : "✗ FAIL"}
              </span>
            </p>
            <p className="text-sm text-[#7A9A82]">
              {numCorrect} of {questions.length} correct · Passing threshold: 72%
            </p>
          </CardContent>
        </Card>
        {/* Section breakdown */}
        <Card className="border-[#1E4A2E] bg-[#0D2218]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white" style={{ fontFamily: "Cormorant Garamond, serif" }}>
              Score by Section
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(breakdown).map(([sec, data]) => {
              const pct = data.total ? Math.round((data.correct / data.total) * 100) : 0;
              return (
                <div key={sec} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#EDE8DC] capitalize">{sec.replace(/_/g, " ")}</span>
                    <span className={`font-mono ${pct >= 72 ? "text-emerald-300" : "text-red-300"}`}>
                      {data.correct}/{data.total} · {pct}%
                    </span>
                  </div>
                  <Progress value={pct} className="h-1 bg-white/[0.06]" />
                </div>
              );
            })}
          </CardContent>
        </Card>
        <Button className="bg-[#C4A048] text-[#0D2218] hover:bg-[#E8C87A]" onClick={() => setState("setup")}>
          Retake {label}
        </Button>
      </div>
    );
  }

  // Active exam — two-column layout
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_200px]">
      {/* Main question area */}
      <div className="space-y-4">
        {/* Header bar */}
        <div className="flex items-center justify-between rounded-lg border border-white/10 bg-[#0D2218] px-4 py-2">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-[#7A9A82]">
            Q {currentQ + 1} / {questions.length}
          </span>
          <span className={`font-mono text-sm font-bold ${timeLeft < 300 ? "text-red-300" : "text-white"}`}>
            {fmtCountdown(timeLeft)}
          </span>
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-[#7A9A82]">
            {Object.keys(answers).length} answered
          </span>
        </div>

        {q && (
          <Card className="border-[#1E4A2E] bg-[#0D2218]">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 flex-1">
                  <Badge variant="outline" className={difficultyClass(q.difficulty)}>
                    {q.difficulty}
                  </Badge>
                  <p className="text-sm leading-6 text-[#EDE8DC]">{q.question}</p>
                </div>
                <button
                  onClick={() => toggleFlag(q.id)}
                  className={`shrink-0 rounded px-2 py-1 font-mono text-[0.6rem] uppercase tracking-[0.12em] transition-colors ${
                    flagged.has(q.id)
                      ? "bg-[#C4A048]/20 text-[#C4A048] border border-[#C4A048]/40"
                      : "border border-white/10 text-[#7A9A82] hover:border-[#C4A048]/30 hover:text-[#C4A048]"
                  }`}
                >
                  {flagged.has(q.id) ? "Flagged" : "Flag"}
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {(["A", "B", "C", "D"] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                  className={`flex w-full items-start gap-3 rounded-lg border px-3 py-2 text-left text-xs transition-all ${
                    answers[q.id] === opt
                      ? "border-[#C4A048]/60 bg-[#C4A048]/15 text-[#E8C87A]"
                      : "border-white/10 bg-white/[0.02] text-[#EDE8DC] hover:bg-white/[0.06]"
                  }`}
                >
                  <span className="shrink-0 font-mono font-bold">{opt}.</span>
                  <span>{q.options[opt]}</span>
                </button>
              ))}

              {/* Prev / Next navigation */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  disabled={currentQ === 0}
                  className="border-white/10 text-[#EDE8DC] hover:bg-white/[0.06]"
                  onClick={() => setCurrentQ((i) => i - 1)}
                >
                  ← Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={currentQ === questions.length - 1}
                  className="border-white/10 text-[#EDE8DC] hover:bg-white/[0.06]"
                  onClick={() => setCurrentQ((i) => i + 1)}
                >
                  Next →
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Button
          className="w-full bg-[#C4A048] text-[#0D2218] hover:bg-[#E8C87A]"
          onClick={finishExam}
        >
          Submit Exam
        </Button>
      </div>

      {/* Question navigator sidebar */}
      <div className="space-y-2">
        <p className="font-mono text-[0.55rem] uppercase tracking-[0.14em] text-[#7A9A82]">Navigator</p>
        <div className="grid grid-cols-5 gap-1 lg:grid-cols-4">
          {questions.map((q, i) => {
            let cls = "border-white/10 bg-white/[0.03] text-[#7A9A82]";
            if (i === currentQ) cls = "border-[#C4A048]/70 bg-[#C4A048]/20 text-[#C4A048]";
            else if (flagged.has(q.id)) cls = "border-[#C4A048]/40 bg-[#C4A048]/10 text-[#C4A048]";
            else if (answers[q.id]) cls = "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
            return (
              <button
                key={q.id}
                onClick={() => setCurrentQ(i)}
                className={`rounded border px-1 py-1 font-mono text-[0.55rem] transition-colors ${cls}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
        <div className="space-y-1 pt-1">
          <LegendDot color="emerald" label="Answered" />
          <LegendDot color="gold" label="Flagged / Current" />
          <LegendDot color="muted" label="Unanswered" />
        </div>
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: "emerald" | "gold" | "muted"; label: string }) {
  const cls = color === "emerald"
    ? "bg-emerald-400/60"
    : color === "gold"
    ? "bg-[#C4A048]/60"
    : "bg-white/20";
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${cls}`} />
      <span className="font-mono text-[0.52rem] uppercase tracking-[0.1em] text-[#7A9A82]">{label}</span>
    </div>
  );
}

// ── Misc helpers ──────────────────────────────────────────────────────────────

function LoadingCard({ label }: { label: string }) {
  return (
    <Card className="border-white/10 bg-[#0D2218]">
      <CardContent className="p-5">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-[#C4A048]">{label}</p>
      </CardContent>
    </Card>
  );
}

function EmptyCard({ label }: { label: string }) {
  return (
    <Card className="border-white/10 bg-[#0D2218]">
      <CardContent className="p-5">
        <p className="text-sm text-[#7A9A82]">{label}</p>
      </CardContent>
    </Card>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────

export default function StudyPage() {
  const [activeExam, setActiveExam] = useState<ExamCode>("series_50");
  const [curricula, setCurricula]   = useState<Partial<Record<ExamCode, Curriculum>>>({});
  const [progressByExam, setProgressByExam] = useState<
    Partial<Record<ExamCode, Record<string, ProgressEntry>>>
  >({});
  const [loading, setLoading]       = useState(false);
  const [activeSection, setActiveSection] = useState<Section | null>(null);

  const fetchCurriculum = useCallback(async (exam: ExamCode) => {
    try {
      const res = await fetch(`${_API}/api/study/curriculum?exam=${exam}`);
      const json = await res.json();
      if (json.success) {
        setCurricula((prev) => ({ ...prev, [exam]: json.data as Curriculum }));
      }
    } catch { /* swallow — skeleton */ }
  }, []);

  const fetchProgress = useCallback(async (exam: ExamCode) => {
    try {
      const res = await fetch(`${_API}/api/study/progress?exam=${exam}`);
      const json = await res.json();
      if (json.success && json.data?.sections) {
        setProgressByExam((prev) => ({
          ...prev,
          [exam]: json.data.sections as Record<string, ProgressEntry>,
        }));
      }
    } catch { /* swallow — skeleton */ }
  }, []);

  useEffect(() => {
    EXAMS.forEach((e) => fetchCurriculum(e.code));
  }, [fetchCurriculum]);

  useEffect(() => {
    fetchProgress(activeExam);
  }, [activeExam, fetchProgress]);

  async function markSection(sectionId: string, status: Status) {
    setLoading(true);
    try {
      const res = await fetch(`${_API}/api/study/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exam: activeExam, section_id: sectionId, status }),
      });
      const json = await res.json();
      if (json.success) await fetchProgress(activeExam);
    } catch { /* swallow */ }
    setLoading(false);
  }

  const isSeries7 = activeExam === "series_7";

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-[1.8rem] border border-[#C4A048]/25 bg-[#060E1A] p-5 text-[#EDE8DC] shadow-[0_0_85px_rgba(196,160,72,0.13)] sm:p-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(196,160,72,0.17),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.76),rgba(2,6,23,0.96))]" />
        <div className="relative grid gap-5 lg:grid-cols-[1fr_0.7fr]">
          <div>
            <div className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-[#C4A048]">
              Licensing Study · Series 50 · 54 · 7 · 24/63
            </div>
            <h1
              className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl"
              style={{ fontFamily: "Cormorant Garamond, serif" }}
            >
              Licensing Study
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#EDE8DC]">
              Track 2 (MSRB Municipal Advisor — Series 50 + 54) registers NEST Advisors LLC to collect
              transaction-based advisory fees directly on muni transactions. Track 1 (Britehorn-sponsored —
              Series 7 + 24 + 63) hosts Sean as a registered rep at Britehorn Securities (BD #36402).
              Both study tracks ship as v1 platform surfaces per ADR-0001.
            </p>
          </div>
          <ExamHeaderStat exam={curricula[activeExam]} />
        </div>
      </section>

      {/* Outer exam-selector tabs */}
      <Tabs value={activeExam} onValueChange={(v) => { setActiveExam(v as ExamCode); setActiveSection(null); }}>
        <TabsList className="grid w-full grid-cols-4 lg:w-[640px]">
          {EXAMS.map((e) => (
            <TabsTrigger key={e.code} value={e.code}>{e.label}</TabsTrigger>
          ))}
        </TabsList>

        {EXAMS.map((e) => {
          const curriculum = curricula[e.code];
          const progress   = progressByExam[e.code] || {};
          const sections   = curriculum?.sections || [];
          const totalSections     = sections.length;
          const completedSections = sections.filter((s) => progress[s.id]?.status === "completed").length;
          const inProgressSections = sections.filter((s) => progress[s.id]?.status === "in_progress").length;
          const completionPct = totalSections ? Math.round((completedSections / totalSections) * 100) : 0;
          const isS7 = e.code === "series_7";

          // Inner-tab count: Series 7 gets Midterm + Final; others don't
          const innerTabCount = isS7 ? 5 : 3;
          const innerGridCols = `grid-cols-${innerTabCount}`;

          return (
            <TabsContent key={e.code} value={e.code} className="mt-6 space-y-4">
              {/* Exam meta strip */}
              {curriculum && (
                <Card className="border-white/10 bg-[#0D2218]">
                  <CardContent className="grid gap-4 p-4 text-xs text-[#EDE8DC] sm:grid-cols-4">
                    <MetaCell label="Regulator" value={curriculum.regulator} />
                    <MetaCell label="Track"     value={curriculum.track} />
                    <MetaCell label="Format"    value={`${curriculum.question_count} items · ${fmtMinutes(curriculum.duration_minutes)}`} />
                    <MetaCell label="Passing"   value={`${curriculum.passing_score_pct}%`} />
                  </CardContent>
                </Card>
              )}

              {/* Inner tabs: Curriculum / Practice / Quiz / [Midterm] / [Final] */}
              <Tabs defaultValue="curriculum">
                <TabsList className={`grid w-full ${innerGridCols} lg:w-auto`}>
                  <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                  <TabsTrigger value="practice">Practice</TabsTrigger>
                  <TabsTrigger value="quiz">Quiz</TabsTrigger>
                  {isS7 && <TabsTrigger value="midterm">Midterm</TabsTrigger>}
                  {isS7 && <TabsTrigger value="final">Final</TabsTrigger>}
                </TabsList>

                {/* ── Curriculum Tab ── */}
                <TabsContent value="curriculum" className="mt-4 space-y-4">
                  {sections.length === 0 && (
                    <Card className="border-white/10 bg-[#0D2218]">
                      <CardContent className="p-5">
                        <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-[#C4A048]">
                          Curriculum loading…
                        </p>
                        <p className="mt-2 text-sm text-[#EDE8DC]">
                          {e.label} outline will populate from the published FINRA / NASAA content outline.
                          Track 1 sequence runs after Track 2 enters Phase 2 per ADR-0001.
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {sections.map((section) => {
                    const entry  = progress[section.id];
                    const status: Status = entry?.status ?? "not_started";
                    const isActive = activeSection?.id === section.id;
                    return (
                      <Card key={section.id} className="border-[#1E4A2E] bg-[#0D2218]">
                        <CardHeader className="pb-2">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                              <CardTitle
                                className="text-base text-white"
                                style={{ fontFamily: "Cormorant Garamond, serif" }}
                              >
                                {section.title}
                              </CardTitle>
                              <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-[#7A9A82]">
                                <span>~{fmtMinutes(section.estimated_minutes)}</span>
                                {section.weight_pct != null && <span>· {section.weight_pct}% weight</span>}
                                {entry?.time_spent_minutes ? <span>· Logged {fmtMinutes(entry.time_spent_minutes)}</span> : null}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={statusBadgeClass(status)}>
                                {STATUS_COPY[status]}
                              </Badge>
                              <button
                                onClick={() => setActiveSection(isActive ? null : section)}
                                className="font-mono text-[0.55rem] uppercase tracking-[0.1em] text-[#7A9A82] hover:text-[#C4A048] transition-colors"
                              >
                                {isActive ? "Deselect" : "Select for Quiz"}
                              </button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-xs leading-5 text-[#EDE8DC]">{section.description}</p>

                          {section.subsections && section.subsections.length > 0 && (
                            <Accordion type="single" collapsible className="rounded-md border border-white/5 bg-black/20">
                              <AccordionItem value={section.id} className="border-b-0">
                                <AccordionTrigger className="px-3 text-xs text-[#EDE8DC] hover:no-underline">
                                  <span className="font-mono uppercase tracking-[0.14em] text-[#7A9A82]">
                                    Sub-topics ({section.subsections.length})
                                  </span>
                                </AccordionTrigger>
                                <AccordionContent className="px-3 pb-3">
                                  <ul className="space-y-1.5">
                                    {section.subsections.map((sub) => {
                                      const subEntry  = progress[sub.id];
                                      const subStatus: Status = subEntry?.status ?? "not_started";
                                      return (
                                        <li
                                          key={sub.id}
                                          className="flex items-center justify-between gap-3 rounded-md border border-white/5 bg-white/[0.02] px-2.5 py-1.5"
                                        >
                                          <div className="min-w-0">
                                            <p className="truncate text-xs text-[#EDE8DC]">{sub.title}</p>
                                            <p className="font-mono text-[0.55rem] uppercase tracking-[0.12em] text-[#7A9A82]">
                                              {fmtMinutes(sub.estimated_minutes)}
                                            </p>
                                          </div>
                                          <div className="flex shrink-0 items-center gap-2">
                                            <Badge variant="outline" className={statusBadgeClass(subStatus)}>
                                              {STATUS_COPY[subStatus]}
                                            </Badge>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              disabled={loading}
                                              className="h-7 border-white/10 bg-white/[0.03] px-2 text-[0.65rem] font-mono uppercase tracking-[0.12em] text-[#EDE8DC] hover:bg-white/[0.07]"
                                              onClick={() =>
                                                markSection(
                                                  sub.id,
                                                  subStatus === "completed"
                                                    ? "in_progress"
                                                    : subStatus === "in_progress"
                                                    ? "completed"
                                                    : "in_progress",
                                                )
                                              }
                                            >
                                              {subStatus === "completed"
                                                ? "Reopen"
                                                : subStatus === "in_progress"
                                                ? "Mark complete"
                                                : "Mark in progress"}
                                            </Button>
                                          </div>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          )}

                          <p className="font-mono text-[0.55rem] uppercase tracking-[0.12em] text-[#7A9A82]">
                            Source: {section.content_source}
                          </p>

                          <div className="flex flex-wrap gap-2 pt-1">
                            <Button
                              size="sm"
                              disabled={loading || status === "in_progress"}
                              className="bg-[#C4A048] text-[#0D2218] hover:bg-[#E8C87A]"
                              onClick={() => markSection(section.id, "in_progress")}
                            >
                              Mark in progress
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={loading || status === "completed"}
                              className="border-emerald-400/40 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/20"
                              onClick={() => markSection(section.id, "completed")}
                            >
                              Mark complete
                            </Button>
                            {status !== "not_started" && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={loading}
                                className="border-white/15 bg-transparent text-[#7A9A82] hover:bg-white/[0.05]"
                                onClick={() => markSection(section.id, "not_started")}
                              >
                                Reset
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}

                  {/* Overall progress strip */}
                  <Card className="border-[#C4A048]/25 bg-[#0D2218]">
                    <CardContent className="space-y-2 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[#C4A048]">
                            Overall progress · {e.label}
                          </p>
                          <p className="mt-1 text-xs text-[#7A9A82]">
                            {completedSections} of {totalSections} sections complete
                            {inProgressSections > 0 ? ` · ${inProgressSections} in progress` : ""}
                          </p>
                        </div>
                        <p className="text-2xl font-black text-white" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
                          {completionPct}%
                        </p>
                      </div>
                      <Progress value={completionPct} className="h-2 bg-white/[0.06]" />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* ── Practice Questions Tab ── */}
                <TabsContent value="practice" className="mt-4">
                  <PracticePanel exam={e.code} />
                </TabsContent>

                {/* ── Quiz Tab ── */}
                <TabsContent value="quiz" className="mt-4 space-y-3">
                  {activeSection && (
                    <div className="flex items-center gap-2 rounded-lg border border-[#C4A048]/30 bg-[#C4A048]/10 px-3 py-2">
                      <span className="font-mono text-[0.55rem] uppercase tracking-[0.12em] text-[#C4A048]">
                        Focused on:
                      </span>
                      <span className="text-xs text-[#E8C87A]">{activeSection.title}</span>
                      <button
                        onClick={() => setActiveSection(null)}
                        className="ml-auto font-mono text-[0.55rem] uppercase tracking-[0.1em] text-[#7A9A82] hover:text-[#C4A048]"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                  <QuizPanel exam={e.code} section={activeSection} />
                </TabsContent>

                {/* ── Midterm Tab (Series 7 only) ── */}
                {isS7 && (
                  <TabsContent value="midterm" className="mt-4">
                    <FullExamPanel
                      examType="midterm"
                      label="Midterm Exam"
                      questionTarget={125}
                      durationMinutes={120}
                    />
                  </TabsContent>
                )}

                {/* ── Final Tab (Series 7 only) ── */}
                {isS7 && (
                  <TabsContent value="final" className="mt-4">
                    <FullExamPanel
                      examType="final"
                      label="Final Exam"
                      questionTarget={250}
                      durationMinutes={225}
                    />
                  </TabsContent>
                )}
              </Tabs>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}


// ── small presentational helpers ─────────────────────────────────────────────

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[0.55rem] uppercase tracking-[0.14em] text-[#7A9A82]">{label}</p>
      <p className="mt-1 text-xs text-[#EDE8DC]">{value}</p>
    </div>
  );
}

function ExamHeaderStat({ exam }: { exam: Curriculum | undefined }) {
  if (!exam) return null;
  return (
    <div className="grid grid-cols-2 gap-3">
      {[
        ["Questions", `${exam.question_count}`],
        ["Duration",  fmtMinutes(exam.duration_minutes)],
        ["Pass",      `${exam.passing_score_pct}%`],
        ["Sections",  `${exam.sections.length}`],
      ].map(([label, value]) => (
        <Card key={label} className="border-white/10 bg-white/[0.04]">
          <CardContent className="p-3">
            <p className="font-mono text-[0.6rem] uppercase tracking-wider text-[#7A9A82]">{label}</p>
            <p className="mt-1 text-xl font-black text-white" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
              {value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
