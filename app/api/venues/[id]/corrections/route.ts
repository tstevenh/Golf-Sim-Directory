import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// POST /api/venues/[id]/corrections - Report incorrect info
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    const body = await request.json();
    
    const correction = await db.correctionReport.create({
      data: {
        venueId: id,
        reportedById: session?.user?.id || null,
        field: body.field,
        currentValue: body.currentValue,
        suggestedValue: body.suggestedValue,
        notes: body.notes,
        status: "pending",
      },
    });
    
    return NextResponse.json({
      success: true,
      message: "Correction submitted for review",
      correctionId: correction.id,
    });
  } catch (error) {
    console.error("Error submitting correction:", error);
    return NextResponse.json(
      { error: "Failed to submit correction" },
      { status: 500 }
    );
  }
}
