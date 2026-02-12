import { Metadata } from "next";
import Link from "next/link";
import { supabase, VENUE_CARD_FIELDS } from "@/lib/supabase";
import { getCachedNearbyCities } from "@/lib/cached-queries";
import {
  getCityVenueCountFromSnapshot,
  getCityVenuesPageFromSnapshot,
  readVenueSnapshot,
} from "@/lib/build-venues-cache";
import { MapPin } from "lucide-react";
import { VenueCard, VenueGrid } from "@/components/venue/VenueCard";
import { CitySchema } from "@/components/seo/CitySchema";
import { Pagination } from "@/components/ui/Pagination";
import { CityCategoryLinks } from "@/components/seo/CityCategoryLinks";
import { SeoIndexSections } from "@/components/seo/SeoIndexSections";
import { getStateDisplayName, getStateAbbrevFromName } from "@/lib/states";
import { getStaticRelatedLinks } from "@/lib/category-config.generated";
import { getCityVibeIndexUrl, getCityWhoItsForIndexUrl, getCityHardwareIndexUrl } from "@/lib/best-by-config";
import { getCityCategoryBrowseLinksWithCounts } from "@/lib/best-by-data";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { getVenueHref } from "@/lib/venue-url";

interface CityPageProps {
  params: Promise<{
    state: string;
    city: string;
  }>;
}

export const revalidate = 86400;

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  try {
    const { state, city } = await params;
    const stateAbbrev = getStateAbbrevFromName(state) || state.toUpperCase();
    const cityFormatted = city
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

    const snapshot = readVenueSnapshot();
    const venueCount = snapshot
      ? getCityVenueCountFromSnapshot(stateAbbrev.toUpperCase(), cityFormatted)
      : (
          await supabase
            .from("venues")
            .select("*", { count: "exact", head: true })
            .ilike("city", cityFormatted)
            .eq("state", stateAbbrev.toUpperCase())
            .eq("country", "US")
            .eq("status", "active")
        ).count || 0;

    return {
      title: `${venueCount} Best Golf Simulators in ${cityFormatted}, ${stateAbbrev.toUpperCase()}`,
      description: `Compare the top indoor golf simulators in ${cityFormatted}. See launch monitors, pricing, hours, and reviews. Book your session online today.`,
      alternates: {
        canonical: `https://golfsimmap.com/venue/us/${state}/${city}`,
      },
      openGraph: {
        title: `${venueCount} Best Golf Simulators in ${cityFormatted}, ${stateAbbrev.toUpperCase()}`,
        description: `Compare the top indoor golf simulators in ${cityFormatted}. See launch monitors, pricing, hours, and reviews. Book your session online today.`,
        type: "website",
        url: `https://golfsimmap.com/venue/us/${state}/${city}`,
      },
    };
  } catch {
    return {
      title: "Golf Simulators Near You",
      description: "Find indoor golf simulators and screen golf venues near you.",
    };
  }
}

