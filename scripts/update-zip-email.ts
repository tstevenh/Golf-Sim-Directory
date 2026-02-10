/* eslint-disable @typescript-eslint/no-explicit-any */
import { promises as fs } from "fs";
import path from "path";
import { db } from "../lib/db";

interface CliOptions {
  dryRun: boolean;
  limit?: number;
  dataDir?: string;
  includeNeedReview: boolean;
}

interface SourceVenue {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  email: string | null;
  placeId: string | null;
}

const STATE_MAP: Record<string, string> = {
  Alabama: "AL", Alaska: "AK", Arizona: "AZ", Arkansas: "AR",
  California: "CA", Colorado: "CO", Connecticut: "CT", Delaware: "DE",
  Florida: "FL", Georgia: "GA", Hawaii: "HI", Idaho: "ID",
  Illinois: "IL", Indiana: "IN", Iowa: "IA", Kansas: "KS",
  Kentucky: "KY", Louisiana: "LA", Maine: "ME", Maryland: "MD",
  Massachusetts: "MA", Michigan: "MI", Minnesota: "MN", Mississippi: "MS",
  Missouri: "MO", Montana: "MT", Nebraska: "NE", Nevada: "NV",
  "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY",
  "North Carolina": "NC", "North Dakota": "ND", Ohio: "OH", Oklahoma: "OK",
  Oregon: "OR", Pennsylvania: "PA", "Rhode Island": "RI", "South Carolina": "SC",
  "South Dakota": "SD", Tennessee: "TN", Texas: "TX", Utah: "UT",
  Vermont: "VT", Virginia: "VA", Washington: "WA", "West Virginia": "WV",
  Wisconsin: "WI", Wyoming: "WY", "District of Columbia": "DC",
};

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = {
    dryRun: false,
    includeNeedReview: false,
  };

  for (const arg of args) {
    if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg.startsWith("--limit=")) {
      const value = Number(arg.split("=")[1]);
      if (!Number.isNaN(value) && value > 0) options.limit = value;
    } else if (arg.startsWith("--data-dir=")) {
      options.dataDir = arg.split("=")[1];
    } else if (arg === "--include-need-review") {
      options.includeNeedReview = true;
    }
  }

  return options;
}

function getStateAbbreviation(stateName: string): string {
  const value = (stateName || "").trim();
  if (!value) return "";
  if (value.length === 2) return value.toUpperCase();
  return STATE_MAP[value] || value;
}

function parseAddress(
  rawAddress: string,
  fallbackCity: string,
  fallbackRegion: string,
  fallbackPostalCode: string
): { streetAddress: string; city: string; state: string; zipCode: string } {
  const address = (rawAddress || "").trim();
  const parts = address.split(",").map((p) => p.trim()).filter(Boolean);
  const streetAddress = parts[0] || "";
  const city = (fallbackCity || parts[1] || "").trim();

  const trailingPart = parts[parts.length - 1] || "";
  const trailingStateZipMatch = trailingPart.match(/\b([A-Za-z]{2})\s+(\d{5}(?:-\d{4})?)\b/);
  const zipMatches = Array.from(address.matchAll(/\b\d{5}(?:-\d{4})?\b/g));
  const fallbackPostal = (fallbackPostalCode || "").match(/\d{5}(?:-\d{4})?/g)?.[0] || "";
  const zipCode =
    fallbackPostal ||
    trailingStateZipMatch?.[2] ||
    (zipMatches.length > 0 ? zipMatches[zipMatches.length - 1][0] : "");

  const stateFromAddressPart = parts[2] || "";
  const stateCodeMatch =
    trailingStateZipMatch ||
    stateFromAddressPart.match(/\b([A-Za-z]{2})\b/);
  const stateCode = Array.isArray(stateCodeMatch) ? stateCodeMatch[1] : "";
  const regionCandidate = (fallbackRegion || stateCode).trim();
  const regionNormalized = regionCandidate.length === 2 ? regionCandidate.toUpperCase() : regionCandidate;
  const state = getStateAbbreviation(regionNormalized);

  return { streetAddress, city, state, zipCode };
}

