import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

// Connectivity test schema
const ConnectivityTestSchema = z.object({
  supabaseUrl: z.string().url("Invalid Supabase URL"),
  anonKey: z.string().min(10, "Supabase anon key is too short"),
  serviceRoleKey: z
    .string()
    .min(10, "Service role key is too short")
    .optional(),
});

export interface ConnectivityTestResult {
  success: boolean;
  timestamp: string;
  tests: {
    urlValidity: boolean;
    anonymousConnection: boolean;
    serviceRoleConnection?: boolean;
    userTableAccess?: boolean;
  };
  errors: string[];
}

export async function testSupabaseConnectivity(config?: {
  supabaseUrl?: string;
  anonKey?: string;
  serviceRoleKey?: string;
}): Promise<ConnectivityTestResult> {
  const result: ConnectivityTestResult = {
    success: true,
    timestamp: new Date().toISOString(),
    tests: {
      urlValidity: false,
      anonymousConnection: false,
      serviceRoleConnection: false,
      userTableAccess: false,
    },
    errors: [],
  };

  try {
    // Validate environment variables
    const validatedConfig = ConnectivityTestSchema.parse({
      supabaseUrl: config?.supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: config?.anonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceRoleKey:
        config?.serviceRoleKey || process.env.SUPABASE_SERVICE_ROLE_KEY,
    });

    // URL Validity Test
    result.tests.urlValidity = true;

    // Anonymous Client Connection Test
    const supabase = createClient(
      validatedConfig.supabaseUrl,
      validatedConfig.anonKey
    );

    // Test anonymous connection
    const { data, error: anonymousError } = await supabase
      .from("organizations")
      .select("id")
      .limit(1)
      .single();

    result.tests.anonymousConnection = !anonymousError;
    if (anonymousError) {
      result.errors.push(
        `Anonymous Connection Error: ${anonymousError.message}`
      );
      result.success = false;
    }

    // Service Role Connection Test (if key provided)
    if (validatedConfig.serviceRoleKey) {
      const adminSupabase = createClient(
        validatedConfig.supabaseUrl,
        validatedConfig.serviceRoleKey
      );

      const { data: adminData, error: adminError } = await adminSupabase
        .from("users")
        .select("id")
        .limit(1)
        .single();

      result.tests.serviceRoleConnection = !adminError;
      if (adminError) {
        result.errors.push(
          `Service Role Connection Error: ${adminError.message}`
        );
        result.success = false;
      }
    }

    return result;
  } catch (err) {
    // Handle validation or unexpected errors
    const error = err instanceof Error ? err : new Error(String(err));
    result.success = false;
    result.errors.push(error.message);

    return result;
  }
}

// Utility function to log connectivity test results
export function logConnectivityTestResults(testResult: ConnectivityTestResult) {
  console.group("🔌 Supabase Connectivity Test Results");
  console.log("Timestamp:", testResult.timestamp);
  console.log(
    "Overall Success:",
    testResult.success ? "✅ Passed" : "❌ Failed"
  );

  console.group("Test Details:");
  Object.entries(testResult.tests).forEach(([testName, testResult]) => {
    console.log(`${testName}: ${testResult ? "✅ Passed" : "❌ Failed"}`);
  });
  console.groupEnd();

  if (testResult.errors.length > 0) {
    console.group("Errors:");
    testResult.errors.forEach((error) => console.error(error));
    console.groupEnd();
  }

  console.groupEnd();

  return testResult;
}

// Quick connectivity check function for use in components/hooks
export async function quickSupabaseCheck() {
  const result = await testSupabaseConnectivity();
  return result.success;
}
