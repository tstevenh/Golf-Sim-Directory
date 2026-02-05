import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us | GolfSimMap",
  description: "Learn about GolfSimMap, the definitive directory for indoor golf simulator venues across the USA.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-deep-black py-12">
      <div className="absolute inset-0 scorecard-grid opacity-20" />
      
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-masters-green" />
            <span className="text-masters-green text-xs font-mono uppercase tracking-widest">About</span>
          </div>
          <h1 className="text-cream mb-4">About GolfSimMap</h1>
        </div>

        <div className="prose prose-invert max-w-none">
          <p className="text-muted text-lg mb-6">
            GolfSimMap is the definitive directory for indoor golf simulator venues across the USA. 
            Our mission is to help golfers find the perfect place to practice, play, and improve their game.
          </p>

          <h2 className="text-cream text-xl mt-8 mb-4">What We Do</h2>
          <p className="text-muted mb-4">
            We track thousands of indoor golf venues, from simulator bars with full food and drink service 
            to serious training facilities with professional-grade launch monitors. Whether you&apos;re looking 
            for a fun night out or dedicated practice time, we help you find the right spot.
          </p>

          <h2 className="text-cream text-xl mt-8 mb-4">Our Data</h2>
          <p className="text-muted mb-4">
            Every venue in our directory is researched and verified. We collect information on:
          </p>
          <ul className="text-muted list-disc list-inside mb-4 space-y-2">
            <li>Simulator hardware and software</li>
            <li>Pricing and booking options</li>
            <li>Amenities and atmosphere</li>
            <li>User reviews and ratings</li>
          </ul>

          <h2 className="text-cream text-xl mt-8 mb-4">For Venue Owners</h2>
          <p className="text-muted mb-4">
            Own a golf simulator venue? <Link href="/claim" className="text-masters-green hover:text-cream">Claim your listing</Link> to 
            update your information, respond to reviews, and reach more golfers.
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
