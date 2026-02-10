import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/venues/cities?state=CA - Get cities for a state
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get("state");

  if (!state) {
    return NextResponse.json({ cities: [] });
  }

  try {
    const citiesResult = await db.venue.groupBy({
      by: ["city"],
      where: { 
        state: state.toUpperCase(),
        status: "active",
      },
      _count: { id: true },
    });

    // Sort by venue count (most popular first)
    const cities = citiesResult
      .sort((a, b) => b._count.id - a._count.id)
      .map((c) => c.city);

    return NextResponse.json({ cities }, {
      headers: {
        // Cache for 1 hour - city data changes infrequently
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error("Error fetching cities:", error);
    return NextResponse.json({ cities: [] });
  }
}
