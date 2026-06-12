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
    return [
      { source: "/api/:path*", destination: "https://backend-iota-sand-94.vercel.app/api/:path*" }
    ];
  },
};
module.exports = nextConfig;