import { Metadata } from "next";
import Link from "next/link";
import { Users, ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { AVAILABLE_SEGMENTS } from "@/lib/category-config.generated";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Golf Simulators for Every Occasion — Date Night, Groups & More",
  description: "Find golf simulator venues perfect for date nights, corporate events, family outings, serious practice, bachelor parties, and more.",
  alternates: {
    canonical: "https://golfsimmap.com/best/who-its-for",
  },
  openGraph: {
    title: "Golf Simulators for Every Occasion — Date Night, Groups & More",
    description: "Find golf simulator venues perfect for date nights, corporate events, family outings, and more.",
    type: "website",
    url: "https://golfsimmap.com/best/who-its-for",
  },
};

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Best By", href: "/best" },
  { label: "Golfer Type", current: true },
];

export default function WhoItsForIndexPage() {
  const segmentCounts = AVAILABLE_SEGMENTS.filter((s) => s.count > 0);

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
              "name": "Find Golf Simulators by Occasion",
              "description": "Discover golf simulator venues perfect for any occasion.",
              "url": "https://golfsimmap.com/best/who-its-for",
              "breadcrumb": {
                "@type": "BreadcrumbList",
                "itemListElement": [
                  { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://golfsimmap.com" },
                  { "@type": "ListItem", "position": 2, "name": "Best By", "item": "https://golfsimmap.com/best" },
                  { "@type": "ListItem", "position": 3, "name": "Golfer Type", "item": "https://golfsimmap.com/best/who-its-for" },
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
              <Users className="w-6 h-6 text-masters-green" />
            </div>
          </div>
          <h1 className="text-cream text-3xl md:text-4xl font-bold mb-4">
            Find by Golfer Type
          </h1>
          <p className="text-muted text-lg max-w-2xl">
            Whether you&apos;re a beginner picking up a club for the first time or a scratch golfer 
            looking for serious practice — find venues tailored to your needs.
          </p>
        </div>

        {/* Segment Categories Grid */}
        {segmentCounts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {segmentCounts.map((segment) => (
              <Link
                key={segment.slug}
                href={`/best/who-its-for/${segment.slug.replace(/_/g, "-")}`}
                className="group block border border-default bg-charcoal rounded-lg p-6 hover:border-masters-green/50 hover:bg-masters-green/5 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-cream text-xl font-semibold group-hover:text-masters-green transition-colors">
                    {segment.label}
                  </h2>
                  <ArrowRight className="w-5 h-5 text-muted group-hover:text-masters-green transition-colors" />
                </div>
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
              <h2 className="text-cream text-lg font-semibold mb-2">No venue segments yet</h2>
              <p className="text-muted">
                We haven&apos;t categorized venues by golfer type yet. Check back soon!
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
