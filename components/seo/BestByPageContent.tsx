import { Venue } from "@/types";
import { SeoIndexSections } from "@/components/seo/SeoIndexSections";
import { VenueCard, VenueGrid } from "@/components/venue/VenueCard";
import { CategoryHero } from "@/components/seo/CategoryHero";

type CategoryType = 
  | "tag" 
  | "amenity" 
  | "hardware" 
  | "software" 
  | "vibe" 
  | "segment" 
  | "launch-monitor"
  | "city"
  | "state";

interface BestByPageContentProps {
  title: string;
  description: string;
  guidancePoints: string[];
  methodologyDescription: string;
  faqItems: { question: string; answer: string }[];
  venues: Venue[];
  relatedLinks: { label: string; href: string }[];
  ctaTitle: string;
  ctaDescription: string;
  ctaPrimary: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
  nearbyLinks?: { label: string; href: string }[];
  nearbyTitle?: string;
  // New props for enhanced hero
  categoryType?: CategoryType;
  categoryValue?: string;
  heroSubtitle?: string;
  breadcrumbItems?: { label: string; href?: string }[];
  showRanking?: boolean;
}

export function BestByPageContent({
  title,
  description,
  guidancePoints,
  methodologyDescription,
  faqItems,
  venues,
  relatedLinks,
  ctaTitle,
  ctaDescription,
  ctaPrimary,
  ctaSecondary,
  nearbyLinks,
  nearbyTitle,
  categoryType = "tag",
  categoryValue,
  heroSubtitle,
  breadcrumbItems,
  showRanking = true,
}: BestByPageContentProps) {
  // Default breadcrumbs if not provided
  const defaultBreadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Best By", href: "/best" },
    { label: title },
  ];

  return (
    <div className="min-h-screen bg-deep-black">
      {/* Category Hero */}
      <CategoryHero
        type={categoryType}
        title={title}
        subtitle={heroSubtitle}
        description={description}
        venueCount={venues.length}
        breadcrumbItems={breadcrumbItems || defaultBreadcrumbs}
        categoryValue={categoryValue}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <SeoIndexSections
          introTitle="What makes these venues special"
          introDescription={description}
          guidanceTitle="What to look for"
          guidancePoints={guidancePoints}
          methodologyTitle="How we rank"
          methodologyDescription={methodologyDescription}
          faqTitle="Frequently Asked Questions"
          faqItems={faqItems}
          nearbyTitle={nearbyTitle}
          nearbyLinks={nearbyLinks}
          relatedTitle="Explore more categories"
          relatedLinks={relatedLinks}
          ctaTitle={ctaTitle}
          ctaDescription={ctaDescription}
          ctaPrimary={ctaPrimary}
          ctaSecondary={ctaSecondary}
          venueCount={venues.length}
          showStats={true}
        >
          {/* Venue Grid with Rankings */}
          {venues.length === 0 ? (
            <div className="text-center py-16 border border-default rounded-lg bg-charcoal">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate flex items-center justify-center">
                  <span className="text-3xl">🏌️</span>
                </div>
                <h3 className="text-cream text-lg font-semibold mb-2">No venues found</h3>
                <p className="text-muted">
                  No venues match this filter yet. Check back soon as we're constantly adding new locations.
                </p>
              </div>
            </div>
          ) : (
            <VenueGrid columns={3}>
              {venues.map((venue, index) => (
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
                  rank={showRanking ? index + 1 : undefined}
                  showRank={showRanking && index < 10}
                />
              ))}
            </VenueGrid>
          )}
        </SeoIndexSections>
      </div>
    </div>
  );
}

// Simplified version for city pages
interface CityPageContentProps {
  city: string;
  state: string;
  stateAbbr: string;
  description: string;
  venues: Venue[];
  guidancePoints: string[];
  methodologyDescription: string;
  faqItems: { question: string; answer: string }[];
  nearbyLinks?: { label: string; href: string }[];
  nearbyTitle?: string;
  relatedLinks?: { label: string; href: string }[];
  ctaTitle: string;
  ctaDescription: string;
  ctaPrimary: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
  topAmenities?: string[];
}

export function CityPageContent({
  city,
  state,
  stateAbbr,
  description,
  venues,
  guidancePoints,
  methodologyDescription,
  faqItems,
  nearbyLinks,
  nearbyTitle,
  relatedLinks,
  ctaTitle,
  ctaDescription,
  ctaPrimary,
  ctaSecondary,
  topAmenities,
}: CityPageContentProps) {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "US", href: "/venue/us" },
    { label: state, href: `/venue/us/${state.toLowerCase()}` },
    { label: city },
  ];

  return (
    <div className="min-h-screen bg-deep-black">
      {/* City Hero - using CategoryHero with city type */}
      <CategoryHero
        type="city"
        title={`Golf Simulators in ${city}, ${stateAbbr}`}
        subtitle={`Discover ${venues.length} golf simulator ${venues.length === 1 ? "venue" : "venues"} in ${city}`}
        description={description}
        venueCount={venues.length}
        breadcrumbItems={breadcrumbItems}
        categoryValue="city"
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <SeoIndexSections
          introTitle={`About Golf Simulators in ${city}`}
          introDescription={description}
          guidanceTitle="What to look for in a simulator venue"
          guidancePoints={guidancePoints}
          methodologyTitle="How we evaluate venues"
          methodologyDescription={methodologyDescription}
          faqTitle={`FAQs about ${city} Golf Simulators`}
          faqItems={faqItems}
          nearbyTitle={nearbyTitle || `More cities in ${state}`}
          nearbyLinks={nearbyLinks}
          relatedTitle="Browse by category"
          relatedLinks={relatedLinks}
          ctaTitle={ctaTitle}
          ctaDescription={ctaDescription}
          ctaPrimary={ctaPrimary}
          ctaSecondary={ctaSecondary}
          venueCount={venues.length}
          showStats={true}
        >
          {/* Venue Grid */}
          {venues.length === 0 ? (
            <div className="text-center py-16 border border-default rounded-lg bg-charcoal">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate flex items-center justify-center">
                  <span className="text-3xl">🏌️</span>
                </div>
                <h3 className="text-cream text-lg font-semibold mb-2">No venues in {city} yet</h3>
                <p className="text-muted">
                  We haven't added any golf simulator venues in {city} yet. Know one? Let us know!
                </p>
              </div>
            </div>
          ) : (
            <VenueGrid columns={3}>
              {venues.map((venue, index) => (
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
                  rank={index + 1}
                  showRank={index < 5}
                />
              ))}
            </VenueGrid>
          )}
        </SeoIndexSections>
      </div>
    </div>
  );
}
