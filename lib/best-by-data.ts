// Data access functions for "Best By" categories
// Uses optimized database queries with caching

import { db } from "@/lib/db";
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
}

// Cache category lookups for 1 hour since they rarely change
const CACHE_TAG = "category-counts";
const CACHE_DURATION = 3600; // 1 hour

/**
 * Get available categories for a city with cached results.
 * Uses database aggregations for efficient counting.
 */
export const getAvailableCategoriesForCity = unstable_cache(
  async (state: string, city: string): Promise<AvailableCategories> => {
    const stateUpper = state.toUpperCase();

    // Get distinct vibe tags and their counts using raw query for efficiency
    const [vibeResults, segmentResults, hardwareResults] = await Promise.all([
      // Query vibe tags - venues that have at least one of our known vibe tags
      db.$queryRaw<
        Array<{ tag: string; count: bigint }>
      >`SELECT unnest("vibeTags") as tag, COUNT(*) as count 
        FROM venues 
        WHERE LOWER(city) = LOWER(${city}) 
          AND state = ${stateUpper}
          AND country = 'US' 
          AND status = 'active'
          AND "vibeTags" && ${VIBE_CATEGORIES.map((c) => c.slug)}::text[]
        GROUP BY tag`,

      // Query whoItsFor segments
      db.$queryRaw<
        Array<{ tag: string; count: bigint }>
      >`SELECT unnest("whoItsFor") as tag, COUNT(*) as count 
        FROM venues 
        WHERE LOWER(city) = LOWER(${city}) 
          AND state = ${stateUpper}
          AND country = 'US' 
          AND status = 'active'
          AND "whoItsFor" && ${SEGMENT_CATEGORIES.map((c) => c.slug)}::text[]
        GROUP BY tag`,

      // Query hardware from simulator_systems JSON
      // This is more complex - we'll fetch venues and extract
      getHardwareCounts(stateUpper, city),
    ]);

    // Build maps from results
    const vibeCounts = new Map(
      vibeResults.map((r) => [r.tag, Number(r.count)])
    );
    const segmentCounts = new Map(
      segmentResults.map((r) => [r.tag, Number(r.count)])
    );

    // Build result arrays, only including categories from our config
    const vibes = VIBE_CATEGORIES.filter(
      (cat) => (vibeCounts.get(cat.slug) || 0) > 0
    )
      .map((cat) => ({
        slug: cat.slug,
        label: cat.label,
        count: vibeCounts.get(cat.slug) || 0,
      }))
      .sort((a, b) => b.count - a.count);

    const segments = SEGMENT_CATEGORIES.filter(
      (cat) => (segmentCounts.get(cat.slug) || 0) > 0
    )
      .map((cat) => ({
        slug: cat.slug,
        label: cat.label,
        count: segmentCounts.get(cat.slug) || 0,
      }))
      .sort((a, b) => b.count - a.count);

    return { vibes, segments, hardware: hardwareResults };
  },
  [CACHE_TAG],
  { revalidate: CACHE_DURATION, tags: [CACHE_TAG] }
);

/**
 * Get hardware counts by analyzing simulator_systems JSON.
 * This is done in a separate query since JSON aggregation is complex in Postgres.
 */
