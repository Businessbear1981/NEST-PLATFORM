"use client";
import { useEffect, useState } from "react";
import { Send, Users, Calendar, RefreshCw, Target, Zap } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://nest-platform-production.up.railway.app";

interface TimelineStep { day: number; action: string; }
interface CampaignData {
  sector: string;
  targets: number;
  timeline: TimelineStep[];
  created_at: string;
}
interface ScanTarget {
  name?: string; company?: string; title?: string; email?: string; score?: number;
}

const SECTORS = ["senior_living", "multifamily", "industrial", "office", "retail", "hospitality"];

export default function BDPage() {
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [scanResults, setScanResults] = useState<ScanTarget[]>([]);
  const [sector, setSector] = useState("senior_living");
  const [loading, setLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);

  async function loadCampaign(s: string) {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/bd/campaign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targets: [], sector: s }),
      });
      const json = await res.json();
      if (json.success) setCampaign(json.data);
    } finally { setLoading(false); }
  }

  async function runScan(s: string) {
    setScanLoading(true);
    try {
      const res = await fetch(`${API}/api/bd/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sector: s }),
      });
      const json = await res.json();
      if (json.success) setScanResults(Array.isArray(json.data) ? json.data : []);
    } finally { setScanLoading(false); }
  }

  useEffect(() => {
    loadCampaign(sector);
    runScan(sector);
  }, [sector]);

  return (
    <main className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="font-mono text-[0.7rem] uppercase tracking-widest text-[#7A9A82]">Aria Outreach Engine</p>
          <h1 className="font-[Cormorant_Garamond] text-3xl text-[#EDE8DC] mt-1">Business Development</h1>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="bg-[#0D2218] border border-[#C4A048]/30 text-[#EDE8DC] font-mono text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-[#C4A048]"
          >
            {SECTORS.map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, " ").toUpperCase()}</option>
            ))}
          </select>
          <button
            onClick={() => { loadCampaign(sector); runScan(sector); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C4A048]/10 border border-[#C4A048]/30 text-[#C4A048] font-mono text-xs hover:bg-[#C4A048]/20 transition-colors"
          >
            <RefreshCw size={12} className={loading || scanLoading ? "animate-spin" : ""} />
            REFRESH
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "ACTIVE SECTOR", value: sector.replace(/_/g, " ").toUpperCase(), icon: <Target size={14} /> },
          { label: "OUTREACH STEPS", value: campaign ? String(campaign.timeline.length) : "—", icon: <Calendar size={14} /> },
          { label: "PIPELINE TARGETS", value: scanResults.length > 0 ? String(scanResults.length) : "0", icon: <Users size={14} /> },
          { label: "ARIA STATUS", value: "ACTIVE", icon: <Zap size={14} /> },
        ].map(({ label, value, icon }) => (
          <div key={label} className="rounded-[1.35rem] border border-[#C4A048]/20 bg-[#0D2218]/70 p-4">
            <div className="flex items-center gap-2 mb-2 text-[#7A9A82]">{icon}
              <p className="font-mono text-[0.65rem] uppercase tracking-widest">{label}</p>
            </div>
            <strong className="font-mono text-xl text-[#C4A048]">{value}</strong>
          </div>
        ))}
      </div>

      {/* Outreach Sequence */}
      <div className="rounded-[1.35rem] border border-[#C4A048]/20 bg-[#0D2218]/70 p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Send size={14} className="text-[#C4A048]" />
          <p className="font-mono text-[0.7rem] uppercase tracking-widest text-[#7A9A82]">Aria 30-Day Outreach Sequence</p>
        </div>
        {loading ? (
          <p className="font-mono text-xs text-[#7A9A82]">Loading sequence...</p>
        ) : campaign?.timeline.length ? (
          <div className="space-y-3">
            {campaign.timeline.map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 rounded-full border border-[#C4A048]/30 bg-[#0D2218] flex items-center justify-center">
                  <span className="font-mono text-[0.65rem] text-[#C4A048]">D{step.day}</span>
                </div>
                <div className="flex-1 pt-2">
                  <p className="text-[#EDE8DC] text-sm">{step.action}</p>
                </div>
                {i < campaign.timeline.length - 1 && (
                  <div className="absolute ml-5 mt-10 w-px h-3 bg-[#C4A048]/20" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="font-mono text-xs text-[#7A9A82]">No sequence loaded. Select a sector to generate.</p>
        )}
      </div>

      {/* Scan Results */}
      <div className="rounded-[1.35rem] border border-[#C4A048]/20 bg-[#0D2218]/70 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users size={14} className="text-[#C4A048]" />
          <p className="font-mono text-[0.7rem] uppercase tracking-widest text-[#7A9A82]">EagleEye Sector Scan — {sector.replace(/_/g, " ")}</p>
        </div>
        {scanLoading ? (
          <p className="font-mono text-xs text-[#7A9A82]">Scanning sector...</p>
        ) : scanResults.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full font-mono text-xs">
              <thead>
                <tr className="border-b border-[#C4A048]/10">
                  {["Name", "Company", "Title", "Email", "Score"].map((h) => (
                    <th key={h} className="text-left py-2 pr-4 text-[#7A9A82] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scanResults.map((t, i) => (
                  <tr key={i} className="border-b border-[#C4A048]/5 hover:bg-[#C4A048]/5 transition-colors">
                    <td className="py-2 pr-4 text-[#EDE8DC]">{t.name ?? "—"}</td>
                    <td className="py-2 pr-4 text-[#EDE8DC]">{t.company ?? "—"}</td>
                    <td className="py-2 pr-4 text-[#7A9A82]">{t.title ?? "—"}</td>
                    <td className="py-2 pr-4 text-[#7A9A82]">{t.email ?? "—"}</td>
                    <td className="py-2 pr-4 text-[#C4A048]">{t.score ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="font-mono text-xs text-[#7A9A82]">No targets in pipeline for <span className="text-[#C4A048]">{sector.replace(/_/g, " ")}</span>.</p>
            <p className="font-mono text-[0.65rem] text-[#7A9A82]/60 mt-1">Aria will populate targets as EagleEye scans complete.</p>
          </div>
        )}
      </div>
    </main>
  );
}
