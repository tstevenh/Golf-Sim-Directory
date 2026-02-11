// Data access functions for "Best By" categories
// Uses optimized database queries with caching

import { supabase } from "@/lib/supabase";
import { unstable_cache } from "next/cache";
import {
  VIBE_CATEGORIES,
  SEGMENT_CATEGORIES,
  HARDWARE_CATEGORIES,
  getCityVibeUrl,
  getCityWhoItsForUrl,
  getCityHardwareUrl,
} from "./best-by-config";

export interface AvailableCategories {
  vibes: Array<{ slug: string; label: string; count: number }>;
  segments: Array<{ slug: string; label: string; count: number }>;
  hardware: Array<{ slug: string; label: string; count: number }>;
  launchMonitors: Array<{ slug: string; label: string; count: number }>;
  amenities: Array<{ slug: string; label: string; count: number }>;
  software: Array<{ slug: string; label: string; count: number }>;
  tags: Array<{ slug: string; label: string; count: number }>;
}

// Cache category lookups for a long time (7 days) since venue data changes infrequently.
const CACHE_TAG = "category-counts";
const CACHE_DURATION = 604800; // 7 days
const LAUNCH_MONITOR_LABELS: Record<string, string> = {
  radar: "Radar",
  photometric_camera: "Camera",
  hybrid: "Hybrid",
  unknown: "Standard",
};
const AMENITY_CATEGORIES = [
  { slug: "private_rooms", label: "Private Rooms" },
  { slug: "coaching_available", label: "Coaching" },
  { slug: "wifi", label: "WiFi" },
  { slug: "free_parking", label: "Free Parking" },
  { slug: "valet_parking", label: "Valet Parking" },
  { slug: "full_bar", label: "Full Bar" },
  { slug: "kitchen_food", label: "Food" },
] as const;
const SOFTWARE_CATEGORIES = [
  { slug: "gspro", label: "GSPro", aliases: ["gspro", "gsp"] },
  { slug: "e6", label: "E6 Connect", aliases: ["e6", "e6connect"] },
  { slug: "tgc", label: "TGC 2019", aliases: ["tgc", "thegolfclub", "thegolfclub2019"] },
  { slug: "wgt", label: "WGT", aliases: ["wgt", "worldgolftour"] },
  { slug: "creative-golf", label: "Creative Golf", aliases: ["creativegolf", "creativegolf3d"] },
  { slug: "awesome-golf", label: "Awesome Golf", aliases: ["awesomegolf"] },
  { slug: "trackman-virtual", label: "TrackMan Virtual", aliases: ["trackmanvirtual", "trackmanvirtualgolf"] },
  { slug: "fsx", label: "FSX Play", aliases: ["fsx", "fsxplay"] },
] as const;
const PREFERRED_CITY_TAGS = [
  "date-night",
  "corporate-events",
  "family-friendly",
  "beginner-friendly",
  "serious-practice",
  "private-rooms",
  "food-and-drinks",
  "coaching-available",
];

function normalizeTagSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Convert any slug to URL-friendly format (underscores → hyphens) */
function toUrlSlug(slug: string): string {
  return slug.replace(/_/g, "-");
}

