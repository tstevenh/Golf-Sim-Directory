import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { BestByPageContent } from "@/components/seo/BestByPageContent";
import { matchesHardware } from "@/lib/best-by";
import { getStateDisplayName, getStateAbbrevFromName } from "@/lib/states";

interface CityBestHardwarePageProps {
  params: Promise<{ state: string; city: string; brand: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: CityBestHardwarePageProps): Promise<Metadata> {
  const { state, city, brand } = await params;
  const stateAbbrev = getStateAbbrevFromName(state) || state.toUpperCase();
  const stateName = getStateDisplayName(stateAbbrev);
  const cityFormatted = city.replace(/-/g, " ");
  const brandLabel = brand.replace(/-/g, " ");

  return {
    title: `Best ${brandLabel} Golf Simulators in ${cityFormatted}, ${stateName} | GolfSimMap`,
    description: `Find venues using ${brandLabel} simulators in ${cityFormatted}. Compare ratings, amenities, and book your session.`,
  };
}

export default async function CityBestHardwarePage({ params }: CityBestHardwarePageProps) {
  const { state, city, brand } = await params;
  const stateAbbrev = getStateAbbrevFromName(state) || state.toUpperCase();
  const stateName = getStateDisplayName(stateAbbrev);
  const cityFormatted = city.replace(/-/g, " ");
  const brandLabel = brand.replace(/-/g, " ");

  const venues = await db.venue.findMany({
    where: {
      city: { equals: cityFormatted, mode: "insensitive" },
      state: stateAbbrev.toUpperCase(),
      country: "US",
      status: "active",
    },
    orderBy: [{ featured: "desc" }, { ratingOverall: "desc" }, { name: "asc" }],
  });

  const filteredVenues = venues.filter((venue) => matchesHardware(venue, brandLabel));

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
    label: `${brandLabel} in ${c.city}`,
    href: `/venue/us/${state}/${c.city.toLowerCase().replace(/\s+/g, "-")}/best/hardware/${brand}`,
  }));

  const faqItems = [
    {
      question: `Why choose ${brandLabel} simulators?`,
      answer: `${brandLabel} is known for accurate shot tracking and quality data. Serious golfers often prefer it for practice sessions.`,
    },
    {
      question: `How many ${brandLabel} venues are in ${cityFormatted}?`,
      answer: `${filteredVenues.length} venues list ${brandLabel} hardware in ${cityFormatted}. Hardware details may vary by bay.`,
    },
    {
      question: "Do all bays use the same hardware?",
      answer: "Not always. Some venues mix brands across bays or VIP rooms. Check the listing notes or call ahead.",
    },
    {
      question: "Are hardware details verified?",
      answer: "Some listings are verified by owners. Look for the badge. Unverified listings rely on available data.",
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
          <span className="text-cream">Best {brandLabel}</span>
        </div>

        <BestByPageContent
          title={`Best ${brandLabel} Golf Simulators in ${cityFormatted}`}
          description={`${filteredVenues.length} venues in ${cityFormatted}, ${stateName} using ${brandLabel} hardware. Compare and book.`}
          guidancePoints={[
            "Confirm the exact model on the venue page — brands have different tiers.",
            "Compare launch monitor type if you care about specific data points.",
            "Book ahead if you want a specific bay or hardware setup.",
          ]}
          methodologyDescription="We match simulator brands from listing data. Featured venues first, then sorted by rating."
          faqItems={faqItems}
          nearbyTitle={`${brandLabel} nearby`}
          nearbyLinks={nearbyLinks}
          relatedLinks={[
            { label: `All venues in ${cityFormatted}`, href: `/venue/us/${state}/${city}` },
            { label: `Best ${brandLabel} (national)`, href: `/best/hardware/${brand}` },
          ]}
          ctaTitle="Own a venue here?"
          ctaDescription={`Claim your listing to confirm your ${brandLabel} setup and appear in local searches.`}
          ctaPrimary={{ label: "Claim a listing", href: "/claim" }}
          ctaSecondary={{ label: "Submit a venue", href: "/submit" }}
          venues={filteredVenues}
        />
      </div>
    </div>
  );
}
