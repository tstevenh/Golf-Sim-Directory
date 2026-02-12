// Shared configuration for "Best By" categories
// Used for natural internal linking across the site
import { getStateSlug } from "@/lib/states";

export interface BestByCategory {
  slug: string;
  label: string;
  description: string;
  icon?: string;
}

// Available vibe categories with human-readable labels
export const VIBE_CATEGORIES: BestByCategory[] = [
  { slug: "upscale", label: "Upscale", description: "Premium golf experiences" },
  { slug: "casual", label: "Casual", description: "Relaxed atmosphere" },
  { slug: "sports-bar", label: "Sports Bar", description: "Watch games while you play" },
  { slug: "boutique", label: "Boutique", description: "Intimate venues" },
  { slug: "lounge", label: "Lounge", description: "Sophisticated atmosphere" },
  { slug: "entertainment", label: "Entertainment", description: "Full entertainment venues" },
  { slug: "family", label: "Family", description: "Fun for all ages" },
];

// Available "who it's for" segments
export const SEGMENT_CATEGORIES: BestByCategory[] = [
  { slug: "beginners", label: "Beginners", description: "New to golf" },
  { slug: "corporate-groups", label: "Corporate Groups", description: "Team building" },
  { slug: "serious-golfers", label: "Serious Golfers", description: "Low handicappers" },
  { slug: "date-night", label: "Date Night", description: "Perfect for couples" },
  { slug: "large-groups", label: "Large Groups", description: "Parties & events" },
  { slug: "families", label: "Families", description: "Kids welcome" },
  { slug: "league-players", label: "League Players", description: "Competitive play" },
];

// Popular hardware brands
export const HARDWARE_CATEGORIES: BestByCategory[] = [
  { slug: "trackman", label: "Trackman", description: "Industry-leading radar" },
  { slug: "foresight", label: "Foresight", description: "Camera-based systems" },
  { slug: "gc-quad", label: "GC Quad", description: "Premium camera system" },
  { slug: "garmin", label: "Garmin", description: "Accessible radar tech" },
  { slug: "skytrak", label: "SkyTrak", description: "Popular launch monitor" },
  { slug: "full-swing", label: "Full Swing", description: "Pro-grade simulators" },
];

// Generate city-specific best by links
export function getCityBestByLinks(
  state: string,
  city: string,
  currentCategory?: string
): Array<{ href: string; label: string; category: string }> {
  const citySlug = city.toLowerCase().replace(/\s+/g, "-");
  const links: Array<{ href: string; label: string; category: string }> = [];

  // Add vibe links
  VIBE_CATEGORIES.forEach((cat) => {
    if (currentCategory !== `vibe-${cat.slug}`) {
      links.push({
        href: `/venue/us/${state}/${citySlug}/best/vibe/${cat.slug}`,
        label: `Best ${cat.label} in ${city}`,
        category: "vibe",
      });
    }
  });

  // Add segment links
  SEGMENT_CATEGORIES.forEach((cat) => {
    if (currentCategory !== `segment-${cat.slug}`) {
      links.push({
        href: `/venue/us/${state}/${citySlug}/best/who-its-for/${cat.slug}`,
        label: `Best for ${cat.label} in ${city}`,
        category: "segment",
      });
    }
  });

  // Add hardware links
  HARDWARE_CATEGORIES.forEach((cat) => {
    if (currentCategory !== `hardware-${cat.slug}`) {
      links.push({
        href: `/venue/us/${state}/${citySlug}/best/hardware/${cat.slug}`,
        label: `Best ${cat.label} in ${city}`,
        category: "hardware",
      });
    }
  });

  return links;
}

