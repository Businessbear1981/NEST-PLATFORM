'use client';

import React, { useState } from 'react';
import { Trophy, Bot, Volume2, Award, Target, Clock, BookOpen, Zap, FlaskConical, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import DSCREngine from '@/components/academy/DSCREngine';
import SuretyPricing from '@/components/academy/SuretyPricing';
import CDOBuilder from '@/components/academy/CDOBuilder';
import SHAPSuite from '@/components/academy/SHAPSuite';
import CDSEngine from '@/components/academy/CDSEngine';
import ShadowRating from '@/components/academy/ShadowRating';
import BrexRebate from '@/components/academy/BrexRebate';
import TEFRAEngine from '@/components/academy/TEFRAEngine';
import RefiEngine from '@/components/academy/RefiEngine';
import EagleEyeEngine from '@/components/academy/EagleEyeEngine';

// ─── Exam track definitions ──────────────────────────────────────────────────

const EXAMS = {
  s52: {
    code: 'Series 52',
    title: 'Municipal Securities Representative',
    passScore: 72,
    questions: 75,
    time: '2.5 hrs',
    progress: 82,
    xp: 1850,
    badge: 'MuniMaster',
    color: '#C4A048',
    modules: [
      {
        id: 's52-m1',
        title: 'GO vs Revenue Bonds',
        chunk: 'General Obligation (GO) bonds are backed by the full faith, credit, and taxing power of the issuing municipality. Revenue bonds are secured exclusively by revenues from a specific project — tolls, water/sewer fees, hospital revenues. In NEST workflows, most CCRC and senior housing transactions use revenue bonds backed by operating income, requiring strong DSCR stress testing and surety enhancement for 100% placement.',
        weight: '15%',
        topics: ['Bond types', 'Pledge structures', 'Tax security', 'Moral obligation bonds'],
      },
      {
        id: 's52-m2',
        title: 'TEFRA & Volume Cap',
        chunk: 'TEFRA (Tax Equity and Fiscal Responsibility Act of 1982) requires a public approval process — a hearing plus governmental body approval — for tax-exempt private activity bonds (PABs). Volume cap limits the annual allocation of PABs per state based on population. Critical for NEST conduit packaging: missing TEFRA compliance voids tax-exempt status, triggering immediate taxability of all outstanding interest.',
        weight: '12%',
        topics: ['TEFRA hearing', 'Private activity bonds', 'Volume cap allocation', 'Bond counsel role'],
      },
      {
        id: 's52-m3',
        title: 'Credit & Rating Analysis',
        chunk: 'Municipal credit analysis examines the Four Cs: Capacity (revenue sufficiency, DSCR), Character (management track record), Conditions (economic environment, debt burden), and Collateral (underlying assets). Moody\'s/S&P rate muni bonds using similar frameworks. NEST\'s shadow rating engine mirrors these methodologies using alternative data (EDGAR, LinkedIn, EMMA comps) to independently assess obligor grade before formal rating engagement.',
        weight: '18%',
        topics: ['Moody\'s / S&P methodology', 'DSCR analysis', 'Debt burden ratios', 'EMMA comparable data'],
      },
      {
        id: 's52-m4',
        title: 'Pricing & Yield Calculations',
        chunk: 'Municipal bond yield is calculated using the standard bond pricing formula: Price = Σ(Coupon × PV factor) + Par × PV factor at maturity. Tax-equivalent yield (TEY) = Muni yield / (1 − marginal tax rate). Current yield = annual coupon / market price. Yield to maturity accounts for price discount/premium amortized over life. NEST bonds targeting BBB tier price at 6.25–6.75% depending on surety structure.',
        weight: '20%',
        topics: ['YTM', 'Current yield', 'TEY', 'Dollar price vs yield', 'Basis points'],
      },
      {
        id: 's52-m5',
        title: 'Trade Settlement & Compliance',
        chunk: 'Municipal securities settle T+2. MSRB Rule G-17 requires dealers to deal fairly and not engage in deceptive practices. G-19 covers suitability — muni bonds must be appropriate for the customer\'s financial profile. G-30 governs pricing to customers. Official statements (OS) must be delivered before or with trade confirmation for new issues. NEST transactions involve institutional investors only (qualified institutional buyers per Rule 144A).',
        weight: '15%',
        topics: ['MSRB rules G-17 through G-47', 'Settlement T+2', 'Official statement', 'Customer suitability'],
      },
    ],
  },

  s7: {
    code: 'Series 7',
    title: 'General Securities Representative',
    passScore: 72,
    questions: 125,
    time: '3.75 hrs',
    progress: 65,
    xp: 1320,
    badge: 'BondPro',
    color: '#7A9A82',
    modules: [
      {
        id: 's7-m1',
        title: 'Debt Securities Fundamentals',
        chunk: 'Corporate and government bonds are IOUs — the issuer borrows money and promises periodic interest (coupon) plus return of principal at maturity. Bond price and yield move inversely: when rates rise, existing bond prices fall. Duration measures interest rate sensitivity. Investment grade is BBB-/Baa3 or higher. High-yield (junk) bonds are below that threshold — higher return, higher default risk. NEST structures bonds at BBB to A range using surety enhancement.',
        weight: '14%',
        topics: ['Bond pricing', 'Duration', 'Convexity', 'Investment grade vs high yield', 'Spread analysis'],
      },
      {
        id: 's7-m2',
        title: 'Equity Securities',
        chunk: 'Common stock: residual claim on assets, voting rights, dividends at board discretion. Preferred stock: fixed dividend priority over common, no voting rights, cumulative provision if dividends in arrears. Rights and warrants allow purchase of new shares at set prices. ADRs trade foreign equities on US exchanges. For Series 7, know how dividends are declared (record date, ex-dividend date, payable date) and how stock splits affect price and shares.',
        weight: '14%',
        topics: ['Common vs preferred', 'Dividends', 'Ex-div date', 'Rights / warrants', 'ADRs'],
      },
      {
        id: 's7-m3',
        title: 'Packaged Products',
        chunk: 'Mutual funds: open-end, priced at NAV end of day, no trading during day. ETFs: trade intraday on exchanges, creation/redemption mechanism keeps price near NAV. REITs must distribute 90%+ of taxable income, provide real estate exposure. Variable annuities are insurance + investment products with mortality & expense charges. UITs: fixed portfolio, not actively managed. Know the cost structure, sales charges, and suitability for each product type.',
        weight: '17%',
        topics: ['NAV calculation', 'Breakpoints', '12b-1 fees', 'Variable annuities', 'ETF arbitrage mechanism'],
      },
      {
        id: 's7-m4',
        title: 'Options Fundamentals',
        chunk: 'A call option gives the holder the right to BUY 100 shares at the strike price before expiration. A put option gives the right to SELL. Maximum gain for a call buyer: unlimited (stock can rise indefinitely). Maximum loss: premium paid. Covered call = long stock + short call (income strategy, capped upside). Protective put = long stock + long put (insurance, limits downside). Know breakeven: call = strike + premium; put = strike − premium.',
        weight: '15%',
        topics: ['Calls vs puts', 'Long / short positions', 'Breakeven', 'Covered calls', 'Protective puts', 'Greeks overview'],
      },
    ],
  },

  s58: {
    code: 'Series 58',
    title: 'Securities Trader Representative',
    passScore: 70,
    questions: 60,
    time: '1.5 hrs',
    progress: 28,
    xp: 480,
    badge: 'TraderPro',
    color: '#2D6B3D',
    modules: [
      {
        id: 's58-m1',
        title: 'Market Structure & Regulation NMS',
        chunk: 'Regulation NMS (National Market System) established the Order Protection Rule (trade-through prohibition), Access Rule (fair access to quotations), Sub-Penny Rule, and Market Data Rules. The NBBO (National Best Bid and Offer) aggregates the best bid and ask across all exchanges. Market centers must route orders to the venue displaying the NBBO unless an exception applies. Dark pools and ATSs operate under Reg ATS with less transparent pre-trade reporting.',
        weight: '25%',
        topics: ['Reg NMS', 'NBBO', 'Order protection', 'Dark pools', 'ATS registration'],
      },
      {
        id: 's58-m2',
        title: 'Order Types & Handling',
        chunk: 'Market orders execute immediately at current price. Limit orders execute at specified price or better. Stop orders become market orders when the stop price is triggered. Stop-limit orders become limit orders at trigger. IOC (Immediate or Cancel), FOK (Fill or Kill), GTC (Good Till Cancelled). Short sales require locating and borrowing shares first; Rule 203 of Reg SHO governs locate requirements. Threshold securities with persistent fails require mandatory close-out.',
        weight: '20%',
        topics: ['Order types', 'Rule 203 Reg SHO', 'Short selling locate', 'FTD close-out', 'Market maker obligations'],
      },
    ],
  },

  s24: {
    code: 'Series 24',
    title: 'General Securities Principal',
    passScore: 70,
    questions: 150,
    time: '3.75 hrs',
    progress: 12,
    xp: 200,
    badge: 'Principal',
    color: '#C4A048',
    modules: [
      {
        id: 's24-m1',
        title: 'Supervision & Compliance',
        chunk: 'A General Securities Principal (GSP) is responsible for supervising the investment banking and securities business of a broker-dealer. FINRA Rule 3110 requires firms to establish and maintain a supervisory system including Written Supervisory Procedures (WSPs), designation of supervisors for each type of business, and annual review of supervisory procedures. Customer complaints must be reviewed and reported on Form U4/U5 where required. Annual compliance meetings are mandatory.',
        weight: '30%',
        topics: ['FINRA 3110', 'WSPs', 'Form U4/U5', 'Customer complaints', 'Annual compliance review'],
      },
      {
        id: 's24-m2',
        title: 'Registration & Licensing',
        chunk: 'Broker-dealers register with FINRA and the SEC under Section 15 of the Exchange Act. Representatives must pass qualification exams before conducting securities business. The SIE (Securities Industry Essentials) is a co-requisite for all representative-level exams. Registration terminates upon termination of employment; U5 must be filed within 30 days. Continuing education: regulatory element (CE) required 1 year after initial registration and every 3 years thereafter; firm element annually.',
        weight: '20%',
        topics: ['BD registration', 'Rep qualifications', 'SIE exam', 'Form U4/U5 timelines', 'CE requirements'],
      },
    ],
  },
} as const;

type ExamKey = keyof typeof EXAMS;

// ─── Question bank ────────────────────────────────────────────────────────────

const QUESTIONS = [
  // Series 52
  {
    exam: 's52' as ExamKey,
    topic: 'Bond Types',
    q: 'Which type of municipal bond is secured by the full faith, credit, and taxing power of the issuer?',
    options: ['Revenue bond', 'General Obligation bond', 'Industrial revenue bond', 'Special assessment bond'],
    correct: 1,
    explanation: 'GO bonds pledge the municipality\'s unlimited taxing authority. Revenue bonds rely only on project revenues — no taxing power backing.',
    nestContext: 'NEST CCRC deals use revenue bonds backed by occupancy revenues — DSCR stress testing is critical because there is no GO backstop.',
  },
  {
    exam: 's52' as ExamKey,
    topic: 'TEFRA',
    q: 'TEFRA requires a public approval process for which type of bonds?',
    options: ['All municipal bonds', 'Tax-exempt private activity bonds (PABs)', 'General obligation bonds only', 'Taxable municipal bonds'],
    correct: 1,
    explanation: 'TEFRA applies to private activity bonds seeking tax-exempt status. A public hearing + governmental approval is required. Missing this step triggers taxability.',
    nestContext: 'HBO2\'s $155M bond is a §501(c)(3) PAB. TEFRA hearing was held 2024-11-14 in St. Petersburg. Bond counsel (Squire Patton Boggs) certified compliance.',
  },
  {
    exam: 's52' as ExamKey,
    topic: 'Yield Math',
    q: 'A municipal bond has a 5% coupon, par $1,000, and is priced at 102. What is its current yield?',
    options: ['4.90%', '5.00%', '5.10%', '4.78%'],
    correct: 0,
    explanation: 'Current yield = annual coupon / market price = $50 / $1,020 = 4.902%. Price premium above par means current yield < coupon rate.',
    nestContext: 'NEST bonds target 6.25–6.75% current yield at issue. As they season and credit improves (occupancy stabilizes), price appreciation drives yield compression — capital gain for early bond buyers.',
  },
  {
    exam: 's52' as ExamKey,
    topic: 'MSRB Rules',
    q: 'Under MSRB Rule G-17, a dealer must:',
    options: ['Disclose all material information and deal fairly with all persons', 'Always match the lowest competing quote', 'Obtain three competing bids before executing', 'File a SAR within 24 hours of any suspicious trade'],
    correct: 0,
    explanation: 'G-17 is the bedrock fair dealing rule: no deceptive, dishonest, or unfair practices. It requires disclosure of material facts affecting the securities.',
    nestContext: 'NEST bonds are sold to QIBs under 144A. G-17 still applies to any MSRB-registered dealer in the placement chain — material non-disclosure could void the offering.',
  },
  {
    exam: 's52' as ExamKey,
    topic: 'Settlement',
    q: 'The standard settlement for municipal securities transactions is:',
    options: ['Same day (T+0)', 'Next business day (T+1)', 'Two business days (T+2)', 'Three business days (T+3)'],
    correct: 2,
    explanation: 'Municipal securities settle T+2 (two business days after trade date), consistent with most equity and debt securities since the SEC\'s 2017 T+2 rule adoption.',
    nestContext: 'NEST bond desk tracks settlement dates on all placements. Late settlement on a $155M deal creates significant counterparty and funding risk — Bridge Agent monitors live.',
  },

  // Series 7
  {
    exam: 's7' as ExamKey,
    topic: 'Bond Math',
    q: 'A bond\'s coupon is 6%, par value $1,000, priced at 105. What is the current yield?',
    options: ['5.71%', '6.00%', '6.30%', '5.50%'],
    correct: 0,
    explanation: 'Current yield = annual coupon / market price = $60 / $1,050 = 5.714%. When a bond trades at a premium (price > par), current yield < coupon rate.',
    nestContext: 'This math applies directly to NEST\'s HBO2 bonds. If the $155M bond at 6.25% coupon is priced at 101 in secondary trading, current yield = 6.25% / 1.01 = 6.19%.',
  },
  {
    exam: 's7' as ExamKey,
    topic: 'Equity',
    q: 'Which of the following is NOT a characteristic of preferred stock?',
    options: ['Fixed dividend priority over common', 'Voting rights in most circumstances', 'Cumulative dividend provision available', 'No participation in capital appreciation beyond par'],
    correct: 1,
    explanation: 'Preferred stock typically has NO voting rights. It has dividend priority, may have cumulative provisions, but generally lacks equity upside (no unlimited appreciation).',
    nestContext: 'NEST\'s HFT fund (Quantum agent) holds preferred positions in structured finance vehicles. The fixed yield with no voting control is ideal for institutional fund architecture.',
  },
  {
    exam: 's7' as ExamKey,
    topic: 'Options',
    q: 'An investor buys 1 XYZ Jan 50 call at a premium of $3. What is the maximum loss?',
    options: ['$50', '$300', '$5,300', 'Unlimited'],
    correct: 1,
    explanation: 'Maximum loss for a call buyer is the premium paid: $3 × 100 shares = $300. The option simply expires worthless if XYZ stays below $50.',
    nestContext: 'Vector agent (NEST\'s call/put timing engine) manages interest rate options — TLT puts to hedge duration risk on the bond desk. Same premium-risk logic applies.',
  },
  {
    exam: 's7' as ExamKey,
    topic: 'Packaged Products',
    q: 'An investor redeems mutual fund shares at end of day. The price received is:',
    options: ['The last traded price before redemption', 'The next calculated NAV after the order', 'The NAV from the previous trading day', 'The bid price quoted at time of order'],
    correct: 1,
    explanation: 'Mutual funds use forward pricing: the investor receives the NEXT NAV calculated after order submission (typically 4 PM ET close). This is the forward pricing rule.',
    nestContext: 'NEST\'s institutional clients prefer ETFs over mutual funds for this reason — ETFs trade intraday at market price, allowing real-time position management around bond desk activity.',
  },

  // Series 58
  {
    exam: 's58' as ExamKey,
    topic: 'Market Structure',
    q: 'The NBBO under Regulation NMS refers to:',
    options: ['National Best Bid and Offer across all exchanges', 'Net Bond Benchmark Order', 'NASD Best Broker Obligation', 'Nasdaq Binding Book Offer'],
    correct: 0,
    explanation: 'NBBO = National Best Bid and Offer — the highest available bid and lowest available offer consolidated across all registered exchanges and market centers.',
    nestContext: 'When NEST bond desk executes secondary market trades in muni bonds, best execution obligations require routing to the venue with the best available price — analogous to NBBO for equities.',
  },
  {
    exam: 's58' as ExamKey,
    topic: 'Short Sales',
    q: 'Under Regulation SHO Rule 203, before executing a short sale a broker-dealer must:',
    options: ['File a pre-borrow notice with FINRA', 'Locate shares available to borrow', 'Obtain signed customer authorization', 'Report the short to the OCC'],
    correct: 1,
    explanation: 'Rule 203 requires a "locate" — the broker-dealer must have reasonable grounds to believe shares can be borrowed before executing the short sale. The locate must be documented.',
    nestContext: 'Apex agent (NEST\'s short position manager) executes TLT puts rather than short selling the underlying to avoid locate requirements and uptick rule complications.',
  },

  // Series 24
  {
    exam: 's24' as ExamKey,
    topic: 'Supervision',
    q: 'Under FINRA Rule 3110, which of the following is a required element of a broker-dealer\'s supervisory system?',
    options: ['Daily compliance review by the CEO', 'Written Supervisory Procedures (WSPs)', 'Monthly FINRA audit filing', 'Pre-approval of all customer account trades'],
    correct: 1,
    explanation: 'FINRA 3110 requires firms to establish WSPs that describe supervisory procedures for each type of business conducted. WSPs must identify supervisors and review mechanisms.',
    nestContext: 'NEST will require WSPs when it operates as a registered BD under the Britehorn sponsorship track. Atticus (compliance agent) drafts the WSP framework as part of NEST\'s licensing buildout.',
  },
  {
    exam: 's24' as ExamKey,
    topic: 'CE Requirements',
    q: 'FINRA\'s regulatory element of continuing education is required:',
    options: ['Annually from registration', '1 year after initial registration, then every 3 years', 'Only upon promotion to principal', 'Every 5 years throughout career'],
    correct: 1,
    explanation: 'The regulatory element is required within 1 year of initial registration, then every 3 years thereafter. The firm element (internal training) is required annually for all registered personnel.',
    nestContext: 'Sean\'s Series 7/52/24 maintenance CE is tracked in NEST Academy. Platform automatically flags upcoming CE deadlines 60 days in advance.',
  },
];

// ─── Lab definitions ──────────────────────────────────────────────────────────

const LAB_TABS = [
  'DSCR Engine', 'Surety Pricing', 'CDO Builder', 'SHAP Suite',
  'CDS Engine', 'Shadow Rating', 'Brex Rebate', 'TEFRA Engine',
  'Refi Engine', 'Eagle Eye',
] as const;

type LabTab = typeof LAB_TABS[number];

// ─── Component ────────────────────────────────────────────────────────────────

export default function NestAcademy() {
  const [mainTab, setMainTab]          = useState<'study' | 'quiz' | 'mock' | 'labs'>('study');
  const [activeExam, setActiveExam]    = useState<ExamKey>('s52');
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [quizExam, setQuizExam]        = useState<ExamKey>('s52');
  const [qIndex, setQIndex]            = useState(0);
  const [score, setScore]              = useState(0);
  const [streak, setStreak]            = useState(0);
  const [xpTotal, setXpTotal]          = useState(2450);
  const [selected, setSelected]        = useState<number | null>(null);
  const [isCorrect, setIsCorrect]      = useState<boolean | null>(null);
  const [showExp, setShowExp]          = useState(false);
  const [activeLab, setActiveLab]      = useState<LabTab>('DSCR Engine');

  const examData  = EXAMS[activeExam];
  const quizPool  = QUESTIONS.filter((q) => q.exam === quizExam);
  const currentQ  = quizPool[qIndex % quizPool.length];

  function handleAnswer(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    const ok = idx === currentQ.correct;
    setIsCorrect(ok);
    if (ok) {
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
      setXpTotal((x) => x + 50);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    } else {
      setStreak(0);
    }
    setShowExp(true);
  }

  function nextQ() {
    setQIndex((i) => (i + 1) % quizPool.length);
    setSelected(null);
    setIsCorrect(null);
    setShowExp(false);
  }

  const EXAM_KEYS = Object.keys(EXAMS) as ExamKey[];

  return (
    <div className="min-h-screen bg-[#030A06] text-[#EDE8DC] p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-4xl font-serif flex items-center gap-3 text-[#EDE8DC]">
              <Award className="w-9 h-9 text-[#C4A048]" /> NEST ACADEMY
            </h1>
            <p className="text-[#7A9A82] font-mono text-sm mt-1">
              Series 7 · 52 · 58 · 24 — Licensing exam prep for registered representatives
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-[#0D2218] border border-[#1E4A2E] px-4 py-2 rounded-full flex items-center gap-2 font-mono text-sm">
              <Trophy className="w-4 h-4 text-[#C4A048]" />
              <span className="text-[#C4A048]">{xpTotal.toLocaleString()}</span>
              <span className="text-[#7A9A82]">XP</span>
            </div>
            <div className="bg-[#0D2218] border border-[#1E4A2E] px-4 py-2 rounded-full font-mono text-sm">
              <span className="text-[#EDE8DC]">Streak:</span>{' '}
              <span className="text-[#C4A048]">{streak}</span>
              {streak >= 3 && ' 🔥'}
            </div>
          </div>
        </div>

        {/* ── Main nav ── */}
        <div className="flex gap-1 border-b border-[#1E4A2E]">
          {[
            { key: 'study', label: 'Study Center', icon: BookOpen },
            { key: 'quiz',  label: 'Practice Quiz', icon: Target },
            { key: 'mock',  label: 'Mock Exam',     icon: Zap },
            { key: 'labs',  label: 'Pro Labs',      icon: FlaskConical },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setMainTab(key as typeof mainTab)}
              className={`flex items-center gap-2 px-5 py-3 rounded-t-lg font-mono text-sm transition-colors ${
                mainTab === key
                  ? 'bg-[#0D2218] border-b-2 border-[#C4A048] text-[#C4A048]'
                  : 'text-[#7A9A82] hover:text-[#EDE8DC]'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* ══ STUDY CENTER ══ */}
        {mainTab === 'study' && (
          <div className="space-y-6">

            {/* Exam selector */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {EXAM_KEYS.map((key) => {
                const ex = EXAMS[key];
                return (
                  <button
                    key={key}
                    onClick={() => { setActiveExam(key); setActiveModule(null); }}
                    className={`text-left p-5 rounded-2xl border transition-all ${
                      activeExam === key
                        ? 'border-[#C4A048] bg-[#0D2218]'
                        : 'border-[#1E4A2E] bg-[#0D2218] hover:border-[#2D6B3D]'
                    }`}
                  >
                    <div className="font-mono text-xs text-[#7A9A82] mb-1">{ex.questions}Q · {ex.time} · {ex.passScore}% pass</div>
                    <div className={`text-xl font-mono font-bold ${activeExam === key ? 'text-[#C4A048]' : 'text-[#EDE8DC]'}`}>
                      {ex.code}
                    </div>
                    <div className="text-xs text-[#7A9A82] mt-1 font-serif leading-snug">{ex.title}</div>
                    <div className="mt-3 w-full bg-[#1E4A2E] h-1.5 rounded-full">
                      <div className="h-1.5 rounded-full bg-[#C4A048]" style={{ width: `${ex.progress}%` }} />
                    </div>
                    <div className="mt-1 flex justify-between text-[10px] font-mono text-[#7A9A82]">
                      <span>{ex.progress}%</span>
                      <span className="text-[#C4A048]">{ex.xp} XP</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Modules for selected exam */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-serif text-[#EDE8DC]">
                  {examData.code} — {examData.title}
                </h2>
                <button
                  onClick={() => { setQuizExam(activeExam); setMainTab('quiz'); setQIndex(0); }}
                  className="flex items-center gap-2 bg-[#C4A048] hover:bg-[#E8C87A] text-[#030A06] font-mono font-semibold px-5 py-2.5 rounded-xl text-sm"
                >
                  <Target className="w-4 h-4" /> Quiz This Exam
                </button>
              </div>

              <div className="space-y-3">
                {examData.modules.map((mod) => {
                  const open = activeModule === mod.id;
                  return (
                    <div key={mod.id} className="bg-[#0D2218] rounded-2xl border border-[#1E4A2E] overflow-hidden">
                      <button
                        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-[#1E4A2E]/30 transition-colors"
                        onClick={() => setActiveModule(open ? null : mod.id)}
                      >
                        <div>
                          <div className="font-serif text-lg text-[#EDE8DC]">{mod.title}</div>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {mod.topics.map((t) => (
                              <span key={t} className="text-[9px] font-mono text-[#7A9A82] bg-[#1E4A2E] px-2 py-0.5 rounded">{t}</span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-mono text-xs text-[#C4A048]">{mod.weight} of exam</span>
                          <ChevronRight className={`w-5 h-5 text-[#7A9A82] transition-transform ${open ? 'rotate-90' : ''}`} />
                        </div>
                      </button>

                      {open && (
                        <div className="border-t border-[#1E4A2E] px-6 py-5 space-y-4">
                          <p className="text-[#EDE8DC] font-serif text-base leading-relaxed">{mod.chunk}</p>
                          <div className="bg-[#1E4A2E] rounded-xl p-4 border-l-4 border-[#C4A048]">
                            <div className="text-xs font-mono text-[#C4A048] mb-1 uppercase tracking-widest">NEST Real-World Application</div>
                            <p className="text-sm font-mono text-[#EDE8DC] leading-relaxed">
                              {QUESTIONS.find((q) => q.exam === activeExam && q.topic === mod.title)?.nestContext
                                ?? 'See Pro Labs → ' + examData.code + ' instruments in NEST deal workflows.'}
                            </p>
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={() => { setQuizExam(activeExam); setMainTab('quiz'); }}
                              className="flex items-center gap-2 text-sm font-mono px-4 py-2 rounded-lg bg-[#2D6B3D] hover:bg-[#3d8a52] text-[#EDE8DC] transition-colors"
                            >
                              <Target className="w-4 h-4" /> Quiz this topic
                            </button>
                            <button
                              className="flex items-center gap-2 text-sm font-mono px-4 py-2 rounded-lg border border-[#2D6B3D] text-[#7A9A82] hover:text-[#EDE8DC] transition-colors"
                              onClick={() => window.alert(`AI Professor prompt:\n\nAct as MIT/Harvard finance professor. Explain "${mod.title}" in depth with NEST/CCRC/muni bond examples. Include exam-level questions.`)}
                            >
                              <Bot className="w-4 h-4" /> Ask AI Professor
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ══ PRACTICE QUIZ ══ */}
        {mainTab === 'quiz' && (
          <div className="space-y-6">

            {/* Exam filter */}
            <div className="flex flex-wrap gap-2">
              <span className="font-mono text-xs text-[#7A9A82] self-center mr-2">EXAM:</span>
              {EXAM_KEYS.map((key) => (
                <button
                  key={key}
                  onClick={() => { setQuizExam(key); setQIndex(0); setSelected(null); setShowExp(false); setIsCorrect(null); }}
                  className={`font-mono text-xs px-3 py-1.5 rounded-lg transition-colors ${
                    quizExam === key
                      ? 'bg-[#C4A048] text-[#030A06] font-semibold'
                      : 'border border-[#2D6B3D] text-[#7A9A82] hover:text-[#EDE8DC]'
                  }`}
                >
                  {EXAMS[key].code}
                </button>
              ))}
              <span className="ml-auto font-mono text-xs text-[#7A9A82] self-center">
                {quizPool.length} questions · Score: <span className="text-emerald-400">{score}</span>
              </span>
            </div>

            {/* Question card */}
            <div className="max-w-3xl mx-auto bg-[#0D2218] rounded-3xl border border-[#1E4A2E] p-8 space-y-6">
              <div className="flex justify-between font-mono text-sm text-[#7A9A82]">
                <span>{EXAMS[quizExam].code} · {currentQ.topic}</span>
                <span>Q {(qIndex % quizPool.length) + 1} / {quizPool.length}</span>
              </div>

              <h3 className="text-xl font-serif leading-snug text-[#EDE8DC]">{currentQ.q}</h3>

              <div className="space-y-3">
                {currentQ.options.map((opt, i) => {
                  let cls = 'border-[#1E4A2E] hover:border-[#7A9A82]';
                  if (selected !== null) {
                    if (i === currentQ.correct) cls = 'border-emerald-500 bg-emerald-950';
                    else if (i === selected && !isCorrect) cls = 'border-red-500 bg-red-950';
                    else cls = 'border-[#1E4A2E] opacity-50';
                  }
                  return (
                    <button
                      key={i}
                      disabled={selected !== null}
                      onClick={() => handleAnswer(i)}
                      className={`w-full text-left p-5 rounded-2xl border font-mono text-sm transition-all ${cls}`}
                    >
                      <span className="text-[#7A9A82] mr-3">{String.fromCharCode(65 + i)}.</span>
                      {opt}
                    </button>
                  );
                })}
              </div>

              {showExp && (
                <div className="bg-[#1E4A2E] rounded-2xl p-6 space-y-3">
                  <div className={`font-mono text-sm font-semibold ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                  </div>
                  <p className="text-[#EDE8DC] font-serif leading-relaxed">{currentQ.explanation}</p>
                  <div className="border-t border-[#2D6B3D] pt-3">
                    <div className="text-xs font-mono text-[#C4A048] mb-1 uppercase tracking-widest">NEST Context</div>
                    <p className="text-sm font-mono text-[#7A9A82] leading-relaxed">{currentQ.nestContext}</p>
                  </div>
                </div>
              )}

              <button
                onClick={nextQ}
                className="w-full py-4 bg-[#C4A048] hover:bg-[#E8C87A] text-[#030A06] font-mono font-semibold rounded-2xl transition-colors"
              >
                Next Question →
              </button>
            </div>
          </div>
        )}

        {/* ══ MOCK EXAM ══ */}
        {mainTab === 'mock' && (
          <div className="space-y-6">
            <div className="text-center py-16 space-y-6">
              <div className="text-6xl">🏆</div>
              <h2 className="text-3xl font-serif text-[#EDE8DC]">Mock Exam — Boss Battle</h2>
              <p className="text-[#7A9A82] font-mono text-sm max-w-md mx-auto">
                Timed full-length simulations for Series 7, 52, 58, and 24. Complete questions across all study modules before unlocking.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                {EXAM_KEYS.map((key) => {
                  const ex = EXAMS[key];
                  const unlocked = ex.progress >= 70;
                  return (
                    <div key={key} className={`rounded-2xl border p-5 ${unlocked ? 'border-[#C4A048] bg-[#0D2218]' : 'border-[#1E4A2E] bg-[#0D2218] opacity-60'}`}>
                      <div className="font-mono text-lg text-[#C4A048] font-bold">{ex.code}</div>
                      <div className="font-mono text-xs text-[#7A9A82] mt-1">{ex.questions} questions</div>
                      <div className="font-mono text-xs text-[#7A9A82]">{ex.time}</div>
                      <div className={`mt-3 font-mono text-xs font-semibold ${unlocked ? 'text-emerald-400' : 'text-[#7A9A82]'}`}>
                        {unlocked ? '🔓 UNLOCKED' : `🔒 ${ex.progress}% / 70% req.`}
                      </div>
                    </div>
                  );
                })}
              </div>
              <button className="bg-[#C4A048] hover:bg-[#E8C87A] text-[#030A06] font-mono font-semibold px-8 py-4 rounded-2xl transition-colors">
                Start Series 52 Mock Exam
              </button>
            </div>
          </div>
        )}

        {/* ══ PRO LABS ══ */}
        {mainTab === 'labs' && (
          <div className="space-y-6">
            <div className="bg-[#0D2218] rounded-2xl border border-[#C4A048]/30 p-4">
              <div className="text-xs font-mono text-[#C4A048] mb-1">PRO LABS — Supplementary Tools</div>
              <p className="text-sm font-mono text-[#7A9A82]">
                Interactive financial engines that show how Series 52/7/58/24 theory applies to live NEST deals.
                Not part of the exam — these are the real tools behind the platform.
              </p>
            </div>

            {/* Lab tab bar */}
            <div className="flex flex-wrap gap-1 border-b border-[#1E4A2E]">
              {LAB_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveLab(tab)}
                  className={`px-4 py-2.5 rounded-t-lg font-mono text-xs transition-colors ${
                    activeLab === tab
                      ? 'bg-[#0D2218] border-b-2 border-[#C4A048] text-[#C4A048]'
                      : 'text-[#7A9A82] hover:text-[#EDE8DC]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeLab === 'DSCR Engine'     && <DSCREngine />}
            {activeLab === 'Surety Pricing'  && <SuretyPricing />}
            {activeLab === 'CDO Builder'     && <CDOBuilder />}
            {activeLab === 'SHAP Suite'      && <SHAPSuite />}
            {activeLab === 'CDS Engine'      && <CDSEngine />}
            {activeLab === 'Shadow Rating'   && <ShadowRating />}
            {activeLab === 'Brex Rebate'     && <BrexRebate />}
            {activeLab === 'TEFRA Engine'    && <TEFRAEngine />}
            {activeLab === 'Refi Engine'     && <RefiEngine />}
            {activeLab === 'Eagle Eye'       && <EagleEyeEngine />}
          </div>
        )}

      </div>
    </div>
  );
}