function formatTagLabel(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function hasAmenity(venue: {
  hasPrivateRooms: boolean | null;
  coachingAvailable: boolean;
  wifi: boolean | null;
  parking: string;
  foodAndDrink: unknown;
}, amenitySlug: string): boolean {
  switch (amenitySlug) {
    case "private_rooms":
      return Boolean(venue.hasPrivateRooms);
    case "coaching_available":
      return Boolean(venue.coachingAvailable);
    case "wifi":
      return Boolean(venue.wifi);
    case "free_parking":
      return venue.parking === "free_lot";
    case "valet_parking":
      return venue.parking === "valet";
    case "full_bar": {
      const data = (venue.foodAndDrink || {}) as { alcohol?: unknown; hasBar?: unknown };
      return String(data.alcohol ?? "").toLowerCase() === "true" || String(data.hasBar ?? "").toLowerCase() === "true";
    }
    case "kitchen_food": {
      const data = (venue.foodAndDrink || {}) as { food?: unknown; hasFood?: unknown };
      return String(data.food ?? "").toLowerCase() === "true" || String(data.hasFood ?? "").toLowerCase() === "true";
    }
    default:
      return false;
  }
}

function extractSoftwareSlugs(softwareSlugs: string[] | null): string[] {
  if (!Array.isArray(softwareSlugs)) {
    return [];
  }
  return softwareSlugs.filter((slug): slug is string => typeof slug === "string" && slug.length > 0);
}

/**
 * Get available categories for a city with cached results.
 * Uses database aggregations for efficient counting.
 */
export const getAvailableCategoriesForCity = unstable_cache(
  async (state: string, city: string): Promise<AvailableCategories> => {
    const stateUpper = state.toUpperCase();

    // One query per city, then count in-memory (cached).
    const { data: venues } = await supabase
      .from("venues")
      .select("vibeTags, whoItsFor, hardwareBrands, tags, launchMonitorType, hasPrivateRooms, coachingAvailable, wifi, parking, foodAndDrink, softwareSlugs")
      .ilike("city", city)
      .eq("state", stateUpper)
      .eq("country", "US")
      .eq("status", "active");

    if (!venues) return { vibes: [], segments: [], hardware: [], launchMonitors: [], amenities: [], software: [], tags: [] };

    const vibeCounts = new Map<string, number>();
    const segmentCounts = new Map<string, number>();
    const hardwareCounts = new Map<string, number>();
    const launchMonitorCounts = new Map<string, number>();
    const amenityCounts = new Map<string, number>();
    const softwareCounts = new Map<string, number>();
    const tagCounts = new Map<string, number>();

    for (const venue of venues) {
      for (const vibe of venue.vibeTags || []) {
        if (VIBE_CATEGORIES.some((v) => v.slug === vibe)) {
          vibeCounts.set(vibe, (vibeCounts.get(vibe) || 0) + 1);
        }
      }

      for (const segment of venue.whoItsFor || []) {
        if (SEGMENT_CATEGORIES.some((s) => s.slug === segment)) {
          segmentCounts.set(segment, (segmentCounts.get(segment) || 0) + 1);
        }
      }

      for (const brand of venue.hardwareBrands || []) {
        if (HARDWARE_CATEGORIES.some((h) => h.slug === brand)) {
          hardwareCounts.set(brand, (hardwareCounts.get(brand) || 0) + 1);
        }
      }

      const monitorSlug = String(venue.launchMonitorType || "unknown");
      if (LAUNCH_MONITOR_LABELS[monitorSlug]) {
        launchMonitorCounts.set(monitorSlug, (launchMonitorCounts.get(monitorSlug) || 0) + 1);
      }

      for (const amenity of AMENITY_CATEGORIES) {
        if (hasAmenity(venue, amenity.slug)) {
          amenityCounts.set(amenity.slug, (amenityCounts.get(amenity.slug) || 0) + 1);
        }
      }

      for (const softwareSlug of extractSoftwareSlugs(venue.softwareSlugs)) {
        softwareCounts.set(softwareSlug, (softwareCounts.get(softwareSlug) || 0) + 1);
      }

      for (const tag of venue.tags || []) {
        const normalized = normalizeTagSlug(tag);
        if (!normalized) continue;
        tagCounts.set(normalized, (tagCounts.get(normalized) || 0) + 1);
      }
    }

    const vibes = VIBE_CATEGORIES.map((cat) => ({
      slug: cat.slug,
      label: cat.label,
      count: vibeCounts.get(cat.slug) || 0,
    }))
      .filter((cat) => cat.count > 0)
      .sort((a, b) => b.count - a.count);

    const segments = SEGMENT_CATEGORIES.map((cat) => ({
      slug: cat.slug,
      label: cat.label,
      count: segmentCounts.get(cat.slug) || 0,
    }))
      .filter((cat) => cat.count > 0)
      .sort((a, b) => b.count - a.count);

    const hardware = HARDWARE_CATEGORIES.map((cat) => ({
      slug: cat.slug,
      label: cat.label,
      count: hardwareCounts.get(cat.slug) || 0,
    }))
      .filter((cat) => cat.count > 0)
      .sort((a, b) => b.count - a.count);

    const launchMonitors = Object.entries(LAUNCH_MONITOR_LABELS)
      .map(([slug, label]) => ({
        slug,
        label,
        count: launchMonitorCounts.get(slug) || 0,
      }))
      .filter((cat) => cat.count > 0)
      .sort((a, b) => b.count - a.count);

    const amenities = AMENITY_CATEGORIES.map((cat) => ({
      slug: cat.slug,
      label: cat.label,
      count: amenityCounts.get(cat.slug) || 0,
    }))
      .filter((cat) => cat.count > 0)
      .sort((a, b) => b.count - a.count);

    const software = SOFTWARE_CATEGORIES.map((cat) => ({
      slug: cat.slug,
      label: cat.label,
      count: softwareCounts.get(cat.slug) || 0,
    }))
      .filter((cat) => cat.count > 0)
      .sort((a, b) => b.count - a.count);

    const tags = Array.from(tagCounts.entries())
      .map(([slug, count]) => ({
        slug,
        label: formatTagLabel(slug),
        count,
      }))
      .filter((tag) => tag.count > 0)
      .sort((a, b) => {
        const aPreferred = PREFERRED_CITY_TAGS.includes(a.slug) ? 0 : 1;
        const bPreferred = PREFERRED_CITY_TAGS.includes(b.slug) ? 0 : 1;
        if (aPreferred !== bPreferred) return aPreferred - bPreferred;
        return b.count - a.count;
      });

    return { vibes, segments, hardware, launchMonitors, amenities, software, tags };
  },
  [CACHE_TAG],
  { revalidate: CACHE_DURATION, tags: [CACHE_TAG] }
);

/**
 * Get category browse links for city page, filtered to only show
 * categories that actually have venues in this city.
 */
export async function getCityCategoryBrowseLinksWithCounts(
  state: string,
  city: string,
  limit = 4,
  queryState?: string
): Promise<{
  vibes: Array<{ href: string; label: string; count: number }>;
  segments: Array<{ href: string; label: string; count: number }>;
  hardware: Array<{ href: string; label: string; count: number }>;
  launchMonitors: Array<{ href: string; label: string; count: number }>;
  amenities: Array<{ href: string; label: string; count: number }>;
  software: Array<{ href: string; label: string; count: number }>;
  tags: Array<{ href: string; label: string; count: number }>;
  totalCounts: {
    vibes: number;
    segments: number;
    hardware: number;
    launchMonitors: number;
    amenities: number;
    software: number;
    tags: number;
  };
}> {
  const categories = await getAvailableCategoriesForCity(queryState || state, city);
  const citySlug = city.toLowerCase().replace(/\s+/g, "-");

  return {
    vibes: categories.vibes.slice(0, limit).map((cat) => ({
      href: getCityVibeUrl(state, city, cat.slug),
      label: cat.label,
      count: cat.count,
    })),
    segments: categories.segments.slice(0, limit).map((cat) => ({
      href: getCityWhoItsForUrl(state, city, cat.slug),
      label: cat.label,
      count: cat.count,
    })),
    hardware: categories.hardware.slice(0, limit).map((cat) => ({
      href: getCityHardwareUrl(state, city, cat.slug),
      label: cat.label,
      count: cat.count,
    })),
    launchMonitors: categories.launchMonitors.slice(0, limit).map((cat) => ({
      href: `/venue/us/${state}/${citySlug}/best/launch-monitor/${toUrlSlug(cat.slug)}`,
      label: cat.label,
      count: cat.count,
    })),
    amenities: categories.amenities.slice(0, limit).map((cat) => ({
      href: `/venue/us/${state}/${citySlug}/best/amenities/${toUrlSlug(cat.slug)}`,
      label: cat.label,
      count: cat.count,
    })),
    software: categories.software.slice(0, limit).map((cat) => ({
      href: `/venue/us/${state}/${citySlug}/best/software/${toUrlSlug(cat.slug)}`,
      label: cat.label,
      count: cat.count,
    })),
    tags: categories.tags.slice(0, limit).map((cat) => ({
      href: `/venue/us/${state}/${citySlug}/best/${toUrlSlug(cat.slug)}`,
      label: cat.label,
      count: cat.count,
    })),
    totalCounts: {
      vibes: categories.vibes.length,
      segments: categories.segments.length,
      hardware: categories.hardware.length,
      launchMonitors: categories.launchMonitors.length,
      amenities: categories.amenities.length,
      software: categories.software.length,
      tags: categories.tags.length,
    },
  };
}

/**
 * Cached fetch of all venues for category counting.
 * Single DB call reused across all page generations during build.
 */
const getCachedVenuesForCategories = unstable_cache(
  async () => {
    const { data } = await supabase
      .from("venues")
      .select("tags, vibeTags, whoItsFor, hardwareBrands, launchMonitorType")
      .eq("status", "active");

    return data || [];
  },
  ["global-venues-for-categories"],
  { revalidate: CACHE_DURATION, tags: [CACHE_TAG] }
);

/**
 * Get related category links for global best-by pages,
 * filtered to only show categories with venues.
 * Cached for build-time efficiency.
 */
export const getGlobalRelatedLinksWithCounts = unstable_cache(
  async (
    currentCategory: string,
    currentSlug: string,
    limit = 6
  ): Promise<Array<{ href: string; label: string; count: number }>> => {
    const venues = await getCachedVenuesForCategories();

    const links: Array<{ href: string; label: string; count: number }> = [];

    // Add other hardware if current is hardware
    if (currentCategory === "hardware") {
      const otherHardware = HARDWARE_CATEGORIES.filter((h) => h.slug !== currentSlug);
      for (const hw of otherHardware) {
        const count = venues.filter((v) => (v.hardwareBrands || []).includes(hw.slug)).length;
        if (count > 0) {
          links.push({ href: `/best/hardware/${toUrlSlug(hw.slug)}`, label: `Best ${hw.label}`, count });
        }
      }
    }

    // Add vibes
    for (const vibe of VIBE_CATEGORIES) {
      if (currentCategory === "vibe" && vibe.slug === currentSlug) continue;
      const count = venues.filter((v) => (v.vibeTags || []).includes(vibe.slug)).length;
      if (count > 0 && links.length < limit) {
        links.push({ href: `/best/vibe/${toUrlSlug(vibe.slug)}`, label: `Best ${vibe.label}`, count });
      }
    }

    // Add segments
    for (const segment of SEGMENT_CATEGORIES) {
      if (currentCategory === "who-its-for" && segment.slug === currentSlug) continue;
      const count = venues.filter((v) => (v.whoItsFor || []).includes(segment.slug)).length;
      if (count > 0 && links.length < limit) {
        links.push({ href: `/best/who-its-for/${toUrlSlug(segment.slug)}`, label: `Best for ${segment.label}`, count });
      }
    }

    return links.slice(0, limit);
  },
  ["global-related-links"],
  { revalidate: CACHE_DURATION, tags: [CACHE_TAG] }
);
