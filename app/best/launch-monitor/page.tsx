import { Metadata } from "next";
import Link from "next/link";
import { Radar, ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { AVAILABLE_LAUNCH_MONITORS } from "@/lib/category-config.generated";

export const dynamic = "force-static";

const launchMonitorDescriptions: Record<string, string> = {
  radar: "Doppler radar systems that excel at full ball-flight tracking.",
  photometric_camera: "High-speed camera systems with strong club and spin data.",
  hybrid: "Combined radar + camera setups for complete performance tracking.",
  unknown: "Venues with launch monitor tech not yet fully categorized.",
};

function toUrlSlug(slug: string): string {
  return slug.replace(/_/g, "-");
}

export const metadata: Metadata = {
  title: "Golf Simulators by Launch Monitor Type — Radar, Camera & Hybrid",
  description: "Browse venues by launch monitor technology type. Compare radar, camera-based, and hybrid systems for your practice goals.",
  alternates: {
    canonical: "https://golfsimmap.com/best/launch-monitor",
  },
  openGraph: {
    title: "Golf Simulators by Launch Monitor Type — Radar, Camera & Hybrid",
    description: "Browse venues by launch monitor technology type.",
    type: "website",
    url: "https://golfsimmap.com/best/launch-monitor",
  },
};

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Best By", href: "/best" },
  { label: "Launch Monitor", current: true },
];

export default function LaunchMonitorIndexPage() {
  const launchMonitorCounts = AVAILABLE_LAUNCH_MONITORS.filter((item) => item.count > 0).map((item) => ({
    ...item,
    description:
      launchMonitorDescriptions[item.slug] ||
      `Find venues using ${item.label.toLowerCase()} launch monitor technology.`,
  }));

  return (
    <div className="min-h-screen bg-deep-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              name: "Browse Golf Simulators by Launch Monitor Type",
              description: "Find golf simulator venues by launch monitor technology type.",
              url: "https://golfsimmap.com/best/launch-monitor",
            }),
          }}
        />

        <div className="mb-8">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-masters-green/10 border border-masters-green/20">
              <Radar className="w-6 h-6 text-masters-green" />
            </div>
          </div>
          <h1 className="text-cream text-3xl md:text-4xl font-bold mb-4">
            Browse by Launch Monitor Type
          </h1>
          <p className="text-muted text-lg max-w-2xl">
            Compare tracking technology types and find venues that match how you practice.
          </p>
        </div>

        {launchMonitorCounts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {launchMonitorCounts.map((item) => (
              <Link
                key={item.slug}
                href={`/best/launch-monitor/${toUrlSlug(item.slug)}`}
                className="group block border border-default bg-charcoal rounded-lg p-6 hover:border-masters-green/50 hover:bg-masters-green/5 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-cream text-xl font-semibold group-hover:text-masters-green transition-colors">
                    {item.label}
                  </h2>
                  <ArrowRight className="w-5 h-5 text-muted group-hover:text-masters-green transition-colors" />
                </div>
                <p className="text-muted mb-4">{item.description}</p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-masters-green font-mono">{item.count}</span>
                  <span className="text-muted">{item.count === 1 ? "venue" : "venues"}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-default rounded-lg bg-charcoal">
            <div className="max-w-md mx-auto">
              <Radar className="w-12 h-12 text-muted mx-auto mb-4" />
              <h2 className="text-cream text-lg font-semibold mb-2">No launch monitor data yet</h2>
              <p className="text-muted">We haven&apos;t categorized launch monitor types yet.</p>
            </div>
          </div>
        )}

        <div className="mt-12 flex flex-wrap gap-4">
          <Link href="/best" className="text-muted hover:text-cream transition-colors">
            ← Back to all categories
          </Link>
          <Link href="/venue/us" className="text-masters-green hover:text-cream transition-colors">
            Browse all venues →
          </Link>
        </div>
      </div>
    </div>
  );
}
