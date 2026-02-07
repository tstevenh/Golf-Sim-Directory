import { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact GolfSimMap — Questions & Partnerships",
  description: "Have a question about a venue listing? Want to partner with GolfSimMap? Get in touch with our team.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-deep-black py-12">
      <div className="absolute inset-0 scorecard-grid opacity-20" />
      
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-masters-green" />
            <span className="text-masters-green text-xs font-mono uppercase tracking-widest">Contact</span>
          </div>
          <h1 className="text-cream mb-4">Get in Touch</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="border border-default bg-charcoal p-6">
            <h2 className="text-cream text-lg mb-4">Email Us</h2>
            <a 
              href="mailto:hello@golfsimmap.com"
              className="flex items-center gap-3 text-muted hover:text-cream transition-colors"
            >
              <div className="w-10 h-10 border border-masters-green flex items-center justify-center">
                <Mail className="w-5 h-5 text-masters-green" />
              </div>
              <span>hello@golfsimmap.com</span>
            </a>
          </div>

          <div className="border border-default bg-charcoal p-6">
            <h2 className="text-cream text-lg mb-4">Venue Owners</h2>
            <p className="text-muted mb-4">
              Want to claim or submit a venue? Use our dedicated forms:
            </p>
            <div className="space-y-2">
              <Link href="/claim" className="block text-masters-green hover:text-cream">
                Claim your listing →
              </Link>
              <Link href="/submit" className="block text-masters-green hover:text-cream">
                Submit a new venue →
              </Link>
            </div>
          </div>
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
