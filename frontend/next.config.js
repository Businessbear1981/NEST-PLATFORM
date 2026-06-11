/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: "/api/:path*", destination: "https://backend-iota-sand-94.vercel.app/api/:path*" }
    ];
  },
};
module.exports = nextConfig;