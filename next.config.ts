import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: false, // 彻底关闭 Turbopack
  },
};

export default nextConfig;
