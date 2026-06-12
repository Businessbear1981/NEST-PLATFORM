"use client";
import { useEffect, useMemo, useState } from "react";

const API = "";

/* ── Types ── */
type ContentType = { value: string; label: string };

type Generation = {
  id: string;
  content_type: string;
  content_type_label: string;
  content: string;
  word_count: number;
  estimated_read_time: string;
  generated_at: string;
  context: Record<string, unknown>;
  error?: string | null;
};

/* ── Inline API calls (replaces marketing.ts lib) ── */
async function listContentTypes(): Promise<ContentType[]> {
  try {
    const r = await fetch(`${API}/api/marketing/content-types`, { cache: "no-store" });
    return r.json();
  } catch { return []; }
}

async function generate(content_type: string, context: Record<string, unknown>): Promise<Generation> {
  const r = await fetch(`${API}/api/marketing/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content_type, context }),
  });
  return r.json();
}

async function generateBatch(deal_id: string, context: Record<string, unknown>) {
  const r = await fetch(`${API}/api/marketing/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deal_id, context }),
  });
  return r.json();
}

async function listHistory(): Promise<Generation[]> {
  try {
    const r = await fetch(`${API}/api/marketing/history`, { cache: "no-store" });
    if (!r.ok) return [];
    return r.json();
  } catch { return []; }
}

