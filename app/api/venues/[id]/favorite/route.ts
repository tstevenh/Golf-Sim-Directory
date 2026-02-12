import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";

// GET /api/venues/[id]/favorite - Fetch current user + favorite state
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    const { id } = await params;

    if (!user?.id) {
      return NextResponse.json({
        authenticated: false,
        user: null,
        favorited: false,
      });
    }

    const { data: existing } = await supabase
      .from("favorites")
      .select("id")
      .eq("userId", user.id)
      .eq("venueId", id)
      .maybeSingle();

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name ?? null,
        role: user.role,
      },
      favorited: Boolean(existing),
    });
  } catch (error) {
    console.error("Error fetching favorite status:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorite status" },
      { status: 500 }
    );
  }
}

// POST /api/venues/[id]/favorite - Toggle favorite
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    const { id } = await params;

    if (!user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: existing } = await supabase
      .from("favorites")
      .select("id")
      .eq("userId", user.id)
      .eq("venueId", id)
      .maybeSingle();

    if (existing) {
      // Remove favorite
      await supabase
        .from("favorites")
        .delete()
        .eq("id", existing.id);
      return NextResponse.json({ favorited: false });
    } else {
      // Add favorite
      await supabase
        .from("favorites")
        .insert({
          userId: user.id,
          venueId: id,
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
