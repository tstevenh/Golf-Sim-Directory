import "server-only";

import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { getSnapshotActiveUSVenues, type SnapshotVenueRow } from "@/lib/build-venues-cache";
import { getStateSlug, normalizeStateCode } from "@/lib/states";
import { normalizeHardwareBrand } from "@/lib/hardware-brands";
import { normalizeSoftwareSlug } from "@/lib/software-slugs";
import {
  AVAILABLE_TAGS,
  AVAILABLE_VIBES,
  AVAILABLE_SEGMENTS,
  AVAILABLE_HARDWARE,
  AVAILABLE_SOFTWARE,
  AVAILABLE_AMENITIES,
  AVAILABLE_LAUNCH_MONITORS,
} from "@/lib/category-config.generated";

const BASE_URL = "https://golfsimmap.com";
export const CITY_BEST_SITEMAP_CHUNK_SIZE = 45000;
const VENUE_FETCH_BATCH_SIZE = 1000;

type CityBestSitemapVenueRow = Pick<
  SnapshotVenueRow,
  | "state"
  | "city"
  | "tags"
  | "vibeTags"
  | "whoItsFor"
  | "hardwareBrands"
  | "launchMonitorType"
  | "softwareSlugs"
  | "hasPrivateRooms"
  | "coachingAvailable"
  | "wifi"
  | "parking"
  | "foodAndDrink"
>;

type CityBestBuckets = {
  stateCode: string;
  cityName: string;
  tags: Set<string>;
  vibes: Set<string>;
  segments: Set<string>;
  hardware: Set<string>;
  software: Set<string>;
  amenities: Set<string>;
  launchMonitors: Set<string>;
};

const ACTIVE_TAG_SLUGS = new Set(AVAILABLE_TAGS.filter((item) => item.count > 0).map((item) => item.slug));
const ACTIVE_VIBE_SLUGS = new Set(AVAILABLE_VIBES.filter((item) => item.count > 0).map((item) => item.slug));
const ACTIVE_SEGMENT_SLUGS = new Set(AVAILABLE_SEGMENTS.filter((item) => item.count > 0).map((item) => item.slug));
const ACTIVE_HARDWARE_SLUGS = new Set(AVAILABLE_HARDWARE.filter((item) => item.count > 0).map((item) => item.slug));
const ACTIVE_SOFTWARE_SLUGS = new Set(AVAILABLE_SOFTWARE.filter((item) => item.count > 0).map((item) => item.slug));
const ACTIVE_AMENITY_SLUGS = new Set(AVAILABLE_AMENITIES.filter((item) => item.count > 0).map((item) => item.slug));
const ACTIVE_LAUNCH_SLUGS = new Set(AVAILABLE_LAUNCH_MONITORS.filter((item) => item.count > 0).map((item) => item.slug));

let cachedEntriesPromise: Promise<MetadataRoute.Sitemap> | null = null;
let cachedChunksPromise: Promise<MetadataRoute.Sitemap[]> | null = null;

function toUrlSlug(slug: string): string {
  return slug.replace(/_/g, "-");
}

function toCitySlug(city: string): string {
  return city
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    .map((item) => item.trim());
}

function normalizeTagSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeListSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function isTruthyFlag(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;
  if (typeof value !== "string") return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
}

function getAmenitySlugs(venue: CityBestSitemapVenueRow): string[] {
  const slugs: string[] = [];
  if (venue.hasPrivateRooms) slugs.push("private_rooms");
  if (venue.coachingAvailable) slugs.push("coaching_available");
  if (venue.wifi) slugs.push("wifi");
  if (venue.parking === "free_lot") slugs.push("free_parking");
  if (venue.parking === "valet") slugs.push("valet_parking");

  const foodAndDrink = (venue.foodAndDrink || {}) as { alcohol?: unknown; hasBar?: unknown; food?: unknown; hasFood?: unknown };
  if (isTruthyFlag(foodAndDrink.alcohol) || isTruthyFlag(foodAndDrink.hasBar)) {
    slugs.push("full_bar");
  }
  if (isTruthyFlag(foodAndDrink.food) || isTruthyFlag(foodAndDrink.hasFood)) {
    slugs.push("kitchen_food");
  }

  return slugs;
}

