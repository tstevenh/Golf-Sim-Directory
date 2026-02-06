import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { SEGMENT_CATEGORIES } from "@/lib/best-by-config";
import { Users, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Find Golf Simulators by Occasion | GolfSimMap",
  description: "Discover golf simulator venues perfect for any occasion. Date nights, corporate events, family outings, serious practice, and more.",
};

export const revalidate = 60;

export default async function WhoItsForIndexPage() {
  // Get venue counts for each segment
  const venues = await db.venue.findMany({
    where: { status: "active" },
    select: { whoItsFor: true },
  });

  // Calculate counts for each segment
  const segmentCounts = SEGMENT_CATEGORIES.map((segment) => {
    const count = venues.filter((v) => (v.whoItsFor || []).includes(segment.slug)).length;
    return { ...segment, count };
  }).filter((s) => s.count > 0);

  return (
    <div className="min-h-screen bg-deep-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-muted mb-8">
          <Link href="/" className="hover:text-cream transition-colors">Home</Link>
          <span>/</span>
          <Link href="/best" className="hover:text-cream transition-colors">Best By</Link>
          <span>/</span>
          <span className="text-cream">Occasion</span>
        </nav>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-masters-green/10 border border-masters-green/20">
              <Users className="w-6 h-6 text-masters-green" />
            </div>
          </div>
          <h1 className="text-cream text-3xl md:text-4xl font-bold mb-4">
            Find the Perfect Spot
          </h1>
          <p className="text-muted text-lg max-w-2xl">
            Whether it&apos;s date night, a corporate event, or practice time, 
            discover venues that are perfect for your occasion.
          </p>
        </div>

        {/* Segment Categories Grid */}
        {segmentCounts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {segmentCounts.map((segment) => (
              <Link
                key={segment.slug}
                href={`/best/who-its-for/${segment.slug}`}
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
                We haven&apos;t categorized venues by occasion yet. Check back soon for updates!
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
