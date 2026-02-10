import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// PATCH /api/venues/[id]/update - Update venue (owner or admin only)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const venue = await db.venue.findUnique({
      where: { id },
    });

    if (!venue) {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 });
    }

    // Check if user owns this venue or is admin
    if (
      venue.claimedById !== session.user.id &&
      session.user.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "You don't have permission to edit this venue" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Update venue (excluding ratings which cannot be edited)
    const updatedVenue = await db.venue.update({
      where: { id },
      data: {
        // Basic
        name: body.name,
        brandName: body.brandName,
        venueType: body.venueType,
        shortDescription: body.shortDescription,
        about: body.about,

        // Location
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,

        // Contact
        phone: body.phone,
        email: body.email,
        website: body.website,
        bookingUrl: body.bookingUrl,
        googleMapsUrl: body.googleMapsUrl,

        // Technology
        launchMonitorType: body.launchMonitorType,
        ballTracking: body.ballTracking,
        clubTracking: body.clubTracking,
        puttingMode: body.puttingMode,
        leftyFriendly: body.leftyFriendly,

        // Facility
        bayCount: body.bayCount,
        hasPrivateRooms: body.hasPrivateRooms,
        privateRoomsCount: body.privateRoomsCount,
        maxGroupSizePerBay: body.maxGroupSizePerBay,
        hours: body.hours,

        // Pricing
        pricingModel: body.pricingModel,
        priceRangeMin: body.priceRangeMin,
        priceRangeMax: body.priceRangeMax,

        // Amenities
        parking: body.parking,
        wifi: body.wifi,
        kidFriendly: body.kidFriendly,
        coachingAvailable: body.coachingAvailable,
        walkInsAllowed: body.walkInsAllowed,

        // Media
        heroImage: body.heroImage,

        // SEO
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,

        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      venue: updatedVenue,
    });
  } catch (error) {
    console.error("Error updating venue:", error);
    return NextResponse.json(
      { error: "Failed to update venue" },
      { status: 500 }
    );
  }
}
