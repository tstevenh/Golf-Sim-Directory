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
