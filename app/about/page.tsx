import { Metadata } from "next";
import Link from "next/link";
import { Target, MapPin, Database, Building2, Users, CheckCircle, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About GolfSimMap — The Indoor Golf Simulator Directory",
  description: "GolfSimMap helps golfers find and compare indoor golf simulator venues across the US. Learn about our mission and how we built the directory.",
  alternates: {
    canonical: "https://golfsimmap.com/about",
  },
  openGraph: {
    title: "About GolfSimMap — The Indoor Golf Simulator Directory",
    description: "GolfSimMap helps golfers find and compare indoor golf simulator venues across the US.",
    type: "website",
    url: "https://golfsimmap.com/about",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-deep-black py-12">
      <div className="absolute inset-0 scorecard-grid opacity-20" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
            <div className="w-8 h-px bg-masters-green" />
            <span className="text-masters-green text-xs font-mono uppercase tracking-widest">About</span>
          </div>
          <h1 className="text-cream text-3xl md:text-4xl mb-4">About GolfSimMap</h1>
          <p className="text-muted text-lg max-w-2xl">
            The most complete directory of indoor golf simulator venues across the USA.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="stat-cell text-center">
            <span className="block text-2xl md:text-3xl font-mono font-bold text-cream">Nationwide</span>
            <span className="text-xs text-muted uppercase tracking-wider">Coverage</span>
          </div>
          <div className="stat-cell text-center">
            <span className="block text-2xl md:text-3xl font-mono font-bold text-masters-green">Verified</span>
            <span className="text-xs text-muted uppercase tracking-wider">Listings</span>
          </div>
          <div className="stat-cell text-center">
            <span className="block text-2xl md:text-3xl font-mono font-bold text-cream">Free</span>
            <span className="text-xs text-muted uppercase tracking-wider">To Use</span>
          </div>
        </div>

        {/* How It Started - Featured Section */}
        <section className="mb-12 border border-default bg-charcoal p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 border border-masters-green flex items-center justify-center shrink-0">
              <Target className="w-6 h-6 text-masters-green" />
            </div>
            <div>
              <h2 className="text-cream text-xl mb-2">How It Started</h2>
              <p className="text-muted text-sm">From frustration to a full database</p>
            </div>
          </div>

          <div className="space-y-4 text-muted">
            <p>
              It started with a simple frustration: finding a place to hit balls in winter
              shouldn&apos;t be this hard.
            </p>
            <p>
              Every search turned up the same handful of big chains. But we knew there had to
              be more options — local sim bars, training studios, pro shops with bays in the
              back. Places that didn&apos;t show up on Google Maps when you searched
              &quot;indoor golf near me.&quot;
            </p>
            <p>
              So we started collecting them. One by one. State by state. A spreadsheet that
              grew into a database. Checking websites, calling venues, noting what hardware
              they used, whether they served food, if you could book online.
            </p>
            <p className="text-cream">
              GolfSimMap is that spreadsheet, turned into something useful for anyone who
              wants to find their next indoor round.
            </p>
          </div>
        </section>

        {/* What We Do - Two Column Cards */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-masters-green" />
            <span className="text-cream text-lg">What We Do</span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-default bg-charcoal p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 border border-masters-green/50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-masters-green" />
                </div>
                <h3 className="text-cream">For Golfers</h3>
              </div>
              <ul className="space-y-3 text-muted text-sm">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-masters-green mt-0.5 shrink-0" />
                  <span>Find venues by location and amenities</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-masters-green mt-0.5 shrink-0" />
                  <span>Compare launch monitor systems</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-masters-green mt-0.5 shrink-0" />
                  <span>Read reviews from other golfers</span>
                </li>
              </ul>
            </div>

            <div className="border border-default bg-charcoal p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 border border-masters-green/50 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-masters-green" />
                </div>
                <h3 className="text-cream">For Venue Owners</h3>
              </div>
              <ul className="space-y-3 text-muted text-sm">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-masters-green mt-0.5 shrink-0" />
                  <span>Claim and manage your listing</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-masters-green mt-0.5 shrink-0" />
                  <span>Respond to reviews and feedback</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-5 text-masters-green mt-0.5 shrink-0" />
                  <span>Reach golfers actively searching</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Our Data */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-masters-green" />
            <span className="text-cream text-lg">Our Data</span>
          </div>

          <div className="border border-default bg-charcoal p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 border border-masters-green/50 flex items-center justify-center shrink-0">
                <Database className="w-5 h-5 text-masters-green" />
              </div>
              <p className="text-muted">
                Every venue is researched and verified. We collect information on:
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "Simulator hardware (TrackMan, Foresight, etc.)",
                "Pricing and booking options",
                "Food, drinks, and amenities",
                "Coaching and private rooms",
                "User reviews and ratings",
                "Hours and location details",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-masters-green shrink-0" />
                  <span className="text-muted text-sm">{item}</span>
                </div>
              ))}
            </div>

            <p className="text-muted text-sm mt-6 pt-4 border-t border-default">
              Information is updated regularly, but we always recommend calling ahead to confirm
              availability and pricing.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border border-masters-green/30 bg-masters-green/5 p-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="w-5 h-5 text-masters-green" />
                <span className="text-masters-green text-xs font-mono uppercase tracking-widest">
                  For Venue Owners
                </span>
              </div>
              <h3 className="text-cream text-xl mb-2">Own a golf simulator venue?</h3>
              <p className="text-muted">
                Claim your free listing to update your information, respond to reviews, 
                and reach more golfers.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/claim" className="btn-primary whitespace-nowrap">
                <Building2 className="w-4 h-4" />
                <span>Claim Listing</span>
              </Link>
              <Link href="/submit" className="btn-outline whitespace-nowrap">
                <span>Add Venue</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Back to Home */}
        <div className="mt-12">
          <Link href="/" className="text-muted hover:text-cream transition-colors text-sm">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
