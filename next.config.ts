/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // ✅ This skips ESLint during Vercel build
  },
};

module.exports = nextConfig;
