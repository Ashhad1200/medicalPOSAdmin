import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/config/supabase";

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    // Get total users count
    const { count: totalUsers, error: usersError } = await supabaseAdmin
      .from("users")
      .select("*", { count: "exact", head: true });

    if (usersError) throw usersError;

    // Get total organizations count
    const { count: totalOrganizations, error: orgsError } = await supabaseAdmin
      .from("organizations")
      .select("*", { count: "exact", head: true });

    if (orgsError) throw orgsError;

    // Get active users count
    const { count: activeUsers, error: activeError } = await supabaseAdmin
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("isActive", true)
      .eq("subscriptionStatus", "active");

    if (activeError) throw activeError;

    // Get expired users count
    const { count: expiredUsers, error: expiredError } = await supabaseAdmin
      .from("users")
      .select("*", { count: "exact", head: true })
      .or(
        "subscriptionStatus.eq.expired,accessValidTill.lt." +
          new Date().toISOString()
      );

    if (expiredError) throw expiredError;

    // Get recent users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: recentUsers, error: recentError } = await supabaseAdmin
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("createdAt", thirtyDaysAgo.toISOString());

    if (recentError) throw recentError;

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      totalOrganizations: totalOrganizations || 0,
      activeUsers: activeUsers || 0,
      expiredUsers: expiredUsers || 0,
      recentUsers: recentUsers || 0,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
