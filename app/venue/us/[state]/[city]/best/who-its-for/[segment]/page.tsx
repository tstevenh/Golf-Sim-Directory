import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { BestByPageContent } from "@/components/seo/BestByPageContent";
import { matchesWhoItsFor } from "@/lib/best-by";
import { getStateDisplayName, getStateAbbrevFromName } from "@/lib/states";

interface CityBestWhoItsForPageProps {
  params: Promise<{ state: string; city: string; segment: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: CityBestWhoItsForPageProps): Promise<Metadata> {
  const { state, city, segment } = await params;
  const stateAbbrev = getStateAbbrevFromName(state) || state.toUpperCase();
  const stateName = getStateDisplayName(stateAbbrev);
  const cityFormatted = city.replace(/-/g, " ");
  const segmentLabel = segment.replace(/_/g, " ");

  return {
    title: `Best Golf Simulators for ${segmentLabel} in ${cityFormatted}, ${stateName} | GolfSimMap`,
    description: `Find the best golf simulator venues for ${segmentLabel} in ${cityFormatted}. Compare amenities, vibes, and book.`,
  };
}

export default async function CityBestWhoItsForPage({ params }: CityBestWhoItsForPageProps) {
  const { state, city, segment } = await params;
  const stateAbbrev = getStateAbbrevFromName(state) || state.toUpperCase();
  const stateName = getStateDisplayName(stateAbbrev);
  const cityFormatted = city.replace(/-/g, " ");
  const segmentLabel = segment.replace(/_/g, " ");

  const venues = await db.venue.findMany({
    where: {
      city: { equals: cityFormatted, mode: "insensitive" },
      state: stateAbbrev.toUpperCase(),
      country: "US",
      status: "active",
    },
    orderBy: [{ featured: "desc" }, { ratingOverall: "desc" }, { name: "asc" }],
  });

  const filteredVenues = venues.filter((venue) => matchesWhoItsFor(venue, segment));

  const nearbyCitiesResult = await db.venue.findMany({
    where: {
      state: stateAbbrev.toUpperCase(),
      country: "US",
      status: "active",
      city: { not: cityFormatted },
    },
    select: { city: true },
    distinct: ["city"],
    take: 4,
  });

  const nearbyLinks = nearbyCitiesResult.map((c) => ({
    label: `For ${segmentLabel} in ${c.city}`,
    href: `/venue/us/${state}/${c.city.toLowerCase().replace(/\s+/g, "-")}/best/who-its-for/${segment}`,
  }));

  const faqItems = [
    {
      question: `What makes a venue good for ${segmentLabel}?`,
      answer: "We look at amenities, vibe, and owner tags. Venues tagged for this segment share traits that match the use case.",
    },
    {
      question: `How many venues in ${cityFormatted} are good for ${segmentLabel}?`,
      answer: `${filteredVenues.length} venues match in ${cityFormatted}. Browse the full city list for more options.`,
    },
    {
      question: "Can I suggest a venue for this list?",
      answer: "Yes. Submit the venue or leave feedback on an existing listing.",
    },
    {
      question: "Are these venues verified?",
      answer: "Some are. Verified venues have confirmed details. Look for the badge.",
    },
  ];

  return (
    <div className="min-h-screen bg-deep-black py-12">
      <div className="absolute inset-0 scorecard-grid opacity-20" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-sm text-muted mb-6">
          <Link href="/" className="hover:text-cream transition-colors">Home</Link>
          <span>/</span>
          <Link href="/venue/us" className="hover:text-cream transition-colors">US</Link>
          <span>/</span>
          <Link href={`/venue/us/${state}`} className="hover:text-cream transition-colors">{stateName}</Link>
          <span>/</span>
          <Link href={`/venue/us/${state}/${city}`} className="hover:text-cream transition-colors">{cityFormatted}</Link>
          <span>/</span>
          <span className="text-cream">Best for {segmentLabel}</span>
        </div>

        <BestByPageContent
          title={`Best Golf Simulators for ${segmentLabel} in ${cityFormatted}`}
          description={`${filteredVenues.length} venues in ${cityFormatted}, ${stateName} ideal for ${segmentLabel}. Compare and book.`}
          guidancePoints={[
            "Check amenities that matter to your group — food, drinks, private rooms.",
            "Read vibe tags to gauge atmosphere before booking.",
            "Book ahead for weekends if you're bringing a group.",
          ]}
          methodologyDescription="We filter by who-its-for tags from listing data. Featured venues first, then sorted by rating."
          faqItems={faqItems}
          nearbyTitle={`For ${segmentLabel} nearby`}
          nearbyLinks={nearbyLinks}
          relatedLinks={[
            { label: `All venues in ${cityFormatted}`, href: `/venue/us/${state}/${city}` },
            { label: `Best for ${segmentLabel} (national)`, href: `/best/who-its-for/${segment}` },
          ]}
          ctaTitle="Own a venue here?"
          ctaDescription={`Claim your listing to update tags and appear in ${cityFormatted} searches.`}
          ctaPrimary={{ label: "Claim a listing", href: "/claim" }}
          ctaSecondary={{ label: "Submit a venue", href: "/submit" }}
          venues={filteredVenues}
        />
      </div>
    </div>
  );
}
