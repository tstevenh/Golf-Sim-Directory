import { Metadata } from "next";
import Link from "next/link";
import { Gamepad2, ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { AVAILABLE_SOFTWARE } from "@/lib/category-config.generated";

export const dynamic = "force-static";

const softwareDescriptions: Record<string, string> = {
  gspro: "Community-driven platform with deep course coverage and realism.",
  e6: "Polished premium simulator suite with strong course licensing.",
  tgc: "Large user-generated course ecosystem and multiplayer gameplay.",
  wgt: "Competitive online-focused experience with recognized course brands.",
  "creative-golf": "Family-friendly gameplay with approachable modes and variety.",
  "awesome-golf": "Simple, fun software focused on social simulator sessions.",
  "trackman-virtual": "Native TrackMan software tightly integrated with hardware.",
  fsx: "Foresight ecosystem software with detailed simulation and practice modes.",
};

export const metadata: Metadata = {
  title: "Golf Simulators by Software — GSPro, E6, TGC, WGT & More",
  description: "Browse golf simulator venues by software platform. Compare GSPro, E6, TGC, WGT, and other simulator software options.",
  alternates: {
    canonical: "https://golfsimmap.com/best/software",
  },
  openGraph: {
    title: "Golf Simulators by Software — GSPro, E6, TGC, WGT & More",
    description: "Browse venues by simulator software platform.",
    type: "website",
    url: "https://golfsimmap.com/best/software",
  },
};

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Best By", href: "/best" },
  { label: "Software", current: true },
];

export default function SoftwareIndexPage() {
  const softwareCounts = AVAILABLE_SOFTWARE.filter((item) => item.count > 0).map((item) => ({
    ...item,
    description:
      softwareDescriptions[item.slug] ||
      `Find venues running ${item.label} simulator software.`,
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
              name: "Browse Golf Simulators by Software",
              description: "Find golf simulator venues by software platform.",
              url: "https://golfsimmap.com/best/software",
            }),
          }}
        />

        <div className="mb-8">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-masters-green/10 border border-masters-green/20">
              <Gamepad2 className="w-6 h-6 text-masters-green" />
            </div>
          </div>
          <h1 className="text-cream text-3xl md:text-4xl font-bold mb-4">
            Browse by Software
          </h1>
          <p className="text-muted text-lg max-w-2xl">
            Compare simulation software platforms and pick the gameplay style you prefer.
          </p>
        </div>

        {softwareCounts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {softwareCounts.map((item) => (
              <Link
                key={item.slug}
                href={`/best/software/${item.slug}`}
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
              <Gamepad2 className="w-12 h-12 text-muted mx-auto mb-4" />
              <h2 className="text-cream text-lg font-semibold mb-2">No software data yet</h2>
              <p className="text-muted">We haven&apos;t categorized software platforms yet.</p>
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
