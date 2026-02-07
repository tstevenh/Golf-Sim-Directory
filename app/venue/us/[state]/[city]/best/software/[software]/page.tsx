import { Metadata } from "next";
import { db } from "@/lib/db";
import { BestByPageContent } from "@/components/seo/BestByPageContent";
import { matchesSoftware } from "@/lib/best-by";
import { getStateDisplayName, getStateAbbrevFromName } from "@/lib/states";
import { getStaticRelatedLinks } from "@/lib/category-config.generated";

interface CityBestSoftwarePageProps {
  params: Promise<{ state: string; city: string; software: string }>;
}

export const revalidate = 60;

// Software-specific content with unique copy
const softwareContent: Record<string, { tagline: string; shortDesc: string; longDesc: string }> = {
  "gspro": {
    tagline: "Community-Driven Excellence",
    shortDesc: "GSPro simulation software",
    longDesc: "GSPro has become the favorite simulation software for serious indoor golfers. The course library rivals anything else on the market, graphics are continuously improving, and the price point delivers incredible value. Venues running GSPro attract players who care about course accuracy and realistic gameplay. What sets GSPro apart is the community-driven development and course creation. You'll find virtual versions of famous tracks that play remarkably close to reality. Competition features, practice modes, and multiplayer options are all strong.",
  },
  "gsp": {
    tagline: "Full Swing Experience",
    shortDesc: "GSPro simulation software",
    longDesc: "GSPro has become the favorite simulation software for serious indoor golfers. The course library rivals anything else on the market, graphics are continuously improving, and the price point delivers incredible value. Venues running GSPro attract players who care about course accuracy and realistic gameplay. What sets GSPro apart is the community-driven development and course creation. You'll find virtual versions of famous tracks that play remarkably close to reality.",
  },
  "e6": {
    tagline: "Premium Polish",
    shortDesc: "E6 Connect simulation software",
    longDesc: "E6 Connect is the polished, premium option in golf simulation software. The graphics are stunning, the course library is well-curated, and the overall experience feels refined. Commercial venues often choose E6 for its professional presentation and reliable performance. Venues running E6 typically invest in the complete experience—quality projectors, proper screen materials, and maintained equipment. The software integrates smoothly with most launch monitors and offers both entertainment and practice modes.",
  },
  "tgc": {
    tagline: "Massive Course Library",
    shortDesc: "TGC 2019 simulation software",
    longDesc: "The Golf Club 2019 offers an enormous course library and satisfying gameplay, making it a popular choice for entertainment-focused venues. While graphics and interface have aged somewhat, the course count and community creations are unmatched. TGC venues tend to prioritize fun over data. The software includes excellent multiplayer options, course designer tools, and social features. Players who love course variety gravitate toward TGC—you can play virtually any layout that exists in the real world.",
  },
  "wgt": {
    tagline: "Competitive Online Play",
    shortDesc: "WGT simulation software",
    longDesc: "World Golf Tour (WGT) brings competitive online play to simulator venues. With official course licenses and a massive player community, WGT excels at tournaments and head-to-head competition. The software focuses on the competitive experience with ranked play, equipment upgrades, and online tournaments. Venues running WGT attract players who enjoy the gaming and competition aspects of simulator golf.",
  },
  "creative-golf": {
    tagline: "Family-Friendly Fun",
    shortDesc: "Creative Golf 3D software",
    longDesc: "Creative Golf 3D offers colorful graphics and family-friendly gameplay that makes it great for mixed groups. Alongside realistic course options, you'll find mini-golf and fantasy layouts that keep non-golfers entertained. These venues prioritize fun and accessibility over serious practice. Great choice for birthday parties, family outings, and groups with varying skill levels.",
  },
  "awesome-golf": {
    tagline: "Accessible Entertainment",
    shortDesc: "Awesome Golf software",
    longDesc: "Awesome Golf provides a fun, accessible simulator experience designed for entertainment-focused venues. The graphics are good, gameplay is straightforward, and the learning curve is gentle. These venues focus on making golf fun rather than providing tour-level data. Perfect for social outings where the experience matters more than the stats.",
  },
  "trackman-virtual": {
    tagline: "Tour-Level Integration",
    shortDesc: "TrackMan Virtual Golf software",
    longDesc: "TrackMan's native software offers seamless integration with TrackMan hardware for the most accurate data display in the industry. Official course licenses include iconic layouts like St Andrews. For players who demand the best data alongside premium course graphics, TrackMan Virtual Golf delivers. The software maximizes what TrackMan hardware can offer.",
  },
  "fsx": {
    tagline: "Foresight Integration",
    shortDesc: "FSX Play simulation software",
    longDesc: "FSX Play is Foresight Sports' native simulation platform, designed to maximize the capabilities of GCQuad and GC3 launch monitors. The graphics are excellent, the course library is growing, and the data integration is seamless. Venues running FSX typically have invested in the complete Foresight ecosystem, delivering a premium experience for serious golfers.",
  },
};

