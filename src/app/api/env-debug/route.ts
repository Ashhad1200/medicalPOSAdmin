import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const envVars = {
    // Next.js environment variables
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,

    // Supabase configuration
    NEXT_PUBLIC_SUPABASE_URL: {
      exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      masked: process.env.NEXT_PUBLIC_SUPABASE_URL
        ? process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 10) + "..."
        : "MISSING",
    },
    NEXT_PUBLIC_SUPABASE_ANON_KEY: {
      exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      masked: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 10) + "..."
        : "MISSING",
    },
    SUPABASE_SERVICE_ROLE_KEY: {
      exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      masked: process.env.SUPABASE_SERVICE_ROLE_KEY
        ? process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 10) + "..."
        : "MISSING",
    },

    // Additional debugging information
    debugInfo: {
      timestamp: new Date().toISOString(),
      runtime: process.version,
      platform: process.platform,
    },
  };

  return NextResponse.json({
    message: "Environment Variables Debug",
    variables: envVars,
  });
}
