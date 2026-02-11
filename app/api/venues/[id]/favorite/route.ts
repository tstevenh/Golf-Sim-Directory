import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUser } from "@/lib/auth";

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
