import { Metadata } from "next";
import Link from "next/link";
import { supabase, VENUE_CARD_FIELDS } from "@/lib/supabase";
import type { VenueType, LaunchMonitorType } from "@/lib/supabase";
import { VenueCard, VenueGrid } from "@/components/venue/VenueCard";
import { Pagination } from "@/components/ui/Pagination";
import { getStateDisplayName } from "@/lib/states";
import { normalizeHardwareBrand } from "@/lib/hardware-brands";
import { getVenueHref } from "@/lib/venue-url";
import { Search } from "lucide-react";
import { SearchForm } from "./SearchForm";

export const metadata: Metadata = {
  title: "Search Golf Simulators — Find Venues Near You",
  description: "Search indoor golf simulator venues by city, state, launch monitor type, vibe, and amenities. Find and book your perfect venue.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "https://golfsimmap.com/search",
  },
  openGraph: {
    title: "Search Golf Simulators — Find Venues Near You",
    description: "Search indoor golf simulator venues by city, state, launch monitor type, vibe, and amenities. Find and book your perfect venue.",
    type: "website",
    url: "https://golfsimmap.com/search",
  },
};

// Force dynamic rendering to avoid caching issues
export const dynamic = "force-dynamic";
export const revalidate = 0;

const VALID_VENUE_TYPES = new Set([
  "sim_bar", "training_studio", "private_rental", "retail_fitting_center",
  "country_club", "multi_sport_sim", "hotel_resort", "other",
  "indoor_golf_center", "entertainment_venue", "golf_performance_center", "bar",
]);

const VALID_LAUNCH_MONITOR_TYPES = new Set([
  "radar", "photometric_camera", "hybrid", "unknown",
]);

