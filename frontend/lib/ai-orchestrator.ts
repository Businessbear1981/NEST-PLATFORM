// lib/ai-orchestrator.ts
"use server";  // This is a Next.js server action file

export type AIProvider = "claude" | "grok" | "openai";

export interface OrchestratorRequest {
  prompt: string;
  systemPrompt?: string;
  provider?: AIProvider;  // default: auto-select based on task type
  taskType: "credit_memo" | "deal_summary" | "risk_analysis" | "market_intel" | "general";
  maxTokens?: number;
  temperature?: number;
}

export interface OrchestratorResponse {
  content: string;
  provider: AIProvider;
  model: string;
  tokensUsed: number;
  latencyMs: number;
  fallbackUsed: boolean;
}

// Provider routing: credit memos and risk analysis → Claude (best at structured finance reasoning)
// Market intel and general → Grok (real-time web access)
// Fallback chain: Claude → Grok → mock response
const TASK_ROUTING: Record<OrchestratorRequest["taskType"], AIProvider> = {
  credit_memo: "claude",
  risk_analysis: "claude",
  deal_summary: "claude",
  market_intel: "grok",
  general: "claude",
};

async function callClaude(req: OrchestratorRequest): Promise<OrchestratorResponse> {
  const start = Date.now();
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: req.maxTokens || 2000,
      system: req.systemPrompt || "You are Morgan, NEST's institutional AI. Respond with the precision of a JPMorgan managing director. Lead with conclusions. Numbers are authority. No hedging.",
      messages: [{ role: "user", content: req.prompt }],
    }),
  });
  if (!response.ok) throw new Error(`Claude API error: ${response.status}`);
  const data = await response.json();
  return { content: data.content[0].text, provider: "claude", model: "claude-sonnet-4-20250514", tokensUsed: data.usage.output_tokens, latencyMs: Date.now() - start, fallbackUsed: false };
}

async function callGrok(req: OrchestratorRequest): Promise<OrchestratorResponse> {
  const start = Date.now();
  const apiKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY;
  if (!apiKey) throw new Error("GROK_API_KEY not set");

  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "grok-3-latest",
      messages: [
        { role: "system", content: req.systemPrompt || "You are a NEST capital markets intelligence agent with real-time market access." },
        { role: "user", content: req.prompt },
      ],
      max_tokens: req.maxTokens || 2000,
    }),
  });
  if (!response.ok) throw new Error(`Grok API error: ${response.status}`);
  const data = await response.json();
  return { content: data.choices[0].message.content, provider: "grok", model: "grok-3-latest", tokensUsed: data.usage.completion_tokens, latencyMs: Date.now() - start, fallbackUsed: false };
}

export async function orchestrate(req: OrchestratorRequest): Promise<OrchestratorResponse> {
  const primaryProvider = req.provider || TASK_ROUTING[req.taskType];

  // Try primary provider
  try {
    if (primaryProvider === "claude") return await callClaude(req);
    if (primaryProvider === "grok") return await callGrok(req);
  } catch (e) {
    console.warn(`Primary provider ${primaryProvider} failed:`, e);
  }

  // Fallback chain
  const fallbackProvider = primaryProvider === "claude" ? "grok" : "claude";
  try {
    const result = primaryProvider === "claude"
      ? await callGrok(req)
      : await callClaude(req);
    return { ...result, fallbackUsed: true };
  } catch (e) {
    console.warn(`Fallback provider ${fallbackProvider} also failed:`, e);
  }

  // Final mock fallback — never breaks the UI
  return {
    content: `[NEST AI — ${req.taskType}] Analysis pending. Both AI providers temporarily unavailable. Cached analysis: ${req.prompt.slice(0, 100)}...`,
    provider: primaryProvider,
    model: "fallback",
    tokensUsed: 0,
    latencyMs: 0,
    fallbackUsed: true,
  };
}

// Convenience wrappers
export async function generateCreditMemo(dealName: string, metrics: Record<string, number>): Promise<string> {
  const metricsStr = Object.entries(metrics).map(([k, v]) => `${k}: ${v}`).join(", ");
  const result = await orchestrate({
    taskType: "credit_memo",
    prompt: `Generate a 3-paragraph institutional credit memo for ${dealName}. Metrics: ${metricsStr}. Reference Jacaranda Trace PLOM as structural template. Jimmy Lee voice — direct, no hedging.`,
  });
  return result.content;
}

export async function analyzeRisk(dealName: string, stressResults: Array<{ scenario: string; dscr: number; pass: boolean }>): Promise<string> {
  const scenarios = stressResults.map(s => `${s.scenario}: DSCR ${s.dscr.toFixed(2)} (${s.pass ? "PASS" : "FAIL"})`).join("; ");
  const result = await orchestrate({
    taskType: "risk_analysis",
    prompt: `Risk analysis for ${dealName}. Stress test results: ${scenarios}. Identify the two most critical risks and recommend mitigants. Be specific about structuring solutions.`,
  });
  return result.content;
}
