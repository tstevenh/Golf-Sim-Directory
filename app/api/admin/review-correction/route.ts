import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";

// POST /api/admin/review-correction - Approve or reject a correction report
export async function POST(request: Request) {
  try {
    const user = await getUser();

    if (!user?.id || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { correctionId, action, reviewNotes } = body;

    if (!correctionId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the correction report
    const { data: correction } = await supabase
      .from("correction_reports")
      .select("*")
      .eq("id", correctionId)
      .single();

    if (!correction) {
      return NextResponse.json(
        { error: "Correction report not found" },
        { status: 404 }
      );
    }

    if (correction.status !== "pending") {
      return NextResponse.json(
        { error: "This correction has already been reviewed" },
        { status: 400 }
      );
    }

    if (action === "approve") {
      // Build the update data object dynamically
      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      // Map the field to the correct value type
      const field = correction.field;
      let value: unknown = correction.suggestedValue;

      // Type conversion based on field
      if (field === "bayCount" || field === "priceRangeMin" || field === "priceRangeMax" || field === "privateRoomsCount" || field === "maxGroupSizePerBay") {
        value = parseInt(correction.suggestedValue, 10);
        if (isNaN(value as number)) {
          return NextResponse.json(
            { error: `Invalid number value for ${field}` },
            { status: 400 }
          );
        }
      } else if (field === "latitude" || field === "longitude") {
        value = parseFloat(correction.suggestedValue);
        if (isNaN(value as number)) {
          return NextResponse.json(
            { error: `Invalid float value for ${field}` },
            { status: 400 }
          );
        }
      } else if (field === "ballTracking" || field === "clubTracking" || field === "hasPrivateRooms" || field === "leftyFriendly" || field === "wifi" || field === "kidFriendly" || field === "coachingAvailable" || field === "walkInsAllowed" || field === "claimed" || field === "featured") {
        value = correction.suggestedValue.toLowerCase() === "true";
      }

      updateData[field] = value;

      // Update venue and mark correction as approved (sequential)
      await supabase
        .from("venues")
        .update(updateData)
        .eq("id", correction.venueId);

      await supabase
        .from("correction_reports")
        .update({
          status: "approved",
          reviewedById: user.id,
          reviewedAt: new Date().toISOString(),
          reviewNotes: reviewNotes || null,
        })
        .eq("id", correctionId);

      return NextResponse.json({
        success: true,
        message: "Correction approved and venue updated",
      });
    } else if (action === "reject") {
      // Just mark as rejected
      await supabase
        .from("correction_reports")
        .update({
          status: "rejected",
          reviewedById: user.id,
          reviewedAt: new Date().toISOString(),
          reviewNotes: reviewNotes || null,
        })
        .eq("id", correctionId);

      return NextResponse.json({
        success: true,
        message: "Correction rejected",
      });
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'approve' or 'reject'" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error reviewing correction:", error);
    return NextResponse.json(
      { error: "Failed to review correction" },
      { status: 500 }
    );
  }
}
