import { Metadata } from "next";
import { db, venueCardSelect } from "@/lib/db";
import { BestByPageContent } from "@/components/seo/BestByPageContent";
import { matchesVibe } from "@/lib/best-by";
import { getStateDisplayName, getStateAbbrevFromName } from "@/lib/states";
import { getCityBestByLinks } from "@/lib/best-by-config";

interface CityBestVibePageProps {
  params: Promise<{ state: string; city: string; vibe: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export const revalidate = 3600;

// Vibe-specific descriptions for city pages
const vibeDescriptions: Record<string, { tagline: string; description: string }> = {
  "upscale": {
    tagline: "Premium Golf Experiences",
    description: "Luxury golf simulator venues with upscale amenities, premium finishes, and exceptional service. Perfect for client entertainment, special occasions, or when you want the finest simulator experience in town.",
  },
  "casual": {
    tagline: "Relaxed & Laid-Back",
    description: "Casual golf simulator spots perfect for kicking back with friends. No dress code, no pretense — just good golf and good times. Great for beginners and regulars alike looking for a chill atmosphere.",
  },
  "sports-bar": {
    tagline: "Golf Meets Game Day",
    description: "Sports bar venues with golf simulators where you can watch the big game, grab some wings, and squeeze in a few holes. The best of both worlds for sports fans.",
  },
  "sports_bar": {
    tagline: "Golf Meets Game Day",
    description: "Sports bar venues with golf simulators where you can watch the big game, grab some wings, and squeeze in a few holes. The best of both worlds for sports fans.",
  },
  "boutique": {
    tagline: "Intimate & Curated",
    description: "Smaller, boutique golf simulator venues offering personalized attention and a more intimate atmosphere. Often feature unique decor and specialized services for discerning golfers.",
  },
  "lounge": {
    tagline: "Sophisticated Atmosphere",
    description: "Lounge-style golf simulator venues with comfortable seating, craft cocktails, and a refined atmosphere. Perfect for after-work sessions or date nights when you want something a bit more upscale.",
  },
  "entertainment": {
    tagline: "Full Entertainment Experience",
    description: "Entertainment-focused venues where golf simulators are part of a larger experience. Often feature multiple activities, games, and group entertainment options.",
  },
  "family": {
    tagline: "Fun for All Ages",
    description: "Family-oriented golf simulator venues where all ages can enjoy the game together. Safe, welcoming environments with activities for kids and adults.",
  },
};

export async function generateMetadata({ params }: CityBestVibePageProps): Promise<Metadata> {
  const { state, city, vibe } = await params;
  const stateAbbrev = getStateAbbrevFromName(state) || state.toUpperCase();
  const stateName = getStateDisplayName(stateAbbrev);
  const cityFormatted = city.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const vibeLabel = vibe.replace(/_/g, " ").replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const vibeDesc = vibeDescriptions[vibe.toLowerCase()] || { tagline: "", description: "" };

  return {
    title: `Best ${vibeLabel} Golf Simulators in ${cityFormatted}, ${stateName} | GolfSimMap`,
    description: vibeDesc.description || `Find ${vibeLabel} vibe golf simulator venues in ${cityFormatted}, ${stateName}. Compare atmosphere, amenities, and booking options.`,
    openGraph: {
      title: `Best ${vibeLabel} Golf Simulators in ${cityFormatted}`,
      description: vibeDesc.description || `Find ${vibeLabel} vibe golf simulator venues in ${cityFormatted}.`,
      type: "website",
    },
  };
}

export default async function CityBestVibePage({ params, searchParams }: CityBestVibePageProps) {
  const paramsResolved = (await searchParams) || {};
  const page = Math.max(1, Number(paramsResolved.page || 1));
  const { state, city, vibe } = await params;
  const stateAbbrev = getStateAbbrevFromName(state) || state.toUpperCase();
  const stateName = getStateDisplayName(stateAbbrev);
  const cityFormatted = city.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const vibeLabel = vibe.replace(/_/g, " ").replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const vibeKey = vibe.toLowerCase();

  const venues = await db.venue.findMany({
    where: {
      city: { equals: cityFormatted, mode: "insensitive" },
      state: stateAbbrev.toUpperCase(),
      country: "US",
      status: "active",
    },
    orderBy: [{ featured: "desc" }, { ratingOverall: "desc" }, { name: "asc" }],
    select: venueCardSelect,
  });

  const filteredVenues = venues.filter((venue) => matchesVibe(venue, vibe));

  const vibeDesc = vibeDescriptions[vibeKey] || {
    tagline: `${vibeLabel} Atmosphere`,
    description: `Venues with a ${vibeLabel.toLowerCase()} vibe in ${cityFormatted}.`,
  };

  const nearbyCitiesResult = await db.venue.findMany({
    where: {
      state: stateAbbrev.toUpperCase(),
      country: "US",
      status: "active",
      NOT: { city: { equals: cityFormatted, mode: "insensitive" } },
    },
    select: { city: true },
    distinct: ["city"],
    take: 6,
  });

  const nearbyLinks = nearbyCitiesResult.map((c) => ({
    label: `${vibeLabel} in ${c.city}`,
    href: `/venue/us/${state}/${c.city.toLowerCase().replace(/\s+/g, "-")}/best/vibe/${vibe}`,
  }));

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "US", href: "/venue/us" },
    { label: stateName, href: `/venue/us/${state}` },
    { label: cityFormatted, href: `/venue/us/${state}/${city}` },
    { label: vibeLabel },
  ];

