import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/venues/cities?state=CA - Get cities for a state
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get("state");

  if (!state) {
    return NextResponse.json({ cities: [] });
  }

  try {
    const { data: citiesResult } = await supabase.rpc("get_cities_in_state", {
      target_state: state.toUpperCase(),
    });

    // Already sorted by count desc in the RPC function
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
