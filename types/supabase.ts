export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      claim_requests: {
        Row: {
          businessEmail: string
          createdAt: string
          id: string
          proofText: string
          requestedById: string
          reviewedAt: string | null
          reviewedById: string | null
          reviewNotes: string | null
          status: Database["public"]["Enums"]["SubmissionStatus"]
          updatedAt: string
          venueId: string
        }
        Insert: {
          businessEmail: string
          createdAt?: string
          id?: string
          proofText: string
          requestedById: string
          reviewedAt?: string | null
          reviewedById?: string | null
          reviewNotes?: string | null
          status?: Database["public"]["Enums"]["SubmissionStatus"]
          updatedAt?: string
          venueId: string
        }
        Update: {
          businessEmail?: string
          createdAt?: string
          id?: string
          proofText?: string
          requestedById?: string
          reviewedAt?: string | null
          reviewedById?: string | null
          reviewNotes?: string | null
          status?: Database["public"]["Enums"]["SubmissionStatus"]
          updatedAt?: string
          venueId?: string
        }
        Relationships: [
          {
            foreignKeyName: "claim_requests_requestedById_fkey"
            columns: ["requestedById"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_requests_venueId_fkey"
            columns: ["venueId"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      correction_reports: {
        Row: {
          createdAt: string
          currentValue: string | null
          field: string
          id: string
          notes: string | null
          reportedById: string | null
          reviewedAt: string | null
          reviewedById: string | null
          reviewNotes: string | null
          status: Database["public"]["Enums"]["CorrectionStatus"]
          suggestedValue: string
          venueId: string
        }
        Insert: {
          createdAt?: string
          currentValue?: string | null
          field: string
          id?: string
          notes?: string | null
          reportedById?: string | null
          reviewedAt?: string | null
          reviewedById?: string | null
          reviewNotes?: string | null
          status?: Database["public"]["Enums"]["CorrectionStatus"]
          suggestedValue: string
          venueId: string
        }
        Update: {
          createdAt?: string
          currentValue?: string | null
          field?: string
          id?: string
          notes?: string | null
          reportedById?: string | null
          reviewedAt?: string | null
          reviewedById?: string | null
          reviewNotes?: string | null
          status?: Database["public"]["Enums"]["CorrectionStatus"]
          suggestedValue?: string
          venueId?: string
        }
        Relationships: [
          {
            foreignKeyName: "correction_reports_reportedById_fkey"
            columns: ["reportedById"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "correction_reports_venueId_fkey"
            columns: ["venueId"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          createdAt: string
          id: string
          userId: string
          venueId: string
        }
        Insert: {
          createdAt?: string
          id?: string
          userId: string
          venueId: string
        }
        Update: {
          createdAt?: string
          id?: string
          userId?: string
          venueId?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_venueId_fkey"
            columns: ["venueId"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      featured_listings: {
        Row: {
          createdAt: string
          endsAt: string
          id: string
          isActive: boolean
          price: number
          startsAt: string
          stripePaymentId: string | null
          tier: string
          updatedAt: string
          venueId: string
        }
        Insert: {
          createdAt?: string
          endsAt: string
          id?: string
          isActive?: boolean
          price: number
          startsAt: string
          stripePaymentId?: string | null
          tier: string
          updatedAt?: string
          venueId: string
        }
        Update: {
          createdAt?: string
          endsAt?: string
          id?: string
          isActive?: boolean
          price?: number
          startsAt?: string
          stripePaymentId?: string | null
          tier?: string
          updatedAt?: string
          venueId?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          createdAt: string
          data: Json
          id: string
          notes: string | null
          reviewedAt: string | null
          reviewedById: string | null
          status: Database["public"]["Enums"]["SubmissionStatus"]
          submittedById: string | null
          updatedAt: string
          venueId: string | null
        }
        Insert: {
          createdAt?: string
          data: Json
          id?: string
          notes?: string | null
          reviewedAt?: string | null
          reviewedById?: string | null
          status?: Database["public"]["Enums"]["SubmissionStatus"]
          submittedById?: string | null
          updatedAt?: string
          venueId?: string | null
        }
        Update: {
          createdAt?: string
          data?: Json
          id?: string
          notes?: string | null
          reviewedAt?: string | null
          reviewedById?: string | null
          status?: Database["public"]["Enums"]["SubmissionStatus"]
          submittedById?: string | null
          updatedAt?: string
          venueId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_submittedById_fkey"
            columns: ["submittedById"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          businessName: string | null
          createdAt: string
          email: string
          emailVerified: string | null
          id: string
          name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["UserRole"]
          updatedAt: string
        }
        Insert: {
          businessName?: string | null
          createdAt?: string
          email: string
          emailVerified?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["UserRole"]
          updatedAt?: string
        }
        Update: {
          businessName?: string | null
          createdAt?: string
          email?: string
          emailVerified?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["UserRole"]
          updatedAt?: string
        }
        Relationships: []
      }
      venues: {
        Row: {
          about: string | null
          accessibility: string[] | null
          address: string
          ballTracking: boolean | null
          bayCount: number | null
          bookingUrl: string | null
          brandName: string | null
          city: string
          claimed: boolean
          claimedAt: string | null
          claimedById: string | null
          clubTracking: boolean | null
          coachingAvailable: boolean
          comprehensiveData: Json | null
          country: string
          createdAt: string
          currency: string
          dataSource: string
          email: string | null
          featured: boolean
          featuredUntil: string | null
          foodAndDrink: Json | null
          googleMapsUrl: string | null
          hardwareBrands: string[]
          hasPrivateRooms: boolean
          heroImage: string | null
          hours: string | null
          id: string
          kidFriendly: boolean | null
          lastVerifiedAt: string | null
          latitude: number
          launchMonitorType: Database["public"]["Enums"]["LaunchMonitorType"]
          leftyFriendly: boolean
          longitude: number
          maxGroupSizePerBay: number | null
          metaDescription: string | null
          metaTitle: string | null
          name: string
          parking: Database["public"]["Enums"]["ParkingType"]
          phone: string | null
          priceRangeMax: number | null
          priceRangeMin: number | null
          pricingModel: Database["public"]["Enums"]["PricingModel"]
          privateRoomsCount: number | null
          puttingMode: string | null
          ratingFacilityComfort: number | null
          ratingOverall: number | null
          ratingTechQuality: number | null
          ratingValueForMoney: number | null
          shortDescription: string | null
          simulatorSystems: Json | null
          slug: string
          softwareSlugs: string[]
          state: string
          status: Database["public"]["Enums"]["VenueStatus"]
          tags: string[] | null
          updatedAt: string
          venueType: Database["public"]["Enums"]["VenueType"]
          verificationLevel: Database["public"]["Enums"]["VerificationLevel"]
          vibeTags: string[] | null
          walkInsAllowed: boolean | null
          website: string | null
          whoItsFor: string[] | null
          whyGolfersLikeIt: Json | null
          wifi: boolean | null
          zipCode: string
        }
        Insert: {
          about?: string | null
          accessibility?: string[] | null
          address: string
          ballTracking?: boolean | null
          bayCount?: number | null
          bookingUrl?: string | null
          brandName?: string | null
          city: string
          claimed?: boolean
          claimedAt?: string | null
          claimedById?: string | null
          clubTracking?: boolean | null
          coachingAvailable?: boolean
          comprehensiveData?: Json | null
          country?: string
          createdAt?: string
          currency?: string
          dataSource?: string
          email?: string | null
          featured?: boolean
          featuredUntil?: string | null
          foodAndDrink?: Json | null
          googleMapsUrl?: string | null
          hardwareBrands?: string[]
          hasPrivateRooms?: boolean
          heroImage?: string | null
          hours?: string | null
          id?: string
          kidFriendly?: boolean | null
          lastVerifiedAt?: string | null
          latitude: number
          launchMonitorType?: Database["public"]["Enums"]["LaunchMonitorType"]
          leftyFriendly?: boolean
          longitude: number
          maxGroupSizePerBay?: number | null
          metaDescription?: string | null
          metaTitle?: string | null
          name: string
          parking?: Database["public"]["Enums"]["ParkingType"]
          phone?: string | null
          priceRangeMax?: number | null
          priceRangeMin?: number | null
          pricingModel?: Database["public"]["Enums"]["PricingModel"]
          privateRoomsCount?: number | null
          puttingMode?: string | null
          ratingFacilityComfort?: number | null
          ratingOverall?: number | null
          ratingTechQuality?: number | null
          ratingValueForMoney?: number | null
          shortDescription?: string | null
          simulatorSystems?: Json | null
          slug: string
          softwareSlugs?: string[]
          state: string
          status?: Database["public"]["Enums"]["VenueStatus"]
          tags?: string[] | null
          updatedAt?: string
          venueType?: Database["public"]["Enums"]["VenueType"]
          verificationLevel?: Database["public"]["Enums"]["VerificationLevel"]
          vibeTags?: string[] | null
          walkInsAllowed?: boolean | null
          website?: string | null
          whoItsFor?: string[] | null
          whyGolfersLikeIt?: Json | null
          wifi?: boolean | null
          zipCode: string
        }
        Update: {
          about?: string | null
          accessibility?: string[] | null
          address?: string
          ballTracking?: boolean | null
          bayCount?: number | null
          bookingUrl?: string | null
          brandName?: string | null
          city?: string
          claimed?: boolean
          claimedAt?: string | null
          claimedById?: string | null
          clubTracking?: boolean | null
          coachingAvailable?: boolean
          comprehensiveData?: Json | null
          country?: string
          createdAt?: string
          currency?: string
          dataSource?: string
          email?: string | null
          featured?: boolean
          featuredUntil?: string | null
          foodAndDrink?: Json | null
          googleMapsUrl?: string | null
          hardwareBrands?: string[]
          hasPrivateRooms?: boolean
          heroImage?: string | null
          hours?: string | null
          id?: string
          kidFriendly?: boolean | null
          lastVerifiedAt?: string | null
          latitude?: number
          launchMonitorType?: Database["public"]["Enums"]["LaunchMonitorType"]
          leftyFriendly?: boolean
          longitude?: number
          maxGroupSizePerBay?: number | null
          metaDescription?: string | null
          metaTitle?: string | null
          name?: string
          parking?: Database["public"]["Enums"]["ParkingType"]
          phone?: string | null
          priceRangeMax?: number | null
          priceRangeMin?: number | null
          pricingModel?: Database["public"]["Enums"]["PricingModel"]
          privateRoomsCount?: number | null
          puttingMode?: string | null
          ratingFacilityComfort?: number | null
          ratingOverall?: number | null
          ratingTechQuality?: number | null
          ratingValueForMoney?: number | null
          shortDescription?: string | null
          simulatorSystems?: Json | null
          slug?: string
          softwareSlugs?: string[]
          state?: string
          status?: Database["public"]["Enums"]["VenueStatus"]
          tags?: string[] | null
          updatedAt?: string
          venueType?: Database["public"]["Enums"]["VenueType"]
          verificationLevel?: Database["public"]["Enums"]["VerificationLevel"]
          vibeTags?: string[] | null
          walkInsAllowed?: boolean | null
          website?: string | null
          whoItsFor?: string[] | null
          whyGolfersLikeIt?: Json | null
          wifi?: boolean | null
          zipCode?: string
        }
        Relationships: [
          {
            foreignKeyName: "venues_claimedById_fkey"
            columns: ["claimedById"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_cities_in_state: {
        Args: { target_state: string }
        Returns: {
          city: string
          count: number
        }[]
      }
      get_city_venue_counts: {
        Args: { limit_count?: number }
        Returns: {
          city: string
          count: number
          state: string
        }[]
      }
      get_distinct_cities: {
        Args: never
        Returns: {
          city: string
          state: string
        }[]
      }
      get_distinct_states: {
        Args: never
        Returns: {
          state: string
        }[]
      }
      get_nearby_cities: {
        Args: {
          exclude_city: string
          limit_count?: number
          target_state: string
        }
        Returns: {
          city: string
        }[]
      }
      get_state_venue_counts: {
        Args: never
        Returns: {
          count: number
          state: string
        }[]
      }
      get_venue_ids_with_food_drink: {
        Args: { require_alcohol?: boolean; require_food?: boolean }
        Returns: {
          id: string
        }[]
      }
    }
    Enums: {
      CorrectionStatus: "pending" | "approved" | "rejected"
      LaunchMonitorType: "radar" | "photometric_camera" | "hybrid" | "unknown"
      ParkingType:
        | "free_lot"
        | "paid_lot"
        | "street"
        | "garage"
        | "valet"
        | "none"
        | "unknown"
      PricingModel:
        | "per_bay_hour"
        | "per_person_hour"
        | "package"
        | "membership_only"
        | "mixed"
        | "unknown"
      SubmissionStatus: "pending" | "approved" | "rejected"
      UserRole: "golfer" | "business_owner" | "admin"
      VenueStatus: "active" | "inactive" | "pending_review"
      VenueType:
        | "sim_bar"
        | "training_studio"
        | "private_rental"
        | "retail_fitting_center"
        | "country_club"
        | "multi_sport_sim"
        | "hotel_resort"
        | "other"
        | "indoor_golf_center"
        | "entertainment_venue"
        | "golf_performance_center"
        | "bar"
      VerificationLevel: "unverified" | "partially_verified" | "verified"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      CorrectionStatus: ["pending", "approved", "rejected"],
      LaunchMonitorType: ["radar", "photometric_camera", "hybrid", "unknown"],
      ParkingType: [
        "free_lot",
        "paid_lot",
        "street",
        "garage",
        "valet",
        "none",
        "unknown",
      ],
      PricingModel: [
        "per_bay_hour",
        "per_person_hour",
        "package",
        "membership_only",
        "mixed",
        "unknown",
      ],
      SubmissionStatus: ["pending", "approved", "rejected"],
      UserRole: ["golfer", "business_owner", "admin"],
      VenueStatus: ["active", "inactive", "pending_review"],
      VenueType: [
        "sim_bar",
        "training_studio",
        "private_rental",
        "retail_fitting_center",
        "country_club",
        "multi_sport_sim",
        "hotel_resort",
        "other",
        "indoor_golf_center",
        "entertainment_venue",
        "golf_performance_center",
        "bar",
      ],
      VerificationLevel: ["unverified", "partially_verified", "verified"],
    },
  },
} as const
