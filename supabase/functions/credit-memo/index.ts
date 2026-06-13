// Supabase Edge Function: credit-memo
// Deploy with: npx supabase functions deploy credit-memo
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { dealName, metrics } = await req.json();
    const claudeKey = Deno.env.get("ANTHROPIC_API_KEY");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": claudeKey!, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        system: "You are Morgan, NEST institutional AI. Credit memo writer. JPMorgan voice.",
        messages: [{ role: "user", content: `Write 3-paragraph credit memo for ${dealName}. Metrics: ${JSON.stringify(metrics)}` }],
      }),
    });

    const data = await response.json();
    return new Response(JSON.stringify({ memo: data.content[0].text }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