export async function generateMetadata({ params }: CityBestSoftwarePageProps): Promise<Metadata> {
  const { state, city, software } = await params;
  const stateAbbrev = getStateAbbrevFromName(state) || state.toUpperCase();
  const stateName = getStateDisplayName(stateAbbrev);
  const cityFormatted = city.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const softwareLabel = software.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const content = softwareContent[software.toLowerCase()] || { shortDesc: "this simulation software" };

  return {
    title: `${softwareLabel} Golf Simulators in ${cityFormatted}, ${stateName} `,
    description: `Find golf simulator venues running ${content.shortDesc} in ${cityFormatted}. Compare courses, features, and book your session.`,
    alternates: {
      canonical: `https://golfsimmap.com/venue/us/${state}/${city}/best/software/${software}`,
    },
    openGraph: {
      title: `${softwareLabel} Simulators in ${cityFormatted}`,
      description: `Find venues with ${content.shortDesc} in ${cityFormatted}, ${stateName}.`,
      type: "website",
    },
  };
}

export default async function CityBestSoftwarePage({ params }: CityBestSoftwarePageProps) {
  const { state, city, software } = await params;
  const stateAbbrev = getStateAbbrevFromName(state) || state.toUpperCase();
  const stateName = getStateDisplayName(stateAbbrev);
  const cityFormatted = city.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const softwareLabel = software.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const softwareKey = software.toLowerCase();

  const content = softwareContent[softwareKey] || {
    tagline: `${softwareLabel} Software`,
    shortDesc: "this simulation software",
    longDesc: `Browse venues that use ${softwareLabel} simulator software. Compare venue amenities, hardware, and booking options.`,
  };

  const venues = await db.venue.findMany({
    where: {
      city: { equals: cityFormatted, mode: "insensitive" },
      state: stateAbbrev.toUpperCase(),
      country: "US",
      status: "active",
    },
    orderBy: [{ featured: "desc" }, { ratingOverall: "desc" }, { name: "asc" }],
  });

  const filteredVenues = venues.filter((venue) => matchesSoftware(venue, softwareLabel));

  // Get nearby cities with this software
  const allVenuesInState = await db.venue.findMany({
    where: {
      state: stateAbbrev.toUpperCase(),
      country: "US",
      status: "active",
      NOT: { city: { equals: cityFormatted, mode: "insensitive" } },
    },
    orderBy: { city: "asc" },
  });

  // Filter for venues with this software and get unique cities
  const citiesWithSoftware = new Set<string>();
  allVenuesInState.forEach((venue) => {
    if (matchesSoftware(venue, softwareLabel) && citiesWithSoftware.size < 6) {
      citiesWithSoftware.add(venue.city);
    }
  });

  const nearbyLinks = Array.from(citiesWithSoftware).map((cityName) => ({
    label: `${softwareLabel} in ${cityName}`,
    href: `/venue/us/${state}/${cityName.toLowerCase().replace(/\s+/g, "-")}/best/software/${software}`,
  }));

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "US", href: "/venue/us" },
    { label: stateName, href: `/venue/us/${state}` },
    { label: cityFormatted, href: `/venue/us/${state}/${city}` },
    { label: `${softwareLabel}` },
  ];

  const faqItems = [
    {
      question: `How many ${softwareLabel} venues are in ${cityFormatted}?`,
      answer: `We found ${filteredVenues.length} venues running ${content.shortDesc} in ${cityFormatted}, ${stateName}. Software availability may vary by bay—confirm when booking.`,
    },
    {
      question: `What is ${softwareLabel}?`,
      answer: content.longDesc,
    },
    {
      question: `What courses can I play on ${softwareLabel}?`,
      answer: "Course libraries vary by software. Ask the venue about their available courses—some offer hundreds of options including famous real-world tracks and fantasy layouts.",
    },
    {
      question: "Can venues switch software between bays?",
      answer: "Some venues offer multiple software options across different bays or can switch software on request. Contact the venue directly to ask about your preferences.",
    },
  ];

  const relatedLinks = [
    { label: `All venues in ${cityFormatted}`, href: `/venue/us/${state}/${city}` },
    { label: `${softwareLabel} venues (national)`, href: `/best/software/${software}` },
    { label: `All venues in ${stateName}`, href: `/venue/us/${state}` },
    ...getStaticRelatedLinks("software", software, 4),
  ];

  return (
    <BestByPageContent
      title={`${softwareLabel} Golf Simulators in ${cityFormatted}`}
      description={`${content.longDesc}\n\nDiscover ${filteredVenues.length} venues in ${cityFormatted}, ${stateName} running ${content.shortDesc}.`}
      guidancePoints={[
        "Ask about the course library—availability varies by venue and licensing.",
        "Some venues offer multiple software options; request your preference when booking.",
        "Consider what matters most: graphics, course variety, or practice features.",
        "Software often pairs with specific hardware—check the launch monitor too.",
      ]}
      methodologyDescription={`We identify venues using ${softwareLabel} software based on their listings and verified claims. Results prioritize featured venues, then sort by rating and data completeness.`}
      faqItems={faqItems}
      nearbyTitle={`${softwareLabel} in nearby ${stateName} cities`}
      nearbyLinks={nearbyLinks}
      relatedLinks={relatedLinks}
      ctaTitle={`Own a venue with ${softwareLabel} in ${cityFormatted}?`}
      ctaDescription={`Claim your listing to verify software details and attract golfers searching for ${content.shortDesc}.`}
      ctaPrimary={{ label: "Claim Your Listing", href: "/claim" }}
      ctaSecondary={{ label: "Submit New Venue", href: "/submit" }}
      venues={filteredVenues}
      categoryType="software"
      categoryValue={softwareKey}
      heroSubtitle={`${cityFormatted}, ${stateName}`}
      breadcrumbItems={breadcrumbs}
      showRanking={true}
    />
  );
}
