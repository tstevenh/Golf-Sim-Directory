import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// POST /api/admin/review-claim - Approve or reject claim request
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
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

    const claimRequest = await db.claimRequest.findUnique({
      where: { id: claimRequestId },
      include: {
        venue: true,
        requestedBy: true,
      },
    });

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
      // Approve the claim
      await db.$transaction([
        // Update venue
        db.venue.update({
          where: { id: claimRequest.venueId },
          data: {
            claimed: true,
            claimedById: claimRequest.requestedById,
            claimedAt: new Date(),
          },
        }),
        // Update claim request
        db.claimRequest.update({
          where: { id: claimRequestId },
          data: {
            status: "approved",
            reviewedById: session.user.id,
            reviewedAt: new Date(),
            reviewNotes,
          },
        }),
        // Upgrade user to business_owner
        db.user.update({
          where: { id: claimRequest.requestedById },
          data: { role: "business_owner" },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: "Claim request approved",
      });
    } else if (action === "reject") {
      // Reject the claim
      await db.claimRequest.update({
        where: { id: claimRequestId },
        data: {
          status: "rejected",
          reviewedById: session.user.id,
          reviewedAt: new Date(),
          reviewNotes,
        },
      });

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
