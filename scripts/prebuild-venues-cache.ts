import fs from "node:fs/promises";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { normalizeStateCode } from "../lib/states";

loadEnvConfig(process.cwd());

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for prebuild cache.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const CACHE_DIR = path.join(process.cwd(), ".cache");
const CACHE_PATH = path.join(CACHE_DIR, "venues.json");
const TEMP_PATH = path.join(CACHE_DIR, "venues.json.tmp");
const PAGE_SIZE = 1000;
const SNAPSHOT_VENUE_FIELDS = [
  "id",
  "slug",
  "name",
  "status",
  "country",
  "address",
  "city",
  "state",
  "zipCode",
  "latitude",
  "longitude",
  "phone",
  "email",
  "website",
  "heroImage",
  "venueType",
  "launchMonitorType",
  "simulatorSystems",
  "hardwareBrands",
  "softwareSlugs",
  "about",
  "hours",
  "pricingModel",
  "priceRangeMin",
  "priceRangeMax",
  "bookingUrl",
  "walkInsAllowed",
  "bayCount",
  "maxGroupSizePerBay",
  "hasPrivateRooms",
  "privateRoomsCount",
  "puttingMode",
  "leftyFriendly",
  "clubTracking",
  "ballTracking",
  "foodAndDrink",
  "wifi",
  "parking",
  "coachingAvailable",
  "kidFriendly",
  "accessibility",
  "tags",
  "vibeTags",
  "whoItsFor",
  "whyGolfersLikeIt",
  "comprehensiveData",
  "googleMapsUrl",
  "claimed",
  "verificationLevel",
  "featured",
  "ratingOverall",
  "ratingFacilityComfort",
  "ratingTechQuality",
  "ratingValueForMoney",
  "metaTitle",
  "metaDescription",
  "createdAt",
  "updatedAt",
].join(",");

async function fetchAllActiveUSVenues() {
  const venues: Record<string, unknown>[] = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabase
      .from("venues")
      .select(SNAPSHOT_VENUE_FIELDS)
      .eq("status", "active")
      .eq("country", "US")
      .order("id", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      throw new Error(`Failed to fetch venues at offset ${offset}: ${error.message}`);
    }

    if (!data || data.length === 0) {
      break;
    }

    const rows = data as unknown as Record<string, unknown>[];
    venues.push(
      ...rows.map((row) => {
        const state = typeof row.state === "string" ? normalizeStateCode(row.state) : row.state;
        return { ...row, state };
      })
    );
    if (rows.length < PAGE_SIZE) {
      break;
    }

    offset += PAGE_SIZE;
  }

  return venues;
}

function summarize(venues: Record<string, unknown>[]) {
  const states = new Set<string>();
  const cities = new Set<string>();

  for (const venue of venues) {
    const state = typeof venue.state === "string" ? venue.state.toUpperCase() : "";
    const city = typeof venue.city === "string" ? venue.city.trim().toLowerCase() : "";
    if (state) states.add(state);
    if (state && city) cities.add(`${state}::${city}`);
  }

  return {
    venues: venues.length,
    states: states.size,
    cities: cities.size,
  };
}

async function main() {
  const startedAt = Date.now();
  console.log("[prebuild-venues-cache] Fetching active US venues...");

  const venues = await fetchAllActiveUSVenues();
  const totals = summarize(venues);

  await fs.mkdir(CACHE_DIR, { recursive: true });

  const payload = {
    version: 1,
    generatedAt: new Date().toISOString(),
    totals,
    venues,
  };

  await fs.writeFile(TEMP_PATH, JSON.stringify(payload), "utf8");
  await fs.rename(TEMP_PATH, CACHE_PATH);

  const durationMs = Date.now() - startedAt;
  console.log(
    `[prebuild-venues-cache] Wrote ${totals.venues} venues (${totals.states} states, ${totals.cities} cities) to ${CACHE_PATH} in ${durationMs}ms`
  );
}

main().catch((error) => {
  console.error("[prebuild-venues-cache] Failed:", error);
  process.exit(1);
});
