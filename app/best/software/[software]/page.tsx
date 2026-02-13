import { Metadata } from "next";
import { supabase, VENUE_CARD_FIELDS } from "@/lib/supabase";
import type { VenueListItem } from "@/types";
import { BestByPageContent } from "@/components/seo/BestByPageContent";
import { getStaticRelatedLinks } from "@/lib/category-config.generated";
import { normalizeSoftwareSlug } from "@/lib/software-slugs";

interface BestSoftwarePageProps {
  params: Promise<{ software: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export const revalidate = 15552000;

// Pre-render all software pages at build time
export async function generateStaticParams() {
  return [
    { software: "e6" },
    { software: "gspro" },
    { software: "tgc" },
    { software: "wgt" },
    { software: "creative-golf" },
    { software: "awesome-golf" },
    { software: "trackman-virtual" },
  ];
}

// Software-specific content
const softwareContent: Record<string, { tagline: string; description: string }> = {
  "e6": {
    tagline: "Premium Course Library",
    description: "E6 Connect features world-famous courses with stunning graphics, practice modes, challenges, and online play. The industry standard for simulators.",
  },
  "gsp": {
    tagline: "Full Swing Golf Experience",
    description: "GSPro is a community-driven simulator with an impressive course library and active development. Known for realistic physics and deep customization.",
  },
  "gspro": {
    tagline: "Community-Driven Excellence",
    description: "GSPro offers thousands of community-created courses, realistic physics, multiple game modes, and regular updates. A top choice for serious golfers.",
  },
  "tgc": {
    tagline: "The Golf Club Experience",
    description: "TGC 2019 features a massive library of user-created courses and realistic gameplay. Known for its course designer and online multiplayer.",
  },
  "wgt": {
    tagline: "World Golf Tour",
    description: "WGT (World Golf Tour) offers competitive online play with official course licenses. Features tournaments, equipment upgrades, and a large player community.",
  },
  "creative-golf": {
    tagline: "Creative Golf 3D",
    description: "Creative Golf 3D offers colorful graphics and family-friendly gameplay. Mini-golf and realistic courses make it great for mixed groups.",
  },
  "awesome-golf": {
    tagline: "Awesome Golf Experience",
    description: "Awesome Golf provides a fun, accessible simulator experience with good graphics and straightforward gameplay. Designed for entertainment-focused venues.",
  },
  "trackman-virtual": {
    tagline: "TrackMan Virtual Golf",
    description: "TrackMan's native software with official course licenses including St Andrews. Seamless hardware integration for the most accurate data.",
  },
};

export async function generateMetadata({ params }: BestSoftwarePageProps): Promise<Metadata> {
  const { software } = await params;
  const label = software.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const content = softwareContent[software.toLowerCase()] || { tagline: "", description: "" };

  return {
    title: `Best ${label} Simulator Venues — Play ${label} Near You`,
    description: content.description || `Find venues using ${label} simulator software. Compare amenities, hardware, and booking options.`,
    alternates: {
      canonical: `https://golfsimmap.com/best/software/${software}`,
    },
    openGraph: {
      title: `Best ${label} Simulator Venues — Play ${label} Near You`,
      description: content.description || `Find venues using ${label} simulator software.`,
      type: "website",
      url: `https://golfsimmap.com/best/software/${software}`,
    },
  };
}

export default async function BestSoftwarePage({ params, searchParams }: BestSoftwarePageProps) {
  const paramsResolved = (await searchParams) || {};
  const page = Math.max(1, Number(paramsResolved.page || 1));
  const pageSize = 12;
  const { software } = await params;
  const label = software.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const softwareKey = software.toLowerCase();
  const softwareSlug = normalizeSoftwareSlug(softwareKey);
  const skip = (page - 1) * pageSize;

  let totalVenues = 0;
  let venues: VenueListItem[] = [];

  if (softwareSlug) {
    const [{ count }, { data: venueRows }] = await Promise.all([
      supabase
        .from("venues")
        .select("*", { count: "exact", head: true })
        .eq("status", "active")
        .contains("softwareSlugs", [softwareSlug]),
      supabase
        .from("venues")
        .select(VENUE_CARD_FIELDS)
        .eq("status", "active")
        .contains("softwareSlugs", [softwareSlug])
        .order("featured", { ascending: false })
        .order("ratingOverall", { ascending: false, nullsFirst: false })
        .order("name", { ascending: true })
        .range(skip, skip + pageSize - 1),
    ]);
    totalVenues = count ?? 0;
    venues = venueRows || [];
  }

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

  // Related categories - static, no DB query
  const relatedLinks = [
    { label: "Browse all categories", href: "/best" },
    ...getStaticRelatedLinks("software", software, 6),
  ];

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
      venues={venues}
      totalVenues={totalVenues}
      categoryType="software"
      categoryValue={softwareSlug || softwareKey}
      heroSubtitle={content.tagline}
      breadcrumbItems={breadcrumbs}
      showRanking={true}
      currentPage={page}
      pageSize={pageSize}
      baseUrl={`/best/software/${software}`}
    />
  );
}
