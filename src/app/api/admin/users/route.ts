import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/config/supabase";
import bcrypt from "bcryptjs";

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

    const organizationId = searchParams.get("organizationId");
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let query = supabaseAdmin
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
      .order("created_at", { ascending: false });

    if (organizationId) {
      query = query.eq("organization_id", organizationId);
    }

    if (role) {
      query = query.eq("role", role);
    }

    if (status) {
      query = query.eq("subscription_status", status);
    }

    if (search) {
      query = query.or(
        `username.ilike.%${search}%,email.ilike.%${search}%,full_name.ilike.%${search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const userData = await request.json();

    // Validate required fields
    if (
      !userData.email ||
      !userData.password ||
      !userData.username ||
      !userData.organization_id
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: email, password, username, organization_id",
        },
        { status: 400 }
      );
    }

    // Validate password strength
    if (userData.password.length < 6) {
      return NextResponse.json(
        {
          error: "Password must be at least 6 characters long",
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      return NextResponse.json(
        {
          error: "Invalid email format",
        },
        { status: 400 }
      );
    }

    // Generate UUID for the user
    const userId = generateUUID();
    const now = new Date().toISOString();

    // Verify organization exists
    const { data: orgData, error: orgError } = await supabaseAdmin
      .from("organizations")
      .select("id")
      .eq("id", userData.organization_id)
      .single();

    if (orgError || !orgData) {
      console.error("Organization validation error:", orgError);
      return NextResponse.json(
        {
          error: "Invalid organization ID",
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", userData.email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        {
          error: "User with this email already exists",
        },
        { status: 400 }
      );
    }

    // Check if username already exists
    const { data: existingUsername } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("username", userData.username)
      .single();

    if (existingUsername) {
      return NextResponse.json(
        {
          error: "Username already exists",
        },
        { status: 400 }
      );
    }

    // Create user in Supabase Auth with better error handling
    let authData;
    try {
      console.log("Attempting to create user in Supabase Auth:", {
        email: userData.email,
        passwordLength: userData.password.length,
        organizationId: userData.organization_id,
      });

      // Try creating user with minimal parameters first
      const { data, error: authError } =
        await supabaseAdmin.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: userData.is_email_verified || false,
        });

      if (authError) {
        console.error("Auth creation error:", authError);
        console.error("Auth error details:", {
          code: authError.code,
          status: authError.status,
          message: authError.message,
        });

        // Try alternative approach - create user without password first
        console.log("Trying alternative approach...");
        const { data: altData, error: altError } =
          await supabaseAdmin.auth.admin.createUser({
            email: userData.email,
            password: userData.password,
            email_confirm: userData.is_email_verified || false,
            user_metadata: {},
          });

        if (altError) {
          console.error("Alternative approach also failed:", altError);

          // Try to get more specific error information
          if (authError.message.includes("Database error")) {
            return NextResponse.json(
              {
                error:
                  "Database configuration issue. Please check Supabase project settings.",
                details: authError,
              },
              { status: 400 }
            );
          }

          return NextResponse.json(
            {
              error: `Auth creation failed: ${authError.message}`,
              details: authError,
            },
            { status: 400 }
          );
        }

        authData = altData;
      } else {
        authData = data;
      }

      console.log("Auth user created successfully:", authData.user?.id);
    } catch (authException) {
      console.error("Auth creation exception:", authException);
      return NextResponse.json(
        {
          error: `Auth creation exception: ${
            authException instanceof Error
              ? authException.message
              : "Unknown error"
          }`,
          details: authException,
        },
        { status: 400 }
      );
    }

    // Prepare user data with all fields
    const dbUserData = {
      id: userId,
      supabase_uid: authData.user.id,
      username: userData.username,
      email: userData.email,
      full_name: userData.full_name || null,
      phone: userData.phone || null,
      avatar_url: userData.avatar_url || null,
      role: userData.role || "user",
      role_in_pos: userData.role_in_pos || null,
      permissions: userData.permissions || [],
      organization_id: userData.organization_id,
      subscription_status: userData.subscription_status || "pending",
      access_valid_till: userData.access_valid_till || null,
      trial_ends_at: userData.trial_ends_at || null,
      last_access_extension: null,
      is_trial_user:
        userData.is_trial_user !== undefined ? userData.is_trial_user : true,
      is_active: userData.is_active !== undefined ? userData.is_active : false,
      is_email_verified:
        userData.is_email_verified !== undefined
          ? userData.is_email_verified
          : false,
      last_login: null,
      login_attempts: 0,
      locked_until: null,
      password_reset_token: null,
      password_reset_expires: null,
      two_factor_enabled: userData.two_factor_enabled || false,
      two_factor_secret: null,
      preferences: userData.preferences || {},
      theme: userData.theme || "light",
      language: userData.language || "en",
      timezone: userData.timezone || "UTC",
      notification_settings: userData.notification_settings || {},
      created_by: userData.created_by || null,
      approved_by: userData.approved_by || null,
      approved_at: userData.approved_at || null,
      deactivated_by: null,
      deactivated_at: null,
      deactivation_reason: userData.deactivation_reason || null,
      created_at: now,
      updated_at: now,
    };

    // Create user in database
    const { data, error } = await supabaseAdmin
      .from("users")
      .insert(dbUserData)
      .select()
      .single();

    if (error) {
      console.error("User creation error:", error);
      console.error("Error details:", {
        code: error.code,
        details: error.details,
        hint: error.hint,
        message: error.message,
      });

      // If database insert fails, clean up auth user
      try {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        console.log("Cleaned up auth user after database error");
      } catch (cleanupError) {
        console.error("Failed to cleanup auth user:", cleanupError);
      }

      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Log the action (simplified for now)
    try {
      await supabaseAdmin.from("audit_logs").insert({
        id: generateUUID(),
        action: "CREATE",
        entity: "User",
        entity_id: data.id,
        user_id: userData.created_by || "system",
        organization_id: userData.organization_id,
        new_values: {
          id: data.id,
          username: data.username,
          email: data.email,
          role: data.role,
          role_in_pos: data.role_in_pos,
        },
        metadata: {
          userAgent: request.headers.get("user-agent"),
          createdViaAdminPanel: true,
        },
        timestamp: now,
      });
    } catch (auditError) {
      console.error("Audit log creation failed:", auditError);
      // Don't fail the user creation if audit logging fails
    }

    // Update organization's current user count
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
      // Don't fail user creation if org count update fails
    }

    // Remove sensitive data from response
    const responseData = { ...data };
    delete responseData.password_reset_token;
    delete responseData.two_factor_secret;

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
