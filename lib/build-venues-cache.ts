import "server-only";

import fs from "node:fs";
import path from "node:path";
import type { Database } from "@/types/supabase";
import { normalizeStateCode } from "@/lib/states";

export type SnapshotVenueRow = Database["public"]["Tables"]["venues"]["Row"];

interface VenueSnapshotFile {
  version: number;
  generatedAt: string;
  totals: {
    venues: number;
    states: number;
    cities: number;
  };
  venues: SnapshotVenueRow[];
}

const SNAPSHOT_PATH = path.join(process.cwd(), ".cache", "venues.json");
const BUILD_PHASE = "phase-production-build";
let snapshotCache: VenueSnapshotFile | null | undefined;

function isString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isActiveUSVenue(venue: SnapshotVenueRow): boolean {
  return venue.status === "active" && venue.country === "US";
}

function readSnapshotFromDisk(): VenueSnapshotFile | null {
  if (!fs.existsSync(SNAPSHOT_PATH)) {
    return null;
  }

  const raw = fs.readFileSync(SNAPSHOT_PATH, "utf8");
  const parsed = JSON.parse(raw) as Partial<VenueSnapshotFile>;

  if (!Array.isArray(parsed.venues)) {
    throw new Error(`Invalid venue snapshot: "venues" must be an array (${SNAPSHOT_PATH})`);
  }

  return {
    version: typeof parsed.version === "number" ? parsed.version : 1,
    generatedAt: typeof parsed.generatedAt === "string" ? parsed.generatedAt : new Date().toISOString(),
    totals: parsed.totals ?? { venues: parsed.venues.length, states: 0, cities: 0 },
    venues: parsed.venues as SnapshotVenueRow[],
  };
}

export function readVenueSnapshot(): VenueSnapshotFile | null {
  // Snapshot is intended for build-time generation. Runtime can opt in explicitly.
  const allowSnapshot =
    process.env.NEXT_PHASE === BUILD_PHASE || process.env.USE_VENUE_SNAPSHOT === "1";
  if (!allowSnapshot) {
    return null;
  }

  if (snapshotCache !== undefined) {
    return snapshotCache;
  }
  snapshotCache = readSnapshotFromDisk();
  return snapshotCache;
}

export function readVenueSnapshotStrict(): VenueSnapshotFile {
  const snapshot = readVenueSnapshot();
  if (!snapshot) {
    throw new Error(
      `Missing venue snapshot at ${SNAPSHOT_PATH}. Run the prebuild cache script before next build.`
    );
  }
  return snapshot;
}

export function getSnapshotActiveUSVenues(): SnapshotVenueRow[] {
  const snapshot = readVenueSnapshot();
  if (!snapshot) return [];
  return snapshot.venues.filter(isActiveUSVenue);
}

export function getDistinctStatesFromSnapshot(): string[] {
  const states = new Set(
    getSnapshotActiveUSVenues()
      .map((venue) => venue.state)
      .filter(isString)
      .map((state) => normalizeStateCode(state))
  );
  return Array.from(states).sort((a, b) => a.localeCompare(b));
}

export function getDistinctCitiesFromSnapshot(): Array<{ state: string; city: string }> {
  const unique = new Map<string, { state: string; city: string }>();

  for (const venue of getSnapshotActiveUSVenues()) {
    if (!isString(venue.state) || !isString(venue.city)) continue;
    const state = normalizeStateCode(venue.state);
    const city = venue.city.trim();
    const key = `${state}::${city.toLowerCase()}`;
    if (!unique.has(key)) {
      unique.set(key, { state, city });
    }
  }

  return Array.from(unique.values()).sort((a, b) =>
    a.state === b.state
      ? a.city.localeCompare(b.city)
      : a.state.localeCompare(b.state)
  );
}

export function getStaticVenueParamsFromSnapshot(): Array<{ state: string; city: string; venueSlug: string }> {
  return getSnapshotActiveUSVenues()
    .filter((venue) => isString(venue.state) && isString(venue.city) && isString(venue.slug))
    .map((venue) => ({
      state: normalizeStateCode(venue.state),
      city: venue.city.trim(),
      venueSlug: venue.slug,
    }));
}

export function getVenueBySlugFromSnapshot(slug: string): SnapshotVenueRow | null {
  const normalized = slug.trim().toLowerCase();
  return (
    getSnapshotActiveUSVenues().find((venue) => venue.slug.toLowerCase() === normalized) ?? null
  );
}