export default function MarketingStudio() {
  const [types, setTypes] = useState<ContentType[]>([]);
  const [contentType, setContentType] = useState<string>("executive_summary");
  const [dealId, setDealId] = useState("JT-2025-42");
  const [clientName, setClientName] = useState("Jacaranda Trace Partners");
  const [angles, setAngles] = useState("Surety cost-out from 9% to under 1%\nRefi cycle economics\nNEST as a decision, not a service");
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState<Generation | null>(null);
  const [edited, setEdited] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [history, setHistory] = useState<Generation[]>([]);
  const [batchDeal, setBatchDeal] = useState("JT-2025-42");
  const [batchLoading, setBatchLoading] = useState(false);

  useEffect(() => {
    listContentTypes().then(setTypes).catch(() => {});
    listHistory().then(setHistory).catch(() => {});
  }, []);

  const displayContent = useMemo(
    () => (edited !== null ? edited : current?.content || ""),
    [edited, current]
  );

  async function onGenerate() {
    setLoading(true);
    setEdited(null);
    setEditing(false);
    try {
      const context = {
        deal_id: dealId || undefined,
        client_name: clientName || undefined,
        angles: angles.split("\n").map((s) => s.trim()).filter(Boolean),
      };
      const rec = await generate(contentType, context);
      setCurrent(rec);
      const fresh = await listHistory();
      setHistory(fresh);
    } finally {
      setLoading(false);
    }
  }

  async function onBatch() {
    if (!batchDeal) return;
    setBatchLoading(true);
    try {
      const context = { client_name: clientName, angles: angles.split("\n").filter(Boolean) };
      const pkg = await generateBatch(batchDeal, context);
      const first = Object.values(pkg.materials)[0] as Generation | undefined;
      if (first) setCurrent(first);
      const fresh = await listHistory();
      setHistory(fresh);
    } finally {
      setBatchLoading(false);
    }
  }

  function downloadMarkdown() {
    if (!current) return;
    const blob = new Blob([displayContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nest_${current.content_type}_${current.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copyToClipboard() {
    await navigator.clipboard.writeText(displayContent);
  }

  const inputCls = "mt-1 w-full rounded-lg border border-white/10 bg-[#03060b] px-3 py-2 font-mono text-xs text-white outline-none focus:border-amber-300/40";

  return (
    <main className="min-h-screen bg-[#03060b] px-6 py-8 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-5">
        {/* Header */}
        <div className="rounded-[1.5rem] border border-amber-300/20 bg-[#07101a]/80 p-6">
          <div className="flex items-baseline gap-3">
            <h1 className="font-mono text-xl font-bold uppercase tracking-[0.06em] text-white">Marketing Studio</h1>
            <span className="rounded bg-amber-300/15 px-2 py-0.5 font-mono text-[0.55rem] font-semibold text-amber-300">Morgan - Jimmy Lee tone</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Content command center. Every output is direct, decisive, no hedging.</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[300px_1fr_240px]">
          {/* LEFT - Content type + context */}
          <div className="rounded-[1.25rem] border border-white/10 bg-[#07101a]/80 p-5 space-y-3">
            <h3 className="font-mono text-sm font-bold uppercase tracking-[0.1em] text-slate-400">Content Type</h3>
            <label className="block">
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-slate-600">Type</span>
              <select className={inputCls} value={contentType} onChange={(e) => setContentType(e.target.value)}>
                {types.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-slate-600">Deal ID</span>
              <input className={inputCls} value={dealId} onChange={(e) => setDealId(e.target.value)} />
            </label>
            <label className="block">
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-slate-600">Client / Sponsor Name</span>
              <input className={inputCls} value={clientName} onChange={(e) => setClientName(e.target.value)} />
            </label>
            <label className="block">
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-slate-600">Angles to Hit (one per line)</span>
              <textarea className={`${inputCls} resize-y`} rows={4} value={angles} onChange={(e) => setAngles(e.target.value)} />
            </label>
            <button
              onClick={onGenerate}
              disabled={loading}
              className="w-full rounded-[1rem] border border-amber-300/40 bg-amber-300/10 px-5 py-3 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-amber-200 transition hover:bg-amber-300/20 disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate"}
            </button>
          </div>

          {/* CENTER - Output */}
          <div className="rounded-[1.25rem] border border-white/10 bg-[#07101a]/80 p-5">
            <h3 className="mb-3 font-mono text-sm font-bold uppercase tracking-[0.1em] text-slate-400">Output</h3>
            {current ? (
              <>
                <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>{current.content_type_label}</span>
                  <span>- {current.word_count} words</span>
                  <span>- {current.estimated_read_time}</span>
                  <button
                    onClick={() => setEditing((e) => !e)}
                    className="ml-auto rounded border border-white/10 px-2 py-0.5 font-mono text-[0.6rem] text-slate-400 hover:text-white"
                  >
                    {editing ? "Preview" : "Edit"}
                  </button>
                </div>
                {current.error && <div className="mb-2 rounded bg-red-500/15 p-2 text-xs text-red-400">Error: {current.error}</div>}
                {editing ? (
                  <textarea
                    className="h-96 w-full rounded-lg border border-white/10 bg-[#03060b] p-3 font-mono text-xs text-white outline-none"
                    value={displayContent}
                    onChange={(e) => setEdited(e.target.value)}
                  />
                ) : (
                  <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap font-mono text-xs leading-7 text-slate-300">
                    {displayContent}
                  </div>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    { label: "Copy", onClick: copyToClipboard },
                    { label: "Download .md", onClick: downloadMarkdown },
                    { label: "Print / Save PDF", onClick: () => window.print() },
                  ].map((btn) => (
                    <button
                      key={btn.label}
                      onClick={btn.onClick}
                      className="rounded border border-white/10 px-3 py-1.5 font-mono text-[0.6rem] text-slate-400 transition hover:bg-white/5 hover:text-white"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-600">Pick a content type and hit Generate. The output lands here.</p>
            )}
          </div>

          {/* RIGHT - History */}
          <div className="rounded-[1.25rem] border border-white/10 bg-[#07101a]/80 p-5">
            <h3 className="mb-3 font-mono text-sm font-bold uppercase tracking-[0.1em] text-slate-400">Recent</h3>
            {history.length === 0 && <p className="text-xs text-slate-600">Nothing yet.</p>}
            {history.map((h) => (
              <div
                key={h.id}
                className="cursor-pointer border-b border-white/5 py-2 last:border-b-0 hover:bg-white/5"
                onClick={() => { setCurrent(h); setEdited(null); setEditing(false); }}
              >
                <div className="text-xs text-slate-300">{h.content_type_label}</div>
                <div className="font-mono text-[0.55rem] text-slate-600">
                  {new Date(h.generated_at).toLocaleString()} - {h.word_count}w
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Batch Bar */}
        <div className="flex flex-wrap items-center gap-3 rounded-[1.25rem] border border-white/10 bg-[#07101a]/80 p-4">
          <div className="font-mono text-xs font-semibold text-white">Batch - Full Deal Marketing Package</div>
          <span className="text-xs text-slate-600">exec summary + teaser + term-sheet cover + deck slide</span>
          <input
            className="flex-1 rounded-lg border border-white/10 bg-[#03060b] px-3 py-2 font-mono text-xs text-white outline-none focus:border-amber-300/40"
            style={{ minWidth: 200 }}
            value={batchDeal}
            onChange={(e) => setBatchDeal(e.target.value)}
            placeholder="deal_id"
          />
          <button
            onClick={onBatch}
            disabled={batchLoading || !batchDeal}
            className="rounded-[1rem] border border-amber-300/40 bg-amber-300/10 px-5 py-2 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-amber-200 transition hover:bg-amber-300/20 disabled:opacity-50"
          >
            {batchLoading ? "Building package..." : "Build Package"}
          </button>
        </div>
      </div>
    </main>
  );
}
