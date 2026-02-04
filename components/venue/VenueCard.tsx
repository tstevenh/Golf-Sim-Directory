"use client";

import Link from "next/link";
import { MapPin, Star, Monitor, ArrowUpRight, Trophy, Award } from "lucide-react";

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
  // New props for rankings
  rank?: number;
  showRank?: boolean;
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

// Rank badge component
function RankBadge({ rank }: { rank: number }) {
  const getBgColor = (r: number) => {
    if (r === 1) return "bg-yellow-500/20 border-yellow-500/50 text-yellow-400";
    if (r === 2) return "bg-gray-400/20 border-gray-400/50 text-gray-300";
    if (r === 3) return "bg-amber-600/20 border-amber-600/50 text-amber-500";
    return "bg-charcoal border-default text-muted";
  };

  const getIcon = (r: number) => {
    if (r <= 3) return <Trophy className="w-3.5 h-3.5" />;
    return <Award className="w-3.5 h-3.5" />;
  };

  return (
    <div className={`
      flex items-center gap-1.5 px-2.5 py-1.5
      border rounded-md font-mono font-bold text-sm
      ${getBgColor(rank)}
    `}>
      {getIcon(rank)}
      <span>#{rank}</span>
    </div>
  );
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
  rank,
  showRank = false,
}: VenueCardProps) {
  return (
    <Link href={href} className="group block">
      <article className="venue-card hover-lift h-full flex flex-col bg-charcoal border border-default overflow-hidden rounded-lg transition-all duration-300 hover:border-masters-green/50 hover:shadow-lg hover:shadow-masters-green/5">
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
          
          {/* Badges row - top left */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            {/* Rank badge */}
            {showRank && rank && (
              <RankBadge rank={rank} />
            )}
            
            {/* Featured badge */}
            {featured && !showRank && (
              <span className="px-2.5 py-1.5 bg-masters-green text-deep-black text-xs font-semibold uppercase tracking-wider rounded-md flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-current" />
                Featured
              </span>
            )}
          </div>

          {/* System badge - top right */}
          <div className="absolute top-3 right-3">
            <div className="monitor-badge bg-deep-black/80 backdrop-blur-sm px-2.5 py-1.5 rounded-md flex items-center gap-1.5 text-xs text-cream font-mono">
              <Monitor className="w-3.5 h-3.5" />
              <span>{getSystemCode(launchMonitorType || "unknown")}</span>
            </div>
          </div>

          {/* Rating overlay - bottom left */}
          {ratingOverall && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 bg-deep-black/80 backdrop-blur-sm rounded-md">
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
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{city}, {state}</span>
          </div>

          {/* Description */}
          {shortDescription && (
            <p className="text-muted text-sm line-clamp-2 mb-4 flex-1">
              {shortDescription}
            </p>
          )}

          {/* Meta row - Touch friendly (min 48px) */}
          <div className="flex items-center justify-between pt-4 border-t border-subtle min-h-[48px]">
            <div className="text-sm">
              <span className="text-muted">From </span>
              <span className="text-cream font-mono font-semibold">
                {formatPrice(priceRangeMin, priceRangeMax)}
              </span>
              <span className="text-muted">/hr</span>
            </div>
            
            <div className="flex items-center gap-1.5 text-masters-green text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              <span>View</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          {/* Tags - Touch friendly */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1.5 bg-slate text-cream-subtle text-xs capitalize rounded-md min-h-[32px] flex items-center"
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

// Compact version for lists - Mobile optimized
export function VenueCardCompact({
  slug,
  name,
  city,
  state,
  heroImage,
  ratingOverall,
  featured,
  href,
  rank,
  showRank = false,
}: VenueCardProps) {
  return (
    <Link href={href} className="group block">
      <article className="flex gap-4 p-4 bg-charcoal border border-default rounded-lg hover:border-masters-green/50 transition-all duration-200 min-h-[100px]">
        {/* Thumbnail */}
        <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 bg-slate overflow-hidden rounded-md relative">
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
          
          {/* Mini rank badge */}
          {showRank && rank && rank <= 3 && (
            <div className="absolute -top-1 -left-1 w-6 h-6 bg-masters-green rounded-full flex items-center justify-center">
              <span className="text-deep-black font-mono font-bold text-xs">{rank}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-cream font-semibold group-hover:text-masters-green transition-colors truncate text-base">
              {name}
            </h3>
            {featured && !showRank && (
              <span className="flex-shrink-0 px-2 py-1 bg-masters-green/20 text-masters-green text-[10px] uppercase font-semibold rounded">
                Featured
              </span>
            )}
          </div>
          
          <p className="text-muted text-sm mt-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{city}, {state}</span>
          </p>
          
          {ratingOverall && (
            <div className="flex items-center gap-1.5 mt-2">
              <Star className="w-4 h-4 fill-masters-green text-masters-green" />
              <span className="text-cream font-mono font-semibold">{ratingOverall.toFixed(1)}</span>
            </div>
          )}
        </div>
        
        {/* Arrow indicator for touch */}
        <div className="flex items-center self-center">
          <ArrowUpRight className="w-5 h-5 text-muted group-hover:text-masters-green transition-colors" />
        </div>
      </article>
    </Link>
  );
}

// Grid wrapper with responsive layout
export function VenueGrid({ 
  children, 
  columns = 3 
}: { 
  children: React.ReactNode; 
  columns?: 2 | 3 | 4;
}) {
  const gridCols = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4 md:gap-6`}>
      {children}
    </div>
  );
}
