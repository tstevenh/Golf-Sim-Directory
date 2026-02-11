import { NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { getUser } from "@/lib/auth";

// POST /api/admin/review-claim - Approve or reject claim request
export async function POST(request: Request) {
  try {
    const user = await getUser();

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { claimRequestId, action, reviewNotes } = await request.json();

    if (!claimRequestId || !action) {
      return NextResponse.json(
        { error: "Claim request ID and action are required" },
        { status: 400 }
      );
    }

    const { data: claimRequest } = await supabase
      .from("claim_requests")
      .select("*")
      .eq("id", claimRequestId)
      .single();

    if (!claimRequest) {
      return NextResponse.json(
        { error: "Claim request not found" },
        { status: 404 }
      );
    }

    if (claimRequest.status !== "pending") {
      return NextResponse.json(
        { error: "Claim request already reviewed" },
        { status: 400 }
      );
    }

    if (action === "approve") {
      const now = new Date().toISOString();

      // Approve the claim (sequential operations instead of $transaction)
      // Update venue
      await supabase
        .from("venues")
        .update({
          claimed: true,
          claimedById: claimRequest.requestedById,
          claimedAt: now,
        })
        .eq("id", claimRequest.venueId);

      // Update claim request
      await supabase
        .from("claim_requests")
        .update({
          status: "approved",
          reviewedById: user.id,
          reviewedAt: now,
          reviewNotes,
        })
        .eq("id", claimRequestId);

      // Upgrade user to business_owner in public.users and auth.users metadata
      await supabase
        .from("users")
        .update({ role: "business_owner" })
        .eq("id", claimRequest.requestedById);

      await supabaseAdmin.auth.admin.updateUserById(claimRequest.requestedById, {
        app_metadata: { role: "business_owner" },
      });

      return NextResponse.json({
        success: true,
        message: "Claim request approved",
      });
    } else if (action === "reject") {
      // Reject the claim
      await supabase
        .from("claim_requests")
        .update({
          status: "rejected",
          reviewedById: user.id,
          reviewedAt: new Date().toISOString(),
          reviewNotes,
        })
        .eq("id", claimRequestId);

      return NextResponse.json({
        success: true,
        message: "Claim request rejected",
      });
    } else {
      return NextResponse.json(
        { error: "Invalid action. Must be 'approve' or 'reject'" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error reviewing claim request:", error);
    return NextResponse.json(
      { error: "Failed to review claim request" },
      { status: 500 }
    );
  }
}
