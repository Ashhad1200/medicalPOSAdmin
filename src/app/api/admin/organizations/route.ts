import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/config/supabase";

// Helper function to generate UUID
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);

    const subscriptionTier = searchParams.get("subscriptionTier");
    const search = searchParams.get("search");
    const isActive = searchParams.get("isActive");

    let query = supabaseAdmin
      .from("organizations")
      .select(
        `
        *,
        users:users(count)
      `
      )
      .order("created_at", { ascending: false });

    if (subscriptionTier) {
      query = query.eq("subscription_tier", subscriptionTier);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%`);
    }

    if (isActive !== null && isActive !== undefined) {
      query = query.eq("is_active", isActive === "true");
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Calculate actual user counts for each organization
    const orgsWithUserCounts = await Promise.all(
      data.map(async (org) => {
        // Get actual user count (active users only)
        const { count: activeUserCount, error: userCountError } =
          await supabaseAdmin
            .from("users")
            .select("*", { count: "exact", head: true })
            .eq("organization_id", org.id)
            .eq("is_active", true);

        if (userCountError) {
          console.error(
            `Error getting user count for org ${org.id}:`,
            userCountError
          );
          return {
            ...org,
            current_users: 0,
            activeUserCount: 0,
          };
        }

        return {
          ...org,
          current_users: activeUserCount || 0,
          activeUserCount: activeUserCount || 0,
        };
      })
    );

    return NextResponse.json(orgsWithUserCounts);
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const orgData = await request.json();

    // Generate UUID for the organization
    const orgId = generateUUID();
    const now = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("organizations")
      .insert({
        id: orgId,
        name: orgData.name,
        code: orgData.code,
        description: orgData.description || null,
        address: orgData.address || null,
        phone: orgData.phone || null,
        email: orgData.email || null,
        is_active: true,
        subscription_tier: orgData.subscriptionTier || "basic",
        max_users: orgData.maxUsers || 5,
        current_users: 0,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      console.error("Organization creation error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating organization:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
