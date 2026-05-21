import { useMemo, useState } from "react";
import { BadgeCheck, Building2, ClipboardList, MapPin, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const assetClasses = ["Mixed-Use", "Hospitality", "Office Conversion", "Senior Living", "Industrial"];
const jurisdictions = ["NY-NYC", "CA-LA", "TX-AUS", "FL-MIA", "IL-CHI"];

const permitMatrix: Record<string, string[]> = {
  "Mixed-Use": ["Zoning conformance letter", "Building permit", "Retail certificate of occupancy", "Environmental Phase I"],
  Hospitality: ["Hotel operating license", "Fire-life-safety inspection", "Liquor permit review", "ADA accessibility packet"],
  "Office Conversion": ["Adaptive reuse permit", "Historic district review", "Change-of-use approval", "Tenant relocation affidavit"],
  "Senior Living": ["Healthcare facility license", "Life-safety review", "Resident care plan approval", "Certificate of need screen"],
  Industrial: ["Environmental screening", "Loading-dock traffic permit", "Stormwater plan", "Warehouse occupancy certificate"],
};

export function PodCodeIntakeForm() {
  const [assetClass, setAssetClass] = useState(assetClasses[0]);
  const [jurisdiction, setJurisdiction] = useState(jurisdictions[0]);
  const [sponsor, setSponsor] = useState("NEST Capital Partners");
  const [generated, setGenerated] = useState(false);

  const podCode = useMemo(() => {
    const asset = assetClass.replace(/[^A-Z]/gi, "").slice(0, 3).toUpperCase().padEnd(3, "X");
    const region = jurisdiction.replace(/[^A-Z]/gi, "").slice(0, 5).toUpperCase();
    const sponsorCode = sponsor.replace(/[^A-Z0-9]/gi, "").slice(0, 4).toUpperCase().padEnd(4, "NEST").slice(0, 4);
    return `POD-${asset}-${region}-${sponsorCode}-26`;
  }, [assetClass, jurisdiction, sponsor]);

  const permits = permitMatrix[assetClass] ?? [];

  return (
    <Card className="border-cyan-300/25 bg-[#06111c]/90 p-5 text-slate-100 shadow-[0_0_42px_rgba(34,211,238,0.10)]">
      <div className="mb-5 flex flex-col gap-3 border-b border-white/10 pb-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="flex items-center gap-2 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-cyan-200">
            <ClipboardList size={14} /> Pod code intake · auto-permit checklist
          </p>
          <h2 className="mt-2 font-mono text-lg font-semibold uppercase tracking-[0.05em] text-white">Deal intake compiler</h2>
          <p className="mt-1 text-sm leading-6 text-slate-400">
            Select asset class and jurisdiction to generate the operational pod code and auto-populate the first permit evidence checklist.
          </p>
        </div>
        <Badge className="w-fit border border-cyan-300/30 bg-cyan-400/10 text-cyan-100">{generated ? "POD GENERATED" : "DRAFT MODE"}</Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="space-y-4 rounded-2xl border border-white/10 bg-black/25 p-4">
          <label className="block text-sm font-semibold text-slate-200">
            Sponsor
            <input
              value={sponsor}
              onChange={(event) => setSponsor(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-cyan-300/40 focus:ring-2"
            />
          </label>

          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-200"><Building2 size={15} /> Asset class</p>
            <div className="flex flex-wrap gap-2">
              {assetClasses.map((item) => (
                <Button key={item} type="button" size="sm" variant={assetClass === item ? "default" : "outline"} onClick={() => setAssetClass(item)} className={assetClass === item ? "bg-cyan-600 text-white hover:bg-cyan-500" : "border-slate-700 bg-black/20 text-slate-300"}>
                  {item}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-200"><MapPin size={15} /> Jurisdiction</p>
            <div className="flex flex-wrap gap-2">
              {jurisdictions.map((item) => (
                <Button key={item} type="button" size="sm" variant={jurisdiction === item ? "default" : "outline"} onClick={() => setJurisdiction(item)} className={jurisdiction === item ? "bg-cyan-600 text-white hover:bg-cyan-500" : "border-slate-700 bg-black/20 text-slate-300"}>
                  {item}
                </Button>
              ))}
            </div>
          </div>

          <Button onClick={() => setGenerated(true)} className="w-full bg-emerald-600 text-white hover:bg-emerald-500">
            <BadgeCheck className="mr-2 h-4 w-4" /> Generate Pod Code and Checklist
          </Button>
        </div>

        <div className="rounded-2xl border border-cyan-300/20 bg-black/30 p-5">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-slate-500">Generated pod code</p>
          <p className="mt-2 break-all rounded-xl border border-cyan-300/20 bg-cyan-400/10 p-4 font-mono text-xl font-semibold text-cyan-100">{podCode}</p>
          <div className="mt-5">
            <p className="mb-3 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-slate-500">Auto-populated permit checklist</p>
            <div className="space-y-2">
              {permits.map((permit, index) => (
                <div key={permit} className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-3">
                  <div className="flex items-start gap-2">
                    <ShieldCheck size={16} className={generated ? "mt-0.5 text-emerald-300" : "mt-0.5 text-slate-500"} />
                    <div>
                      <p className="text-sm font-medium text-white">{permit}</p>
                      <p className="text-xs text-slate-500">Checklist item {index + 1} · evidence routed to Roots</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={generated ? "border-emerald-300/35 bg-emerald-400/10 text-emerald-100" : "border-slate-500/35 bg-slate-500/10 text-slate-300"}>{generated ? "READY" : "DRAFT"}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
