import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { BestByPageContent } from "@/components/seo/BestByPageContent";
import { matchesHardware } from "@/lib/best-by";

interface BestHardwarePageProps {
  params: Promise<{ brand: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: BestHardwarePageProps): Promise<Metadata> {
  const { brand } = await params;
  const label = brand.replace(/-/g, " ");
  return {
    title: `Best ${label} Golf Simulators | GolfSimMap`,
    description: `Find indoor golf venues using ${label} hardware. Compare ratings, amenities, and booking options.`,
  };
}

export default async function BestHardwarePage({ params }: BestHardwarePageProps) {
  const { brand } = await params;
  const label = brand.replace(/-/g, " ");

  const venues = await db.venue.findMany({
    where: { status: "active" },
    orderBy: [{ featured: "desc" }, { ratingOverall: "desc" }, { name: "asc" }],
  });

  const filteredVenues = venues.filter((venue) => matchesHardware(venue, label));

  const faqItems = [
    {
      question: `Why choose ${label} hardware?`,
      answer: `${label} systems are known for accurate shot tracking and detailed data. Check each listing for the exact model and setup details.`,
    },
    {
      question: "Do all bays use the same hardware?",
      answer: "Some venues mix systems across bays or VIP rooms. The listing notes provide specifics when available.",
    },
    {
      question: "Can I filter by hardware in search?",
      answer: "Yes. Use the search filters to select a specific simulator brand.",
    },
    {
      question: "Are these venues verified?",
      answer: "Listings are unverified by default and become verified after a manual claim review.",
    },
  ];

  return (
    <div className="min-h-screen bg-deep-black py-12">
      <div className="absolute inset-0 scorecard-grid opacity-20" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-sm text-muted mb-6">
          <Link href="/" className="hover:text-cream transition-colors">Home</Link>
          <span>/</span>
          <span className="text-cream">Best {label}</span>
        </div>

        <BestByPageContent
          title={`Best ${label} Golf Simulators`}
          description={`Browse venues using ${label} hardware. Compare amenities, launch monitor types, and booking options.`}
          guidancePoints={[
            "Confirm the specific hardware model on the venue detail page.",
            "Compare launch monitor types to understand data accuracy.",
            "Use city pages to narrow this hardware to your location.",
          ]}
          methodologyDescription="Results prioritize featured venues, then sort by rating and listing completeness."
          faqItems={faqItems}
          relatedLinks={[
            { label: "Best camera systems", href: "/best/launch-monitor/photometric_camera" },
            { label: "Best hybrid systems", href: "/best/launch-monitor/hybrid" },
            { label: "Best serious practice venues", href: "/best/serious-practice" },
          ]}
          ctaTitle="Own a venue?"
          ctaDescription="Claim your listing to verify your simulator hardware and appear in best-by collections."
          ctaPrimary={{ label: "Claim a listing", href: "/claim" }}
          ctaSecondary={{ label: "Submit a venue", href: "/submit" }}
          venues={filteredVenues}
        />
      </div>
    </div>
  );
}
