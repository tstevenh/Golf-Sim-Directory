"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { VenueCard } from "@/components/venue/VenueCard";
import { getStateSlug } from "@/lib/states";

interface Venue {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string;
  heroImage: string | null;
  shortDescription: string | null;
  venueType: string;
  simulatorSystems: string[] | null;
  launchMonitorType: string;
  priceRangeMin: number | null;
  priceRangeMax: number | null;
  ratingOverall: number | null;
  featured: boolean;
  tags: string[];
  vibeTags: string[];
}

interface FeaturedVenuesProps {
  venues: Venue[];
}

export function FeaturedVenues({ venues }: FeaturedVenuesProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // If no venues from DB, show a message
  if (venues.length === 0) {
    return (
      <section
        ref={sectionRef}
        className="relative py-24 md:py-32 bg-deep-black overflow-hidden"
      >
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-cream mb-4">Top Rated Venues</h2>
          <p className="text-muted">
            No venues found. Check back soon as we add more locations!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="relative py-24 md:py-32 bg-deep-black overflow-hidden"
    >
      <div className="absolute inset-0">
        <img
          src="/fairway-aerial.jpg"
          alt=""
          className="w-full h-full object-cover opacity-10"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex flex-col md:flex-row md:items-end md:justify-between mb-12 md:mb-16 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-masters-green" />
              <span className="text-masters-green text-xs font-mono uppercase tracking-widest">
                Featured
              </span>
            </div>
            <h2 className="text-cream">
              Top Rated
              <br />
              <span className="text-muted">Venues</span>
            </h2>
          </div>
          <Link
            href="/venue/us"
            className="inline-flex items-center gap-2 text-masters-green hover:text-cream transition-colors mt-6 md:mt-0 group"
          >
            <span className="text-sm uppercase tracking-wider">View All</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>
        </div>

        {/* Venue Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((venue, index) => (
            <div
              key={venue.id}
              className={`transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <VenueCard
                id={venue.id}
                slug={venue.slug}
                name={venue.name}
                city={venue.city}
                state={venue.state}
                heroImage={venue.heroImage}
                shortDescription={venue.shortDescription}
                venueType={venue.venueType}
                simulatorSystems={venue.simulatorSystems}
                launchMonitorType={venue.launchMonitorType}
                priceRangeMin={venue.priceRangeMin}
                priceRangeMax={venue.priceRangeMax}
                ratingOverall={venue.ratingOverall}
                featured={venue.featured}
                tags={venue.tags}
                href={`/venue/us/${getStateSlug(venue.state)}/${venue.city.toLowerCase().replace(/\s+/g, "-")}/${venue.slug}`}
              />
            </div>
          ))}
        </div>

        {/* City Links */}
        <div
          className={`mt-12 pt-8 border-t border-subtle transition-all duration-700 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <span className="text-xs text-muted uppercase tracking-wider block mb-4">
            Popular Searches
          </span>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {[
              { name: "Chicago", state: "IL", stateSlug: "illinois" },
              { name: "New York", state: "NY", stateSlug: "new-york" },
              { name: "Los Angeles", state: "CA", stateSlug: "california" },
              { name: "Dallas", state: "TX", stateSlug: "texas" },
              { name: "Miami", state: "FL", stateSlug: "florida" },
            ].map((city) => (
              <Link
                key={`${city.name}-${city.state}`}
                href={`/venue/us/${city.stateSlug}/${city.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="city-link"
              >
                Golf Simulators in {city.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
