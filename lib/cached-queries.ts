// Cached wrappers for shared Supabase queries.
// Reduces egress by deduplicating identical calls across pages during build and ISR.

import { unstable_cache } from "next/cache";
import { supabase } from "@/lib/supabase";
import { normalizeStateCode } from "@/lib/states";
import {
  getCityVenueCountsFromSnapshot,
  getCitiesInStateFromSnapshot,
  getFeaturedVenuesFromSnapshot,
  getSnapshotActiveUSVenues,
  getStateVenueCountsFromSnapshot,
  getTotalActiveVenueCountFromSnapshot,
  readVenueSnapshot,
} from "@/lib/build-venues-cache";

const THIRTY_DAYS = 2592000;

function normalizeStateCountRows(rows: { state: string; count: number }[]) {
  const counts = new Map<string, number>();

  for (const row of rows) {
    const state = normalizeStateCode(String(row.state || ""));
    if (!state) continue;
    counts.set(state, (counts.get(state) || 0) + Number(row.count || 0));
  }

  return Array.from(counts.entries())
    .map(([state, count]) => ({ state, count }))
    .sort((a, b) => b.count - a.count || a.state.localeCompare(b.state));
}

// ─── Nearby cities (used on city pages + all city best-by pages) ─────────────

export const getCachedNearbyCities = unstable_cache(
  async (targetState: string, excludeCity: string, limitCount = 6) => {
    const snapshot = readVenueSnapshot();
    if (snapshot) {
      const stateUpper = normalizeStateCode(targetState);
      const excluded = excludeCity.trim().toLowerCase();
      const counts = new Map<string, number>();

      for (const venue of getSnapshotActiveUSVenues()) {
        const venueState = typeof venue.state === "string" ? normalizeStateCode(venue.state) : "";
        const venueCity = typeof venue.city === "string" ? venue.city.trim() : "";
        if (!venueState || !venueCity || venueState !== stateUpper) continue;
        if (venueCity.toLowerCase() === excluded) continue;
        counts.set(venueCity, (counts.get(venueCity) || 0) + 1);
      }

      return Array.from(counts.entries())
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count || a.city.localeCompare(b.city))
        .slice(0, Math.max(1, limitCount))
        .map(({ city }) => ({ city }));
    }

    const { data } = await supabase.rpc("get_nearby_cities", {
      target_state: normalizeStateCode(targetState),
      exclude_city: excludeCity,
      limit_count: limitCount,
    });
    return (data || []) as { city: string }[];
  },
  ["nearby-cities"],
  { revalidate: THIRTY_DAYS, tags: ["nearby-cities"] }
);

// ─── State venue counts (homepage + /venue/us index) ─────────────────────────

export const getCachedStateVenueCounts = unstable_cache(
  async () => {
    const snapshot = readVenueSnapshot();
    if (snapshot) {
      return normalizeStateCountRows(getStateVenueCountsFromSnapshot());
    }

    const { data } = await supabase.rpc("get_state_venue_counts");
    return normalizeStateCountRows((data || []) as { state: string; count: number }[]);
  },
  ["state-venue-counts"],
  { revalidate: THIRTY_DAYS, tags: ["state-venue-counts"] }
);

// ─── City venue counts (homepage) ────────────────────────────────────────────

export const getCachedCityVenueCounts = unstable_cache(
  async (limitCount = 30) => {
    const snapshot = readVenueSnapshot();
    if (snapshot) {
      return getCityVenueCountsFromSnapshot(limitCount);
    }

    const { data } = await supabase.rpc("get_city_venue_counts", {
      limit_count: limitCount,
    });
    return (data || []) as { city: string; state: string; count: number }[];
  },
  ["city-venue-counts"],
  { revalidate: THIRTY_DAYS, tags: ["city-venue-counts"] }
);

// ─── Cities in state (state pages) ──────────────────────────────────────────

export const getCachedCitiesInState = unstable_cache(
  async (targetState: string) => {
    const snapshot = readVenueSnapshot();
    if (snapshot) {
      return getCitiesInStateFromSnapshot(normalizeStateCode(targetState));
    }

    const { data } = await supabase.rpc("get_cities_in_state", {
      target_state: normalizeStateCode(targetState),
    });
    return (data || []) as { city: string; count: number }[];
  },
  ["cities-in-state"],
  { revalidate: THIRTY_DAYS, tags: ["cities-in-state"] }
);

// ─── Featured venues (homepage) ─────────────────────────────────────────────

