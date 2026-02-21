import { Metadata } from "next";
import { supabase, VENUE_CARD_FIELDS } from "@/lib/supabase";
import type { LaunchMonitorType } from "@/lib/supabase";
import type { VenueListItem } from "@/types";
import { BestByPageContent } from "@/components/seo/BestByPageContent";
import { getStaticRelatedLinks } from "@/lib/category-config.generated";

interface BestLaunchMonitorPageProps {
  params: Promise<{ type: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export const revalidate = 15552000;

// Pre-render all launch monitor pages at build time
export async function generateStaticParams() {
  return [
    { type: "radar" },
    { type: "photometric-camera" },
    { type: "hybrid" },
  ];
}

// Launch monitor type-specific content
const launchMonitorContent: Record<string, { tagline: string; description: string }> = {
  radar: {
    tagline: "Doppler Radar Technology",
    description: "Radar launch monitors like TrackMan use Doppler tech to track ball flight from impact to landing. The gold standard for ball flight analysis on tour.",
  },
  photometric_camera: {
    tagline: "High-Speed Camera Systems",
    description: "Camera-based systems capture high-speed images at impact for precise club and ball data. Excel at face angle, path, and attack angle indoors.",
  },
  hybrid: {
    tagline: "Best of Both Worlds",
    description: "Hybrid systems combine radar and camera tech for the most complete data. Measure ball flight and club impact simultaneously for top accuracy.",
  },
  overhead_camera: {
    tagline: "Above-The-Action Tracking",
    description: "Overhead cameras mount above the hitting area to track shots from above. Common at entertainment venues, balancing accuracy with high throughput.",
  },
  floor_camera: {
    tagline: "Ground-Level Precision",
    description: "Floor-mounted cameras capture impact from below, often paired with other sensors. Excellent club data makes them popular in fitting centers.",
  },
  infrared_optical: {
    tagline: "Light Sensor Technology",
    description: "Infrared optical systems use light sensors to track ball and club movement. Good accuracy at a lower price, popular for home setups and budget venues.",
  },
  unknown: {
    tagline: "Launch Monitor Technology",
    description: "Venues with launch monitors where the specific technology isn't listed. Contact the venue directly for details about their tracking system.",
  },
};

export async function generateMetadata({ params }: BestLaunchMonitorPageProps): Promise<Metadata> {
  const { type } = await params;
  const normalizedType = type.toLowerCase().replace(/-/g, "_");
  const label = type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const content = launchMonitorContent[normalizedType] || { tagline: "", description: "" };

  return {
    title: `Best ${label} Launch Monitor Venues — Compare & Book`,
    description: content.description || `Find golf simulator venues using ${label.toLowerCase()} launch monitors. Compare accuracy, amenities, and booking options.`,
    alternates: {
      canonical: `https://golfsimmap.com/best/launch-monitor/${type}`,
    },
    openGraph: {
      title: `Best ${label} Launch Monitor Venues — Compare & Book`,
      description: content.description || `Find golf simulator venues using ${label.toLowerCase()} launch monitors.`,
      type: "website",
      url: `https://golfsimmap.com/best/launch-monitor/${type}`,
    },
  };
}

export default async function BestLaunchMonitorPage({ params, searchParams }: BestLaunchMonitorPageProps) {
  const paramsResolved = (await searchParams) || {};
  const page = Math.max(1, Number(paramsResolved.page || 1));
  const pageSize = 12;
  const { type } = await params;
  const normalizedType = type.toLowerCase().replace(/-/g, "_");
  const label = type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const typeKey = normalizedType;
  const skip = (page - 1) * pageSize;
  const validTypes = new Set<LaunchMonitorType>(["radar", "photometric_camera", "hybrid", "unknown"]);
  const isValidType = validTypes.has(typeKey as LaunchMonitorType);

  let totalVenues = 0;
  let venues: VenueListItem[] = [];

  if (isValidType) {
    const [{ count }, { data: venueRows }] = await Promise.all([
      supabase
        .from("venues")
        .select("id", { count: "exact", head: true })
        .eq("status", "active")
        .eq("launchMonitorType", typeKey as LaunchMonitorType),
      supabase
        .from("venues")
        .select(VENUE_CARD_FIELDS)
        .eq("status", "active")
        .eq("launchMonitorType", typeKey as LaunchMonitorType)
        .order("featured", { ascending: false })
        .order("ratingOverall", { ascending: false, nullsFirst: false })
        .order("name", { ascending: true })
        .range(skip, skip + pageSize - 1),
    ]);
    totalVenues = count ?? 0;
    venues = venueRows || [];
  }

  const content = launchMonitorContent[typeKey] || {
    tagline: `${label} Technology`,
    description: `Venues using ${label} launch monitor technology. These systems track your shots and provide data to improve your game.`,
  };

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Best By", href: "/best" },
    { label: "Launch Monitor", href: "/best/launch-monitor" },
    { label: label },
  ];

  const faqItems = [
    {
      question: `What is a ${label.toLowerCase()} launch monitor?`,
      answer: content.description,
    },
    {
      question: `How accurate are ${label.toLowerCase()} systems?`,
      answer: `${label} systems are highly accurate within their measurement domains. Radar excels at ball flight data, while camera systems excel at club data. The best choice depends on what metrics matter most for your practice.`,
    },
    {
      question: "Does launch monitor type affect my practice?",
      answer: "Yes. Radar systems are best for full shots and ball flight analysis. Camera systems provide better club data (face angle, path, attack angle). If you're working on swing mechanics, camera-based data often provides more actionable feedback.",
    },
    {
      question: "Do all bays at a venue use the same launch monitor?",
      answer: "Not always. Some venues mix hardware across bays or have premium bays with different equipment. Always confirm with the venue if launch monitor type is important to you.",
    },
  ];

  // Related categories - static, no DB query
  const relatedLinks = [
    { label: "Browse all categories", href: "/best" },
    ...getStaticRelatedLinks("launch-monitor", typeKey, 6),
  ];

  return (
    <BestByPageContent
      title={`Best ${label} Launch Monitor Venues`}
      description={content.description}
      guidancePoints={[
        "Check if all bays use the same launch monitor — some venues mix hardware.",
        "Camera systems shine for club path and face angle. Radar wins on ball flight.",
        "Consider what data matters most for your practice goals.",
        "If you're serious about data, ask about software integration before booking.",
      ]}
      methodologyDescription={`We filter venues by launch monitor type based on their equipment listings. Results prioritize featured venues, then sort by rating and data completeness.`}
      faqItems={faqItems}
      relatedLinks={relatedLinks}
      ctaTitle={`Own a venue with ${label.toLowerCase()} technology?`}
      ctaDescription="Claim your listing to confirm your launch monitor setup and attract golfers who care about accurate data."
      ctaPrimary={{ label: "Claim Your Listing", href: "/claim" }}
      ctaSecondary={{ label: "Submit New Venue", href: "/submit" }}
      venues={venues}
      totalVenues={totalVenues}
      categoryType="launch-monitor"
      categoryValue={typeKey}
      heroSubtitle={content.tagline}
      breadcrumbItems={breadcrumbs}
      showRanking={true}
      currentPage={page}
      pageSize={pageSize}
      baseUrl={`/best/launch-monitor/${type}`}
    />
  );
}
