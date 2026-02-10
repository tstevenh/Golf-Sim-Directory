/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "../lib/db";
import { promises as fs } from "fs";
import path from "path";
import { extractHardwareBrandsFromSimulatorSystems } from "../lib/hardware-brands";
import { dedupeSoftwareSlugs } from "../lib/software-slugs";

type ImportMode = "dedupe" | "upsert" | "fresh";

interface CliOptions {
  mode: ImportMode;
  dryRun: boolean;
  includeNeedReview: boolean;
  limit?: number;
  dataDir?: string;
}

// State name to abbreviation mapping
const STATE_MAP: Record<string, string> = {
  "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR",
  "California": "CA", "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE",
  "Florida": "FL", "Georgia": "GA", "Hawaii": "HI", "Idaho": "ID",
  "Illinois": "IL", "Indiana": "IN", "Iowa": "IA", "Kansas": "KS",
  "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
  "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS",
  "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV",
  "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY",
  "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK",
  "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC",
  "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT",
  "Vermont": "VT", "Virginia": "VA", "Washington": "WA", "West Virginia": "WV",
  "Wisconsin": "WI", "Wyoming": "WY", "District of Columbia": "DC"
};

// All valid venue types from Prisma schema
const VALID_VENUE_TYPES = [
  "sim_bar", "training_studio", "private_rental", 
  "retail_fitting_center", "country_club", "multi_sport_sim", 
  "hotel_resort", "indoor_golf_center", "entertainment_venue",
  "golf_performance_center", "bar", "other"
];

// Valid launch monitor types
const VALID_LAUNCH_MONITOR_TYPES = [
  "radar", "photometric_camera", "hybrid", "unknown"
];

// Valid pricing models
const VALID_PRICING_MODELS = [
  "per_bay_hour", "per_person_hour", "package", 
  "membership_only", "mixed", "unknown"
];

// Convert state name to abbreviation
function getStateAbbreviation(stateName: string): string {
  return STATE_MAP[stateName] || stateName;
}

// Generate base slug from venue name only (no city suffix).
function generateSlug(name: string): string {
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleanName || "venue";
}

function parseAddress(rawAddress: string, fallbackCity: string, fallbackRegion: string, fallbackPostalCode: string): {
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
} {
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

function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const match = value.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (!match) return null;
  const normalized = match[0].toLowerCase();
  const [localRaw, domain] = normalized.split("@");
  if (!localRaw || !domain) return null;
  // Handle scraped strings like "80010info@domain.com" by trimming ZIP-like prefixes.
  const local = localRaw.replace(/^\d{5}(?=[a-z])/i, "");
  if (!local) return null;
  return `${local}@${domain}`;
}

