import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/config/supabase";

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    // Test basic connection
    const { data: testData, error: testError } = await supabaseAdmin
      .from("organizations")
      .select("count")
      .limit(1);

    if (testError) {
      console.error("Database connection test failed:", testError);
      return NextResponse.json(
        {
          error: "Database connection failed",
          details: testError,
        },
        { status: 500 }
      );
    }

    // Test auth admin capabilities
    try {
      const { data: authTest, error: authError } =
        await supabaseAdmin.auth.admin.listUsers({
          page: 1,
          perPage: 1,
        });

      if (authError) {
        console.error("Auth admin test failed:", authError);
        return NextResponse.json(
          {
            error: "Auth admin access failed",
            details: authError,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Supabase connection and auth admin access working",
        dbTest: "passed",
        authTest: "passed",
        userCount: authTest.users?.length || 0,
      });
    } catch (authException) {
      console.error("Auth admin exception:", authException);
      return NextResponse.json(
        {
          error: "Auth admin exception",
          details: authException,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Test endpoint error:", error);
    return NextResponse.json(
      {
        error: "Test endpoint failed",
        details: error,
      },
      { status: 500 }
    );
  }
}
