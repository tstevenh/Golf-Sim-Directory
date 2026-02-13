import { Metadata } from "next";
import Link from "next/link";
import { Laptop, ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { getAvailableCategoriesForCity } from "@/lib/best-by-data";
import { getStateAbbrevFromName, getStateDisplayName } from "@/lib/states";

interface CityBestSoftwareIndexPageProps {
  params: Promise<{ state: string; city: string }>;
}

export const revalidate = 2592000;

function toTitleCaseCity(citySlug: string): string {
  return citySlug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

export async function generateMetadata({ params }: CityBestSoftwareIndexPageProps): Promise<Metadata> {
  const { state, city } = await params;
  const stateAbbrev = getStateAbbrevFromName(state) || state.toUpperCase();
  const stateName = getStateDisplayName(stateAbbrev);
  const cityFormatted = toTitleCaseCity(city);

  return {
    title: `Browse by Software in ${cityFormatted}, ${stateName}`,
    description: `Find golf simulator venues in ${cityFormatted} by software platform. Compare GSPro, E6, TGC, and more.`,
    alternates: {
      canonical: `https://golfsimmap.com/venue/us/${state}/${city}/best/software`,
    },
    openGraph: {
      title: `Browse by Software in ${cityFormatted}, ${stateName}`,
      description: `Find golf simulator venues in ${cityFormatted} by software platform.`,
      type: "website",
      url: `https://golfsimmap.com/venue/us/${state}/${city}/best/software`,
    },
  };
}

export default async function CityBestSoftwareIndexPage({ params }: CityBestSoftwareIndexPageProps) {
  const { state, city } = await params;
  const stateAbbrev = getStateAbbrevFromName(state) || state.toUpperCase();
  const stateName = getStateDisplayName(stateAbbrev);
  const cityFormatted = toTitleCaseCity(city);
  const categories = await getAvailableCategoriesForCity(stateAbbrev.toUpperCase(), cityFormatted);
  const software = categories.software;
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Browse by Software in ${cityFormatted}, ${stateName}`,
    description: `Find golf simulator venues in ${cityFormatted} by software platform. Compare GSPro, E6, TGC, and more.`,
    url: `https://golfsimmap.com/venue/us/${state}/${city}/best/software`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: software.length,
      itemListElement: software.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: `Best ${item.label}`,
        url: `https://golfsimmap.com/venue/us/${state}/${city}/best/software/${item.slug}`,
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
            { label: "Browse by Software" },
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
              <Laptop className="w-6 h-6 text-masters-green" />
            </div>
          </div>
          <h1 className="text-cream text-3xl md:text-4xl font-bold mb-4">
            Browse by Software in {cityFormatted}
          </h1>
          <p className="text-muted text-lg max-w-2xl">
            Compare simulator software options available across venues in {cityFormatted}.
          </p>
        </div>

        {software.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {software.map((item) => (
              <Link
                key={item.slug}
                href={`/venue/us/${state}/${city}/best/software/${item.slug}`}
                className="group block border border-default bg-charcoal rounded-lg p-6 hover:border-masters-green/50 hover:bg-masters-green/5 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-cream text-xl font-semibold group-hover:text-masters-green transition-colors">
                    Best {item.label}
                  </h2>
                  <ArrowRight className="w-5 h-5 text-muted group-hover:text-masters-green transition-colors" />
                </div>
                <p className="text-muted mb-4">
                  Find venues in {cityFormatted} running {item.label} for simulator gameplay.
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-masters-green font-mono">{item.count}</span>
                  <span className="text-muted">{item.count === 1 ? "venue" : "venues"}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-default rounded-lg bg-charcoal">
            <div className="max-w-md mx-auto">
              <Laptop className="w-12 h-12 text-muted mx-auto mb-4" />
              <h2 className="text-cream text-lg font-semibold mb-2">No software data yet</h2>
              <p className="text-muted">
                We haven&apos;t mapped software categories for venues in {cityFormatted} yet.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
