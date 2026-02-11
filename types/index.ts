import type { Venue, User, Favorite, UserRole } from "@/lib/supabase";

export type { Venue, User, Favorite, UserRole };

export interface VenueWithFavorites extends Venue {
  favorites?: Favorite[];
  isFavorited?: boolean;
}

// Lightweight venue type for list/card pages — only the fields needed
// for rendering VenueCard + client-side filtering (vibe, tag, hardware, etc.)
export type VenueListItem = Pick<Venue,
  'id' | 'slug' | 'name' | 'city' | 'state' | 'heroImage' |
  'venueType' | 'simulatorSystems' | 'hardwareBrands' | 'launchMonitorType' | 'priceRangeMin' |
  'priceRangeMax' | 'ratingOverall' | 'featured' | 'tags' | 'vibeTags' |
  'whoItsFor' | 'foodAndDrink' | 'wifi' | 'hasPrivateRooms' | 'parking' |
  'coachingAvailable' | 'kidFriendly'
>;

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
