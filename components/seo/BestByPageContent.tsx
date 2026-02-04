import { Venue } from "@/types";
import { SeoIndexSections } from "@/components/seo/SeoIndexSections";
import { VenueCard } from "@/components/venue/VenueCard";

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
}: BestByPageContentProps) {
  return (
    <SeoIndexSections
      introTitle={title}
      introDescription={description}
      guidanceTitle="What to look for"
      guidancePoints={guidancePoints}
      methodologyTitle="How we rank"
      methodologyDescription={methodologyDescription}
      faqTitle="FAQs"
      faqItems={faqItems}
      nearbyTitle={nearbyTitle}
      nearbyLinks={nearbyLinks}
      relatedTitle="Related best-by pages"
      relatedLinks={relatedLinks}
      ctaTitle={ctaTitle}
      ctaDescription={ctaDescription}
      ctaPrimary={ctaPrimary}
      ctaSecondary={ctaSecondary}
    >
      <section>
        {venues.length === 0 ? (
          <div className="text-center py-12 border border-default">
            <p className="text-muted">No venues match this filter yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((venue) => (
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
      </section>
    </SeoIndexSections>
  );
}
