import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Adicionamos ': any' aqui para calar o erro do TypeScript
  webpack: (config: any) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      stream: false,
    };
    return config;
  },
};

export default nextConfig;