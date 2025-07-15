import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/config/database.types";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabaseAdmin = createClient<Database>(
      supabaseUrl,
      supabaseServiceKey
    );

    // Comprehensive Authentication Debugging
    const debugResults: Record<string, any> = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        supabaseUrl: supabaseUrl.substring(0, 20) + "...",
      },
      supabaseConfig: {
        authEnabled: !!supabaseServiceKey,
        serviceRoleKeyLength: supabaseServiceKey?.length || 0,
      },
      userTableCheck: {
        exists: false,
        columns: [],
        sampleUsers: [],
        error: null,
      },
      authUserCheck: {
        totalUsers: 0,
        adminUsers: 0,
        error: null,
      },
    };

    // Check Users Table
    try {
      const { data: usersTableCheck, error: tableError } = await supabaseAdmin
        .from("users")
        .select("*", { count: "exact", head: true });

      if (tableError) {
        debugResults.userTableCheck.error = tableError.message;
      } else {
        const { data: columns } = await supabaseAdmin.rpc("get_table_columns", {
          table_name: "users",
        });

        debugResults.userTableCheck = {
          exists: true,
          columns: columns || [],
          sampleUsers: await supabaseAdmin
            .from("users")
            .select("id, email, supabaseUid, role")
            .limit(5),
        };
      }
    } catch (tableCheckError) {
      debugResults.userTableCheck.error =
        tableCheckError instanceof Error
          ? tableCheckError.message
          : "Unknown table check error";
    }

    // Check Auth Users
    try {
      const { data: authUsers, error: authError } =
        await supabaseAdmin.auth.admin.listUsers();

      if (authError) {
        debugResults.authUserCheck.error = authError.message;
      } else {
        debugResults.authUserCheck = {
          totalUsers: authUsers.users.length,
          adminUsers: authUsers.users.filter(
            (user) => user.user_metadata?.role === "admin"
          ).length,
        };
      }
    } catch (authCheckError) {
      debugResults.authUserCheck.error =
        authCheckError instanceof Error
          ? authCheckError.message
          : "Unknown auth check error";
    }

    return NextResponse.json(
      {
        success: true,
        ...debugResults,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Authentication Debug Route Error:", error);

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
