import { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { supabase, VENUE_CARD_FIELDS } from "@/lib/supabase";
import { getCityVenuesPageFromSnapshot, readVenueSnapshot } from "@/lib/build-venues-cache";
import { MapPin } from "lucide-react";
import { VenueCard, VenueGrid } from "@/components/venue/VenueCard";
import { Pagination } from "@/components/ui/Pagination";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { getStateDisplayName, getStateAbbrevFromName } from "@/lib/states";
import { getVenueHref } from "@/lib/venue-url";

interface CityPaginationPageProps {
  params: Promise<{
    state: string;
    city: string;
    page: string;
  }>;
}

export const revalidate = 2592000;

export async function generateMetadata({ params }: CityPaginationPageProps): Promise<Metadata> {
  const { state, city, page } = await params;
  const cityFormatted = city.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  const stateAbbrev = getStateAbbrevFromName(state) || state.toUpperCase();
  const pageNum = Math.max(2, Number(page) || 2);
  const canonical = `https://golfsimmap.com/venue/us/${state}/${city}/page/${pageNum}`;

  return {
    title: `Golf Simulators in ${cityFormatted}, ${stateAbbrev} (Page ${pageNum})`,
    description: `Browse more golf simulator venues in ${cityFormatted}, ${stateAbbrev}. Page ${pageNum}.`,
    alternates: { canonical },
    openGraph: {
      title: `Golf Simulators in ${cityFormatted}, ${stateAbbrev} (Page ${pageNum})`,
      description: `Browse more golf simulator venues in ${cityFormatted}, ${stateAbbrev}. Page ${pageNum}.`,
      type: "website",
      url: canonical,
    },
  };
}

export default async function CityPaginationPage({ params }: CityPaginationPageProps) {
  const { state, city, page } = await params;
  const currentPage = Math.max(1, Number(page) || 1);

  if (!Number.isFinite(currentPage) || currentPage < 2) {
    redirect(`/venue/us/${state}/${city}`);
  }

  const stateAbbrev = getStateAbbrevFromName(state) || state.toUpperCase();
  const stateName = getStateDisplayName(stateAbbrev);
  const cityFormatted = city.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  const pageSize = 12;

  const snapshot = readVenueSnapshot();
  const { venues, hasNextPage } = snapshot
    ? getCityVenuesPageFromSnapshot(stateAbbrev.toUpperCase(), cityFormatted, currentPage, pageSize)
    : await supabase
        .from("venues")
        .select(VENUE_CARD_FIELDS)
        .ilike("city", cityFormatted)
        .eq("state", stateAbbrev.toUpperCase())
        .eq("country", "US")
        .eq("status", "active")
        .order("featured", { ascending: false })
        .order("ratingOverall", { ascending: false, nullsFirst: false })
        .order("name", { ascending: true })
        .range((currentPage - 1) * pageSize, (currentPage - 1) * pageSize + pageSize)
        .then(({ data }) => {
          const rows = data || [];
          return { venues: rows.slice(0, pageSize), hasNextPage: rows.length > pageSize };
        });

  if (venues.length === 0) {
    notFound();
  }

  const canonicalUrl = `https://golfsimmap.com/venue/us/${state}/${city}/page/${currentPage}`;
  const cityPaginationSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Golf Simulators in ${cityFormatted}, ${stateName} (Page ${currentPage})`,
    description: `Browse more golf simulator venues in ${cityFormatted}, ${stateAbbrev}. Page ${currentPage}.`,
    url: canonicalUrl,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: venues.length,
      itemListElement: venues.map((venue, index) => ({
        "@type": "ListItem",
        position: (currentPage - 1) * pageSize + index + 1,
        name: String(venue.name),
        url: `https://golfsimmap.com${getVenueHref(
          String(venue.state),
          String(venue.city),
          String(venue.slug)
        )}`,
      })),
    },
  };

  return (
    <div className="min-h-screen bg-deep-black py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(cityPaginationSchema) }}
      />
      <div className="absolute inset-0 scorecard-grid opacity-20" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "United States", href: "/venue/us" },
            { label: stateName, href: `/venue/us/${state}` },
            { label: cityFormatted, href: `/venue/us/${state}/${city}` },
            { label: `Page ${currentPage}` },
          ]}
          className="mb-6"
        />

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <MapPin className="w-5 h-5 text-masters-green" />
            <h1 className="text-cream">
              Golf Simulators in {cityFormatted}, {stateName}
            </h1>
          </div>
          <p className="text-muted">Page {currentPage} of city listings.</p>
        </div>

        <VenueGrid columns={3}>
          {venues.map((venue) => (
            <VenueCard
              key={String(venue.id)}
              id={String(venue.id)}
              slug={String(venue.slug)}
              name={String(venue.name)}
              city={String(venue.city)}
              state={String(venue.state)}
              heroImage={(venue.heroImage as string | null) ?? null}
              venueType={String(venue.venueType)}
              simulatorSystems={(venue.simulatorSystems as string[] | null) ?? null}
              launchMonitorType={(venue.launchMonitorType as string | null) ?? null}
              priceRangeMin={(venue.priceRangeMin as number | null) ?? null}
              priceRangeMax={(venue.priceRangeMax as number | null) ?? null}
              ratingOverall={(venue.ratingOverall as number | null) ?? null}
              featured={Boolean(venue.featured)}
              tags={(venue.tags as string[] | null) ?? null}
              href={getVenueHref(String(venue.state), String(venue.city), String(venue.slug))}
            />
          ))}
        </VenueGrid>

        <Pagination
          currentPage={currentPage}
          hasNextPage={hasNextPage}
          baseUrl={`/venue/us/${state}/${city}`}
        />

        <div className="mt-12 text-center">
          <Link href={`/venue/us/${state}/${city}`} className="text-muted hover:text-cream transition-colors">
            ← Back to first page
          </Link>
        </div>
      </div>
    </div>
  );
}
