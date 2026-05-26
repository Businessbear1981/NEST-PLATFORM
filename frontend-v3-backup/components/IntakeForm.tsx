"use client";
import { useState } from "react";
import { submitIntake, type IntakeResult } from "@/lib/marketing";

export default function IntakeForm() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [projectType, setProjectType] = useState("");
  const [sizeUsd, setSizeUsd] = useState<string>("");
  const [timeline, setTimeline] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IntakeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await submitIntake({
        name,
        company,
        email: email || undefined,
        project_type: projectType,
        size_usd: sizeUsd ? Number(sizeUsd) : undefined,
        timeline: timeline || undefined,
      });
      if ((res as { error?: string }).error) {
        setError((res as { error?: string }).error || "Submission failed.");
      } else {
        setResult(res);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="intake-result">
        <h4>Received. Aria is on it.</h4>
        <p className="muted small" style={{ marginBottom: 16 }}>
          Classification: <b style={{ color: "var(--gold)" }}>{result.classification.kind}</b>
          {" · "}priority <b style={{ color: "var(--gold)" }}>{result.classification.priority}</b>
        </p>
        <pre>{result.immediate_response.content}</pre>
        {result.immediate_response.error && (
          <p className="muted small" style={{ marginTop: 12 }}>
            Note: {result.immediate_response.error}
          </p>
        )}
      </div>
    );
  }

  return (
    <form className="intake-form" onSubmit={onSubmit}>
      <div className="row2">
        <div className="field">
          <label>Name</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label>Company</label>
          <input required value={company} onChange={(e) => setCompany(e.target.value)} />
        </div>
      </div>
      <div className="row2">
        <div className="field">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label>Project type</label>
          <select required value={projectType} onChange={(e) => setProjectType(e.target.value)}>
            <option value="">Select…</option>
            <option value="senior_housing">Senior housing</option>
            <option value="industrial">Industrial / cold storage</option>
            <option value="multifamily">Multifamily</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="office">Office / mixed-use</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      <div className="row2">
        <div className="field">
          <label>Deal size (USD)</label>
          <input
            type="number"
            inputMode="numeric"
            placeholder="e.g. 25000000"
            value={sizeUsd}
            onChange={(e) => setSizeUsd(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Timeline</label>
          <select value={timeline} onChange={(e) => setTimeline(e.target.value)}>
            <option value="">Select…</option>
            <option value="immediate">Immediate (0–30 days)</option>
            <option value="q_near">This quarter</option>
            <option value="q_next">Next quarter</option>
            <option value="exploratory">Exploratory</option>
          </select>
        </div>
      </div>
      {error && <p className="err" style={{ marginTop: 0 }}>Error: {error}</p>}
      <button className="btn-primary intake-submit" disabled={loading}>
        {loading ? "Submitting…" : "Start the conversation"}
      </button>
    </form>
  );
}