export function getStateVenueCountsFromSnapshot(): Array<{ state: string; count: number }> {
  const counts = new Map<string, number>();

  for (const venue of getSnapshotActiveUSVenues()) {
    if (!isString(venue.state)) continue;
    const state = normalizeStateCode(venue.state);
    counts.set(state, (counts.get(state) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([state, count]) => ({ state, count }))
    .sort((a, b) => b.count - a.count || a.state.localeCompare(b.state));
}

export function getCityVenueCountsFromSnapshot(limitCount = 30): Array<{ city: string; state: string; count: number }> {
  const counts = new Map<string, { city: string; state: string; count: number }>();

  for (const venue of getSnapshotActiveUSVenues()) {
    if (!isString(venue.state) || !isString(venue.city)) continue;
    const state = normalizeStateCode(venue.state);
    const city = venue.city.trim();
    const key = `${state}::${city.toLowerCase()}`;
    const current = counts.get(key);
    if (current) {
      current.count += 1;
    } else {
      counts.set(key, { city, state, count: 1 });
    }
  }

  return Array.from(counts.values())
    .sort((a, b) => b.count - a.count || a.city.localeCompare(b.city))
    .slice(0, Math.max(1, limitCount));
}

export function getCitiesInStateFromSnapshot(targetState: string): Array<{ city: string; count: number }> {
  const state = normalizeStateCode(targetState);
  const counts = new Map<string, number>();

  for (const venue of getSnapshotActiveUSVenues()) {
    if (!isString(venue.state) || !isString(venue.city)) continue;
    if (normalizeStateCode(venue.state) !== state) continue;
    const city = venue.city.trim();
    counts.set(city, (counts.get(city) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count || a.city.localeCompare(b.city));
}

export function getFeaturedVenuesFromSnapshot(limitCount = 9): SnapshotVenueRow[] {
  return getSnapshotActiveUSVenues()
    .filter((venue) => Boolean(venue.featured))
    .sort((a, b) => {
      const ratingA = typeof a.ratingOverall === "number" ? a.ratingOverall : -1;
      const ratingB = typeof b.ratingOverall === "number" ? b.ratingOverall : -1;
      if (ratingA !== ratingB) return ratingB - ratingA;
      const nameA = isString(a.name) ? a.name : "";
      const nameB = isString(b.name) ? b.name : "";
      return nameA.localeCompare(nameB);
    })
    .slice(0, Math.max(1, limitCount));
}

export function getTotalActiveVenueCountFromSnapshot(): number {
  return getSnapshotActiveUSVenues().length;
}

export function getCityVenuesPageFromSnapshot(
  state: string,
  city: string,
  page: number,
  pageSize: number,
  sort: "recommended" | "name-asc" = "recommended"
): { venues: SnapshotVenueRow[]; hasNextPage: boolean } {
  const stateUpper = normalizeStateCode(state);
  const normalizedCity = city.trim().toLowerCase();
  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);
  const skip = (safePage - 1) * safePageSize;

  const rows = getSnapshotActiveUSVenues()
    .filter((venue) => {
      if (!isString(venue.state) || !isString(venue.city)) return false;
      return normalizeStateCode(venue.state) === stateUpper && venue.city.trim().toLowerCase() === normalizedCity;
    })
    .sort((a, b) => {
      const nameA = isString(a.name) ? a.name : "";
      const nameB = isString(b.name) ? b.name : "";

      if (sort === "name-asc") return nameA.localeCompare(nameB);

      const featuredA = a.featured ? 1 : 0;
      const featuredB = b.featured ? 1 : 0;
      if (featuredA !== featuredB) return featuredB - featuredA;
      const ratingA = typeof a.ratingOverall === "number" ? a.ratingOverall : -1;
      const ratingB = typeof b.ratingOverall === "number" ? b.ratingOverall : -1;
      if (ratingA !== ratingB) return ratingB - ratingA;
      return nameA.localeCompare(nameB);
    });

  const pageRows = rows.slice(skip, skip + safePageSize + 1);
  return {
    venues: pageRows.slice(0, safePageSize),
    hasNextPage: pageRows.length > safePageSize,
  };
}

export function getCityVenueCountFromSnapshot(state: string, city: string): number {
  const stateUpper = normalizeStateCode(state);
  const normalizedCity = city.trim().toLowerCase();
  let count = 0;

  for (const venue of getSnapshotActiveUSVenues()) {
    if (!isString(venue.state) || !isString(venue.city)) continue;
    if (normalizeStateCode(venue.state) !== stateUpper) continue;
    if (venue.city.trim().toLowerCase() !== normalizedCity) continue;
    count += 1;
  }

  return count;
}
