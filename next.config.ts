import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Pastikan paket client-only di-transpile dengan benar di Vercel
  transpilePackages: ["jspdf", "html2canvas", "react-confetti"],
};

export default nextConfig;
