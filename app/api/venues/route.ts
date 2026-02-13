import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { VenueType } from "@/lib/supabase";
import { getUser } from "@/lib/auth";

const API_VENUE_FIELDS = "id,slug,name,venueType,city,state,heroImage,priceRangeMin,priceRangeMax,simulatorSystems,ratingOverall,featured,claimed,tags,vibeTags";

// GET /api/venues - Search venues
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const city = searchParams.get("city");
  const state = searchParams.get("state");
  const venueType = searchParams.get("type");
  const query = searchParams.get("q");
  const page = parseInt(searchParams.get("page") || "1");
  // Cap limit at 50 to prevent excessive data transfer
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

  const skip = (page - 1) * limit;

  // Build data query
  let dataQuery = supabase
    .from("venues")
    .select(API_VENUE_FIELDS)
    .eq("status", "active");

  // Build count query
  let countQuery = supabase
    .from("venues")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  if (city) {
    dataQuery = dataQuery.ilike("city", city);
    countQuery = countQuery.ilike("city", city);
  }
  if (state) {
    dataQuery = dataQuery.ilike("state", state);
    countQuery = countQuery.ilike("state", state);
  }
  if (venueType) {
    dataQuery = dataQuery.eq("venueType", venueType as VenueType);
    countQuery = countQuery.eq("venueType", venueType as VenueType);
  }
  if (query) {
    const filter = `name.ilike.%${query}%,city.ilike.%${query}%`;
    dataQuery = dataQuery.or(filter);
    countQuery = countQuery.or(filter);
  }

  const [{ data: venues }, { count: total }] = await Promise.all([
    dataQuery
      .order("featured", { ascending: false })
      .order("ratingOverall", { ascending: false, nullsFirst: false })
      .order("name", { ascending: true })
      .range(skip, skip + limit - 1),
    countQuery,
  ]);

  return NextResponse.json({
    venues: venues || [],
    pagination: {
      page,
      limit,
      total: total ?? 0,
      pages: Math.ceil((total ?? 0) / limit),
    },
  }, {
    headers: {
      // Cache for 5 minutes, allow stale for 1 hour while revalidating
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
    },
  });
}

// POST /api/venues - Submit new venue
export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json(
        { error: "Please log in to submit a venue" },
        { status: 401 }
      );
    }
    if (user.role !== "business_owner") {
      return NextResponse.json(
        { error: "Only business owners can submit venues" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Create submission
    const { data: submission, error } = await supabase
      .from("submissions")
      .insert({
        data: body,
        submittedById: user.id,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Venue submitted for review",
      submissionId: submission.id,
    });
  } catch (error) {
    console.error("Error submitting venue:", error);
    return NextResponse.json(
      { error: "Failed to submit venue" },
      { status: 500 }
    );
  }
}
