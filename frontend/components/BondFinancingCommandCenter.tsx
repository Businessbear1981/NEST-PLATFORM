"use client";
/**
 * Bond Financing Command Center
 * ==============================
 * Elite Bond Financing Module UI
 * Integrates AI audit, bond structuring, rating intelligence, and surety dashboard
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileCheck,
  Shield,
  Zap,
  ChevronDown,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface BondWorkflow {
  id: string;
  dealId: string;
  dealName: string;
  currentPhase: string;
  overallReadinessScore: number;
  aiEvaluationSummary: {
    surety: {
      overallScore: number;
      recommendation: string;
      lcRecommendation: string;
    };
    rating: {
      estimatedRating: string;
      fitchClimateVS: string;
    };
    audit: {
      readinessScore: number;
      gaps: Array<{ category: string; severity: string }>;
    };
  };
}

const phases = [
  { id: "phase_1", name: "Audit & Readiness", icon: FileCheck },
  { id: "phase_2", name: "Bond Structuring", icon: BarChart3 },
  { id: "phase_3", name: "Rating Intelligence", icon: TrendingUp },
  { id: "phase_4", name: "Surety & Insurance", icon: Shield },
];

const moduleCards = [
  {
    title: "AI Audit & Readiness",
    description: "KPMG/Moss Adams benchmark analysis",
    icon: FileCheck,
    color: "from-cyan-500 to-blue-600",
    metrics: [
      { label: "Working Capital", value: "12%", status: "compliant" },
      { label: "DSCR", value: "1.35x", status: "compliant" },
      { label: "Synergy Target", value: "85%", status: "watch" },
    ],
  },
  {
    title: "Bond Structuring Studio",
    description: "Tranche optimization & waterfall modeling",
    icon: BarChart3,
    color: "from-amber-500 to-orange-600",
    metrics: [
      { label: "Senior Tranche", value: "$80M", status: "active" },
      { label: "Mezzanine", value: "$15M", status: "active" },
      { label: "Subordinated", value: "$5M", status: "active" },
    ],
  },
  {
    title: "Rating Intelligence Hub",
    description: "Moody's/S&P/Fitch estimation",
    icon: TrendingUp,
    color: "from-emerald-500 to-teal-600",
    metrics: [
      { label: "Estimated Rating", value: "A", status: "compliant" },
      { label: "Climate Risk", value: "Moderate", status: "watch" },
      { label: "OPBA Score", value: "78/100", status: "compliant" },
    ],
  },
  {
    title: "Surety & Insurance",
    description: "3C scoring & LC strategy",
    icon: Shield,
    color: "from-red-500 to-pink-600",
    metrics: [
      { label: "Character", value: "85/100", status: "compliant" },
      { label: "Capacity", value: "78/100", status: "watch" },
      { label: "Capital", value: "82/100", status: "compliant" },
    ],
  },
];

export function BondFinancingCommandCenter() {
  const [activePhase, setActivePhase] = useState("phase_1");
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [isRunningEvaluation, setIsRunningEvaluation] = useState(false);

  // Demo workflow data
  const workflow: BondWorkflow = {
    id: "wf_001",
    dealId: "deal_001",
    dealName: "Sparrow Capital - HbO2 Therapeutics",
    currentPhase: "phase_2",
    overallReadinessScore: 78,
    aiEvaluationSummary: {
      surety: {
        overallScore: 82,
        recommendation: "Approve",
        lcRecommendation: "Surety Bond",
      },
      rating: {
        estimatedRating: "A",
        fitchClimateVS: "Moderate",
      },
      audit: {
        readinessScore: 75,
        gaps: [
          { category: "Documentation", severity: "low" },
          { category: "Insurance", severity: "medium" },
        ],
      },
    },
  };

  const handleRunEvaluation = async () => {
    setIsRunningEvaluation(true);
    // Simulate AI evaluation
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setIsRunningEvaluation(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Bond Financing Command Center</h1>
            <p className="text-slate-400">Elite institutional bond structuring & AI evaluation</p>
          </div>
          <Button
            onClick={handleRunEvaluation}
            disabled={isRunningEvaluation}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
          >
            <Play className="w-4 h-4 mr-2" />
            {isRunningEvaluation ? "Running Evaluation..." : "Run Full AI Evaluation"}
          </Button>
        </div>

        {/* Deal Info Card */}
        <Card className="bg-slate-800 border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">{workflow.dealName}</h2>
              <p className="text-sm text-slate-400">Deal ID: {workflow.dealId}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-cyan-400">{workflow.overallReadinessScore}%</div>
              <p className="text-sm text-slate-400">Overall Readiness</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Phase Navigation */}
      <div className="mb-8">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {phases.map((phase, idx) => {
            const Icon = phase.icon;
            const isActive = activePhase === phase.id;
            const isCompleted = idx < phases.findIndex((p) => p.id === workflow.currentPhase);

            return (
              <motion.button
                key={phase.id}
                onClick={() => setActivePhase(phase.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50"
                    : isCompleted
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                <Icon className="w-4 h-4" />
                {phase.name}
                {isCompleted && <CheckCircle2 className="w-4 h-4 ml-1" />}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="modules" className="mb-8">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="evaluation">AI Evaluation</TabsTrigger>
          <TabsTrigger value="structuring">Bond Structuring</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        {/* Modules Tab */}
        <TabsContent value="modules" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {moduleCards.map((module, idx) => {
              const Icon = module.icon;
              const isExpanded = expandedModule === module.title;

              return (
                <motion.div
                  key={idx}
                  layout
                  onClick={() => setExpandedModule(isExpanded ? null : module.title)}
                  className="cursor-pointer"
                >
                  <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-6 hover:border-slate-600 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`bg-gradient-to-br ${module.color} p-3 rounded-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-slate-400 transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </div>

                    <h3 className="text-lg font-semibold text-white mb-1">{module.title}</h3>
                    <p className="text-sm text-slate-400 mb-4">{module.description}</p>

                    {/* Metrics Grid */}
                    <div className="space-y-3">
                      {module.metrics.map((metric, midx) => (
                        <div key={midx} className="flex items-center justify-between">
                          <span className="text-sm text-slate-300">{metric.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{metric.value}</span>
                            <div
                              className={`w-2 h-2 rounded-full ${
                                metric.status === "compliant"
                                  ? "bg-emerald-500"
                                  : metric.status === "watch"
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                              }`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-slate-700"
                      >
                        <p className="text-sm text-slate-400 mb-3">
                          {module.title === "AI Audit & Readiness"
                            ? "Comprehensive project readiness audit against KPMG/Moss Adams standards. Identifies gaps in documentation, insurance, and financial metrics."
                            : module.title === "Bond Structuring Studio"
                              ? "Design optimal capital stack with tranching simulator. Model cash sweep waterfalls and covenant triggers."
                              : module.title === "Rating Intelligence Hub"
                                ? "AI-powered rating estimation using Moody's and S&P methodologies. Includes climate risk and operational benchmarking."
                                : "3C underwriting scoring (Character, Capacity, Capital). Recommends LC strategy and surety premium."}
                        </p>
                        <Button className="w-full bg-slate-700 hover:bg-slate-600 text-white">
                          Open Module
                        </Button>
                      </motion.div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* AI Evaluation Tab */}
        <TabsContent value="evaluation" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h3 className="text-xl font-semibold text-white mb-4">AI Evaluation Results</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Surety Score */}
              <div className="bg-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-300">Surety Score</span>
                  <Shield className="w-4 h-4 text-red-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  {workflow.aiEvaluationSummary.surety.overallScore}
                </div>
                <Progress value={workflow.aiEvaluationSummary.surety.overallScore} className="h-2" />
                <p className="text-xs text-slate-400 mt-2">
                  Recommendation: {workflow.aiEvaluationSummary.surety.recommendation}
                </p>
              </div>

              {/* Rating */}
              <div className="bg-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-300">Estimated Rating</span>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  {workflow.aiEvaluationSummary.rating.estimatedRating}
                </div>
                <p className="text-xs text-slate-400">
                  Climate: {workflow.aiEvaluationSummary.rating.fitchClimateVS}
                </p>
              </div>

              {/* Audit Score */}
              <div className="bg-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-300">Audit Readiness</span>
                  <FileCheck className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  {workflow.aiEvaluationSummary.audit.readinessScore}%
                </div>
                <Progress value={workflow.aiEvaluationSummary.audit.readinessScore} className="h-2" />
              </div>
            </div>

            {/* Gaps & Issues */}
            {workflow.aiEvaluationSummary.audit.gaps.length > 0 && (
              <div className="bg-slate-900 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  <h4 className="font-semibold text-white">Identified Gaps</h4>
                </div>
                <div className="space-y-2">
                  {workflow.aiEvaluationSummary.audit.gaps.map((gap, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">{gap.category}</span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          gap.severity === "high"
                            ? "bg-red-500/20 text-red-400"
                            : gap.severity === "medium"
                              ? "bg-amber-500/20 text-amber-400"
                              : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {gap.severity.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Bond Structuring Tab */}
        <TabsContent value="structuring" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Capital Stack Structuring</h3>
            <p className="text-slate-400 mb-4">Design optimal bond tranches with waterfall modeling</p>

            <div className="space-y-4">
              {["Senior (AAA/A)", "Mezzanine (BBB)", "Subordinated (Equity)"].map((tranche, idx) => (
                <div key={idx} className="bg-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white">{tranche}</span>
                    <span className="text-sm text-slate-400">
                      {idx === 0 ? "$80M" : idx === 1 ? "$15M" : "$5M"}
                    </span>
                  </div>
                  <Progress
                    value={idx === 0 ? 80 : idx === 1 ? 15 : 5}
                    className="h-3"
                  />
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Covenant Compliance</h3>
            <div className="space-y-3">
              {[
                { name: "DSCR", value: 1.35, threshold: 1.25, status: "compliant" },
                { name: "LTV", value: 72, threshold: 75, status: "compliant" },
                { name: "Working Capital", value: 14, threshold: 12, status: "compliant" },
              ].map((covenant, idx) => (
                <div key={idx} className="bg-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white">{covenant.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-400">
                        {covenant.value} / {covenant.threshold}
                      </span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                  </div>
                  <Progress value={(covenant.value / covenant.threshold) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
