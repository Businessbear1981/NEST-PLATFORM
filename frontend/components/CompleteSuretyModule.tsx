"use client";
import Link from "next/link";
import React, { useState } from 'react';
import { AlertCircle, BadgeDollarSign, CheckCircle, Clock, FileCheck, Layers3, Send, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { SuretySubmissionChecklist } from '@/components/SuretySubmissionChecklist';
import { SuretyPacketPrep } from '@/components/SuretyPacketPrep';
import { CarrierSubmissionForm } from '@/components/CarrierSubmissionForm';
import { SuretyApprovalWorkflow } from '@/components/SuretyApprovalWorkflow';
import { PremiumScenarioBuilder } from '@/components/PremiumScenarioBuilder';
import { UnderwritingGapsPanel } from '@/components/UnderwritingGapsPanel';

interface UnderwritingGap {
  id: string;
  category: string;
  item: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in-progress' | 'resolved';
  dueDate: Date;
}

interface Provider {
  id: string;
  name: string;
  rating: string;
  capacity: number;
  premiumRange: [number, number];
  turnaround: number;
  specialties: string[];
}

interface Quote {
  id: string;
  provider: string;
  coverage: number;
  term: number;
  premium: number;
  riskFactors: string[];
  status: 'pending' | 'quoted' | 'accepted' | 'rejected';
}

const gaps: UnderwritingGap[] = [
  {
    id: 'gap-1',
    category: 'Construction',
    item: 'Contractor financial statements (last 3 years)',
    severity: 'critical',
    status: 'open',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'gap-2',
    category: 'Insurance',
    item: 'General liability policy with NEST as additional insured',
    severity: 'critical',
    status: 'in-progress',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'gap-3',
    category: 'Title',
    item: 'Title insurance commitment',
    severity: 'high',
    status: 'open',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'gap-4',
    category: 'Appraisal',
    item: 'Updated property appraisal',
    severity: 'medium',
    status: 'resolved',
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
];

const suretyCommandRails = [
  ['Insurance evidence', 'GL, builder risk, title, environmental, completion, and indemnity evidence feeds the credit file.'],
  ['Surety wrap economics', 'Premium scenarios test whether a wrap can improve rating posture, spread guidance, and investor appetite.'],
  ['Carrier submission', 'Provider packets, quote requests, exceptions, and negotiated terms are retained before market launch.'],
  ['Offering gate', 'Bond sales cannot leave the platform until surety, rating, and compliance gates are cleared.'],
];

const offeringHandoffs = [
  ['Pre-market clearance', 'Resolve critical underwriting gaps and mark packet as approved before building investor books.'],
  ['Credit enhancement note', 'Attach wrap economics, carrier quote, coverage amount, exclusions, and effective/expiration dates to the offering memo.'],
  ['Sales desk routing', 'Route cleared bonds into the Offering Sales Desk for pooled or single-bond distribution.'],
];

const threeCsScore = [
  ['Character', '84 / 100', 'Sponsor track record, references, claims/litigation history, key-person resumes, and management reputation.'],
  ['Capacity', '79 / 100', 'Backlog, WIP schedule, similar-project completion history, workforce/equipment readiness, and operational controls.'],
  ['Capital', '81 / 100', 'Liquidity, net worth, working capital, audited statements, retained earnings, and leverage/cash-flow strength.'],
];

const lcSuretyOptions = [
  ['Surety wrap', '0.50% - 1.50% premium', 'Potential rating enhancement and investor confidence when carrier terms are approved.'],
  ['Cash-secured LC', 'Collateral reserve burden', 'Bank letter-of-credit support can substitute for or supplement a surety wrap, but traps liquidity.'],
  ['Insurance evidence', 'Policy and exclusion review', 'GL, builder risk, title, environmental, and parametric trigger language supports underwriting diligence.'],
  ['Collateral support', 'Negotiated reserve or pledge', 'Useful when capacity is pending or carrier exclusions require supplemental protection.'],
];

const providers: Provider[] = [
  {
    id: 'prov-1',
    name: 'Apex Surety Partners',
    rating: 'A+',
    capacity: 500000000,
    premiumRange: [0.5, 1.2],
    turnaround: 3,
    specialties: ['Mixed-use', 'Multifamily', 'Hospitality'],
  },
  {
    id: 'prov-2',
    name: 'Sterling Bond Group',
    rating: 'A',
    capacity: 350000000,
    premiumRange: [0.6, 1.3],
    turnaround: 5,
    specialties: ['Multifamily', 'Retail', 'Office'],
  },
  {
    id: 'prov-3',
    name: 'Bridge Insurance Solutions',
    rating: 'A',
    capacity: 250000000,
    premiumRange: [0.7, 1.5],
    turnaround: 7,
    specialties: ['Construction', 'Development', 'Hospitality'],
  },
];

export function CompleteSuretyModule() {
  const [activeTab, setActiveTab] = useState('gaps');
  const [quotes, setQuotes] = useState<Quote[]>([]);

  const handleRequestQuote = (provider: Provider) => {
    const newQuote: Quote = {
      id: `quote-${Date.now()}`,
      provider: provider.name,
      coverage: 25000000,
      term: 5,
      premium: Math.round((25000000 * (provider.premiumRange[0] + provider.premiumRange[1]) / 2) / 10000),
      riskFactors: ['Construction phase', 'Market conditions', 'Sponsor strength'],
      status: 'pending',
    };
    setQuotes([newQuote, ...quotes]);
    setActiveTab('carrier');
  };

  const handleAcceptQuote = (quoteId: string) => {
    setQuotes((currentQuotes) =>
      currentQuotes.map((quote) => (quote.id === quoteId ? { ...quote, status: 'accepted' as const } : quote)),
    );
    setActiveTab('approval');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-400 bg-red-500/10';
      case 'high':
        return 'text-orange-400 bg-orange-500/10';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/10';
      case 'low':
        return 'text-green-400 bg-green-500/10';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="w-4 h-4" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 animate-spin" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6" data-testid="complete-surety-module">
      <section className="relative overflow-hidden rounded-[1.8rem] border border-cyan-300/25 bg-[#061018] p-5 text-slate-100 shadow-[0_0_85px_rgba(34,211,238,0.11)] sm:p-7" data-testid="surety-command-hero">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(34,211,238,0.17),transparent_34%),radial-gradient(circle_at_86%_4%,rgba(16,185,129,0.15),transparent_30%),linear-gradient(135deg,rgba(15,23,42,0.76),rgba(2,6,23,0.96))]" />
        <div className="relative grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="flex flex-wrap items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-cyan-200">
              <ShieldCheck className="h-4 w-4" /> Restored first-class capital protection module
            </div>
            <h1 className="mt-4 flex items-center gap-2 text-3xl font-black tracking-tight text-white sm:text-5xl">
              <FileCheck className="h-9 w-9 text-cyan-300" /> Insurance & Surety Command
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
              Insurance and surety are core NEST infrastructure, not a side panel. This command room manages underwriting gaps, carrier capacity, coverage evidence, surety wrap economics, quote negotiation, and the approval gates that determine whether a bond can move into sales distribution.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/bond-offerings" className="inline-flex items-center rounded-xl bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200">
                <BadgeDollarSign className="mr-2 h-4 w-4" /> Send cleared bond to offering desk
              </Link>
              <button type="button" onClick={() => setActiveTab('packet')} className="inline-flex items-center rounded-xl border border-emerald-300/35 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/15">
                <Layers3 className="mr-2 h-4 w-4" /> Open wrap packet
              </button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ['Coverage target', '$25M', 'initial demonstration layer'],
              ['Carrier lanes', providers.length.toString(), 'qualified provider options'],
              ['Critical gaps', gaps.filter((gap) => gap.severity === 'critical' && gap.status !== 'resolved').length.toString(), 'must clear before launch'],
              ['Premium corridor', '0.5% - 1.5%', 'modeled provider range'],
            ].map(([label, value, detail]) => (
              <Card key={label} className="border-white/10 bg-white/[0.045] text-slate-100 shadow-none">
                <CardContent className="p-4">
                  <p className="font-mono text-[0.63rem] uppercase tracking-[0.18em] text-slate-400">{label}</p>
                  <p className="mt-2 text-2xl font-black text-white">{value}</p>
                  <p className="mt-1 text-xs text-slate-400">{detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-4" aria-label="Insurance and surety command rails">
        {suretyCommandRails.map(([stage, description]) => (
          <Card key={stage} className="border-cyan-300/20 bg-slate-950/80 text-slate-100">
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">{stage}</p>
              <p className="mt-2 text-xs leading-5 text-slate-400">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-3" aria-label="Three Cs underwriting scorecard">
        {threeCsScore.map(([label, score, detail]) => (
          <Card key={label} className="border-emerald-300/20 bg-slate-950/80 text-slate-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-emerald-200">{label}</p>
                <p className="text-lg font-black text-white">{score}</p>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-400">{detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-amber-300/25 bg-amber-400/10 text-slate-100" data-testid="lc-surety-comparison">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-100">
            <BadgeDollarSign className="h-5 w-5" /> LC / surety / insurance economics
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          {lcSuretyOptions.map(([title, economics, detail]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="font-semibold text-white">{title}</p>
              <p className="mt-1 font-mono text-xs uppercase tracking-[0.12em] text-amber-200">{economics}</p>
              <p className="mt-2 text-xs leading-5 text-slate-300">{detail}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-4" aria-label="Insurance and surety workflow stages">
        {[
          ['Submission checklist', 'Gaps tab tracks required underwriting evidence and blocking items.'],
          ['Packet prep', 'Provider packet is assembled from financial statements, bank references, WIP schedules, completed project lists, organization documents, coverage requirements, and risk factors.'],
          ['Carrier submission', 'Provider quote requests create tracked carrier-submission records.'],
          ['Approval workflow', 'Risk, pricing, rating enhancement, carrier exclusions, parametric trigger language, and final approval gates remain visible before release.'],
        ].map(([stage, description]) => (
          <Card key={stage} className="border-slate-700 bg-slate-900/70">
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">{stage}</p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 lg:w-auto">
          <TabsTrigger value="gaps" onClick={() => setActiveTab('gaps')}>Checklist</TabsTrigger>
          <TabsTrigger value="providers" onClick={() => setActiveTab('providers')}>Providers</TabsTrigger>
          <TabsTrigger value="packet" onClick={() => setActiveTab('packet')}>Packet</TabsTrigger>
          <TabsTrigger value="carrier" onClick={() => setActiveTab('carrier')}>Carrier</TabsTrigger>
          <TabsTrigger value="approval" onClick={() => setActiveTab('approval')}>Approval</TabsTrigger>
        </TabsList>

        {/* Submission checklist and underwriting gaps */}
        <TabsContent value="gaps" className="space-y-4 mt-6">
          <SuretySubmissionChecklist />
          <UnderwritingGapsPanel dealId="deal-1" />
        </TabsContent>

        {/* Provider Matching */}
        <TabsContent value="providers" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {providers.map((provider) => (
              <Card key={provider.id} className="border-slate-700 hover:border-cyan-500/50 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-sm font-semibold text-cyan-400">{provider.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">Rating: {provider.rating}</p>
                    </div>
                    <span className="text-lg font-bold text-green-400">{provider.rating}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Capacity</p>
                    <p className="text-sm font-semibold text-foreground">
                      ${(provider.capacity / 1000000).toFixed(0)}M
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Premium Range</p>
                    <p className="text-sm font-semibold text-yellow-400">
                      {provider.premiumRange[0]}% - {provider.premiumRange[1]}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Turnaround</p>
                    <p className="text-sm font-semibold text-foreground">{provider.turnaround} days</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Specialties</p>
                    <div className="flex flex-wrap gap-1">
                      {provider.specialties.map((spec, i) => (
                        <span key={i} className="text-xs bg-slate-700 px-2 py-1 rounded text-cyan-400">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleRequestQuote(provider)}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white mt-2"
                  >
                    Request Quote
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Packet preparation and premium modeling */}
        <TabsContent value="packet" className="space-y-4 mt-6">
          <SuretyPacketPrep />
          <PremiumScenarioBuilder dealId="deal-1" />
        </TabsContent>

        {/* Carrier submission and quote tracking */}
        <TabsContent value="carrier" className="space-y-4 mt-6">
          <CarrierSubmissionForm
            providers={providers}
            quotes={quotes}
            onRequestQuote={handleRequestQuote}
            onAcceptQuote={handleAcceptQuote}
          />
        </TabsContent>

        {/* Approval Workflow */}
        <TabsContent value="approval" className="space-y-4 mt-6">
          <SuretyApprovalWorkflow />
        </TabsContent>
      </Tabs>

      <Card className="border-emerald-300/25 bg-emerald-400/10 text-slate-100" data-testid="surety-offering-handoff">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-100">
            <Send className="h-5 w-5" /> Surety-to-offering handoff
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {offeringHandoffs.map(([title, detail]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="font-semibold text-white">{title}</p>
              <p className="mt-2 text-xs leading-5 text-slate-300">{detail}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
