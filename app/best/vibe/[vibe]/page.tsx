import { Metadata } from "next";
import { db } from "@/lib/db";
import { BestByPageContent } from "@/components/seo/BestByPageContent";
import { matchesVibe } from "@/lib/best-by";

interface BestVibePageProps {
  params: Promise<{ vibe: string }>;
}

export const revalidate = 60;

// Vibe-specific content
const vibeContent: Record<string, { tagline: string; description: string }> = {
  "upscale": {
    tagline: "Premium Golf Experiences",
    description: "Luxury golf simulator venues with upscale amenities, premium finishes, and exceptional service. Perfect for client entertainment, special occasions, or when you want the finest simulator experience.",
  },
  "casual": {
    tagline: "Relaxed & Laid-Back",
    description: "Casual golf simulator spots perfect for kicking back with friends. No dress code, no pretense — just good golf and good times. Great for beginners and regulars alike.",
  },
  "sports-bar": {
    tagline: "Golf Meets Game Day",
    description: "Sports bar venues with golf simulators where you can watch the big game, grab some wings, and squeeze in a few holes. The best of both worlds for sports fans.",
  },
  "sports_bar": {
    tagline: "Golf Meets Game Day",
    description: "Sports bar venues with golf simulators where you can watch the big game, grab some wings, and squeeze in a few holes. The best of both worlds for sports fans.",
  },
  "boutique": {
    tagline: "Intimate & Curated",
    description: "Smaller, boutique golf simulator venues offering personalized attention and a more intimate atmosphere. Often feature unique decor and specialized services.",
  },
  "family": {
    tagline: "Fun for Everyone",
    description: "Family-oriented golf simulator venues where all ages can enjoy the game together. Safe, welcoming environments with activities for kids and adults.",
  },
  "lounge": {
    tagline: "Sophisticated Atmosphere",
    description: "Lounge-style golf simulator venues with comfortable seating, craft cocktails, and a refined atmosphere. Perfect for after-work sessions or date nights.",
  },
  "entertainment": {
    tagline: "Full Entertainment Experience",
    description: "Entertainment-focused venues where golf simulators are part of a larger experience. Often feature multiple activities, games, and group entertainment options.",
  },
};

export async function generateMetadata({ params }: BestVibePageProps): Promise<Metadata> {
  const { vibe } = await params;
  const vibeLabel = vibe.replace(/_/g, " ").replace(/-/g, " ");
  const content = vibeContent[vibe.toLowerCase()] || { tagline: "", description: "" };
  
  return {
    title: `Best ${vibeLabel} Golf Simulators | GolfSimMap`,
    description: content.description || `Discover golf simulator venues with a ${vibeLabel} vibe. Compare amenities, hardware, and booking options.`,
    openGraph: {
      title: `Best ${vibeLabel} Golf Simulators`,
      description: content.description || `Discover golf simulator venues with a ${vibeLabel} vibe.`,
      type: "website",
    },
  };
}

export default async function BestVibePage({ params }: BestVibePageProps) {
  const { vibe } = await params;
  const vibeLabel = vibe.replace(/_/g, " ").replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const vibeKey = vibe.toLowerCase();

  const venues = await db.venue.findMany({
    where: { status: "active" },
    orderBy: [{ featured: "desc" }, { ratingOverall: "desc" }, { name: "asc" }],
  });

  const filteredVenues = venues.filter((venue) => matchesVibe(venue, vibe));

  const content = vibeContent[vibeKey] || {
    tagline: `${vibeLabel} Atmosphere`,
    description: `Find venues with a ${vibeLabel.toLowerCase()} atmosphere. Use these listings to match your desired vibe, amenities, and simulator tech.`,
  };

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Best By", href: "/best" },
    { label: "Vibe", href: "/best/vibe" },
    { label: vibeLabel },
  ];

  const faqItems = [
    {
      question: `What does the "${vibeLabel}" vibe mean?`,
      answer: content.description,
    },
    {
      question: "How do I know if a venue matches this vibe?",
      answer: "Vibe tags are based on venue photos, descriptions, and customer reviews. Look at the venue's amenities and photos to confirm the atmosphere matches what you're looking for.",
    },
    {
      question: "Can I combine vibe with other filters?",
      answer: "Yes! Use our search page to combine vibe preferences with location, hardware, and amenity filters to find your perfect venue.",
    },
    {
      question: "Are vibe tags verified?",
      answer: "Tags are based on available data and owner submissions. Verified venues can update their vibe tags after review by our team.",
    },
  ];

  const relatedLinks = [
    { label: "Upscale venues", href: "/best/vibe/upscale" },
    { label: "Casual spots", href: "/best/vibe/casual" },
    { label: "Sports bar vibes", href: "/best/vibe/sports-bar" },
    { label: "Boutique venues", href: "/best/vibe/boutique" },
    { label: "Date night spots", href: "/best/date-night" },
    { label: "Family friendly", href: "/best/family-friendly" },
  ].filter(link => !link.href.includes(vibe));

  return (
    <BestByPageContent
      title={`Best ${vibeLabel} Golf Simulators`}
      description={content.description}
      guidancePoints={[
        "Check venue photos to get a feel for the actual atmosphere.",
        "Look at amenities (food, drinks, private rooms) to confirm the experience.",
        "Read reviews for firsthand accounts of the venue vibe.",
        "Consider combining vibe with location filters for local options.",
      ]}
      methodologyDescription={`We categorize venues by vibe based on their photos, descriptions, amenities, and customer feedback. Results prioritize featured venues, then sort by rating and listing completeness.`}
      faqItems={faqItems}
      relatedLinks={relatedLinks}
      ctaTitle="Own a venue?"
      ctaDescription={`If your venue has a ${vibeLabel.toLowerCase()} atmosphere, claim your listing to verify details and appear in our curated collections.`}
      ctaPrimary={{ label: "Claim Your Listing", href: "/claim" }}
      ctaSecondary={{ label: "Submit New Venue", href: "/submit" }}
      venues={filteredVenues}
      categoryType="vibe"
      categoryValue={vibeKey}
      heroSubtitle={content.tagline}
      breadcrumbItems={breadcrumbs}
      showRanking={true}
    />
  );
}
