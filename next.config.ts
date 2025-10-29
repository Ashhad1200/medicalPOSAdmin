import type { NextConfig } from "next";
import * as dotenv from "dotenv";
import * as path from "path";

// Explicitly load environment variables
dotenv.config({
  path: path.resolve(process.cwd(), ".env.local"),
});

// Simple environment validation
const requiredEnvVars = [
  'NEXT_PUBLIC_BACKEND_URL',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`⚠️  Missing environment variable: ${envVar}`);
  }
}

const nextConfig: NextConfig = {
  // Explicitly define environment variables
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // Webpack and Turbopack configuration
  webpack: (config) => {
    // Resolve aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      "@/": path.resolve(__dirname, "./src"),
      "@config/": path.resolve(__dirname, "./src/config"),
      "@components/": path.resolve(__dirname, "./src/components"),
      "@hooks/": path.resolve(__dirname, "./src/hooks"),
      "@services/": path.resolve(__dirname, "./src/services"),
    };

    return config;
  },

  // Image optimization
  images: {
    domains: ["localhost", "vercel.com"],
  },

  // Suppress specific warnings
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 5,
  },

  // Enable SWC minification
  swcMinify: true,

  // React strict mode for development
  reactStrictMode: true,

  // Generate ETags for caching
  generateEtags: true,

  // Enable TypeScript strict mode
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },

  // ESLint during build
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
