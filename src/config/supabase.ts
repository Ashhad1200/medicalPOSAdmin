import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

class SupabaseClientSingleton {
  private static instance: ReturnType<typeof createClient<Database>> | null =
    null;
  private static adminInstance: ReturnType<
    typeof createClient<Database>
  > | null = null;

  private constructor() {}

  public static getInstance() {
    if (!this.instance) {
      const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as
        | string
        | undefined;
      const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as
        | string
        | undefined;

      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        throw new Error(
          "Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY"
        );
      }

      this.instance = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
        global: {
          headers: {
            "x-client-info": "medical-pos-admin-panel/1.0.0",
          },
        },
      });

      // Prevent multiple instances warning
      (this.instance as any).storageKey =
        "medical-pos-admin-panel-supabase-key";
    }
    return this.instance;
  }

  // Modify the getAdminInstance method to be more robust
  public static getAdminInstance() {
    if (!this.adminInstance) {
      const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as
        | string
        | undefined;
      const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as
        | string
        | undefined;

      if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        throw new Error(
          "Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY"
        );
      }

      this.adminInstance = createClient<Database>(
        SUPABASE_URL,
        SUPABASE_SERVICE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
          global: {
            headers: {
              "x-client-info": "medical-pos-admin-panel/1.0.0-admin",
            },
          },
          db: {
            schema: "public", // Explicitly set schema
          },
        }
      );

      // Prevent multiple instances warning
      (this.adminInstance as any).storageKey =
        "medical-pos-admin-panel-admin-key";
    }
    return this.adminInstance;
  }

  // No validateEnvVar needed; direct references above ensure compile-time replacement in browser bundle.
}

export const supabase = SupabaseClientSingleton.getInstance();
export const supabaseAdmin = SupabaseClientSingleton.getAdminInstance();

// Helper exported for server-side use – avoids importing the raw client on the client bundle
export const getSupabaseAdmin = () =>
  SupabaseClientSingleton.getAdminInstance();

export const supabaseConfig = {
  // Access protected property through cast – runtime only
  url: (supabase as any).supabaseUrl,
  anonKeyPrefix:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10) + "...",
};

// Enhanced User interface with more comprehensive type definitions
export interface User {
  id: string;
  supabaseuid: string;
  username: string;
  email: string;
  fullName?: string;
  phone?: string;
  avatar?: string;
  role: "super_admin" | "admin" | "manager" | "user";
  permissions: string[];
  organizationId: string;
  organization?: Organization;

  // Enhanced access and status tracking
  subscriptionStatus: "pending" | "active" | "suspended" | "expired";
  accessValidTill?: string;
  isTrialUser: boolean;
  isActive: boolean;
  isEmailVerified: boolean;

  // Security-related fields
  lastLogin?: string;
  loginAttempts: number;
  lockedUntil?: string;
  twoFactorEnabled: boolean;

  // Audit and management fields
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: string;

  // Preferences and settings
  preferences: Record<string, unknown>;
  theme: string;
  language: string;
  timezone: string;

  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  code: string;
  subscriptionTier: string;
  maxUsers: number;
  currentUsers: number;
  isActive: boolean;
}

export interface AuditLog {
  id: string;
  organizationId?: string;
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  reason?: string;
  performedBy?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// Authentication-related error types
export enum AuthErrorType {
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  ACCOUNT_LOCKED = "ACCOUNT_LOCKED",
  TWO_FACTOR_REQUIRED = "TWO_FACTOR_REQUIRED",
  UNAUTHORIZED = "UNAUTHORIZED",
  NETWORK_ERROR = "NETWORK_ERROR",
}

export interface AuthError {
  type: AuthErrorType;
  message: string;
}
