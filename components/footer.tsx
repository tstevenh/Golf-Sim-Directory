import Link from "next/link";
import { Facebook, Twitter, Instagram, Youtube, Mail } from "lucide-react";

const footerLinks = {
  discover: [
    { label: "Search Venues", href: "/search" },
    { label: "Popular Cities", href: "/cities" },
    { label: "By State", href: "/states" },
    { label: "Launch Monitors", href: "/compare/launch-monitors" },
    { label: "New Listings", href: "/new" },
  ],
  forOwners: [
    { label: "Claim Listing", href: "/claim" },
    { label: "Business Dashboard", href: "/dashboard" },
    { label: "Pricing", href: "/business/pricing" },
    { label: "Success Stories", href: "/business/success-stories" },
    { label: "Support", href: "/support" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Careers", href: "/careers" },
    { label: "Press", href: "/press" },
    { label: "Blog", href: "/blog" },
  ],
  legal: [
    { label: "Terms", href: "/terms" },
    { label: "Privacy", href: "/privacy" },
    { label: "Cookies", href: "/cookies" },
  ],
};

const topCities = [
  "Chicago", "New York", "Los Angeles", "Houston", "Phoenix",
  "Philadelphia", "San Antonio", "San Diego", "Dallas", "Austin",
  "Jacksonville", "Columbus", "Charlotte", "Indianapolis", "Seattle",
];

export function Footer() {
  return (
    <footer className="bg-charcoal border-t border-subtle">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-6 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
              <div className="w-10 h-10 border border-masters-green flex items-center justify-center">
                <span className="text-masters-green font-mono font-bold">GSM</span>
              </div>
              <span className="text-xl font-semibold text-cream group-hover:text-masters-green transition-colors">
                GolfSimMap
              </span>
            </Link>
            
            <p className="text-muted text-sm mb-6 max-w-xs leading-relaxed">
              The definitive directory for indoor golf simulator venues across the USA. 
              Find, compare, and book your next golf session.
            </p>
            
            {/* Contact */}
            <div className="space-y-2 mb-6">
              <Link 
                href="mailto:hello@golfsimmap.com" 
                className="flex items-center gap-2 text-sm text-muted hover:text-cream transition-colors"
              >
                <Mail className="w-4 h-4" />
                hello@golfsimmap.com
              </Link>
            </div>

            {/* Social Links */}
            <div className="flex gap-2">
              {[
                { icon: Facebook, label: "Facebook" },
                { icon: Twitter, label: "Twitter" },
                { icon: Instagram, label: "Instagram" },
                { icon: Youtube, label: "YouTube" },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href={`https://${label.toLowerCase()}.com/golfsimmap`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border border-subtle flex items-center justify-center text-muted hover:border-masters-green hover:text-masters-green transition-colors"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          <div>
            <h4 className="text-xs text-muted uppercase tracking-wider mb-4">Discover</h4>
            <ul className="space-y-2">
              {footerLinks.discover.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-cream-subtle hover:text-cream transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs text-muted uppercase tracking-wider mb-4">For Owners</h4>
            <ul className="space-y-2">
              {footerLinks.forOwners.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-cream-subtle hover:text-cream transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs text-muted uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-cream-subtle hover:text-cream transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs text-muted uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-cream-subtle hover:text-cream transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* City Sitemap */}
        <div className="mt-12 pt-8 border-t border-subtle">
          <h4 className="text-xs text-muted uppercase tracking-wider mb-4">Popular Cities</h4>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {topCities.map((city) => (
              <Link
                key={city}
                href={`/venue/us/${city.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-xs text-muted hover:text-cream transition-colors"
              >
                Golf Simulators in {city}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-xs text-muted">
              © {new Date().getFullYear()} GolfSimMap. All rights reserved.
            </p>
            <p className="text-xs text-muted">
              Data updated daily from 10,000+ verified venues across the USA.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
