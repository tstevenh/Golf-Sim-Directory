import { Metadata } from "next";
import Link from "next/link";
import { db, venueCardSelect } from "@/lib/db";
import { Building2, MapPin } from "lucide-react";
import { CityCard } from "@/components/location/LocationCards";
import { VenueCard } from "@/components/venue/VenueCard";
import { SeoIndexSections } from "@/components/seo/SeoIndexSections";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import {
  getStateDisplayName,
  getStateAbbrevFromName,
} from "@/lib/states";
import { VIBE_CATEGORIES, SEGMENT_CATEGORIES, HARDWARE_CATEGORIES } from "@/lib/best-by-config";

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
      title: `Indoor Golf Simulators in ${stateName} — ${venueCount} Venues`,
      description: `Browse ${venueCount} golf simulator venues across ${stateName}. Compare launch monitors, pricing, vibes, and amenities. Find your nearest indoor golf spot.`,
      alternates: {
        canonical: `https://golfsimmap.com/venue/us/${state}`,
      },
      openGraph: {
        title: `Indoor Golf Simulators in ${stateName} — ${venueCount} Venues`,
        description: `Browse ${venueCount} golf simulator venues across ${stateName}. Compare launch monitors, pricing, and book online.`,
        type: "website",
        url: `https://golfsimmap.com/venue/us/${state}`,
      },
    };
  } catch {
    return {
      title: "Golf Simulators by State",
      description: "Find indoor golf simulators across the United States.",
    };
  }
}

export async function generateStaticParams() {
  return [
    { state: "illinois" },
    { state: "new-york" },
    { state: "california" },
    { state: "texas" },
    { state: "florida" },
  ];
}

// Separate data fetching function to avoid try/catch around JSX
async function fetchStateData(state: string) {
  const stateAbbrev = getStateAbbrevFromName(state) || state.toUpperCase();
  const stateName = getStateDisplayName(stateAbbrev);

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
      orderBy: { ratingOverall: "desc" },
      select: venueCardSelect,
    }),
    db.venue.count({
      where: {
        state: stateAbbrev.toUpperCase(),
        country: "US",
        status: "active",
      },
    }),
  ]);

  return {
    stateAbbrev,
    stateName,
    citiesResult,
    featuredVenues,
    totalVenues,
  };
}

