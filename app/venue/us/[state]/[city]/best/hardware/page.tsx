import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getStateDisplayName, getStateAbbrevFromName } from "@/lib/states";
import { HARDWARE_CATEGORIES, getCityHardwareUrl, getStateUrl, getCityUrl } from "@/lib/best-by-config";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Monitor, ArrowRight } from "lucide-react";

interface CityHardwareIndexPageProps {
  params: Promise<{ state: string; city: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: CityHardwareIndexPageProps): Promise<Metadata> {
  const { state, city } = await params;
  const stateAbbrev = getStateAbbrevFromName(state) || state.toUpperCase();
  const stateName = getStateDisplayName(stateAbbrev);
  const cityFormatted = city
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return {
    title: `Browse by Technology in ${cityFormatted}, ${stateName} | GolfSimMap`,
    description: `Find golf simulator venues in ${cityFormatted} by launch monitor and simulator technology. TrackMan, Foresight, and more.`,
    alternates: {
      canonical: `https://golfsimmap.com/venue/us/${state}/${city}/best/hardware`,
    },
    openGraph: {
      title: `Browse by Technology in ${cityFormatted}, ${stateName}`,
      description: `Find golf simulator venues in ${cityFormatted} by simulator technology.`,
      type: "website",
      url: `https://golfsimmap.com/venue/us/${state}/${city}/best/hardware`,
    },
  };
}

// Hardware-specific longer descriptions
const hardwareLongDescriptions: Record<string, string> = {
  trackman: "Tour-level accuracy with dual radar technology trusted by PGA Tour professionals. Perfect for serious practice and club fitting.",
  foresight: "Camera-based precision capturing detailed club and ball data. Great for indoor setups where space is limited.",
  "gc-quad": "Premium camera system offering the most detailed ball and club analysis. Preferred by teaching professionals.",
  garmin: "Accessible radar technology with intuitive interfaces. Great for golfers getting started with launch monitors.",
  skytrak: "Popular choice for home and commercial setups offering excellent value with solid accuracy.",
  "full-swing": "Pro-grade simulators combining launch monitors with immersive simulation software.",
};

export default async function CityHardwareIndexPage({ params }: CityHardwareIndexPageProps) {
  const { state, city } = await params;
  const stateAbbrev = getStateAbbrevFromName(state) || state.toUpperCase();
  const stateName = getStateDisplayName(stateAbbrev);
  const cityFormatted = city
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
  const citySlug = city.toLowerCase().replace(/\s+/g, "-");

  // Get venue counts for each hardware brand
  const venues = await db.venue.findMany({
    where: {
      city: { equals: cityFormatted, mode: "insensitive" },
      state: stateAbbrev.toUpperCase(),
      country: "US",
      status: "active",
    },
    select: { simulatorSystems: true },
  });

  // Calculate counts for each hardware brand
  const hardwareCounts = HARDWARE_CATEGORIES.map((hardware) => {
    const count = venues.filter((v) => {
      // Check simulatorSystems array for brand
      const systems = v.simulatorSystems as { brand?: string; model?: string }[] | null;
      if (systems) {
        return systems.some(
          (s) => s.brand?.toLowerCase() === hardware.slug.toLowerCase() ||
                 s.brand?.toLowerCase().replace(/\s+/g, "-") === hardware.slug.toLowerCase()
        );
      }
      return false;
    }).length;
    return { 
      ...hardware, 
      count,
      description: hardwareLongDescriptions[hardware.slug] || hardware.description
    };
  }).filter((h) => h.count > 0);

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
            { label: "Browse by Technology" },
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
              name: `Browse by Technology in ${cityFormatted}, ${stateName}`,
              description: `Find golf simulator venues in ${cityFormatted} by launch monitor and simulator technology.`,
              url: `https://golfsimmap.com/venue/us/${state}/${city}/best/hardware`,
            }),
          }}
        />

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-masters-green/10 border border-masters-green/20">
              <Monitor className="w-6 h-6 text-masters-green" />
            </div>
          </div>
          <h1 className="text-cream text-3xl md:text-4xl font-bold mb-4">
            Browse by Technology in {cityFormatted}
          </h1>
          <p className="text-muted text-lg max-w-2xl">
            Find venues with your preferred launch monitor technology. 
            From tour-level radar to camera-based systems, discover the best fit for your game.
          </p>
        </div>

        {/* Hardware Categories Grid */}
        {hardwareCounts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hardwareCounts.map((hardware) => (
              <Link
                key={hardware.slug}
                href={getCityHardwareUrl(state, cityFormatted, hardware.slug)}
                className="group block border border-default bg-charcoal rounded-lg p-6 hover:border-masters-green/50 hover:bg-masters-green/5 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-cream text-xl font-semibold group-hover:text-masters-green transition-colors">
                    {hardware.label}
                  </h2>
                  <ArrowRight className="w-5 h-5 text-muted group-hover:text-masters-green transition-colors" />
                </div>
                <p className="text-muted mb-4">{hardware.description}</p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-masters-green font-mono">{hardware.count}</span>
                  <span className="text-muted">
                    {hardware.count === 1 ? "venue" : "venues"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-default rounded-lg bg-charcoal">
            <div className="max-w-md mx-auto">
              <Monitor className="w-12 h-12 text-muted mx-auto mb-4" />
              <h2 className="text-cream text-lg font-semibold mb-2">No venues with hardware data</h2>
              <p className="text-muted">
                We haven&apos;t collected hardware information for venues in {cityFormatted} yet. 
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
