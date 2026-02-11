import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";

// POST /api/venues/[id]/claim - Request to claim venue
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    const { id } = await params;
    const body = await request.json();

    if (!user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { businessEmail, proofText } = body;

    if (!businessEmail || !proofText) {
      return NextResponse.json(
        { error: "Business email and proof of ownership are required" },
        { status: 400 }
      );
    }

    const { data: venue } = await supabase
      .from("venues")
      .select("id, claimed")
      .eq("id", id)
      .single();

    if (!venue) {
      return NextResponse.json(
        { error: "Venue not found" },
        { status: 404 }
      );
    }

    if (venue.claimed) {
      return NextResponse.json(
        { error: "Venue already claimed" },
        { status: 400 }
      );
    }

    // Check if there's already a pending claim request for this venue
    const { data: existingRequest } = await supabase
      .from("claim_requests")
      .select("id")
      .eq("venueId", id)
      .eq("status", "pending")
      .maybeSingle();

    if (existingRequest) {
      return NextResponse.json(
        { error: "There is already a pending claim request for this venue" },
        { status: 400 }
      );
    }

    // Create claim request for admin review
    const { data: claimRequest, error } = await supabase
      .from("claim_requests")
      .insert({
        venueId: id,
        requestedById: user.id,
        businessEmail,
        proofText,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Claim request submitted. An admin will review it within 24-48 hours.",
      requestId: claimRequest.id,
    });
  } catch (error) {
    console.error("Error submitting claim request:", error);
    return NextResponse.json(
      { error: "Failed to submit claim request" },
      { status: 500 }
    );
  }
}