function buildShortDescription(about: unknown): string | null {
  if (typeof about !== "string") return null;
  const condensed = about.replace(/\s+/g, " ").trim();
  if (!condensed) return null;
  if (condensed.length <= 220) return condensed;
  return `${condensed.slice(0, 217).trimEnd()}...`;
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

function buildStreetToken(address: string): string {
  const cleaned = normalizeStreetForMatch(address)
    .replace(/\b(?:north|south|east|west)\b/g, " ")
    .trim()
    .replace(/\s+/g, " ");
  if (!cleaned) return "location";
  const parts = cleaned.split(" ").filter(Boolean).slice(0, 4);
  return parts.join("-");
}

// Parse number or return null if invalid
function parseNumberOrNull(value: any): number | null {
  if (value === null || value === undefined || value === "unknown" || value === "") {
    return null;
  }
  const num = Number(value);
  return isNaN(num) ? null : num;
}

// Transform opening hours JSON to Prisma format
function transformHours(openingHoursJson: string): string | null {
  try {
    const hours = JSON.parse(openingHoursJson);
    const dayMap: Record<string, string> = {
      "Monday": "mon", "Tuesday": "tue", "Wednesday": "wed",
      "Thursday": "thu", "Friday": "fri", "Saturday": "sat", "Sunday": "sun"
    };
    
    const parts: string[] = [];
    for (const [day, times] of Object.entries(hours)) {
      if (Array.isArray(times) && times.length > 0) {
        const timeStr = times[0];
        if (timeStr && timeStr.toLowerCase() !== "closed") {
          // Convert various formats
          timeStr
            .replace(/\s+/g, "") // Remove spaces
            .replace(/([AP]M)/gi, "-$1") // Add dash before AM/PM for parsing
            .replace(/Open24hours/i, "00:00-23:59") // Convert open 24 hours
            .toLowerCase();
          parts.push(`${dayMap[day]}:${timeStr}`);
        }
      }
    }
    
    return parts.length > 0 ? parts.join("|") : null;
  } catch {
    return null;
  }
}

// Transform food and drink from array to object
function transformFoodAndDrink(foodAndDrink: any[]): any {
  if (!Array.isArray(foodAndDrink)) return null;
  
  const result: any = {};
  for (const item of foodAndDrink) {
    if (item.type === "food") {
      result.food = item.available === true;
    } else if (item.type === "alcohol") {
      result.alcohol = item.available === true;
    }
    if (item.notes) {
      result.notes = item.notes;
    }
  }
  return Object.keys(result).length > 0 ? result : null;
}

// Normalize venue type - convert to snake_case and validate
function normalizeVenueType(value: string): string {
  if (!value || typeof value !== "string") return "other";
  
  // Clean up the value (convert spaces to underscores, lowercase)
  const cleanValue = value.trim().toLowerCase().replace(/\s+/g, "_");
  
  // Handle pipe-delimited values - take the first valid one
  const types = value.split("|").map(t => t.trim().toLowerCase().replace(/\s+/g, "_"));
  
  for (const type of types) {
    if (VALID_VENUE_TYPES.includes(type)) {
      return type;
    }
  }
  
  // If single value is valid, use it
  if (VALID_VENUE_TYPES.includes(cleanValue)) {
    return cleanValue;
  }
  
  return "other";
}

// Normalize launch monitor type
function normalizeLaunchMonitorType(value: string): string {
  if (!value || typeof value !== "string") return "unknown";
  
  // Handle pipe-delimited values
  const types = value.split("|").map(t => t.trim());
  
  for (const type of types) {
    if (VALID_LAUNCH_MONITOR_TYPES.includes(type)) {
      return type;
    }
  }
  return "unknown";
}

// Normalize pricing model
function normalizePricingModel(value: string): string {
  if (!value || typeof value !== "string") return "unknown";
  
  if (VALID_PRICING_MODELS.includes(value)) {
    return value;
  }
  return "unknown";
}

// Parse tags - handle both string (pipe-delimited) and array
function parseTags(value: any): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(t => t);
  if (typeof value === "string") return value.split("|").map(t => t.trim()).filter(t => t);
  return [];
}

