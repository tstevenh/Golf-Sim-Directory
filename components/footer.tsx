import Link from "next/link";
import Image from "next/image";
import { Mail } from "lucide-react";
/* eslint-disable @next/next/no-img-element */

const footerLinks = {
  discover: [
    { label: "Search Venues", href: "/search" },
    { label: "Browse by State", href: "/venue/us" },
    { label: "Best By Category", href: "/best" },
    { label: "Submit Venue", href: "/submit" },
  ],
  forOwners: [
    { label: "Claim Listing", href: "/claim" },
    { label: "Business Dashboard", href: "/dashboard" },
    { label: "Submit Venue", href: "/submit" },
    { label: "Support", href: "mailto:tim@golfsimmap.com" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Blog", href: "/blog" },
  ],
  legal: [
    { label: "Terms", href: "/terms" },
    { label: "Privacy", href: "/privacy" },
  ],
};

// Top states for footer - most populous states with indoor golf venues
const topStates = [
  { name: "California", slug: "california" },
  { name: "Texas", slug: "texas" },
  { name: "Florida", slug: "florida" },
  { name: "New York", slug: "new-york" },
  { name: "Illinois", slug: "illinois" },
  { name: "Pennsylvania", slug: "pennsylvania" },
  { name: "Ohio", slug: "ohio" },
  { name: "Georgia", slug: "georgia" },
  { name: "North Carolina", slug: "north-carolina" },
  { name: "Michigan", slug: "michigan" },
  { name: "New Jersey", slug: "new-jersey" },
  { name: "Virginia", slug: "virginia" },
  { name: "Washington", slug: "washington" },
  { name: "Arizona", slug: "arizona" },
  { name: "Massachusetts", slug: "massachusetts" },
  { name: "Tennessee", slug: "tennessee" },
  { name: "Indiana", slug: "indiana" },
  { name: "Missouri", slug: "missouri" },
  { name: "Colorado", slug: "colorado" },
];

// Top cities for footer
const topCities = [
  { name: "Chicago", stateSlug: "illinois" },
  { name: "New York", stateSlug: "new-york" },
  { name: "Los Angeles", stateSlug: "california" },
  { name: "Houston", stateSlug: "texas" },
  { name: "Phoenix", stateSlug: "arizona" },
  { name: "Philadelphia", stateSlug: "pennsylvania" },
  { name: "San Antonio", stateSlug: "texas" },
  { name: "San Diego", stateSlug: "california" },
  { name: "Dallas", stateSlug: "texas" },
  { name: "Austin", stateSlug: "texas" },
  { name: "Jacksonville", stateSlug: "florida" },
  { name: "Columbus", stateSlug: "ohio" },
  { name: "Charlotte", stateSlug: "north-carolina" },
  { name: "Indianapolis", stateSlug: "indiana" },
  { name: "Seattle", stateSlug: "washington" },
  { name: "Denver", stateSlug: "colorado" },
  { name: "Boston", stateSlug: "massachusetts" },
  { name: "Nashville", stateSlug: "tennessee" },
  { name: "Detroit", stateSlug: "michigan" },
  { name: "Oklahoma City", stateSlug: "oklahoma" },
  { name: "Portland", stateSlug: "oregon" },
  { name: "Las Vegas", stateSlug: "nevada" },
  { name: "Louisville", stateSlug: "kentucky" },
  { name: "Milwaukee", stateSlug: "wisconsin" },
  { name: "Baltimore", stateSlug: "maryland" },
  { name: "Albuquerque", stateSlug: "new-mexico" },
  { name: "Tucson", stateSlug: "arizona" },
  { name: "Mesa", stateSlug: "arizona" },
  { name: "Atlanta", stateSlug: "georgia" },
  { name: "Raleigh", stateSlug: "north-carolina" },
  { name: "Miami", stateSlug: "florida" },
  { name: "San Francisco", stateSlug: "california" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-charcoal border-t border-subtle">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-6 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
              <div className="w-20 h-20 flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="GolfSimMap logo"
                  width={80}
                  height={80}
                  className="h-20 w-20 object-contain"
                />
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
              <a 
                href="mailto:tim@golfsimmap.com" 
                className="flex items-center gap-2 text-sm text-muted hover:text-cream transition-colors"
              >
                <Mail className="w-4 h-4" />
                tim@golfsimmap.com
              </a>
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
                  {link.href.startsWith("mailto:") ? (
                    <a 
                      href={link.href}
                      className="text-sm text-cream-subtle hover:text-cream transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link 
                      href={link.href}
                      className="text-sm text-cream-subtle hover:text-cream transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
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

        {/* Popular States */}
        <div className="mt-12 pt-8 border-t border-subtle">
          <h4 className="text-xs text-muted uppercase tracking-wider mb-4">Popular States</h4>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {topStates.map((state) => (
              <Link
                key={state.slug}
                href={`/venue/us/${state.slug}`}
                className="text-xs text-muted hover:text-cream transition-colors"
              >
                Golf Simulators in {state.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Popular Cities */}
        <div className="mt-12 pt-8 border-t border-subtle">
          <h4 className="text-xs text-muted uppercase tracking-wider mb-4">Popular Cities</h4>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {topCities.map((city) => (
              <Link
                key={city.name}
                href={`/venue/us/${city.stateSlug}/${city.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-xs text-muted hover:text-cream transition-colors"
              >
                Golf Simulators in {city.name}
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
              © {currentYear} GolfSimMap. All rights reserved.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <a
                  href="https://startupfa.me/s/golfsimmap?utm_source=golfsimmap.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex"
                >
                  <img
                    src="https://startupfa.me/badges/featured-badge-small.webp"
                    alt="GolfSimMap - Featured on Startup Fame"
                    width="224"
                    height="36"
                    loading="lazy"
                    decoding="async"
                    className="h-7 w-auto opacity-90 hover:opacity-100 transition-opacity"
                  />
                </a>
                <a
                  href="https://foundrlist.com/product/golfsimmap"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex"
                >
                  <img
                    src="https://foundrlist.com/api/badge/golfsimmap"
                    alt="Live on FoundrList"
                    width="180"
                    height="72"
                    loading="lazy"
                    decoding="async"
                    className="h-7 w-auto opacity-90 hover:opacity-100 transition-opacity"
                  />
                </a>
                <a
                  href="https://trylaunch.ai/launch/golfsimmap"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex"
                >
                  <img
                    src="https://trylaunch.ai/badges/badge-color.png"
                    alt="Featured on Launch"
                    width="180"
                    height="53"
                    loading="lazy"
                    decoding="async"
                    className="h-7 w-auto opacity-90 hover:opacity-100 transition-opacity"
                  />
                </a>
                <a
                  href="https://shipybara.com/projects/golfsimmap"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex"
                >
                  <img
                    src="https://shipybara.com/images/badges/shipybara-badge-light.svg"
                    alt="Featured on Shipybara"
                    width="150"
                    height="54"
                    loading="lazy"
                    decoding="async"
                    className="h-7 w-auto opacity-90 hover:opacity-100 transition-opacity"
                  />
                </a>
                <a
                  href="https://turbo0.com/item/golfsimmap"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex"
                >
                  <img
                    src="https://img.turbo0.com/badge-listed-light.svg"
                    alt="Listed on Turbo0"
                    width="180"
                    height="54"
                    loading="lazy"
                    decoding="async"
                    className="h-7 w-auto opacity-90 hover:opacity-100 transition-opacity"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
