import { z } from "zod";

// Environment Variables Schema
export const EnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
});

// Application Configuration
export const APP_CONFIG = {
  NAME: process.env.NEXT_PUBLIC_APP_NAME || "Medical POS Admin Panel",
  VERSION: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
  ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT || "development",

  // Authentication Role Hierarchy
  AUTH: {
    ROLES: ["restricted", "customer", "user", "counter", "manager", "admin"] as const,
    ROLE_HIERARCHY: {
      restricted: 1,
      customer: 1,
      user: 2,
      counter: 2,
      manager: 3,
      admin: 4,
    },
    DEFAULT_REDIRECT: {
      restricted: "/login",
      customer: "/dashboard",
      user: "/dashboard",
      counter: "/dashboard",
      manager: "/dashboard",
      admin: "/admin/dashboard",
    },
  },

  // Feature Flags
  FEATURES: {
    DEBUG_MODE: process.env.NEXT_PUBLIC_DEBUG === "true",
    ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",
  },

  // API Configuration
  API: {
    BASE_URL: process.env.NEXT_PUBLIC_API_URL || "/api",
    TIMEOUT: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || "10000", 10),
  },
};

// Utility to check if we're in development mode
export const isDevelopment = APP_CONFIG.ENVIRONMENT === "development";

// Utility to check if debug mode is enabled
export const isDebugMode = APP_CONFIG.FEATURES.DEBUG_MODE;

// Export as const to ensure type safety
export const ENVIRONMENT_COLORS = {
  development: "bg-yellow-100 text-yellow-800",
  staging: "bg-blue-100 text-blue-800",
  production: "bg-green-100 text-green-800",
} as const;

// Type Definitions
export type UserRole = (typeof APP_CONFIG.AUTH.ROLES)[number];
export type FeatureFlag = keyof typeof APP_CONFIG.FEATURES;
