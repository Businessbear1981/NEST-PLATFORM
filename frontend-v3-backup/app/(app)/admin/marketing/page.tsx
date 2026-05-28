"use client";
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  listContentTypes,
  generate,
  generateBatch,
  listHistory,
  type ContentType,
  type Generation,
} from "@/lib/marketing";

export default function MarketingStudio() {
  const [types, setTypes] = useState<ContentType[]>([]);
  const [contentType, setContentType] = useState<string>("executive_summary");
  const [dealId, setDealId] = useState("JT-2025-42");
  const [clientName, setClientName] = useState("Jacaranda Trace Partners");
  const [angles, setAngles] = useState(
    "Surety cost-out from 9% to under 1%\nRefi cycle economics\nNEST as a decision, not a service"
  );
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

  function printAsPdf() {
    window.print();
  }

  return (
    <main className="container">
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <h1 style={{ margin: 0 }}>Marketing Studio</h1>
        <span className="pill">Morgan · Jimmy Lee tone</span>
      </div>
      <p style={{ color: "var(--muted)", marginTop: 6 }}>
        Content command center. Every output is direct, decisive, no hedging.
      </p>

      <div className="studio">
        {/* LEFT — content type + context */}
        <div className="card">
          <div className="panel-title">Content type</div>
          <div className="field">
            <label>Type</label>
            <select value={contentType} onChange={(e) => setContentType(e.target.value)}>
              {types.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Deal ID</label>
            <input type="text" value={dealId} onChange={(e) => setDealId(e.target.value)} />
          </div>
          <div className="field">
            <label>Client / sponsor name</label>
            <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} />
          </div>
          <div className="field">
            <label>Angles to hit (one per line)</label>
            <textarea value={angles} onChange={(e) => setAngles(e.target.value)} />
          </div>
          <button className="btn btn-big" disabled={loading} onClick={onGenerate}>
            {loading ? "Generating…" : "Generate"}
          </button>
        </div>

        {/* CENTER — output */}
        <div className="card output">
          <div className="panel-title">Output</div>
          {current ? (
            <>
              <div className="output-meta">
                <span>{current.content_type_label}</span>
                <span>· {current.word_count} words</span>
                <span>· {current.estimated_read_time}</span>
                <span style={{ marginLeft: "auto" }}>
                  <button className="btn-ghost" onClick={() => setEditing((e) => !e)}>
                    {editing ? "Preview" : "Edit"}
                  </button>
                </span>
              </div>
              {current.error && <div className="err">Error: {current.error}</div>}
              {editing ? (
                <textarea
                  className="md-edit"
                  value={displayContent}
                  onChange={(e) => setEdited(e.target.value)}
                />
              ) : (
                <div className="md-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayContent}</ReactMarkdown>
                </div>
              )}
              <div className="actions">
                <button className="btn-ghost" onClick={copyToClipboard}>Copy</button>
                <button className="btn-ghost" onClick={downloadMarkdown}>Download .md</button>
                <button className="btn-ghost" onClick={printAsPdf}>Print / Save PDF</button>
                <button className="btn-ghost" disabled title="DOCX export — wire server-side pandoc later">
                  Download .docx
                </button>
              </div>
            </>
          ) : (
            <p style={{ color: "var(--muted)" }}>
              Pick a content type and hit Generate. The output lands here.
            </p>
          )}
        </div>

        {/* RIGHT — history */}
        <div className="card">
          <div className="panel-title">Recent</div>
          {history.length === 0 && <p style={{ color: "var(--muted)", fontSize: 13 }}>Nothing yet.</p>}
          {history.map((h) => (
            <div
              key={h.id}
              className="history-item"
              onClick={() => {
                setCurrent(h);
                setEdited(null);
                setEditing(false);
              }}
            >
              <div style={{ fontSize: 13 }}>{h.content_type_label}</div>
              <div className="ts">
                {new Date(h.generated_at).toLocaleString()} · {h.word_count}w
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM — batch */}
      <div className="batch-bar">
        <div style={{ fontWeight: 600 }}>Batch · full deal marketing package</div>
        <span style={{ color: "var(--muted)", fontSize: 13 }}>
          exec summary + teaser + term-sheet cover + deck slide
        </span>
        <input
          type="text"
          style={{ flex: "1 1 200px" }}
          value={batchDeal}
          onChange={(e) => setBatchDeal(e.target.value)}
          placeholder="deal_id"
        />
        <button className="btn" disabled={batchLoading || !batchDeal} onClick={onBatch}>
          {batchLoading ? "Building package…" : "Build package"}
        </button>
      </div>
    </main>
  );
}
