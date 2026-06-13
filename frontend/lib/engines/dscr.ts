export interface OperatingInputs {
  grossRevenue: number;       // annual gross potential rent/revenue
  vacancyRate: number;        // 0-1
  operatingExpenseRatio: number; // 0-1 (expenses as % of EGI)
  replacementReservePerUnit: number;
  units: number;
  annualDebtService: number;
  loanBalance: number;
  capRate: number;
}

export interface WaterfallResult {
  grossPotentialRevenue: number;
  vacancyLoss: number;
  effectiveGrossIncome: number;
  operatingExpenses: number;
  replacementReserves: number;
  netOperatingIncome: number;
  debtService: number;
  dscr: number;
  cashAfterDebtService: number;
  ltv: number;
  impliedValue: number;
  grade: "A" | "BBB+" | "BBB-" | "Sub-IG";
}

export function runWaterfall(inputs: OperatingInputs): WaterfallResult {
  const vacancyLoss = inputs.grossRevenue * inputs.vacancyRate;
  const effectiveGrossIncome = inputs.grossRevenue - vacancyLoss;
  const operatingExpenses = effectiveGrossIncome * inputs.operatingExpenseRatio;
  const replacementReserves = inputs.replacementReservePerUnit * inputs.units;
  const noi = effectiveGrossIncome - operatingExpenses - replacementReserves;
  const dscr = inputs.annualDebtService > 0 ? noi / inputs.annualDebtService : 0;
  const cashAfterDS = noi - inputs.annualDebtService;
  const impliedValue = inputs.capRate > 0 ? noi / inputs.capRate : 0;
  const ltv = impliedValue > 0 ? (inputs.loanBalance / impliedValue) * 100 : 0;
  let grade: WaterfallResult["grade"] = "Sub-IG";
  if (dscr >= 2.0 && ltv <= 55) grade = "A";
  else if (dscr >= 1.75 && ltv <= 62) grade = "BBB+";
  else if (dscr >= 1.5 && ltv <= 70) grade = "BBB-";
  return {
    grossPotentialRevenue: inputs.grossRevenue,
    vacancyLoss,
    effectiveGrossIncome,
    operatingExpenses,
    replacementReserves,
    netOperatingIncome: noi,
    debtService: inputs.annualDebtService,
    dscr,
    cashAfterDebtService: cashAfterDS,
    ltv,
    impliedValue,
    grade,
  };
}

export interface StressScenario {
  name: string;
  vacancyDelta: number;
  noiDeclinePct: number;
  rateShiftBps: number;
}

export function stressTest(
  base: OperatingInputs,
  scenarios: StressScenario[]
): Array<WaterfallResult & { scenario: string; pass: boolean }> {
  return scenarios.map((s) => {
    const stressed: OperatingInputs = {
      ...base,
      vacancyRate: Math.min(1, base.vacancyRate + s.vacancyDelta),
      grossRevenue: base.grossRevenue * (1 - s.noiDeclinePct / 100),
      annualDebtService: base.annualDebtService * (1 + s.rateShiftBps / 10000),
    };
    const result = runWaterfall(stressed);
    return { ...result, scenario: s.name, pass: result.dscr >= 1.2 };
  });
}

export const DEFAULT_SCENARIOS: StressScenario[] = [
  { name: "Base Case", vacancyDelta: 0, noiDeclinePct: 0, rateShiftBps: 0 },
  { name: "Rate Shock +200bp", vacancyDelta: 0, noiDeclinePct: 0, rateShiftBps: 200 },
  { name: "NOI Decline −15%", vacancyDelta: 0, noiDeclinePct: 15, rateShiftBps: 0 },
  { name: "Vacancy Surge +10%", vacancyDelta: 0.1, noiDeclinePct: 0, rateShiftBps: 0 },
  { name: "Combined Stress", vacancyDelta: 0.05, noiDeclinePct: 10, rateShiftBps: 150 },
];

export const HBO2_INPUTS: OperatingInputs = {
  grossRevenue: 18_500_000,
  vacancyRate: 0.08,
  operatingExpenseRatio: 0.42,
  replacementReservePerUnit: 450,
  units: 280,
  annualDebtService: 8_200_000,
  loanBalance: 116_250_000,
  capRate: 0.065,
};
