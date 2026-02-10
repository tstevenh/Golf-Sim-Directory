"use client";

import { MapPin, Star, Users, Monitor, Utensils, Briefcase, Heart, Zap } from "lucide-react";
import { Breadcrumbs, type BreadcrumbItem } from "./Breadcrumbs";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  stats?: {
    label: string;
    value: string | number;
  }[];
  variant?: "default" | "city" | "tag" | "venue" | "search";
  icon?: React.ReactNode;
  bgPattern?: boolean;
}

// Tag-specific content for better SEO
const tagContent: Record<string, { 
  icon: React.ReactNode; 
  tagline: string; 
  description: string;
}> = {
  "sim-bar": {
    icon: <Utensils className="w-8 h-8" />,
    tagline: "Golf + Great Food & Drinks",
    description: "Discover golf simulator venues with full bar service, craft cocktails, and delicious food. Perfect for social outings where you want the complete entertainment experience."
  },
  "date-night": {
    icon: <Heart className="w-8 h-8" />,
    tagline: "Romantic Golf Experiences",
    description: "Find the perfect golf simulator spots for date night. These venues offer intimate atmospheres, quality food & drinks, and a fun activity you can enjoy together."
  },
  "corporate-events": {
    icon: <Briefcase className="w-8 h-8" />,
    tagline: "Team Building & Client Entertainment",
    description: "Professional golf simulator venues ideal for corporate events, team outings, and client entertainment. Many offer private rooms and catering services."
  },
  "family-friendly": {
    icon: <Users className="w-8 h-8" />,
    tagline: "Fun for All Ages",
    description: "Golf simulator locations welcoming to families with kids. These venues offer a safe, entertaining environment where the whole family can enjoy golf together."
  },
  "serious-practice": {
    icon: <Zap className="w-8 h-8" />,
    tagline: "Train Like a Pro",
    description: "High-end golf simulator facilities focused on serious practice and improvement. Featuring professional-grade launch monitors, swing analysis, and coaching options."
  },
  "beginners": {
    icon: <Star className="w-8 h-8" />,
    tagline: "Perfect for New Golfers",
    description: "Welcoming golf simulator venues ideal for beginners. These locations offer patient staff, lessons available, and a no-pressure environment to learn the game."
  },
  "league-play": {
    icon: <Users className="w-8 h-8" />,
    tagline: "Competitive Golf Leagues",
    description: "Golf simulator venues offering organized league play and tournaments. Connect with other golfers and compete in a fun, social environment year-round."
  }
};

// Hardware brand content
const hardwareContent: Record<string, { tagline: string; description: string }> = {
  "trackman": {
    tagline: "Tour-Level Accuracy",
    description: "Venues featuring TrackMan simulators — the gold standard in launch monitor technology used by PGA Tour professionals worldwide."
  },
  "full-swing": {
    tagline: "Immersive Golf Experience", 
    description: "Experience Full Swing simulators featuring stunning graphics, accurate ball tracking, and the technology trusted by Tiger Woods."
  },
  "foresight": {
    tagline: "Camera-Based Precision",
    description: "Discover venues with Foresight Sports GCQuad and GCHawk systems — known for exceptional accuracy in club and ball data."
  },
  "aboutgolf": {
    tagline: "Premium Simulator Bays",
    description: "aboutGolf simulator venues offering high-definition graphics and realistic course play on their proprietary platform."
  },
  "golfzon": {
    tagline: "Interactive Golf Entertainment",
    description: "Golfzon simulator locations featuring their innovative moving floor platform for realistic slope and lie conditions."
  }
};

// Vibe content
const vibeContent: Record<string, { tagline: string; description: string }> = {
  "upscale": {
    tagline: "Premium Golf Experiences",
    description: "Luxury golf simulator venues with upscale amenities, premium finishes, and exceptional service for a refined experience."
  },
  "casual": {
    tagline: "Relaxed & Laid-Back",
    description: "Casual golf simulator spots perfect for kicking back with friends. No dress code, no pretense — just good golf and good times."
  },
  "sports-bar": {
    tagline: "Golf Meets Game Day",
    description: "Sports bar venues with golf simulators. Watch the big game, grab some wings, and squeeze in a few holes."
  },
  "boutique": {
    tagline: "Intimate & Curated",
    description: "Smaller, boutique golf simulator venues offering personalized attention and a more intimate atmosphere."
  }
};

