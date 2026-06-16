"use client";
/**
 * Roots Document Upload — Drag & drop triggers Bernard analysis.
 * Documents auto-classify into the correct slot in the deal package.
 * Shows % completeness toward credit readiness.
 */
import { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.nestadvisors.tech";

const DOC_SLOTS = [
  { key: "audited_financials", label: "Audited Financial Statements", required: true, description: "Balance sheet, income statement, cash flows — 2-3 years" },
  { key: "officer_certificate", label: "Officer's Certificate / Covenant Compliance", required: true, description: "DSCR, days cash, debt yield, bond compliance" },
  { key: "appraisal", label: "Appraisal / Feasibility Study", required: true, description: "Property value, unit mix, occupancy, market data" },
  { key: "rent_roll", label: "Rent Roll / Unit Schedule", required: false, description: "Unit-level occupancy, rents, lease terms" },
  { key: "proforma", label: "Pro Forma / Projections", required: true, description: "Forward-looking financials, stabilization timeline" },
  { key: "sources_and_uses", label: "Sources & Uses", required: true, description: "Bond proceeds, equity, reserves, costs" },
  { key: "capital_stack", label: "Capital Stack / Term Sheet", required: false, description: "Senior/sub/mezz/equity breakdown" },
  { key: "quality_of_earnings", label: "Quality of Earnings (M&A)", required: false, description: "Adjusted EBITDA, normalizations — M&A deals only" },
  { key: "environmental", label: "Environmental / Phase I", required: false, description: "Environmental assessment, remediation needs" },
  { key: "title", label: "Title Report / Survey", required: false, description: "Title commitment, survey, easements" },
  { key: "insurance", label: "Insurance Certificates", required: false, description: "GL, property, builder's risk, D&O" },
  { key: "organizational", label: "Organizational Documents", required: false, description: "Formation docs, operating agreement, bylaws" },
];

type UploadedDoc = {
  filename: string;
  doc_type: string;
  fields_extracted: string[];
  fields_missing: string[];
  bernard_narration: string | null;
  uploaded_at: string;
};

type DealSummary = {
  id: string;
  name: string;
  status?: string;
  project?: { name?: string; city?: string; state?: string; asset_type?: string; total_project_cost_usd?: number };
};

export default function RootsUploadPage() {
  const [deals, setDeals] = useState<DealSummary[]>([]);
  const [selectedDealId, setSelectedDealId] = useState("");
  const [dealsLoading, setDealsLoading] = useState(true);
  const [uploads, setUploads] = useState<UploadedDoc[]>([]);
  const [completeness, setCompleteness] = useState<any>(null);
  const [dealFinancials, setDealFinancials] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [lastNarration, setLastNarration] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load deals created in Deal Input — the same persisted records, no silo.
  useEffect(() => {
    fetch(`${API}/api/deals`, { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        if (d.success && Array.isArray(d.data)) {
          setDeals(d.data);
          setSelectedDealId(prev => prev || (d.data[0]?.id ?? ""));
        }
      })
      .catch(() => {})
      .finally(() => setDealsLoading(false));
  }, []);

  // Switching deals resets the per-deal ingestion view.
  useEffect(() => {
    setUploads([]);
    setCompleteness(null);
    setDealFinancials(null);
    setLastNarration(null);
  }, [selectedDealId]);

  const processFile = useCallback(async (file: File) => {
    if (!selectedDealId) return;
    setUploading(true);
    try {
      // Read file as text (for PDFs this would need server-side parsing)
      const text = await file.text();

      const res = await fetch(`${API}/api/docs/ingest/${selectedDealId}/ingest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, filename: file.name }),
      });
      const data = await res.json();

      if (data.success) {
        const doc = data.data.document;
        setUploads(prev => [...prev, {
          filename: doc.filename,
          doc_type: doc.type,
          fields_extracted: doc.fields_extracted || [],
          fields_missing: doc.fields_missing || [],
          bernard_narration: data.data.bernard_narration,
          uploaded_at: new Date().toISOString(),
        }]);
        setCompleteness(data.data.completeness);
        setDealFinancials(data.data.deal_financials);
        setLastNarration(data.data.bernard_narration);
      }
    } catch (e) {
      console.error("Upload error:", e);
    } finally {
      setUploading(false);
    }
  }, [selectedDealId]);

  const selectedDeal = deals.find(d => d.id === selectedDealId);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    files.forEach(processFile);
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(processFile);
  }, [processFile]);

  const filledSlots = new Set(uploads.map(u => u.doc_type));
  const requiredSlots = DOC_SLOTS.filter(s => s.required);
  const requiredFilled = requiredSlots.filter(s => filledSlots.has(s.key)).length;
  const overallPct = completeness?.completeness_pct || Math.round((requiredFilled / requiredSlots.length) * 100);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[1.8rem] border border-emerald-300/25 bg-[#060E1A] p-5 text-[#EDE8DC] sm:p-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(16,185,129,0.15),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.76),rgba(2,6,23,0.96))]" />
        <div className="relative grid gap-5 lg:grid-cols-[1fr_0.4fr]">
          <div>
            <div className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-emerald-200">Roots · Document Ingestion · Stage 1</div>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-white" style={{ fontFamily: "Cormorant Garamond, serif" }}>Document Upload</h1>
            <p className="mt-2 text-sm text-[#7A9A82]">
              Drop files here. Bernard auto-classifies each document, extracts financial data,
              and assigns it to the correct slot in the deal package. Credit readiness advances
              as documents are ingested.
            </p>

            {/* Deal selector — the same deals created in Deal Input */}
            <div className="mt-4">
              <label className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[#7A9A82]">Active Deal</label>
              <select
                value={selectedDealId}
                onChange={(e) => setSelectedDealId(e.target.value)}
                disabled={dealsLoading || deals.length === 0}
                className="mt-1 w-full max-w-md rounded-lg border border-emerald-300/25 bg-[#030A06] px-3 py-2 font-mono text-sm text-emerald-100 focus:border-emerald-400 focus:outline-none disabled:opacity-50"
              >
                {dealsLoading && <option>Loading deals…</option>}
                {!dealsLoading && deals.length === 0 && <option value="">No deals yet — create one in Deal Input</option>}
                {deals.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}{d.project?.city ? ` — ${d.project.city}, ${d.project.state ?? ""}` : ""}{d.status ? ` · ${d.status}` : ""}
                  </option>
                ))}
              </select>
              {selectedDeal?.project?.total_project_cost_usd ? (
                <p className="mt-1 font-mono text-[0.55rem] text-[#7A9A82]">
                  {selectedDeal.project.asset_type?.replace(/_/g, " ")} · TPC ${selectedDeal.project.total_project_cost_usd.toLocaleString()}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="text-center">
              <p className="font-mono text-4xl font-black text-emerald-400">{overallPct}%</p>
              <p className="font-mono text-[0.6rem] uppercase text-[#7A9A82] mt-1">Credit Ready</p>
            </div>
            <Progress value={overallPct} className="w-full mt-3 h-2" />
            <p className="font-mono text-[0.55rem] text-[#7A9A82] mt-1">
              {requiredFilled}/{requiredSlots.length} required docs
            </p>
          </div>
        </div>
      </section>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { if (selectedDealId) { e.preventDefault(); setDragOver(true); } }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => { if (selectedDealId) fileInputRef.current?.click(); }}
        className={`rounded-2xl border-2 border-dashed p-12 text-center transition-all ${
          !selectedDealId
            ? "border-[#0D2218] bg-[#0D2218]/20 cursor-not-allowed opacity-60"
            : dragOver
            ? "border-emerald-400 bg-emerald-400/10 shadow-[0_0_30px_rgba(16,185,129,0.15)] cursor-pointer"
            : uploading
            ? "border-[#C4A048] bg-[#C4A048]/5 animate-pulse cursor-pointer"
            : "border-[#1E4A2E] bg-[#0D2218]/30 hover:border-[#2D6B3D] cursor-pointer"
        }`}
      >
        <input ref={fileInputRef} type="file" multiple accept=".pdf,.xlsx,.xls,.csv,.doc,.docx,.txt"
          onChange={handleFileSelect} className="hidden" />
        {!selectedDealId ? (
          <div>
            <p className="text-lg text-[#EDE8DC] font-semibold">Select a deal to begin</p>
            <p className="text-sm text-[#7A9A82] mt-1">Choose a deal above — or create one in Deal Input — then upload its document package here.</p>
          </div>
        ) : uploading ? (
          <div>
            <p className="text-lg text-[#C4A048] font-semibold">Bernard is analyzing...</p>
            <p className="text-sm text-[#7A9A82] mt-1">Classifying document, extracting financials</p>
          </div>
        ) : (
          <div>
            <p className="text-lg text-white font-semibold">Drop documents here</p>
            <p className="text-sm text-[#7A9A82] mt-1">PDF, Excel, or text — Bernard classifies and extracts automatically</p>
            <p className="font-mono text-[0.6rem] text-[#7A9A82] mt-3">
              Financials · Appraisals · Officer Certs · Pro Formas · Rent Rolls · S&U · QofE
            </p>
          </div>
        )}
      </div>

      {/* Bernard's Last Narration */}
      {lastNarration && (
        <Card className="border-[#C4A048]/20 bg-[#0D2218]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-[0.65rem] uppercase tracking-wider text-[#C4A048]">Bernard</span>
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-[0.55rem]">Auto-Analysis</Badge>
            </div>
            <p className="text-sm text-[#EDE8DC] whitespace-pre-wrap">{lastNarration}</p>
          </CardContent>
        </Card>
      )}

      {/* Document Package — Slots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {DOC_SLOTS.map((slot) => {
          const filled = uploads.find(u => u.doc_type === slot.key);
          return (
            <Card key={slot.key} className={`transition ${
              filled ? "border-emerald-500/30 bg-[#0D2218]" : slot.required ? "border-red-500/15 bg-[#0D2218]/50" : "border-[#1E4A2E]/40 bg-[#0D2218]/30"
            }`}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${filled ? "bg-emerald-500" : slot.required ? "bg-red-500/50" : "bg-[#1E4A2E]"}`} />
                    <span className="text-sm font-semibold text-white">{slot.label}</span>
                  </div>
                  <div className="flex gap-1">
                    {slot.required && <Badge variant="outline" className="text-[0.5rem] border-red-500/30 text-red-400">Required</Badge>}
                    {filled && <Badge variant="outline" className="text-[0.5rem] border-emerald-500/30 text-emerald-400">Uploaded</Badge>}
                  </div>
                </div>
                <p className="text-[0.65rem] text-[#7A9A82] ml-4.5">{slot.description}</p>
                {filled && (
                  <div className="mt-2 ml-4.5">
                    <p className="font-mono text-[0.55rem] text-emerald-400">{filled.filename}</p>
                    <p className="font-mono text-[0.5rem] text-[#7A9A82]">{filled.fields_extracted.length} fields extracted</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Extracted Financials Summary */}
      {dealFinancials && Object.keys(dealFinancials).filter(k => !k.startsWith('_')).length > 0 && (
        <Card className="border-[#C4A048]/20 bg-[#0D2218]">
          <CardHeader>
            <CardTitle className="text-[#C4A048] text-sm" style={{ fontFamily: "Cormorant Garamond" }}>
              Extracted Deal Financials — {uploads.length} documents ingested
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(dealFinancials)
                .filter(([k]) => !k.startsWith('_') && k !== 'property' && k !== 'rent_roll' && k !== 'qoe' && k !== 'sources_and_uses')
                .slice(0, 16)
                .map(([k, v]) => (
                  <div key={k} className="rounded-lg border border-white/5 bg-black/20 p-2">
                    <p className="font-mono text-[0.5rem] uppercase text-[#7A9A82]">{k.replace(/_/g, " ")}</p>
                    <p className="font-mono text-sm text-white mt-0.5">
                      {typeof v === "number" && v > 1000 ? `$${v.toLocaleString()}` : typeof v === "number" ? v.toFixed(2) : String(v)}
                    </p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completeness Detail */}
      {completeness && (
        <Card className="border-[#1E4A2E] bg-[#0D2218]">
          <CardHeader>
            <CardTitle className="text-sm text-white flex items-center justify-between">
              <span>Credit Readiness Assessment</span>
              <Badge variant={completeness.ready_for_credit ? "default" : "destructive"}>
                {completeness.ready_for_credit ? "Ready for Credit" : "Docs Needed"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-mono text-[0.6rem] uppercase text-emerald-400 mb-2">Found ({completeness.critical_found?.length + completeness.important_found?.length})</p>
                {[...(completeness.critical_found || []), ...(completeness.important_found || [])].map((f: string) => (
                  <div key={f} className="flex items-center gap-1.5 py-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-xs text-[#EDE8DC]">{f.replace(/_/g, " ")}</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="font-mono text-[0.6rem] uppercase text-red-400 mb-2">Missing ({completeness.critical_missing?.length + completeness.important_missing?.length})</p>
                {[...(completeness.critical_missing || []), ...(completeness.important_missing || [])].map((f: string) => (
                  <div key={f} className="flex items-center gap-1.5 py-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                    <span className="text-xs text-[#7A9A82]">{f.replace(/_/g, " ")}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action: Run Pipeline when ready */}
      {completeness?.ready_for_credit && (
        <Button className="w-full bg-[#C4A048] text-[#030A06] hover:bg-[#E8C87A] py-4 text-sm font-semibold">
          Documents Complete — Advance to Credit Analysis →
        </Button>
      )}
    </div>
  );
}
