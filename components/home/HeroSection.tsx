"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useRef, useMemo } from "react";
import { Search, ChevronDown, ArrowRight } from "lucide-react";

const launchMonitors = [
  { value: "", label: "Any System" },
  { value: "trackman", label: "TrackMan" },
  { value: "foresight", label: "Foresight" },
  { value: "uneekor", label: "Uneekor" },
  { value: "gcquad", label: "GCQuad" },
  { value: "flightscope", label: "FlightScope" },
  { value: "fullswing", label: "Full Swing" },
  { value: "golfzon", label: "Golfzon" },
  { value: "aboutgolf", label: "AboutGolf" },
  { value: "skytrak", label: "SkyTrak" },
];

function useCountUp(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(easeOut * end));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, hasStarted]);

  // Return stable object to prevent re-renders
  return useMemo(() => ({ count, ref }), [count]);
}

interface HeroSectionProps {
  totalVenues: number;
  totalStates: number;
}

export function HeroSection({ totalVenues, totalStates }: HeroSectionProps) {
  const [query, setQuery] = useState("");
  const [system, setSystem] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const venuesCount = useCountUp(totalVenues || 8, 2500);
  const statesCount = useCountUp(totalStates || 5, 1500);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    // Single search field searches venue name, city, or ZIP code
    if (query.trim()) params.set("q", query.trim());
    if (system) params.set("hardware", system);
    window.location.href = `/search?${params.toString()}`;
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/simulator-cinematic.jpg"
          alt="Indoor golf simulator bay with launch monitor technology"
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ backgroundColor: "hsla(var(--deep-black) / 0.85)" }}
        />
      </div>

      {/* Dimple Texture Overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url(/dimple-texture.jpg)",
          backgroundSize: "300px",
          mixBlendMode: "overlay",
          opacity: 0.06,
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8 md:pt-8 md:pb-12 text-center flex flex-col justify-center min-h-screen">
        <div
          className={`transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
        >
          {/* Eyebrow */}
          <div className="flex items-center justify-center gap-3 mb-4 md:mb-6">
            <div className="w-8 md:w-12 h-px bg-masters-green" />
            <span className="text-masters-green text-[10px] md:text-xs font-mono uppercase tracking-widest">
              Indoor Golf Simulator Directory
            </span>
            <div className="w-8 md:w-12 h-px bg-masters-green" />
          </div>

          {/* Main Headline - H1 for SEO */}
          <h1
            className="text-cream mb-3 md:mb-4 font-bold tracking-tighter"
            style={{
              fontSize: 'clamp(3rem, 12vw, 6rem)',
              lineHeight: 0.95
            }}
          >
            Find Your
            <br />
            <span className="text-masters-green">Perfect</span> Swing
          </h1>

          <p className="text-base md:text-xl text-muted mb-6 md:mb-10 max-w-2xl mx-auto leading-relaxed">
            Discover over{" "}
            <strong className="text-cream">
              {(totalVenues || 8).toLocaleString()} indoor golf simulator venues
            </strong>{" "}
            across the USA. Compare launch monitors, check availability, and
            book your next session.
          </p>

          {/* Search Form */}
          <form
            onSubmit={handleSearch}
            className="space-y-3 md:space-y-4 mb-6 md:mb-10 max-w-xl mx-auto"
            id="search"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type="text"
                  placeholder="Venue, City, or ZIP"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="golf-input !pl-12"
                  aria-label="Search venues"
                />
              </div>

              <div className="relative sm:w-48">
                <select
                  value={system}
                  onChange={(e) => setSystem(e.target.value)}
                  className="golf-input appearance-none cursor-pointer !pl-4"
                  aria-label="Launch Monitor System"
                >
                  {launchMonitors.map((monitor) => (
                    <option key={monitor.value} value={monitor.value}>
                      {monitor.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
              </div>

              <button type="submit" className="btn-primary whitespace-nowrap">
                <span>Search</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Stats */}
          <div
            className="flex flex-wrap justify-center gap-2 md:gap-4"
            // eslint-disable-next-line react-hooks/refs
            ref={venuesCount.ref}
          >
            <div className="stat-cell px-3 py-2 md:px-4 md:py-4">
              <span className="block text-2xl md:text-4xl font-mono font-bold text-cream">
                {/* eslint-disable-next-line react-hooks/refs */}
                {venuesCount.count.toLocaleString()}+
              </span>
              <span className="text-[10px] md:text-xs text-muted uppercase tracking-wider">
                Venues
              </span>
            </div>
            <div
              className="stat-cell px-3 py-2 md:px-4 md:py-4"
              // eslint-disable-next-line react-hooks/refs
              ref={statesCount.ref}
            >
              <span className="block text-2xl md:text-4xl font-mono font-bold text-cream">
                {/* eslint-disable-next-line react-hooks/refs */}
                {statesCount.count}
              </span>
              <span className="text-[10px] md:text-xs text-muted uppercase tracking-wider">
                States
              </span>
            </div>
            <div className="stat-cell px-3 py-2 md:px-4 md:py-4">
              <span className="block text-2xl md:text-4xl font-mono font-bold text-masters-green">
                Live
              </span>
              <span className="text-[10px] md:text-xs text-muted uppercase tracking-wider">
                Availability
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 md:gap-2">
        <span className="text-[10px] md:text-xs text-muted uppercase tracking-widest">
          Scroll
        </span>
        <div className="w-px h-6 md:h-8 bg-masters-green" />
      </div>
    </section>
  );
}
