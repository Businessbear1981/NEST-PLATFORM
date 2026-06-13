// Supabase Edge Function: cdo-compute
// Handles the Gaussian copula computation (CPU-heavy) server-side
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function normalCDF(x: number): number {
  const a1=0.254829592,a2=-0.284496736,a3=1.421413741,a4=-1.453152027,a5=1.061405429,p=0.3275911;
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x)/Math.sqrt(2);
  const t=1/(1+p*x);
  const y=1-((((a5*t+a4)*t+a3)*t+a2)*t+a1)*t*Math.exp(-x*x);
  return 0.5*(1+sign*y);
}

function normalPDF(x: number): number { return Math.exp(-0.5*x*x)/Math.sqrt(2*Math.PI); }

function normalInv(p: number): number {
  const c=[0,-3.969683028665376e+01,2.209460984245205e+02,-2.759285104469687e+02,1.383577518672690e+02,-3.066479806614716e+01,2.506628277459239e+00];
  const b=[0,-5.447609879822406e+01,1.615858368580409e+02,-1.556989798598866e+02,6.680131188771972e+01,-1.328068155288572e+01];
  const cc=[0,-7.784894002430293e-03,-3.223964580411365e-01,-2.400758277161838e+00,-2.549732539343734e+00,4.374664141464968e+00,2.938163982698783e+00];
  const d=[0,7.784695709041462e-03,3.224671290700398e-01,2.445134137142996e+00,3.754408661907416e+00];
  const pL=0.02425,pH=1-pL;
  if(p<pL){const q=Math.sqrt(-2*Math.log(p));return(((((cc[1]*q+cc[2])*q+cc[3])*q+cc[4])*q+cc[5])*q+cc[6])/((((d[1]*q+d[2])*q+d[3])*q+d[4])*q+1);}
  if(p<=pH){const q=p-0.5,r=q*q;return(((((c[1]*r+c[2])*r+c[3])*r+c[4])*r+c[5])*r+c[6])*q/(((((b[1]*r+b[2])*r+b[3])*r+b[4])*r+b[5])*r+1);}
  const q=Math.sqrt(-2*Math.log(1-p));return-(((((cc[1]*q+cc[2])*q+cc[3])*q+cc[4])*q+cc[5])*q+cc[6])/((((d[1]*q+d[2])*q+d[3])*q+d[4])*q+1);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { pool } = await req.json();
    const { tranches, avgSpread, avgRecovery, defaultCorrelation } = pool;
    const lgd = 1 - avgRecovery;
    const avgPD = avgSpread / 10000 / lgd;

    const results = tranches.map((t: any) => {
      let trancheEL = 0;
      const steps = 500; // more steps in edge function
      for (let i = 0; i < steps; i++) {
        const z = -4 + (8 * i) / steps;
        const condPD = normalCDF((normalInv(avgPD) - Math.sqrt(defaultCorrelation) * z) / Math.sqrt(1 - defaultCorrelation));
        const condLoss = condPD * lgd;
        const trancheLoss = Math.max(0, Math.min(condLoss, t.detachmentPct) - t.attachmentPct);
        const thickness = t.detachmentPct - t.attachmentPct;
        trancheEL += (trancheLoss / thickness) * normalPDF(z) * (8 / steps);
      }
      return { name: t.name, expectedLoss: trancheEL, expectedLossUSD: trancheEL * t.notional };
    });

    return new Response(JSON.stringify({ results, poolEL: avgPD * lgd }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
