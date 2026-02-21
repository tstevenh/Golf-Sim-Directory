import { NextResponse } from "next/server";
import { getCachedCitiesInState } from "@/lib/cached-queries";

// GET /api/venues/cities?state=CA - Get cities for a state
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get("state");

  if (!state) {
    return NextResponse.json({ cities: [] });
  }

  try {
    const citiesResult = await getCachedCitiesInState(state.toUpperCase());
    const cities = (citiesResult || []).map((c: { city: string }) => c.city);

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
