import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { MapPin } from "lucide-react";
import { VenueCard, VenueGrid } from "@/components/venue/VenueCard";
import { SeoIndexSections } from "@/components/seo/SeoIndexSections";
import { CitySchema } from "@/components/seo/CitySchema";
import { CityPageHero } from "@/components/seo/PageHero";
import { getStateDisplayName, getStateAbbrevFromName } from "@/lib/states";

interface CityPageProps {
  params: Promise<{
    state: string;
    city: string;
  }>;
  searchParams?: Promise<{ page?: string }>;
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
      description: `Find indoor golf simulators in ${cityFormatted}, ${stateName}. Compare launch monitors, amenities, and book your next session.`,
    };
  } catch {
    return {
      title: "Golf Simulators | GolfSimMap",
      description: "Find indoor golf simulators and screen golf venues.",
    };
  }
}

export async function generateStaticParams() {
  return [
    { state: "illinois", city: "chicago" },
    { state: "new-york", city: "new-york" },
    { state: "california", city: "los-angeles" },
    { state: "texas", city: "dallas" },
    { state: "texas", city: "austin" },
    { state: "florida", city: "miami" },
  ];
}

export default async function CityPage({ params, searchParams }: CityPageProps) {
  try {
    const { state, city } = await params;
    const query = await searchParams;
    const stateAbbrev = getStateAbbrevFromName(state) || state.toUpperCase();
    const stateName = getStateDisplayName(stateAbbrev);
    const cityFormatted = city.replace(/-/g, " ");

    const page = Math.max(1, Number(query?.page || 1));
    const pageSize = 12;
    const skip = (page - 1) * pageSize;

    const [venues, totalVenues, nearbyCitiesResult] = await Promise.all([
      db.venue.findMany({
        where: {
          city: { equals: cityFormatted, mode: "insensitive" },
          state: stateAbbrev.toUpperCase(),
          country: "US",
          status: "active",
        },
        orderBy: [{ featured: "desc" }, { ratingOverall: "desc" }, { name: "asc" }],
        take: pageSize,
        skip,
      }),
      db.venue.count({
        where: {
          city: { equals: cityFormatted, mode: "insensitive" },
          state: stateAbbrev.toUpperCase(),
          country: "US",
          status: "active",
        },
      }),
      db.venue.findMany({
        where: {
          state: stateAbbrev.toUpperCase(),
          country: "US",
          status: "active",
          city: { not: cityFormatted },
        },
        select: { city: true },
        distinct: ["city"],
        take: 6,
      }),
    ]);

    if (totalVenues === 0) {
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

    const totalPages = Math.ceil(totalVenues / pageSize);
    const nearbyCities = nearbyCitiesResult.map((c) => c.city);

    const nearbyLinks = nearbyCities.map((cityName) => ({
      label: `Golf simulators in ${cityName}`,
      href: `/venue/us/${state}/${cityName.toLowerCase().replace(/\s+/g, "-")}`,
    }));

    const relatedLinks = [
      { label: `Best date night spots in ${cityFormatted}`, href: `/venue/us/${state}/${city}/best/date-night` },
      { label: `Best family-friendly venues in ${cityFormatted}`, href: `/venue/us/${state}/${city}/best/who-its-for/families` },
      { label: `Best Trackman venues in ${cityFormatted}`, href: `/venue/us/${state}/${city}/best/hardware/trackman` },
      { label: `Best sports-bar vibes in ${cityFormatted}`, href: `/venue/us/${state}/${city}/best/vibe/sports_bar` },
    ];

    const faqItems = [
      {
        question: `How many golf simulator venues are in ${cityFormatted}?`,
        answer: `There are ${totalVenues} active venues in ${cityFormatted}, including simulator bars, training studios, and private rental facilities.`,
      },
      {
        question: `What should I look for when booking in ${cityFormatted}?`,
        answer: "Check launch monitor type, bay count, and booking links. Evening slots fill quickly in popular cities, so reserving ahead helps.",
      },
      {
        question: `Are there venues with food and drinks in ${cityFormatted}?`,
        answer: "Many listings include food and drink options. Use the tags and amenities sections to filter for full-bar or dining experiences.",
      },
      {
        question: `Can I submit a new venue in ${cityFormatted}?`,
        answer: "Yes. Use the submit form to add a new listing. Submissions are reviewed before publishing.",
      },
    ];

    return (
      <div className="min-h-screen bg-deep-black py-12">
        <div className="absolute inset-0 scorecard-grid opacity-20" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CitySchema city={cityFormatted} state={stateName} venueCount={totalVenues} />

          {/* City Hero Section */}
          <CityPageHero
            city={cityFormatted}
            state={stateName}
            venueCount={totalVenues}
            breadcrumbs={[
              { label: "Home", href: "/" },
              { label: "United States", href: "/venue/us" },
              { label: stateName, href: `/venue/us/${state}` },
              { label: cityFormatted, href: `/venue/us/${state}/${city}`, current: true },
            ]}
            topTags={["sim-bar", "date-night", "corporate-events", "family-friendly"]}
          />

          <SeoIndexSections
            introTitle={`Why ${cityFormatted} golfers use GolfSimMap`}
            introDescription={`We track ${totalVenues} venues in ${cityFormatted} so you can compare launch monitors, amenities, and pricing styles in one place.`}
            guidanceTitle={`Tips for booking in ${cityFormatted}`}
            guidancePoints={[
              "Filter by launch monitor type if you care about data accuracy.",
              "Use tags to find date-night venues, training studios, or family-friendly options.",
              "Check booking links early for evenings and weekends.",
            ]}
            methodologyTitle="How we rank venues"
            methodologyDescription="Listings are ordered by featured status, rating, and data completeness. We prioritize venues with verified details and recent updates." 
            faqTitle={`FAQs about golf simulators in ${cityFormatted}`}
            faqItems={faqItems}
            nearbyTitle={`Nearby cities around ${cityFormatted}`}
            nearbyLinks={nearbyLinks}
            relatedTitle="Related best-by pages"
            relatedLinks={relatedLinks}
            ctaTitle="Own a venue in this city?"
            ctaDescription="Claim your listing to verify details, update photos, and attract golfers searching in this area."
            ctaPrimary={{ label: "Claim a listing", href: "/claim" }}
            ctaSecondary={{ label: "Submit a venue", href: "/submit" }}
            venueCount={totalVenues}
            showStats={true}
          >
            <section>
              <VenueGrid columns={3}>
                {venues.map((venue, index) => (
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
                    rank={index + 1}
                    showRank={index < 5}
                  />
                ))}
              </VenueGrid>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-10">
                  {Array.from({ length: totalPages }).map((_, index) => {
                    const pageNumber = index + 1;
                    const href = `/venue/us/${state}/${city}?page=${pageNumber}`;
                    const isActive = pageNumber === page;
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={`min-w-[44px] min-h-[44px] flex items-center justify-center border text-sm transition-colors rounded-lg ${isActive ? "border-masters-green bg-masters-green/10 text-cream" : "border-default text-cream-subtle hover:border-masters-green hover:text-cream"}`}
                      >
                        {pageNumber}
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          </SeoIndexSections>
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
