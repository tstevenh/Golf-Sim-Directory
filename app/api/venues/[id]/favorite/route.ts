import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// POST /api/venues/[id]/favorite - Toggle favorite
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
    
    const existing = await db.favorite.findUnique({
      where: {
        userId_venueId: {
          userId: session.user.id,
          venueId: id,
        },
      },
    });
    
    if (existing) {
      // Remove favorite
      await db.favorite.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ favorited: false });
    } else {
      // Add favorite
      await db.favorite.create({
        data: {
          userId: session.user.id,
          venueId: id,
        },
      });
      return NextResponse.json({ favorited: true });
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return NextResponse.json(
      { error: "Failed to toggle favorite" },
      { status: 500 }
    );
  }
}
