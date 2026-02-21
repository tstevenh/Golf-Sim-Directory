import { Metadata } from "next";
import { supabase, VENUE_CARD_FIELDS } from "@/lib/supabase";
import type { VenueListItem } from "@/types";
import { BestByPageContent } from "@/components/seo/BestByPageContent";
import { getStaticRelatedLinks } from "@/lib/category-config.generated";
import { normalizeHardwareBrand } from "@/lib/hardware-brands";

interface BestHardwarePageProps {
  params: Promise<{ brand: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export const revalidate = 15552000;

// Pre-render all hardware pages at build time
export async function generateStaticParams() {
  return [
    { brand: "trackman" },
    { brand: "foresight" },
    { brand: "uneekor" },
    { brand: "full-swing" },
    { brand: "golfzon" },
    { brand: "aboutgolf" },
    { brand: "skytrak" },
    { brand: "gc-quad" },
    { brand: "garmin" },
  ];
}

// Hardware-specific content
const hardwareContent: Record<string, { tagline: string; description: string; icon?: string }> = {
  "trackman": {
    tagline: "Tour-Level Accuracy",
    description: "TrackMan uses dual radar to track club and ball data with exceptional precision. The gold standard used by PGA Tour pros and top instructors.",
  },
  "foresight": {
    tagline: "Camera-Based Precision",
    description: "Foresight Sports uses high-speed cameras to capture club and ball data at impact. Known for exceptional accuracy in spin rates and launch conditions.",
  },
  "uneekor": {
    tagline: "Overhead Excellence",
    description: "Uneekor overhead cameras (QED, EYE XO) deliver accurate ball and club tracking with minimal space needs. Popular for home and commercial setups.",
  },
  "full-swing": {
    tagline: "Immersive Entertainment",
    description: "Full Swing simulators combine accurate ball tracking with stunning graphics. The choice of Tiger Woods and many premium entertainment venues.",
  },
  "golfzon": {
    tagline: "Interactive Platform",
    description: "Golfzon features a moving floor platform that simulates slopes and lies. Combines entertainment with training features.",
  },
  "aboutgolf": {
    tagline: "Premium Simulation",
    description: "AboutGolf simulators offer high-definition graphics and accurate tracking. A favorite at country clubs and upscale venues.",
  },
  "skytrak": {
    tagline: "Accessible Accuracy",
    description: "SkyTrak provides photometric ball tracking at an accessible price point. Popular for home setups and smaller commercial venues.",
  },
  "flightscope": {
    tagline: "Radar Technology",
    description: "FlightScope uses 3D Doppler radar to track ball flight with exceptional accuracy. Used by club fitters and teaching professionals.",
  },
};

export async function generateMetadata({ params }: BestHardwarePageProps): Promise<Metadata> {
  const { brand } = await params;
  const label = brand.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const content = hardwareContent[brand.toLowerCase()] || { tagline: "Golf Simulator Hardware", description: "" };

  return {
    title: `Best ${label} Simulator Venues — Find ${label} Near You`,
    description: content.description || `Find indoor golf venues using ${label} hardware. Compare ratings, amenities, and booking options.`,
    alternates: {
      canonical: `https://golfsimmap.com/best/hardware/${brand}`,
    },
    openGraph: {
      title: `Best ${label} Simulator Venues — Find ${label} Near You`,
      description: content.description || `Find indoor golf venues using ${label} hardware.`,
      type: "website",
      url: `https://golfsimmap.com/best/hardware/${brand}`,
    },
  };
}

export default async function BestHardwarePage({ params, searchParams }: BestHardwarePageProps) {
  const paramsResolved = (await searchParams) || {};
  const page = Math.max(1, Number(paramsResolved.page || 1));
  const pageSize = 12;
  const { brand } = await params;
  const label = brand.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const brandKey = brand.toLowerCase();
  const skip = (page - 1) * pageSize;
  const normalizedBrand = normalizeHardwareBrand(label);

  let totalVenues = 0;
  let venues: VenueListItem[] = [];

  if (normalizedBrand) {
    const [{ count }, { data: venueRows }] = await Promise.all([
      supabase
        .from("venues")
        .select("id", { count: "exact", head: true })
        .eq("status", "active")
        .contains("hardwareBrands", [normalizedBrand]),
      supabase
        .from("venues")
        .select(VENUE_CARD_FIELDS)
        .eq("status", "active")
        .contains("hardwareBrands", [normalizedBrand])
        .order("featured", { ascending: false })
        .order("ratingOverall", { ascending: false, nullsFirst: false })
        .order("name", { ascending: true })
        .range(skip, skip + pageSize - 1),
    ]);
    totalVenues = count ?? 0;
    venues = venueRows || [];
  }
  
  const content = hardwareContent[brandKey] || {
    tagline: `${label} Golf Simulators`,
    description: `Find indoor golf venues using ${label} hardware. Compare ratings, amenities, and booking options.`,
  };

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Best By", href: "/best" },
    { label: "Hardware", href: "/best/hardware" },
    { label: label },
  ];

  const faqItems = [
    {
      question: `Why choose ${label} hardware?`,
      answer: content.description || `${label} systems are known for accurate shot tracking and detailed data. Check each listing for the exact model and setup details.`,
    },
    {
      question: `How accurate is ${label} compared to other systems?`,
      answer: `${label} is considered highly accurate for ball tracking data. Different systems excel in different areas — radar-based systems (like TrackMan) are great for ball flight, while camera-based systems excel at club data.`,
    },
    {
      question: "Do all bays at a venue use the same hardware?",
      answer: "Some venues mix systems across bays or VIP rooms. The listing notes provide specifics when available. Always confirm with the venue if hardware matters to you.",
    },
    {
      question: "Can I filter by hardware in search?",
      answer: "Yes! Use the search filters to select a specific simulator brand. You can also combine hardware filters with location and amenity filters.",
    },
  ];

  // Related categories - static, no DB query
  const relatedLinks = [
    { label: "All technology", href: "/best/hardware/" },
    ...getStaticRelatedLinks("hardware", brand, 6),
  ];

  return (
    <BestByPageContent
      title={`Best ${label} Golf Simulators`}
      description={content.description}
      guidancePoints={[
        `Look for the "${label}" badge on venue cards to confirm hardware.`,
        "Check the venue detail page for specific model and software information.",
        "Compare launch monitor types to understand data accuracy differences.",
        "Use city filters to find venues near you with this hardware.",
      ]}
      methodologyDescription={`We identify venues using ${label} hardware based on their equipment listings and verified claims. Results prioritize featured venues, then sort by rating and listing completeness.`}
      faqItems={faqItems}
      relatedLinks={relatedLinks}
      ctaTitle={`Own a ${label} venue?`}
      ctaDescription={`If your venue uses ${label} hardware, claim your listing to verify details and appear in our curated collections.`}
      ctaPrimary={{ label: "Claim Your Listing", href: "/claim" }}
      ctaSecondary={{ label: "Submit New Venue", href: "/submit" }}
      venues={venues}
      totalVenues={totalVenues}
      categoryType="hardware"
      categoryValue={brandKey}
      heroSubtitle={content.tagline}
      breadcrumbItems={breadcrumbs}
      showRanking={true}
      currentPage={page}
      pageSize={pageSize}
      baseUrl={`/best/hardware/${brand}`}
    />
  );
}
