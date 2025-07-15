import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/config/supabase";

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);

    const organizationId = searchParams.get("organizationId");
    const userId = searchParams.get("userId");
    const action = searchParams.get("action");
    const entity = searchParams.get("entity");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const limit = searchParams.get("limit") || "100";

    let query = supabaseAdmin
      .from("audit_logs")
      .select(
        `
        *,
        user:users(username, email),
        targetUser:users!audit_logs_targetUserId_fkey(username, email)
      `
      )
      .order("timestamp", { ascending: false })
      .limit(parseInt(limit));

    if (organizationId) {
      query = query.eq("organizationId", organizationId);
    }

    if (userId) {
      query = query.eq("userId", userId);
    }

    if (action) {
      query = query.eq("action", action);
    }

    if (entity) {
      query = query.eq("entity", entity);
    }

    if (dateFrom) {
      query = query.gte("timestamp", dateFrom);
    }

    if (dateTo) {
      query = query.lte("timestamp", dateTo);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Audit logs fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