async function fetchCityBestSitemapVenueRows(): Promise<CityBestSitemapVenueRow[]> {
  const snapshotRows = getSnapshotActiveUSVenues();
  if (snapshotRows.length > 0) {
    return snapshotRows;
  }

  const rows: CityBestSitemapVenueRow[] = [];
  let from = 0;

  while (true) {
    const to = from + VENUE_FETCH_BATCH_SIZE - 1;
    const { data, error } = await supabase
      .from("venues")
      .select(
        "state, city, tags, vibeTags, whoItsFor, hardwareBrands, launchMonitorType, softwareSlugs, hasPrivateRooms, coachingAvailable, wifi, parking, foodAndDrink"
      )
      .eq("status", "active")
      .eq("country", "US")
      .order("id", { ascending: true })
      .range(from, to);

    if (error) {
      throw error;
    }

    const batch = (data || []) as CityBestSitemapVenueRow[];
    rows.push(...batch);

    if (batch.length < VENUE_FETCH_BATCH_SIZE) {
      break;
    }
    from += VENUE_FETCH_BATCH_SIZE;
  }

  return rows;
}

function buildCityBestBuckets(venueRows: CityBestSitemapVenueRow[]): Map<string, CityBestBuckets> {
  const cityBuckets = new Map<string, CityBestBuckets>();

  for (const venue of venueRows) {
    const cityName = String(venue.city || "").trim();
    const stateCode = normalizeStateCode(String(venue.state || ""));
    if (!cityName || !stateCode) continue;

    const cityKey = `${stateCode}|${cityName.toLowerCase()}`;
    if (!cityBuckets.has(cityKey)) {
      cityBuckets.set(cityKey, {
        stateCode,
        cityName,
        tags: new Set<string>(),
        vibes: new Set<string>(),
        segments: new Set<string>(),
        hardware: new Set<string>(),
        software: new Set<string>(),
        amenities: new Set<string>(),
        launchMonitors: new Set<string>(),
      });
    }

    const bucket = cityBuckets.get(cityKey)!;

    for (const tag of toStringArray(venue.tags)) {
      const normalized = normalizeTagSlug(tag);
      if (normalized && ACTIVE_TAG_SLUGS.has(normalized)) {
        bucket.tags.add(normalized);
      }
    }

    for (const vibe of toStringArray(venue.vibeTags)) {
      const normalized = normalizeListSlug(vibe);
      if (normalized && ACTIVE_VIBE_SLUGS.has(normalized)) {
        bucket.vibes.add(normalized);
      }
    }

    for (const segment of toStringArray(venue.whoItsFor)) {
      const normalized = normalizeListSlug(segment);
      if (normalized && ACTIVE_SEGMENT_SLUGS.has(normalized)) {
        bucket.segments.add(normalized);
      }
    }

    for (const brand of toStringArray(venue.hardwareBrands)) {
      const normalized = normalizeHardwareBrand(brand);
      if (normalized && ACTIVE_HARDWARE_SLUGS.has(normalized)) {
        bucket.hardware.add(normalized);
      }
    }

    for (const software of toStringArray(venue.softwareSlugs)) {
      const normalized = normalizeSoftwareSlug(software);
      if (normalized && ACTIVE_SOFTWARE_SLUGS.has(normalized)) {
        bucket.software.add(normalized);
      }
    }

    for (const amenity of getAmenitySlugs(venue)) {
      if (ACTIVE_AMENITY_SLUGS.has(amenity)) {
        bucket.amenities.add(amenity);
      }
    }

    const launchSlug = String(venue.launchMonitorType || "")
      .trim()
      .toLowerCase()
      .replace(/-/g, "_");
    if (launchSlug && ACTIVE_LAUNCH_SLUGS.has(launchSlug)) {
      bucket.launchMonitors.add(launchSlug);
    }
  }

  return cityBuckets;
}

