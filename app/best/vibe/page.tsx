import { Metadata } from "next";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { AVAILABLE_VIBES } from "@/lib/category-config.generated";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Golf Simulators by Vibe — Casual, Upscale, Sports Bar & More",
  description: "Browse golf simulator venues by atmosphere. Find casual hangouts, upscale lounges, sports bars, tech labs, and party spots near you.",
  alternates: {
    canonical: "https://golfsimmap.com/best/vibe",
  },
  openGraph: {
    title: "Golf Simulators by Vibe — Casual, Upscale & More",
    description: "Browse golf simulator venues by atmosphere. Find casual hangouts, upscale lounges, sports bars, and party spots.",
    type: "website",
    url: "https://golfsimmap.com/best/vibe",
  },
};

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Best By", href: "/best" },
  { label: "Vibe", current: true },
];

export default function VibeIndexPage() {
  const vibeCounts = AVAILABLE_VIBES.filter((v) => v.count > 0);

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
              "name": "Browse Golf Simulators by Vibe",
              "description": "Find golf simulator venues by atmosphere and vibe.",
              "url": "https://golfsimmap.com/best/vibe",
              "breadcrumb": {
                "@type": "BreadcrumbList",
                "itemListElement": [
                  { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://golfsimmap.com" },
                  { "@type": "ListItem", "position": 2, "name": "Best By", "item": "https://golfsimmap.com/best" },
                  { "@type": "ListItem", "position": 3, "name": "Vibe", "item": "https://golfsimmap.com/best/vibe" },
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
              <Sparkles className="w-6 h-6 text-masters-green" />
            </div>
          </div>
          <h1 className="text-cream text-3xl md:text-4xl font-bold mb-4">
            Browse by Vibe
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
                href={`/best/vibe/${vibe.slug}`}
                className="group block border border-default bg-charcoal rounded-lg p-6 hover:border-masters-green/50 hover:bg-masters-green/5 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-cream text-xl font-semibold group-hover:text-masters-green transition-colors">
                    {vibe.label}
                  </h2>
                  <ArrowRight className="w-5 h-5 text-muted group-hover:text-masters-green transition-colors" />
                </div>
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
                We haven&apos;t categorized venues by vibe yet. Check back soon for updates!
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
