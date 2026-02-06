import { db } from "../lib/db";
import { promises as fs } from "fs";
import path from "path";

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

// Generate slug from name and city
function generateSlug(name: string, city: string): string {
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const cleanCity = city
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${cleanName}-${cleanCity}`;
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
          const formatted = timeStr
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
  // Parse address
  const addressParts = (data.address || "").split(",");
  const streetAddress = addressParts[0]?.trim() || "";
  const city = data.city || addressParts[1]?.trim() || "";
  const region = data.region || "";
  const state = getStateAbbreviation(region);
  
  // Generate slug with city
  const slug = generateSlug(data.name, city);
  
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
    zipCode: "", // Not in source data
    country: data.country || "US",
    latitude: data.latitude,
    longitude: data.longitude,
    phone: data.phone || null,
    email: null, // Not in source data
    website: data.website || null,
    bookingUrl: data.booking_url || null,
    googleMapsUrl: data.google_maps_url || null,
    about: data.about || null,
    tags,
    vibeTags,
    whoItsFor,
    simulatorSystems,
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
      simulatorSoftware: data.simulator_software || null,
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
  console.log("🌱 Starting real data seeding...\n");
  
  // Path to enriched venues
  const venuesDir = path.join(process.cwd(), "..", "data-for-website", "enriched_venues");
  
  // Read all JSON files
  let files: string[];
  try {
    files = await fs.readdir(venuesDir);
  } catch (err) {
    console.error("❌ Error reading venues directory:", venuesDir);
    console.error("Make sure data-for-website/enriched_venues exists");
    process.exit(1);
  }
  
  const jsonFiles = files
    .filter(f => f.endsWith(".json") && !f.startsWith("NEED_REVIEW"))
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
  console.log(`📁 Found ${jsonFiles.length} venue files to process\n`);
  
  // Load and transform all venues
  const venues: any[] = [];
  const errors: string[] = [];
  
  for (const file of jsonFiles) {
    try {
      const content = await fs.readFile(path.join(venuesDir, file), "utf-8");
      const data = JSON.parse(content);
      const transformed = transformVenue(data);
      venues.push(transformed);
    } catch (err: any) {
      errors.push(`${file}: ${err.message}`);
    }
  }
  
  // Handle duplicate slugs within same city
  const slugCounts: Map<string, number> = new Map();
  for (const venue of venues) {
    const baseSlug = venue.slug; // slug already includes city
    const count = slugCounts.get(baseSlug) || 0;
    if (count > 0) {
      venue.slug = `${baseSlug}-${count}`;
    }
    slugCounts.set(baseSlug, count + 1);
  }
  
  console.log(`✅ Successfully parsed ${venues.length} venues`);
  if (errors.length > 0) {
    console.log(`⚠️  Failed to parse ${errors.length} files`);
    errors.forEach(e => console.log(`   - ${e}`));
  }
  console.log();
  
  // Clear existing data
  console.log("🗑️  Clearing existing data...");
  await db.favorite.deleteMany();
  await db.correctionReport.deleteMany();
  await db.submission.deleteMany();
  await db.venue.deleteMany();
  console.log("   Existing data cleared\n");
  
  // Insert new venues
  console.log("📝 Inserting venues...");
  let successCount = 0;
  let errorCount = 0;
  const errorDetails: string[] = [];
  
  for (const venue of venues) {
    try {
      await db.venue.create({ data: venue });
      successCount++;
      process.stdout.write(`\r   Progress: ${successCount}/${venues.length}`);
    } catch (err: any) {
      errorCount++;
      const shortError = err.message?.split('\n')?.slice(-3)?.join(' ') || err.message;
      errorDetails.push(`${venue.name}: ${shortError.substring(0, 150)}`);
    }
  }
  
  console.log(`\n\n✅ Seeding complete!`);
  console.log(`   Successfully inserted: ${successCount} venues`);
  if (errorCount > 0) {
    console.log(`   Failed: ${errorCount} venues`);
    console.log("\n   Error details:");
    errorDetails.slice(0, 5).forEach(e => console.log(`     - ${e}`));
    if (errorDetails.length > 5) {
      console.log(`     ... and ${errorDetails.length - 5} more`);
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
