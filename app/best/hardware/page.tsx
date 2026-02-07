import { Metadata } from "next";
import Link from "next/link";
import { Monitor, ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { AVAILABLE_HARDWARE } from "@/lib/category-config.generated";

export const dynamic = "force-static";

// Hardware-specific longer descriptions
const hardwareLongDescriptions: Record<string, string> = {
  trackman: "Tour-level accuracy with dual radar technology trusted by PGA Tour professionals. Perfect for serious practice and club fitting.",
  foresight: "Camera-based precision capturing detailed club and ball data. Great for indoor setups where space is limited.",
  "gc-quad": "Premium camera system offering the most detailed ball and club analysis. Preferred by teaching professionals.",
  garmin: "Accessible radar technology with intuitive interfaces. Great for golfers getting started with launch monitors.",
  skytrak: "Popular choice for home and commercial setups offering excellent value with solid accuracy.",
  "full-swing": "Pro-grade simulators combining launch monitors with immersive simulation software.",
  golfzon: "Korean-made commercial systems with advanced swing plate technology and vast course library.",
  uneekor: "Overhead camera systems offering detailed ball and club data without the need for ball markers.",
  aboutgolf: "Full-enclosure simulator systems popular in commercial venues and entertainment centers.",
};

export const metadata: Metadata = {
  title: "Golf Simulators by Launch Monitor — TrackMan, Foresight & More",
  description: "Find venues by simulator technology. Compare TrackMan, Foresight GCQuad, Uneekor, Full Swing, and other launch monitor systems at venues near you.",
  alternates: {
    canonical: "https://golfsimmap.com/best/hardware",
  },
  openGraph: {
    title: "Golf Simulators by Launch Monitor — TrackMan, Foresight & More",
    description: "Find venues by simulator technology. Compare TrackMan, Foresight, Uneekor, and more.",
    type: "website",
    url: "https://golfsimmap.com/best/hardware",
  },
};

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Best By", href: "/best" },
  { label: "Technology", current: true },
];

export default function HardwareIndexPage() {
  const hardwareCounts = AVAILABLE_HARDWARE.filter((h) => h.count > 0).map((h) => ({
    ...h,
    description: hardwareLongDescriptions[h.slug] || `Find venues using ${h.label} technology.`,
  }));

  return (
    <div className="min-h-screen bg-deep-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Schema Markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              "name": "Browse Golf Simulators by Technology",
              "description": "Find golf simulator venues by launch monitor and simulator technology.",
              "url": "https://golfsimmap.com/best/hardware",
              "breadcrumb": {
                "@type": "BreadcrumbList",
                "itemListElement": [
                  { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://golfsimmap.com" },
                  { "@type": "ListItem", "position": 2, "name": "Best By", "item": "https://golfsimmap.com/best" },
                  { "@type": "ListItem", "position": 3, "name": "Technology", "item": "https://golfsimmap.com/best/hardware" },
                ],
              },
            }),
          }}
        />

        {/* Breadcrumbs */}
        <div className="mb-8">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-masters-green/10 border border-masters-green/20">
              <Monitor className="w-6 h-6 text-masters-green" />
            </div>
          </div>
          <h1 className="text-cream text-3xl md:text-4xl font-bold mb-4">
            Browse by Technology
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
                href={`/best/hardware/${hardware.slug}`}
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
                We haven&apos;t collected hardware information yet. Check back soon for updates!
              </p>
            </div>
          </div>
        )}

        {/* Back Links */}
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
