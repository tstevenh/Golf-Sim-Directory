import Link from "next/link";
import { Flag, ArrowLeft, Search } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-deep-black flex items-center justify-center py-12 px-4">
      <div className="absolute inset-0 scorecard-grid opacity-20" />
      
      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {/* Golf Flag Icon */}
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 border-2 border-masters-green rounded-full flex items-center justify-center bg-charcoal">
            <Flag className="w-12 h-12 text-masters-green" strokeWidth={1.5} />
          </div>
        </div>

        {/* Eyebrow */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-8 h-px bg-masters-green" />
          <span className="text-masters-green text-xs font-mono uppercase tracking-widest">
            404 — Out of Bounds
          </span>
          <div className="w-8 h-px bg-masters-green" />
        </div>

        {/* Main Title */}
        <h1 className="text-cream text-4xl md:text-5xl mb-4">
          Page Not Found
        </h1>

        {/* Description */}
        <p className="text-muted text-lg mb-8 max-w-md mx-auto">
          Looks like your shot went a bit wide. The page you&apos;re looking for 
          doesn&apos;t exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="btn-primary"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <Link
            href="/search"
            className="px-6 py-3 border border-default text-muted hover:border-masters-green hover:text-cream transition-colors"
          >
            <Search className="w-4 h-4 inline-block mr-2" />
            Find a Venue
          </Link>
        </div>

        {/* Golf ball divider */}
        <div className="mt-12 flex items-center justify-center gap-4">
          <div className="w-16 h-px bg-subtle" />
          <div className="w-3 h-3 rounded-full bg-masters-green/30" />
          <div className="w-16 h-px bg-subtle" />
        </div>

        {/* Helpful links */}
        <div className="mt-8 text-sm text-muted">
          <p>Try these instead:</p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-3">
            <Link href="/best" className="text-masters-green hover:text-cream transition-colors">
              Best Venues
            </Link>
            <span className="text-subtle">•</span>
            <Link href="/launch-monitors" className="text-masters-green hover:text-cream transition-colors">
              Launch Monitors
            </Link>
            <span className="text-subtle">•</span>
            <Link href="/blog" className="text-masters-green hover:text-cream transition-colors">
              Blog
            </Link>
            <span className="text-subtle">•</span>
            <Link href="/contact" className="text-masters-green hover:text-cream transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