export function PageHero({
  title,
  subtitle,
  description,
  breadcrumbs,
  stats,
  variant = "default",
  icon,
  bgPattern = true,
}: PageHeroProps) {
  const variantClass = variant === "default" ? "" : "";

  return (
    <section className={`relative overflow-hidden ${variantClass}`}>
      {/* Background pattern */}
      {bgPattern && (
        <div className="absolute inset-0 opacity-5">
          <div 
            className="absolute inset-0" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300694a' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>
      )}
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="mb-6">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex-1">
            {/* Icon + Subtitle */}
            {(icon || subtitle) && (
              <div className="flex items-center gap-3 mb-4">
                {icon && (
                  <div className="text-masters-green">
                    {icon}
                  </div>
                )}
                {subtitle && (
                  <span className="text-masters-green font-mono text-sm uppercase tracking-wider">
                    {subtitle}
                  </span>
                )}
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-cream mb-4">
              {title}
            </h1>

            {/* Description */}
            {description && (
              <p className="text-muted text-lg max-w-2xl">
                {description}
              </p>
            )}
          </div>

          {/* Stats */}
          {stats && stats.length > 0 && (
            <div className="flex flex-wrap gap-6 md:gap-8">
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-cream font-mono">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted uppercase tracking-wider mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// Helper to get tag-specific hero content
export function getTagHeroContent(tag: string) {
  return tagContent[tag] || {
    icon: <Monitor className="w-8 h-8" />,
    tagline: "Golf Simulator Directory",
    description: `Find the best golf simulator venues tagged as "${tag.replace(/-/g, " ")}". Browse ratings, amenities, and book your next session.`
  };
}

// Helper to get hardware-specific hero content  
export function getHardwareHeroContent(brand: string) {
  return hardwareContent[brand.toLowerCase()] || {
    tagline: `${brand} Golf Simulators`,
    description: `Find golf simulator venues featuring ${brand} technology. Compare locations, read reviews, and book your session.`
  };
}

// Helper to get vibe-specific hero content
export function getVibeHeroContent(vibe: string) {
  return vibeContent[vibe.toLowerCase()] || {
    tagline: `${vibe} Golf Simulator Venues`,
    description: `Discover ${vibe} golf simulator spots that match your style. Browse venues, read reviews, and find your perfect fit.`
  };
}

// City hero with local stats
export function CityPageHero({
  city,
  state,
  venueCount,
  breadcrumbs,
  topTags,
}: {
  city: string;
  state: string;
  venueCount: number;
  breadcrumbs?: BreadcrumbItem[];
  topTags?: string[];
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-masters-green/10 via-transparent to-transparent">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="mb-6">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
          <div className="flex-1">
            {/* Location badge */}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-charcoal border border-default text-masters-green">
                <MapPin className="w-6 h-6" />
              </div>
              <span className="text-masters-green font-mono text-sm uppercase tracking-wider">
                {state} · Local Directory
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-cream mb-4 leading-tight">
              Golf Simulators in {city}, {state}
            </h1>

            {/* Description */}
            <p className="text-muted text-base md:text-lg max-w-2xl mb-6">
              Discover {venueCount} golf simulator {venueCount === 1 ? 'venue' : 'venues'} in {city}. 
              Compare technology, read reviews, check prices, and find the perfect spot for your next session.
            </p>

            {/* Top tags - quick filters */}
            {topTags && topTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {topTags.map((tag) => (
                  <a
                    key={tag}
                    href={`/venue/us/${state.toLowerCase()}/${city.toLowerCase().replace(/\s+/g, '-')}/best/${tag}`}
                    className="px-3 py-2 bg-charcoal border border-default rounded-full text-cream-subtle text-sm hover:border-masters-green hover:text-masters-green transition-colors min-h-[40px] flex items-center"
                  >
                    {tag.replace(/-/g, ' ')}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Stats cards */}
          <div className="flex gap-4 lg:flex-col">
            <div className="flex-1 lg:flex-none bg-charcoal border border-default rounded-lg p-5 text-center min-w-[120px]">
              <div className="text-3xl md:text-4xl font-bold font-mono text-masters-green mb-1">
                {venueCount}
              </div>
              <div className="text-muted text-xs uppercase tracking-wider">
                {venueCount === 1 ? 'Venue' : 'Venues'}
              </div>
            </div>
            <div className="flex-1 lg:flex-none bg-charcoal border border-default rounded-lg p-5 text-center min-w-[120px]">
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
    </section>
  );
}

// Tag/Best-by hero
export function TagPageHero({
  tag,
  city,
  state,
  venueCount,
  breadcrumbs,
}: {
  tag: string;
  city?: string;
  state?: string;
  venueCount: number;
  breadcrumbs?: BreadcrumbItem[];
}) {
  const content = getTagHeroContent(tag);
  const locationText = city && state ? ` in ${city}, ${state}` : "";
  
  return (
    <PageHero
      title={`Best ${tag.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())} Golf Simulators${locationText}`}
      subtitle={content.tagline}
      description={content.description}
      breadcrumbs={breadcrumbs}
      stats={[
        { label: "Venues", value: venueCount },
      ]}
      icon={content.icon}
      variant="tag"
    />
  );
}
