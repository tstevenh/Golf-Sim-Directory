import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { BestByPageContent } from "@/components/seo/BestByPageContent";
import { matchesVibe } from "@/lib/best-by";

interface BestVibePageProps {
  params: Promise<{ vibe: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: BestVibePageProps): Promise<Metadata> {
  const { vibe } = await params;
  const vibeLabel = vibe.replace(/_/g, " ");
  return {
    title: `Best ${vibeLabel} Golf Simulators | GolfSimMap`,
    description: `Discover golf simulator venues with a ${vibeLabel} vibe. Compare amenities, hardware, and booking options.`,
  };
}

export default async function BestVibePage({ params }: BestVibePageProps) {
  const { vibe } = await params;
  const vibeLabel = vibe.replace(/_/g, " ");

  const venues = await db.venue.findMany({
    where: { status: "active" },
    orderBy: [{ featured: "desc" }, { ratingOverall: "desc" }, { name: "asc" }],
  });

  const filteredVenues = venues.filter((venue) => matchesVibe(venue, vibe));

  const faqItems = [
    {
      question: `What does the ${vibeLabel} vibe mean?`,
      answer: "Vibe tags highlight the atmosphere of a venue, from upscale lounges to sports-bar energy. They help you choose the right setting for your group.",
    },
    {
      question: "Are vibe tags verified?",
      answer: "Tags are based on available data and owner submissions. Verified venues can update their vibe tags after review.",
    },
    {
      question: "How do I find this vibe in my city?",
      answer: "Use the location-aware best-by pages or city search to narrow down to your area.",
    },
    {
      question: "Can owners update their venue vibe?",
      answer: "Yes. Claiming a venue allows owners to update vibe tags and venue details after review.",
    },
  ];

  return (
    <div className="min-h-screen bg-deep-black py-12">
      <div className="absolute inset-0 scorecard-grid opacity-20" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-sm text-muted mb-6">
          <Link href="/" className="hover:text-cream transition-colors">Home</Link>
          <span>/</span>
          <span className="text-cream">Best {vibeLabel}</span>
        </div>

        <BestByPageContent
          title={`Best ${vibeLabel} Golf Simulators`}
          description={`Find venues with a ${vibeLabel} atmosphere. Use these listings to match your desired vibe, amenities, and simulator tech.`}
          guidancePoints={[
            "Look for tags that match your group size and experience level.",
            "Check for food, drinks, or private rooms depending on the vibe you want.",
            "Use launch monitor details to confirm equipment quality.",
          ]}
          methodologyDescription="Results prioritize featured venues, then sort by rating and listing completeness."
          faqItems={faqItems}
          relatedLinks={[
            { label: "Best date-night venues", href: "/best/date-night" },
            { label: "Best serious-practice venues", href: "/best/serious-practice" },
            { label: "Best Trackman venues", href: "/best/hardware/trackman" },
          ]}
          ctaTitle="Own a venue?"
          ctaDescription="Claim your listing to verify details and appear in vibe-based collections."
          ctaPrimary={{ label: "Claim a listing", href: "/claim" }}
          ctaSecondary={{ label: "Submit a venue", href: "/submit" }}
          venues={filteredVenues}
        />
      </div>
    </div>
  );
}