// Get relevant best by links for a specific venue
export function getVenueBestByLinks(
  venue: {
    city: string;
    state: string;
    vibeTags?: string[] | null;
    whoItsFor?: string[] | null;
    simulatorSystems?: unknown;
  }
): Array<{ href: string; label: string }> {
  const city = typeof venue.city === "string" ? venue.city : "";
  const state = typeof venue.state === "string" ? venue.state : "";
  if (!city || !state) return [];

  const citySlug = city.toLowerCase().replace(/\s+/g, "-");
  const stateSlug = getStateSlug(state);
  const links: Array<{ href: string; label: string }> = [];

  // Add vibe-based links the venue belongs to (max 2)
  if (venue.vibeTags) {
    venue.vibeTags.slice(0, 2).forEach((vibe) => {
      if (typeof vibe !== "string" || !vibe) return;
      const vibeHyphen = vibe.replace(/_/g, "-");
      const vibeCat = VIBE_CATEGORIES.find((v) => v.slug === vibe || v.slug === vibeHyphen);
      if (vibeCat) {
        links.push({
          href: `/venue/us/${stateSlug}/${citySlug}/best/vibe/${vibeHyphen}`,
          label: `Best ${vibeCat.label} in ${city}`,
        });
      }
    });
  }

  // Add whoItsFor-based links (max 1)
  if (venue.whoItsFor) {
    const segment = venue.whoItsFor[0];
    if (typeof segment !== "string" || !segment) return links.slice(0, 3);
    const segmentHyphen = segment.replace(/_/g, "-");
    const segCat = SEGMENT_CATEGORIES.find((s) => s.slug === segment || s.slug === segmentHyphen);
    if (segCat) {
      links.push({
        href: `/venue/us/${stateSlug}/${citySlug}/best/who-its-for/${segmentHyphen}`,
        label: `Best for ${segCat.label} in ${city}`,
      });
    }
  }

  // Limit to 3 total links
  return links.slice(0, 3);
}

// Get category browse links for city page (grouped by type)
export function getCityCategoryBrowseLinks(
  state: string,
  city: string
): {
  vibes: Array<{ href: string; label: string }>;
  segments: Array<{ href: string; label: string }>;
  hardware: Array<{ href: string; label: string }>;
} {
  const citySlug = city.toLowerCase().replace(/\s+/g, "-");

  return {
    vibes: VIBE_CATEGORIES.slice(0, 4).map((cat) => ({
      href: `/venue/us/${state}/${citySlug}/best/vibe/${cat.slug}`,
      label: cat.label,
    })),
    segments: SEGMENT_CATEGORIES.slice(0, 3).map((cat) => ({
      href: `/venue/us/${state}/${citySlug}/best/who-its-for/${cat.slug}`,
      label: cat.label,
    })),
    hardware: HARDWARE_CATEGORIES.slice(0, 3).map((cat) => ({
      href: `/venue/us/${state}/${citySlug}/best/hardware/${cat.slug}`,
      label: cat.label,
    })),
  };
}

// Helper functions for generating index page URLs
export function getCityVibeIndexUrl(state: string, city: string): string {
  const citySlug = city.toLowerCase().replace(/\s+/g, "-");
  return `/venue/us/${state}/${citySlug}/best/vibe/`;
}

export function getCityWhoItsForIndexUrl(state: string, city: string): string {
  const citySlug = city.toLowerCase().replace(/\s+/g, "-");
  return `/venue/us/${state}/${citySlug}/best/who-its-for/`;
}

export function getCityHardwareIndexUrl(state: string, city: string): string {
  const citySlug = city.toLowerCase().replace(/\s+/g, "-");
  return `/venue/us/${state}/${citySlug}/best/hardware/`;
}

// Helper functions for generating detail page URLs
export function getCityVibeUrl(state: string, city: string, vibeSlug: string): string {
  const citySlug = city.toLowerCase().replace(/\s+/g, "-");
  return `/venue/us/${state}/${citySlug}/best/vibe/${vibeSlug.replace(/_/g, "-")}`;
}

export function getCityWhoItsForUrl(state: string, city: string, segmentSlug: string): string {
  const citySlug = city.toLowerCase().replace(/\s+/g, "-");
  return `/venue/us/${state}/${citySlug}/best/who-its-for/${segmentSlug.replace(/_/g, "-")}`;
}

export function getCityHardwareUrl(state: string, city: string, hardwareSlug: string): string {
  const citySlug = city.toLowerCase().replace(/\s+/g, "-");
  return `/venue/us/${state}/${citySlug}/best/hardware/${hardwareSlug.replace(/_/g, "-")}`;
}

// Helper functions for state and city URLs
export function getStateUrl(state: string): string {
  return `/venue/us/${state}`;
}

export function getCityUrl(state: string, city: string): string {
  const citySlug = city.toLowerCase().replace(/\s+/g, "-");
  return `/venue/us/${state}/${citySlug}`;
}
