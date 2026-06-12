"use client";
import React, { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DEMO_PREMIUM_SCENARIOS, calculatePremium } from '@shared/suretyDemo';

interface PremiumScenarioBuilderProps {
  dealId: string;
}

export function PremiumScenarioBuilder({ dealId }: PremiumScenarioBuilderProps) {
  const scenarios = DEMO_PREMIUM_SCENARIOS;
  const [selectedScenario, setSelectedScenario] = useState(scenarios[1]);
  const [customScenario, setCustomScenario] = useState({
    coverageAmount: 50000000,
    term: 3,
    riskFactors: {
      contractor_rating: 1.0,
      project_complexity: 1.0,
      market_conditions: 1.0,
      sponsor_strength: 1.0,
    },
  });

  const calculatedPremium = calculatePremium(
    customScenario.coverageAmount,
    customScenario.riskFactors
  );
  const premiumRate = (calculatedPremium / customScenario.coverageAmount) * 100;

  const handleRiskFactorChange = (factor: string, value: number) => {
    setCustomScenario((prev) => ({
      ...prev,
      riskFactors: {
        ...prev.riskFactors,
        [factor]: value,
      },
    }));
  };

  const getRiskColor = (value: number) => {
    if (value > 1.1) return 'text-red-600';
    if (value > 1.0) return 'text-yellow-600';
    if (value < 0.9) return 'text-emerald-600';
    return 'text-foreground';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Premium Scenarios</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Adjust coverage and risk factors to model premium scenarios
        </p>
      </div>

      {/* Pre-Built Scenarios */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Pre-Built Scenarios</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {scenarios.map((scenario) => {
            const isSelected = selectedScenario.id === scenario.id;
            return (
              <Card
                key={scenario.id}
                className={`p-4 border-2 cursor-pointer transition-colors ${
                  isSelected
                    ? 'border-emerald-500/50 bg-emerald-500/5'
                    : 'border-border hover:border-border/80'
                }`}
                onClick={() => setSelectedScenario(scenario)}
              >
                <h4 className="font-semibold text-foreground mb-2">{scenario.name}</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Coverage</span>
                    <span className="font-medium text-foreground">
                      ${(scenario.coverageAmount / 1000000).toFixed(0)}M
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Term</span>
                    <span className="font-medium text-foreground">{scenario.term} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Premium</span>
                    <span className="font-medium text-foreground">
                      ${(scenario.totalPremium / 1000).toFixed(0)}k
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-border">
                    <span className="text-muted-foreground">Rate</span>
                    <span className="font-semibold text-foreground">{scenario.premiumRate}%</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Custom Scenario Builder */}
      <Card className="p-6 border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">Custom Scenario</h3>
        <div className="space-y-6">
          {/* Coverage Amount */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">Coverage Amount</label>
              <span className="text-sm font-semibold text-foreground">
                ${(customScenario.coverageAmount / 1000000).toFixed(0)}M
              </span>
            </div>
            <Slider
              value={[customScenario.coverageAmount]}
              onValueChange={(value) =>
                setCustomScenario((prev) => ({
                  ...prev,
                  coverageAmount: value[0],
                }))
              }
              min={20000000}
              max={100000000}
              step={5000000}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>$20M</span>
              <span>$100M</span>
            </div>
          </div>

          {/* Term */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">Bond Term</label>
              <span className="text-sm font-semibold text-foreground">{customScenario.term} years</span>
            </div>
            <Slider
              value={[customScenario.term]}
              onValueChange={(value) =>
                setCustomScenario((prev) => ({
                  ...prev,
                  term: value[0],
                }))
              }
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>1 year</span>
              <span>5 years</span>
            </div>
          </div>

          {/* Risk Factors */}
          <div className="space-y-4">
            <p className="text-sm font-medium text-foreground">Risk Factors</p>
            {Object.entries(customScenario.riskFactors).map(([factor, value]) => (
              <div key={factor}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-muted-foreground capitalize">
                    {factor.replace('_', ' ')}
                  </label>
                  <span className={`text-sm font-semibold ${getRiskColor(value)}`}>
                    {value.toFixed(2)}x
                  </span>
                </div>
                <Slider
                  value={[value]}
                  onValueChange={(newValue) =>
                    handleRiskFactorChange(factor, newValue[0])
                  }
                  min={0.5}
                  max={1.5}
                  step={0.05}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0.5x (Lower Risk)</span>
                  <span>1.5x (Higher Risk)</span>
                </div>
              </div>
            ))}
          </div>

          {/* Premium Calculation */}
          <div className="pt-4 border-t border-border space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Calculated Premium</p>
                <p className="text-2xl font-bold text-foreground">
                  ${(calculatedPremium / 1000).toFixed(0)}k
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Premium Rate</p>
                <p className="text-2xl font-bold text-foreground">{premiumRate.toFixed(2)}%</p>
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs font-medium text-muted-foreground mb-2">Risk Assessment</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                {Object.entries(customScenario.riskFactors).map(([factor, value]) => {
                  let assessment = '';
                  if (value > 1.1) assessment = 'High Risk';
                  else if (value > 1.0) assessment = 'Elevated Risk';
                  else if (value < 0.9) assessment = 'Low Risk';
                  else assessment = 'Standard Risk';

                  return (
                    <div key={factor} className="flex justify-between">
                      <span className="capitalize">{factor.replace('_', ' ')}:</span>
                      <span className={getRiskColor(value)}>{assessment}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <Button className="w-full">Save Custom Scenario</Button>
          </div>
        </div>
      </Card>

      {/* Scenario Comparison */}
      <Card className="p-4 border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2 font-medium text-muted-foreground">Scenario</th>
                <th className="text-right py-2 px-2 font-medium text-muted-foreground">Coverage</th>
                <th className="text-right py-2 px-2 font-medium text-muted-foreground">Premium</th>
                <th className="text-right py-2 px-2 font-medium text-muted-foreground">Rate</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((scenario) => (
                <tr key={scenario.id} className="border-b border-border hover:bg-muted/30">
                  <td className="py-2 px-2 font-medium text-foreground">{scenario.name}</td>
                  <td className="text-right py-2 px-2 text-muted-foreground">
                    ${(scenario.coverageAmount / 1000000).toFixed(0)}M
                  </td>
                  <td className="text-right py-2 px-2 text-foreground font-semibold">
                    ${(scenario.totalPremium / 1000).toFixed(0)}k
                  </td>
                  <td className="text-right py-2 px-2 text-foreground font-semibold">
                    {scenario.premiumRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
