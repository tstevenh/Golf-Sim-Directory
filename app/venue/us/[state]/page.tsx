import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { MapPin, TrendingUp, Building2 } from "lucide-react";
import { CityCard } from "@/components/location/LocationCards";
import { VenueCard } from "@/components/venue/VenueCard";
import { getStateNameFromAbbrev, getStateDisplayName, getStateAbbrevFromName } from "@/lib/states";

interface StatePageProps {
  params: Promise<{
    state: string;
  }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: StatePageProps): Promise<Metadata> {
  try {
    const { state } = await params;
    const stateAbbrev = getStateAbbrevFromName(state) || state.toUpperCase();
    const stateName = getStateDisplayName(stateAbbrev);
    
    const venueCount = await db.venue.count({
      where: {
        state: stateAbbrev.toUpperCase(),
        country: "US",
        status: "active",
      },
    });

    return {
      title: `Golf Simulators in ${stateName} (${venueCount} venues) | GolfSimMap`,
      description: `Find the best indoor golf simulators and screen golf venues in ${stateName}. Compare prices, launch monitors, and book your tee time.`,
    };
  } catch {
    return {
      title: "Golf Simulators by State | GolfSimMap",
      description: "Find indoor golf simulators across the United States.",
    };
  }
}

export async function generateStaticParams() {
  // Return full state names
  return [
    { state: "illinois" },
    { state: "new-york" },
    { state: "california" },
    { state: "texas" },
    { state: "florida" },
  ];
}

export default async function StatePage({ params }: StatePageProps) {
  try {
    const { state } = await params;
    const stateAbbrev = getStateAbbrevFromName(state) || state.toUpperCase();
    const stateName = getStateDisplayName(stateAbbrev);

    // Get all data in parallel
    const [citiesResult, featuredVenues, totalVenues] = await Promise.all([
      db.venue.groupBy({
        by: ["city"],
        where: {
          state: stateAbbrev.toUpperCase(),
          country: "US",
          status: "active",
        },
        _count: { id: true },
      }),
      db.venue.findMany({
        where: {
          state: stateAbbrev.toUpperCase(),
          country: "US",
          status: "active",
          featured: true,
        },
        take: 3,
        orderBy: { ratingOverall: "desc" },
      }),
      db.venue.count({
        where: {
          state: stateAbbrev.toUpperCase(),
          country: "US",
          status: "active",
        },
      }),
    ]);

    // Sort cities by venue count
    const citiesWithVenues = citiesResult.sort((a, b) => b._count.id - a._count.id);

    return (
      <div className="min-h-screen bg-deep-black py-12">
        <div className="absolute inset-0 scorecard-grid opacity-20" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-muted mb-6">
            <Link href="/" className="hover:text-cream transition-colors">Home</Link>
            <span>/</span>
            <Link href="/venue/us" className="hover:text-cream transition-colors">United States</Link>
            <span>/</span>
            <span className="text-cream">{stateName}</span>
          </div>

          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-masters-green" />
              <span className="text-masters-green text-xs font-mono uppercase tracking-widest">
                {totalVenues} Venues
              </span>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-cream mb-2">
                  Golf Simulators in {stateName}
                </h1>
                <p className="text-muted max-w-xl">
                  Discover {totalVenues} indoor golf venues across {citiesWithVenues.length} cities in {stateName}. 
                  Find simulator bars, training facilities, and entertainment centers.
                </p>
              </div>
            </div>
          </div>

          {/* Featured Venues */}
          {featuredVenues.length > 0 && (
            <div className="mb-12">
              <h2 className="text-cream mb-6 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-masters-green" />
                Featured Venues
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {featuredVenues.map((venue) => (
                  <VenueCard
                    key={venue.id}
                    id={venue.id}
                    slug={venue.slug}
                    name={venue.name}
                    city={venue.city}
                    state={venue.state}
                    heroImage={venue.heroImage}
                    shortDescription={venue.shortDescription}
                    venueType={venue.venueType}
                    simulatorSystems={venue.simulatorSystems as string[] | null}
                    launchMonitorType={venue.launchMonitorType}
                    priceRangeMin={venue.priceRangeMin}
                    priceRangeMax={venue.priceRangeMax}
                    ratingOverall={venue.ratingOverall}
                    featured={venue.featured}
                    tags={venue.tags}
                    href={`/venue/us/${state}/${venue.city.toLowerCase().replace(/\s+/g, "-")}/${venue.slug}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Cities Grid */}
          <div className="mb-8">
            <h2 className="text-cream mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-masters-green" />
              Cities in {stateName}
            </h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {citiesWithVenues.map((cityData) => {
                const citySlug = cityData.city.toLowerCase().replace(/\s+/g, "-");
                
                return (
                  <CityCard
                    key={cityData.city}
                    cityName={cityData.city}
                    stateCode={stateAbbrev}
                    venueCount={cityData._count.id}
                    href={`/venue/us/${state}/${citySlug}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Empty state */}
          {citiesWithVenues.length === 0 && (
            <div className="text-center py-16 border border-default">
              <p className="text-muted">No venues found in {stateName}.</p>
              <Link href="/submit" className="text-masters-green hover:text-cream mt-4 inline-block">
                Add the first venue →
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  } catch {
    return (
      <div className="min-h-screen bg-deep-black py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-cream mb-4">State Not Found</h1>
          <p className="text-muted mb-6">We couldn&apos;t load venues for this state.</p>
          <Link href="/venue/us" className="text-masters-green hover:text-cream">
            Browse all states →
          </Link>
        </div>
      </div>
    );
  }
}
