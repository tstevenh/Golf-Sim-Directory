import { Metadata } from "next";
import { db, venueCardSelect } from "@/lib/db";
import { BestByPageContent } from "@/components/seo/BestByPageContent";
import { matchesWhoItsFor } from "@/lib/best-by";
import { getStaticRelatedLinks } from "@/lib/category-config.generated";

interface BestWhoItsForPageProps {
  params: Promise<{ segment: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export const revalidate = 3600;

// Pre-render all segment pages at build time
export async function generateStaticParams() {
  return [
    { segment: "beginners" },
    { segment: "corporate-groups" },
    { segment: "serious-golfers" },
    { segment: "date-night" },
    { segment: "large-groups" },
    { segment: "families" },
    { segment: "league-players" },
    { segment: "seniors" },
  ];
}

// Segment-specific content
const segmentContent: Record<string, { tagline: string; description: string }> = {
  families: {
    tagline: "Fun for All Ages",
    description: "Family-friendly venues welcome kids, offer casual vibes, and usually have food options. Perfect for weekend outings, birthday parties, or just quality time together. Staff is patient, and the atmosphere is welcoming for golfers of all ages and skill levels.",
  },
  beginners: {
    tagline: "Start Your Golf Journey",
    description: "Beginner-friendly spots have patient staff, forgiving setups, and lessons available. No one will judge your swing here — these venues specialize in helping new golfers learn and enjoy the game without pressure.",
  },
  serious_golfers: {
    tagline: "Train Like a Pro",
    description: "For golfers who want accurate data, quality hardware, and space to actually work on their game. These venues focus on practice and improvement over entertainment — think less bar, more range.",
  },
  serious: {
    tagline: "Train Like a Pro",
    description: "For golfers who want accurate data, quality hardware, and space to actually work on their game. These venues focus on practice and improvement over entertainment — think less bar, more range.",
  },
  groups: {
    tagline: "Party-Ready Venues",
    description: "Group-friendly venues handle parties, corporate events, and bachelor weekends with ease. Multiple bays, food and drink packages, and often private rooms make these perfect for celebrations.",
  },
  couples: {
    tagline: "Perfect Date Night",
    description: "Date-night venues have good food, craft drinks, and an atmosphere that works for two. Many offer couples packages or leagues for regulars looking to make it a weekly ritual.",
  },
  corporate: {
    tagline: "Professional Events",
    description: "Corporate-friendly venues handle large bookings, catering, and A/V equipment when needed. Many offer comprehensive event packages for team building, client entertainment, and company outings.",
  },
  kids: {
    tagline: "Kid-Approved Fun",
    description: "Venues that welcome children with open arms. Safe environments, fun activities, and staff who understand that little golfers need extra patience and encouragement.",
  },
  seniors: {
    tagline: "Comfortable & Accessible",
    description: "Venues with accessibility features, comfortable seating, and a pace that works for senior golfers. Focus on enjoyment over intensity.",
  },
};

export async function generateMetadata({ params }: BestWhoItsForPageProps): Promise<Metadata> {
  const { segment } = await params;
  const label = segment.replace(/_/g, " ").replace(/-/g, " ");
  const content = segmentContent[segment.toLowerCase()] || { tagline: "", description: "" };
  
  return {
    title: `Best Golf Simulators for ${label} — Top Venues`,
    description: content.description || `Find golf simulator venues perfect for ${label}. Compare amenities, vibes, and booking options.`,
    alternates: {
      canonical: `https://golfsimmap.com/best/who-its-for/${segment}`,
    },
    openGraph: {
      title: `Best Golf Simulators for ${label}`,
      description: content.description || `Find golf simulator venues perfect for ${label}.`,
      type: "website",
      url: `https://golfsimmap.com/best/who-its-for/${segment}`,
    },
  };
}

export default async function BestWhoItsForPage({ params, searchParams }: BestWhoItsForPageProps) {
  const paramsResolved = (await searchParams) || {};
  const page = Math.max(1, Number(paramsResolved.page || 1));
  const { segment } = await params;
  const label = segment.replace(/_/g, " ").replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const segmentKey = segment.toLowerCase();

  const venues = await db.venue.findMany({
    where: { status: "active" },
    orderBy: [{ featured: "desc" }, { ratingOverall: "desc" }, { name: "asc" }],
    select: venueCardSelect,
  });

  const filteredVenues = venues.filter((venue) => matchesWhoItsFor(venue, segment));

  const content = segmentContent[segmentKey] || {
    tagline: `Perfect for ${label}`,
    description: `Venues tagged as ideal for ${label.toLowerCase()}. These spots cater specifically to your needs and preferences.`,
  };

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Best By", href: "/best" },
    { label: "Who It's For", href: "/best/who-its-for" },
    { label: label },
  ];

  const faqItems = [
    {
      question: `What makes a venue good for ${label.toLowerCase()}?`,
      answer: content.description,
    },
    {
      question: "How do you decide which venues fit this category?",
      answer: "Owners tag their venues during submission, and we also infer from amenities — kid-friendly policies, private rooms, coaching availability, group pricing, and more.",
    },
    {
      question: "Can I combine this with other filters?",
      answer: "Yes! Use our search page to combine audience filters with location, hardware preferences, and amenity requirements.",
    },
    {
      question: "Are these venues verified?",
      answer: "Some venues are verified (indicated by a badge). Verified venues have confirmed their details directly with us. Unverified listings are based on available data.",
    },
  ];

  // Related categories - static, no DB query
  const relatedLinks = [
    { label: "All occasions", href: "/best/who-its-for/" },
    ...getStaticRelatedLinks("who-its-for", segment, 6),
  ];

  return (
    <BestByPageContent
      title={`Best Golf Simulators for ${label}`}
      description={content.description}
      guidancePoints={[
        "Check amenities that matter to your group — food, drinks, private rooms.",
        "Read reviews from similar groups to gauge the experience.",
        "Look at the vibe tags to confirm the atmosphere matches your needs.",
        "Use city filters to find venues near you.",
      ]}
      methodologyDescription={`We filter venues by "who it's for" tags from listing data and infer from amenities. Featured venues appear first, followed by highest-rated options.`}
      faqItems={faqItems}
      relatedLinks={relatedLinks}
      ctaTitle={`Own a venue perfect for ${label.toLowerCase()}?`}
      ctaDescription="Claim your listing to update your audience tags and attract the right crowd."
      ctaPrimary={{ label: "Claim Your Listing", href: "/claim" }}
      ctaSecondary={{ label: "Submit New Venue", href: "/submit" }}
      venues={filteredVenues}
      categoryType="segment"
      categoryValue={segmentKey}
      heroSubtitle={content.tagline}
      breadcrumbItems={breadcrumbs}
      showRanking={true}
      currentPage={page}
      baseUrl={`/best/who-its-for/${segment}`}
    />
  );
}
