"use client";

import { ReactNode } from "react";
import { 
  MapPin, 
  Users, 
  Gamepad2, 
  UtensilsCrossed, 
  Building2, 
  Heart,
  Briefcase,
  PartyPopper,
  Baby,
  GraduationCap,
  Dumbbell,
  Monitor,
  Cpu,
  Sparkles,
  Target,
  TrendingUp
} from "lucide-react";
import { Breadcrumbs } from "./Breadcrumbs";

// Category type definitions
type CategoryType = 
  | "tag" 
  | "amenity" 
  | "hardware" 
  | "software" 
  | "vibe" 
  | "segment" 
  | "launch-monitor"
  | "city"
  | "state";

interface CategoryHeroProps {
  type: CategoryType;
  title: string;
  subtitle?: string;
  description: string;
  venueCount?: number;
  breadcrumbItems: { label: string; href?: string }[];
  // Optional background image
  backgroundImage?: string;
  // Category-specific value (e.g., "sim-bar", "trackman", "chicago")
  categoryValue?: string;
}

// Icon mapping for different categories
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  // Tags
  "sim-bar": UtensilsCrossed,
  "date-night": Heart,
  "corporate-events": Briefcase,
  "bachelor-party": PartyPopper,
  "family-friendly": Baby,
  "lessons-available": GraduationCap,
  "fitness-focused": Dumbbell,
  // Hardware
  "trackman": Target,
  "foresight": Monitor,
  "uneekor": Cpu,
  "full-swing": Gamepad2,
  // Vibes
  "upscale": Sparkles,
  "casual": Users,
  "sports-bar": UtensilsCrossed,
  // Segments
  "beginners": GraduationCap,
  "serious-golfers": TrendingUp,
  "families": Baby,
  "corporate": Building2,
  // Default
  "default": MapPin,
};

// Color themes for different category types
const categoryThemes: Record<CategoryType, { gradient: string; accent: string }> = {
  tag: { 
    gradient: "from-masters-green/20 via-transparent to-transparent", 
    accent: "text-masters-green" 
  },
  amenity: { 
    gradient: "from-blue-500/20 via-transparent to-transparent", 
    accent: "text-blue-400" 
  },
  hardware: { 
    gradient: "from-purple-500/20 via-transparent to-transparent", 
    accent: "text-purple-400" 
  },
  software: { 
    gradient: "from-cyan-500/20 via-transparent to-transparent", 
    accent: "text-cyan-400" 
  },
  vibe: { 
    gradient: "from-amber-500/20 via-transparent to-transparent", 
    accent: "text-amber-400" 
  },
  segment: { 
    gradient: "from-pink-500/20 via-transparent to-transparent", 
    accent: "text-pink-400" 
  },
  "launch-monitor": { 
    gradient: "from-emerald-500/20 via-transparent to-transparent", 
    accent: "text-emerald-400" 
  },
  city: { 
    gradient: "from-masters-green/20 via-transparent to-transparent", 
    accent: "text-masters-green" 
  },
  state: { 
    gradient: "from-masters-green/15 via-transparent to-transparent", 
    accent: "text-masters-green" 
  },
};

// Category-specific taglines
const categoryTaglines: Record<CategoryType, string> = {
  tag: "Curated Selection",
  amenity: "Amenities & Features",
  hardware: "Hardware & Technology",
  software: "Software & Games",
  vibe: "Atmosphere & Style",
  segment: "Perfect For",
  "launch-monitor": "Launch Monitor Type",
  city: "Local Directory",
  state: "State Directory",
};

export function CategoryHero({
  type,
  title,
  subtitle,
  description,
  venueCount,
  breadcrumbItems,
  backgroundImage,
  categoryValue,
}: CategoryHeroProps) {
  const theme = categoryThemes[type];
  const tagline = categoryTaglines[type];
  const IconComponent = categoryIcons[categoryValue || "default"] || categoryIcons["default"];

  return (
    <div className="relative">
      {/* Background */}
      {backgroundImage && (
        <div className="absolute inset-0 -z-10">
          <img 
            src={backgroundImage} 
            alt="" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-deep-black via-deep-black/95 to-deep-black" />
        </div>
      )}
      
      {/* Gradient overlay */}
      <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${theme.gradient}`} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbItems} className="mb-6" />

        {/* Hero Content */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          {/* Left: Title and description */}
          <div className="flex-1 max-w-3xl">
            {/* Category badge */}
            <div className="flex items-center gap-2 mb-4">
              <div className={`p-2 rounded-lg bg-charcoal ${theme.accent}`}>
                <IconComponent className="w-5 h-5" />
              </div>
              <span className={`text-xs font-mono uppercase tracking-widest ${theme.accent}`}>
                {tagline}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-cream mb-3 leading-tight">
              {title}
            </h1>

            {/* Subtitle */}
            {subtitle && (
              <p className={`text-lg md:text-xl ${theme.accent} mb-4`}>
                {subtitle}
              </p>
            )}

            {/* Description */}
            <p className="text-muted text-base md:text-lg leading-relaxed max-w-2xl">
              {description}
            </p>
          </div>

          {/* Right: Stats card */}
          {venueCount !== undefined && (
            <div className="flex-shrink-0">
              <div className="bg-charcoal border border-default rounded-lg p-5 md:p-6 text-center min-w-[140px]">
                <div className={`text-4xl md:text-5xl font-bold font-mono ${theme.accent} mb-1`}>
                  {venueCount}
                </div>
                <div className="text-muted text-sm uppercase tracking-wider">
                  {venueCount === 1 ? "Venue" : "Venues"}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// City-specific hero with local context
interface CityHeroProps {
  city: string;
  state: string;
  stateAbbr: string;
  venueCount: number;
  description: string;
  breadcrumbItems: { label: string; href?: string }[];
  topAmenities?: string[];
}

export function CityHero({
  city,
  state,
  stateAbbr,
  venueCount,
  description,
  breadcrumbItems,
  topAmenities,
}: CityHeroProps) {
  return (
    <div className="relative">
      {/* Gradient background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-masters-green/15 via-transparent to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbItems} className="mb-6" />

        {/* Hero Content */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
          {/* Left: Title and description */}
          <div className="flex-1">
            {/* Location badge */}
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-charcoal text-masters-green">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono uppercase tracking-widest text-masters-green">
                {state} · Local Directory
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-cream mb-4 leading-tight">
              Golf Simulators in {city}, {stateAbbr}
            </h1>

            {/* Description */}
            <p className="text-muted text-base md:text-lg leading-relaxed max-w-2xl mb-6">
              {description}
            </p>

            {/* Top amenities pills */}
            {topAmenities && topAmenities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {topAmenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="px-3 py-1.5 bg-charcoal border border-default rounded-full text-cream-subtle text-sm"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right: Stats cards */}
          <div className="flex gap-4 lg:flex-col">
            <div className="bg-charcoal border border-default rounded-lg p-5 text-center flex-1 lg:flex-none lg:min-w-[140px]">
              <div className="text-3xl md:text-4xl font-bold font-mono text-masters-green mb-1">
                {venueCount}
              </div>
              <div className="text-muted text-xs uppercase tracking-wider">
                {venueCount === 1 ? "Venue" : "Venues"}
              </div>
            </div>
            <div className="bg-charcoal border border-default rounded-lg p-5 text-center flex-1 lg:flex-none lg:min-w-[140px]">
              <div className="text-3xl md:text-4xl font-bold font-mono text-blue-400 mb-1">
                24/7
              </div>
              <div className="text-muted text-xs uppercase tracking-wider">
                Updated
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
