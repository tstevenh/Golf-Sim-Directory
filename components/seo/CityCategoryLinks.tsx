"use client";

import Link from "next/link";
import { Sparkles, Users, Monitor, Tag, Radar, Coffee, Laptop } from "lucide-react";
import {
  getCityVibeIndexUrl,
  getCityWhoItsForIndexUrl,
  getCityHardwareIndexUrl,
} from "@/lib/best-by-config";

interface CategoryLink {
  href: string;
  label: string;
  count: number;
}

interface CityCategoryLinksProps {
  state: string;
  city: string;
  vibes: CategoryLink[];
  segments: CategoryLink[];
  hardware: CategoryLink[];
  launchMonitors: CategoryLink[];
  amenities: CategoryLink[];
  software: CategoryLink[];
  tags: CategoryLink[];
}

export function CityCategoryLinks({
  state,
  city,
  vibes,
  segments,
  hardware,
  launchMonitors,
  amenities,
  software,
  tags,
}: CityCategoryLinksProps) {
  // Get index URLs from shared config
  const vibeIndexUrl = getCityVibeIndexUrl(state, city);
  const whoItsForIndexUrl = getCityWhoItsForIndexUrl(state, city);
  const hardwareIndexUrl = getCityHardwareIndexUrl(state, city);

  // Don't render if no categories have venues
  if (
    vibes.length === 0 &&
    segments.length === 0 &&
    hardware.length === 0 &&
    launchMonitors.length === 0 &&
    amenities.length === 0 &&
    software.length === 0 &&
    tags.length === 0
  ) {
    return null;
  }

  return (
    <section className="border border-default bg-charcoal rounded-lg p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-masters-green/10">
          <Sparkles className="w-5 h-5 text-masters-green" />
        </div>
        <span className="text-masters-green text-xs font-mono uppercase tracking-widest">
          Browse Categories
        </span>
      </div>

      <h2 className="text-cream text-xl md:text-2xl font-semibold mb-6">
        Find the Perfect Spot in {city}
      </h2>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Vibe Categories */}
        {vibes.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-masters-green" />
              <h3 className="text-cream font-medium text-sm uppercase tracking-wider">
                By Vibe
              </h3>
            </div>
            <ul className="space-y-2">
              {vibes.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted hover:text-cream transition-colors text-sm flex items-center justify-between group"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-masters-green/50 group-hover:bg-masters-green transition-colors" />
                      Best {link.label}
                    </span>
                    <span className="text-xs text-muted/50">({link.count})</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={vibeIndexUrl}
                  className="text-masters-green hover:text-cream transition-colors text-sm"
                >
                  View all vibes →
                </Link>
              </li>
            </ul>
          </div>
        )}

        {/* Who It's For */}
        {segments.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-masters-green" />
              <h3 className="text-cream font-medium text-sm uppercase tracking-wider">
                By Occasion
              </h3>
            </div>
            <ul className="space-y-2">
              {segments.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted hover:text-cream transition-colors text-sm flex items-center justify-between group"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-masters-green/50 group-hover:bg-masters-green transition-colors" />
                      Best for {link.label}
                    </span>
                    <span className="text-xs text-muted/50">({link.count})</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={whoItsForIndexUrl}
                  className="text-masters-green hover:text-cream transition-colors text-sm"
                >
                  View all occasions →
                </Link>
              </li>
            </ul>
          </div>
        )}

        {/* Hardware */}
        {hardware.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Monitor className="w-4 h-4 text-masters-green" />
              <h3 className="text-cream font-medium text-sm uppercase tracking-wider">
                By Technology
              </h3>
            </div>
            <ul className="space-y-2">
              {hardware.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted hover:text-cream transition-colors text-sm flex items-center justify-between group"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-masters-green/50 group-hover:bg-masters-green transition-colors" />
                      Best {link.label}
                    </span>
                    <span className="text-xs text-muted/50">({link.count})</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={hardwareIndexUrl}
                  className="text-masters-green hover:text-cream transition-colors text-sm"
                >
                  View all tech →
                </Link>
              </li>
            </ul>
          </div>
        )}

        {/* Launch Monitor Types */}
        {launchMonitors.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Radar className="w-4 h-4 text-masters-green" />
              <h3 className="text-cream font-medium text-sm uppercase tracking-wider">
                By Launch Monitor
              </h3>
            </div>
            <ul className="space-y-2">
              {launchMonitors.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted hover:text-cream transition-colors text-sm flex items-center justify-between group"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-masters-green/50 group-hover:bg-masters-green transition-colors" />
                      Best {link.label}
                    </span>
                    <span className="text-xs text-muted/50">({link.count})</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Amenities */}
        {amenities.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Coffee className="w-4 h-4 text-masters-green" />
              <h3 className="text-cream font-medium text-sm uppercase tracking-wider">
                By Amenities
              </h3>
            </div>
            <ul className="space-y-2">
              {amenities.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted hover:text-cream transition-colors text-sm flex items-center justify-between group"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-masters-green/50 group-hover:bg-masters-green transition-colors" />
                      Best {link.label}
                    </span>
                    <span className="text-xs text-muted/50">({link.count})</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Software */}
        {software.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Laptop className="w-4 h-4 text-masters-green" />
              <h3 className="text-cream font-medium text-sm uppercase tracking-wider">
                By Software
              </h3>
            </div>
            <ul className="space-y-2">
              {software.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted hover:text-cream transition-colors text-sm flex items-center justify-between group"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-masters-green/50 group-hover:bg-masters-green transition-colors" />
                      Best {link.label}
                    </span>
                    <span className="text-xs text-muted/50">({link.count})</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tags / Experiences */}
        {tags.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-masters-green" />
              <h3 className="text-cream font-medium text-sm uppercase tracking-wider">
                By Experience
              </h3>
            </div>
            <ul className="space-y-2">
              {tags.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted hover:text-cream transition-colors text-sm flex items-center justify-between group"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-masters-green/50 group-hover:bg-masters-green transition-colors" />
                      Best {link.label}
                    </span>
                    <span className="text-xs text-muted/50">({link.count})</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
