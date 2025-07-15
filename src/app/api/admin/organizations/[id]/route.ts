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
    const { id: organizationId } = await params;

    const { data, error } = await supabaseAdmin
      .from("organizations")
      .select("*")
      .eq("id", organizationId)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching organization:", error);
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
    const { id: organizationId } = await params;
    const now = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("organizations")
      .update({
        ...updates,
        updated_at: now,
      })
      .eq("id", organizationId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Log the action
    await supabaseAdmin.from("audit_logs").insert({
      id: generateUUID(),
      action: "UPDATE",
      entity: "Organization",
      entityId: organizationId,
      userId: updatedBy,
      organizationId: organizationId,
      oldValues: {}, // TODO: Get old values before update
      newValues: updates,
      reason,
      metadata: { userAgent: request.headers.get("user-agent") },
      timestamp: now,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating organization:", error);
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
    const { id: organizationId } = await params;
    const { reason, deletedBy } = await request.json();
    const now = new Date().toISOString();

    // First, get the organization data for audit log
    const { data: orgData, error: fetchError } = await supabaseAdmin
      .from("organizations")
      .select("*")
      .eq("id", organizationId)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 400 });
    }

    // Get all users in this organization before deletion
    const { data: usersInOrg, error: usersError } = await supabaseAdmin
      .from("users")
      .select("id, username, email, supabase_uid")
      .eq("organization_id", organizationId);

    if (usersError) {
      console.error("Error fetching users in organization:", usersError);
      return NextResponse.json(
        { error: "Failed to fetch organization users" },
        { status: 400 }
      );
    }

    const userCount = usersInOrg?.length || 0;
    console.log(
      `Deleting organization ${orgData.name} with ${userCount} users`
    );

    // Step 1: Deactivate all users in the organization (soft delete)
    if (userCount > 0) {
      const { error: userDeactivationError } = await supabaseAdmin
        .from("users")
        .update({
          is_active: false,
          deactivated_at: now,
          deactivation_reason: `Organization ${orgData.name} was deleted`,
          updated_at: now,
        })
        .eq("organization_id", organizationId);

      if (userDeactivationError) {
        console.error("Error deactivating users:", userDeactivationError);
        return NextResponse.json(
          { error: "Failed to deactivate organization users" },
          { status: 400 }
        );
      }

      // Delete Supabase Auth users for each user
      for (const user of usersInOrg) {
        if (user.supabase_uid) {
          try {
            await supabaseAdmin.auth.admin.deleteUser(user.supabase_uid);
            console.log(`Deleted Supabase Auth user: ${user.username}`);
          } catch (authDeleteError) {
            console.error(
              `Failed to delete Supabase Auth user ${user.username}:`,
              authDeleteError
            );
            // Continue with the process even if some auth users fail to delete
          }
        }
      }

      // Log user deletions
      for (const user of usersInOrg) {
        await supabaseAdmin.from("audit_logs").insert({
          id: generateUUID(),
          action: "CASCADE_DELETE",
          entity: "User",
          entityId: user.id,
          userId: deletedBy,
          organizationId: organizationId,
          oldValues: user,
          newValues: { is_active: false, deactivated_at: now },
          reason: `Cascaded deletion from organization: ${reason}`,
          metadata: {
            userAgent: request.headers.get("user-agent"),
            cascadeSource: "organization_deletion",
            orgName: orgData.name,
          },
          timestamp: now,
        });
      }
    }

    // Step 2: Delete the organization
    const { error: orgDeleteError } = await supabaseAdmin
      .from("organizations")
      .delete()
      .eq("id", organizationId);

    if (orgDeleteError) {
      console.error("Organization deletion error:", orgDeleteError);
      return NextResponse.json(
        { error: orgDeleteError.message },
        { status: 400 }
      );
    }

    // Step 3: Log the organization deletion
    await supabaseAdmin.from("audit_logs").insert({
      id: generateUUID(),
      action: "DELETE",
      entity: "Organization",
      entityId: organizationId,
      userId: deletedBy,
      organizationId: organizationId,
      oldValues: orgData,
      newValues: { deleted: true, deleted_at: now },
      reason,
      metadata: {
        userAgent: request.headers.get("user-agent"),
        deletedUserCount: userCount,
      },
      timestamp: now,
    });

    return NextResponse.json({
      success: true,
      message: `Organization ${orgData.name} deleted successfully`,
      deletedUserCount: userCount,
    });
  } catch (error) {
    console.error("Error deleting organization:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
