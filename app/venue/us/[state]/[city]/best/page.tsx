import { Metadata } from "next";
import Link from "next/link";
import { Tag, ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { getAvailableCategoriesForCity } from "@/lib/best-by-data";
import { getStateAbbrevFromName, getStateDisplayName } from "@/lib/states";

interface CityBestTagsIndexPageProps {
  params: Promise<{ state: string; city: string }>;
}

export const revalidate = 2592000;

function toTitleCaseCity(citySlug: string): string {
  return citySlug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

export async function generateMetadata({ params }: CityBestTagsIndexPageProps): Promise<Metadata> {
  const { state, city } = await params;
  const stateAbbrev = getStateAbbrevFromName(state) || state.toUpperCase();
  const stateName = getStateDisplayName(stateAbbrev);
  const cityFormatted = toTitleCaseCity(city);

  return {
    title: `Browse by Experience in ${cityFormatted}, ${stateName}`,
    description: `Explore top golf simulator experiences in ${cityFormatted}. Browse by date night, family-friendly, corporate events, and more.`,
    alternates: {
      canonical: `https://golfsimmap.com/venue/us/${state}/${city}/best`,
    },
    openGraph: {
      title: `Browse by Experience in ${cityFormatted}, ${stateName}`,
      description: `Explore top golf simulator experiences in ${cityFormatted}.`,
      type: "website",
      url: `https://golfsimmap.com/venue/us/${state}/${city}/best`,
    },
  };
}

export default async function CityBestTagsIndexPage({ params }: CityBestTagsIndexPageProps) {
  const { state, city } = await params;
  const stateAbbrev = getStateAbbrevFromName(state) || state.toUpperCase();
  const stateName = getStateDisplayName(stateAbbrev);
  const cityFormatted = toTitleCaseCity(city);
  const categories = await getAvailableCategoriesForCity(stateAbbrev.toUpperCase(), cityFormatted);
  const tags = categories.tags;
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Browse by Experience in ${cityFormatted}, ${stateName}`,
    description: `Explore top golf simulator experiences in ${cityFormatted}. Browse by date night, family-friendly, corporate events, and more.`,
    url: `https://golfsimmap.com/venue/us/${state}/${city}/best`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: tags.length,
      itemListElement: tags.map((tag, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: `Best ${tag.label}`,
        url: `https://golfsimmap.com/venue/us/${state}/${city}/best/${tag.slug}`,
      })),
    },
  };

  return (
    <div className="min-h-screen bg-deep-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "United States", href: "/venue/us" },
            { label: stateName, href: `/venue/us/${state}` },
            { label: cityFormatted, href: `/venue/us/${state}/${city}` },
            { label: "Browse by Experience" },
          ]}
          className="mb-8"
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
        />

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-masters-green/10 border border-masters-green/20">
              <Tag className="w-6 h-6 text-masters-green" />
            </div>
          </div>
          <h1 className="text-cream text-3xl md:text-4xl font-bold mb-4">
            Browse by Experience in {cityFormatted}
          </h1>
          <p className="text-muted text-lg max-w-2xl">
            Find the right vibe for your next session. Explore top venue experiences in {cityFormatted}.
          </p>
        </div>

        {tags.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tags.map((tag) => (
              <Link
                key={tag.slug}
                href={`/venue/us/${state}/${city}/best/${tag.slug}`}
                className="group block border border-default bg-charcoal rounded-lg p-6 hover:border-masters-green/50 hover:bg-masters-green/5 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-cream text-xl font-semibold group-hover:text-masters-green transition-colors">
                    Best {tag.label}
                  </h2>
                  <ArrowRight className="w-5 h-5 text-muted group-hover:text-masters-green transition-colors" />
                </div>
                <p className="text-muted mb-4">
                  Explore top venues in {cityFormatted} for {tag.label.toLowerCase()} experiences.
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-masters-green font-mono">{tag.count}</span>
                  <span className="text-muted">{tag.count === 1 ? "venue" : "venues"}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-default rounded-lg bg-charcoal">
            <div className="max-w-md mx-auto">
              <Tag className="w-12 h-12 text-muted mx-auto mb-4" />
              <h2 className="text-cream text-lg font-semibold mb-2">No experience tags yet</h2>
              <p className="text-muted">
                We haven&apos;t categorized experience tags for venues in {cityFormatted} yet.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
