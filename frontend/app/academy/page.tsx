'use client';

import React, { useState } from 'react';
import { Trophy, Bot, Volume2, Award, Target, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import DSCREngine from '@/components/academy/DSCREngine';
import SuretyPricing from '@/components/academy/SuretyPricing';
import CDOBuilder from '@/components/academy/CDOBuilder';
import SHAPSuite from '@/components/academy/SHAPSuite';
import CDSEngine from '@/components/academy/CDSEngine';
import ShadowRating from '@/components/academy/ShadowRating';
import BrexRebate from '@/components/academy/BrexRebate';

// ── Static data ───────────────────────────────────────────────────────────────

const allTabs = [
  'dashboard', 'modules', 'quiz', 'midterm',
  'DSCR Engine', 'Surety Pricing', 'CDO Builder', 'SHAP Suite',
  'CDS Engine', 'Shadow Rating', 'Brex Rebate',
];

export default function NestAcademy() {
  const [activeTab, setActiveTab]                   = useState('dashboard');
  const [currentModuleId, setCurrentModuleId]       = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore]                           = useState(0);
  const [streak, setStreak]                         = useState(0);
  const [xpTotal, setXpTotal]                       = useState(2450);
  const [showExplanation, setShowExplanation]       = useState(false);
  const [selectedAnswer, setSelectedAnswer]         = useState<number | null>(null);
  const [isCorrect, setIsCorrect]                   = useState<boolean | null>(null);

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

  const currentModule = modules.find((m) => m.id === currentModuleId);
  const currentQuestion = questions[currentQuestionIndex];

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
    setCurrentQuestionIndex((prev) => (prev + 1) % questions.length);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setIsCorrect(null);
  };

  const callNestAI = (prompt: string) => {
    const fullPrompt = `Act as MIT/Harvard/Stanford finance professor. ${prompt}`;
    alert(`Nest AI Professor called:\n\n${fullPrompt}\n\n(Connect to your /api/nest-ai or Bernard here)`);
  };

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
          {allTabs.map((tab) => (
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
            {modules.map((module) => (
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

        {/* ── Engine tabs — delegated to standalone components ── */}
        {activeTab === 'DSCR Engine'    && <DSCREngine />}
        {activeTab === 'Surety Pricing' && <SuretyPricing />}
        {activeTab === 'CDO Builder'    && <CDOBuilder />}
        {activeTab === 'SHAP Suite'     && <SHAPSuite />}
        {activeTab === 'CDS Engine'     && <CDSEngine />}
        {activeTab === 'Shadow Rating'  && <ShadowRating />}
        {activeTab === 'Brex Rebate'    && <BrexRebate />}

      </div>
    </div>
  );
}
