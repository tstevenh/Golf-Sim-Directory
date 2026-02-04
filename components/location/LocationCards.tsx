"use client";

import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";

// State Card Component
interface StateCardProps {
  stateCode: string;
  stateName: string;
  venueCount: number;
  href: string;
}

export function StateCard({ stateCode, stateName, venueCount, href }: StateCardProps) {
  return (
    <Link
      href={href}
      className="group bg-slate p-6 hover:bg-masters-green/10 transition-all duration-300 border border-default hover:border-masters-green block"
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-muted group-hover:text-masters-green transition-colors" />
          <span className="text-cream font-semibold text-lg group-hover:text-masters-green transition-colors">
            {stateName}
          </span>
        </div>
        <span className="px-2 py-1 bg-masters-green-subtle text-masters-green text-xs font-mono">
          {stateCode.toUpperCase()}
        </span>
      </div>

      {/* Venue count and arrow */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted">
          {venueCount} venue{venueCount !== 1 ? "s" : ""}
        </span>
        <div className="w-8 h-8 border border-default flex items-center justify-center group-hover:border-masters-green transition-colors">
          <ArrowRight className="w-4 h-4 text-muted group-hover:text-masters-green group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-deep-black overflow-hidden">
        <div className="h-full bg-masters-green/30 group-hover:bg-masters-green transition-colors duration-500 w-full" />
      </div>
    </Link>
  );
}

// City Card Component - Now matches StateCard styling
interface CityCardProps {
  cityName: string;
  stateCode: string;
  venueCount: number;
  href: string;
  trending?: boolean;
}

export function CityCard({ cityName, stateCode, venueCount, href, trending }: CityCardProps) {
  return (
    <Link
      href={href}
      className="group bg-slate p-6 hover:bg-masters-green/10 transition-all duration-300 border border-default hover:border-masters-green block"
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-muted group-hover:text-masters-green transition-colors" />
          <span className="text-cream font-semibold text-lg group-hover:text-masters-green transition-colors">
            {cityName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {trending && (
            <span className="px-1.5 py-0.5 text-[10px] bg-masters-green-subtle text-masters-green uppercase tracking-wider">
              Hot
            </span>
          )}
          <span className="px-2 py-1 bg-masters-green-subtle text-masters-green text-xs font-mono">
            {stateCode.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Venue count and arrow */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted">
          {venueCount} venue{venueCount !== 1 ? "s" : ""}
        </span>
        <div className="w-8 h-8 border border-default flex items-center justify-center group-hover:border-masters-green transition-colors">
          <ArrowRight className="w-4 h-4 text-muted group-hover:text-masters-green group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-deep-black overflow-hidden">
        <div className="h-full bg-masters-green/30 group-hover:bg-masters-green transition-colors duration-500 w-full" />
      </div>
    </Link>
  );
}

// Simple City Link (for compact lists)
interface CityLinkProps {
  cityName: string;
  href: string;
}

export function CityLink({ cityName, href }: CityLinkProps) {
  return (
    <Link
      href={href}
      className="city-link"
    >
      Golf Simulators in {cityName}
    </Link>
  );
}

// State Link (for compact lists)
interface StateLinkProps {
  stateName: string;
  venueCount: number;
  href: string;
}

export function StateLink({ stateName, venueCount, href }: StateLinkProps) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-2 px-4 py-2 border border-default hover:border-masters-green transition-colors"
    >
      <span className="text-sm text-cream-subtle group-hover:text-cream transition-colors">
        {stateName}
      </span>
      <span className="font-mono text-xs text-muted">{venueCount}</span>
    </Link>
  );
}
