import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { MapPin, TrendingUp } from "lucide-react";
import { VenueCard } from "@/components/venue/VenueCard";
import { CityCard } from "@/components/location/LocationCards";
import { getStateDisplayName, getStateAbbrevFromName } from "@/lib/states";

interface CityPageProps {
  params: Promise<{
    state: string;
    city: string;
  }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  try {
    const { state, city } = await params;
    const stateAbbrev = getStateAbbrevFromName(state) || state.toUpperCase();
    const stateName = getStateDisplayName(stateAbbrev);
    const cityFormatted = city.replace(/-/g, " ");
    
    const venueCount = await db.venue.count({
      where: {
        city: { equals: cityFormatted, mode: "insensitive" },
        state: stateAbbrev.toUpperCase(),
        country: "US",
        status: "active",
      },
    });

    return {
      title: `Golf Simulators in ${cityFormatted}, ${stateName} (${venueCount} venues) | GolfSimMap`,
      description: `Find the best indoor golf simulators in ${cityFormatted}, ${stateName}. Compare venues, prices, and launch monitors.`,
    };
  } catch {
    return {
      title: "Golf Simulators | GolfSimMap",
      description: "Find indoor golf simulators and screen golf venues.",
    };
  }
}

export async function generateStaticParams() {
  // Return full state names and cities
  return [
    { state: "illinois", city: "chicago" },
    { state: "new-york", city: "new-york" },
    { state: "california", city: "los-angeles" },
    { state: "texas", city: "dallas" },
    { state: "texas", city: "austin" },
    { state: "florida", city: "miami" },
  ];
}

export default async function CityPage({ params }: CityPageProps) {
  try {
    const { state, city } = await params;
    const stateAbbrev = getStateAbbrevFromName(state) || state.toUpperCase();
    const stateName = getStateDisplayName(stateAbbrev);
    const cityFormatted = city.replace(/-/g, " ");

    // Get all venues in this city
    const venues = await db.venue.findMany({
      where: {
        city: { equals: cityFormatted, mode: "insensitive" },
        state: stateAbbrev.toUpperCase(),
        country: "US",
        status: "active",
      },
      orderBy: [
        { featured: "desc" },
        { ratingOverall: "desc" },
        { name: "asc" },
      ],
    });

    if (venues.length === 0) {
      return (
        <div className="min-h-screen bg-deep-black py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-cream mb-4">No Venues Found</h1>
            <p className="text-muted mb-6">
              We couldn&apos;t find any venues in {cityFormatted}, {stateName}.
            </p>
            <Link href={`/venue/us/${state}`} className="text-masters-green hover:text-cream">
              ← Back to {stateName}
            </Link>
          </div>
        </div>
      );
    }

    // Get nearby cities in the same state
    const nearbyCitiesResult = await db.venue.findMany({
      where: {
        state: stateAbbrev.toUpperCase(),
        country: "US",
        status: "active",
        city: { not: cityFormatted },
      },
      select: { city: true },
      distinct: ["city"],
      take: 6,
    });

    const nearbyCities = nearbyCitiesResult.map(c => c.city);

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
            <Link href={`/venue/us/${state}`} className="hover:text-cream transition-colors">{stateName}</Link>
            <span>/</span>
            <span className="text-cream">{cityFormatted}</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-px bg-masters-green" />
              <span className="text-masters-green text-xs font-mono uppercase tracking-widest">
                {venues.length} Venue{venues.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-6 h-6 text-masters-green" />
              <h1 className="text-cream">
                Golf Simulators in {cityFormatted}, {stateName}
              </h1>
            </div>
            
            <p className="text-muted max-w-2xl">
              Discover {venues.length} indoor golf venues, simulator bars, and training facilities in {cityFormatted}. 
              Compare launch monitors, pricing, and amenities.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="stat-cell">
              <span className="block text-2xl font-mono font-bold text-cream">{venues.length}</span>
              <span className="text-xs text-muted uppercase tracking-wider">Venues</span>
            </div>
            <div className="stat-cell">
              <span className="block text-2xl font-mono font-bold text-cream">
                {new Set(venues.map(v => v.venueType)).size}
              </span>
              <span className="text-xs text-muted uppercase tracking-wider">Types</span>
            </div>
            <div className="stat-cell">
              <span className="block text-2xl font-mono font-bold text-masters-green">
                <TrendingUp className="w-6 h-6" />
              </span>
              <span className="text-xs text-muted uppercase tracking-wider">Updated</span>
            </div>
          </div>

          {/* Venues List */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {venues.map((venue) => (
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
                href={`/venue/us/${state}/${city}/${venue.slug}`}
              />
            ))}
          </div>

          {/* Nearby Cities */}
          {nearbyCities.length > 0 && (
            <div className="pt-8 border-t border-default">
              <h2 className="text-cream mb-4">Nearby Cities in {stateName}</h2>
              <div className="flex flex-wrap gap-2">
                {nearbyCities.map((cityName) => (
                  <Link
                    key={cityName}
                    href={`/venue/us/${state}/${cityName.toLowerCase().replace(/\s+/g, "-")}`}
                    className="px-4 py-2 border border-default text-cream-subtle hover:border-masters-green hover:text-cream transition-colors"
                  >
                    {cityName}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error("City page error:", error);
    return (
      <div className="min-h-screen bg-deep-black py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-cream mb-4">Something Went Wrong</h1>
          <p className="text-muted mb-6">We couldn&apos;t load this page. Please try again later.</p>
          <Link href="/venue/us" className="text-masters-green hover:text-cream">
            Browse all states →
          </Link>
        </div>
      </div>
    );
  }
}