function buildCityBestSitemapEntries(buckets: Map<string, CityBestBuckets>): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];
  const sortedCityKeys = Array.from(buckets.keys()).sort((a, b) => a.localeCompare(b));

  for (const cityKey of sortedCityKeys) {
    const bucket = buckets.get(cityKey);
    if (!bucket) continue;

    const stateSlug = getStateSlug(bucket.stateCode);
    const citySlug = toCitySlug(bucket.cityName);
    const baseUrl = `${BASE_URL}/venue/us/${stateSlug}/${citySlug}/best`;

    if (bucket.tags.size > 0) {
      entries.push({
        url: `${baseUrl}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.5,
      });
    }
    for (const tag of Array.from(bucket.tags).sort((a, b) => a.localeCompare(b))) {
      entries.push({
        url: `${baseUrl}/${toUrlSlug(tag)}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.45,
      });
    }

    if (bucket.vibes.size > 0) {
      entries.push({
        url: `${baseUrl}/vibe`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.5,
      });
    }
    for (const vibe of Array.from(bucket.vibes).sort((a, b) => a.localeCompare(b))) {
      entries.push({
        url: `${baseUrl}/vibe/${toUrlSlug(vibe)}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.45,
      });
    }

    if (bucket.segments.size > 0) {
      entries.push({
        url: `${baseUrl}/who-its-for`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.5,
      });
    }
    for (const segment of Array.from(bucket.segments).sort((a, b) => a.localeCompare(b))) {
      entries.push({
        url: `${baseUrl}/who-its-for/${toUrlSlug(segment)}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.45,
      });
    }

    if (bucket.hardware.size > 0) {
      entries.push({
        url: `${baseUrl}/hardware`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.5,
      });
    }
    for (const hardware of Array.from(bucket.hardware).sort((a, b) => a.localeCompare(b))) {
      entries.push({
        url: `${baseUrl}/hardware/${toUrlSlug(hardware)}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.45,
      });
    }

    for (const software of Array.from(bucket.software).sort((a, b) => a.localeCompare(b))) {
      entries.push({
        url: `${baseUrl}/software/${toUrlSlug(software)}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.45,
      });
    }
    if (bucket.software.size > 0) {
      entries.push({
        url: `${baseUrl}/software`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.5,
      });
    }

    for (const launchMonitor of Array.from(bucket.launchMonitors).sort((a, b) => a.localeCompare(b))) {
      entries.push({
        url: `${baseUrl}/launch-monitor/${toUrlSlug(launchMonitor)}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.45,
      });
    }
    if (bucket.launchMonitors.size > 0) {
      entries.push({
        url: `${baseUrl}/launch-monitor`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.5,
      });
    }

    for (const amenity of Array.from(bucket.amenities).sort((a, b) => a.localeCompare(b))) {
      entries.push({
        url: `${baseUrl}/amenities/${toUrlSlug(amenity)}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.45,
      });
    }
    if (bucket.amenities.size > 0) {
      entries.push({
        url: `${baseUrl}/amenities`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.5,
      });
    }
  }

  return entries;
}

export async function getCityBestSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  if (!cachedEntriesPromise) {
    cachedEntriesPromise = (async () => {
      const venueRows = await fetchCityBestSitemapVenueRows();
      const buckets = buildCityBestBuckets(venueRows);
      return buildCityBestSitemapEntries(buckets);
    })();
  }
  return cachedEntriesPromise;
}

export async function getCityBestSitemapChunks(): Promise<MetadataRoute.Sitemap[]> {
  if (!cachedChunksPromise) {
    cachedChunksPromise = (async () => {
      const entries = await getCityBestSitemapEntries();
      if (entries.length === 0) return [];

      const chunks: MetadataRoute.Sitemap[] = [];
      for (let start = 0; start < entries.length; start += CITY_BEST_SITEMAP_CHUNK_SIZE) {
        chunks.push(entries.slice(start, start + CITY_BEST_SITEMAP_CHUNK_SIZE));
      }
      return chunks;
    })();
  }
  return cachedChunksPromise;
}

export async function getCityBestSitemapIds(): Promise<number[]> {
  const chunks = await getCityBestSitemapChunks();
  return chunks.map((_, index) => index);
}
