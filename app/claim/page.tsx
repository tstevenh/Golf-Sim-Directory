import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { VenueCard } from "@/components/venue/VenueCard";
import { getStateSlug } from "@/lib/states";

export const metadata: Metadata = {
  title: "Claim Your Venue | GolfSimMap",
  description: "Claim your golf simulator venue listing to verify details, update photos, and attract more golfers.",
};

export default async function ClaimPage() {
  const unverifiedVenues = await db.venue.findMany({
    where: { status: "active", claimed: false },
    orderBy: [{ name: "asc" }],
    take: 12,
  });

  return (
    <div className="min-h-screen bg-deep-black py-12">
      <div className="absolute inset-0 scorecard-grid opacity-20" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-masters-green" />
            <span className="text-masters-green text-xs font-mono uppercase tracking-widest">For Owners</span>
          </div>
          <h1 className="text-cream mb-2">Claim Your Venue</h1>
          <p className="text-muted max-w-2xl">
            Own a golf simulator venue? Claim your listing to verify details, update photos, and show up higher in search results.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="border border-default bg-charcoal p-6">
            <h2 className="text-cream mb-4">Why claim your listing?</h2>
            <ul className="space-y-3 text-muted">
              <li className="flex items-start gap-2">
                <span className="text-masters-green">✓</span>
                <span>Verified badge builds trust with golfers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-masters-green">✓</span>
                <span>Update hours, pricing, and booking links anytime</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-masters-green">✓</span>
                <span>Add photos and highlight your best features</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-masters-green">✓</span>
                <span>Appear higher in search and best-by pages</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-masters-green">✓</span>
                <span>Respond to corrections and feedback</span>
              </li>
            </ul>
          </div>

          <div className="border border-default bg-charcoal p-6">
            <h2 className="text-cream mb-4">How it works</h2>
            <ol className="space-y-3 text-muted">
              <li className="flex items-start gap-2">
                <span className="text-masters-green font-mono">1.</span>
                <span>Find your venue below or search for it</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-masters-green font-mono">2.</span>
                <span>Click &quot;Claim this venue&quot; on the listing page</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-masters-green font-mono">3.</span>
                <span>Verify ownership (email or phone)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-masters-green font-mono">4.</span>
                <span>We review and approve within 24-48 hours</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-masters-green font-mono">5.</span>
                <span>Manage your listing from the dashboard</span>
              </li>
            </ol>
          </div>
        </div>

        <div className="border border-default bg-charcoal p-6 mb-12">
          <h2 className="text-cream mb-4">Don&apos;t see your venue?</h2>
          <p className="text-muted mb-4">
            If your venue isn&apos;t listed yet, submit it first. Once it&apos;s live, you can claim and verify it.
          </p>
          <Link href="/submit" className="btn-primary inline-block">
            Submit a venue
          </Link>
        </div>

        {unverifiedVenues.length > 0 && (
          <section>
            <h2 className="text-cream mb-6">Unclaimed venues</h2>
            <p className="text-muted mb-6">
              These venues haven&apos;t been claimed yet. If you own one, click through to claim it.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {unverifiedVenues.map((venue) => (
                <VenueCard
                  key={venue.id}
                  id={venue.id}
                  slug={venue.slug}
                  name={venue.name}
                  city={venue.city}
                  state={venue.state}
                  heroImage={venue.heroImage}
                  shortDescription={venue.shortDescription}
                  venueType={venue.venueType}
                  simulatorSystems={venue.simulatorSystems as string[] | null}
                  launchMonitorType={venue.launchMonitorType}
                  priceRangeMin={venue.priceRangeMin}
                  priceRangeMax={venue.priceRangeMax}
                  ratingOverall={venue.ratingOverall}
                  featured={venue.featured}
                  tags={venue.tags}
                  href={`/venue/us/${getStateSlug(venue.state)}/${venue.city.toLowerCase().replace(/\s+/g, "-")}/${venue.slug}`}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
