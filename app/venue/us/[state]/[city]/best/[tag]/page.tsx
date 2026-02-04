import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { BestByPageContent } from "@/components/seo/BestByPageContent";
import { matchesTag } from "@/lib/best-by";
import { getStateDisplayName, getStateAbbrevFromName } from "@/lib/states";

interface CityBestTagPageProps {
  params: Promise<{ state: string; city: string; tag: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: CityBestTagPageProps): Promise<Metadata> {
  const { state, city, tag } = await params;
  const stateAbbrev = getStateAbbrevFromName(state) || state.toUpperCase();
  const stateName = getStateDisplayName(stateAbbrev);
  const cityFormatted = city.replace(/-/g, " ");
  const tagLabel = tag.replace(/-/g, " ");

  return {
    title: `Best ${tagLabel} Golf Simulators in ${cityFormatted}, ${stateName} | GolfSimMap`,
    description: `Find the best ${tagLabel} golf simulator venues in ${cityFormatted}. Compare amenities, hardware, and booking options.`,
  };
}

export default async function CityBestTagPage({ params }: CityBestTagPageProps) {
  const { state, city, tag } = await params;
  const stateAbbrev = getStateAbbrevFromName(state) || state.toUpperCase();
  const stateName = getStateDisplayName(stateAbbrev);
  const cityFormatted = city.replace(/-/g, " ");
  const tagLabel = tag.replace(/-/g, " ");

  const venues = await db.venue.findMany({
    where: {
      city: { equals: cityFormatted, mode: "insensitive" },
      state: stateAbbrev.toUpperCase(),
      country: "US",
      status: "active",
    },
    orderBy: [{ featured: "desc" }, { ratingOverall: "desc" }, { name: "asc" }],
  });

  const filteredVenues = venues.filter((venue) => matchesTag(venue, tag));

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
    label: `${tagLabel} in ${c.city}`,
    href: `/venue/us/${state}/${c.city.toLowerCase().replace(/\s+/g, "-")}/best/${tag}`,
  }));

  const faqItems = [
    {
      question: `How many ${tagLabel} venues are in ${cityFormatted}?`,
      answer: `We found ${filteredVenues.length} venues tagged for ${tagLabel} in ${cityFormatted}. Check the full city listing for more options.`,
    },
    {
      question: `What makes a venue good for ${tagLabel}?`,
      answer: `We look at amenities, vibe tags, and owner submissions. ${tagLabel} venues typically share specific traits that match this use case.`,
    },
    {
      question: "Are these venues verified?",
      answer: "Some are. Look for the verified badge. Unverified listings are based on available data and may be outdated.",
    },
    {
      question: "Can I suggest a venue?",
      answer: "Yes. Submit it or leave feedback on an existing listing. We review before adding tags.",
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
          <span className="text-cream">Best {tagLabel}</span>
        </div>

        <BestByPageContent
          title={`Best ${tagLabel} Golf Simulators in ${cityFormatted}`}
          description={`${filteredVenues.length} venues in ${cityFormatted}, ${stateName} tagged for ${tagLabel}. Compare before you book.`}
          guidancePoints={[
            "Check booking links and call ahead for popular time slots.",
            "Compare amenities if you're picky about food, drinks, or private rooms.",
            "Use launch monitor filters if data accuracy matters to you.",
          ]}
          methodologyDescription="We filter city venues by tag. Featured listings appear first, then sorted by rating and completeness."
          faqItems={faqItems}
          nearbyTitle={`${tagLabel} in nearby cities`}
          nearbyLinks={nearbyLinks}
          relatedLinks={[
            { label: `All venues in ${cityFormatted}`, href: `/venue/us/${state}/${city}` },
            { label: `Best ${tagLabel} (national)`, href: `/best/${tag}` },
            { label: `All venues in ${stateName}`, href: `/venue/us/${state}` },
          ]}
          ctaTitle="Own a venue here?"
          ctaDescription={`Claim your listing to appear in ${cityFormatted} best-by pages.`}
          ctaPrimary={{ label: "Claim a listing", href: "/claim" }}
          ctaSecondary={{ label: "Submit a venue", href: "/submit" }}
          venues={filteredVenues}
        />
      </div>
    </div>
  );
}
