import { db } from "@/lib/db";
import { getStateSlug, getStateDisplayName } from "@/lib/states";
import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FeaturedVenues } from "@/components/home/FeaturedVenues";
import { LaunchMonitorComparison } from "@/components/home/LaunchMonitorComparison";
import { PopularCities } from "@/components/home/PopularCities";
import { BusinessCTA } from "@/components/home/BusinessCTA";

export default async function HomePage() {
  // Fetch data with error handling for build time
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let topVenues: any[] = [];
  let totalVenues = 0;
  let totalStates = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let citiesWithCounts: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let statesWithCounts: any[] = [];

  try {
    // Fetch featured venues from database
    topVenues = await db.venue.findMany({
      where: { status: "active", featured: true },
      orderBy: [{ ratingOverall: "desc" }, { name: "asc" }],
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

    // Get states with venue counts
    const statesResult = await db.venue.groupBy({
      by: ["state"],
      where: { status: "active" },
      _count: { id: true },
    });
    totalStates = statesResult.length;

    // Sort states by venue count and format
    statesWithCounts = statesResult
      .sort((a, b) => b._count.id - a._count.id)
      .map((s) => ({
        code: s.state.toLowerCase(),
        name: getStateDisplayName(s.state),
        slug: getStateSlug(s.state),
        count: s._count.id,
      }));

    // Get cities with venue counts for popular cities section
    const citiesResult = await db.venue.groupBy({
      by: ["city", "state"],
      where: { status: "active" },
      _count: { id: true },
    });
    // Sort and limit in memory since take doesn't work with groupBy
    citiesWithCounts = citiesResult.sort((a, b) => b._count.id - a._count.id);
  } catch (error) {
    console.error("Database error during build:", error);
    // Return empty data - page will show fallback UI
  }

  // Transform cities data - top 12 for the section, top 30 for footer
  const popularCities = citiesWithCounts.slice(0, 12).map((city) => ({
    name: city.city,
    stateCode: city.state.toLowerCase(),
    stateSlug: getStateSlug(city.state),
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

  // JSON-LD schemas for homepage
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "GolfSimMap",
    url: "https://golfsimmap.com",
    description: "Find indoor golf simulator venues across the USA. Compare launch monitors, amenities, and book your next session.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://golfsimmap.com/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "GolfSimMap",
    url: "https://golfsimmap.com",
    logo: "https://golfsimmap.com/logo.png",
    sameAs: [],
    description: "The definitive directory for indoor golf simulator venues across the United States.",
  };

  return (
    <div className="min-h-screen bg-deep-black -mt-16 md:-mt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <HeroSection totalVenues={totalVenues} totalStates={totalStates} />
      <HowItWorks />
      <FeaturedVenues venues={featuredVenues} />
      <LaunchMonitorComparison />
      <PopularCities cities={popularCities} states={statesWithCounts.slice(0, 10)} />
      <BusinessCTA />
    </div>
  );
}
