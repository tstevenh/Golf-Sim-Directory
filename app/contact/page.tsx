import { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact GolfSimMap — Questions & Partnerships",
  description: "Have a question about a venue listing? Want to partner with GolfSimMap? Get in touch with our team.",
};

const TALLY_FORM_URL = "https://tally.so/r/OD58rA?transparentBackground=true";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-deep-black py-12">
      <div className="absolute inset-0 scorecard-grid opacity-20" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-masters-green" />
            <span className="text-masters-green text-xs font-mono uppercase tracking-widest">Contact</span>
          </div>
          <h1 className="text-cream text-3xl md:text-4xl mb-4">Get in Touch</h1>
          <p className="text-muted max-w-2xl">
            Have a question about a venue? Want to suggest a new listing? 
            We&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form - Tally Embed */}
          <div className="lg:col-span-2">
            <div className="border border-default bg-charcoal p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 border border-masters-green flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-masters-green" />
                </div>
                <h2 className="text-cream text-lg">Send a Message</h2>
              </div>

              {/* Tally Form Embed */}
              <div className="w-full">
                <iframe
                  src={TALLY_FORM_URL}
                  width="100%"
                  height="500"
                  frameBorder="0"
                  marginHeight={0}
                  marginWidth={0}
                  title="Contact Form"
                  className="bg-transparent"
                >
                  Loading form...
                </iframe>
              </div>

              {/* Fallback note */}
              <p className="text-muted text-sm mt-4 border-t border-subtle pt-4">
                Form not loading? Email us directly at{" "}
                <a
                  href="mailto:tim@golfsimmap.com"
                  className="text-masters-green hover:text-cream transition-colors"
                >
                  tim@golfsimmap.com
                </a>
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Email */}
            <div className="border border-default bg-charcoal p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 border border-masters-green flex items-center justify-center">
                  <Mail className="w-5 h-5 text-masters-green" />
                </div>
                <h3 className="text-cream">Email</h3>
              </div>
              <p className="text-muted text-sm mb-3">
                For general inquiries and support:
              </p>
              <a
                href="mailto:tim@golfsimmap.com"
                className="text-masters-green hover:text-cream transition-colors"
              >
                tim@golfsimmap.com
              </a>
            </div>

            {/* Venue Owners */}
            <div className="border border-default bg-charcoal p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 border border-masters-green flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-masters-green" />
                </div>
                <h3 className="text-cream">Venue Owners</h3>
              </div>
              <p className="text-muted text-sm mb-4">
                Quick actions for venue owners:
              </p>
              <div className="space-y-2">
                <Link
                  href="/claim"
                  className="block text-masters-green hover:text-cream transition-colors text-sm"
                >
                  Claim your listing →
                </Link>
                <Link
                  href="/submit"
                  className="block text-masters-green hover:text-cream transition-colors text-sm"
                >
                  Submit a new venue →
                </Link>
              </div>
            </div>

            {/* Response Time */}
            <div className="border border-default bg-charcoal p-6">
              <h3 className="text-cream mb-3">Response Time</h3>
              <p className="text-muted text-sm">
                We typically respond within 1-2 business days. For urgent venue-related 
                issues, use the claim/submit forms for faster processing.
              </p>
            </div>
          </div>
        </div>

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
