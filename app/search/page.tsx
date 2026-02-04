import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { VenueCard } from "@/components/venue/VenueCard";
import { SeoIndexSections } from "@/components/seo/SeoIndexSections";

export const metadata: Metadata = {
  title: "Search Golf Simulators | GolfSimMap",
  description: "Search indoor golf simulators by city, venue type, launch monitor, and amenities.",
};

interface SearchPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

const venueTypes = [
  "sim_bar",
  "training_studio",
  "private_rental",
  "retail_fitting_center",
  "country_club",
  "multi_sport_sim",
  "hotel_resort",
  "other",
];

const launchMonitorTypes = [
  "radar",
  "photometric_camera",
  "hybrid",
  "overhead_camera",
  "floor_camera",
  "infrared_optical",
  "unknown",
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
  const zip = typeof params.zip === "string" ? params.zip : "";
  const venueType = typeof params.venueType === "string" ? params.venueType : "";
  const launchMonitorType = typeof params.launchMonitorType === "string" ? params.launchMonitorType : "";
  const hardware = typeof params.hardware === "string" ? params.hardware : "";
  const minPrice = typeof params.minPrice === "string" ? Number(params.minPrice) : undefined;
  const maxPrice = typeof params.maxPrice === "string" ? Number(params.maxPrice) : undefined;
  const kidFriendly = params.kidFriendly === "true";
  const coaching = params.coaching === "true";
  const food = params.food === "true";
  const alcohol = params.alcohol === "true";
  const wifi = params.wifi === "true";
  const privateRooms = params.privateRooms === "true";
  const parking = typeof params.parking === "string" ? params.parking : "";
  const page = Math.max(1, Number(params.page || 1));
  const pageSize = 12;

  const baseWhere: any = {
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

  if (zip) {
    baseWhere.zipCode = { contains: zip, mode: "insensitive" };
  }

  if (venueType) {
    baseWhere.venueType = venueType;
  }

  if (launchMonitorType) {
    baseWhere.launchMonitorType = launchMonitorType;
  }

  if (typeof minPrice === "number") {
    baseWhere.priceRangeMin = { gte: minPrice };
  }

  if (typeof maxPrice === "number") {
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

  if (parking) {
    baseWhere.parking = parking;
  }

  let venues = await db.venue.findMany({
    where: baseWhere,
    orderBy: [{ featured: "desc" }, { ratingOverall: "desc" }, { name: "asc" }],
  });

  if (hardware) {
    venues = venues.filter((venue) => {
      if (!venue.simulatorSystems) return false;
      try {
        const systems = venue.simulatorSystems as { brand?: string; model?: string }[];
        return systems.some((system) => system.brand?.toLowerCase() === hardware.toLowerCase());
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

  const faqItems = [
    {
      question: "What can I search for on GolfSimMap?",
      answer: "Search by venue name, city, or ZIP code, then use filters to narrow by hardware, amenities, or venue type.",
    },
    {
      question: "Do filters include launch monitor types?",
      answer: "Yes. Filter by radar, photometric camera, hybrid, or other launch monitor types depending on the data available.",
    },
    {
      question: "How do I find venues with food and drinks?",
      answer: "Use the Food and Alcohol filters to surface simulator bars and venues with dining options.",
    },
    {
      question: "Can I submit a venue that is not listed?",
      answer: "Yes. Submit a new venue and we will review it before publishing.",
    },
  ];

  return (
    <div className="min-h-screen bg-deep-black py-12">
      <div className="absolute inset-0 scorecard-grid opacity-20" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-masters-green" />
            <span className="text-masters-green text-xs font-mono uppercase tracking-widest">Search</span>
          </div>
          <h1 className="text-cream mb-2">Search Golf Simulators</h1>
          <p className="text-muted max-w-2xl">
            Find indoor golf venues by location, hardware, and amenities. Use filters to dial in the exact simulator experience you want.
          </p>
        </div>

        <SeoIndexSections
          introTitle="Find the right simulator fast"
          introDescription="GolfSimMap search helps you compare venues across the U.S. Filter by hardware, amenities, and pricing style to match your needs."
          guidanceTitle="Search tips"
          guidancePoints={[
            "Use city or ZIP for the most accurate local results.",
            "Filter by launch monitor type if you care about data precision.",
            "Toggle food, alcohol, and private rooms for group-friendly venues.",
          ]}
          methodologyTitle="How search ranking works"
          methodologyDescription="Search results prioritize featured and highly rated venues, then sort by name. Filters always override ranking to match your preferences."
          faqTitle="Search FAQs"
          faqItems={faqItems}
          relatedTitle="Related best-by pages"
          relatedLinks={[
            { label: "Best date-night venues", href: "/best/date-night" },
            { label: "Best serious-practice venues", href: "/best/serious-practice" },
            { label: "Best Trackman venues", href: "/best/hardware/trackman" },
            { label: "Best family-friendly venues", href: "/best/who-its-for/families" },
          ]}
          ctaTitle="Own a venue?"
          ctaDescription="Claim your listing to verify details, add photos, and attract golfers searching in your area."
          ctaPrimary={{ label: "Claim a listing", href: "/claim" }}
          ctaSecondary={{ label: "Submit a venue", href: "/submit" }}
        >
          <section className="border border-default bg-charcoal p-6 md:p-8 mb-10">
            <form className="grid gap-4" method="get">
              <div className="grid md:grid-cols-3 gap-4">
                <input name="q" defaultValue={query} placeholder="Search by name" className="golf-input !pl-4" />
                <input name="city" defaultValue={city} placeholder="City" className="golf-input !pl-4" />
                <input name="zip" defaultValue={zip} placeholder="ZIP" className="golf-input !pl-4" />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <select name="venueType" defaultValue={venueType} className="golf-input !pl-4">
                  <option value="">Venue type</option>
                  {venueTypes.map((type) => (
                    <option key={type} value={type}>{type.replace(/_/g, " ")}</option>
                  ))}
                </select>
                <select name="launchMonitorType" defaultValue={launchMonitorType} className="golf-input !pl-4">
                  <option value="">Launch monitor</option>
                  {launchMonitorTypes.map((type) => (
                    <option key={type} value={type}>{type.replace(/_/g, " ")}</option>
                  ))}
                </select>
                <select name="hardware" defaultValue={hardware} className="golf-input !pl-4">
                  <option value="">Simulator hardware</option>
                  {hardwareBrands.map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <input name="minPrice" defaultValue={minPrice?.toString()} placeholder="Min price" className="golf-input !pl-4" />
                <input name="maxPrice" defaultValue={maxPrice?.toString()} placeholder="Max price" className="golf-input !pl-4" />
                <select name="parking" defaultValue={parking} className="golf-input !pl-4">
                  <option value="">Parking</option>
                  <option value="free_lot">Free parking</option>
                  <option value="paid_lot">Paid lot</option>
                  <option value="garage">Garage</option>
                  <option value="valet">Valet</option>
                </select>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center gap-2 text-sm text-muted">
                    <input type="checkbox" name="kidFriendly" defaultChecked={kidFriendly} />
                    Kid-friendly
                  </label>
                  <label className="flex items-center gap-2 text-sm text-muted">
                    <input type="checkbox" name="coaching" defaultChecked={coaching} />
                    Coaching
                  </label>
                  <label className="flex items-center gap-2 text-sm text-muted">
                    <input type="checkbox" name="food" defaultChecked={food} />
                    Food
                  </label>
                  <label className="flex items-center gap-2 text-sm text-muted">
                    <input type="checkbox" name="alcohol" defaultChecked={alcohol} />
                    Alcohol
                  </label>
                  <label className="flex items-center gap-2 text-sm text-muted">
                    <input type="checkbox" name="wifi" defaultChecked={wifi} />
                    WiFi
                  </label>
                  <label className="flex items-center gap-2 text-sm text-muted">
                    <input type="checkbox" name="privateRooms" defaultChecked={privateRooms} />
                    Private rooms
                  </label>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button type="submit" className="btn-primary">Search</button>
                <Link href="/search" className="btn-outline">Reset</Link>
              </div>
            </form>
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-cream">{totalVenues} results</h2>
              {totalVenues > 0 && (
                <span className="text-sm text-muted">Page {page} of {totalPages}</span>
              )}
            </div>

            {pagedVenues.length === 0 ? (
              <div className="text-center py-12 border border-default">
                <p className="text-muted">No venues match your filters. Try widening your search.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    href={`/venue/us/${venue.state.toLowerCase()}/${venue.city.toLowerCase().replace(/\s+/g, "-")}/${venue.slug}`}
                  />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                {Array.from({ length: totalPages }).map((_, index) => {
                  const pageNumber = index + 1;
                  const params = new URLSearchParams();
                  if (query) params.set("q", query);
                  if (city) params.set("city", city);
                  if (zip) params.set("zip", zip);
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
                  if (parking) params.set("parking", parking);
                  params.set("page", String(pageNumber));
                  const href = `/search?${params.toString()}`;
                  const isActive = pageNumber === page;
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`px-3 py-2 border text-sm transition-colors ${isActive ? "border-masters-green text-cream" : "border-default text-cream-subtle hover:border-masters-green hover:text-cream"}`}
                    >
                      {pageNumber}
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </SeoIndexSections>
      </div>
    </div>
  );
}