async function getHardwareCounts(
  state: string,
  city: string
): Promise<Array<{ slug: string; label: string; count: number }>> {
  // Fetch minimal data - just the simulator systems
  const venues = await db.venue.findMany({
    where: {
      city: { equals: city, mode: "insensitive" },
      state: state,
      country: "US",
      status: "active",
      simulatorSystems: { not: undefined },
    },
    select: { simulatorSystems: true },
  });

  const hardwareCounts = new Map<string, number>();

  for (const venue of venues) {
    if (!venue.simulatorSystems) continue;

    try {
      const systems = Array.isArray(venue.simulatorSystems)
        ? venue.simulatorSystems
        : [];
      for (const system of systems) {
        const sys = system as { brand?: string } | undefined;
        if (sys?.brand) {
          const slug = mapBrandToHardwareSlug(sys.brand.toLowerCase());
          if (slug) {
            hardwareCounts.set(slug, (hardwareCounts.get(slug) || 0) + 1);
          }
        }
      }
    } catch {
      // Skip invalid JSON
    }
  }

  return HARDWARE_CATEGORIES.filter(
    (cat) => (hardwareCounts.get(cat.slug) || 0) > 0
  )
    .map((cat) => ({
      slug: cat.slug,
      label: cat.label,
      count: hardwareCounts.get(cat.slug) || 0,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Map brand names to our hardware category slugs
 */
function mapBrandToHardwareSlug(brand: string): string | null {
  const brandMap: Record<string, string> = {
    trackman: "trackman",
    foresight: "foresight",
    "gc quad": "gc-quad",
    gcquad: "gc-quad",
    garmin: "garmin",
    skytrak: "skytrak",
    "full swing": "full-swing",
    fullswing: "full-swing",
    flightscope: "flightscope",
    mevo: "flightscope",
    optishot: "optishot",
    trugolf: "trugolf",
    uneekor: "uneekor",
    aboutgolf: "aboutgolf",
    hd: "hd-golf",
    "hd golf": "hd-golf",
  };

  return brandMap[brand] || null;
}

/**
 * Get category browse links for city page, filtered to only show
 * categories that actually have venues in this city.
 */
export async function getCityCategoryBrowseLinksWithCounts(
  state: string,
  city: string,
  limit = 4
): Promise<{
  vibes: Array<{ href: string; label: string; count: number }>;
  segments: Array<{ href: string; label: string; count: number }>;
  hardware: Array<{ href: string; label: string; count: number }>;
}> {
  const categories = await getAvailableCategoriesForCity(state, city);

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
  };
}

/**
 * Get related category links for global best-by pages,
 * filtered to only show categories with venues.
 */
export async function getGlobalRelatedLinksWithCounts(
  currentCategory: string,
  currentSlug: string,
  limit = 6
): Promise<Array<{ href: string; label: string; count: number }>> {
  const venues = await db.venue.findMany({
    where: { status: "active" },
    select: {
      tags: true,
      vibeTags: true,
      whoItsFor: true,
      simulatorSystems: true,
      launchMonitorType: true,
    },
  });

  const links: Array<{ href: string; label: string; count: number }> = [];

  // Add other hardware if current is hardware
  if (currentCategory === "hardware") {
    const otherHardware = HARDWARE_CATEGORIES.filter((h) => h.slug !== currentSlug);
    for (const hw of otherHardware) {
      const count = venues.filter((v) => {
        try {
          const systems = v.simulatorSystems as { brand?: string }[] | null;
          return systems?.some((s) => s.brand?.toLowerCase() === hw.slug.toLowerCase());
        } catch {
          return false;
        }
      }).length;
      if (count > 0) {
        links.push({ href: `/best/hardware/${hw.slug}`, label: `Best ${hw.label}`, count });
      }
    }
  }

  // Add vibes
  for (const vibe of VIBE_CATEGORIES) {
    if (currentCategory === "vibe" && vibe.slug === currentSlug) continue;
    const count = venues.filter((v) => (v.vibeTags || []).includes(vibe.slug)).length;
    if (count > 0 && links.length < limit) {
      links.push({ href: `/best/vibe/${vibe.slug}`, label: `Best ${vibe.label}`, count });
    }
  }

  // Add segments
  for (const segment of SEGMENT_CATEGORIES) {
    if (currentCategory === "who-its-for" && segment.slug === currentSlug) continue;
    const count = venues.filter((v) => (v.whoItsFor || []).includes(segment.slug)).length;
    if (count > 0 && links.length < limit) {
      links.push({ href: `/best/who-its-for/${segment.slug}`, label: `Best for ${segment.label}`, count });
    }
  }

  return links.slice(0, limit);
}
