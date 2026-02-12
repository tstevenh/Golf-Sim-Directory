import { Metadata } from "next";
import Link from "next/link";
import { Coffee, ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { AVAILABLE_AMENITIES } from "@/lib/category-config.generated";

export const dynamic = "force-static";

const amenityDescriptions: Record<string, string> = {
  private_rooms: "Dedicated simulator spaces for private groups and events.",
  full_bar: "Venues with alcohol service for social and group sessions.",
  kitchen_food: "Locations offering substantial food service while you play.",
  coaching_available: "Venues with on-site instruction and coaching support.",
  wifi: "Stay connected with reliable internet access during sessions.",
  free_parking: "Venues with free lot parking for easier visits.",
  valet_parking: "Premium access with valet parking service.",
};

function toUrlSlug(slug: string): string {
  return slug.replace(/_/g, "-");
}

export const metadata: Metadata = {
  title: "Golf Simulators by Amenities — Private Rooms, Bar, Coaching & More",
  description: "Browse golf simulator venues by amenities. Compare private rooms, coaching, food, bar service, parking, and more.",
  alternates: {
    canonical: "https://golfsimmap.com/best/amenities",
  },
  openGraph: {
    title: "Golf Simulators by Amenities — Private Rooms, Bar, Coaching & More",
    description: "Browse venues by the amenities that matter most for your session.",
    type: "website",
    url: "https://golfsimmap.com/best/amenities",
  },
};

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Best By", href: "/best" },
  { label: "Amenities", current: true },
];

export default function AmenitiesIndexPage() {
  const amenityCounts = AVAILABLE_AMENITIES.filter((item) => item.count > 0).map((item) => ({
    ...item,
    description:
      amenityDescriptions[item.slug] ||
      `Find venues with ${item.label.toLowerCase()} amenities.`,
  }));

  return (
    <div className="min-h-screen bg-deep-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              name: "Browse Golf Simulators by Amenities",
              description: "Find golf simulator venues by amenities and venue features.",
              url: "https://golfsimmap.com/best/amenities",
            }),
          }}
        />

        <div className="mb-8">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-masters-green/10 border border-masters-green/20">
              <Coffee className="w-6 h-6 text-masters-green" />
            </div>
          </div>
          <h1 className="text-cream text-3xl md:text-4xl font-bold mb-4">
            Browse by Amenities
          </h1>
          <p className="text-muted text-lg max-w-2xl">
            Narrow down venues by comfort, convenience, and on-site features.
          </p>
        </div>

        {amenityCounts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {amenityCounts.map((item) => (
              <Link
                key={item.slug}
                href={`/best/amenities/${toUrlSlug(item.slug)}`}
                className="group block border border-default bg-charcoal rounded-lg p-6 hover:border-masters-green/50 hover:bg-masters-green/5 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-cream text-xl font-semibold group-hover:text-masters-green transition-colors">
                    {item.label}
                  </h2>
                  <ArrowRight className="w-5 h-5 text-muted group-hover:text-masters-green transition-colors" />
                </div>
                <p className="text-muted mb-4">{item.description}</p>
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
              <Coffee className="w-12 h-12 text-muted mx-auto mb-4" />
              <h2 className="text-cream text-lg font-semibold mb-2">No amenity data yet</h2>
              <p className="text-muted">We haven&apos;t categorized amenity data yet.</p>
            </div>
          </div>
        )}

        <div className="mt-12 flex flex-wrap gap-4">
          <Link href="/best" className="text-muted hover:text-cream transition-colors">
            ← Back to all categories
          </Link>
          <Link href="/venue/us" className="text-masters-green hover:text-cream transition-colors">
            Browse all venues →
          </Link>
        </div>
      </div>
    </div>
  );
}