export default async function CityPage({ params }: CityPageProps) {
  try {
    const { state, city } = await params;
    const stateAbbrev = getStateAbbrevFromName(state) || state.toUpperCase();
    const stateName = getStateDisplayName(stateAbbrev);
    const cityFormatted = city
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

    const pageSize = 12;
    const currentPage = 1;

    const snapshot = readVenueSnapshot();
    const [{ venues, hasNextPage }, nearbyCitiesRaw, cityCategoryLinks] = await Promise.all([
      snapshot
        ? Promise.resolve(getCityVenuesPageFromSnapshot(stateAbbrev.toUpperCase(), cityFormatted, 1, pageSize))
        : supabase
            .from("venues")
            .select(VENUE_CARD_FIELDS)
            .ilike("city", cityFormatted)
            .eq("state", stateAbbrev.toUpperCase())
            .eq("country", "US")
            .eq("status", "active")
            .order("featured", { ascending: false })
            .order("ratingOverall", { ascending: false, nullsFirst: false })
            .order("name", { ascending: true })
            .range(0, pageSize)
            .then(({ data }) => {
              const rows = data || [];
              return { venues: rows.slice(0, pageSize), hasNextPage: rows.length > pageSize };
            }),
      getCachedNearbyCities(stateAbbrev.toUpperCase(), cityFormatted, 6),
      getCityCategoryBrowseLinksWithCounts(state, cityFormatted, 3, stateAbbrev.toUpperCase()),
    ]);

    const knownVenueCount = !hasNextPage ? venues.length : undefined;

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
    const nearbyCities = (nearbyCitiesRaw || []).map((c: { city: string }) => c.city);

    // Related links - static, no extra DB query
    const staticLinks = getStaticRelatedLinks("city", "", 4);
    const relatedLinks = [
      { label: "Browse by Vibe", href: getCityVibeIndexUrl(state, cityFormatted) },
      { label: "Browse by Occasion", href: getCityWhoItsForIndexUrl(state, cityFormatted) },
      { label: "Browse by Technology", href: getCityHardwareIndexUrl(state, cityFormatted) },
      ...staticLinks.map(l => ({ label: l.label, href: l.href })),
    ];

    // Build nearby city links
    const nearbyLinks = nearbyCities.map((cityName) => ({
      label: `Golf simulators in ${cityName}`,
      href: `/venue/us/${state}/${cityName.toLowerCase().replace(/\s+/g, "-")}`,
    }));

    return (
      <div className="min-h-screen bg-deep-black py-12">
        <div className="absolute inset-0 scorecard-grid opacity-20" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CitySchema city={cityFormatted} state={stateName} stateSlug={state} venueCount={knownVenueCount} />

          {/* Header */}
          <div className="mb-12">
            {/* Breadcrumbs with schema */}
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "United States", href: "/venue/us" },
                { label: stateName, href: `/venue/us/${state}` },
                { label: cityFormatted },
              ]}
              className="mb-4"
            />

            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-masters-green" />
              <span className="text-masters-green text-xs font-mono uppercase tracking-widest">
                {typeof knownVenueCount === "number" ? `${knownVenueCount} Venues` : "City Venues"}
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
                  Discover indoor golf venues in {cityFormatted}.
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
                  venueType={venue.venueType}
                  simulatorSystems={venue.simulatorSystems as string[] | null}
                  launchMonitorType={venue.launchMonitorType}
                  priceRangeMin={venue.priceRangeMin}
                  priceRangeMax={venue.priceRangeMax}
                  ratingOverall={venue.ratingOverall}
                  featured={venue.featured}
                  tags={venue.tags}
                  href={getVenueHref(venue.state, venue.city, venue.slug)}
                />
              ))}
            </VenueGrid>

            {(currentPage > 1 || hasNextPage) && (
              <Pagination
                currentPage={currentPage}
                hasNextPage={hasNextPage}
                baseUrl={`/venue/us/${state}/${city}`}
              />
            )}
          </section>

          {/* Browse by Category - city-specific counts */}
          <div className="mt-12">
            <CityCategoryLinks
              state={state}
              city={cityFormatted}
              vibes={cityCategoryLinks.vibes}
              segments={cityCategoryLinks.segments}
              hardware={cityCategoryLinks.hardware}
              launchMonitors={cityCategoryLinks.launchMonitors}
              amenities={cityCategoryLinks.amenities}
              software={cityCategoryLinks.software}
              tags={cityCategoryLinks.tags}
              totalCounts={cityCategoryLinks.totalCounts}
            />
          </div>

          {/* SEO Content using existing SeoIndexSections */}
          <div className="mt-12">
            <SeoIndexSections
              introTitle={`What to Expect from Golf Simulators in ${cityFormatted}`}
              introDescription={`${cityFormatted} offers indoor golf simulator venues for golfers looking to practice, play, or entertain. These venues range from high-end training facilities with professional-grade launch monitors to casual entertainment spots perfect for groups and parties. Most simulator venues feature advanced technology like TrackMan, Foresight, or SkyTrak, providing accurate ball flight data and realistic course simulations. Whether you're a serious golfer looking to work on your game during the off-season, or a beginner wanting to learn in a relaxed environment, ${cityFormatted}'s golf simulator venues have something for everyone.`}
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
              ctaPrimary={{ label: "List Your Venue", href: "/submit" }}
              ctaSecondary={{ label: "Learn More", href: "/about" }}
              venueCount={knownVenueCount}
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
