import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET /api/venues - Search venues
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const city = searchParams.get("city");
  const state = searchParams.get("state");
  const venueType = searchParams.get("type");
  const query = searchParams.get("q");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  
  const skip = (page - 1) * limit;
  
  const where: any = {
    status: "active",
  };
  
  if (city) where.city = { equals: city, mode: "insensitive" };
  if (state) where.state = { equals: state, mode: "insensitive" };
  if (venueType) where.venueType = venueType;
  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { city: { contains: query, mode: "insensitive" } },
    ];
  }
  
  const [venues, total] = await Promise.all([
    db.venue.findMany({
      where,
      skip,
      take: limit,
      orderBy: [
        { featured: "desc" },
        { ratingOverall: "desc" },
        { name: "asc" },
      ],
      select: {
        id: true,
        slug: true,
        name: true,
        venueType: true,
        city: true,
        state: true,
        heroImage: true,
        shortDescription: true,
        priceRangeMin: true,
        priceRangeMax: true,
        simulatorSystems: true,
        ratingOverall: true,
        featured: true,
        claimed: true,
        tags: true,
        vibeTags: true,
      },
    }),
    db.venue.count({ where }),
  ]);
  
  return NextResponse.json({
    venues,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}

// POST /api/venues - Submit new venue
export async function POST(request: Request) {
  try {
    const session = await auth();
    const body = await request.json();
    
    // Create submission
    const submission = await db.submission.create({
      data: {
        data: body,
        submittedById: session?.user?.id || null,
        status: "pending",
      },
    });
    
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
