import { Metadata } from "next";
import { supabase, VENUE_CARD_FIELDS } from "@/lib/supabase";
import { BestByPageContent } from "@/components/seo/BestByPageContent";
import { getStaticRelatedLinks } from "@/lib/category-config.generated";

interface BestWhoItsForPageProps {
  params: Promise<{ segment: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export const revalidate = 15552000;

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
    description: "Family-friendly venues that welcome kids, offer casual vibes, and have food options. Great for weekend outings, birthdays, or quality time together.",
  },
  beginners: {
    tagline: "Start Your Golf Journey",
    description: "Beginner-friendly spots with patient staff, forgiving setups, and lessons available. No judgment here — just venues that help new golfers learn.",
  },
  serious_golfers: {
    tagline: "Train Like a Pro",
    description: "For golfers who want accurate data, quality hardware, and space to work on their game. Practice-focused venues — less bar, more range.",
  },
  serious: {
    tagline: "Train Like a Pro",
    description: "For golfers who want accurate data, quality hardware, and space to work on their game. Practice-focused venues — less bar, more range.",
  },
  groups: {
    tagline: "Party-Ready Venues",
    description: "Group-friendly venues for parties, corporate events, and bachelor weekends. Multiple bays, food and drink packages, and private rooms.",
  },
  couples: {
    tagline: "Perfect Date Night",
    description: "Date-night venues with good food, craft drinks, and an atmosphere that works for two. Many offer couples packages or leagues for regulars.",
  },
  corporate: {
    tagline: "Professional Events",
    description: "Corporate-friendly venues with large bookings, catering, and A/V options. Event packages for team building, client entertainment, and company outings.",
  },
  kids: {
    tagline: "Kid-Approved Fun",
    description: "Venues that welcome children with open arms. Safe environments, fun activities, and staff who know little golfers need extra patience.",
  },
  seniors: {
    tagline: "Comfortable & Accessible",
    description: "Venues with accessibility features, comfortable seating, and a pace that works for senior golfers. Focus on enjoyment over intensity.",
  },
};

export async function generateMetadata({ params }: BestWhoItsForPageProps): Promise<Metadata> {
  const { segment } = await params;
  const label = segment.replace(/_/g, " ").replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const content = segmentContent[segment.toLowerCase()] || { tagline: "", description: "" };

  return {
    title: `Best Golf Simulators for ${label} — Top Rated Venues`,
    description: content.description || `Find golf simulator venues perfect for ${label.toLowerCase()}. Compare amenities, vibes, and booking options.`,
    alternates: {
      canonical: `https://golfsimmap.com/best/who-its-for/${segment}`,
    },
    openGraph: {
      title: `Best Golf Simulators for ${label} — Top Rated Venues`,
      description: content.description || `Find golf simulator venues perfect for ${label.toLowerCase()}.`,
      type: "website",
      url: `https://golfsimmap.com/best/who-its-for/${segment}`,
    },
  };
}

export default async function BestWhoItsForPage({ params, searchParams }: BestWhoItsForPageProps) {
  const paramsResolved = (await searchParams) || {};
  const page = Math.max(1, Number(paramsResolved.page || 1));
  const pageSize = 12;
  const { segment } = await params;
  const label = segment.replace(/_/g, " ").replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const segmentKey = segment.toLowerCase();
  const segmentVariants = Array.from(new Set([segment, segment.replace(/-/g, "_"), segment.replace(/_/g, "-")]));
  const skip = (page - 1) * pageSize;

  const [{ count: totalVenues }, { data: venueRows }] = await Promise.all([
    supabase
      .from("venues")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")
      .overlaps("whoItsFor", segmentVariants),
    supabase
      .from("venues")
      .select(VENUE_CARD_FIELDS)
      .eq("status", "active")
      .overlaps("whoItsFor", segmentVariants)
      .order("featured", { ascending: false })
      .order("ratingOverall", { ascending: false, nullsFirst: false })
      .order("name", { ascending: true })
      .range(skip, skip + pageSize - 1),
  ]);
  const venues = venueRows || [];

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
      venues={venues}
      totalVenues={totalVenues ?? 0}
      categoryType="segment"
      categoryValue={segmentKey}
      heroSubtitle={content.tagline}
      breadcrumbItems={breadcrumbs}
      showRanking={true}
      currentPage={page}
      pageSize={pageSize}
      baseUrl={`/best/who-its-for/${segment}`}
    />
  );
}