export const getCachedFeaturedVenues = unstable_cache(
  async (limit = 9) => {
    const snapshot = readVenueSnapshot();
    if (snapshot) {
      return getFeaturedVenuesFromSnapshot(limit);
    }

    const { data } = await supabase
      .from("venues")
      .select(
        "id, slug, name, city, state, heroImage, venueType, simulatorSystems, launchMonitorType, priceRangeMin, priceRangeMax, ratingOverall, featured, tags, vibeTags"
      )
      .eq("status", "active")
      .eq("featured", true)
      .order("ratingOverall", { ascending: false, nullsFirst: false })
      .order("name", { ascending: true })
      .limit(limit);
    return data || [];
  },
  ["featured-venues"],
  { revalidate: THIRTY_DAYS, tags: ["featured-venues"] }
);

// ─── Nearby venues on detail page ───────────────────────────────────────────

const NEARBY_VENUE_FIELDS =
  "id, name, slug, city, state, heroImage, venueType, simulatorSystems, launchMonitorType, priceRangeMin, priceRangeMax, ratingOverall, featured, tags";

export const getCachedNearbyVenues = unstable_cache(
  async (city: string, state: string, excludeVenueId: string) => {
    const snapshot = readVenueSnapshot();
    if (snapshot) {
      const normalizedCity = city.trim().toLowerCase();
      const stateUpper = normalizeStateCode(state);
      const excludedId = String(excludeVenueId);
      const venues = getSnapshotActiveUSVenues();

      const sameCity = venues
        .filter((venue) => {
          const venueId = String(venue.id);
          const venueCity = typeof venue.city === "string" ? venue.city.trim().toLowerCase() : "";
          const venueState = typeof venue.state === "string" ? normalizeStateCode(venue.state) : "";
          return venueId !== excludedId && venueCity === normalizedCity && venueState === stateUpper;
        })
        .sort((a, b) => {
          const featuredA = a.featured ? 1 : 0;
          const featuredB = b.featured ? 1 : 0;
          if (featuredA !== featuredB) return featuredB - featuredA;
          const ratingA = typeof a.ratingOverall === "number" ? a.ratingOverall : -1;
          const ratingB = typeof b.ratingOverall === "number" ? b.ratingOverall : -1;
          if (ratingA !== ratingB) return ratingB - ratingA;
          const nameA = typeof a.name === "string" ? a.name : "";
          const nameB = typeof b.name === "string" ? b.name : "";
          return nameA.localeCompare(nameB);
        })
        .slice(0, 4);

      if (sameCity.length > 0) {
        return { venues: sameCity, scope: "city" as const };
      }

      const sameState = venues
        .filter((venue) => {
          const venueId = String(venue.id);
          const venueState = typeof venue.state === "string" ? normalizeStateCode(venue.state) : "";
          return venueId !== excludedId && venueState === stateUpper;
        })
        .sort((a, b) => {
          const featuredA = a.featured ? 1 : 0;
          const featuredB = b.featured ? 1 : 0;
          if (featuredA !== featuredB) return featuredB - featuredA;
          const ratingA = typeof a.ratingOverall === "number" ? a.ratingOverall : -1;
          const ratingB = typeof b.ratingOverall === "number" ? b.ratingOverall : -1;
          if (ratingA !== ratingB) return ratingB - ratingA;
          const nameA = typeof a.name === "string" ? a.name : "";
          const nameB = typeof b.name === "string" ? b.name : "";
          return nameA.localeCompare(nameB);
        })
        .slice(0, 4);

      return { venues: sameState, scope: "state" as const };
    }

    // Try same city first
    const normalizedState = normalizeStateCode(state);
    const { data: cityVenues } = await supabase
      .from("venues")
      .select(NEARBY_VENUE_FIELDS)
      .eq("city", city)
      .in("state", normalizedState === state ? [state] : [state, normalizedState])
      .neq("id", excludeVenueId)
      .eq("status", "active")
      .order("featured", { ascending: false })
      .order("ratingOverall", { ascending: false, nullsFirst: false })
      .limit(4);

    if (cityVenues && cityVenues.length > 0) {
      return { venues: cityVenues, scope: "city" as const };
    }

    // Fall back to same state
    const { data: stateVenues } = await supabase
      .from("venues")
      .select(NEARBY_VENUE_FIELDS)
      .in("state", normalizedState === state ? [state] : [state, normalizedState])
      .neq("id", excludeVenueId)
      .eq("status", "active")
      .order("featured", { ascending: false })
      .order("ratingOverall", { ascending: false, nullsFirst: false })
      .limit(4);

    return { venues: stateVenues || [], scope: "state" as const };
  },
  ["nearby-venues"],
  { revalidate: THIRTY_DAYS, tags: ["nearby-venues"] }
);

// ─── Total active venue count (homepage) ────────────────────────────────────

export const getCachedTotalActiveVenueCount = unstable_cache(
  async () => {
    const snapshot = readVenueSnapshot();
    if (snapshot) {
      return getTotalActiveVenueCountFromSnapshot();
    }

    const { count } = await supabase
      .from("venues")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");
    return count || 0;
  },
  ["total-active-venue-count"],
  { revalidate: THIRTY_DAYS, tags: ["total-active-venue-count"] }
);
