import { Metadata } from "next";
import Link from "next/link";
import { db, venueCardSelect } from "@/lib/db";
import { VenueCard, VenueGrid } from "@/components/venue/VenueCard";
import { getStateSlug } from "@/lib/states";
import { Search } from "lucide-react";

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

const venueTypes = [
  { value: "", label: "Any Type" },
  { value: "sim_bar", label: "Simulator Bar" },
  { value: "training_studio", label: "Training Studio" },
  { value: "private_rental", label: "Private Rental" },
  { value: "retail_fitting_center", label: "Retail/Fitting" },
  { value: "country_club", label: "Country Club" },
  { value: "multi_sport_sim", label: "Multi-Sport" },
  { value: "hotel_resort", label: "Hotel/Resort" },
];

const launchMonitorTypes = [
  { value: "", label: "Any System" },
  { value: "radar", label: "Radar" },
  { value: "photometric_camera", label: "Camera" },
  { value: "hybrid", label: "Hybrid" },
  { value: "overhead_camera", label: "Overhead Camera" },
];

const hardwareBrands = [
  "Trackman",
  "Foresight",
  "Uneekor",
  "GCQuad",
  "Full Swing",
  "AboutGolf",
  "SkyTrak",
  "FlightScope",
  "Golfzon",
];

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
  const page = Math.max(1, Number(params.page || 1));
  const pageSize = 12;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const baseWhere: Record<string, any> = {
    status: "active",
  };

  if (query) {
    baseWhere.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { city: { contains: query, mode: "insensitive" } },
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
    baseWhere.venueType = venueType;
  }

  if (launchMonitorType) {
    baseWhere.launchMonitorType = launchMonitorType;
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

  let venues = await db.venue.findMany({
    where: baseWhere,
    orderBy: [{ featured: "desc" }, { ratingOverall: "desc" }, { name: "asc" }],
    select: venueCardSelect,
  });

  if (hardware) {
    const hardwareLower = hardware.toLowerCase().trim();
    venues = venues.filter((venue) => {
      if (!venue.simulatorSystems) return false;
      try {
        const systems = venue.simulatorSystems as { brand?: string; model?: string }[];
        return systems.some((system) => system.brand?.toLowerCase().trim() === hardwareLower);
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

  const totalVenues = venues.length;
  const totalPages = Math.max(1, Math.ceil(totalVenues / pageSize));
  const pagedVenues = venues.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="min-h-screen bg-deep-black">
      <div className="absolute inset-0 scorecard-grid opacity-20" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-masters-green" />
            <span className="text-masters-green text-xs font-mono uppercase tracking-widest">Search</span>
          </div>
          <h1 className="text-cream mb-2">Search Golf Simulators</h1>
          <p className="text-muted max-w-2xl">
            Find indoor golf venues by location, hardware, and amenities.
          </p>
        </div>

        {/* Search & Filter Section */}
        <section className="border border-default bg-charcoal p-6 md:p-8 mb-10">
          <form className="space-y-4" method="get">
            {/* Row 1: Search + Location */}
            <div className="grid md:grid-cols-3 gap-4">
              <input 
                name="q" 
                defaultValue={query} 
                placeholder="Search by name" 
                className="golf-input !pl-4" 
              />
              <input 
                name="city" 
                defaultValue={city} 
                placeholder="City" 
                className="golf-input !pl-4" 
              />
              <input 
                name="state" 
                defaultValue={state} 
                placeholder="State" 
                className="golf-input !pl-4" 
              />
            </div>

            {/* Row 2: Type + Monitor + Hardware */}
            <div className="grid md:grid-cols-3 gap-4">
              <select name="venueType" defaultValue={venueType} className="golf-input !pl-4">
                {venueTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <select name="launchMonitorType" defaultValue={launchMonitorType} className="golf-input !pl-4">
                {launchMonitorTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <select name="hardware" defaultValue={hardware} className="golf-input !pl-4">
                <option value="">Any Hardware</option>
                {hardwareBrands.map((brand) => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            {/* Row 3: Price Range + Checkboxes */}
            <div className="grid md:grid-cols-4 gap-4">
              <input 
                name="minPrice" 
                type="number"
                defaultValue={minPrice?.toString()} 
                placeholder="Min $/hr" 
                className="golf-input !pl-4" 
              />
              <input 
                name="maxPrice" 
                type="number"
                defaultValue={maxPrice?.toString()} 
                placeholder="Max $/hr" 
                className="golf-input !pl-4" 
              />
              <div className="md:col-span-2 flex flex-wrap gap-4 items-center">
                <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                  <input type="checkbox" name="kidFriendly" defaultChecked={kidFriendly} className="rounded border-default" />
                  Kid-friendly
                </label>
                <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                  <input type="checkbox" name="coaching" defaultChecked={coaching} className="rounded border-default" />
                  Coaching
                </label>
                <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                  <input type="checkbox" name="food" defaultChecked={food} className="rounded border-default" />
                  Food
                </label>
                <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                  <input type="checkbox" name="alcohol" defaultChecked={alcohol} className="rounded border-default" />
                  Bar
                </label>
                <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                  <input type="checkbox" name="wifi" defaultChecked={wifi} className="rounded border-default" />
                  WiFi
                </label>
                <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                  <input type="checkbox" name="privateRooms" defaultChecked={privateRooms} className="rounded border-default" />
                  Private Rooms
                </label>
              </div>
            </div>

            {/* Row 4: Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button type="submit" className="btn-primary">
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
              <Link href="/search" className="btn-outline">Reset</Link>
            </div>
          </form>
        </section>

        {/* Results */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-cream">{totalVenues} results</h2>
            {totalVenues > 0 && (
              <span className="text-sm text-muted">Page {page} of {totalPages}</span>
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
                    shortDescription={venue.shortDescription}
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

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-10">
                  {Array.from({ length: totalPages }).map((_, index) => {
                    const pageNumber = index + 1;
                    const params = new URLSearchParams();
                    if (query) params.set("q", query);
                    if (city) params.set("city", city);
                    if (state) params.set("state", state);
                    if (venueType) params.set("venueType", venueType);
                    if (launchMonitorType) params.set("launchMonitorType", launchMonitorType);
                    if (hardware) params.set("hardware", hardware);
                    if (minPrice) params.set("minPrice", String(minPrice));
                    if (maxPrice) params.set("maxPrice", String(maxPrice));
                    if (kidFriendly) params.set("kidFriendly", "true");
                    if (coaching) params.set("coaching", "true");
                    if (food) params.set("food", "true");
                    if (alcohol) params.set("alcohol", "true");
                    if (wifi) params.set("wifi", "true");
                    if (privateRooms) params.set("privateRooms", "true");
                    params.set("page", String(pageNumber));
                    const href = `/search?${params.toString()}`;
                    const isActive = pageNumber === page;
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={`min-w-[44px] min-h-[44px] flex items-center justify-center border text-sm transition-colors rounded-lg ${isActive ? "border-masters-green bg-masters-green/10 text-cream" : "border-default text-cream-subtle hover:border-masters-green hover:text-cream"}`}
                      >
                        {pageNumber}
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
