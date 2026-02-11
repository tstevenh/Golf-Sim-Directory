"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, ArrowRight, Building2 } from "lucide-react";

export default function ClaimPage() {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
    }
  };

  return (
    <div className="min-h-screen bg-deep-black py-12">
      <div className="absolute inset-0 scorecard-grid opacity-20" />
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-px bg-masters-green" />
            <span className="text-masters-green text-xs font-mono uppercase tracking-widest">For Owners</span>
            <div className="w-8 h-px bg-masters-green" />
          </div>
          <h1 className="text-cream text-3xl md:text-4xl mb-4">Claim Your Venue</h1>
          <p className="text-muted max-w-2xl mx-auto">
            Own a golf simulator venue? Find your listing and claim it to verify details, 
            update photos, and show up higher in search results.
          </p>
        </div>

        {/* Search Section */}
        <section className="mb-12 border border-default bg-charcoal p-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 border border-masters-green flex items-center justify-center">
              <Building2 className="w-6 h-6 text-masters-green" />
            </div>
          </div>
          <h2 className="text-cream text-xl text-center mb-2">Find Your Venue</h2>
          <p className="text-muted text-center mb-6 text-sm">
            Search by venue name to find your listing
          </p>

          <form onSubmit={handleSearch} className="max-w-xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type="text"
                  placeholder="Enter your venue name"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="golf-input !pl-12 w-full"
                  aria-label="Search for your venue"
                />
              </div>
              <button type="submit" className="btn-primary whitespace-nowrap">
                <span>Search</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          <p className="text-muted text-center text-sm mt-4">
            Not listed yet?{" "}
            <Link href="/submit" className="text-masters-green hover:text-cream transition-colors">
              Submit your venue first →
            </Link>
          </p>
        </section>

        {/* Benefits & How it works */}
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
                <span>Search for your venue above</span>
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

        {/* Submit CTA */}
        <section className="border border-default bg-charcoal p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-cream mb-2">Don&apos;t see your venue?</h2>
              <p className="text-muted text-sm">
                If your venue isn&apos;t listed yet, submit it first. Once it&apos;s live, you can claim and verify it.
              </p>
            </div>
            <Link href="/submit" className="btn-primary whitespace-nowrap">
              Submit a venue
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
