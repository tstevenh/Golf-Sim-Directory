import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// POST /api/venues/[id]/claim - Request to claim venue
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const venue = await db.venue.findUnique({
      where: { id },
    });
    
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
    
    // TODO: Send verification email
    // For now, auto-approve for demo (in production, verify email domain matches venue website)
    
    await db.venue.update({
      where: { id },
      data: {
        claimed: true,
        claimedById: session.user.id,
        claimedAt: new Date(),
      },
    });
    
    // Upgrade user to business_owner if not already
    await db.user.update({
      where: { id: session.user.id },
      data: { role: "business_owner" },
    });
    
    return NextResponse.json({
      success: true,
      message: "Venue claimed successfully",
    });
  } catch (error) {
    console.error("Error claiming venue:", error);
    return NextResponse.json(
      { error: "Failed to claim venue" },
      { status: 500 }
    );
  }
}
