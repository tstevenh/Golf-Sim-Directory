import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getStateDisplayName, getStateAbbrevFromName } from "@/lib/states";
import { SEGMENT_CATEGORIES, getCityWhoItsForUrl, getStateUrl, getCityUrl } from "@/lib/best-by-config";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Users, ArrowRight } from "lucide-react";

interface CityWhoItsForIndexPageProps {
  params: Promise<{ state: string; city: string }>;
}

export const revalidate = 86400;

export async function generateMetadata({ params }: CityWhoItsForIndexPageProps): Promise<Metadata> {
  const { state, city } = await params;
  const stateAbbrev = getStateAbbrevFromName(state) || state.toUpperCase();
  const stateName = getStateDisplayName(stateAbbrev);
  const cityFormatted = city
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return {
    title: `Browse by Occasion in ${cityFormatted}, ${stateName} `,
    description: `Find golf simulator venues in ${cityFormatted} perfect for any occasion. Date nights, corporate events, family outings, and more.`,
    alternates: {
      canonical: `https://golfsimmap.com/venue/us/${state}/${city}/best/who-its-for`,
    },
    openGraph: {
      title: `Browse by Occasion in ${cityFormatted}, ${stateName}`,
      description: `Find golf simulator venues in ${cityFormatted} for any occasion.`,
      type: "website",
      url: `https://golfsimmap.com/venue/us/${state}/${city}/best/who-its-for`,
    },
  };
}

export default async function CityWhoItsForIndexPage({ params }: CityWhoItsForIndexPageProps) {
  const { state, city } = await params;
  const stateAbbrev = getStateAbbrevFromName(state) || state.toUpperCase();
  const stateName = getStateDisplayName(stateAbbrev);
  const cityFormatted = city
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
  const canRawQuery = typeof (db as unknown as { $queryRaw?: unknown }).$queryRaw === "function";

  let countsBySlug = new Map<string, number>();

  if (canRawQuery) {
    const rows = await db.$queryRaw<{ slug: string; count: bigint | number }[]>`
      SELECT segment AS slug, COUNT(*)::bigint AS count
      FROM "venues" v
      CROSS JOIN LATERAL unnest(v."whoItsFor") AS segment
      WHERE v."city" ILIKE ${cityFormatted}
        AND v."state" = ${stateAbbrev.toUpperCase()}
        AND v."country" = 'US'
        AND v."status" = 'active'
      GROUP BY segment
    `;
    countsBySlug = new Map(rows.map((row) => [row.slug, Number(row.count)]));
  } else {
    // Fallback path for mock DB (no raw SQL support).
    const venues = await db.venue.findMany({
      where: {
        city: { equals: cityFormatted, mode: "insensitive" },
        state: stateAbbrev.toUpperCase(),
        country: "US",
        status: "active",
      },
      select: { whoItsFor: true },
    });
    countsBySlug = new Map(
      SEGMENT_CATEGORIES.map((segment) => [
        segment.slug,
        venues.filter((v) => (v.whoItsFor || []).includes(segment.slug)).length,
      ])
    );
  }

  const segmentCounts = SEGMENT_CATEGORIES.map((segment) => {
    const count = countsBySlug.get(segment.slug) || 0;
    return { ...segment, count };
  }).filter((s) => s.count > 0);

  return (
    <div className="min-h-screen bg-deep-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumbs with schema */}
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "United States", href: "/venue/us" },
            { label: stateName, href: getStateUrl(state) },
            { label: cityFormatted, href: getCityUrl(state, cityFormatted) },
            { label: "Browse by Occasion" },
          ]}
          className="mb-8"
        />

        {/* CollectionPage Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              name: `Browse by Occasion in ${cityFormatted}, ${stateName}`,
              description: `Find golf simulator venues in ${cityFormatted} perfect for any occasion.`,
              url: `https://golfsimmap.com/venue/us/${state}/${city}/best/who-its-for`,
            }),
          }}
        />

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-masters-green/10 border border-masters-green/20">
              <Users className="w-6 h-6 text-masters-green" />
            </div>
          </div>
          <h1 className="text-cream text-3xl md:text-4xl font-bold mb-4">
            Find the Perfect Spot in {cityFormatted}
          </h1>
          <p className="text-muted text-lg max-w-2xl">
            Whether it&apos;s date night, a corporate event, or practice time, 
            discover venues in {cityFormatted} that are perfect for your occasion.
          </p>
        </div>

        {/* Segment Categories Grid */}
        {segmentCounts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {segmentCounts.map((segment) => (
              <Link
                key={segment.slug}
                href={getCityWhoItsForUrl(state, cityFormatted, segment.slug)}
                className="group block border border-default bg-charcoal rounded-lg p-6 hover:border-masters-green/50 hover:bg-masters-green/5 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-cream text-xl font-semibold group-hover:text-masters-green transition-colors">
                    Best for {segment.label}
                  </h2>
                  <ArrowRight className="w-5 h-5 text-muted group-hover:text-masters-green transition-colors" />
                </div>
                <p className="text-muted mb-4">{segment.description}</p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-masters-green font-mono">{segment.count}</span>
                  <span className="text-muted">
                    {segment.count === 1 ? "venue" : "venues"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-default rounded-lg bg-charcoal">
            <div className="max-w-md mx-auto">
              <Users className="w-12 h-12 text-muted mx-auto mb-4" />
              <h2 className="text-cream text-lg font-semibold mb-2">No venues with occasion tags</h2>
              <p className="text-muted">
                We haven&apos;t categorized venues in {cityFormatted} by occasion yet. 
                Check back soon for updates!
              </p>
            </div>
          </div>
        )}

        {/* Back Links */}
        <div className="mt-12 flex flex-wrap gap-4">
          <Link
            href={getCityUrl(state, cityFormatted)}
            className="text-muted hover:text-cream transition-colors"
          >
            ← Back to all venues in {cityFormatted}
          </Link>
        </div>
      </div>
    </div>
  );
}
