import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { revalidateVenuePublicPages } from "@/lib/revalidate-venue";
import { toVenueValue } from "@/lib/correction-values";

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

      // Only write values that fit the venue column. Free-text requests
      // ("Please change the hours to ...") must be applied by hand instead.
      const field = correction.field;
      const parsed = toVenueValue(field, correction.suggestedValue);
      if (!parsed.ok) {
        return NextResponse.json({ error: parsed.error }, { status: 422 });
      }
      const value = parsed.value;

      updateData[field] = value;

      const { data: venueForPaths } = await supabase
        .from("venues")
        .select("state, city, slug")
        .eq("id", correction.venueId)
        .single();

      // Update venue and mark correction as approved (sequential)
      const { error: venueError } = await supabase
        .from("venues")
        .update(updateData)
        .eq("id", correction.venueId);
      if (venueError) throw venueError;

      await supabase
        .from("correction_reports")
        .update({
          status: "approved",
          reviewedById: user.id,
          reviewedAt: new Date().toISOString(),
          reviewNotes: reviewNotes || null,
        })
        .eq("id", correctionId);

      if (venueForPaths?.state && venueForPaths?.city) {
        revalidateVenuePublicPages({
          state: venueForPaths.state,
          city: venueForPaths.city,
          venueSlug: venueForPaths.slug,
        });
      }

      return NextResponse.json({
        success: true,
        message: "Correction approved and venue updated",
      });
    } else if (action === "resolve") {
      // The admin already edited the venue by hand. Close the report without
      // touching the venue.
      await supabase
        .from("correction_reports")
        .update({
          status: "approved",
          reviewedById: user.id,
          reviewedAt: new Date().toISOString(),
          reviewNotes: reviewNotes || "Applied manually",
        })
        .eq("id", correctionId);

      return NextResponse.json({
        success: true,
        message: "Correction marked as resolved",
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
        { error: "Invalid action. Use 'approve', 'resolve' or 'reject'" },
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
