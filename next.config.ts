import type { NextConfig } from "next";
import * as dotenv from "dotenv";
import * as path from "path";
import { validateEnvironment } from "./src/lib/env-validator";

// Explicitly load environment variables
dotenv.config({
  path: path.resolve(process.cwd(), ".env.local"),
});

// Validate environment variables early
try {
  validateEnvironment(process.env);
} catch (error) {
  console.error("❌ Environment Configuration Failed:", error);
  process.exit(1);
}

const nextConfig: NextConfig = {
  // Explicitly define environment variables
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
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
    };

    return config;
  },

  // Logging for debugging
  async rewrites() {
    return [
      {
        source: "/env-debug",
        destination: "/api/env-debug",
      },
    ];
  },

  // Performance and compatibility settings
  productionBrowserSourceMaps: false,
  optimizeFonts: true,
  reactStrictMode: true,
  swcMinify: true,
};

export default nextConfig;