  const faqItems = [
    {
      question: `What does "${vibeLabel}" vibe mean in ${cityFormatted}?`,
      answer: vibeDesc.description,
    },
    {
      question: `How many ${vibeLabel.toLowerCase()} venues are in ${cityFormatted}?`,
      answer: `We found ${filteredVenues.length} venues with a ${vibeLabel.toLowerCase()} vibe in ${cityFormatted}. These spots match the atmosphere you're looking for.`,
    },
    {
      question: `Is this vibe right for groups?`,
      answer: "Many ${vibeLabel.toLowerCase()} venues are perfect for groups — check for amenities like food, drinks, and private rooms if you're planning an outing.",
    },
    {
      question: `Can I combine vibe with other filters?`,
      answer: "Yes! Use our search or browse other best-by pages to combine vibe preferences with location and hardware filters.",
    },
  ];

  // Get diverse cross-links to other best-by categories in this city
  const allCategoryLinks = getCityBestByLinks(state, cityFormatted, `vibe-${vibe}`);
  const relatedLinks = [
    { label: `All venues in ${cityFormatted}`, href: `/venue/us/${state}/${city}` },
    // Pick 4 diverse categories: 2 vibes, 1 segment, 1 hardware
    ...allCategoryLinks
      .filter((l) => l.category === "vibe")
      .slice(0, 2),
    ...allCategoryLinks
      .filter((l) => l.category === "segment")
      .slice(0, 1),
    ...allCategoryLinks
      .filter((l) => l.category === "hardware")
      .slice(0, 1),
  ];

  return (
    <BestByPageContent
      title={`Best ${vibeLabel} Golf Simulators in ${cityFormatted}`}
      description={vibeDesc.description}
      guidancePoints={[
        "Check venue photos to get a feel for the actual atmosphere.",
        "Look at amenities (food, drinks, private rooms) to confirm the experience.",
        "Read reviews from other golfers with similar preferences.",
        "Consider combining vibe with location filters for local options.",
      ]}
      methodologyDescription={`We categorize ${cityFormatted} venues by vibe tags based on their atmosphere, amenities, and customer feedback. Results prioritize featured venues, followed by highest-rated options.`}
      faqItems={faqItems}
      nearbyTitle={`${vibeLabel} vibes nearby`}
      nearbyLinks={nearbyLinks}
      relatedLinks={relatedLinks}
      ctaTitle={`Own a ${vibeLabel.toLowerCase()} venue in ${cityFormatted}?`}
      ctaDescription="Claim your listing to update your vibe details and attract local golfers looking for this atmosphere."
      ctaPrimary={{ label: "Claim Your Listing", href: "/claim" }}
      ctaSecondary={{ label: "Submit New Venue", href: "/submit" }}
      venues={filteredVenues}
      categoryType="vibe"
      categoryValue={vibeKey}
      heroSubtitle={vibeDesc.tagline}
      breadcrumbItems={breadcrumbs}
      showRanking={true}
      currentPage={page}
      baseUrl={`/venue/us/${state}/${city}/best/vibe/${vibe}`}
    />
  );
}
