import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { VenueType, LaunchMonitorType, PricingModel, ParkingType } from "@prisma/client";
import { extractHardwareBrandsFromSimulatorSystems } from "@/lib/hardware-brands";
import { extractSoftwareSlugsFromSubmissionData } from "@/lib/software-slugs";

// Helper to create URL-friendly slug
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 50);
}

// POST /api/admin/approve-submission - Convert submission to venue
export async function POST(request: Request) {
  try {
    // Check auth - only admins should access this
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { submissionId } = await request.json();

    // Get the submission
    const submission = await db.submission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    if (submission.status !== "pending") {
      return NextResponse.json(
        { error: "Submission already processed" },
        { status: 400 }
      );
    }

    // Parse submission data
    const data = submission.data as Record<string, unknown>;
    const simulatorSystems = (data.simulatorSystems as object) || null;
    const hardwareBrands = extractHardwareBrandsFromSimulatorSystems(simulatorSystems);
    const softwareSlugs = extractSoftwareSlugsFromSubmissionData(data);

    // Generate slug from name
    const name = (data.name as string) || "Untitled Venue";
    const baseSlug = slugify(name);

    // Check for existing slugs with single query instead of N+1 loop
    const existingSlugs = await db.venue.findMany({
      where: {
        slug: {
          startsWith: baseSlug
        }
      },
      select: { slug: true },
    });

    // Generate unique slug
    let slug = baseSlug;
    if (existingSlugs.length > 0) {
      const existingSlugSet = new Set(existingSlugs.map(v => v.slug));
      let counter = 1;
      while (existingSlugSet.has(`${baseSlug}-${counter}`)) {
        counter++;
      }
      slug = `${baseSlug}-${counter}`;
    }

    // Create the venue
    const venue = await db.venue.create({
      data: {
        slug,
        name,
        brandName: (data.brandName as string) || null,
        address: (data.address as string) || "",
        city: (data.city as string) || "",
        state: (data.state as string) || "",
        zipCode: (data.zipCode as string) || "",
        country: "US",
        // TODO: Update schema to allow nullable coordinates (0,0 is Gulf of Guinea - not ideal default)
        // For now using 0 as schema requires non-null Float
        latitude: 0,
        longitude: 0,
        phone: (data.phone as string) || null,
        email: (data.email as string) || null,
        website: (data.website as string) || null,
        bookingUrl: (data.bookingUrl as string) || null,
        about: (data.about as string) || null,
        venueType: (data.venueType as VenueType) || "other",
        simulatorSystems,
        hardwareBrands,
        softwareSlugs,
        launchMonitorType: (data.launchMonitorType as LaunchMonitorType) || "unknown",
        ballTracking: (data.ballTracking as boolean) || false,
        clubTracking: (data.clubTracking as boolean) || false,
        puttingMode: (data.puttingMode as string) || null,
        leftyFriendly: (data.leftyFriendly as boolean) || false,
        bayCount: data.bayCount ? parseInt(data.bayCount as string) : null,
        hasPrivateRooms: (data.hasPrivateRooms as boolean) || false,
        privateRoomsCount: data.privateRoomsCount ? parseInt(data.privateRoomsCount as string) : null,
        maxGroupSizePerBay: data.maxGroupSizePerBay ? parseInt(data.maxGroupSizePerBay as string) : null,
        pricingModel: (data.pricingModel as PricingModel) || "unknown",
        priceRangeMin: data.priceRangeMin ? parseInt(data.priceRangeMin as string) : null,
        priceRangeMax: data.priceRangeMax ? parseInt(data.priceRangeMax as string) : null,
        foodAndDrink: data.foodAndDrink as object || null,
        parking: (data.parking as ParkingType) || "unknown",
        wifi: (data.wifi as boolean) || false,
        kidFriendly: (data.kidFriendly as boolean) || false,
        coachingAvailable: (data.coachingAvailable as boolean) || false,
        vibeTags: (data.vibeTags as string[]) || [],
        whoItsFor: (data.whoItsFor as string[]) || [],
        accessibility: (data.accessibility as string[]) || [],
        hours: (data.hours as string) || null,
        walkInsAllowed: (data.walkInsAllowed as boolean) !== false,
        heroImage: (data.heroImage as string) || null,
        status: "active",
        dataSource: "owner_submitted",
        verificationLevel: "partially_verified",
      },
    });

    // Update submission status
    await db.submission.update({
      where: { id: submissionId },
      data: { 
        status: "approved",
        venueId: venue.id,
      },
    });

    return NextResponse.json({
      success: true,
      venueId: venue.id,
      slug: venue.slug,
    });
  } catch (error) {
    console.error("Error approving submission:", error);
    return NextResponse.json(
      { error: "Failed to approve submission" },
      { status: 500 }
    );
  }
}
