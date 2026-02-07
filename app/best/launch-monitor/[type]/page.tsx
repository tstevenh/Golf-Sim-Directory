import { Metadata } from "next";
import { LaunchMonitorType } from "@prisma/client";
import { db, venueCardSelect } from "@/lib/db";
import { BestByPageContent } from "@/components/seo/BestByPageContent";
import { getStaticRelatedLinks } from "@/lib/category-config.generated";

interface BestLaunchMonitorPageProps {
  params: Promise<{ type: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export const revalidate = 3600;

// Pre-render all launch monitor pages at build time
export async function generateStaticParams() {
  return [
    { type: "radar" },
    { type: "photometric_camera" },
    { type: "hybrid" },
  ];
}

// Launch monitor type-specific content
const launchMonitorContent: Record<string, { tagline: string; description: string }> = {
  radar: {
    tagline: "Doppler Radar Technology",
    description: "Radar systems like TrackMan use Doppler radar to track ball flight from impact through landing. Best for full-shot data and outdoor accuracy. The gold standard for ball flight analysis and the technology used by PGA Tour professionals.",
  },
  photometric_camera: {
    tagline: "High-Speed Camera Systems",
    description: "Camera-based systems capture high-speed images at impact, measuring club and ball data with exceptional precision. They excel at club data (face angle, path, attack angle) and work well indoors where radar signals may struggle.",
  },
  hybrid: {
    tagline: "Best of Both Worlds",
    description: "Hybrid systems combine radar and camera technology for comprehensive data capture. These typically provide the most accurate and complete data sets, measuring both ball flight (radar) and club impact (camera) simultaneously.",
  },
  overhead_camera: {
    tagline: "Above-The-Action Tracking",
    description: "Overhead camera systems mount above the hitting area and track the ball from above. Common in entertainment venues like TopGolf, these systems balance accuracy with throughput for high-volume facilities.",
  },
  floor_camera: {
    tagline: "Ground-Level Precision",
    description: "Floor-mounted cameras capture impact from below or at ground level, often paired with other sensors. These systems can provide excellent club data and are popular in fitting centers.",
  },
  infrared_optical: {
    tagline: "Light Sensor Technology",
    description: "Infrared optical systems use light sensors to track ball and club movement through the hitting zone. These offer good accuracy at a lower price point than radar systems, making them popular for home setups and budget-conscious venues.",
  },
  unknown: {
    tagline: "Launch Monitor Technology",
    description: "Venues with launch monitors where the specific technology type isn't specified. These may use various systems — contact the venue for details about their equipment.",
  },
};

export async function generateMetadata({ params }: BestLaunchMonitorPageProps): Promise<Metadata> {
  const { type } = await params;
  const label = type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const content = launchMonitorContent[type.toLowerCase()] || { tagline: "", description: "" };
  
  return {
    title: `${label} Launch Monitor Venues — Find & Compare`,
    description: content.description || `Find golf simulator venues using ${label} launch monitors. Compare accuracy, amenities, and booking options.`,
    alternates: {
      canonical: `https://golfsimmap.com/best/launch-monitor/${type}`,
    },
    openGraph: {
      title: `Best ${label} Launch Monitor Venues`,
      description: content.description || `Find golf simulator venues using ${label} launch monitors.`,
      type: "website",
      url: `https://golfsimmap.com/best/launch-monitor/${type}`,
    },
  };
}

export default async function BestLaunchMonitorPage({ params, searchParams }: BestLaunchMonitorPageProps) {
  const paramsResolved = (await searchParams) || {};
  const page = Math.max(1, Number(paramsResolved.page || 1));
  const { type } = await params;
  const label = type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const typeKey = type.toLowerCase();

  const venues = await db.venue.findMany({
    where: { status: "active", launchMonitorType: type as unknown as LaunchMonitorType },
    orderBy: [{ featured: "desc" }, { ratingOverall: "desc" }, { name: "asc" }],
    select: venueCardSelect,
  });

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
    ...getStaticRelatedLinks("launch-monitor", type, 6),
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
      categoryType="launch-monitor"
      categoryValue={typeKey}
      heroSubtitle={content.tagline}
      breadcrumbItems={breadcrumbs}
      showRanking={true}
      currentPage={page}
      baseUrl={`/best/launch-monitor/${type}`}
    />
  );
}
