import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

const globalForSupabase = globalThis as unknown as {
  supabase: ReturnType<typeof createClient<Database>> | undefined;
  supabaseAdmin: ReturnType<typeof createClient<Database>> | undefined;
};

/**
 * Server-side Supabase client (singleton in development to avoid re-creating on HMR)
 * Uses the service_role key — bypasses RLS. For server-side data operations only.
 */
export const supabase =
  globalForSupabase.supabase ??
  createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

if (process.env.NODE_ENV !== "production") {
  globalForSupabase.supabase = supabase;
}

/**
 * Admin Supabase client for auth admin operations (createUser, updateUser, etc.)
 * Same service_role client, exported with a clearer name for admin auth operations.
 */
export const supabaseAdmin =
  globalForSupabase.supabaseAdmin ??
  createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

if (process.env.NODE_ENV !== "production") {
  globalForSupabase.supabaseAdmin = supabaseAdmin;
}

/**
 * Shared Supabase `select` string for venue list / card queries.
 * Equivalent to the old Prisma venueCardSelect.
 *
 * Includes VenueCard display fields + all fields used by client-side
 * matching functions (vibe, tag, hardware, amenity, who-its-for).
 *
 * Excludes large fields: comprehensiveData, about, whyGolfersLikeIt,
 * contact details, hours, verification, etc.
 */
export const VENUE_CARD_FIELDS = "id,slug,name,city,state,heroImage,venueType,simulatorSystems,hardwareBrands,launchMonitorType,priceRangeMin,priceRangeMax,ratingOverall,featured,tags,vibeTags,whoItsFor,foodAndDrink,wifi,hasPrivateRooms,parking,coachingAvailable,kidFriendly";

// Re-export useful types from supabase generated types
export type Venue = Database["public"]["Tables"]["venues"]["Row"];
export type VenueInsert = Database["public"]["Tables"]["venues"]["Insert"];
export type VenueUpdate = Database["public"]["Tables"]["venues"]["Update"];
export type User = Database["public"]["Tables"]["users"]["Row"];
export type Favorite = Database["public"]["Tables"]["favorites"]["Row"];
export type CorrectionReport = Database["public"]["Tables"]["correction_reports"]["Row"];
export type Submission = Database["public"]["Tables"]["submissions"]["Row"];
export type ClaimRequest = Database["public"]["Tables"]["claim_requests"]["Row"];
export type FeaturedListing = Database["public"]["Tables"]["featured_listings"]["Row"];

// Enum types
export type VenueType = Database["public"]["Enums"]["VenueType"];
export type LaunchMonitorType = Database["public"]["Enums"]["LaunchMonitorType"];
export type PricingModel = Database["public"]["Enums"]["PricingModel"];
export type ParkingType = Database["public"]["Enums"]["ParkingType"];
export type VenueStatus = Database["public"]["Enums"]["VenueStatus"];
export type VerificationLevel = Database["public"]["Enums"]["VerificationLevel"];
export type UserRole = Database["public"]["Enums"]["UserRole"];
export type CorrectionStatus = Database["public"]["Enums"]["CorrectionStatus"];
export type SubmissionStatus = Database["public"]["Enums"]["SubmissionStatus"];
