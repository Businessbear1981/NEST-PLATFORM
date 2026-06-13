'use client';

import React, { useState } from 'react';
import { Trophy, Play, BookOpen, Bot, Volume2, Youtube, Award, Target, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { runWaterfall, stressTest, DEFAULT_SCENARIOS, HBO2_INPUTS, type OperatingInputs } from '@/lib/engines/dscr';
import { priceSurety, type SuretyInputs } from '@/lib/engines/surety';
import { buildCDO, HBO2_CDO_POOL } from '@/lib/engines/cdo';
import { computeSHAP, HBO2_FEATURES } from '@/lib/engines/shap';

// ── Static data ──────────────────────────────────────────────────────────────

const HBO2_ALTERNATIVE_DATA = {
  newsScore: 72,
  emmaComps: [
    { cusip: '456789AB1', name: 'Cypress Cove CCRC',  yield: 5.82, rating: 'BBB',  dscr: 1.72 },
    { cusip: '234567CD3', name: 'Magnolia Gardens',   yield: 6.15, rating: 'BBB-', dscr: 1.58 },
    { cusip: '789012EF5', name: 'Madera Ridge',       yield: 5.45, rating: 'A-',   dscr: 2.08 },
  ],
  edgarFlags: ['Going concern note removed Q3 2024', 'Refinancing completed Oct 2024'],
  linkedinGrowth: '+18% headcount YoY',
  glassdoorScore: 4.1,
  shadowRating: 'BBB',
  ratingJustification: 'DSCR 1.62 aligns with BBB-tier at 70th pct of CCRC comps. EMMA comps price 5.82-6.15% for BBB. Positive: sponsor NW $180M covers 116% of bond face, 12yr operational track record. Negative: LTV 68% at BBB+ boundary, occupancy 79% vs 88% stabilized threshold. NEST recommendation: target BBB with Hylant surety LC to bridge to BBB+ at stabilization.',
};

const BREX_CONFIG = {
  monthlySpend: 485_000,
  rebateRate: 0.015,
  categories: [
    { name: 'Construction Vendor Payments',            spend: 220_000, rebatePct: 0.02  },
    { name: 'Professional Services (Legal, Accounting)', spend: 85_000, rebatePct: 0.015 },
    { name: 'Insurance Premiums',                      spend: 65_000,  rebatePct: 0.015 },
    { name: 'Technology & SaaS',                       spend: 45_000,  rebatePct: 0.02  },
    { name: 'Travel & Meetings',                       spend: 40_000,  rebatePct: 0.01  },
    { name: 'Office & Miscellaneous',                  spend: 30_000,  rebatePct: 0.01  },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n: number, dec = 0) =>
  n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtUSD = (n: number) => '$' + fmt(n);
const fmtPct = (n: number, dec = 2) => (n * 100).toFixed(dec) + '%';

function GradeBadge({ grade }: { grade: string }) {
  const colors: Record<string, string> = {
    A:      'bg-emerald-800 text-emerald-200',
    'BBB+': 'bg-[#1E4A2E] text-[#C4A048]',
    BBB:    'bg-[#1E4A2E] text-[#C4A048]',
    'BBB-': 'bg-amber-900 text-amber-300',
    'Sub-IG': 'bg-red-900 text-red-300',
  };
  return (
    <span className={`font-mono text-sm px-3 py-1 rounded-full ${colors[grade] ?? 'bg-zinc-700 text-zinc-200'}`}>
      {grade}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function NestAcademy() {
  // ── Existing state ──
  const [activeTab, setActiveTab]                   = useState('dashboard');
  const [currentModuleId, setCurrentModuleId]       = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore]                           = useState(0);
  const [streak, setStreak]                         = useState(0);
  const [xpTotal, setXpTotal]                       = useState(2450);
  const [showExplanation, setShowExplanation]       = useState(false);
  const [selectedAnswer, setSelectedAnswer]         = useState<number | null>(null);
  const [isCorrect, setIsCorrect]                   = useState<boolean | null>(null);

  // ── DSCR Engine state ──
  const [dscrInputs, setDscrInputs]   = useState<OperatingInputs>(HBO2_INPUTS as OperatingInputs);
  const [dscrResult, setDscrResult]   = useState<ReturnType<typeof runWaterfall> | null>(null);
  const [stressResult, setStressResult] = useState<ReturnType<typeof stressTest> | null>(null);

  // ── Surety Pricing state ──
  const [suretyInputs, setSuretyInputs] = useState<SuretyInputs>({
    bondFace: 155_000_000,
    dscr: 1.62,
    ltv: 0.68,
    sponsorNetWorth: 180_000_000,
    projectType: 'CCRC',
    aumTier: 'hybrid',
    liquidityRatio: 0.22,
    yearsInBusiness: 12,
  });
  const [suretyResult, setSuretyResult] = useState<ReturnType<typeof priceSurety> | null>(null);

  // ── CDO Builder state ──
  const [cdoResult, setCdoResult] = useState<ReturnType<typeof buildCDO> | null>(null);

  // ── SHAP Suite state ──
  const [shapResult, setShapResult] = useState<ReturnType<typeof computeSHAP> | null>(null);

  // ── Existing data ──
  const modules = [
    {
      id: 'm1',
      title: 'Municipal Securities Fundamentals',
      exam: 'Series 52/7',
      progress: 82,
      xp: 1850,
      badge: 'MuniMaster',
      chunks: [
        {
          id: 1,
          title: '10-min Chunk 1: GO vs Revenue Bonds',
          text: "Professor-Level: General Obligation (GO) bonds are backed by the issuer's full taxing power and faith/credit. Revenue bonds rely on specific project revenues (e.g., tolls, utilities). In your Nest workflows, Revenue bonds are common for P3/infrastructure and require strong DSCR stress testing and surety enhancement for 100% placement.",
          audioUrl: 'https://example.com/audio/chunk1.mp3',
        },
        {
          id: 2,
          title: '10-min Chunk 2: TEFRA Compliance',
          text: 'TEFRA (Tax Equity and Fiscal Responsibility Act) mandates public approval processes for certain tax-exempt private activity bonds. Critical for your non-cash secured deals to maintain tax status when partnering with bond desks like JP Morgan.',
          audioUrl: 'https://example.com/audio/chunk2.mp3',
        },
      ],
    },
    {
      id: 'm2',
      title: 'Debt Securities & Suitability',
      exam: 'Series 7',
      progress: 65,
      xp: 1320,
      badge: 'BondPro',
      chunks: [],
    },
  ];

  const questions = [
    {
      id: 1,
      question: 'What backs General Obligation municipal bonds?',
      options: ['Full faith, credit and taxing power of issuer', 'Project revenues only', 'Federal government guarantee', 'Private equity'],
      correct: 0,
      explanation: 'GO bonds pledge full taxing authority - key for credit enhancement in Nest platform.',
      aiPrompt: 'Stanford professor: Explain GO bonds with real Nest/Ardan Edge project finance examples, TEFRA, surety integration.',
    },
    {
      id: 2,
      question: 'TEFRA primarily applies to which type of bonds?',
      options: ['Taxable bonds', 'Private activity tax-exempt bonds', 'GO bonds only', 'Corporate bonds'],
      correct: 1,
      explanation: 'TEFRA public approval for PABs - essential for your conduit bond packaging.',
      aiPrompt: 'Harvard level deep dive on TEFRA exceptions and Nest module implementation.',
    },
  ];

  const currentModule = modules.find(m => m.id === currentModuleId);
  const currentQuestion = questions[currentQuestionIndex];

  // ── Handlers ──
  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    const correct = index === currentQuestion.correct;
    setIsCorrect(correct);
    if (correct) {
      setScore(score + 1);
      setStreak(streak + 1);
      setXpTotal(xpTotal + 50);
      confetti({ particleCount: 100, spread: 70 });
    } else {
      setStreak(0);
    }
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    setCurrentQuestionIndex(prev => (prev + 1) % questions.length);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setIsCorrect(null);
  };

  const callNestAI = (prompt: string) => {
    const fullPrompt = `Act as MIT/Harvard/Stanford finance professor. ${prompt}`;
    alert(`Nest AI Professor called:\n\n${fullPrompt}\n\n(Connect to your /api/nest-ai or Bernard here)`);
  };

  // ── DSCR handlers ──
  const handleRunWaterfall = () => {
    const r = runWaterfall(dscrInputs);
    setDscrResult(r);
    const s = stressTest(dscrInputs, DEFAULT_SCENARIOS);
    setStressResult(s);
  };

  // ── Surety handler ──
  const handlePriceBond = () => {
    setSuretyResult(priceSurety(suretyInputs));
  };

  // ── CDO handler ──
  const handleBuildCDO = () => {
    setCdoResult(buildCDO(HBO2_CDO_POOL));
  };

  // ── SHAP handler ──
  const handleComputeSHAP = () => {
    setShapResult(computeSHAP(HBO2_FEATURES));
  };

  // ── DSCR grade helper ──
  const getDscrGrade = (dscr: number): string => {
    if (dscr >= 2.0)  return 'A';
    if (dscr >= 1.75) return 'BBB+';
    if (dscr >= 1.5)  return 'BBB-';
    return 'Sub-IG';
  };

  // ── Brex calcs ──
  const brexAnnualRebate = BREX_CONFIG.categories.reduce(
    (sum, c) => sum + c.spend * c.rebatePct * 12, 0,
  );
  const brexThreeYear = brexAnnualRebate * 3;
  const sofrYield = brexAnnualRebate * 0.0515; // SOFR+15bp ≈ 5.15%

  // ── Tier badge for surety ──
  const tierColor = (tier: string) => {
    if (tier === 'self-collateralized') return 'bg-[#C4A048] text-[#030A06]';
    if (tier === 'hybrid')              return 'bg-amber-700 text-amber-100';
    return 'bg-red-800 text-red-200';
  };

  // ── CDO color helper ──
  const cdoPayoffColor = (pct: number) => {
    if (pct >= 90) return 'text-emerald-400';
    if (pct >= 50) return 'text-amber-400';
    return 'text-red-400';
  };

  // ── All tab names ──
  const allTabs = ['dashboard', 'modules', 'quiz', 'midterm', 'DSCR Engine', 'Surety Pricing', 'CDO Builder', 'SHAP Suite', 'Shadow Rating', 'Brex Rebate'];

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#030A06] text-[#EDE8DC] p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-serif flex items-center gap-3 text-[#EDE8DC]">
            <Award className="w-10 h-10 text-[#C4A048]" /> NEST ACADEMY
          </h1>
          <div className="flex items-center gap-4">
            <div className="bg-[#0D2218] px-4 py-2 rounded-full flex items-center gap-2 font-mono">
              <Trophy className="text-[#C4A048]" /> {xpTotal} XP
            </div>
            <div className="bg-[#0D2218] px-4 py-2 rounded-full font-mono">Streak: {streak} 🔥</div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mb-8 border-b border-[#1E4A2E] flex-wrap">
          {allTabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 rounded-t-lg font-mono text-sm transition-colors ${
                activeTab === tab
                  ? 'bg-[#0D2218] border-b-2 border-[#C4A048] text-[#C4A048]'
                  : 'text-[#7A9A82] hover:text-[#EDE8DC]'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* ── Dashboard ── */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {modules.map(module => (
              <div
                key={module.id}
                className="bg-[#0D2218] p-6 rounded-2xl border border-[#1E4A2E] hover:border-[#C4A048] cursor-pointer transition-colors"
                onClick={() => { setCurrentModuleId(module.id); setActiveTab('modules'); }}
              >
                <h3 className="text-xl font-serif mb-2">{module.title}</h3>
                <div className="text-sm text-[#7A9A82] mb-4 font-mono">{module.exam}</div>
                <div className="w-full bg-[#1E4A2E] h-2 rounded-full mb-4">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${module.progress}%` }} />
                </div>
                <div className="flex justify-between text-sm font-mono">
                  <span>{module.progress}% Complete</span>
                  <span className="text-[#C4A048]">{module.xp} XP</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Modules ── */}
        {activeTab === 'modules' && currentModule && (
          <div>
            <h2 className="text-3xl font-serif mb-6">{currentModule.title}</h2>
            <div className="space-y-8">
              {currentModule.chunks.map((chunk, idx) => (
                <div key={idx} className="bg-[#0D2218] p-8 rounded-3xl border border-[#1E4A2E]">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-2xl font-serif flex items-center gap-3">
                      <Clock className="w-6 h-6" /> {chunk.title}
                    </h3>
                    <button
                      onClick={() => window.open(chunk.audioUrl, '_blank')}
                      className="flex items-center gap-2 bg-[#1E4A2E] hover:bg-[#2D6B3D] px-5 py-2 rounded-full text-sm font-mono"
                    >
                      <Volume2 /> Play 10-min Audiobook
                    </button>
                  </div>
                  <div className="prose prose-invert max-w-none text-lg leading-relaxed text-[#EDE8DC]">
                    {chunk.text}
                  </div>
                  <button
                    onClick={() => callNestAI(`Explain ${chunk.title} in more depth with Nest examples`)}
                    className="mt-6 flex items-center gap-2 bg-[#C4A048] hover:bg-[#E8C87A] text-[#030A06] px-6 py-3 rounded-xl font-mono text-sm"
                  >
                    <Bot /> Ask Nest AI Professor
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Quiz ── */}
        {activeTab === 'quiz' && (
          <div className="max-w-3xl mx-auto bg-[#0D2218] p-10 rounded-3xl border border-[#1E4A2E]">
            <div className="flex justify-between mb-8 font-mono text-sm">
              <div>Question {currentQuestionIndex + 1} / {questions.length}</div>
              <div className="text-emerald-400">Score: {score}</div>
            </div>
            <h3 className="text-2xl font-serif mb-8 leading-tight">{currentQuestion.question}</h3>
            <div className="space-y-4 mb-10">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className={`w-full text-left p-6 rounded-2xl border text-lg transition-all font-mono ${
                    selectedAnswer === index
                      ? isCorrect
                        ? 'border-emerald-500 bg-emerald-950'
                        : 'border-red-500 bg-red-950'
                      : 'border-[#1E4A2E] hover:border-[#7A9A82]'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            {showExplanation && (
              <div className="bg-[#1E4A2E] p-8 rounded-2xl mb-8">
                <p className="text-lg mb-6 text-[#EDE8DC]">{currentQuestion.explanation}</p>
                <button
                  onClick={() => callNestAI(currentQuestion.aiPrompt)}
                  className="flex items-center gap-3 bg-violet-700 hover:bg-violet-600 px-8 py-4 rounded-2xl text-lg font-mono"
                >
                  <Bot className="w-6 h-6" /> Deep Stanford Professor Explanation + Nest Examples
                </button>
              </div>
            )}
            <button onClick={nextQuestion} className="w-full py-4 bg-[#C4A048] text-[#030A06] font-mono font-semibold rounded-2xl text-lg hover:bg-[#E8C87A]">
              Next Question →
            </button>
          </div>
        )}

        {/* ── Midterm placeholder ── */}
        {activeTab === 'midterm' && (
          <div className="text-[#7A9A82] font-mono p-8">Midterm Boss Battle — coming soon.</div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB: DSCR ENGINE
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'DSCR Engine' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-serif text-[#EDE8DC]">DSCR Waterfall Engine</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Input panel */}
              <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] p-6 space-y-4">
                <h3 className="font-serif text-xl text-[#C4A048] mb-2">HBO2 Inputs</h3>
                {(
                  [
                    ['Gross Revenue', 'grossRevenue'],
                    ['Vacancy Rate', 'vacancyRate'],
                    ['Operating Expense Ratio', 'operatingExpenseRatio'],
                    ['Reserve / Unit', 'replacementReservePerUnit'],
                    ['Units', 'units'],
                    ['Annual Debt Service', 'annualDebtService'],
                    ['Loan Balance', 'loanBalance'],
                    ['Cap Rate', 'capRate'],
                  ] as [string, keyof OperatingInputs][]
                ).map(([label, key]) => (
                  <div key={key}>
                    <label className="block text-xs text-[#7A9A82] font-mono mb-1">{label}</label>
                    <input
                      type="number"
                      value={(dscrInputs as Record<string, number>)[key] ?? ''}
                      onChange={e =>
                        setDscrInputs(prev => ({ ...prev, [key]: parseFloat(e.target.value) }))
                      }
                      className="w-full bg-[#1E4A2E] border border-[#2D6B3D] rounded-lg px-3 py-2 font-mono text-sm text-[#EDE8DC] focus:outline-none focus:border-[#C4A048]"
                    />
                  </div>
                ))}
                <button
                  onClick={handleRunWaterfall}
                  className="w-full mt-4 bg-[#C4A048] hover:bg-[#E8C87A] text-[#030A06] font-mono font-semibold py-3 rounded-xl"
                >
                  Run Waterfall
                </button>
              </div>

              {/* Results */}
              <div className="lg:col-span-2 space-y-6">
                {dscrResult && (
                  <>
                    {/* DSCR hero */}
                    <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] p-6 flex items-center gap-8">
                      <div>
                        <div className="text-xs text-[#7A9A82] font-mono mb-1">DEBT SERVICE COVERAGE RATIO</div>
                        <div className="text-6xl font-mono text-[#C4A048]">{dscrResult.dscr?.toFixed(2) ?? '—'}</div>
                      </div>
                      <GradeBadge grade={getDscrGrade(dscrResult.dscr ?? 0)} />
                    </div>

                    {/* Waterfall table */}
                    <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] overflow-hidden">
                      <table className="w-full text-sm font-mono">
                        <thead>
                          <tr className="border-b border-[#1E4A2E]">
                            <th className="text-left px-6 py-3 text-[#7A9A82]">Line Item</th>
                            <th className="text-right px-6 py-3 text-[#7A9A82]">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dscrResult.waterfall?.map((row: { label: string; value: number }, i: number) => (
                            <tr key={i} className="border-b border-[#1E4A2E] hover:bg-[#1E4A2E]/30">
                              <td className="px-6 py-3 text-[#EDE8DC]">{row.label}</td>
                              <td className={`px-6 py-3 text-right ${row.label === 'DSCR' ? 'text-[#C4A048]' : 'text-[#EDE8DC]'}`}>
                                {typeof row.value === 'number' && row.value < 10
                                  ? row.value.toFixed(2)
                                  : fmtUSD(row.value)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                {/* Stress test table */}
                {stressResult && (
                  <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] overflow-hidden">
                    <div className="px-6 py-4 border-b border-[#1E4A2E]">
                      <h3 className="font-serif text-lg text-[#C4A048]">Stress Scenarios</h3>
                    </div>
                    <table className="w-full text-sm font-mono">
                      <thead>
                        <tr className="border-b border-[#1E4A2E]">
                          <th className="text-left px-6 py-3 text-[#7A9A82]">Scenario</th>
                          <th className="text-right px-6 py-3 text-[#7A9A82]">DSCR</th>
                          <th className="text-center px-6 py-3 text-[#7A9A82]">Pass</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stressResult.map((row: { scenario: string; dscr: number; pass: boolean }, i: number) => (
                          <tr key={i} className="border-b border-[#1E4A2E] hover:bg-[#1E4A2E]/30">
                            <td className="px-6 py-3 text-[#EDE8DC]">{row.scenario}</td>
                            <td className="px-6 py-3 text-right text-[#EDE8DC]">{row.dscr?.toFixed(2)}</td>
                            <td className="px-6 py-3 text-center">{row.pass ? '✓' : '✗'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {!dscrResult && (
                  <div className="flex items-center justify-center h-48 text-[#7A9A82] font-mono text-sm border border-dashed border-[#1E4A2E] rounded-2xl">
                    Enter inputs and click Run Waterfall
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB: SURETY PRICING
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'Surety Pricing' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-serif text-[#EDE8DC]">Surety Bond Pricing Engine</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Inputs */}
              <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] p-6 space-y-4">
                <h3 className="font-serif text-xl text-[#C4A048] mb-2">Bond Inputs</h3>

                {([
                  ['Bond Face ($)', 'bondFace', 'number'],
                  ['DSCR', 'dscr', 'number'],
                  ['LTV', 'ltv', 'number'],
                  ['Sponsor Net Worth ($)', 'sponsorNetWorth', 'number'],
                  ['Liquidity Ratio', 'liquidityRatio', 'number'],
                  ['Years in Business', 'yearsInBusiness', 'number'],
                ] as [string, keyof SuretyInputs, string][]).map(([label, key]) => (
                  <div key={key as string}>
                    <label className="block text-xs text-[#7A9A82] font-mono mb-1">{label}</label>
                    <input
                      type="number"
                      value={(suretyInputs as Record<string, number | string>)[key as string] as number}
                      onChange={e =>
                        setSuretyInputs(prev => ({ ...prev, [key]: parseFloat(e.target.value) }))
                      }
                      className="w-full bg-[#1E4A2E] border border-[#2D6B3D] rounded-lg px-3 py-2 font-mono text-sm text-[#EDE8DC] focus:outline-none focus:border-[#C4A048]"
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-xs text-[#7A9A82] font-mono mb-1">Project Type</label>
                  <select
                    value={suretyInputs.projectType}
                    onChange={e => setSuretyInputs(prev => ({ ...prev, projectType: e.target.value }))}
                    className="w-full bg-[#1E4A2E] border border-[#2D6B3D] rounded-lg px-3 py-2 font-mono text-sm text-[#EDE8DC] focus:outline-none focus:border-[#C4A048]"
                  >
                    {['CCRC', 'Multifamily', 'Office', 'Industrial', 'Retail', 'Hospitality'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-[#7A9A82] font-mono mb-1">AUM Tier</label>
                  <select
                    value={suretyInputs.aumTier}
                    onChange={e => setSuretyInputs(prev => ({ ...prev, aumTier: e.target.value }))}
                    className="w-full bg-[#1E4A2E] border border-[#2D6B3D] rounded-lg px-3 py-2 font-mono text-sm text-[#EDE8DC] focus:outline-none focus:border-[#C4A048]"
                  >
                    {['self-collateralized', 'hybrid', 'LC-dominant'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handlePriceBond}
                  className="w-full mt-4 bg-[#C4A048] hover:bg-[#E8C87A] text-[#030A06] font-mono font-semibold py-3 rounded-xl"
                >
                  Price Bond
                </button>
              </div>

              {/* Result */}
              <div className="lg:col-span-2">
                {suretyResult ? (
                  <div className="space-y-4">
                    <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-serif text-xl text-[#EDE8DC]">Pricing Result</h3>
                        <span className={`font-mono text-sm px-3 py-1 rounded-full ${tierColor(suretyResult.tier ?? '')}`}>
                          {suretyResult.tier}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[
                          ['Annual Premium Rate', `${suretyResult.annualPremiumBps} bps`],
                          ['Annual Premium', fmtUSD(suretyResult.annualPremium)],
                          ['3-yr Total', fmtUSD(suretyResult.threeYearTotal)],
                          ['Collateral Required', fmtUSD(suretyResult.collateralRequired)],
                          ['LC Required', fmtUSD(suretyResult.lcRequired)],
                        ].map(([label, value]) => (
                          <div key={label} className="bg-[#1E4A2E] rounded-xl p-4">
                            <div className="text-xs text-[#7A9A82] font-mono mb-1">{label}</div>
                            <div className="text-lg text-[#C4A048] font-mono">{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {suretyResult.notes?.length > 0 && (
                      <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] p-6">
                        <h4 className="font-mono text-sm text-[#7A9A82] mb-3">ADJUSTMENTS APPLIED</h4>
                        <ul className="space-y-2">
                          {suretyResult.notes.map((note: string, i: number) => (
                            <li key={i} className="text-sm text-[#EDE8DC] font-mono flex gap-2">
                              <span className="text-[#C4A048]">›</span> {note}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48 text-[#7A9A82] font-mono text-sm border border-dashed border-[#1E4A2E] rounded-2xl">
                    Enter inputs and click Price Bond
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB: CDO BUILDER
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'CDO Builder' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-serif text-[#EDE8DC]">CDO Builder — HBO2 Pool</h2>
              <button
                onClick={handleBuildCDO}
                className="bg-[#C4A048] hover:bg-[#E8C87A] text-[#030A06] font-mono font-semibold px-8 py-3 rounded-xl"
              >
                Build CDO
              </button>
            </div>

            {/* Pool preview */}
            <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] p-6">
              <h3 className="font-mono text-sm text-[#7A9A82] mb-3">POOL — HBO2 ASSETS</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[#1E4A2E]">
                      {['Asset', 'Balance', 'Coupon', 'DSCR', 'LTV', 'Rating'].map(h => (
                        <th key={h} className="text-left px-4 py-2 text-[#7A9A82]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(HBO2_CDO_POOL as { name: string; balance: number; coupon: number; dscr: number; ltv: number; rating: string }[]).map((asset, i) => (
                      <tr key={i} className="border-b border-[#1E4A2E]/50">
                        <td className="px-4 py-2 text-[#EDE8DC]">{asset.name}</td>
                        <td className="px-4 py-2 text-[#C4A048]">{fmtUSD(asset.balance)}</td>
                        <td className="px-4 py-2">{fmtPct(asset.coupon)}</td>
                        <td className="px-4 py-2">{asset.dscr?.toFixed(2)}</td>
                        <td className="px-4 py-2">{fmtPct(asset.ltv)}</td>
                        <td className="px-4 py-2"><GradeBadge grade={asset.rating} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {cdoResult && (
              <>
                {/* Tranche table */}
                <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#1E4A2E]">
                    <h3 className="font-serif text-lg text-[#C4A048]">Tranche Structure</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs font-mono">
                      <thead>
                        <tr className="border-b border-[#1E4A2E]">
                          {['Tranche', 'Attach %', 'Detach %', 'Thickness', 'Exp. Loss %', 'BE Spread (bps)', 'IRR %', 'Survivorship %'].map(h => (
                            <th key={h} className="text-left px-4 py-3 text-[#7A9A82]">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {cdoResult.tranches?.map((t: {
                          name: string; attachPct: number; detachPct: number; thickness: number;
                          expectedLossPct: number; breakEvenSpreadBps: number; irr: number; survivorshipPct: number;
                        }, i: number) => (
                          <tr key={i} className="border-b border-[#1E4A2E] hover:bg-[#1E4A2E]/30">
                            <td className="px-4 py-3 text-[#C4A048]">{t.name}</td>
                            <td className="px-4 py-3">{fmtPct(t.attachPct, 1)}</td>
                            <td className="px-4 py-3">{fmtPct(t.detachPct, 1)}</td>
                            <td className="px-4 py-3">{fmtPct(t.thickness, 1)}</td>
                            <td className="px-4 py-3">{fmtPct(t.expectedLossPct, 2)}</td>
                            <td className="px-4 py-3">{t.breakEvenSpreadBps}</td>
                            <td className="px-4 py-3">{fmtPct(t.irr, 1)}</td>
                            <td className="px-4 py-3">{fmtPct(t.survivorshipPct, 1)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Waterfall scenarios */}
                <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#1E4A2E]">
                    <h3 className="font-serif text-lg text-[#C4A048]">Loss Scenario Waterfall</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs font-mono">
                      <thead>
                        <tr className="border-b border-[#1E4A2E]">
                          <th className="text-left px-4 py-3 text-[#7A9A82]">Loss Rate</th>
                          {cdoResult.tranches?.map((t: { name: string }) => (
                            <th key={t.name} className="text-left px-4 py-3 text-[#7A9A82]">{t.name} Payoff</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {cdoResult.scenarios?.map((row: { lossRate: number; payoffs: number[] }, i: number) => (
                          <tr key={i} className="border-b border-[#1E4A2E]/50 hover:bg-[#1E4A2E]/20">
                            <td className="px-4 py-3 text-[#EDE8DC]">{fmtPct(row.lossRate, 0)}</td>
                            {row.payoffs.map((p: number, j: number) => (
                              <td key={j} className={`px-4 py-3 ${cdoPayoffColor(p)}`}>
                                {p.toFixed(1)}%
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {!cdoResult && (
              <div className="flex items-center justify-center h-32 text-[#7A9A82] font-mono text-sm border border-dashed border-[#1E4A2E] rounded-2xl">
                Click Build CDO to run analysis
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB: SHAP SUITE
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'SHAP Suite' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-serif text-[#EDE8DC]">SHAP Explainability Suite — HBO2</h2>
              <button
                onClick={handleComputeSHAP}
                className="bg-[#C4A048] hover:bg-[#E8C87A] text-[#030A06] font-mono font-semibold px-8 py-3 rounded-xl"
              >
                Compute SHAP
              </button>
            </div>

            {shapResult && (
              <>
                {/* Prediction badge */}
                <div className="flex items-center gap-4">
                  <div className="text-sm font-mono text-[#7A9A82]">Model Prediction:</div>
                  <div className="text-2xl font-mono text-[#C4A048]">{shapResult.prediction?.toFixed(3)}</div>
                  {shapResult.prediction > 0.6 ? (
                    <span className="bg-[#C4A048] text-[#030A06] font-mono text-sm px-4 py-1 rounded-full">Investment Grade</span>
                  ) : (
                    <span className="bg-red-800 text-red-200 font-mono text-sm px-4 py-1 rounded-full">Sub-IG</span>
                  )}
                </div>

                {/* Force Plot */}
                <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] p-6">
                  <h3 className="font-serif text-lg text-[#C4A048] mb-6">Force Plot</h3>
                  <div className="space-y-1 mb-4">
                    <div className="flex items-center gap-2 text-xs font-mono text-[#7A9A82] mb-3">
                      <span>Base: {shapResult.baseValue?.toFixed(3)}</span>
                      <div className="flex-1 border-t border-dashed border-[#1E4A2E]" />
                      <span>Prediction: {shapResult.prediction?.toFixed(3)}</span>
                    </div>
                    {shapResult.shapValues
                      ?.slice()
                      .sort((a: { shapValue: number }, b: { shapValue: number }) => Math.abs(b.shapValue) - Math.abs(a.shapValue))
                      .map((item: { feature: string; shapValue: number; featureValue: number }, i: number) => {
                        const maxAbs = Math.max(
                          ...shapResult.shapValues.map((s: { shapValue: number }) => Math.abs(s.shapValue)),
                        );
                        const width = Math.round((Math.abs(item.shapValue) / maxAbs) * 200);
                        const isPos = item.shapValue >= 0;
                        return (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-40 text-right text-xs font-mono text-[#EDE8DC] truncate">{item.feature}</div>
                            <div className="flex items-center">
                              <div
                                style={{ width: `${width}px`, height: '18px' }}
                                className={`rounded-sm ${isPos ? 'bg-[#C4A048]' : 'bg-red-600'}`}
                              />
                            </div>
                            <div className="text-xs font-mono text-[#7A9A82]">
                              {isPos ? '+' : ''}{item.shapValue?.toFixed(3)} ({item.featureValue})
                            </div>
                          </div>
                        );
                      })}
                  </div>
                  <div className="flex gap-6 text-xs font-mono mt-4">
                    <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 bg-[#C4A048] rounded-sm" /> Positive impact</span>
                    <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 bg-red-600 rounded-sm" /> Negative impact</span>
                  </div>
                </div>

                {/* Summary Plot */}
                <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] p-6">
                  <h3 className="font-serif text-lg text-[#C4A048] mb-6">Summary Plot — Mean |SHAP|</h3>
                  <div className="space-y-2">
                    {shapResult.shapValues
                      ?.slice()
                      .sort((a: { shapValue: number }, b: { shapValue: number }) => Math.abs(b.shapValue) - Math.abs(a.shapValue))
                      .map((item: { feature: string; shapValue: number }, i: number) => {
                        const maxAbs = Math.max(
                          ...shapResult.shapValues.map((s: { shapValue: number }) => Math.abs(s.shapValue)),
                        );
                        const width = Math.round((Math.abs(item.shapValue) / maxAbs) * 240);
                        return (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-8 text-right text-xs font-mono text-[#7A9A82]">#{i + 1}</div>
                            <div className="w-36 text-xs font-mono text-[#EDE8DC] truncate">{item.feature}</div>
                            <div style={{ width: `${width}px`, height: '14px' }} className="bg-[#2D6B3D] rounded-sm" />
                            <div className="text-xs font-mono text-[#7A9A82]">{Math.abs(item.shapValue).toFixed(3)}</div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Interaction values */}
                {shapResult.interactions?.length > 0 && (
                  <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] p-6">
                    <h3 className="font-serif text-lg text-[#C4A048] mb-4">Top Interaction Values</h3>
                    <table className="w-full text-xs font-mono">
                      <thead>
                        <tr className="border-b border-[#1E4A2E]">
                          <th className="text-left px-4 py-2 text-[#7A9A82]">Feature A</th>
                          <th className="text-left px-4 py-2 text-[#7A9A82]">Feature B</th>
                          <th className="text-right px-4 py-2 text-[#7A9A82]">Interaction</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shapResult.interactions.slice(0, 3).map((row: { featureA: string; featureB: string; value: number }, i: number) => (
                          <tr key={i} className="border-b border-[#1E4A2E]/50">
                            <td className="px-4 py-2 text-[#EDE8DC]">{row.featureA}</td>
                            <td className="px-4 py-2 text-[#EDE8DC]">{row.featureB}</td>
                            <td className="px-4 py-2 text-right text-[#C4A048]">{row.value?.toFixed(4)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {!shapResult && (
              <div className="flex items-center justify-center h-48 text-[#7A9A82] font-mono text-sm border border-dashed border-[#1E4A2E] rounded-2xl">
                Click Compute SHAP to run explainability analysis
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB: SHADOW RATING
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'Shadow Rating' && (
          <div className="space-y-8">
            {/* Deal header */}
            <div className="flex items-center gap-6">
              <div>
                <h2 className="text-3xl font-serif text-[#EDE8DC]">HBO2 — CCRC Bond Deal</h2>
                <div className="text-[#7A9A82] font-mono text-sm mt-1">Alternative Data Shadow Rating Analysis</div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-xs font-mono text-[#7A9A82]">BOND FACE</div>
                <div className="text-4xl font-mono text-[#C4A048]">$155M</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Alt data */}
              <div className="space-y-4">
                {/* News score */}
                <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] p-6">
                  <h3 className="font-mono text-sm text-[#7A9A82] mb-4">ALTERNATIVE DATA SIGNALS</h3>
                  <div className="mb-4">
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-[#EDE8DC]">News Sentiment Score</span>
                      <span className="text-[#C4A048]">{HBO2_ALTERNATIVE_DATA.newsScore} / 100</span>
                    </div>
                    <div className="w-full bg-[#1E4A2E] h-2 rounded-full">
                      <div className="bg-[#C4A048] h-2 rounded-full" style={{ width: `${HBO2_ALTERNATIVE_DATA.newsScore}%` }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-[#1E4A2E] rounded-xl p-3">
                      <div className="text-xs text-[#7A9A82] font-mono mb-1">LinkedIn Growth</div>
                      <div className="text-sm text-[#C4A048] font-mono">{HBO2_ALTERNATIVE_DATA.linkedinGrowth}</div>
                    </div>
                    <div className="bg-[#1E4A2E] rounded-xl p-3">
                      <div className="text-xs text-[#7A9A82] font-mono mb-1">Glassdoor</div>
                      <div className="text-sm text-[#C4A048] font-mono">{HBO2_ALTERNATIVE_DATA.glassdoorScore} / 5.0</div>
                    </div>
                  </div>
                </div>

                {/* EDGAR flags */}
                <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] p-6">
                  <h3 className="font-mono text-sm text-[#7A9A82] mb-3">EDGAR FLAGS</h3>
                  <ul className="space-y-2">
                    {HBO2_ALTERNATIVE_DATA.edgarFlags.map((flag, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm font-mono text-[#EDE8DC]">
                        <span className="text-emerald-400">✓</span> {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right: EMMA comps */}
              <div className="space-y-4">
                <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#1E4A2E]">
                    <h3 className="font-serif text-lg text-[#C4A048]">EMMA Comparable Bonds</h3>
                  </div>
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr className="border-b border-[#1E4A2E]">
                        {['Name', 'Rating', 'Yield', 'DSCR'].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-[#7A9A82]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {HBO2_ALTERNATIVE_DATA.emmaComps.map((comp, i) => (
                        <tr key={i} className="border-b border-[#1E4A2E]/50 hover:bg-[#1E4A2E]/30">
                          <td className="px-4 py-3 text-[#EDE8DC]">{comp.name}</td>
                          <td className="px-4 py-3"><GradeBadge grade={comp.rating} /></td>
                          <td className="px-4 py-3 text-[#C4A048]">{comp.yield.toFixed(2)}%</td>
                          <td className="px-4 py-3">{comp.dscr.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Shadow rating badge */}
                <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div>
                      <div className="text-xs font-mono text-[#7A9A82] mb-1">NEST SHADOW RATING</div>
                      <div className="text-5xl font-mono text-[#C4A048]">{HBO2_ALTERNATIVE_DATA.shadowRating}</div>
                    </div>
                    <GradeBadge grade={HBO2_ALTERNATIVE_DATA.shadowRating} />
                  </div>
                </div>
              </div>
            </div>

            {/* NEST Recommendation */}
            <div className="bg-[#1E4A2E] rounded-2xl border border-[#2D6B3D] p-8">
              <h3 className="font-serif text-xl text-[#C4A048] mb-4">NEST Recommendation</h3>
              <p className="font-serif text-[#EDE8DC] italic leading-relaxed">
                {HBO2_ALTERNATIVE_DATA.ratingJustification}
              </p>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB: BREX REBATE
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'Brex Rebate' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-serif text-[#EDE8DC]">Brex Rebate Optimizer</h2>

            {/* Hero numbers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] p-6">
                <div className="text-xs text-[#7A9A82] font-mono mb-2">MONTHLY SPEND</div>
                <div className="text-5xl text-[#C4A048] font-mono">${(BREX_CONFIG.monthlySpend / 1000).toFixed(0)}K</div>
              </div>
              <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] p-6">
                <div className="text-xs text-[#7A9A82] font-mono mb-2">ANNUAL REBATE</div>
                <div className="text-5xl text-[#C4A048] font-mono">{fmtUSD(brexAnnualRebate)}</div>
              </div>
              <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] p-6">
                <div className="text-xs text-[#7A9A82] font-mono mb-2">3-YEAR REBATE VALUE</div>
                <div className="text-5xl text-[#C4A048] font-mono">{fmtUSD(brexThreeYear)}</div>
              </div>
            </div>

            {/* Category breakdown table */}
            <div className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#1E4A2E]">
                <h3 className="font-serif text-lg text-[#C4A048]">Category Breakdown</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-mono">
                  <thead>
                    <tr className="border-b border-[#1E4A2E]">
                      {['Category', 'Monthly Spend', 'Rebate Rate', 'Monthly Rebate', 'Annual Rebate'].map(h => (
                        <th key={h} className="text-left px-6 py-3 text-[#7A9A82]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {BREX_CONFIG.categories.map((cat, i) => (
                      <tr key={i} className="border-b border-[#1E4A2E]/50 hover:bg-[#1E4A2E]/20">
                        <td className="px-6 py-3 text-[#EDE8DC]">{cat.name}</td>
                        <td className="px-6 py-3 text-[#EDE8DC]">{fmtUSD(cat.spend)}</td>
                        <td className="px-6 py-3 text-[#EDE8DC]">{(cat.rebatePct * 100).toFixed(1)}%</td>
                        <td className="px-6 py-3 text-[#C4A048]">{fmtUSD(cat.spend * cat.rebatePct)}</td>
                        <td className="px-6 py-3 text-[#C4A048]">{fmtUSD(cat.spend * cat.rebatePct * 12)}</td>
                      </tr>
                    ))}
                    {/* Total row */}
                    <tr className="border-t-2 border-[#C4A048] bg-[#1E4A2E]">
                      <td className="px-6 py-4 text-[#C4A048] font-semibold">TOTAL</td>
                      <td className="px-6 py-4 text-[#C4A048]">{fmtUSD(BREX_CONFIG.monthlySpend)}</td>
                      <td className="px-6 py-4 text-[#C4A048]">blended {(BREX_CONFIG.rebateRate * 100).toFixed(1)}%</td>
                      <td className="px-6 py-4 text-[#C4A048]">{fmtUSD(brexAnnualRebate / 12)}</td>
                      <td className="px-6 py-4 text-[#C4A048] font-semibold">{fmtUSD(brexAnnualRebate)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Escrow strategy card */}
            <div className="bg-[#1E4A2E] rounded-2xl border border-[#2D6B3D] p-8">
              <h3 className="font-serif text-xl text-[#C4A048] mb-3">Escrow Strategy</h3>
              <p className="text-[#EDE8DC] font-mono text-sm leading-relaxed">
                Rebate auto-deposited to prefunded escrow. Earns{' '}
                <span className="text-[#C4A048]">SOFR + 15bp</span> ={' '}
                <span className="text-[#C4A048] text-lg">{fmtUSD(sofrYield)}</span>{' '}
                additional annual yield on rebate balance.
                3-year compounded escrow value:{' '}
                <span className="text-[#C4A048] text-xl">{fmtUSD(brexThreeYear + sofrYield * 3)}</span>.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
