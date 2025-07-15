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

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { userIds, updates, reason, updatedBy } = await request.json();

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: "userIds array is required" },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];
    const now = new Date().toISOString();

    // Update each user individually
    for (const userId of userIds) {
      try {
        const { data, error } = await supabaseAdmin
          .from("users")
          .update({
            ...updates,
            updatedAt: now,
          })
          .eq("id", userId)
          .select()
          .single();

        if (error) {
          errors.push({ userId, error: error.message });
        } else {
          results.push(data);

          // Log the action for each user
          await supabaseAdmin.from("audit_logs").insert({
            id: generateUUID(),
            action: "BULK_UPDATE",
            entity: "User",
            entityId: userId,
            userId: updatedBy,
            organizationId: data.organizationId,
            oldValues: {}, // TODO: Get old values before update
            newValues: updates,
            reason,
            metadata: {
              bulkOperation: true,
              totalUsers: userIds.length,
              userAgent: request.headers.get("user-agent"),
            },
            timestamp: now,
          });
        }
      } catch (err) {
        errors.push({ userId, error: "Failed to update user" });
      }
    }

    return NextResponse.json({
      success: results.length,
      failed: errors.length,
      results,
      errors,
    });
  } catch (error) {
    console.error("Error bulk updating users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
