import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getStateDisplayName, getStateAbbrevFromName } from "@/lib/states";
import { VIBE_CATEGORIES, getCityVibeUrl, getStateUrl, getCityUrl } from "@/lib/best-by-config";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Sparkles, ArrowRight } from "lucide-react";

interface CityVibeIndexPageProps {
  params: Promise<{ state: string; city: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: CityVibeIndexPageProps): Promise<Metadata> {
  const { state, city } = await params;
  const stateAbbrev = getStateAbbrevFromName(state) || state.toUpperCase();
  const stateName = getStateDisplayName(stateAbbrev);
  const cityFormatted = city
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return {
    title: `Browse by Vibe in ${cityFormatted}, ${stateName} `,
    description: `Explore golf simulator venues in ${cityFormatted} by atmosphere and vibe. Find casual spots, upscale lounges, sports bars, and more.`,
    alternates: {
      canonical: `https://golfsimmap.com/venue/us/${state}/${city}/best/vibe`,
    },
    openGraph: {
      title: `Browse by Vibe in ${cityFormatted}, ${stateName}`,
      description: `Explore golf simulator venues in ${cityFormatted} by atmosphere and vibe.`,
      type: "website",
      url: `https://golfsimmap.com/venue/us/${state}/${city}/best/vibe`,
    },
  };
}

export default async function CityVibeIndexPage({ params }: CityVibeIndexPageProps) {
  const { state, city } = await params;
  const stateAbbrev = getStateAbbrevFromName(state) || state.toUpperCase();
  const stateName = getStateDisplayName(stateAbbrev);
  const cityFormatted = city
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
  const citySlug = city.toLowerCase().replace(/\s+/g, "-");

  // Get venue counts for each vibe category
  const venues = await db.venue.findMany({
    where: {
      city: { equals: cityFormatted, mode: "insensitive" },
      state: stateAbbrev.toUpperCase(),
      country: "US",
      status: "active",
    },
    select: { vibeTags: true },
  });

  // Calculate counts for each vibe
  const vibeCounts = VIBE_CATEGORIES.map((vibe) => {
    const count = venues.filter((v) => (v.vibeTags || []).includes(vibe.slug)).length;
    return { ...vibe, count };
  }).filter((v) => v.count > 0);

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
            { label: "Browse by Vibe" },
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
              name: `Browse by Vibe in ${cityFormatted}, ${stateName}`,
              description: `Explore golf simulator venues in ${cityFormatted} by atmosphere and vibe.`,
              url: `https://golfsimmap.com/venue/us/${state}/${city}/best/vibe`,
            }),
          }}
        />

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-masters-green/10 border border-masters-green/20">
              <Sparkles className="w-6 h-6 text-masters-green" />
            </div>
          </div>
          <h1 className="text-cream text-3xl md:text-4xl font-bold mb-4">
            Browse by Vibe in {cityFormatted}
          </h1>
          <p className="text-muted text-lg max-w-2xl">
            Find the perfect atmosphere for your next golf simulator session. 
            From casual hangouts to upscale experiences, discover venues that match your mood.
          </p>
        </div>

        {/* Vibe Categories Grid */}
        {vibeCounts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vibeCounts.map((vibe) => (
              <Link
                key={vibe.slug}
                href={getCityVibeUrl(state, cityFormatted, vibe.slug)}
                className="group block border border-default bg-charcoal rounded-lg p-6 hover:border-masters-green/50 hover:bg-masters-green/5 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-cream text-xl font-semibold group-hover:text-masters-green transition-colors">
                    {vibe.label}
                  </h2>
                  <ArrowRight className="w-5 h-5 text-muted group-hover:text-masters-green transition-colors" />
                </div>
                <p className="text-muted mb-4">{vibe.description}</p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-masters-green font-mono">{vibe.count}</span>
                  <span className="text-muted">
                    {vibe.count === 1 ? "venue" : "venues"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-default rounded-lg bg-charcoal">
            <div className="max-w-md mx-auto">
              <Sparkles className="w-12 h-12 text-muted mx-auto mb-4" />
              <h2 className="text-cream text-lg font-semibold mb-2">No venues with vibe tags</h2>
              <p className="text-muted">
                We haven&apos;t categorized venues in {cityFormatted} by vibe yet. 
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
