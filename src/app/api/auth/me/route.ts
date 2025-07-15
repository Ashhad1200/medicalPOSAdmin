import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/config/supabase";

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const supabaseUid = searchParams.get("supabaseUid");

    console.log("Received supabaseUid:", supabaseUid);

    if (!supabaseUid) {
      console.error("Missing supabaseUid parameter");
      return NextResponse.json(
        { error: "supabaseUid is required" },
        { status: 400 }
      );
    }

    // First, check if the user exists in Supabase Auth
    const { data: authUserData, error: authError } =
      await supabaseAdmin.auth.admin.getUserById(supabaseUid);

    if (authError) {
      console.error("Supabase Auth user lookup error:", authError);
      return NextResponse.json(
        {
          error: "Supabase Auth user not found",
          details: authError.message,
        },
        { status: 404 }
      );
    }

    console.log("Supabase Auth User Details:", {
      id: authUserData.user.id,
      email: authUserData.user.email,
      metadata: authUserData.user.user_metadata,
    });

    // --- Self-Healing User Profile Logic ---
    const { data: initialUser, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("supabase_uid", supabaseUid)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // A real database error occurred, not just "not found".
      throw fetchError;
    }

    let userData = initialUser;

    if (!userData) {
      // User not found by UID, attempt self-heal by email.
      console.warn(`User profile not found for UID: ${supabaseUid}. Attempting self-heal.`);
      const userEmail = authUserData.user.email;
      if (!userEmail) {
        return NextResponse.json({ error: "User in Auth has no email." }, { status: 400 });
      }

      const { data: userByEmail, error: emailFetchError } = await supabaseAdmin
        .from("users")
        .select("*")
        .eq("email", userEmail)
        .single();

      if (emailFetchError && emailFetchError.code !== "PGRST116") {
        throw emailFetchError;
      }

      if (userByEmail) {
        // Found user by email, their UID is out of sync. Fix it.
        console.log(`Found user by email. Updating UID from ${userByEmail.supabase_uid} to ${supabaseUid}.`);
        const { data: updatedUser, error: updateError } = await supabaseAdmin
          .from("users")
          .update({ supabase_uid: supabaseUid })
          .eq("email", userEmail)
          .select()
          .single();
        
        if (updateError) throw updateError;
        userData = updatedUser;
      }
    }
    
    if (!userData) {
      // If after all that, we still don't have a user, then they don't exist.
      return NextResponse.json({ error: "User profile does not exist." }, { status: 404 });
    }
    console.log("User role:", userData.role);

    // Only allow admin and manager roles to access admin panel
    if (userData.role !== "admin" && userData.role !== "manager") {
      console.warn("Insufficient permissions for user:", userData.role);
      return NextResponse.json(
        {
          error: "Insufficient permissions",
          role: userData.role,
        },
        { status: 403 }
      );
    }

    return NextResponse.json(userData);
  } catch (error) {
    console.error("Unexpected error in /api/auth/me:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
