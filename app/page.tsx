import { Metadata } from "next";
import { getStateSlug, getStateDisplayName } from "@/lib/states";
import {
  getCachedFeaturedVenues,
  getCachedTotalActiveVenueCount,
  getCachedStateVenueCounts,
  getCachedCityVenueCounts,
} from "@/lib/cached-queries";
import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FeaturedVenues } from "@/components/home/FeaturedVenues";
import { LaunchMonitorComparison } from "@/components/home/LaunchMonitorComparison";
import { PopularCities } from "@/components/home/PopularCities";
import { BusinessCTA } from "@/components/home/BusinessCTA";

export const metadata: Metadata = {
  title: "GolfSimMap — Find Indoor Golf Simulators Near You",
  description:
    "Discover 3,870+ indoor golf simulator venues across the US. Compare launch monitors, pricing, amenities, and book your next session.",
  alternates: {
    canonical: "https://golfsimmap.com",
  },
  openGraph: {
    title: "GolfSimMap — Find Indoor Golf Simulators Near You",
    description: "Discover 3,870+ indoor golf simulator venues across the US. Compare launch monitors, pricing, amenities, and book your next session.",
    type: "website",
    url: "https://golfsimmap.com",
  },
};

export default async function HomePage() {
  // Fetch data via cached wrappers (shared across builds + ISR)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let topVenues: any[] = [];
  let totalVenues = 0;
  let totalStates = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let citiesWithCounts: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let statesWithCounts: any[] = [];

  try {
    const [featuredData, venueCount, statesResult, citiesResult] = await Promise.all([
      getCachedFeaturedVenues(9),
      getCachedTotalActiveVenueCount(),
      getCachedStateVenueCounts(),
      getCachedCityVenueCounts(30),
    ]);

    topVenues = featuredData;
    totalVenues = venueCount;

    if (statesResult) {
      totalStates = statesResult.length;
      statesWithCounts = statesResult.map((s: { state: string; count: number }) => ({
        code: s.state.toLowerCase(),
        name: getStateDisplayName(s.state),
        slug: getStateSlug(s.state),
        count: s.count,
      }));
    }

    citiesWithCounts = citiesResult || [];
  } catch (error) {
    console.error("Database error during build:", error);
  }

  // Transform cities data - top 12 for the section, top 30 for footer
  const popularCities = citiesWithCounts.slice(0, 12).map((city: { city: string; state: string; count: number }) => ({
    name: city.city,
    stateCode: city.state.toLowerCase(),
    stateSlug: getStateSlug(city.state),
    slug: city.city.toLowerCase().replace(/\s+/g, "-"),
    venueCount: city.count,
  }));

  // Transform venues for the featured section
  const featuredVenues = topVenues.map((venue) => ({
    id: venue.id,
    slug: venue.slug,
    name: venue.name,
    city: venue.city,
    state: venue.state,
    heroImage: venue.heroImage,
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
