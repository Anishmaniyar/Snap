/** @type {import('next').NextConfig} */
const apiTarget = process.env.API_TARGET || "http://localhost:8000";

const nextConfig = {
  transpilePackages: [],
  experimental: {},
  async rewrites() {
    return [
      { source: "/health", destination: `${apiTarget}/health` },
      { source: "/metrics", destination: `${apiTarget}/metrics` },
      { source: "/api/v1/:path*", destination: `${apiTarget}/api/v1/:path*` },
    ];
  },
};

module.exports = nextConfig;
