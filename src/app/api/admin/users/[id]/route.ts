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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id: userId } = await params;

    const { data, error } = await supabaseAdmin
      .from("users")
      .select(
        `
        *,
        organization:organizations(
          id,
          name,
          code,
          subscription_tier
        )
      `
      )
      .eq("id", userId)
      .single();

    if (error) {
      console.error("User fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { updates, reason, updatedBy } = await request.json();
    const { id: userId } = await params;
    const now = new Date().toISOString();

    console.log("Updating user:", userId, "with updates:", updates);

    // Update user in database - using exact column names from schema
    const { data, error } = await supabaseAdmin
      .from("users")
      .update({
        ...updates,
        updated_at: now,
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("User update error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Log the action
    await supabaseAdmin.from("audit_logs").insert({
      id: generateUUID(),
      action: "UPDATE",
      entity: "User",
      entity_id: userId,
      user_id: updatedBy,
      organization_id: data.organization_id,
      old_values: {}, // TODO: Get old values before update
      new_values: updates,
      reason,
      metadata: { userAgent: request.headers.get("user-agent") },
      timestamp: now,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id: userId } = await params;
    const { reason, deletedBy } = await request.json();
    const now = new Date().toISOString();

    // Get user data before deletion for audit log
    const { data: userData } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    // Soft delete - set is_active to false
    const { data, error } = await supabaseAdmin
      .from("users")
      .update({
        is_active: false,
        deactivated_at: now,
        deactivated_by: deletedBy,
        deactivation_reason: reason || "User deactivated via admin panel",
        updated_at: now,
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("User deactivation error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Log the action
    await supabaseAdmin.from("audit_logs").insert({
      id: generateUUID(),
      action: "DEACTIVATE",
      entity: "User",
      entity_id: userId,
      user_id: deletedBy,
      organization_id: userData?.organization_id,
      old_values: userData,
      new_values: data,
      reason,
      metadata: { userAgent: request.headers.get("user-agent") },
      timestamp: now,
    });

    // Update organization's current user count
    if (userData?.organization_id) {
      try {
        // Get current active user count for this organization
        const { count: currentActiveUsers } = await supabaseAdmin
          .from("users")
          .select("*", { count: "exact", head: true })
          .eq("organization_id", userData.organization_id)
          .eq("is_active", true);

        await supabaseAdmin
          .from("organizations")
          .update({
            current_users: currentActiveUsers || 0,
            updated_at: now,
          })
          .eq("id", userData.organization_id);
      } catch (orgUpdateError) {
        console.error(
          "Failed to update organization user count:",
          orgUpdateError
        );
        // Don't fail user deletion if org count update fails
      }
    }

    return NextResponse.json({ message: "User deactivated successfully" });
  } catch (error) {
    console.error("Error deactivating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
