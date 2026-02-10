"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Building2, CheckCircle, ArrowRight } from "lucide-react";

const benefits = [
  "Claim your venue listing",
  "Update photos and information",
  "Respond to reviews",
  "Access analytics dashboard",
];

export function BusinessCTA() {
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
      <div className="absolute inset-0 scorecard-grid opacity-30" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`border border-default p-8 md:p-12 lg:p-16 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-px bg-masters-green" />
                <span className="text-masters-green text-xs font-mono uppercase tracking-widest">
                  For Business Owners
                </span>
              </div>

              <h2 className="text-cream mb-4">
                Own a Golf Simulator Venue?
                <br />
                <span className="text-muted">Get Listed Free</span>
              </h2>

              <p className="text-muted mb-8">
                Get your golf simulator venue listed on GolfSimMap. Claim your
                listing to manage your profile, respond to reviews, and attract
                more golfers to your business.
              </p>

              <div className="space-y-3 mb-8">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-masters-green" />
                    <span className="text-cream-subtle">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/claim" className="btn-primary">
                  <Building2 className="w-4 h-4" />
                  <span>Claim Your Venue</span>
                </Link>
                <Link href="/submit" className="btn-outline">
                  <span>Add New Venue</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] border border-default overflow-hidden">
                <img
                  src="/hero-golf-simulator.jpg"
                  alt="Golf simulator venue"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-transparent to-transparent" />
              </div>

              <div className="absolute -bottom-6 -left-6 p-6 bg-charcoal border border-default">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <span className="block text-3xl font-mono font-bold text-masters-green">
                      Free
                    </span>
                    <span className="text-xs text-muted uppercase tracking-wider">
                      Listing
                    </span>
                  </div>
                  <div className="w-px h-12 bg-default" />
                  <div className="text-center">
                    <span className="block text-3xl font-mono font-bold text-cream">
                      More
                    </span>
                    <span className="text-xs text-muted uppercase tracking-wider">
                      Visibility
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