export default async function StatePage({ params }: StatePageProps) {
  const { state } = await params;
  
  let data;
  try {
    data = await fetchStateData(state);
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

  const { stateAbbrev, stateName, citiesResult, featuredVenues, totalVenues } = data;

  const citiesWithVenues = citiesResult.sort((a, b) => b._count.id - a._count.id);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "United States", href: "/venue/us" },
    { label: stateName },
  ];

  const topCityLinks = citiesWithVenues.slice(0, 8).map((cityData) => {
    const citySlug = cityData.city.toLowerCase().replace(/\s+/g, "-");
    return {
      label: `Golf simulators in ${cityData.city}`,
      href: `/venue/us/${state}/${citySlug}`,
    };
  });

  // Top city for city-level best-by links
  const topCity = citiesWithVenues.length > 0 ? citiesWithVenues[0] : null;
  const topCitySlug = topCity ? topCity.city.toLowerCase().replace(/\s+/g, "-") : "";

  // Generate related best-by links from shared config + city-level links
  const relatedLinks = [
    { label: "Browse all categories", href: "/best" },
    // City-level best-by links for top city
    ...(topCity ? [
      { label: `Best vibes in ${topCity.city}`, href: `/venue/us/${state}/${topCitySlug}/best/vibe` },
      { label: `Best tech in ${topCity.city}`, href: `/venue/us/${state}/${topCitySlug}/best/hardware` },
    ] : []),
    // Global vibe categories
    ...VIBE_CATEGORIES.slice(0, 2).map((v) => ({
      label: `Best ${v.label}`,
      href: `/best/vibe/${v.slug}`,
    })),
    // Segment categories  
    ...SEGMENT_CATEGORIES.slice(0, 2).map((s) => ({
      label: `Best for ${s.label}`,
      href: `/best/who-its-for/${s.slug}`,
    })),
    // Hardware categories
    ...HARDWARE_CATEGORIES.slice(0, 2).map((h) => ({
      label: `Best ${h.label}`,
      href: `/best/hardware/${h.slug}`,
    })),
    // Launch monitor guide
    { label: "Launch monitor guide", href: "/launch-monitors" },
  ];

  const faqItems = [
    {
      question: `How many indoor golf venues are in ${stateName}?`,
      answer: `We currently track ${totalVenues} active venues across ${citiesWithVenues.length} cities in ${stateName}. Listings include simulator bars, training studios, entertainment venues, and private rental facilities.`,
    },
    {
      question: `What launch monitors are most common in ${stateName}?`,
      answer: `Top venues in ${stateName} typically use TrackMan (dual radar), Foresight GCQuad (camera-based), Uneekor (overhead camera), and Full Swing systems. Each listing shows its simulator hardware and launch monitor type so you can find your preferred technology.`,
    },
    {
      question: `How much do golf simulators cost in ${stateName}?`,
      answer: `Pricing varies by venue and location. Standard bays typically range from $30-$60 per hour, with premium venues charging $60-$100+ per hour. Many locations offer per-person rates, group packages, or memberships. Check individual listings for current pricing.`,
    },
    {
      question: `Do venues in ${stateName} allow walk-ins?`,
      answer: `Many venues accept walk-ins during off-peak hours, but booking ahead is recommended for evenings and weekends. Check each listing for booking links and walk-in policies.`,
    },
    {
      question: `Which city in ${stateName} has the most golf simulators?`,
      answer: topCity 
        ? `${topCity.city} leads with ${topCity._count.id} venues. ${citiesWithVenues.length > 1 ? `Other popular cities include ${citiesWithVenues.slice(1, 4).map(c => `${c.city} (${c._count.id})`).join(", ")}.` : ""}`
        : `Browse the cities below to find venues near you.`,
    },
    {
      question: `How do I get my venue listed in ${stateName}?`,
      answer: `Use the submit form to add a listing, or claim an existing venue to verify and manage it. All submissions are reviewed before publishing. Claiming is free and lets you update photos, hours, and pricing.`,
    },
  ];

  return (
    <div className="min-h-screen bg-deep-black py-12">
      <div className="absolute inset-0 scorecard-grid opacity-20" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* CollectionPage Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              name: `Golf Simulators in ${stateName}`,
              description: `Find ${totalVenues} indoor golf simulator venues across ${stateName}.`,
              url: `https://golfsimmap.com/venue/us/${state}`,
              mainEntity: {
                "@type": "ItemList",
                numberOfItems: citiesWithVenues.length,
                itemListElement: citiesWithVenues.slice(0, 10).map((cityData, i) => ({
                  "@type": "ListItem",
                  position: i + 1,
                  name: `Golf simulators in ${cityData.city}`,
                  url: `https://golfsimmap.com/venue/us/${state}/${cityData.city.toLowerCase().replace(/\s+/g, "-")}`,
                })),
              },
            }),
          }}
        />

        <Breadcrumbs items={breadcrumbItems} className="mb-6" />

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-masters-green" />
            <span className="text-masters-green text-xs font-mono uppercase tracking-widest">
              {totalVenues} Venues
            </span>
          </div>
          <h1 className="text-cream mb-2">Golf Simulators in {stateName}</h1>
          <p className="text-muted max-w-2xl">
            Explore indoor golf venues across {stateName}. Compare launch monitors, pricing styles, and vibe so you can book the right bay for your next session.
          </p>
        </div>

        <SeoIndexSections
          introTitle={`Why golfers use GolfSimMap in ${stateName}`}
          introDescription={`GolfSimMap brings together ${totalVenues} active venues across ${stateName}, from simulator bars to training studios. Each listing highlights hardware, amenities, and booking details so you can compare quickly.`}
          guidanceTitle={`How to choose a venue in ${stateName}`}
          guidancePoints={[
            "Compare launch monitor types (radar vs camera) to match your practice goals.",
            "Check amenities like food, drinks, and private rooms if you are booking for groups.",
            "Use ratings and tags to filter for serious practice, date nights, or family-friendly venues.",
          ]}
          methodologyTitle="How we rank venues"
          methodologyDescription="Featured venues are sorted by rating and listing quality. City popularity is based on venue count, and search results prioritize verified data, complete listings, and recent updates." 
          faqTitle={`FAQs about indoor golf in ${stateName}`}
          faqItems={faqItems}
          nearbyTitle={`Top cities in ${stateName}`}
          nearbyLinks={topCityLinks}
          relatedTitle="Browse by category"
          relatedLinks={relatedLinks}
          venueCount={totalVenues}
          showStats={true}
          ctaTitle="Own a golf simulator venue?"
          ctaDescription="Claim your listing to verify details, update photos, and reach golfers searching in your area."
          ctaPrimary={{ label: "Claim a listing", href: "/claim" }}
          ctaSecondary={{ label: "Submit a venue", href: "/submit" }}
        >
          <div className="space-y-10">
            {featuredVenues.length > 0 && (
              <div>
                <h2 className="text-cream mb-6 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-masters-green" />
                  Featured Venues
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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

            <div>
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
          </div>
        </SeoIndexSections>

        {citiesWithVenues.length === 0 && (
          <div className="text-center py-16 border border-default mt-12">
            <p className="text-muted">No venues found in {stateName}.</p>
            <Link href="/submit" className="text-masters-green hover:text-cream mt-4 inline-block">
              Add the first venue →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