// Transform venue data from snake_case to camelCase
function transformVenue(data: any): any {
  // Parse address components from source address with fallbacks.
  const { streetAddress, city, state, zipCode } = parseAddress(
    data.address || "",
    data.city || "",
    data.region || "",
    String(data.postal_code || "")
  );
  
  // Generate base slug from name only
  const slug = generateSlug(data.name || "");
  
  // Transform tags
  const tags = parseTags(data.tags);
  const vibeTags = parseTags(data.vibe_tags);
  const whoItsFor = parseTags(data.who_its_for);
  
  // Transform simulator systems
  const simulatorSystems = Array.isArray(data.simulator_hardware) 
    ? data.simulator_hardware.map((s: any) => ({
        brand: s.brand || "Unknown",
        model: s.model || "",
        notes: s.notes || ""
      }))
    : null;
  const hardwareBrands = extractHardwareBrandsFromSimulatorSystems(simulatorSystems);
  const softwareSlugs = dedupeSoftwareSlugs([
    ...(Array.isArray(data.simulator_software) ? data.simulator_software : []),
    ...(Array.isArray(data.simulator_so) ? data.simulator_so : []),
    ...(typeof data.simulator_software === "string" ? [data.simulator_software] : []),
    ...(typeof data.simulator_so === "string" ? [data.simulator_so] : []),
  ]);
  
  // Transform why_golfers_like_it
  const whyGolfersLikeIt = Array.isArray(data.why_golfers_like_it) 
    ? data.why_golfers_like_it 
    : null;
  
  // Handle lefty_friendly - can be "unknown", "yes", boolean
  let leftyFriendly = false;
  if (data.lefty_friendly === "yes" || data.lefty_friendly === true) {
    leftyFriendly = true;
  }
  
  // Handle walk_ins_allowed
  let walkInsAllowed: boolean | null = null;
  if (data.walk_ins_allowed === "yes" || data.walk_ins_allowed === true) {
    walkInsAllowed = true;
  } else if (data.walk_ins_allowed === "no" || data.walk_ins_allowed === false) {
    walkInsAllowed = false;
  }
  
  return {
    slug,
    name: data.name,
    venueType: normalizeVenueType(data.venue_type),
    address: streetAddress,
    city,
    state,
    zipCode,
    country: data.country || "US",
    latitude: data.latitude,
    longitude: data.longitude,
    phone: data.phone || null,
    email: normalizeEmail(data.email),
    website: data.website || null,
    bookingUrl: data.booking_url || null,
    googleMapsUrl: data.google_maps_url || null,
    shortDescription: buildShortDescription(data.about),
    about: data.about || null,
    tags,
    vibeTags,
    whoItsFor,
    simulatorSystems,
    hardwareBrands,
    softwareSlugs,
    launchMonitorType: normalizeLaunchMonitorType(data.launch_monitor_type),
    ballTracking: data.ball_tracking === true,
    clubTracking: data.club_tracking === true,
    puttingMode: data.putting_mode === "unknown" || typeof data.putting_mode === "boolean" ? null : data.putting_mode,
    leftyFriendly,
    bayCount: parseNumberOrNull(data.bay_count_total),
    hasPrivateRooms: (parseNumberOrNull(data.private_rooms_count) ?? 0) > 0,
    privateRoomsCount: parseNumberOrNull(data.private_rooms_count),
    maxGroupSizePerBay: parseNumberOrNull(data.max_group_size_per_bay),
    pricingModel: normalizePricingModel(data.pricing_model),
    priceRangeMin: parseNumberOrNull(data.price_range_min_local),
    priceRangeMax: parseNumberOrNull(data.price_range_max_local),
    currency: data.currency || "USD",
    foodAndDrink: transformFoodAndDrink(data.food_and_drink),
    parking: "unknown", // Not in source data
    accessibility: [], // Not in source data
    wifi: null, // Not explicitly in source data
    kidFriendly: data.kid_friendly === true,
    coachingAvailable: data.coaching_available === true,
    hours: data.opening_hours ? transformHours(data.opening_hours) : null,
    walkInsAllowed,
    heroImage: data.hero_image || null,
    ratingTechQuality: parseNumberOrNull(data.rating_tech_quality),
    ratingFacilityComfort: parseNumberOrNull(data.rating_facility_comfort),
    ratingValueForMoney: parseNumberOrNull(data.rating_value_for_money),
    ratingOverall: parseNumberOrNull(data.rating_overall),
    whyGolfersLikeIt,
    comprehensiveData: {
      simulatorSoftware: data.simulator_software || data.simulator_so || null,
      amenitiesList: data.amenities_list 
        ? (Array.isArray(data.amenities_list) 
            ? data.amenities_list 
            : data.amenities_list.split("|").filter((a: string) => a.trim()))
        : null,
      faq: data.faq || null,
      googleRating: data.google_rating || null,
      placeId: data.place_id || null,
      simGolfStatus: data.sim_golf_status || null,
    },
    claimed: false,
    featured: false,
    verificationLevel: data.google_rating ? "verified" : "partially_verified",
    dataSource: "scraped",
    metaTitle: null,
    metaDescription: null,
  };
}

