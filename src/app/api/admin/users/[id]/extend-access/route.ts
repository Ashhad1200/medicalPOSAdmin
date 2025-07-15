import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/config/supabase";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { extensionDays, reason, extendedBy } = await request.json();
    const userId = params.id;

    // Get current user data
    const { data: currentUser, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 400 });
    }

    // Calculate new access valid till date
    const currentValidTill = currentUser.accessValidTill
      ? new Date(currentUser.accessValidTill)
      : new Date();

    const newValidTill = new Date(currentValidTill);
    newValidTill.setDate(newValidTill.getDate() + extensionDays);

    // Update user access
    const { data, error } = await supabaseAdmin
      .from("users")
      .update({
        accessValidTill: newValidTill.toISOString(),
        lastAccessExtension: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Log the action
    await supabaseAdmin.from("audit_logs").insert({
      action: "EXTEND_ACCESS",
      entity: "User",
      entityId: userId,
      userId: extendedBy,
      organizationId: currentUser.organizationId,
      oldValues: { accessValidTill: currentUser.accessValidTill },
      newValues: { accessValidTill: newValidTill.toISOString() },
      reason,
      metadata: {
        extensionDays,
        userAgent: request.headers.get("user-agent"),
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error extending user access:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
