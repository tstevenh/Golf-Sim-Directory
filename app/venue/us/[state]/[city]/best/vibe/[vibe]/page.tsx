import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { BestByPageContent } from "@/components/seo/BestByPageContent";
import { matchesVibe } from "@/lib/best-by";
import { getStateDisplayName, getStateAbbrevFromName } from "@/lib/states";

interface CityBestVibePageProps {
  params: Promise<{ state: string; city: string; vibe: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: CityBestVibePageProps): Promise<Metadata> {
  const { state, city, vibe } = await params;
  const stateAbbrev = getStateAbbrevFromName(state) || state.toUpperCase();
  const stateName = getStateDisplayName(stateAbbrev);
  const cityFormatted = city.replace(/-/g, " ");
  const vibeLabel = vibe.replace(/_/g, " ");

  return {
    title: `Best ${vibeLabel} Golf Simulators in ${cityFormatted}, ${stateName} | GolfSimMap`,
    description: `Find ${vibeLabel} vibe golf simulator venues in ${cityFormatted}. Compare atmosphere, amenities, and book your session.`,
  };
}

export default async function CityBestVibePage({ params }: CityBestVibePageProps) {
  const { state, city, vibe } = await params;
  const stateAbbrev = getStateAbbrevFromName(state) || state.toUpperCase();
  const stateName = getStateDisplayName(stateAbbrev);
  const cityFormatted = city.replace(/-/g, " ");
  const vibeLabel = vibe.replace(/_/g, " ");

  const venues = await db.venue.findMany({
    where: {
      city: { equals: cityFormatted, mode: "insensitive" },
      state: stateAbbrev.toUpperCase(),
      country: "US",
      status: "active",
    },
    orderBy: [{ featured: "desc" }, { ratingOverall: "desc" }, { name: "asc" }],
  });

  const filteredVenues = venues.filter((venue) => matchesVibe(venue, vibe));

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
    label: `${vibeLabel} in ${c.city}`,
    href: `/venue/us/${state}/${c.city.toLowerCase().replace(/\s+/g, "-")}/best/vibe/${vibe}`,
  }));

  const faqItems = [
    {
      question: `What does ${vibeLabel} vibe mean?`,
      answer: "Vibe tags describe the atmosphere — from upscale lounge to sports-bar energy. Pick the vibe that matches your crew.",
    },
    {
      question: `How many ${vibeLabel} venues are in ${cityFormatted}?`,
      answer: `${filteredVenues.length} venues match this vibe in ${cityFormatted}. See the full city list for more options.`,
    },
    {
      question: "Who sets the vibe tags?",
      answer: "Owners tag their venues during submission. We infer from amenities when data is available.",
    },
    {
      question: "Can I update a venue's vibe?",
      answer: "Owners can claim their listing to update vibe and other details.",
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
          <span className="text-cream">Best {vibeLabel}</span>
        </div>

        <BestByPageContent
          title={`Best ${vibeLabel} Golf Simulators in ${cityFormatted}`}
          description={`${filteredVenues.length} venues in ${cityFormatted} with a ${vibeLabel} atmosphere. Compare and book.`}
          guidancePoints={[
            "Check photos and reviews to confirm the vibe matches what you want.",
            "Look for food and drink options if you're making it a night out.",
            "Book ahead for weekends — popular vibes fill up fast.",
          ]}
          methodologyDescription="We filter city venues by vibe tag. Featured listings appear first, then sorted by rating."
          faqItems={faqItems}
          nearbyTitle={`${vibeLabel} vibes nearby`}
          nearbyLinks={nearbyLinks}
          relatedLinks={[
            { label: `All venues in ${cityFormatted}`, href: `/venue/us/${state}/${city}` },
            { label: `Best ${vibeLabel} (national)`, href: `/best/vibe/${vibe}` },
          ]}
          ctaTitle="Own a venue here?"
          ctaDescription={`Claim your listing to update your vibe and appear in ${cityFormatted} searches.`}
          ctaPrimary={{ label: "Claim a listing", href: "/claim" }}
          ctaSecondary={{ label: "Submit a venue", href: "/submit" }}
          venues={filteredVenues}
        />
      </div>
    </div>
  );
}
