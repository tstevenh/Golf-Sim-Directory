import { Metadata } from "next";
import { db, venueCardSelect } from "@/lib/db";
import { BestByPageContent } from "@/components/seo/BestByPageContent";
import { matchesAmenity } from "@/lib/best-by";
import { VIBE_CATEGORIES, SEGMENT_CATEGORIES, HARDWARE_CATEGORIES } from "@/lib/best-by-config";

interface BestAmenityPageProps {
  params: Promise<{ amenity: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export const revalidate = 3600;

// Amenity-specific content
const amenityContent: Record<string, { tagline: string; description: string }> = {
  "private-rooms": {
    tagline: "Exclusive Spaces",
    description: "Venues with private rooms for groups, parties, and corporate events. Perfect when you want dedicated space for your group without distractions.",
  },
  "private_rooms": {
    tagline: "Exclusive Spaces",
    description: "Venues with private rooms for groups, parties, and corporate events. Perfect when you want dedicated space for your group without distractions.",
  },
  "food": {
    tagline: "Full Food Service",
    description: "Golf simulator venues with full food menus. From bar snacks to full dining, enjoy quality food while you play.",
  },
  "alcohol": {
    tagline: "Bar Service Available",
    description: "Venues with bar service including beer, wine, cocktails, and more. Perfect for social outings and group entertainment.",
  },
  "lessons": {
    tagline: "Professional Instruction",
    description: "Venues offering golf lessons and coaching. Get professional instruction using simulator technology for instant feedback on your swing.",
  },
  "club-fitting": {
    tagline: "Custom Club Fitting",
    description: "Venues with club fitting services. Use launch monitor data to find the perfect clubs for your game with professional fitting expertise.",
  },
  "club_fitting": {
    tagline: "Custom Club Fitting",
    description: "Venues with club fitting services. Use launch monitor data to find the perfect clubs for your game with professional fitting expertise.",
  },
  "wifi": {
    tagline: "Connected Venues",
    description: "Golf simulator venues with WiFi access. Stay connected while you play — great for corporate events and remote workers.",
  },
  "parking": {
    tagline: "Convenient Parking",
    description: "Venues with dedicated parking options. From free lots to valet service, find venues where parking isn't a hassle.",
  },
  "outdoor-space": {
    tagline: "Outdoor Areas",
    description: "Venues with outdoor spaces — patios, decks, or terraces. Enjoy the outdoors between simulator sessions.",
  },
  "events": {
    tagline: "Event-Ready Venues",
    description: "Venues equipped for events and special occasions. Birthday parties, corporate outings, bachelor parties — these venues handle it all.",
  },
  "leagues": {
    tagline: "Competitive Play",
    description: "Venues offering organized league play. Join regular competitions and meet other golfers in your area.",
  },
  "memberships": {
    tagline: "Member Benefits",
    description: "Venues offering membership programs with perks like discounted rates, priority booking, or unlimited play.",
  },
};

export async function generateMetadata({ params }: BestAmenityPageProps): Promise<Metadata> {
  const { amenity } = await params;
  const label = amenity.replace(/_/g, " ").replace(/-/g, " ");
  const content = amenityContent[amenity.toLowerCase()] || { tagline: "", description: "" };
  
  return {
    title: `Best Golf Simulators with ${label} | GolfSimMap`,
    description: content.description || `Find venues offering ${label}. Compare hardware, booking options, and vibes.`,
    alternates: {
      canonical: `https://golfsimmap.com/best/amenities/${amenity}`,
    },
    openGraph: {
      title: `Best Golf Simulators with ${label}`,
      description: content.description || `Find venues offering ${label}.`,
      type: "website",
      url: `https://golfsimmap.com/best/amenities/${amenity}`,
    },
  };
}

export default async function BestAmenityPage({ params, searchParams }: BestAmenityPageProps) {
  const paramsResolved = (await searchParams) || {};
  const page = Math.max(1, Number(paramsResolved.page || 1));
  const { amenity } = await params;
  const label = amenity.replace(/_/g, " ").replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const amenityKey = amenity.toLowerCase();

  const venues = await db.venue.findMany({
    where: { status: "active" },
    orderBy: [{ featured: "desc" }, { ratingOverall: "desc" }, { name: "asc" }],
    select: venueCardSelect,
  });

  const filteredVenues = venues.filter((venue) => matchesAmenity(venue, amenity));

  const content = amenityContent[amenityKey] || {
    tagline: `${label} Amenity`,
    description: `Browse venues that offer ${label.toLowerCase()}. Use these listings to compare amenities, hardware, and booking options.`,
  };

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Best By", href: "/best" },
    { label: "Amenities", href: "/best/amenities" },
    { label: label },
  ];

  const faqItems = [
    {
      question: `What does "${label}" mean at these venues?`,
      answer: content.description,
    },
    {
      question: "How do I confirm the amenity before booking?",
      answer: "Check the venue detail page for notes and contact information. You can also call or message the venue directly to confirm specific amenities.",
    },
    {
      question: "Are amenities always accurate?",
      answer: "Amenities are based on listing data and owner submissions. Verified venues have confirmed their amenities with us. Always confirm important amenities before booking.",
    },
    {
      question: "Can I combine amenity filters?",
      answer: "Yes! Use our search page to combine multiple amenity filters with location and hardware preferences.",
    },
  ];

  // Generate related links from shared config
  const relatedLinks = [
    // Link to browse all
    { label: "Browse all categories", href: "/best" },
    // Vibes
    ...VIBE_CATEGORIES.slice(0, 2).map((v) => ({
      label: `Best ${v.label}`,
      href: `/best/vibe/${v.slug}`,
    })),
    // Segments
    ...SEGMENT_CATEGORIES.slice(0, 2).map((s) => ({
      label: `Best for ${s.label}`,
      href: `/best/who-its-for/${s.slug}`,
    })),
    // Hardware
    ...HARDWARE_CATEGORIES.slice(0, 2).map((h) => ({
      label: `Best ${h.label}`,
      href: `/best/hardware/${h.slug}`,
    })),
  ];

  return (
    <BestByPageContent
      title={`Best Golf Simulators with ${label}`}
      description={content.description}
      guidancePoints={[
        "Confirm amenities on the venue detail page before booking.",
        "Look for verified badges for confirmed amenity information.",
        "Consider combining amenity filters with location for best results.",
        "Contact venues directly if you have specific requirements.",
      ]}
      methodologyDescription={`We identify venues with ${label.toLowerCase()} based on their listings and verified claims. Results prioritize featured venues, then sort by rating and data completeness.`}
      faqItems={faqItems}
      relatedLinks={relatedLinks}
      ctaTitle={`Own a venue with ${label.toLowerCase()}?`}
      ctaDescription="Claim your listing to verify amenities and appear in our curated collections."
      ctaPrimary={{ label: "Claim Your Listing", href: "/claim" }}
      ctaSecondary={{ label: "Submit New Venue", href: "/submit" }}
      venues={filteredVenues}
      categoryType="amenity"
      categoryValue={amenityKey}
      heroSubtitle={content.tagline}
      breadcrumbItems={breadcrumbs}
      showRanking={true}
      currentPage={page}
      baseUrl={`/best/amenities/${amenity}`}
    />
  );
}
