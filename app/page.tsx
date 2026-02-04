import { db } from "@/lib/db";
import { getStateNameFromAbbrev } from "@/lib/states";
import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FeaturedVenues } from "@/components/home/FeaturedVenues";
import { LaunchMonitorComparison } from "@/components/home/LaunchMonitorComparison";
import { PopularCities } from "@/components/home/PopularCities";
import { BusinessCTA } from "@/components/home/BusinessCTA";

export default async function HomePage() {
  // Fetch data with error handling for build time
  let topVenues: any[] = [];
  let totalVenues = 0;
  let totalStates = 0;
  let citiesWithCounts: any[] = [];

  try {
    // Fetch top-rated venues from database
    topVenues = await db.venue.findMany({
      where: { status: "active" },
      orderBy: [{ ratingOverall: "desc" }, { featured: "desc" }],
      take: 6,
      select: {
        id: true,
        slug: true,
        name: true,
        city: true,
        state: true,
        heroImage: true,
        shortDescription: true,
        venueType: true,
        simulatorSystems: true,
        launchMonitorType: true,
        priceRangeMin: true,
        priceRangeMax: true,
        ratingOverall: true,
        featured: true,
        tags: true,
        vibeTags: true,
      },
    });

    // Get total venue count for stats
    totalVenues = await db.venue.count({ where: { status: "active" } });

    // Get unique states count
    const statesResult = await db.venue.groupBy({
      by: ["state"],
      where: { status: "active" },
    });
    totalStates = statesResult.length;

    // Get cities with venue counts for popular cities section
    const citiesResult = await db.venue.groupBy({
      by: ["city", "state"],
      where: { status: "active" },
      _count: { id: true },
    });
    // Sort and limit in memory since take doesn't work with groupBy
    citiesWithCounts = citiesResult
      .sort((a, b) => b._count.id - a._count.id)
      .slice(0, 12);
  } catch (error) {
    console.error("Database error during build:", error);
    // Return empty data - page will show fallback UI
  }

  // Transform cities data
  const popularCities = citiesWithCounts.map((city) => ({
    name: city.city,
    stateCode: city.state.toLowerCase(),
    stateSlug: getStateNameFromAbbrev(city.state.toLowerCase()) || city.state.toLowerCase(),
    slug: city.city.toLowerCase().replace(/\s+/g, "-"),
    venueCount: city._count.id,
  }));

  // Transform venues for the featured section
  const featuredVenues = topVenues.map((venue) => ({
    id: venue.id,
    slug: venue.slug,
    name: venue.name,
    city: venue.city,
    state: venue.state,
    heroImage: venue.heroImage,
    shortDescription: venue.shortDescription,
    venueType: venue.venueType,
    simulatorSystems: venue.simulatorSystems as string[] | null,
    launchMonitorType: venue.launchMonitorType,
    priceRangeMin: venue.priceRangeMin,
    priceRangeMax: venue.priceRangeMax,
    ratingOverall: venue.ratingOverall,
    featured: venue.featured,
    tags: venue.tags,
    vibeTags: venue.vibeTags,
  }));

  return (
    <main className="min-h-screen bg-deep-black">
      <HeroSection totalVenues={totalVenues} totalStates={totalStates} />
      <HowItWorks />
      <FeaturedVenues venues={featuredVenues} />
      <LaunchMonitorComparison />
      <PopularCities cities={popularCities} />
      <BusinessCTA />
    </main>
  );
}
