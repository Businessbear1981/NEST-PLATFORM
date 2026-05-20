'use client';
import { useState, useEffect } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function ForensicPage() {
  const [standards, setStandards] = useState<any>(null);
  const [auditResult, setAuditResult] = useState<any>(null);
  const [running, setRunning] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API}/api/audit/standards`).then(r => r.json()).then(d => setStandards(d.data)).catch(() => {});
  }, []);

  async function runAudit() {
    setRunning(true);
    const token = localStorage.getItem('nest_token');
    const res = await fetch(`${API}/api/audit/run`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ deal: { name: 'Current Deal' }, documents: {}, financials: {} }),
    });
    const d = await res.json();
    setAuditResult(d.data);
    setRunning(false);
  }

  return (
    <div>
      <h1 className="serif" style={{ fontSize: 36, color: 'var(--gold)', marginBottom: 4 }}>Forensic Audit Engine</h1>
      <p className="sage" style={{ fontSize: 13, marginBottom: 24, fontStyle: 'italic' }}>If it passes this, it passes the rating agencies.</p>

      {/* AUDIT STANDARDS */}
      {standards && (
        <div style={{ marginBottom: 24 }}>
          <div className="section-header">Audit Categories</div>
          {Object.entries(standards).map(([key, val]: [string, any]) => (
            <div key={key} className="card" style={{ marginBottom: 8 }}>
              <button onClick={() => setExpanded(expanded === key ? null : key)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', color: 'var(--cream)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="serif" style={{ fontSize: 18 }}>{key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                  <span className="mono moss" style={{ fontSize: 9, marginLeft: 12 }}>{val.level}</span>
                </div>
                <span className="tag-gray">{val.checks?.length} checks</span>
              </button>
              {expanded === key && (
                <div style={{ marginTop: 12 }}>
                  <div className="sage" style={{ fontSize: 12, marginBottom: 8 }}>{val.description}</div>
                  {val.checks?.map((check: string, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '4px 0', fontSize: 12 }}>
                      <span style={{ color: 'var(--moss)', flexShrink: 0 }}>?</span>
                      <span>{check}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <button className="btn-gold" onClick={runAudit} disabled={running} style={{ marginBottom: 24 }}>
        {running ? 'Running FBI/DOJ-standard analysis...' : 'Run Full Forensic Audit'}
      </button>

      {/* AUDIT RESULTS */}
      {auditResult && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            <div className="kpi">
              <div className="kpi-label">Overall Score</div>
              <div className="kpi-value" style={{ fontSize: 36 }}>{auditResult.overall_score}</div>
              <div className="kpi-sub">/100</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Clean Opinion</div>
              <div className={auditResult.clean_opinion ? 'tag-green' : 'tag-red'} style={{ fontSize: 14, marginTop: 8 }}>
                {auditResult.clean_opinion ? 'YES' : 'NO'}
              </div>
            </div>
            <div className="kpi">
              <div className="kpi-label">JP Morgan Ready</div>
              <div className={auditResult.jp_morgan_ready ? 'tag-green' : 'tag-red'} style={{ fontSize: 14, marginTop: 8 }}>
                {auditResult.jp_morgan_ready ? 'YES' : 'NO'}
              </div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Total Findings</div>
              <div className="kpi-value">{auditResult.total_findings}</div>
            </div>
          </div>

          {auditResult.critical_issues?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div className="section-header">Critical Issues — Must Resolve</div>
              {auditResult.critical_issues.map((issue: any, i: number) => (
                <div key={i} className="card-alert" style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 12 }}>{issue.check}</div>
                  <div className="sage" style={{ fontSize: 11, marginTop: 4 }}>{issue.recommendation}</div>
                </div>
              ))}
            </div>
          )}

          {/* Category Scores */}
          <div className="card">
            <div className="section-header">Category Breakdown</div>
            {Object.entries(auditResult.category_scores || {}).map(([cat, data]: [string, any]) => (
              <div key={cat} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, textTransform: 'capitalize' }}>{cat.replace(/_/g, ' ')}</span>
                  <span className="mono gold" style={{ fontSize: 12 }}>{data.score}/100</span>
                </div>
                <div className="progress-track">
                  <div className={`progress-fill ${data.score >= 80 ? 'progress-fill-green' : data.score >= 50 ? '' : 'progress-fill-red'}`}
                    style={{ width: `${data.score}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mono moss" style={{ fontSize: 9, marginTop: 12 }}>Audit Trail: {auditResult.audit_trail_hash}</div>
        </div>
      )}
    </div>
  );
}
