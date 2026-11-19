import type { SupabaseClient } from "@supabase/supabase-js";

export type GeocodeResult = {
  latitude: number;
  longitude: number;
  /** Where the coordinates came from. "city" means an approximate city-level fallback. */
  source: "census" | "nominatim" | "city";
};

type AddressParts = {
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
};

const TIMEOUT_MS = 8000;

function oneLine({ address, city, state, zipCode }: AddressParts): string {
  return [address, city, [state, zipCode].filter(Boolean).join(" ")]
    .map((p) => (p || "").trim())
    .filter(Boolean)
    .join(", ");
}

function isValidCoord(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    !(lat === 0 && lng === 0) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
  );
}

// US Census geocoder: free, no key, street-level for US addresses.
async function geocodeCensus(line: string): Promise<GeocodeResult | null> {
  const url = new URL(
    "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress"
  );
  url.searchParams.set("address", line);
  url.searchParams.set("benchmark", "Public_AR_Current");
  url.searchParams.set("format", "json");

  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) return null;
  const json = await res.json();
  const coords = json?.result?.addressMatches?.[0]?.coordinates;
  if (!coords) return null;
  const latitude = Number(coords.y);
  const longitude = Number(coords.x);
  return isValidCoord(latitude, longitude)
    ? { latitude, longitude, source: "census" }
    : null;
}

// OpenStreetMap Nominatim: fallback for addresses Census can't match (suites, new builds).
async function geocodeNominatim(line: string): Promise<GeocodeResult | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", line);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "us");

  const res = await fetch(url, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { "User-Agent": "GolfSimMap/1.0 (+https://golfsimmap.com)" },
  });
  if (!res.ok) return null;
  const json = await res.json();
  const hit = Array.isArray(json) ? json[0] : null;
  if (!hit) return null;
  const latitude = Number(hit.lat);
  const longitude = Number(hit.lon);
  return isValidCoord(latitude, longitude)
    ? { latitude, longitude, source: "nominatim" }
    : null;
}

// Last resort: centre of the other venues we already have in that city.
async function cityCentroid(
  db: SupabaseClient,
  city: string,
  state: string
): Promise<GeocodeResult | null> {
  const { data } = await db
    .from("venues")
    .select("latitude, longitude")
    .ilike("city", city)
    .eq("state", state)
    .neq("latitude", 0)
    .neq("longitude", 0)
    .limit(200);
  if (!data || data.length === 0) return null;
  const latitude = data.reduce((s, v) => s + v.latitude, 0) / data.length;
  const longitude = data.reduce((s, v) => s + v.longitude, 0) / data.length;
  return isValidCoord(latitude, longitude)
    ? { latitude, longitude, source: "city" }
    : null;
}

/**
 * Geocode a US venue address. Tries street-level lookups first, then falls back to
 * the centre of known venues in the same city. Returns null if nothing worked.
 * Never throws.
 */
export async function geocodeVenueAddress(
  parts: AddressParts,
  db?: SupabaseClient
): Promise<GeocodeResult | null> {
  const line = oneLine(parts);
  if (line) {
    for (const lookup of [geocodeCensus, geocodeNominatim]) {
      try {
        const hit = await lookup(line);
        if (hit) return hit;
      } catch (error) {
        console.warn(`Geocode lookup failed for "${line}":`, error);
      }
    }
  }

  const city = parts.city?.trim();
  const state = parts.state?.trim();
  if (db && city && state) {
    try {
      return await cityCentroid(db, city, state);
    } catch (error) {
      console.warn(`City centroid lookup failed for ${city}, ${state}:`, error);
    }
  }
  return null;
}
