import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for GolfSimMap - the indoor golf simulator directory.",
  alternates: {
    canonical: "https://golfsimmap.com/terms",
  },
  openGraph: {
    title: "Terms of Service",
    description: "Terms of Service for GolfSimMap - the indoor golf simulator directory.",
    type: "website",
    url: "https://golfsimmap.com/terms",
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-deep-black py-12">
      <div className="absolute inset-0 scorecard-grid opacity-20" />
      
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-masters-green" />
            <span className="text-masters-green text-xs font-mono uppercase tracking-widest">Legal</span>
          </div>
          <h1 className="text-cream mb-4">Terms of Service</h1>
        </div>

        <div className="prose prose-invert max-w-none text-muted">
          <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>

          <h2 className="text-cream text-lg mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing and using GolfSimMap, you accept and agree to be bound by the terms 
            and provisions of this agreement.
          </p>

          <h2 className="text-cream text-lg mt-8 mb-4">2. Use of Service</h2>
          <p className="mb-4">
            GolfSimMap provides a directory of indoor golf simulator venues. Information is 
            provided for informational purposes only. We do not guarantee accuracy of venue 
            information, pricing, or availability.
          </p>

          <h2 className="text-cream text-lg mt-8 mb-4">3. Venue Listings</h2>
          <p className="mb-4">
            Venue owners may claim and manage their listings. You are responsible for maintaining 
            accurate information about your venue.
          </p>

          <h2 className="text-cream text-lg mt-8 mb-4">4. Limitation of Liability</h2>
          <p className="mb-4">
            GolfSimMap is not responsible for any disputes between users and venues. All bookings 
            and transactions are between you and the venue directly.
          </p>

          <h2 className="text-cream text-lg mt-8 mb-4">5. Changes to Terms</h2>
          <p className="mb-4">
            We reserve the right to modify these terms at any time. Continued use of the service 
            constitutes acceptance of updated terms.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-subtle">
          <Link href="/" className="text-muted hover:text-cream transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
