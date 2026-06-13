/** @type {import('next').NextConfig} */
const path = require("path");

// Real service URLs — fallback so the app works even if Vercel env vars aren't set.
// NEXT_PUBLIC_* keys are intentionally public (browser-visible by design).
const RAILWAY_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.RAILWAY_BACKEND_URL ||
  "https://web-production-5e8af.up.railway.app";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://tquotedgiapmivitjipn.supabase.co";

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxdW90ZWRnaWFwbWl2aXRqaXBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5Mzg0ODYsImV4cCI6MjA5NDUxNDQ4Nn0.AalTW8O6ddrNv7R2bP7Qn9b2uQVwonm2jXCjZWD7J_M";

const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  // Bake the resolved values into the client bundle so every NEXT_PUBLIC_* ref works.
  env: {
    NEXT_PUBLIC_API_URL: RAILWAY_URL,
    NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: SUPABASE_ANON_KEY,
  },
  webpack(config) {
    config.resolve.alias["@shared"] = path.resolve(__dirname, "shared");
    return config;
  },
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${RAILWAY_URL}/api/:path*` },
    ];
  },
};
module.exports = nextConfig;