import { PrismaClient } from "@prisma/client";
import { mockDb } from "./mock-db";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Check if we should use mock DB
const useMockDb = !process.env.DATABASE_URL || process.env.DATABASE_URL.includes("placeholder");

// Export either real Prisma client or mock DB
export const db = useMockDb
  ? mockDb as unknown as PrismaClient
  : (globalForPrisma.prisma ?? new PrismaClient());

if (!useMockDb && process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db as PrismaClient;
}

/**
 * Shared Prisma `select` for venue list / card queries.
 * Includes VenueCard display fields + all fields used by client-side
 * matching functions (vibe, tag, hardware, amenity, who-its-for).
 *
 * Excludes large fields: comprehensiveData, about, whyGolfersLikeIt,
 * contact details, hours, verification, etc.
 */
export const venueCardSelect = {
  id: true,
  slug: true,
  name: true,
  city: true,
  state: true,
  heroImage: true,
  shortDescription: true,
  venueType: true,
  simulatorSystems: true,
  launchMonitorType: true,
  priceRangeMin: true,
  priceRangeMax: true,
  ratingOverall: true,
  featured: true,
  tags: true,
  vibeTags: true,
  whoItsFor: true,
  foodAndDrink: true,
  wifi: true,
  hasPrivateRooms: true,
  parking: true,
  coachingAvailable: true,
  kidFriendly: true,
} as const;
