"use client";

import { useState, useEffect, useRef } from "react";
import { Search, MapPin, CalendarCheck } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Search",
    description:
      "Enter your location to find indoor golf venues within driving distance. Filter by launch monitor, price, and amenities.",
  },
  {
    number: "02",
    icon: MapPin,
    title: "Compare",
    description:
      "View detailed venue profiles with equipment specs, real user reviews, and live availability. See what launch monitors they offer.",
  },
  {
    number: "03",
    icon: CalendarCheck,
    title: "Book",
    description:
      "Reserve your bay directly through the venue. Save favorites and get notified when new facilities open nearby.",
  },
];

export function HowItWorks() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 md:py-32 bg-deep-black overflow-hidden"
    >
      <div className="absolute inset-0 scorecard-grid opacity-50" />

      <div className="absolute right-0 top-0 w-1/3 h-full opacity-10">
        <img src="/tees-art.jpg" alt="" className="w-full h-full object-cover" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`mb-16 md:mb-24 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-masters-green" />
            <span className="text-masters-green text-xs font-mono uppercase tracking-widest">
              How It Works
            </span>
          </div>
          <h2 className="text-cream max-w-xl">
            Three Steps to
            <br />
            <span className="text-muted">Your Next Round</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-default">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className={`bg-deep-black p-8 md:p-10 group hover:bg-slate transition-all duration-500 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="flex items-start justify-between mb-8">
                <span
                  className="text-5xl md:text-6xl font-mono font-bold transition-colors"
                  style={{ color: "hsla(var(--cream) / 0.1)" }}
                >
                  {step.number}
                </span>
                <div
                  className="w-12 h-12 border flex items-center justify-center group-hover:border-masters-green transition-colors"
                  style={{ borderColor: "hsla(var(--cream) / 0.1)" }}
                >
                  <step.icon className="w-5 h-5 text-muted group-hover:text-masters-green transition-colors" />
                </div>
              </div>

              <h3 className="text-cream mb-4 text-2xl">{step.title}</h3>
              <p className="text-muted leading-relaxed text-sm">
                {step.description}
              </p>

              <div className="mt-8 pt-6 border-t border-subtle">
                <div className="h-px w-0 group-hover:w-full bg-masters-green transition-all duration-500" />
              </div>
            </div>
          ))}
        </div>


      </div>
    </section>
  );
}
