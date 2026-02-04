import { Metadata } from "next";
import { db } from "@/lib/db";
import { BestByPageContent } from "@/components/seo/BestByPageContent";
import { matchesHardware } from "@/lib/best-by";
import { getStateDisplayName, getStateAbbrevFromName } from "@/lib/states";

interface CityBestHardwarePageProps {
  params: Promise<{ state: string; city: string; brand: string }>;
}

export const revalidate = 60;

// Hardware-specific descriptions
const hardwareDescriptions: Record<string, string> = {
  "trackman": "Tour-level accuracy with dual radar technology",
  "foresight": "Camera-based precision for club and ball data",
  "uneekor": "Overhead camera systems with compact footprint",
  "full-swing": "Immersive entertainment with stunning graphics",
  "golfzon": "Interactive platform with moving floor technology",
  "aboutgolf": "Premium simulation at country clubs",
  "skytrak": "Accessible accuracy for all skill levels",
  "flightscope": "3D Doppler radar technology",
};

export async function generateMetadata({ params }: CityBestHardwarePageProps): Promise<Metadata> {
  const { state, city, brand } = await params;
  const stateAbbrev = getStateAbbrevFromName(state) || state.toUpperCase();
  const stateName = getStateDisplayName(stateAbbrev);
  const cityFormatted = city.replace(/-/g, " ");
  const brandLabel = brand.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const brandDesc = hardwareDescriptions[brand.toLowerCase()] || "quality simulator hardware";

  return {
    title: `Best ${brandLabel} Golf Simulators in ${cityFormatted}, ${stateName} | GolfSimMap`,
    description: `Find venues using ${brandLabel} simulators in ${cityFormatted}. ${brandDesc}. Compare ratings, amenities, and book your session.`,
    openGraph: {
      title: `Best ${brandLabel} Golf Simulators in ${cityFormatted}`,
      description: `Find venues using ${brandLabel} (${brandDesc}) in ${cityFormatted}.`,
      type: "website",
    },
  };
}

export default async function CityBestHardwarePage({ params }: CityBestHardwarePageProps) {
  const { state, city, brand } = await params;
  const stateAbbrev = getStateAbbrevFromName(state) || state.toUpperCase();
  const stateName = getStateDisplayName(stateAbbrev);
  const cityFormatted = city.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const brandLabel = brand.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const brandDesc = hardwareDescriptions[brand.toLowerCase()] || "quality simulator hardware";

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
      city: { not: { equals: cityFormatted, mode: "insensitive" } },
    },
    select: { city: true },
    distinct: ["city"],
    take: 6,
  });

  const nearbyLinks = nearbyCitiesResult.map((c) => ({
    label: `${brandLabel} in ${c.city}`,
    href: `/venue/us/${state}/${c.city.toLowerCase().replace(/\s+/g, "-")}/best/hardware/${brand}`,
  }));

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "US", href: "/venue/us" },
    { label: stateName, href: `/venue/us/${state}` },
    { label: cityFormatted, href: `/venue/us/${state}/${city}` },
    { label: `Best ${brandLabel}` },
  ];

  const faqItems = [
    {
      question: `Why choose ${brandLabel} simulators?`,
      answer: `${brandLabel} offers ${brandDesc}. Serious golfers often prefer it for practice sessions and data-driven improvement.`,
    },
    {
      question: `How many ${brandLabel} venues are in ${cityFormatted}?`,
      answer: `We found ${filteredVenues.length} venues listing ${brandLabel} hardware in ${cityFormatted}. Hardware details may vary by bay — always confirm when booking.`,
    },
    {
      question: "Do all bays at a venue use the same hardware?",
      answer: "Not always. Some venues mix brands across bays or have premium bays with different equipment. Check the listing notes or call ahead to confirm.",
    },
    {
      question: "Are hardware details verified?",
      answer: "Verified venues have confirmed their hardware with us. Look for the verified badge. Unverified listings rely on available data.",
    },
  ];

  const relatedLinks = [
    { label: `All venues in ${cityFormatted}`, href: `/venue/us/${state}/${city}` },
    { label: `Best ${brandLabel} (national)`, href: `/best/hardware/${brand}` },
    { label: `All venues in ${stateName}`, href: `/venue/us/${state}` },
    { label: "TrackMan venues", href: `/venue/us/${state}/${city}/best/hardware/trackman` },
    { label: "Foresight venues", href: `/venue/us/${state}/${city}/best/hardware/foresight` },
  ].filter(link => !link.href.endsWith(`/hardware/${brand}`));

  return (
    <BestByPageContent
      title={`Best ${brandLabel} Golf Simulators in ${cityFormatted}`}
      description={`Discover ${filteredVenues.length} venues in ${cityFormatted}, ${stateName} using ${brandLabel} hardware. ${brandDesc}. Compare and book your session.`}
      guidancePoints={[
        "Confirm the exact model on the venue page — brands have different tiers.",
        "Compare launch monitor type if you care about specific data points.",
        "Book ahead if you want a specific bay or hardware setup.",
        "Check if the venue offers fitting or lesson services with this hardware.",
      ]}
      methodologyDescription={`We identify ${brandLabel} venues from listing data. Featured venues appear first, followed by highest-rated options.`}
      faqItems={faqItems}
      nearbyTitle={`${brandLabel} in nearby ${stateName} cities`}
      nearbyLinks={nearbyLinks}
      relatedLinks={relatedLinks}
      ctaTitle={`Own a ${brandLabel} venue in ${cityFormatted}?`}
      ctaDescription={`Claim your listing to confirm your ${brandLabel} setup and attract local golfers searching for this hardware.`}
      ctaPrimary={{ label: "Claim Your Listing", href: "/claim" }}
      ctaSecondary={{ label: "Submit New Venue", href: "/submit" }}
      venues={filteredVenues}
      categoryType="hardware"
      categoryValue={brand.toLowerCase()}
      heroSubtitle={`${cityFormatted}, ${stateName}`}
      breadcrumbItems={breadcrumbs}
      showRanking={true}
    />
  );
}
