import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { BestByPageContent } from "@/components/seo/BestByPageContent";

interface BestLaunchMonitorPageProps {
  params: Promise<{ type: string }>;
}

export const revalidate = 60;

const launchMonitorDescriptions: Record<string, string> = {
  radar: "Radar systems like Trackman use Doppler radar to track ball flight from impact through landing. Best for full-shot data and outdoor accuracy.",
  photometric_camera: "Camera-based systems capture high-speed images at impact. They excel at club data and work well indoors where radar signal may struggle.",
  hybrid: "Hybrid systems combine radar and camera tech for the best of both worlds. Typically the most accurate but also the priciest.",
  overhead_camera: "Overhead camera systems mount above the hitting area and track the ball from above. Common in entertainment venues.",
  floor_camera: "Floor-mounted cameras capture impact from below or at ground level. Often paired with other sensors.",
  infrared_optical: "Infrared systems use light sensors to track ball and club movement. Good accuracy at a lower price point than radar.",
};

export async function generateMetadata({ params }: BestLaunchMonitorPageProps): Promise<Metadata> {
  const { type } = await params;
  const label = type.replace(/_/g, " ");
  return {
    title: `Best ${label} Launch Monitor Venues | GolfSimMap`,
    description: `Find golf simulator venues using ${label} launch monitors. Compare accuracy, amenities, and booking options.`,
  };
}

export default async function BestLaunchMonitorPage({ params }: BestLaunchMonitorPageProps) {
  const { type } = await params;
  const label = type.replace(/_/g, " ");

  const venues = await db.venue.findMany({
    where: { status: "active", launchMonitorType: type as any },
    orderBy: [{ featured: "desc" }, { ratingOverall: "desc" }, { name: "asc" }],
  });

  const description = launchMonitorDescriptions[type] || `Venues using ${label} launch monitor technology.`;

  const faqItems = [
    {
      question: `What is a ${label} launch monitor?`,
      answer: description,
    },
    {
      question: "Does launch monitor type affect my practice?",
      answer: "Yes. Radar excels outdoors and on full shots. Camera systems give better club data indoors. If you're working on swing mechanics, camera-based data often helps more.",
    },
    {
      question: "Are these venues verified?",
      answer: "Most listings start unverified. Owners can claim them to confirm hardware details. Look for the verified badge on listings.",
    },
    {
      question: "Can I filter by launch monitor in search?",
      answer: "Yes. The search page has a launch monitor dropdown. Select your preferred type and combine with location filters.",
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
          title={`Best ${label} Launch Monitor Venues`}
          description={description}
          guidancePoints={[
            "Check if all bays use the same launch monitor — some venues mix hardware.",
            "Camera systems shine for club path and face angle. Radar wins on ball flight.",
            "If you're serious about data, ask about software integration before booking.",
          ]}
          methodologyDescription="We filter by launch monitor type from listing data. Featured venues appear first, then we sort by rating."
          faqItems={faqItems}
          relatedLinks={[
            { label: "Best Trackman venues", href: "/best/hardware/trackman" },
            { label: "Best Foresight venues", href: "/best/hardware/foresight" },
            { label: "Best serious practice spots", href: "/best/serious-practice" },
          ]}
          ctaTitle="Own a venue?"
          ctaDescription="Claim your listing to confirm your launch monitor setup and attract golfers who care about data."
          ctaPrimary={{ label: "Claim a listing", href: "/claim" }}
          ctaSecondary={{ label: "Submit a venue", href: "/submit" }}
          venues={venues}
        />
      </div>
    </div>
  );
}
