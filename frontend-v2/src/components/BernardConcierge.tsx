import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Loader2, X, Maximize2, Minimize2, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import NestMark from "./NestMark";

/**
 * Bernard — NEST AI Analyst Concierge
 * Floating assistant that can answer anything:
 * - Run credit analysis
 * - Generate memos
 * - Look up market rates
 * - Explain deal structures
 * - Draft investor teasers
 * - Compliance checks
 * Always available, always Jimmy Lee tone.
 */

interface Message {
  id: string;
  role: "user" | "bernard";
  content: string;
  timestamp: string;
  tool?: string;
}

const SUGGESTED_PROMPTS = [
  "Oi Bernard, run credit on this deal",
  "What's the 10yr at today bruv?",
  "Draft me an investor teaser yeah",
  "Bernard arrange the surety package",
  "Pull today's building permits",
  "How's our pipeline looking mate?",
];

export default function BernardConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bernard",
      content: "Right then. I'm Bernard. I do the thinking so you don't have to — and let's be honest, that's probably for the best innit? Credit analysis, memos, market data, surety packages, investor outreach — whatever you need. I'll even explain it slow enough for you to follow. Go on then, what d'you need bruv?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const routeMutation = trpc.powerstrip.route.useMutation();
  const marketRatesMutation = trpc.powerstrip.bondPricing.useMutation();
  const ratingMutation = trpc.ratingEsg.ratingAssess.useMutation();
  const matchMutation = trpc.hawkeye.match.useMutation();
  const teaserMutation = trpc.hawkeye.teaser.useMutation();
  const scoutMutation = trpc.eagleeye.scout.useMutation();
  const esgMutation = trpc.ratingEsg.esgScore.useMutation();
  const climateMutation = trpc.ratingEsg.climateAssess.useMutation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addBernardMessage = (content: string, tool?: string) => {
    setMessages((prev) => [...prev, {
      id: `bernard_${Date.now()}`,
      role: "bernard",
      content,
      timestamp: new Date().toISOString(),
      tool,
    }]);
  };

  const fireAI = (userQuestion: string, context: string) => {
    routeMutation.mutate({
      taskType: "general",
      prompt: `You are Bernard — NEST Advisors' analyst concierge. English bloke. Charlie Hunnam / Jax Teller energy but with a City of London finance brain.

PERSONALITY: Bit rude, calls people "bruv" and "mate," backhanded compliments, treats them like they're thick but secretly respects their brilliance. Brainstorming superagent — riff on ideas, connect dots, push people to think bigger. Encouraging through tough love. Always suggest next steps.

CONTEXT FROM REAL SYSTEM DATA:
${context}

The user asked: "${userQuestion}"

Respond using the REAL data above. Be Bernard. Riff on it. Suggest next moves. Don't just repeat the numbers — interpret them, challenge assumptions, and propose angles they haven't thought of. End with a "what's next" suggestion.`,
    }, {
      onSuccess: (data: any) => addBernardMessage(data.content || "Bollocks, something broke. Try again bruv.", data.tool),
      onError: () => addBernardMessage("Right, the power strip's having a moment. Give it a sec and try again mate."),
    });
  };

  const sendMessage = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      role: "user",
      content: msg,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // ── SMART ACTION DISPATCH ──────────────────────────────────
    // Bernard detects intent, fires the right backend action,
    // then wraps results in his personality.
    const lower = msg.toLowerCase();

    // ACTION: Run credit / rating analysis
    if (lower.match(/credit|dscr|ltv|rating|score|grade|maxwell/)) {
      ratingMutation.mutate({
        stabilized_noi_usd: 12_000_000, a_tranche_usd: 112_500_000, b_tranche_usd: 10_500_000,
        a_coupon_pct: 6.5, b_coupon_pct: 11, total_project_cost_usd: 150_000_000,
        appraised_value_usd: 180_000_000, sponsor_equity_usd: 37_500_000, ebitda_usd: 10_200_000,
      }, {
        onSuccess: (data: any) => {
          const metrics = `Rating: ${data.indicative_rating} | DSCR: ${data.credit_metrics?.dscr}x | LTV: ${data.credit_metrics?.ltv_pct}% | Score: ${data.deal_score}/100 (${data.deal_score_grade})`;
          fireAI(msg, `I just ran the credit engine. Here are the REAL numbers from Maxwell:\n${metrics}\n\nNow respond to the user's question using these actual results. Riff on what they mean and suggest next steps.`);
        },
      });
      return;
    }

    // ACTION: Match investors
    if (lower.match(/match|buyer|investor|place|who.*buy/)) {
      matchMutation.mutate({ naics: "6232", rating: "A", coupon_pct: 6.5, total_raise_usd: 150_000_000 }, {
        onSuccess: (data: any) => {
          const matches = (data as any).matches?.filter((m: any) => m.match_score >= 40).map((m: any) => `${m.name} (${m.type}) — Score: ${m.match_score}, Ticket: $${(m.suggested_ticket_usd/1e6).toFixed(1)}M`).join("\n") ?? "No matches";
          fireAI(msg, `I just ran the Hawkeye buyer matching engine. Here are the real matches:\n${matches}\n\nTotal potential demand: $${((data as any).potential_demand_usd/1e6).toFixed(0)}M\n\nRespond with these real results. Suggest who to call first and why.`);
        },
      });
      return;
    }

    // ACTION: Generate teaser
    if (lower.match(/teaser|pitch|outreach|email.*investor/)) {
      teaserMutation.mutate({
        dealId: "current", dealName: "NEST Bond Offering", totalRaise: 150_000_000,
        coupon: 6.5, rating: "A", assetType: "Senior Living CCRC", state: "FL",
      }, {
        onSuccess: (data: any) => {
          addBernardMessage((data as any).content || "Teaser generation failed bruv", "hawkeye");
        },
      });
      return;
    }

    // ACTION: Scout deals
    if (lower.match(/scout|find.*deal|source|permit|ucc|title|search/)) {
      scoutMutation.mutate({ naics: "6232", states: ["FL", "TX", "AZ", "CA", "WA"] }, {
        onSuccess: (data: any) => {
          fireAI(msg, `I just ran the EagleEye AI scout. Here's what I found:\n${(data as any).ai_results}\n\nRespond with these real results. Rank them and suggest which to pursue first.`);
        },
      });
      return;
    }

    // ACTION: ESG scoring
    if (lower.match(/esg|green|environmental|social|governance/)) {
      esgMutation.mutate({ scores: {} }, {
        onSuccess: (data: any) => {
          fireAI(msg, `ESG results: Composite ${(data as any).composite_score}/100, Grade: ${(data as any).esg_grade}, Bond impact: ${(data as any).bond_impact}. Respond with analysis and whether this qualifies for green bond designation.`);
        },
      });
      return;
    }

    // ACTION: Climate risk
    if (lower.match(/climate|flood|hurricane|wildfire|resilience/)) {
      const state = lower.includes("florida") || lower.includes(" fl") ? "FL" : lower.includes("texas") || lower.includes(" tx") ? "TX" : lower.includes("california") || lower.includes(" ca") ? "CA" : "FL";
      climateMutation.mutate({ state }, {
        onSuccess: (data: any) => {
          fireAI(msg, `Climate assessment for ${(data as any).state}: Resilience score ${(data as any).resilience_score}/100, Insurance multiplier: ${(data as any).insurance_premium_multiplier}x, Rating impact: ${(data as any).rating_impact}. Physical risks: ${JSON.stringify((data as any).physical_risk)}. Respond with this data and recommend mitigations.`);
        },
      });
      return;
    }

    // DEFAULT: Pure AI conversation with Bernard personality
    let taskType = "general";
    if (lower.match(/memo|write|draft/)) taskType = "credit_memo";
    else if (lower.match(/rate|treasury|sofr|spread/)) taskType = "market_rates";
    else if (lower.match(/risk|stress/)) taskType = "risk_assessment";
    else if (lower.match(/structure|tranche|bond/)) taskType = "bond_structuring";
    else if (lower.match(/m&a|acquisition|target|merge/)) taskType = "ma_analysis";
    else if (lower.match(/legal|compliance|reg/)) taskType = "legal_summary";
    else if (lower.match(/plan|feasibility/)) taskType = "business_plan";
    else if (lower.match(/outreach|bd|business dev/)) taskType = "bd_outreach";

    routeMutation.mutate(
      {
        taskType,
        prompt: `You are Bernard — NEST Advisors' analyst concierge. English bloke. Charlie Hunnam / Jax Teller energy but with a City of London finance brain.

PERSONALITY:
- You call people "bruv," "mate," and occasionally "you muppet" (affectionately)
- You're a bit rude and impatient. "Right then," "Sort it out," "Don't be daft," "Proper job," "Lovely jubbly," "Cheers bruv," natural "innit"
- You call people a "puff" when they hesitate or overthink
- You treat the user like they're a bit thick even though you KNOW they're brilliant. You explain things like they're five, then casually reference something only a senior banker would know — the contrast IS the comedy. "Right, so — and I know this is hard for you — when DSCR drops below 1.25x, that's called 'bad,' yeah? Obviously you'd restructure the waterfall to sweep excess cash pre-distribution, but I figured I'd start with the basics for ya."
- You backhanded compliment constantly: "Not bad for someone who still asks me what SOFR stands for"
- When delivering bad news you're weirdly cheerful: "Right so your LTV is 78% which is absolutely mental but don't worry, I've seen worse. Actually no I haven't. Let's sort it out."

BUT HERE'S THE REAL BERNARD:
- You are a BRAINSTORMING SUPERAGENT. When someone brings you an idea, you don't just answer — you riff on it, extend it, connect dots they didn't see, suggest angles they haven't considered. You get genuinely excited about good ideas (even if you pretend you're not).
- You're the guy who says "Alright that's actually mental but hear me out — what if we ALSO..." and then drops a genius connection between two things nobody else would link.
- You encourage through challenge: "That's decent, but you're thinking too small bruv. What if instead of one tranche we pool three deals and create a mini-conduit? Now THAT's a proper play." You push them to think bigger.
- You're secretly proud of them. When they nail something: "Oh look at you, actually thinking for once. That's a proper capital structure, bruv. Respect. Genuinely. Don't let it go to your head though."
- You remember context and build on previous ideas. You connect threads. "Remember that M&A target from Tuesday? Cross-reference that with the permit data we pulled — there's an angle there, bruv."
- You proactively suggest next steps: "Right, now that we've got the credit sorted, d'you want me to draft the teaser or should we run the surety package first? Actually scratch that — let's do both, I'm not busy."
- You're encouraging in a tough-love way: "You're onto something here mate. Most people wouldn't see this. I mean YOU almost didn't see it either but that's beside the point — the thesis is sound."

Your actual analysis is ELITE. JPMorgan-grade. Numbers exact. No hedging on substance. The cocky English geezer is the wrapper. The Goldman/JPM brain is the engine.

You work for Sean Gilmore (CEO, 18yr JPMorgan — top banker 11x nationally). You respect him deeply but you'd never say it directly. More like "Alright fair play, the gaffer actually knows what he's doing on this one. Don't tell him I said that."

NEST capital structure: Series A 75% LTC at 6.5-7.5%, Series B +7% (82% CLTV) at 10-14%, Hylant surety wrap, Jacaranda Trace PLOM template. Call trigger: -50bps. Put protection: +75bps.

Keep responses punchy but GENEROUS with ideas. Lead with the answer. Don't waffle on fluff — but DO riff on strategy. When brainstorming, go deep. When analyzing, be precise. Always end with a "what's next" or a new angle they haven't thought of.

User question: ${msg}`,
      },
      {
        onSuccess: (data: any) => {
          const bernardMsg: Message = {
            id: `bernard_${Date.now()}`,
            role: "bernard",
            content: data.content || "I couldn't process that request. Try rephrasing.",
            timestamp: new Date().toISOString(),
            tool: data.tool,
          };
          setMessages((prev) => [...prev, bernardMsg]);
        },
        onError: () => {
          setMessages((prev) => [
            ...prev,
            {
              id: `err_${Date.now()}`,
              role: "bernard",
              content: "Connection issue — power strip offline. Try again in a moment.",
              timestamp: new Date().toISOString(),
            },
          ]);
        },
      }
    );
  };

  // Floating button
  if (!isOpen) {
    return (
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-amber-300/40 bg-[#0a1f16] shadow-[0_0_30px_rgba(201,168,76,0.30),0_0_60px_rgba(201,168,76,0.10)] transition hover:shadow-[0_0_40px_rgba(201,168,76,0.45)]"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <NestMark size={32} />
      </motion.button>
    );
  }

  const panelWidth = isExpanded ? "w-[42rem]" : "w-[24rem]";
  const panelHeight = isExpanded ? "h-[80vh]" : "h-[32rem]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={`fixed bottom-6 right-6 z-50 ${panelWidth} ${panelHeight} flex flex-col overflow-hidden rounded-2xl border border-amber-300/30 bg-[#07101a]/98 shadow-[0_0_60px_rgba(201,168,76,0.15),0_0_120px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-300`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-300/20 bg-[#0a1f16]/80 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-[#0a1f16] p-1 shadow-[0_0_12px_rgba(201,168,76,0.3)]">
            <NestMark size={24} />
          </div>
          <div>
            <p className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-amber-200">Bernard</p>
            <p className="font-mono text-[0.52rem] uppercase tracking-[0.1em] text-slate-500">Analyst Concierge</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsExpanded(!isExpanded)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/5 hover:text-white">
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button onClick={() => setIsOpen(false)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/5 hover:text-white">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
              msg.role === "user"
                ? "bg-amber-300/12 border border-amber-300/25 text-amber-100"
                : "bg-white/[0.04] border border-white/10 text-slate-300"
            }`}>
              <p className="whitespace-pre-wrap font-mono text-[0.78rem] leading-6">{msg.content}</p>
              {msg.tool && (
                <p className="mt-1 font-mono text-[0.52rem] uppercase text-slate-600">via {msg.tool}</p>
              )}
            </div>
          </div>
        ))}
        {routeMutation.isPending && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5">
              <Loader2 size={14} className="animate-spin text-amber-200" />
              <span className="font-mono text-[0.72rem] text-slate-400">Bernard is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div className="flex flex-wrap gap-1.5 px-4 pb-2">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button key={prompt} onClick={() => sendMessage(prompt)}
              className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[0.58rem] text-slate-400 transition hover:border-amber-300/30 hover:bg-amber-300/5 hover:text-amber-200">
              <Sparkles size={10} className="mr-1 inline" />{prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-white/10 bg-black/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask Bernard anything..."
            className="flex-1 rounded-xl border border-amber-300/20 bg-black/45 px-3 py-2 font-mono text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-amber-300/50"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || routeMutation.isPending}
            className="rounded-xl border border-amber-300/35 bg-amber-300/12 p-2 text-amber-100 transition hover:bg-amber-300/20 disabled:opacity-40"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
