"use client";
import React, { useState } from "react";
import { Archive, AlertTriangle, CheckCircle2, FileLock2, Mail, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Communication {
  id: string;
  type: "email" | "document" | "submission";
  subject: string;
  from: string;
  to: string;
  timestamp: Date;
  status: "pending" | "approved" | "rejected" | "archived";
  content: string;
}

interface SurveillanceAlert {
  id: string;
  type: "covenant" | "rating" | "market" | "compliance";
  severity: "critical" | "high" | "medium" | "low";
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

interface RecordItem {
  id: string;
  type: string;
  description: string;
  date: Date;
  locked: boolean;
  retentionDays: number;
}

const initialCommunications: Communication[] = [
  { id: "comm-1", type: "email", subject: "NEST Series B - Investor Update Q2 2026", from: "morgan@nest.com", to: "investors@list.com", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), status: "pending", content: "Quarterly update on portfolio performance and market conditions..." },
  { id: "comm-2", type: "document", subject: "Bond Prospectus - NEST Mixed-Use", from: "legal@nest.com", to: "sec@gov.us", timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), status: "approved", content: "Official prospectus filing for SEC review..." },
  { id: "comm-3", type: "submission", subject: "Surety Packet - Apex Surety Partners", from: "underwriting@nest.com", to: "quotes@apexsurety.com", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), status: "approved", content: "Submission of underwriting documentation for premium quote..." },
];

const alerts: SurveillanceAlert[] = [
  { id: "alert-1", type: "covenant", severity: "high", message: "NEST Portfolio A - Debt Service Coverage Ratio approaching threshold (1.25x)", timestamp: new Date(Date.now() - 30 * 60 * 1000), acknowledged: false },
  { id: "alert-2", type: "rating", severity: "medium", message: "Moody's methodology update affects 3 portfolio bonds", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), acknowledged: true },
  { id: "alert-3", type: "market", severity: "low", message: "Treasury yields moved +15 bps; portfolio duration impact: -$2.3M", timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), acknowledged: true },
  { id: "alert-4", type: "compliance", severity: "critical", message: "Investor KYC renewal required for 2 accounts (expires in 5 days)", timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), acknowledged: false },
];

const initialRecords: RecordItem[] = [
  { id: "rec-1", type: "Bond Prospectus", description: "NEST Series B - Official SEC Filing", date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), locked: true, retentionDays: 2555 },
  { id: "rec-2", type: "Investor Communication", description: "Q1 2026 Portfolio Update Email", date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), locked: true, retentionDays: 2525 },
  { id: "rec-3", type: "Underwriting Document", description: "NEST Mixed-Use - Surety Packet", date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), locked: true, retentionDays: 2495 },
];

