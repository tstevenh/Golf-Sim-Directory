"use client";

import Link from "next/link";
import { MapPin, Star, Monitor, ArrowUpRight } from "lucide-react";

interface VenueCardProps {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string;
  heroImage: string | null;
  shortDescription: string | null;
  venueType: string;
  simulatorSystems?: string[] | null;
  launchMonitorType?: string;
  priceRangeMin: number | null;
  priceRangeMax: number | null;
  ratingOverall: number | null;
  featured?: boolean;
  tags?: string[];
  href: string;
}

function getSystemCode(type: string): string {
  const codes: Record<string, string> = {
    radar: "RD",
    photometric_camera: "CM",
    hybrid: "HB",
    unknown: "UK",
  };
  return codes[type] || "UK";
}

function formatPrice(min: number | null, max: number | null): string {
  if (!min && !max) return "$?";
  if (min && max) return `$${min}-${max}`;
  if (min) return `$${min}+`;
  if (max) return `Up to $${max}`;
  return "$?";
}

function getPrimarySystem(
  systems: string[] | null | undefined,
  monitorType: string | undefined
): string {
  if (systems && systems.length > 0) {
    return systems[0];
  }
  const typeLabels: Record<string, string> = {
    radar: "Radar System",
    photometric_camera: "Camera System",
    hybrid: "Hybrid System",
    unknown: "Launch Monitor",
  };
  return typeLabels[monitorType || "unknown"] || "Launch Monitor";
}

export function VenueCard({
  slug,
  name,
  city,
  state,
  heroImage,
  shortDescription,
  venueType,
  simulatorSystems,
  launchMonitorType,
  priceRangeMin,
  priceRangeMax,
  ratingOverall,
  featured,
  tags,
  href,
}: VenueCardProps) {
  return (
    <Link href={href} className="group block">
      <article className="venue-card hover-lift h-full flex flex-col bg-charcoal border border-default overflow-hidden">
        {/* Hero Image */}
        <div className="aspect-[16/10] relative overflow-hidden">
          {heroImage ? (
            <img
              src={heroImage}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-slate">
              <MapPin className="w-12 h-12 text-muted" />
            </div>
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-deep-black/80 via-transparent to-transparent" />
          
          {/* Featured badge */}
          {featured && (
            <div className="absolute top-3 left-3">
              <span className="px-2 py-1 bg-masters-green text-deep-black text-xs font-medium uppercase tracking-wider">
                Featured
              </span>
            </div>
          )}

          {/* System badge */}
          <div className="absolute top-3 right-3">
            <div className="monitor-badge bg-deep-black/80 backdrop-blur-sm">
              <Monitor className="w-3 h-3" />
              <span>{getSystemCode(launchMonitorType || "unknown")}</span>
            </div>
          </div>

          {/* Rating overlay */}
          {ratingOverall && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1">
              <Star className="w-4 h-4 fill-masters-green text-masters-green" />
              <span className="text-cream font-mono font-bold">{ratingOverall.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          {/* Venue Type Tag */}
          <div className="mb-2">
            <span className="text-masters-green text-xs font-mono uppercase tracking-wider">
              {venueType.replace(/_/g, " ")}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-cream text-lg font-semibold mb-2 group-hover:text-masters-green transition-colors line-clamp-1">
            {name}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-2 text-muted text-sm mb-3">
            <MapPin className="w-4 h-4" />
            <span>{city}, {state}</span>
          </div>

          {/* Description */}
          {shortDescription && (
            <p className="text-muted text-sm line-clamp-2 mb-4 flex-1">
              {shortDescription}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center justify-between pt-4 border-t border-subtle">
            <div className="text-sm">
              <span className="text-muted">From </span>
              <span className="text-cream font-mono font-semibold">
                {formatPrice(priceRangeMin, priceRangeMax)}
              </span>
              <span className="text-muted">/hr</span>
            </div>
            
            <div className="flex items-center gap-1 text-masters-green text-sm opacity-0 group-hover:opacity-100 transition-opacity">
              <span>View</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-slate text-cream-subtle text-xs capitalize"
                >
                  {tag.replace(/-/g, " ")}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}

// Compact version for lists
export function VenueCardCompact({
  slug,
  name,
  city,
  state,
  heroImage,
  ratingOverall,
  featured,
  href,
}: VenueCardProps) {
  return (
    <Link href={href} className="group block">
      <article className="flex gap-4 p-4 bg-charcoal border border-default hover:border-masters-green transition-colors">
        {/* Thumbnail */}
        <div className="w-24 h-24 flex-shrink-0 bg-slate overflow-hidden">
          {heroImage ? (
            <img
              src={heroImage}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <MapPin className="w-8 h-8 text-muted" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-cream font-semibold group-hover:text-masters-green transition-colors truncate">
              {name}
            </h3>
            {featured && (
              <span className="flex-shrink-0 px-1.5 py-0.5 bg-masters-green-subtle text-masters-green text-[10px] uppercase">
                Featured
              </span>
            )}
          </div>
          
          <p className="text-muted text-sm mt-1">
            {city}, {state}
          </p>
          
          {ratingOverall && (
            <div className="flex items-center gap-1 mt-2">
              <Star className="w-4 h-4 fill-masters-green text-masters-green" />
              <span className="text-cream font-mono">{ratingOverall.toFixed(1)}</span>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
