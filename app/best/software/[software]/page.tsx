import { Metadata } from "next";
import { db } from "@/lib/db";
import { BestByPageContent } from "@/components/seo/BestByPageContent";
import { matchesSoftware } from "@/lib/best-by";

interface BestSoftwarePageProps {
  params: Promise<{ software: string }>;
}

export const revalidate = 60;

// Software-specific content
const softwareContent: Record<string, { tagline: string; description: string }> = {
  "e6": {
    tagline: "Premium Course Library",
    description: "E6 Connect offers an extensive library of world-famous courses with stunning graphics. Features include practice modes, challenges, and online play. The industry standard for commercial simulators.",
  },
  "gsp": {
    tagline: "Full Swing Golf Experience",
    description: "GSPro (Golf Simulator Pro) is a community-driven simulator software with an impressive course library and active development. Known for realistic ball physics and extensive customization.",
  },
  "gspro": {
    tagline: "Community-Driven Excellence",
    description: "GSPro offers thousands of courses created by an active community. Features realistic physics, multiple game modes, and regular updates. Popular choice for serious golfers.",
  },
  "tgc": {
    tagline: "The Golf Club Experience",
    description: "The Golf Club (TGC 2019) features a massive library of user-created courses and realistic gameplay. Known for its course designer and online multiplayer features.",
  },
  "wgt": {
    tagline: "World Golf Tour",
    description: "WGT (World Golf Tour) offers competitive online play with official course licenses. Features tournaments, equipment upgrades, and a large player community.",
  },
  "creative-golf": {
    tagline: "Creative Golf 3D",
    description: "Creative Golf 3D offers colorful graphics and family-friendly gameplay. Features mini-golf courses alongside realistic options, making it great for mixed groups.",
  },
  "awesome-golf": {
    tagline: "Awesome Golf Experience",
    description: "Awesome Golf provides a fun, accessible simulator experience with good graphics and straightforward gameplay. Designed for entertainment-focused venues.",
  },
  "trackman-virtual": {
    tagline: "TrackMan Virtual Golf",
    description: "TrackMan's native software offers official course licenses (including St Andrews) and seamless integration with TrackMan hardware for the most accurate data display.",
  },
};

export async function generateMetadata({ params }: BestSoftwarePageProps): Promise<Metadata> {
  const { software } = await params;
  const label = software.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const content = softwareContent[software.toLowerCase()] || { tagline: "", description: "" };
  
  return {
    title: `Best ${label} Golf Simulators | GolfSimMap`,
    description: content.description || `Find venues using ${label} simulator software. Compare amenities, hardware, and booking options.`,
    openGraph: {
      title: `Best ${label} Golf Simulators`,
      description: content.description || `Find venues using ${label} simulator software.`,
      type: "website",
    },
  };
}

export default async function BestSoftwarePage({ params }: BestSoftwarePageProps) {
  const { software } = await params;
  const label = software.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const softwareKey = software.toLowerCase();

  const venues = await db.venue.findMany({
    where: { status: "active" },
    orderBy: [{ featured: "desc" }, { ratingOverall: "desc" }, { name: "asc" }],
  });

  const filteredVenues = venues.filter((venue) => matchesSoftware(venue, label));

  const content = softwareContent[softwareKey] || {
    tagline: `${label} Simulator Software`,
    description: `Browse venues that use ${label} simulator software. Compare venue amenities, hardware, and booking options.`,
  };

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Best By", href: "/best" },
    { label: "Software", href: "/best/software" },
    { label: label },
  ];

  const faqItems = [
    {
      question: `What is ${label} software?`,
      answer: content.description,
    },
    {
      question: `What makes ${label} different from other simulator software?`,
      answer: "Each simulator software has unique features, course libraries, and graphics quality. The best choice depends on your priorities — course variety, graphics quality, practice features, or online play.",
    },
    {
      question: "Is software data always available?",
      answer: "Software details may be missing for some venues if not provided. Verified owners can add or update this information when they claim their listing.",
    },
    {
      question: "Can I request specific software at a venue?",
      answer: "Some venues offer multiple software options. Contact the venue directly to ask about software choices or special requests.",
    },
  ];

  const relatedLinks = [
    { label: "E6 Connect venues", href: "/best/software/e6" },
    { label: "GSPro venues", href: "/best/software/gspro" },
    { label: "TGC venues", href: "/best/software/tgc" },
    { label: "TrackMan hardware", href: "/best/hardware/trackman" },
    { label: "Foresight hardware", href: "/best/hardware/foresight" },
    { label: "Serious practice", href: "/best/serious-practice" },
  ].filter(link => !link.href.includes(software));

  return (
    <BestByPageContent
      title={`Best ${label} Golf Simulators`}
      description={content.description}
      guidancePoints={[
        "Confirm software details on the venue page when available.",
        "Consider what features matter most — course variety, graphics, or practice tools.",
        "Some venues offer multiple software options — ask when booking.",
        "Use city filters to find this software near you.",
      ]}
      methodologyDescription={`We identify venues using ${label} software based on their listings and verified claims. Results prioritize featured venues, then sort by rating and data completeness.`}
      faqItems={faqItems}
      relatedLinks={relatedLinks}
      ctaTitle={`Own a venue with ${label}?`}
      ctaDescription="Claim your listing to verify software details and appear in our curated collections."
      ctaPrimary={{ label: "Claim Your Listing", href: "/claim" }}
      ctaSecondary={{ label: "Submit New Venue", href: "/submit" }}
      venues={filteredVenues}
      categoryType="software"
      categoryValue={softwareKey}
      heroSubtitle={content.tagline}
      breadcrumbItems={breadcrumbs}
      showRanking={true}
    />
  );
}
