"use client";

import Link from "next/link";
import { MapPin, Star, Monitor, ArrowUpRight, Trophy, Award } from "lucide-react";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";

interface VenueCardProps {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string;
  heroImage: string | null;
  venueType: string;
  simulatorSystems?: string[] | null;
  launchMonitorType?: string | null;
  priceRangeMin?: number | null;
  priceRangeMax?: number | null;
  ratingOverall: number | null;
  featured?: boolean;
  claimed?: boolean;
  tags?: string[] | null;
  href: string;
  // New props for rankings
  rank?: number;
  showRank?: boolean;
}

// Human-readable venue type labels
const VENUE_TYPE_LABELS: Record<string, string> = {
  sim_bar: "Simulator Bar",
  training_studio: "Training Studio",
  private_rental: "Private Rental",
  retail_fitting_center: "Retail / Fitting Center",
  country_club: "Country Club",
  multi_sport_sim: "Multi-Sport Simulator",
  hotel_resort: "Hotel / Resort",
  indoor_golf_center: "Indoor Golf Center",
  entertainment_venue: "Entertainment Venue",
  golf_performance_center: "Golf Performance Center",
  bar: "Bar with Simulators",
  other: "Indoor Golf Venue",
};

function getVenueTypeLabel(type: string): string {
  return VENUE_TYPE_LABELS[type] || type.replace(/_/g, " ");
}

function getSystemCode(type: string | null | undefined): string | null {
  if (!type || type === "unknown") return null;
  const codes: Record<string, string> = {
    radar: "RD",
    photometric_camera: "CM",
    hybrid: "HB",
  };
  return codes[type] || null;
}

function formatPrice(min: number | null | undefined, max: number | null | undefined): string | null {
  if (!min && !max) return null;
  if (min && max) return `$${min}-${max}`;
  if (min) return `$${min}+`;
  if (max) return `Up to $${max}`;
  return null;
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
  name,
  city,
  state,
  venueType,
  launchMonitorType,
  priceRangeMin,
  priceRangeMax,
  ratingOverall,
  featured,
  claimed,
  tags,
  href,
  rank,
  showRank = false,
}: VenueCardProps) {
  return (
    <Link href={href} className="group block">
      <article className="venue-card hover-lift h-full flex flex-col bg-charcoal border border-default overflow-hidden rounded-lg transition-all duration-300 hover:border-masters-green/50 hover:shadow-lg hover:shadow-masters-green/5">
        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              {showRank && rank && <RankBadge rank={rank} />}
              {featured && !showRank && (
                <span className="px-2.5 py-1.5 bg-masters-green text-deep-black text-xs font-semibold uppercase tracking-wider rounded-md flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  Featured
                </span>
              )}
            </div>
            {getSystemCode(launchMonitorType) && (
              <div className="monitor-badge bg-deep-black/80 px-2.5 py-1.5 rounded-md flex items-center gap-1.5 text-xs text-cream font-mono border border-default">
                <Monitor className="w-3.5 h-3.5" />
                <span>{getSystemCode(launchMonitorType)}</span>
              </div>
            )}
          </div>

          {/* Venue Type Tag */}
          <div className="mb-2">
            <span className="text-masters-green text-xs font-mono uppercase tracking-wider">
              {getVenueTypeLabel(venueType)}
            </span>
          </div>

          {/* Title Row - with Rating on right */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-cream text-lg font-semibold group-hover:text-masters-green transition-colors line-clamp-1 flex-1">
              {name}
            </h3>
            
            {/* Rating - positioned next to title */}
            {ratingOverall && (
              <div className="flex items-center gap-1 flex-shrink-0 bg-charcoal border border-default rounded-md px-2 py-1">
                <Star className="w-3.5 h-3.5 fill-masters-green text-masters-green" />
                <span className="text-cream font-mono font-bold text-sm">{ratingOverall.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-muted text-sm mb-3">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{city}, {state}</span>
          </div>

          {/* Verified Badge */}
          {claimed && (
            <div className="mb-3">
              <VerifiedBadge size="sm" />
            </div>
          )}

          {/* Meta row - Touch friendly (min 48px) */}
          <div className="flex items-center justify-between pt-4 border-t border-subtle min-h-[48px]">
            {formatPrice(priceRangeMin, priceRangeMax) ? (
              <div className="text-sm">
                <span className="text-muted">From </span>
                <span className="text-cream font-mono font-semibold">
                  {formatPrice(priceRangeMin, priceRangeMax)}
                </span>
                <span className="text-muted">/hr</span>
              </div>
            ) : (
              <div />
            )}
            
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
                  className="px-2.5 py-1.5 bg-slate text-cream-subtle text-xs rounded-md min-h-[32px] flex items-center"
                >
                  {tag
                    .replace(/[_-]/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
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
  name,
  city,
  state,
  launchMonitorType,
  ratingOverall,
  featured,
  claimed,
  href,
  rank,
  showRank = false,
}: VenueCardProps) {
  return (
    <Link href={href} className="group block">
      <article className="flex gap-4 p-4 bg-charcoal border border-default rounded-lg hover:border-masters-green/50 transition-all duration-200 min-h-[100px]">
        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-cream font-semibold group-hover:text-masters-green transition-colors truncate text-base">
              {name}
            </h3>
            
            {/* Rating - inline with title */}
            {ratingOverall && (
              <div className="flex items-center gap-1 flex-shrink-0 bg-slate rounded px-1.5 py-0.5">
                <Star className="w-3 h-3 fill-masters-green text-masters-green" />
                <span className="text-cream font-mono font-semibold text-xs">{ratingOverall.toFixed(1)}</span>
              </div>
            )}
          </div>
          
          <p className="text-muted text-sm mt-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{city}, {state}</span>
          </p>

          <div className="mt-2 flex items-center gap-2">
            {claimed && <VerifiedBadge size="sm" />}
            {showRank && rank && rank <= 3 && (
              <div className="w-6 h-6 bg-masters-green rounded-full flex items-center justify-center">
                <span className="text-deep-black font-mono font-bold text-xs">{rank}</span>
              </div>
            )}
            {featured && !showRank && (
              <span className="px-2 py-0.5 bg-masters-green/20 text-masters-green text-[10px] uppercase font-semibold rounded">
                Featured
              </span>
            )}
            {getSystemCode(launchMonitorType) && (
              <span className="px-2 py-0.5 bg-slate text-cream-subtle text-[10px] font-mono rounded border border-subtle">
                {getSystemCode(launchMonitorType)}
              </span>
            )}
          </div>
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
