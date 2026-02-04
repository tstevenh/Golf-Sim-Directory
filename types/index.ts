import { Venue as PrismaVenue, User as PrismaUser, Favorite as PrismaFavorite, UserRole } from "@prisma/client";

export type Venue = PrismaVenue;
export type User = PrismaUser;
export type Favorite = PrismaFavorite;
export { UserRole };

export interface VenueWithFavorites extends Venue {
  favorites?: Favorite[];
  isFavorited?: boolean;
}

export interface SearchFilters {
  city?: string;
  state?: string;
  venueType?: string;
  minPrice?: number;
  maxPrice?: number;
  hasPrivateRooms?: boolean;
  leftyFriendly?: boolean;
  coachingAvailable?: boolean;
  kidFriendly?: boolean;
  simulatorSystem?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
}

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: SessionUser;
  }

  interface User {
    role: UserRole;
  }
  
  interface JWT {
    id?: string;
    role?: UserRole;
  }
}
