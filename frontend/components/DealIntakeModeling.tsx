"use client";
import { useState } from "react";
import { FileCheck2, FolderKanban, Route, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PodCodeIntakeForm } from "./PodCodeIntakeForm";
import { StressScenarioBuilder } from "./StressScenarioBuilder";

const autoPermitRows = [
  { name: "Zoning conformance letter", route: "Roots evidence vault", status: "Ready" },
  { name: "Building permit intake", route: "Permit tracker", status: "Open" },
  { name: "Environmental Phase I", route: "Rating memo evidence", status: "Ready" },
  { name: "Insurance certificate packet", route: "Surety module", status: "Open" },
];

export function DealIntakeModeling() {
  const [activeTab, setActiveTab] = useState("intake");
  const [routedPermit, setRoutedPermit] = useState("No permit package routed yet.");

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-cyan-300/20 bg-slate-950/80 p-6 shadow-[0_0_50px_rgba(34,211,238,0.08)]">
        <p className="flex items-center gap-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-cyan-200">
          <FolderKanban className="h-4 w-4" /> Deal Intake & Modeling · working demo console
        </p>
        <h1 className="mt-2 flex items-center gap-2 text-3xl font-bold text-foreground">
          Deal Intake & Modeling
        </h1>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-muted-foreground">
          Intake now generates deterministic pod codes, auto-populates permit checklists, and exposes a working stress scenario builder with live comparison output.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="intake">Pod Code Intake</TabsTrigger>
          <TabsTrigger value="permits">Permit Routing</TabsTrigger>
          <TabsTrigger value="modeling">Stress Modeling</TabsTrigger>
        </TabsList>

        <TabsContent value="intake" className="mt-6 space-y-4">
          <PodCodeIntakeForm />
        </TabsContent>

        <TabsContent value="permits" className="mt-6 space-y-4">
          <Card className="border-cyan-300/25 bg-[#06111c]/90 p-5 text-slate-100">
            <div className="mb-5 flex flex-col gap-3 border-b border-white/10 pb-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="flex items-center gap-2 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-cyan-200">
                  <FileCheck2 size={14} /> Permit checklist auto-population
                </p>
                <h2 className="mt-2 font-mono text-lg font-semibold uppercase tracking-[0.05em] text-white">Routed permit package</h2>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  This route proves the intake output can become operational work across Roots, Rating, Surety, and the permit tracker.
                </p>
              </div>
              <Badge className="w-fit border border-cyan-300/30 bg-cyan-400/10 text-cyan-100">AUTO-POPULATED</Badge>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {autoPermitRows.map((row) => (
                <div key={row.name} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm font-semibold uppercase tracking-[0.04em] text-white">{row.name}</p>
                      <p className="mt-1 text-xs text-slate-500">Destination: {row.route}</p>
                    </div>
                    <Badge variant="outline" className={row.status === "Ready" ? "border-emerald-300/35 bg-emerald-400/10 text-emerald-100" : "border-amber-300/35 bg-amber-400/10 text-amber-100"}>{row.status}</Badge>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setRoutedPermit(`${row.name} routed to ${row.route}.`)}
                    className="mt-4 bg-cyan-600 text-white hover:bg-cyan-500"
                  >
                    <Route className="mr-2 h-4 w-4" /> Route Evidence
                  </Button>
                </div>
              ))}
            </div>

            <p className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
              <ShieldCheck className="mr-2 inline h-4 w-4" /> {routedPermit}
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="modeling" className="mt-6 space-y-4">
          <StressScenarioBuilder />
        </TabsContent>
      </Tabs>
    </div>
  );
}
