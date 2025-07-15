import { NextResponse } from "next/server";
import {
  testSupabaseConnectivity,
  logConnectivityTestResults,
} from "@/lib/supabase-connectivity";

export async function GET() {
  try {
    // Perform connectivity test
    const connectivityResult = await testSupabaseConnectivity();

    // Log results to server console
    logConnectivityTestResults(connectivityResult);

    // Return results as JSON response
    return NextResponse.json(
      {
        success: connectivityResult.success,
        timestamp: connectivityResult.timestamp,
        tests: connectivityResult.tests,
        errors: connectivityResult.errors,
      },
      {
        status: connectivityResult.success ? 200 : 500,
      }
    );
  } catch (error) {
    console.error("Supabase Debug Route Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
