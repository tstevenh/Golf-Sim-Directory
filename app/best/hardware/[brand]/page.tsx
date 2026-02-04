import { Metadata } from "next";
import { db } from "@/lib/db";
import { BestByPageContent } from "@/components/seo/BestByPageContent";
import { matchesHardware } from "@/lib/best-by";
import { Monitor } from "lucide-react";

interface BestHardwarePageProps {
  params: Promise<{ brand: string }>;
}

export const revalidate = 60;

// Hardware-specific content
const hardwareContent: Record<string, { tagline: string; description: string; icon?: string }> = {
  "trackman": {
    tagline: "Tour-Level Accuracy",
    description: "TrackMan uses dual radar technology to track both club and ball data with exceptional precision. The gold standard used by PGA Tour professionals and top teaching pros worldwide.",
  },
  "foresight": {
    tagline: "Camera-Based Precision",
    description: "Foresight Sports uses high-speed cameras to capture club and ball data at impact. Known for exceptional accuracy in spin rates and launch conditions.",
  },
  "uneekor": {
    tagline: "Overhead Excellence",
    description: "Uneekor's overhead camera systems (QED, EYE XO) provide accurate ball and club tracking with minimal space requirements. Popular for home setups and commercial venues.",
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
  const label = brand.replace(/-/g, " ");
  const content = hardwareContent[brand.toLowerCase()] || { tagline: "Golf Simulator Hardware", description: "" };
  
  return {
    title: `Best ${label} Golf Simulators | GolfSimMap`,
    description: content.description || `Find indoor golf venues using ${label} hardware. Compare ratings, amenities, and booking options.`,
    openGraph: {
      title: `Best ${label} Golf Simulators`,
      description: content.description || `Find indoor golf venues using ${label} hardware.`,
      type: "website",
    },
  };
}

export default async function BestHardwarePage({ params }: BestHardwarePageProps) {
  const { brand } = await params;
  const label = brand.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const brandKey = brand.toLowerCase();

  const venues = await db.venue.findMany({
    where: { status: "active" },
    orderBy: [{ featured: "desc" }, { ratingOverall: "desc" }, { name: "asc" }],
  });

  const filteredVenues = venues.filter((venue) => matchesHardware(venue, label));
  
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

  const relatedLinks = [
    { label: "TrackMan venues", href: "/best/hardware/trackman" },
    { label: "Foresight venues", href: "/best/hardware/foresight" },
    { label: "Full Swing venues", href: "/best/hardware/full-swing" },
    { label: "Uneekor venues", href: "/best/hardware/uneekor" },
    { label: "Camera systems", href: "/best/launch-monitor/photometric_camera" },
    { label: "Radar systems", href: "/best/launch-monitor/radar" },
  ].filter(link => !link.href.includes(brand));

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
      venues={filteredVenues}
      categoryType="hardware"
      categoryValue={brandKey}
      heroSubtitle={content.tagline}
      breadcrumbItems={breadcrumbs}
      showRanking={true}
    />
  );
}
