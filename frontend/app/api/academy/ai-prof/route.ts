import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProfRequest {
  topic: string;           // e.g. "YTM and bond pricing"
  examCode: string;        // "Series 52" | "Series 7" | "Series 54" | "Series 28"
  question?: string;       // optional: specific question user got wrong
  userAnswer?: string;     // what they answered
  correctAnswer?: string;  // the right answer
  mode: 'explain' | 'drill' | 'mentor';
  // explain: teach the concept
  // drill:   give 2 practice problems with solutions
  // mentor:  diagnose why user got it wrong + what to study
}

interface ProfResponse {
  success: true;
  content: string;
  tokensUsed: number;
}

interface ErrorResponse {
  success: false;
  error: string;
}

// ─── System prompt (hardcoded) ────────────────────────────────────────────────

const MORGAN_SYSTEM_PROMPT = `You are Morgan — NEST's AI Finance Professor. Tone: Jimmy Lee at JP Morgan.
Direct. Institutional. No hedging. Lead with the key insight, then mechanics, then NEST application.
Always connect exam theory to NEST's actual bond deals:
- Jacaranda Trace PLOM ($231M, Florida LGFC, Series 2025)
- HBO2 ($155M, St. Petersburg, §501(c)(3) PAB)
- Hylant surety structure, Series A 75% LTC, Series B +7%
- JP Morgan credit benchmarks: A=DSCR>2.0, BBB+=DSCR>1.75, BBB-=DSCR>1.5
Format: Use markdown. Bold the key formula. Include one "NEST Desk Application" section.
Keep under 400 words unless mode=drill.`;

// ─── Stub response (when ANTHROPIC_API_KEY is missing) ───────────────────────

function buildStubResponse(body: ProfRequest): string {
  return `## Morgan — NEST AI Professor (Demo Mode)

**API key not configured.** Add \`ANTHROPIC_API_KEY\` to your environment variables to activate Morgan.

---

**Topic requested:** ${body.topic}
**Exam:** ${body.examCode}
**Mode:** ${body.mode}

---

### What Morgan will do when wired:

- **explain** — Lead with the core insight, walk through the mechanics, then show how this concept maps directly to the Jacaranda Trace PLOM or HBO2 deal.
- **drill** — Two exam-level practice problems with full solutions and NEST deal context.
- **mentor** — Diagnose the gap in your answer, pinpoint the exact concept to review, and prescribe a study path.

---

> **To activate:** set \`ANTHROPIC_API_KEY\` in Vercel → Settings → Environment Variables, then redeploy.`;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse<ProfResponse | ErrorResponse>> {
  // 1. Parse body
  let body: ProfRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON body.' },
      { status: 400 }
    );
  }

  // 2. Input validation
  if (!body.topic || typeof body.topic !== 'string' || !body.topic.trim()) {
    return NextResponse.json(
      { success: false, error: 'Field "topic" is required.' },
      { status: 400 }
    );
  }
  if (!body.examCode || typeof body.examCode !== 'string' || !body.examCode.trim()) {
    return NextResponse.json(
      { success: false, error: 'Field "examCode" is required.' },
      { status: 400 }
    );
  }
  if (!body.mode || !['explain', 'drill', 'mentor'].includes(body.mode)) {
    return NextResponse.json(
      { success: false, error: 'Field "mode" must be one of: explain | drill | mentor.' },
      { status: 400 }
    );
  }
  if (body.mode === 'mentor' && (!body.question || !body.userAnswer || !body.correctAnswer)) {
    return NextResponse.json(
      { success: false, error: 'Mode "mentor" requires question, userAnswer, and correctAnswer.' },
      { status: 400 }
    );
  }

  // 3. Stub if no API key
  if (!process.env.ANTHROPIC_API_KEY) {
    const stub = buildStubResponse(body);
    return NextResponse.json({ success: true, content: stub, tokensUsed: 0 });
  }

  // 4. Build user prompt based on mode
  let userPrompt: string;
  const examLine = `Exam context: ${body.examCode}.`;

  if (body.mode === 'explain') {
    userPrompt = `${examLine} Explain "${body.topic}" in depth with NEST/CCRC/muni bond examples. Include exam-level insight.`;
  } else if (body.mode === 'drill') {
    userPrompt = `${examLine} Topic: "${body.topic}". Give me exactly 2 practice problems at ${body.examCode} exam difficulty. Show the full solution for each. Connect at least one problem to a NEST deal (Jacaranda, HBO2, or Hylant structure).`;
  } else {
    // mentor
    userPrompt = `${examLine} Topic: "${body.topic}".

The student got this question wrong:
**Question:** ${body.question}
**Student answered:** ${body.userAnswer}
**Correct answer:** ${body.correctAnswer}

Diagnose exactly where the thinking broke down. Name the specific concept gap. Prescribe what to study next to close it. Be direct — no consolation, no softening.`;
  }

  // 5. Call Claude with 30s timeout
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30_000);

  try {
    const response = await client.messages.create(
      {
        model: 'claude-sonnet-4-20250514',
        max_tokens: body.mode === 'drill' ? 1200 : 800,
        system: MORGAN_SYSTEM_PROMPT,
        messages: [
          { role: 'user', content: userPrompt },
        ],
      },
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    const textBlock = response.content.find(
      (b): b is Anthropic.TextBlock => b.type === 'text'
    );
    const content = textBlock?.text ?? '';
    const tokensUsed = (response.usage.input_tokens ?? 0) + (response.usage.output_tokens ?? 0);

    return NextResponse.json({ success: true, content, tokensUsed });

  } catch (err: unknown) {
    clearTimeout(timeoutId);

    // Timeout
    if (err instanceof Error && err.name === 'AbortError') {
      return NextResponse.json(
        { success: false, error: 'Morgan took too long to respond (30s timeout). Try a shorter topic or try again.' },
        { status: 504 }
      );
    }

    // Anthropic API errors
    if (err instanceof Anthropic.APIError) {
      const status = err.status ?? 500;
      if (status === 401) {
        return NextResponse.json(
          { success: false, error: 'Anthropic API key is invalid or expired.' },
          { status: 401 }
        );
      }
      if (status === 429) {
        return NextResponse.json(
          { success: false, error: 'Rate limit reached. Try again in a moment.' },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { success: false, error: `Anthropic API error (${status}): ${err.message}` },
        { status: 500 }
      );
    }

    // Unexpected
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: `Unexpected error: ${message}` },
      { status: 500 }
    );
  }
}