export function CompliancePortal() {
  const [activeTab, setActiveTab] = useState("approvals");
  const [communications, setCommunications] = useState(initialCommunications);
  const [records, setRecords] = useState(initialRecords);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<string[]>(alerts.filter((a) => a.acknowledged).map((a) => a.id));
  const [complianceLog, setComplianceLog] = useState("No compliance action has been executed yet.");

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "border-red-500/30 bg-red-500/10 text-red-100";
      case "high": return "border-orange-500/30 bg-orange-500/10 text-orange-100";
      case "medium": return "border-yellow-500/30 bg-yellow-500/10 text-yellow-100";
      case "low": return "border-green-500/30 bg-green-500/10 text-green-100";
      default: return "border-slate-700 bg-slate-800 text-slate-300";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "border-green-500/30 bg-green-500/10 text-green-100";
      case "rejected": return "border-red-500/30 bg-red-500/10 text-red-100";
      case "pending": return "border-cyan-500/30 bg-cyan-500/10 text-cyan-100";
      case "archived": return "border-slate-600 bg-slate-700 text-slate-200";
      default: return "border-slate-700 bg-slate-800 text-slate-300";
    }
  };

  const resolveCommunication = (id: string, status: "approved" | "rejected" | "archived") => {
    setCommunications((current) =>
      current.map((comm) => {
        if (comm.id !== id) return comm;
        setComplianceLog(`${comm.subject} marked ${status} and retained in compliance history.`);
        return { ...comm, status };
      }),
    );
  };

  const acknowledge = (alert: SurveillanceAlert) => {
    setAcknowledgedAlerts((current) => (current.includes(alert.id) ? current : [...current, alert.id]));
    setComplianceLog(`${alert.type} surveillance alert acknowledged: ${alert.message}`);
  };

  const extendRetention = (recordId: string) => {
    setRecords((current) =>
      current.map((record) => {
        if (record.id !== recordId) return record;
        setComplianceLog(`${record.description} retention extended by 365 days.`);
        return { ...record, retentionDays: record.retentionDays + 365 };
      }),
    );
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-cyan-300/20 bg-slate-950/80 p-6 shadow-[0_0_50px_rgba(34,211,238,0.08)]">
        <p className="flex items-center gap-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-cyan-200"><ShieldCheck className="h-4 w-4" /> Compliance Portal · working governance console</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground">Compliance Portal</h1>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-muted-foreground">Approval workflows, communication archive, surveillance alerts, and retention records now expose stateful actions instead of static status badges.</p>
        <p className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm text-emerald-100"><CheckCircle2 className="mr-2 inline h-4 w-4" /> {complianceLog}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
          <TabsTrigger value="surveillance">Surveillance</TabsTrigger>
          <TabsTrigger value="archive">Archive</TabsTrigger>
          <TabsTrigger value="records">Records</TabsTrigger>
        </TabsList>

        <TabsContent value="approvals" className="mt-6 space-y-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-cyan-400"><Mail className="h-5 w-5" /> Communication Approval Queue</CardTitle></CardHeader>
            <CardContent><div className="space-y-3">
              {communications.map((comm) => (
                <div key={comm.id} className={`rounded-lg border p-4 ${getStatusColor(comm.status)}`}>
                  <div className="mb-3 flex items-start justify-between gap-3"><div className="flex-1"><div className="mb-1 flex items-center gap-2"><p className="font-semibold text-foreground">{comm.subject}</p><Badge variant="outline" className="capitalize">{comm.type}</Badge></div><p className="text-sm text-muted-foreground">From: {comm.from} → To: {comm.to}</p><p className="mt-2 text-xs text-muted-foreground">{comm.content}</p></div><Badge variant="outline" className={getStatusColor(comm.status)}>{comm.status.toUpperCase()}</Badge></div>
                  <div className="flex flex-col gap-2 border-t border-current/20 pt-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><span>{comm.timestamp.toLocaleString()}</span>{comm.status === "pending" ? <div className="flex gap-2"><Button size="sm" variant="outline" className="text-xs">Review</Button><Button size="sm" className="bg-green-600 text-xs hover:bg-green-700" onClick={() => resolveCommunication(comm.id, "approved")}>Approve</Button><Button size="sm" className="bg-red-600 text-xs hover:bg-red-700" onClick={() => resolveCommunication(comm.id, "rejected")}>Reject</Button></div> : <Button size="sm" variant="outline" className="text-xs" onClick={() => resolveCommunication(comm.id, "archived")}><Archive className="mr-2 h-3 w-3" /> Lock Archive</Button>}</div>
                </div>
              ))}
            </div></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="surveillance" className="mt-6 space-y-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-cyan-400"><AlertTriangle className="h-5 w-5" /> Surveillance Alerts</CardTitle></CardHeader>
            <CardContent><div className="space-y-3">
              {alerts.map((alert) => {
                const isAcknowledged = acknowledgedAlerts.includes(alert.id);
                return <div key={alert.id} className={`rounded-lg border p-4 ${getSeverityColor(alert.severity)}`}><div className="mb-2 flex items-start justify-between gap-3"><div className="flex-1"><div className="mb-1 flex items-center gap-2"><p className="font-semibold text-foreground">{alert.message}</p><Badge variant="outline" className="capitalize">{alert.type}</Badge></div><p className="text-xs text-muted-foreground">{alert.timestamp.toLocaleString()}</p></div><Badge variant="outline" className={isAcknowledged ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100" : "border-red-500/30 bg-red-500/10 text-red-100"}>{isAcknowledged ? "ACKNOWLEDGED" : "ACTIVE"}</Badge></div>{!isAcknowledged && <Button size="sm" variant="outline" className="mt-2 w-full text-xs" onClick={() => acknowledge(alert)}>Acknowledge</Button>}</div>;
              })}
            </div></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archive" className="mt-6 space-y-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-cyan-400"><Archive className="h-5 w-5" /> Communication Archive</CardTitle></CardHeader>
            <CardContent><div className="space-y-3">
              {communications.filter((c) => c.status === "approved" || c.status === "archived").map((comm) => (
                <div key={comm.id} className="rounded-lg border border-slate-700 bg-slate-800 p-4"><div className="mb-2 flex items-start justify-between gap-3"><div className="flex-1"><p className="font-semibold text-foreground">{comm.subject}</p><p className="text-sm text-muted-foreground">{comm.from} → {comm.to}</p></div><Badge className={comm.status === "archived" ? "bg-slate-600 text-white" : "bg-green-600 text-white"}>{comm.status === "archived" ? "ARCHIVE LOCKED" : "APPROVED"}</Badge></div><div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-muted-foreground">{comm.timestamp.toLocaleString()}</p>{comm.status === "approved" && <Button size="sm" variant="outline" className="text-xs" onClick={() => resolveCommunication(comm.id, "archived")}><Archive className="mr-2 h-3 w-3" /> Lock Archive</Button>}</div></div>
              ))}
            </div></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records" className="mt-6 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-cyan-400">Retained Records</CardTitle></CardHeader>
            <CardContent><div className="space-y-3">
              {records.map((record) => (
                <div key={record.id} className="rounded-lg border border-slate-700 bg-slate-800 p-4"><div className="mb-2 flex items-start justify-between gap-3"><div className="flex-1"><div className="mb-1 flex items-center gap-2"><p className="font-semibold text-foreground">{record.description}</p>{record.locked && <Badge variant="outline" className="text-xs"><FileLock2 className="mr-1 h-3 w-3" /> Locked</Badge>}</div><p className="text-sm text-muted-foreground">{record.type}</p></div><Button size="sm" variant="outline" onClick={() => extendRetention(record.id)}>Extend Retention</Button></div><div className="flex items-center justify-between text-xs text-muted-foreground"><span>Filed: {record.date.toLocaleDateString()}</span><span>Retention: {record.retentionDays} days</span></div></div>
              ))}
            </div></CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
