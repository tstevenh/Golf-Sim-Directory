import { Metadata } from "next";
import Link from "next/link";
import { db, venueCardSelect } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { LaunchMonitorType, VenueType } from "@prisma/client";
import { VenueCard, VenueGrid } from "@/components/venue/VenueCard";
import { Pagination } from "@/components/ui/Pagination";
import { getStateSlug, getStateDisplayName } from "@/lib/states";
import { normalizeHardwareBrand } from "@/lib/hardware-brands";
import { Search } from "lucide-react";
import { SearchForm } from "./SearchForm";

export const metadata: Metadata = {
  title: "Search Golf Simulators — Find Venues Near You",
  description: "Search indoor golf simulator venues by city, state, launch monitor type, vibe, and amenities. Find and book your perfect venue.",
};

// Force dynamic rendering to avoid caching issues
export const dynamic = "force-dynamic";
export const revalidate = 0;

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
  const wifi = params.wifi === "true";
  const privateRooms = params.privateRooms === "true";
  const pageParam = typeof params.page === "string" ? Number(params.page) : 1;
  const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
  const pageSize = 12;
  let forceNoResults = false;
  const normalizedHardware = hardware ? normalizeHardwareBrand(hardware) : "";

  // Fetch available states and cities (only those with active venues)
  const [statesData, citiesData] = await Promise.all([
    db.venue.findMany({
      where: { status: "active" },
      select: { state: true },
      distinct: ["state"],
      orderBy: { state: "asc" },
    }),
    db.venue.findMany({
      where: { status: "active" },
      select: { city: true, state: true },
      distinct: ["city", "state"],
      orderBy: [{ state: "asc" }, { city: "asc" }],
    }),
  ]);

  const availableStates = statesData.map((v) => ({
    code: v.state,
    name: getStateDisplayName(v.state),
  }));

  const availableCities = citiesData.map((v) => ({
    city: v.city,
    state: v.state,
  }));

  const baseWhere: Prisma.VenueWhereInput = {
    status: "active",
  };

  if (query) {
    baseWhere.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { zipCode: { contains: query, mode: "insensitive" } },
    ];
  }

  if (city) {
    baseWhere.city = { contains: city, mode: "insensitive" };
  }

  if (state) {
    baseWhere.state = { contains: state, mode: "insensitive" };
  }

  if (venueType) {
    const validVenueTypes = new Set<VenueType>([
      "sim_bar",
      "training_studio",
      "private_rental",
      "retail_fitting_center",
      "country_club",
      "multi_sport_sim",
      "hotel_resort",
      "other",
    ]);
    if (validVenueTypes.has(venueType as VenueType)) {
      baseWhere.venueType = venueType as VenueType;
    } else {
      forceNoResults = true;
    }
  }

  if (launchMonitorType) {
    const validLaunchMonitorTypes = new Set<LaunchMonitorType>([
      "radar",
      "photometric_camera",
      "hybrid",
      "unknown",
    ]);
    if (validLaunchMonitorTypes.has(launchMonitorType as LaunchMonitorType)) {
      baseWhere.launchMonitorType = launchMonitorType as LaunchMonitorType;
    } else {
      forceNoResults = true;
    }
  }

  if (typeof minPrice === "number" && !isNaN(minPrice)) {
    baseWhere.priceRangeMin = { gte: minPrice };
  }

  if (typeof maxPrice === "number" && !isNaN(maxPrice)) {
    baseWhere.priceRangeMax = { lte: maxPrice };
  }

  if (kidFriendly) {
    baseWhere.kidFriendly = true;
  }

  if (coaching) {
    baseWhere.coachingAvailable = true;
  }

  if (wifi) {
    baseWhere.wifi = true;
  }

  if (privateRooms) {
    baseWhere.hasPrivateRooms = true;
  }

  const canRawQuery = typeof (db as unknown as { $queryRaw?: unknown }).$queryRaw === "function";
  if (normalizedHardware && canRawQuery) {
    baseWhere.hardwareBrands = { has: normalizedHardware };
  }
  type VenueListRow = Prisma.VenueGetPayload<{ select: typeof venueCardSelect }>;

  const intersectIds = (current: Set<string> | null, ids: string[]) => {
    const next = new Set(ids);
    if (current === null) return next;
    return new Set([...current].filter((id) => next.has(id)));
  };

  let totalVenues: number | null = 0;
  let pagedVenues: VenueListRow[] = [];
  let hasNextPage = false;

  if (forceNoResults) {
    totalVenues = 0;
    pagedVenues = [];
    hasNextPage = false;
  } else if (!canRawQuery && (hardware || food || alcohol)) {
    // Fallback path for mock DB (no raw SQL support).
    let venues = await db.venue.findMany({
      where: baseWhere,
      orderBy: [{ featured: "desc" }, { ratingOverall: "desc" }, { name: "asc" }],
      select: venueCardSelect,
    });

    if (hardware) {
      const hardwareLower = normalizedHardware || hardware.toLowerCase().trim();
      venues = venues.filter((venue) => {
        if ((venue.hardwareBrands || []).includes(hardwareLower)) return true;
        if (!venue.simulatorSystems) return false;
        try {
          const systems = venue.simulatorSystems as { brand?: string; model?: string }[];
          return systems.some(
            (system) => normalizeHardwareBrand(system.brand?.toLowerCase().trim() || "") === hardwareLower
          );
        } catch {
          return false;
        }
      });
    }

    if (food || alcohol) {
      venues = venues.filter((venue) => {
        if (!venue.foodAndDrink) return false;
        try {
          const data = venue.foodAndDrink as { food?: boolean; alcohol?: boolean };
          if (food && !data.food) return false;
          if (alcohol && !data.alcohol) return false;
          return true;
        } catch {
          return false;
        }
      });
    }

    totalVenues = venues.length;
    pagedVenues = venues.slice((page - 1) * pageSize, page * pageSize);
    hasNextPage = page * pageSize < totalVenues;
  } else {
    let advancedFilterIds: Set<string> | null = null;

    if (food || alcohol) {
      const foodAndDrinkRows = await db.$queryRaw<{ id: string }[]>`
        SELECT v.id
        FROM "venues" v
        WHERE v."status" = 'active'
          AND (${food} = false OR COALESCE((v."foodAndDrink"->>'food')::boolean, false) = true)
          AND (${alcohol} = false OR COALESCE((v."foodAndDrink"->>'alcohol')::boolean, false) = true)
      `;
      advancedFilterIds = intersectIds(advancedFilterIds, foodAndDrinkRows.map((row) => row.id));
    }

    if (advancedFilterIds) {
      baseWhere.id = { in: advancedFilterIds.size > 0 ? [...advancedFilterIds] : ["__no_match__"] };
    }

    // Fetch total count and paginated results in parallel
    const [totalCount, rows] = await Promise.all([
      db.venue.count({ where: baseWhere }),
      db.venue.findMany({
        where: baseWhere,
        orderBy: [{ featured: "desc" }, { ratingOverall: "desc" }, { name: "asc" }],
        select: venueCardSelect,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    totalVenues = totalCount;
    pagedVenues = rows;
    hasNextPage = page * pageSize < totalCount;
  }

  const totalPages = totalVenues === null ? undefined : Math.max(1, Math.ceil(totalVenues / pageSize));
  const hasExactCount = totalPages !== undefined;

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
            initialWifi={wifi}
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
                    href={`/venue/us/${getStateSlug(venue.state)}/${venue.city.toLowerCase().replace(/\s+/g, "-")}/${venue.slug}`}
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