function normalizeStreetForMatch(address: string): string {
  return (address || "")
    .toLowerCase()
    .replace(/\b\d{5}(?:-\d{4})?\b/g, " ")
    .replace(/\b(?:suite|ste|unit|floor|fl|apt|apartment|room|rm)\s*[a-z0-9-]*\b/g, " ")
    .replace(/[#,]/g, " ")
    .replace(/\b\d+\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function keyForVenue(name: string, city: string, state: string, address: string): string {
  return `${name.trim().toLowerCase()}|${city.trim().toLowerCase()}|${state.trim().toLowerCase()}|${normalizeStreetForMatch(address)}`;
}

function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const match = value.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (!match) return null;
  const normalized = match[0].toLowerCase();
  const [localRaw, domain] = normalized.split("@");
  if (!localRaw || !domain) return null;
  const local = localRaw.replace(/^\d{5}(?=[a-z])/i, "");
  if (!local) return null;
  if (domain.includes("..")) return null;
  const badTlds = new Set(["png", "jpg", "jpeg", "webp", "gif", "svg", "avif", "ico", "pdf", "js", "css"]);
  const tld = domain.split(".").pop() || "";
  if (badTlds.has(tld)) return null;
  return `${local}@${domain}`;
}

function extractPlaceIdFromComprehensiveData(comprehensiveData: unknown): string | null {
  if (!comprehensiveData || typeof comprehensiveData !== "object") return null;
  const data = comprehensiveData as { placeId?: unknown; place_id?: unknown };
  if (typeof data.placeId === "string" && data.placeId.trim()) return data.placeId.trim();
  if (typeof data.place_id === "string" && data.place_id.trim()) return data.place_id.trim();
  return null;
}

function transformSourceVenue(raw: any): SourceVenue | null {
  if (!raw || typeof raw !== "object") return null;
  if (typeof raw.name !== "string" || !raw.name.trim()) return null;

  const { streetAddress, city, state, zipCode } = parseAddress(
    raw.address || "",
    raw.city || "",
    raw.region || "",
    String(raw.postal_code || "")
  );

  return {
    name: raw.name.trim(),
    address: streetAddress,
    city,
    state,
    zipCode,
    email: normalizeEmail(raw.email),
    placeId: typeof raw.place_id === "string" && raw.place_id.trim() ? raw.place_id.trim() : null,
  };
}

async function resolveDataDir(inputDir?: string): Promise<string> {
  const candidates = inputDir
    ? [inputDir]
    : [
        path.join(process.cwd(), "enriched_venues"),
        path.join(process.cwd(), "..", "data-for-website", "enriched_venues"),
      ];

  for (const candidate of candidates) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // try next candidate
    }
  }

  throw new Error("Could not find enriched_venues directory. Pass --data-dir=/path/to/enriched_venues");
}

async function main() {
  const options = parseArgs();
  const venuesDir = await resolveDataDir(options.dataDir);

  console.log(`Update zip/email${options.dryRun ? " (dry-run)" : ""}`);
  console.log(`Data directory: ${venuesDir}`);

  const files = await fs.readdir(venuesDir);
  const jsonFiles = files
    .filter((f) => f.endsWith(".json") && (options.includeNeedReview || !f.startsWith("NEED_REVIEW")))
    .sort();
  const filesToProcess = options.limit ? jsonFiles.slice(0, options.limit) : jsonFiles;
  console.log(`Files selected: ${filesToProcess.length}`);

  const sourceVenuesRaw: SourceVenue[] = [];
  let parseErrors = 0;

  for (const file of filesToProcess) {
    try {
      const content = await fs.readFile(path.join(venuesDir, file), "utf-8");
      const parsed = JSON.parse(content);
      const transformed = transformSourceVenue(parsed);
      if (transformed) sourceVenuesRaw.push(transformed);
    } catch {
      parseErrors++;
    }
  }

  if (parseErrors > 0) {
    console.log(`Parse errors: ${parseErrors}`);
  }
  console.log(`Source venues parsed: ${sourceVenuesRaw.length}`);

  const seenPlaceIds = new Set<string>();
  const seenKeys = new Set<string>();
  const sourceVenues: SourceVenue[] = [];
  for (const row of sourceVenuesRaw) {
    const dedupeKey = keyForVenue(row.name, row.city, row.state, row.address);
    if (row.placeId && seenPlaceIds.has(row.placeId)) continue;
    if (seenKeys.has(dedupeKey)) continue;
    if (row.placeId) seenPlaceIds.add(row.placeId);
    seenKeys.add(dedupeKey);
    sourceVenues.push(row);
  }
  console.log(`Source venues after dedupe: ${sourceVenues.length}`);

  const existing = await db.venue.findMany({
    select: {
      id: true,
      name: true,
      address: true,
      city: true,
      state: true,
      zipCode: true,
      email: true,
      comprehensiveData: true,
    },
  });
  console.log(`DB venues loaded: ${existing.length}`);

  const byPlaceId = new Map<string, { id: string; zipCode: string; email: string | null }>();
  const byKey = new Map<string, { id: string; zipCode: string; email: string | null }>();

  for (const row of existing) {
    const placeId = extractPlaceIdFromComprehensiveData(row.comprehensiveData);
    if (placeId) {
      byPlaceId.set(placeId, { id: row.id, zipCode: row.zipCode, email: row.email });
    }
    byKey.set(
      keyForVenue(row.name, row.city, row.state, row.address || ""),
      { id: row.id, zipCode: row.zipCode, email: row.email }
    );
  }

  const updates: Array<{ id: string; data: { zipCode?: string; email?: string } }> = [];
  let matched = 0;
  let unmatched = 0;
  let zipChanged = 0;
  let emailChanged = 0;
  let unchanged = 0;

  for (const src of sourceVenues) {
    const match =
      (src.placeId ? byPlaceId.get(src.placeId) : undefined) ||
      byKey.get(keyForVenue(src.name, src.city, src.state, src.address));

    if (!match) {
      unmatched++;
      continue;
    }
    matched++;

    const data: { zipCode?: string; email?: string } = {};
    if (src.zipCode && src.zipCode !== match.zipCode) {
      data.zipCode = src.zipCode;
      zipChanged++;
    }
    if (src.email && src.email !== match.email) {
      data.email = src.email;
      emailChanged++;
    }

    if (Object.keys(data).length > 0) {
      updates.push({ id: match.id, data });
    } else {
      unchanged++;
    }
  }

  console.log(`Matched: ${matched}`);
  console.log(`Unmatched: ${unmatched}`);
  console.log(`Would update rows: ${updates.length}`);
  console.log(`Zip changes: ${zipChanged}`);
  console.log(`Email changes: ${emailChanged}`);
  console.log(`Unchanged matches: ${unchanged}`);

  if (options.dryRun) {
    const sample = updates.slice(0, 10);
    if (sample.length > 0) {
      console.log("Sample updates:");
      for (const row of sample) {
        console.log(`  ${row.id}: ${JSON.stringify(row.data)}`);
      }
    }
    return;
  }

  const CHUNK = 100;
  let applied = 0;
  for (let i = 0; i < updates.length; i += CHUNK) {
    const chunk = updates.slice(i, i + CHUNK);
    await db.$transaction(
      chunk.map((row) =>
        db.venue.update({
          where: { id: row.id },
          data: row.data,
        })
      )
    );
    applied += chunk.length;
    console.log(`Applied: ${applied}/${updates.length}`);
  }

  console.log("Done.");
}

main()
  .catch((error) => {
    console.error("Failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
