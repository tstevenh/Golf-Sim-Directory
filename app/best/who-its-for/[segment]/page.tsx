import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { BestByPageContent } from "@/components/seo/BestByPageContent";
import { matchesWhoItsFor } from "@/lib/best-by";

interface BestWhoItsForPageProps {
  params: Promise<{ segment: string }>;
}

export const revalidate = 60;

const segmentDescriptions: Record<string, string> = {
  families: "Family-friendly venues welcome kids, offer casual vibes, and usually have food options. Think weekend outings, not serious range sessions.",
  beginners: "Beginner-friendly spots have patient staff, forgiving setups, and lessons available. No one will judge your swing here.",
  serious_golfers: "For golfers who want accurate data, quality hardware, and space to actually work on their game. Less bar, more range.",
  groups: "Group-friendly venues handle parties, corporate events, and bachelor weekends. Multiple bays, food and drink, and often private rooms.",
  couples: "Date-night venues have good food, drinks, and a vibe that works for two. Some offer leagues or competitions for regulars.",
  corporate: "Corporate-friendly spots handle large bookings, catering, and A/V if needed. Many offer event packages.",
};

export async function generateMetadata({ params }: BestWhoItsForPageProps): Promise<Metadata> {
  const { segment } = await params;
  const label = segment.replace(/_/g, " ");
  return {
    title: `Best Golf Simulators for ${label} | GolfSimMap`,
    description: `Find golf simulator venues perfect for ${label}. Compare amenities, vibes, and booking options.`,
  };
}

export default async function BestWhoItsForPage({ params }: BestWhoItsForPageProps) {
  const { segment } = await params;
  const label = segment.replace(/_/g, " ");

  const venues = await db.venue.findMany({
    where: { status: "active" },
    orderBy: [{ featured: "desc" }, { ratingOverall: "desc" }, { name: "asc" }],
  });

  const filteredVenues = venues.filter((venue) => matchesWhoItsFor(venue, segment));

  const description = segmentDescriptions[segment] || `Venues tagged as ideal for ${label}.`;

  const faqItems = [
    {
      question: `What makes a venue good for ${label}?`,
      answer: description,
    },
    {
      question: "How do you decide which venues fit this category?",
      answer: "Owners tag their venues during submission. We also infer from amenities — kid-friendly tags, private rooms, coaching availability, etc.",
    },
    {
      question: "Can I suggest a venue for this list?",
      answer: "Yes. Submit the venue or leave feedback on an existing listing. We review suggestions before adding tags.",
    },
    {
      question: "Are these venues verified?",
      answer: "Some are. Verified venues have confirmed details. Unverified listings are based on available data.",
    },
  ];

  return (
    <div className="min-h-screen bg-deep-black py-12">
      <div className="absolute inset-0 scorecard-grid opacity-20" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-sm text-muted mb-6">
          <Link href="/" className="hover:text-cream transition-colors">Home</Link>
          <span>/</span>
          <span className="text-cream">Best for {label}</span>
        </div>

        <BestByPageContent
          title={`Best Golf Simulators for ${label}`}
          description={description}
          guidancePoints={[
            "Check amenities that matter to your group — food, drinks, private rooms.",
            "Read the vibe tags to gauge the atmosphere before booking.",
            "Use city pages to find this category near you.",
          ]}
          methodologyDescription="We filter by who-its-for tags from listing data. Featured venues appear first, then sorted by rating."
          faqItems={faqItems}
          relatedLinks={[
            { label: "Best date-night venues", href: "/best/date-night" },
            { label: "Best sports-bar vibes", href: "/best/vibe/sports_bar" },
            { label: "Best venues with private rooms", href: "/best/amenities/private_rooms" },
          ]}
          ctaTitle="Own a venue?"
          ctaDescription="Claim your listing to update who-its-for tags and attract the right crowd."
          ctaPrimary={{ label: "Claim a listing", href: "/claim" }}
          ctaSecondary={{ label: "Submit a venue", href: "/submit" }}
          venues={filteredVenues}
        />
      </div>
    </div>
  );
}
