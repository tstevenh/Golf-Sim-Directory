import { Metadata } from "next";
import Link from "next/link";
import { db, venueCardSelect } from "@/lib/db";
import { MapPin } from "lucide-react";
import { VenueCard, VenueGrid } from "@/components/venue/VenueCard";
import { CitySchema } from "@/components/seo/CitySchema";
import { Pagination } from "@/components/ui/Pagination";
import { CityCategoryLinks } from "@/components/seo/CityCategoryLinks";
import { SeoIndexSections } from "@/components/seo/SeoIndexSections";
import { getStateDisplayName, getStateAbbrevFromName } from "@/lib/states";
import { getCityCategoryBrowseLinksWithCounts } from "@/lib/best-by-data";
import { getCityVibeIndexUrl, getCityWhoItsForIndexUrl, getCityHardwareIndexUrl } from "@/lib/best-by-config";

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
    const cityFormatted = city
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

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
    const cityFormatted = city
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

    const page = Math.max(1, Number(query?.page || 1));
    const pageSize = 12;
    const skip = (page - 1) * pageSize;

    const [venues, totalVenues, nearbyCitiesResult, categoryLinks] = await Promise.all([
      db.venue.findMany({
        where: {
          city: { equals: cityFormatted, mode: "insensitive" },
          state: stateAbbrev.toUpperCase(),
          country: "US",
          status: "active",
        },
        orderBy: [{ featured: "desc" }, { ratingOverall: "desc" }, { name: "asc" }],
        select: venueCardSelect,
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
      getCityCategoryBrowseLinksWithCounts(state, cityFormatted),
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

    // Build related links from categories
    const relatedLinks = [
      ...categoryLinks.vibes.slice(0, 2).map(v => ({ label: `Best ${v.label}`, href: v.href })),
      ...categoryLinks.segments.slice(0, 2).map(s => ({ label: `Best for ${s.label}`, href: s.href })),
      ...categoryLinks.hardware.slice(0, 2).map(h => ({ label: `Best ${h.label}`, href: h.href })),
      { label: "Browse by Vibe", href: getCityVibeIndexUrl(state, cityFormatted) },
      { label: "Browse by Occasion", href: getCityWhoItsForIndexUrl(state, cityFormatted) },
      { label: "Browse by Technology", href: getCityHardwareIndexUrl(state, cityFormatted) },
    ];

    // Build nearby city links
    const nearbyLinks = nearbyCities.map((cityName) => ({
      label: cityName,
      href: `/venue/us/${state}/${cityName.toLowerCase().replace(/\s+/g, "-")}`,
    }));

    return (
      <div className="min-h-screen bg-deep-black py-12">
        <div className="absolute inset-0 scorecard-grid opacity-20" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CitySchema city={cityFormatted} state={stateName} venueCount={totalVenues} />

          {/* Header */}
          <div className="mb-12">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-muted mb-4">
              <Link href="/" className="hover:text-cream transition-colors">Home</Link>
              <span>/</span>
              <Link href="/venue/us" className="hover:text-cream transition-colors">United States</Link>
              <span>/</span>
              <Link href={`/venue/us/${state}`} className="hover:text-cream transition-colors">{stateName}</Link>
              <span>/</span>
              <span className="text-cream">{cityFormatted}</span>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-masters-green" />
              <span className="text-masters-green text-xs font-mono uppercase tracking-widest">
                {totalVenues} Venues
              </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end md:justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="w-6 h-6 text-masters-green" />
                  <h1 className="text-cream">
                    Golf Simulators in {cityFormatted}, {stateName}
                  </h1>
                </div>
                <p className="text-muted max-w-xl">
                  Discover {totalVenues} indoor golf venues in {cityFormatted}. 
                  Compare launch monitors, amenities, and pricing.
                </p>
              </div>
            </div>
          </div>

          {/* Venue Grid */}
          <section>
            <VenueGrid columns={3}>
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
            </VenueGrid>

            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                baseUrl={`/venue/us/${state}/${city}`}
              />
            )}
          </section>

          {/* Browse by Category */}
          <div className="mt-12">
            <CityCategoryLinks
              state={state}
              city={cityFormatted}
              {...categoryLinks}
            />
          </div>

          {/* SEO Content using existing SeoIndexSections */}
          <div className="mt-12">
            <SeoIndexSections
              introTitle={`What to Expect from Golf Simulators in ${cityFormatted}`}
              introDescription={`${cityFormatted} offers ${totalVenues} indoor golf simulator venues for golfers looking to practice, play, or entertain. These venues range from high-end training facilities with professional-grade launch monitors to casual entertainment spots perfect for groups and parties. Most simulator venues feature advanced technology like TrackMan, Foresight, or SkyTrak, providing accurate ball flight data and realistic course simulations. Whether you're a serious golfer looking to work on your game during the off-season, or a beginner wanting to learn in a relaxed environment, ${cityFormatted}'s golf simulator venues have something for everyone.`}
              guidanceTitle="What to Look for in a Simulator Venue"
              guidancePoints={[
                "Launch monitor quality - Look for TrackMan, Foresight, or other professional-grade systems for accurate data",
                "Space and bay size - Ensure the venue has enough room for your swing and comfort",
                "Food and beverage options - Many venues offer full bars and restaurants for a complete experience",
                "Booking flexibility - Check for online booking, membership options, and peak hour availability",
                "Group accommodations - If planning events, look for multiple bays and private rooms",
              ]}
              methodologyTitle="How We Evaluate Venues"
              methodologyDescription="Our rankings combine verified user reviews, on-site assessments, and direct venue data. We evaluate launch monitor accuracy, facility quality, cleanliness, staff knowledge, and overall value. Venues are regularly re-evaluated to ensure our recommendations remain current and accurate."
              faqTitle={`Frequently Asked Questions about ${cityFormatted} Golf Simulators`}
              faqItems={[
                {
                  question: `How much does it cost to use a golf simulator in ${cityFormatted}?`,
                  answer: `Golf simulator pricing in ${cityFormatted} typically ranges from $30-$60 per hour for standard bays, with premium venues charging $60-$100+ per hour. Many locations offer per-person rates, group packages, or membership options that can reduce the cost per session.`,
                },
                {
                  question: "Do I need to bring my own clubs?",
                  answer: "Most golf simulator venues allow you to bring your own clubs, and many golfers prefer to use their own equipment for accuracy. However, some venues also offer club rentals if you're traveling or want to try different equipment.",
                },
                {
                  question: "Are golf simulators good for beginners?",
                  answer: "Yes! Many venues are very beginner-friendly. Simulators provide a relaxed environment to learn without the pressure of a traditional golf course. The immediate feedback from launch monitors can help beginners improve quickly.",
                },
                {
                  question: `Can I book a golf simulator for a corporate event in ${cityFormatted}?`,
                  answer: `Absolutely. Many ${cityFormatted} golf simulator venues specialize in group events and corporate outings. They often offer multiple bay rentals, food and beverage packages, and tournament formats.`,
                },
              ]}
              nearbyTitle={`Other Cities in ${stateName}`}
              nearbyLinks={nearbyLinks}
              relatedTitle="Browse by Category"
              relatedLinks={relatedLinks}
              ctaTitle="Own a Golf Simulator Venue?"
              ctaDescription="Get your venue listed on GolfSimMap and reach more golfers searching for simulator experiences in your area."
              ctaPrimary={{ label: "List Your Venue", href: "/list-venue" }}
              ctaSecondary={{ label: "Learn More", href: "/about" }}
              venueCount={totalVenues}
              showStats={true}
            >
              {/* Empty children - venue grid is already shown above */}
              <></>
            </SeoIndexSections>
          </div>

          {/* Back to state */}
          <div className="mt-12 text-center">
            <Link href={`/venue/us/${state}`} className="text-muted hover:text-cream transition-colors">
              ← Back to {stateName}
            </Link>
          </div>
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
