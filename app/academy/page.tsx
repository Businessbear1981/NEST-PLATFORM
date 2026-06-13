'use client';

import React, { useState } from 'react';
import { Trophy, Play, BookOpen, Bot, Volume2, Youtube, Award, Target, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function NestAcademy() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentModuleId, setCurrentModuleId] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [xpTotal, setXpTotal] = useState(2450);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

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
          text: 'Professor-Level: General Obligation (GO) bonds are backed by the issuer\'s full taxing power and faith/credit. Revenue bonds rely on specific project revenues (e.g., tolls, utilities). In your Nest workflows, Revenue bonds are common for P3/infrastructure and require strong DSCR stress testing and surety enhancement for 100% placement.',
          audioUrl: 'https://example.com/audio/chunk1.mp3' // Replace with ElevenLabs or R2
        },
        {
          id: 2,
          title: '10-min Chunk 2: TEFRA Compliance',
          text: 'TEFRA (Tax Equity and Fiscal Responsibility Act) mandates public approval processes for certain tax-exempt private activity bonds. Critical for your non-cash secured deals to maintain tax status when partnering with bond desks like JP Morgan.',
          audioUrl: 'https://example.com/audio/chunk2.mp3'
        }
      ]
    },
    {
      id: 'm2',
      title: 'Debt Securities & Suitability',
      exam: 'Series 7',
      progress: 65,
      xp: 1320,
      badge: 'BondPro',
      chunks: [ /* more */ ]
    }
  ];

  const questions = [
    {
      id: 1,
      question: 'What backs General Obligation municipal bonds?',
      options: ['Full faith, credit and taxing power of issuer', 'Project revenues only', 'Federal government guarantee', 'Private equity'],
      correct: 0,
      explanation: 'GO bonds pledge full taxing authority - key for credit enhancement in Nest platform.',
      aiPrompt: 'Stanford professor: Explain GO bonds with real Nest/Ardan Edge project finance examples, TEFRA, surety integration.'
    },
    // Add 20+ more real exam-style questions here
    {
      id: 2,
      question: 'TEFRA primarily applies to which type of bonds?',
      options: ['Taxable bonds', 'Private activity tax-exempt bonds', 'GO bonds only', 'Corporate bonds'],
      correct: 1,
      explanation: 'TEFRA public approval for PABs - essential for your conduit bond packaging.',
      aiPrompt: 'Harvard level deep dive on TEFRA exceptions and Nest module implementation.'
    }
  ];

  const currentModule = modules.find(m => m.id === currentModuleId);
  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswer = (index) => {
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

  const callNestAI = (prompt) => {
    // Real integration point - replace alert with fetch to your API
    const fullPrompt = `Act as MIT/Harvard/Stanford finance professor. ${prompt}`;
    alert(`Nest AI Professor called:\n\n${fullPrompt}\n\n(Connect to your /api/nest-ai or Bernard here)`);
    // fetch('/api/nest-ai', { method: 'POST', body: JSON.stringify({prompt: fullPrompt}) });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Award className="w-10 h-10 text-amber-400" /> NEST ACADEMY
          </h1>
          <div className="flex items-center gap-4">
            <div className="bg-zinc-900 px-4 py-2 rounded-full flex items-center gap-2">
              <Trophy className="text-amber-400" /> {xpTotal} XP
            </div>
            <div className="bg-zinc-900 px-4 py-2 rounded-full">Streak: {streak} 🔥</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-zinc-800">
          {['dashboard', 'modules', 'quiz', 'midterm'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-t-lg font-medium ${activeTab === tab ? 'bg-zinc-800 border-b-2 border-amber-400' : 'text-zinc-400'}`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {modules.map(module => (
              <div key={module.id} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 hover:border-amber-400 cursor-pointer" onClick={() => { setCurrentModuleId(module.id); setActiveTab('modules'); }}>
                <h3 className="text-xl font-semibold mb-2">{module.title}</h3>
                <div className="text-sm text-zinc-400 mb-4">{module.exam}</div>
                <div className="w-full bg-zinc-800 h-2 rounded-full mb-4">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{width: `${module.progress}%`}}></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{module.progress}% Complete</span>
                  <span className="text-amber-400">{module.xp} XP</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'modules' && currentModule && (
          <div>
            <h2 className="text-3xl font-bold mb-6">{currentModule.title}</h2>
            <div className="space-y-8">
              {currentModule.chunks.map((chunk, idx) => (
                <div key={idx} className="bg-zinc-900 p-8 rounded-3xl">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-2xl font-semibold flex items-center gap-3">
                      <Clock className="w-6 h-6" /> {chunk.title}
                    </h3>
                    <button onClick={() => window.open(chunk.audioUrl, '_blank')} className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-5 py-2 rounded-full">
                      <Volume2 /> Play 10-min Audiobook
                    </button>
                  </div>
                  <div className="prose prose-invert max-w-none text-lg leading-relaxed">
                    {chunk.text}
                  </div>
                  <button onClick={() => callNestAI(`Explain ${chunk.title} in more depth with Nest examples`)} className="mt-6 flex items-center gap-2 bg-amber-600 hover:bg-amber-500 px-6 py-3 rounded-xl">
                    <Bot /> Ask Nest AI Professor
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'quiz' && (
          <div className="max-w-3xl mx-auto bg-zinc-900 p-10 rounded-3xl">
            <div className="flex justify-between mb-8">
              <div>Question {currentQuestionIndex + 1} / {questions.length}</div>
              <div className="text-emerald-400">Score: {score}</div>
            </div>

            <h3 className="text-2xl font-medium mb-8 leading-tight">{currentQuestion.question}</h3>

            <div className="space-y-4 mb-10">
              {currentQuestion.options.map((option, index) => (
                <button key={index}
                  onClick={() => handleAnswer(index)}
                  className={`w-full text-left p-6 rounded-2xl border text-lg transition-all ${selectedAnswer === index ? (isCorrect ? 'border-emerald-500 bg-emerald-950' : 'border-red-500 bg-red-950') : 'border-zinc-700 hover:border-zinc-500'}`}>
                  {option}
                </button>
              ))}
            </div>

            {showExplanation && (
              <div className="bg-zinc-800 p-8 rounded-2xl mb-8">
                <p className="text-lg mb-6">{currentQuestion.explanation}</p>
                <button onClick={() => callNestAI(currentQuestion.aiPrompt)} className="flex items-center gap-3 bg-violet-600 hover:bg-violet-500 px-8 py-4 rounded-2xl text-lg">
                  <Bot className="w-6 h-6" /> Deep Stanford Professor Explanation + Nest Examples
                </button>
                <a href={currentQuestion.youtubeLinks ? currentQuestion.youtubeLinks[0] : '#'} target="_blank" className="mt-4 inline-flex items-center gap-2 text-blue-400 hover:text-blue-300">
                  <Youtube /> Watch Worked Problem Video
                </a>
              </div>
            )}

            <button onClick={nextQuestion} className="w-full py-4 bg-white text-black font-semibold rounded-2xl text-lg">Next Question →</button>
          </div>
        )}

        {/* Similar structure for Midterm Boss Battle */}
      </div>
    </div>
  );
}
