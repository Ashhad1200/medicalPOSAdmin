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
    const userId = searchParams.get("userId");
    const organizationId = searchParams.get("organizationId");

    if (!userId && !organizationId) {
      return NextResponse.json(
        { error: "Either userId or organizationId is required" },
        { status: 400 }
      );
    }

    let query = supabaseAdmin.from("user_ledger").select("*");

    if (userId) {
      query = query.eq("userId", userId);
    } else if (organizationId) {
      // For organization ledger, we need to join with users table to get organization-specific entries
      const { data: orgUsers, error: usersError } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("organization_id", organizationId);

      if (usersError) {
        return NextResponse.json({ error: usersError.message }, { status: 400 });
      }

      const userIds = orgUsers.map(user => user.id);
      if (userIds.length === 0) {
        return NextResponse.json([]);
      }

      query = query.in("userId", userIds);
    }

    const { data, error } = await query.order("transactionDate", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("ledger route error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const ledgerData = await request.json();

    // Generate UUID for the ledger entry
    const ledgerId = generateUUID();
    const now = new Date().toISOString();

    let targetUserId = ledgerData.userId;

    // If organizationId is provided, get the organization's primary user or admin
    if (ledgerData.organizationId && !ledgerData.userId) {
      const { data: orgUsers, error: usersError } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("organization_id", ledgerData.organizationId)
        .eq("role", "admin")
        .limit(1);

      if (usersError || !orgUsers || orgUsers.length === 0) {
        // If no admin found, get any user from the organization
        const { data: anyUser, error: anyUserError } = await supabaseAdmin
          .from("users")
          .select("id")
          .eq("organization_id", ledgerData.organizationId)
          .limit(1);

        if (anyUserError || !anyUser || anyUser.length === 0) {
          return NextResponse.json(
            { error: "No users found for this organization" },
            { status: 400 }
          );
        }
        targetUserId = anyUser[0].id;
      } else {
        targetUserId = orgUsers[0].id;
      }
    }

    if (!targetUserId) {
      return NextResponse.json(
        { error: "userId or organizationId is required" },
        { status: 400 }
      );
    }

    // Get current balance
    const { data: currentLedger } = await supabaseAdmin
      .from("user_ledger")
      .select("runningBalance")
      .eq("userId", targetUserId)
      .order("transactionDate", { ascending: false })
      .limit(1);

    const currentBalance = currentLedger?.[0]?.runningBalance || "0";
    const currentBalanceNum = parseFloat(currentBalance);
    const transactionAmount = parseFloat(ledgerData.amount);

    // Calculate new balance
    let newBalance: string;
    if (ledgerData.transactionType === "credit") {
      newBalance = (currentBalanceNum + transactionAmount).toString();
    } else {
      newBalance = (currentBalanceNum - transactionAmount).toString();
    }

    // Create ledger entry
    const { data, error } = await supabaseAdmin
      .from("user_ledger")
      .insert({
        id: ledgerId,
        userId: targetUserId,
        transactionType: ledgerData.transactionType,
        description: ledgerData.description,
        referenceNumber: ledgerData.referenceNumber || null,
        amount: ledgerData.amount.toString(),
        debitAmount:
          ledgerData.transactionType === "debit"
            ? ledgerData.amount.toString()
            : "0",
        creditAmount:
          ledgerData.transactionType === "credit"
            ? ledgerData.amount.toString()
            : "0",
        runningBalance: newBalance,
        category: ledgerData.category || "general",
        subCategory: ledgerData.subCategory || null,
        paymentMethod: ledgerData.paymentMethod || null,
        orderId: null,
        supplierId: null,
        customerId: null,
        isVerified: true,
        verifiedBy: "admin",
        verifiedAt: now,
        metadata: {},
        transactionDate: now,
        createdAt: now,
        updatedAt: now,
      })
      .select()
      .single();

    if (error) {
      console.error("Ledger creation error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("ledger POST error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
