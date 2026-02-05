"use client";

import { useState, useEffect, useRef } from "react";
import { TrendingUp } from "lucide-react";
import { CityCard, StateLink } from "@/components/location/LocationCards";

interface City {
  name: string;
  stateCode: string;
  stateSlug: string;
  slug: string;
  venueCount: number;
}

interface PopularCitiesProps {
  cities: City[];
}

// Hardcoded states data
const states = [
  { name: "California", code: "ca", count: 312 },
  { name: "Texas", code: "tx", count: 287 },
  { name: "Florida", code: "fl", count: 245 },
  { name: "New York", code: "ny", count: 198 },
  { name: "Illinois", code: "il", count: 156 },
  { name: "Pennsylvania", code: "pa", count: 134 },
  { name: "Ohio", code: "oh", count: 123 },
  { name: "Georgia", code: "ga", count: 112 },
];

export function PopularCities({ cities }: PopularCitiesProps) {
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

  const displayCities = cities.length > 0 ? cities.slice(0, 12) : [];

  return (
    <section
      ref={sectionRef}
      id="cities"
      className="relative py-24 md:py-32 bg-deep-black overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="/scorecard-vintage.jpg"
          alt=""
          className="w-full h-full object-cover opacity-5"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={`mb-12 md:mb-16 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-masters-green" />
            <span className="text-masters-green text-xs font-mono uppercase tracking-widest">
              Explore
            </span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between">
            <h2 className="text-cream">
              Find Venues
              <br />
              <span className="text-muted">By City</span>
            </h2>
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <TrendingUp className="w-4 h-4 text-masters-green" />
              <span className="text-sm text-muted">
                Updated daily from our growing database
              </span>
            </div>
          </div>
        </div>

        {/* Cities Grid - 4 columns matching state page */}
        {displayCities.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-12">
            {displayCities.map((city, index) => (
              <div
                key={city.slug}
                className={`transition-all duration-700 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <CityCard
                  cityName={city.name}
                  stateCode={city.stateCode}
                  venueCount={city.venueCount}
                  href={`/venue/us/${city.stateSlug}/${city.slug}`}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-default mb-12">
            <p className="text-muted">No cities available yet. Check back soon!</p>
          </div>
        )}

        {/* Browse by State */}
        <div
          className={`transition-all duration-700 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xs text-muted uppercase tracking-wider">
              Or Browse by State
            </span>
            <div className="flex-1 h-px bg-subtle" />
          </div>

          <div className="flex flex-wrap gap-2">
            {states.map((state) => (
              <StateLink
                key={state.code}
                stateName={state.name}
                venueCount={state.count}
                href={`/venue/us/${state.name.toLowerCase().replace(/\s+/g, "-")}`}
              />
            ))}
          </div>
        </div>

        {/* Info Cards */}
        <div
          className={`mt-12 p-6 border border-default bg-slate transition-all duration-700 delay-400 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-cream mb-3">Why Indoor Golf?</h3>
              <p className="text-sm text-muted leading-relaxed">
                Indoor golf simulators let you play year-round, regardless of
                weather. Practice your swing, play famous courses from around
                the world, and get detailed data on every shot with
                professional-grade launch monitors.
              </p>
            </div>
            <div>
              <h3 className="text-cream mb-3">What to Expect</h3>
              <p className="text-sm text-muted leading-relaxed">
                Most venues offer hourly bay rentals, with prices ranging from
                $30-100 per hour depending on location and technology. Many
                feature food and drink, making them perfect for date nights,
                corporate events, or practicing your game.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
