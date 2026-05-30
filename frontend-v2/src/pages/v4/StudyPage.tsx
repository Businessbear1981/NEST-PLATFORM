/**
 * Licensing Study — Series 50 / 54 / 7 / 24/63 curriculum + progress.
 *
 * Per ADR-0001 (Layered Licensing Path):
 *   Track 1 — Britehorn-sponsored registered rep (Series 7 + 24 + 63)
 *   Track 2 — NEST as MSRB Municipal Advisor (Series 50 + 54)
 *
 * Both study tracks are v1 platform surfaces. Sean studies while
 * running deals. Series 50/54 are populated; Series 7 and 24/63
 * are placeholder until FINRA/NASAA outlines are loaded.
 */
import { useEffect, useState, useCallback } from "react";
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

const EXAMS: { code: ExamCode; label: string }[] = [
  { code: "series_50",    label: "Series 50" },
  { code: "series_54",    label: "Series 54" },
  { code: "series_7",     label: "Series 7" },
  { code: "series_24_63", label: "Series 24/63" },
];

const STATUS_COPY: Record<Status, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  completed:   "Completed",
};

function statusBadgeClass(status: Status) {
  switch (status) {
    case "completed":
      return "border-emerald-400/40 bg-emerald-400/10 text-emerald-200";
    case "in_progress":
      return "border-[#C4A048]/50 bg-[#C4A048]/15 text-[#E8C87A]";
    default:
      return "border-white/15 bg-white/[0.03] text-slate-400";
  }
}

