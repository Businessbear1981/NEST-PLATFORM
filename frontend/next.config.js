/** @type {import('next').NextConfig} */
const path = require("path");
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  webpack(config) {
    config.resolve.alias["@shared"] = path.resolve(__dirname, "shared");
    return config;
  },
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL ||
      process.env.RAILWAY_BACKEND_URL ||
      "https://web-production-5e8af.up.railway.app";
    return [
      { source: "/api/:path*", destination: `${backendUrl}/api/:path*` }
    ];
  },
};
module.exports = nextConfig;