interface SearchPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = (await searchParams) || {};

  const query = typeof params.q === "string" ? params.q : "";
  const city = typeof params.city === "string" ? params.city : "";
  const state = typeof params.state === "string" ? params.state : "";
  const venueType = typeof params.venueType === "string" ? params.venueType : "";
  const launchMonitorType = typeof params.launchMonitorType === "string" ? params.launchMonitorType : "";
  const hardware = typeof params.hardware === "string" ? params.hardware : "";
  const minPrice = typeof params.minPrice === "string" && params.minPrice.trim() !== "" ? Number(params.minPrice) : undefined;
  const maxPrice = typeof params.maxPrice === "string" && params.maxPrice.trim() !== "" ? Number(params.maxPrice) : undefined;
  const kidFriendly = params.kidFriendly === "true";
  const coaching = params.coaching === "true";
  const food = params.food === "true";
  const alcohol = params.alcohol === "true";
  const wifiFilter = params.wifi === "true";
  const privateRooms = params.privateRooms === "true";
  const pageParam = typeof params.page === "string" ? Number(params.page) : 1;
  const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
  const pageSize = 12;
  let forceNoResults = false;
  const normalizedHardware = hardware ? normalizeHardwareBrand(hardware) : "";

  // Fetch available states and cities for dropdowns
  const [{ data: statesData }, { data: citiesData }] = await Promise.all([
    supabase.rpc("get_distinct_states"),
    supabase.rpc("get_distinct_cities"),
  ]);

  const availableStates = (statesData || []).map((v: { state: string }) => ({
    code: v.state,
    name: getStateDisplayName(v.state),
  }));

  const availableCities = (citiesData || []).map((v: { city: string; state: string }) => ({
    city: v.city,
    state: v.state,
  }));

  // Validate enum filters
  if (venueType && !VALID_VENUE_TYPES.has(venueType)) {
    forceNoResults = true;
  }
  if (launchMonitorType && !VALID_LAUNCH_MONITOR_TYPES.has(launchMonitorType)) {
    forceNoResults = true;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let pagedVenues: any[] = [];
  let totalVenues = 0;
  let hasNextPage = false;

  if (forceNoResults) {
    totalVenues = 0;
    pagedVenues = [];
    hasNextPage = false;
  } else {
    // Get food/alcohol filtered IDs if needed
    let foodDrinkIds: string[] | null = null;
    if (food || alcohol) {
      const { data: foodDrinkData } = await supabase.rpc("get_venue_ids_with_food_drink", {
        require_food: food,
        require_alcohol: alcohol,
      });
      foodDrinkIds = (foodDrinkData || []).map((r: { id: string }) => r.id);
      if (foodDrinkIds.length === 0) {
        totalVenues = 0;
        pagedVenues = [];
        hasNextPage = false;
      }
    }

    // Only run main query if we haven't already determined empty results
    if (foodDrinkIds === null || foodDrinkIds.length > 0) {
      // Build the count query
      let countQuery = supabase
        .from("venues")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // Build the data query
      let dataQuery = supabase
        .from("venues")
        .select(VENUE_CARD_FIELDS)
        .eq("status", "active");

      // Apply text search (OR condition) - searches venue name, city, or ZIP code
      if (query) {
        const orFilter = `name.ilike.%${query}%,city.ilike.%${query}%,zipCode.ilike.%${query}%`;
        countQuery = countQuery.or(orFilter);
        dataQuery = dataQuery.or(orFilter);
      }

      // Apply filters to both queries
      if (city) {
        countQuery = countQuery.ilike("city", `%${city}%`);
        dataQuery = dataQuery.ilike("city", `%${city}%`);
      }
      if (state) {
        countQuery = countQuery.ilike("state", `%${state}%`);
        dataQuery = dataQuery.ilike("state", `%${state}%`);
      }
      if (venueType) {
        countQuery = countQuery.eq("venueType", venueType as VenueType);
        dataQuery = dataQuery.eq("venueType", venueType as VenueType);
      }
      if (launchMonitorType) {
        countQuery = countQuery.eq("launchMonitorType", launchMonitorType as LaunchMonitorType);
        dataQuery = dataQuery.eq("launchMonitorType", launchMonitorType as LaunchMonitorType);
      }
      if (typeof minPrice === "number" && !isNaN(minPrice)) {
        countQuery = countQuery.gte("priceRangeMin", minPrice);
        dataQuery = dataQuery.gte("priceRangeMin", minPrice);
      }
      if (typeof maxPrice === "number" && !isNaN(maxPrice)) {
        countQuery = countQuery.lte("priceRangeMax", maxPrice);
        dataQuery = dataQuery.lte("priceRangeMax", maxPrice);
      }
      if (kidFriendly) {
        countQuery = countQuery.eq("kidFriendly", true);
        dataQuery = dataQuery.eq("kidFriendly", true);
      }
      if (coaching) {
        countQuery = countQuery.eq("coachingAvailable", true);
        dataQuery = dataQuery.eq("coachingAvailable", true);
      }
      if (wifiFilter) {
        countQuery = countQuery.eq("wifi", true);
        dataQuery = dataQuery.eq("wifi", true);
      }
      if (privateRooms) {
        countQuery = countQuery.eq("hasPrivateRooms", true);
        dataQuery = dataQuery.eq("hasPrivateRooms", true);
      }
      if (normalizedHardware) {
        countQuery = countQuery.contains("hardwareBrands", [normalizedHardware]);
        dataQuery = dataQuery.contains("hardwareBrands", [normalizedHardware]);
      }
      if (foodDrinkIds) {
        countQuery = countQuery.in("id", foodDrinkIds);
        dataQuery = dataQuery.in("id", foodDrinkIds);
      }

      // Apply ordering and pagination to data query
      dataQuery = dataQuery
        .order("featured", { ascending: false })
        .order("ratingOverall", { ascending: false, nullsFirst: false })
        .order("name", { ascending: true })
        .range((page - 1) * pageSize, page * pageSize - 1);

      // Execute both queries in parallel
      const [countResult, dataResult] = await Promise.all([countQuery, dataQuery]);

      totalVenues = countResult.count || 0;
      pagedVenues = dataResult.data || [];
      hasNextPage = page * pageSize < totalVenues;
    }
  }

  const totalPages = Math.max(1, Math.ceil(totalVenues / pageSize));
  const hasExactCount = true;

  return (
    <div className="min-h-screen bg-deep-black">
      <div className="absolute inset-0 scorecard-grid opacity-20" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-px bg-masters-green" />
            <span className="text-masters-green text-xs font-mono uppercase tracking-widest">Search</span>
          </div>
          <h1 className="text-cream text-3xl mb-1">Search Golf Simulators</h1>
          <p className="text-muted text-sm max-w-2xl">
            Find indoor golf venues by location, hardware, and amenities.
          </p>
        </div>

        {/* Search & Filter Section */}
        <div className="mb-6">
          <SearchForm
            initialQuery={query}
            initialCity={city}
            initialState={state}
            initialVenueType={venueType}
            initialLaunchMonitorType={launchMonitorType}
            initialHardware={hardware}
            initialMinPrice={minPrice}
            initialMaxPrice={maxPrice}
            initialKidFriendly={kidFriendly}
            initialCoaching={coaching}
            initialFood={food}
            initialAlcohol={alcohol}
            initialWifi={wifiFilter}
            initialPrivateRooms={privateRooms}
            availableStates={availableStates}
            availableCities={availableCities}
          />
        </div>

        {/* Results */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-cream text-xl">
              {totalVenues === 0 ? (
                "No results found"
              ) : totalVenues === 1 ? (
                "1 venue found"
              ) : (
                `${totalVenues?.toLocaleString()} venues found`
              )}
            </h2>
            {pagedVenues.length > 0 && totalPages && (
              <span className="text-sm text-muted">
                Page {page} of {totalPages}
              </span>
            )}
          </div>

          {pagedVenues.length === 0 ? (
            <div className="text-center py-16 border border-default rounded-lg bg-charcoal">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate flex items-center justify-center">
                  <Search className="w-8 h-8 text-muted" />
                </div>
                <h3 className="text-cream text-lg font-semibold mb-2">No venues found</h3>
                <p className="text-muted mb-4">No venues match your filters. Try widening your search.</p>
                <Link href="/search" className="text-masters-green hover:underline">
                  Clear all filters
                </Link>
              </div>
            </div>
          ) : (
            <>
              <VenueGrid columns={3}>
                {pagedVenues.map((venue) => (
                  <VenueCard
                    key={venue.id}
                    id={venue.id}
                    slug={venue.slug}
                    name={venue.name}
                    city={venue.city}
                    state={venue.state}
                    heroImage={venue.heroImage}
                    venueType={venue.venueType}
                    simulatorSystems={venue.simulatorSystems as string[] | null}
                    launchMonitorType={venue.launchMonitorType}
                    priceRangeMin={venue.priceRangeMin}
                    priceRangeMax={venue.priceRangeMax}
                    ratingOverall={venue.ratingOverall}
                    featured={venue.featured}
                    tags={venue.tags}
                    href={getVenueHref(venue.state, venue.city, venue.slug)}
                  />
                ))}
              </VenueGrid>

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                hasNextPage={hasExactCount ? page < (totalPages || 1) : hasNextPage}
                baseUrl="/search"
                searchParams={params}
              />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