async function main() {
  console.log("🌱 Starting real data import...\n");

  const args = process.argv.slice(2);
  const options: CliOptions = {
    mode: "dedupe",
    dryRun: false,
    includeNeedReview: false,
  };

  for (const arg of args) {
    if (arg.startsWith("--mode=")) {
      const mode = arg.split("=")[1] as ImportMode;
      if (mode === "dedupe" || mode === "upsert" || mode === "fresh") {
        options.mode = mode;
      } else {
        throw new Error(`Invalid mode: ${mode}. Use dedupe|upsert|fresh`);
      }
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--include-need-review") {
      options.includeNeedReview = true;
    } else if (arg.startsWith("--limit=")) {
      const limit = Number(arg.split("=")[1]);
      if (!Number.isNaN(limit) && limit > 0) options.limit = limit;
    } else if (arg.startsWith("--data-dir=")) {
      options.dataDir = arg.split("=")[1];
    }
  }

  const defaultDataDirs = [
    path.join(process.cwd(), "enriched_venues"),
    path.join(process.cwd(), "..", "data-for-website", "enriched_venues"),
  ];
  let venuesDir = options.dataDir || "";
  if (!venuesDir) {
    for (const candidate of defaultDataDirs) {
      try {
        await fs.access(candidate);
        venuesDir = candidate;
        break;
      } catch {
        // try next
      }
    }
  }
  if (!venuesDir) {
    throw new Error("Could not locate enriched_venues directory. Use --data-dir=/path/to/enriched_venues");
  }

  console.log(`Mode: ${options.mode}${options.dryRun ? " (dry-run)" : ""}`);
  console.log(`Data directory: ${venuesDir}\n`);
  
  // Read all JSON files
  let files: string[];
  try {
    files = await fs.readdir(venuesDir);
  } catch {
    console.error("❌ Error reading venues directory:", venuesDir);
    console.error("Make sure enriched_venues exists");
    process.exit(1);
  }
  
  const jsonFiles = files
    .filter(f => f.endsWith(".json") && (options.includeNeedReview || !f.startsWith("NEED_REVIEW")))
    // Sort so base files (e.g., five-iron-golf.json) come before numbered ones (five-iron-golf-1.json)
    .sort((a, b) => {
      // Extract base name and number
      const getBase = (f: string) => f.replace(/-\d+\.json$/, '.json');
      const getNum = (f: string) => {
        const match = f.match(/-(\d+)\.json$/);
        return match ? parseInt(match[1]) : 0;
      };
      
      const baseA = getBase(a);
      const baseB = getBase(b);
      
      if (baseA === baseB) {
        return getNum(a) - getNum(b);
      }
      return a.localeCompare(b);
    });
  const filesToProcess = options.limit ? jsonFiles.slice(0, options.limit) : jsonFiles;
  console.log(`📁 Found ${jsonFiles.length} venue files (${filesToProcess.length} selected)\n`);
  
  // Load and transform all venues
  const venues: any[] = [];
  const errors: string[] = [];
  
  for (const file of filesToProcess) {
    try {
      const content = await fs.readFile(path.join(venuesDir, file), "utf-8");
      const data = JSON.parse(content);
      const transformed = transformVenue(data);
      venues.push(transformed);
    } catch (err: any) {
      errors.push(`${file}: ${err.message}`);
    }
  }
  
  console.log(`✅ Successfully parsed ${venues.length} venues`);
  if (errors.length > 0) {
    console.log(`⚠️  Failed to parse ${errors.length} files`);
    errors.forEach(e => console.log(`   - ${e}`));
  }
  console.log();

  const keyForVenue = (name: string, city: string, state: string, address: string) =>
    `${name.trim().toLowerCase()}|${city.trim().toLowerCase()}|${state.trim().toLowerCase()}|${normalizeStreetForMatch(address)}`;
  const getPlaceId = (venue: any): string | null => {
    try {
      const placeId = (venue.comprehensiveData as { placeId?: string } | null)?.placeId;
      return typeof placeId === "string" && placeId.trim() ? placeId.trim() : null;
    } catch {
      return null;
    }
  };

  // Deduplicate incoming files before touching DB:
  // prefer first file (base file is sorted before numbered variants).
  const dedupedVenues: any[] = [];
  const seenIncomingPlaceIds = new Set<string>();
  const seenIncomingNameCityState = new Set<string>();
  let incomingDuplicatesSkipped = 0;

  for (const venue of venues) {
    const placeId = getPlaceId(venue);
    const venueKey = keyForVenue(venue.name, venue.city, venue.state, venue.address);
    if (placeId && seenIncomingPlaceIds.has(placeId)) {
      incomingDuplicatesSkipped++;
      continue;
    }
    if (seenIncomingNameCityState.has(venueKey)) {
      incomingDuplicatesSkipped++;
      continue;
    }
    if (placeId) seenIncomingPlaceIds.add(placeId);
    seenIncomingNameCityState.add(venueKey);
    dedupedVenues.push(venue);
  }

  if (incomingDuplicatesSkipped > 0) {
    console.log(`🧹 Skipped ${incomingDuplicatesSkipped} duplicate files inside input dataset`);
  }
  console.log(`📦 Import candidates after dedupe: ${dedupedVenues.length}\n`);

  const existingVenues = await db.venue.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      address: true,
      city: true,
      state: true,
      comprehensiveData: true,
    },
  });
  console.log(`🗂️  Existing venues in DB: ${existingVenues.length}`);

  const existingByNameCityState = new Map<string, { id: string; slug: string }>();
  const existingByPlaceId = new Map<string, { id: string; slug: string }>();

  for (const existing of existingVenues) {
    existingByNameCityState.set(
      keyForVenue(existing.name, existing.city, existing.state, existing.address || ""),
      { id: existing.id, slug: existing.slug }
    );
    try {
      const placeId = (existing.comprehensiveData as { placeId?: string } | null)?.placeId;
      if (placeId) existingByPlaceId.set(placeId, { id: existing.id, slug: existing.slug });
    } catch {
      // ignore malformed JSON
    }
  }

  const resolveExistingMatch = (venue: any): { id: string; slug: string } | null => {
    const placeId = getPlaceId(venue);
    if (placeId && existingByPlaceId.has(placeId)) return existingByPlaceId.get(placeId)!;
    const key = keyForVenue(venue.name, venue.city, venue.state, venue.address);
    if (existingByNameCityState.has(key)) return existingByNameCityState.get(key)!;
    return null;
  };

  const ensureUniqueSlug = (baseSlug: string, address: string, usedSlugs: Set<string>): string => {
    const base = (baseSlug || "venue").trim() || "venue";
    if (!usedSlugs.has(base)) {
      usedSlugs.add(base);
      return base;
    }

    const streetToken = buildStreetToken(address);
    const baseWithStreet = `${base}-${streetToken}`;
    if (!usedSlugs.has(baseWithStreet)) {
      usedSlugs.add(baseWithStreet);
      return baseWithStreet;
    }

    let slug = `${baseWithStreet}-2`;
    let suffix = 3;
    while (usedSlugs.has(slug)) {
      slug = `${baseWithStreet}-${suffix}`;
      suffix += 1;
    }
    usedSlugs.add(slug);
    return slug;
  };

  let toCreate = 0;
  let toUpdate = 0;
  let toSkip = 0;
  if (options.mode === "fresh") {
    toCreate = dedupedVenues.length;
  } else {
    for (const venue of dedupedVenues) {
      const match = resolveExistingMatch(venue);
      if (!match) toCreate++;
      else if (options.mode === "upsert") toUpdate++;
      else toSkip++;
    }
  }

  console.log(`📋 Plan: create=${toCreate}, update=${toUpdate}, skip=${toSkip}\n`);
  if (options.dryRun) {
    console.log("✅ Dry-run complete. No DB changes made.");
    return;
  }

  if (options.mode === "fresh") {
    console.log("🗑️  Fresh mode: deleting existing venues and related records...");
    await db.favorite.deleteMany();
    await db.correctionReport.deleteMany();
    await db.submission.deleteMany();
    await db.venue.deleteMany();
    console.log("   Existing data cleared\n");
  }

  console.log("📝 Applying import...");
  let successCount = 0;
  let errorCount = 0;
  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  const errorDetails: string[] = [];
  const usedSlugs = new Set<string>();
  if (options.mode !== "fresh") {
    for (const existing of existingVenues) {
      usedSlugs.add(existing.slug);
    }
  }

  const createPayloads: any[] = [];
  const updatePayloads: Array<{ id: string; data: any; name: string }> = [];

  for (const venue of dedupedVenues) {
    const match = resolveExistingMatch(venue);
    if (options.mode === "fresh") {
      const uniqueSlug = ensureUniqueSlug(venue.slug, venue.address, usedSlugs);
      createPayloads.push({ ...venue, slug: uniqueSlug });
    } else if (!match) {
      const uniqueSlug = ensureUniqueSlug(venue.slug, venue.address, usedSlugs);
      createPayloads.push({ ...venue, slug: uniqueSlug });
    } else if (options.mode === "upsert") {
      usedSlugs.delete(match.slug);
      const uniqueSlug = ensureUniqueSlug(venue.slug, venue.address, usedSlugs);
      updatePayloads.push({ id: match.id, data: { ...venue, slug: uniqueSlug }, name: venue.name });
    } else {
      skippedCount++;
    }
  }

  successCount = skippedCount;
  process.stdout.write(`\r   Progress: ${successCount}/${dedupedVenues.length}`);

  const CREATE_CHUNK_SIZE = 200;
  const UPDATE_CHUNK_SIZE = 100;

  for (let i = 0; i < createPayloads.length; i += CREATE_CHUNK_SIZE) {
    const chunk = createPayloads.slice(i, i + CREATE_CHUNK_SIZE);
    try {
      await db.venue.createMany({ data: chunk });
      createdCount += chunk.length;
      successCount += chunk.length;
    } catch {
      for (const venueData of chunk) {
        try {
          await db.venue.create({ data: venueData });
          createdCount++;
          successCount++;
        } catch (err: any) {
          errorCount++;
          const shortError = err.message?.split("\n")?.slice(-3)?.join(" ") || err.message;
          errorDetails.push(`${venueData.name}: ${shortError.substring(0, 180)}`);
        }
      }
    }
    process.stdout.write(`\r   Progress: ${successCount}/${dedupedVenues.length}`);
  }

  for (let i = 0; i < updatePayloads.length; i += UPDATE_CHUNK_SIZE) {
    const chunk = updatePayloads.slice(i, i + UPDATE_CHUNK_SIZE);
    try {
      await db.$transaction(
        chunk.map((item) =>
          db.venue.update({
            where: { id: item.id },
            data: item.data,
          })
        )
      );
      updatedCount += chunk.length;
      successCount += chunk.length;
    } catch {
      for (const item of chunk) {
        try {
          await db.venue.update({
            where: { id: item.id },
            data: item.data,
          });
          updatedCount++;
          successCount++;
        } catch (err: any) {
          errorCount++;
          const shortError = err.message?.split("\n")?.slice(-3)?.join(" ") || err.message;
          errorDetails.push(`${item.name}: ${shortError.substring(0, 180)}`);
        }
      }
    }
    process.stdout.write(`\r   Progress: ${successCount}/${dedupedVenues.length}`);
  }

  console.log(`\n\n✅ Import complete!`);
  console.log(`   Created: ${createdCount}`);
  console.log(`   Updated: ${updatedCount}`);
  console.log(`   Skipped: ${skippedCount}`);
  if (errorCount > 0) {
    console.log(`   Failed: ${errorCount}`);
    console.log("\n   Error details:");
    errorDetails.slice(0, 8).forEach(e => console.log(`     - ${e}`));
    if (errorDetails.length > 8) {
      console.log(`     ... and ${errorDetails.length - 8} more`);
    }
  }
}

main()
  .catch((e) => {
    console.error("\n❌ Fatal error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