function fmtMinutes(mins: number | undefined) {
  if (!mins) return "—";
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export default function StudyPage() {
  const [activeExam, setActiveExam] = useState<ExamCode>("series_50");
  const [curricula, setCurricula] = useState<Partial<Record<ExamCode, Curriculum>>>({});
  const [progressByExam, setProgressByExam] = useState<
    Partial<Record<ExamCode, Record<string, ProgressEntry>>>
  >({});
  const [loading, setLoading] = useState(false);

  const fetchCurriculum = useCallback(async (exam: ExamCode) => {
    try {
      const res = await fetch(`/api/study/curriculum?exam=${exam}`);
      const json = await res.json();
      if (json.success) {
        setCurricula((prev) => ({ ...prev, [exam]: json.data as Curriculum }));
      }
    } catch { /* swallow — skeleton */ }
  }, []);

  const fetchProgress = useCallback(async (exam: ExamCode) => {
    try {
      const res = await fetch(`/api/study/progress?exam=${exam}`);
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
    // Prefetch all four curricula so tab switches feel instant
    EXAMS.forEach((e) => fetchCurriculum(e.code));
  }, [fetchCurriculum]);

  useEffect(() => {
    fetchProgress(activeExam);
  }, [activeExam, fetchProgress]);

  async function markSection(sectionId: string, status: Status) {
    setLoading(true);
    try {
      const res = await fetch("/api/study/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exam: activeExam,
          section_id: sectionId,
          status,
        }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchProgress(activeExam);
      }
    } catch { /* swallow */ }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      {/* Header — same idiom as EMMA / Treasury */}
      <section className="relative overflow-hidden rounded-[1.8rem] border border-[#C4A048]/25 bg-[#060E1A] p-5 text-slate-100 shadow-[0_0_85px_rgba(196,160,72,0.13)] sm:p-7">
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
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              Track 2 (MSRB Municipal Advisor — Series 50 + 54) registers NEST Advisors LLC to collect transaction-based advisory fees directly on muni transactions. Track 1 (Britehorn-sponsored — Series 7 + 24 + 63) hosts Sean as a registered rep at Britehorn Securities (BD #36402). Both study tracks ship as v1 platform surfaces per ADR-0001.
            </p>
          </div>
          <ExamHeaderStat exam={curricula[activeExam]} />
        </div>
      </section>

      {/* Tabs */}
      <Tabs value={activeExam} onValueChange={(v) => setActiveExam(v as ExamCode)}>
        <TabsList className="grid w-full grid-cols-4 lg:w-[640px]">
          {EXAMS.map((e) => (
            <TabsTrigger key={e.code} value={e.code}>{e.label}</TabsTrigger>
          ))}
        </TabsList>

        {EXAMS.map((e) => {
          const curriculum = curricula[e.code];
          const progress = progressByExam[e.code] || {};
          const sections = curriculum?.sections || [];
          const totalSections = sections.length;
          const completedSections = sections.filter(
            (s) => progress[s.id]?.status === "completed",
          ).length;
          const inProgressSections = sections.filter(
            (s) => progress[s.id]?.status === "in_progress",
          ).length;
          const completionPct = totalSections
            ? Math.round((completedSections / totalSections) * 100)
            : 0;

          const isPlaceholder = e.code === "series_7" || e.code === "series_24_63";

          return (
            <TabsContent key={e.code} value={e.code} className="mt-6 space-y-4">
              {/* Exam meta strip */}
              {curriculum && (
                <Card className="border-white/10 bg-[#0D2218]">
                  <CardContent className="grid gap-4 p-4 text-xs text-slate-300 sm:grid-cols-4">
                    <MetaCell label="Regulator" value={curriculum.regulator} />
                    <MetaCell label="Track" value={curriculum.track} />
                    <MetaCell
                      label="Format"
                      value={`${curriculum.question_count} items · ${fmtMinutes(curriculum.duration_minutes)}`}
                    />
                    <MetaCell
                      label="Passing"
                      value={`${curriculum.passing_score_pct}%`}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Sections */}
              {isPlaceholder && (
                <Card className="border-white/10 bg-[#0D2218]">
                  <CardContent className="p-5">
                    <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-[#C4A048]">
                      Curriculum loading…
                    </p>
                    <p className="mt-2 text-sm text-slate-300">
                      {e.label} outline will populate from the published FINRA / NASAA content outline. Track 1 sequence runs after Track 2 enters Phase 2 per ADR-0001.
                    </p>
                  </CardContent>
                </Card>
              )}

              {!isPlaceholder && sections.map((section) => {
                const entry = progress[section.id];
                const status: Status = entry?.status ?? "not_started";
                return (
                  <Card
                    key={section.id}
                    className="border-slate-700 bg-[#0D2218]"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <CardTitle
                            className="text-base text-white"
                            style={{ fontFamily: "Cormorant Garamond, serif" }}
                          >
                            {section.title}
                          </CardTitle>
                          <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-slate-500">
                            <span>~{fmtMinutes(section.estimated_minutes)}</span>
                            {section.weight_pct != null && (
                              <span>· {section.weight_pct}% weight</span>
                            )}
                            {entry?.time_spent_minutes ? (
                              <span>· Logged {fmtMinutes(entry.time_spent_minutes)}</span>
                            ) : null}
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={statusBadgeClass(status)}
                        >
                          {STATUS_COPY[status]}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-xs leading-5 text-slate-300">
                        {section.description}
                      </p>

                      {section.subsections && section.subsections.length > 0 && (
                        <Accordion type="single" collapsible className="rounded-md border border-white/5 bg-black/20">
                          <AccordionItem value={section.id} className="border-b-0">
                            <AccordionTrigger className="px-3 text-xs text-slate-300 hover:no-underline">
                              <span className="font-mono uppercase tracking-[0.14em] text-slate-400">
                                Sub-topics ({section.subsections.length})
                              </span>
                            </AccordionTrigger>
                            <AccordionContent className="px-3 pb-3">
                              <ul className="space-y-1.5">
                                {section.subsections.map((sub) => {
                                  const subEntry = progress[sub.id];
                                  const subStatus: Status = subEntry?.status ?? "not_started";
                                  return (
                                    <li
                                      key={sub.id}
                                      className="flex items-center justify-between gap-3 rounded-md border border-white/5 bg-white/[0.02] px-2.5 py-1.5"
                                    >
                                      <div className="min-w-0">
                                        <p className="truncate text-xs text-slate-200">{sub.title}</p>
                                        <p className="font-mono text-[0.55rem] uppercase tracking-[0.12em] text-slate-500">
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
                                          className="h-7 border-white/10 bg-white/[0.03] px-2 text-[0.65rem] font-mono uppercase tracking-[0.12em] text-slate-300 hover:bg-white/[0.07]"
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

                      <p className="font-mono text-[0.55rem] uppercase tracking-[0.12em] text-slate-600">
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
                            className="border-white/15 bg-transparent text-slate-400 hover:bg-white/[0.05]"
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
                      <p className="mt-1 text-xs text-slate-400">
                        {completedSections} of {totalSections} sections complete
                        {inProgressSections > 0
                          ? ` · ${inProgressSections} in progress`
                          : ""}
                      </p>
                    </div>
                    <p
                      className="text-2xl font-black text-white"
                      style={{ fontFamily: "IBM Plex Mono, monospace" }}
                    >
                      {completionPct}%
                    </p>
                  </div>
                  <Progress value={completionPct} className="h-2 bg-white/[0.06]" />
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}


// ── small presentational helpers ─────────────────────────────────────


function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[0.55rem] uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-xs text-slate-200">{value}</p>
    </div>
  );
}


function ExamHeaderStat({ exam }: { exam: Curriculum | undefined }) {
  if (!exam) return null;
  return (
    <div className="grid grid-cols-2 gap-3">
      {[
        ["Questions", `${exam.question_count}`],
        ["Duration", fmtMinutes(exam.duration_minutes)],
        ["Pass", `${exam.passing_score_pct}%`],
        ["Sections", `${exam.sections.length}`],
      ].map(([label, value]) => (
        <Card key={label} className="border-white/10 bg-white/[0.04]">
          <CardContent className="p-3">
            <p className="font-mono text-[0.6rem] uppercase tracking-wider text-slate-500">
              {label}
            </p>
            <p
              className="mt-1 text-xl font-black text-white"
              style={{ fontFamily: "IBM Plex Mono, monospace" }}
            >
              {value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
