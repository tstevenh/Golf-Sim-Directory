import { Metadata } from "next";
import Link from "next/link";
import { Target, Cpu, Camera, Radar } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

export const metadata: Metadata = {
  title: "Golf Launch Monitor Guide — TrackMan vs Foresight vs Uneekor",
  description: "Compare top golf launch monitors side by side: TrackMan 4, Foresight GCQuad, Uneekor EYE XO. Official specs and pricing.",
  alternates: {
    canonical: "https://golfsimmap.com/launch-monitors",
  },
  openGraph: {
    title: "Golf Launch Monitor Guide — TrackMan vs Foresight vs Uneekor",
    description: "Compare top golf launch monitors side by side. Official specs and pricing.",
    type: "website",
    url: "https://golfsimmap.com/launch-monitors",
  },
};

const launchMonitors = [
  {
    slug: "trackman-4",
    name: "TrackMan 4",
    manufacturer: "TrackMan",
    technology: "Dual Doppler Radar + OERT",
    price: "Starting at $25,495",
    metrics: "40+",
    icon: Radar,
    description: "Full range of club and ball data (40+ parameters) using dual Doppler radar and OERT to track full ball flight.",
  },
  {
    slug: "gcquad",
    name: "Foresight GCQuad",
    manufacturer: "Foresight Sports",
    technology: "Quadrascopic Imaging (4 cameras)",
    price: "$15,999",
    icon: Camera,
    description: "Quadrascopic imaging launch monitor delivering precise club and ball data indoors and outdoors.",
  },
  {
    slug: "uneekor-eyexo",
    name: "Uneekor EYE XO",
    manufacturer: "Uneekor",
    technology: "Front Overhead Photometric System",
    price: "$8,000",
    metrics: 24,
    icon: Target,
    description: "Front-overhead photometric launch monitor with Dimple Optix and Club Optix technology.",
  },
];

const techTypes = [
  {
    name: "Radar Systems",
    icon: Radar,
    description: "Doppler radar tracks ball flight from launch to landing in radar-based launch monitors.",
    examples: "TrackMan, FlightScope",
  },
  {
    name: "Camera Systems",
    icon: Camera,
    description: "High-speed cameras capture impact data using photometric imaging systems.",
    examples: "Foresight GCQuad, Uneekor",
  },
  {
    name: "Hybrid Systems",
    icon: Cpu,
    description: "Combine radar and camera technology in a single system.",
    examples: "TrackMan 4 (Radar + Camera)",
  },
];

export default function LaunchMonitorsIndexPage() {
  // CollectionPage schema
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Golf Launch Monitor Guide & Reviews",
    description: "Compare the top golf launch monitors: TrackMan 4, Foresight GCQuad, Uneekor EYE XO.",
    url: "https://golfsimmap.com/launch-monitors",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: launchMonitors.length,
      itemListElement: launchMonitors.map((monitor, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: monitor.name,
        url: `https://golfsimmap.com/launch-monitors/${monitor.slug}`,
      })),
    },
  };

  return (
    <div className="min-h-screen bg-deep-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Launch Monitors" },
            ]}
            className="mb-6"
          />
          
          <h1 className="text-cream text-3xl md:text-4xl font-bold mb-4">
            Golf Launch Monitor Guide
          </h1>
          <p className="text-muted text-lg max-w-2xl">
            Compare the industry&apos;s top launch monitors using official specifications and pricing.
          </p>
        </div>

        {/* Featured Systems */}
        <section className="mb-16">
          <h2 className="text-cream text-xl font-semibold mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-masters-green" />
            Launch Monitor Systems
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {launchMonitors.map((monitor) => {
              const specRows = [
                monitor.technology
                  ? { label: "Technology", value: monitor.technology, valueClass: "text-cream-subtle" }
                  : null,
                monitor.price
                  ? { label: "Price", value: monitor.price, valueClass: "text-cream font-mono" }
                  : null,
                monitor.accuracy
                  ? { label: "Accuracy", value: monitor.accuracy, valueClass: "text-cream-subtle" }
                  : null,
                monitor.metrics
                  ? { label: "Data Points", value: String(monitor.metrics), valueClass: "text-cream-subtle" }
                  : null,
              ].filter((row): row is { label: string; value: string; valueClass: string } => Boolean(row));

              return (
                <Link
                  key={monitor.slug}
                  href={`/launch-monitors/${monitor.slug}`}
                  className="group block border border-default bg-charcoal rounded-lg p-6 hover:border-masters-green/50 hover:bg-masters-green/5 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-masters-green/10 text-masters-green">
                        <monitor.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-cream font-semibold group-hover:text-masters-green transition-colors">
                          {monitor.name}
                        </h3>
                        <p className="text-xs text-muted">{monitor.manufacturer}</p>
                      </div>
                    </div>
                    {monitor.highlight ? (
                      <span className="px-2 py-1 bg-masters-green/20 text-masters-green text-xs font-medium rounded">
                        {monitor.highlight}
                      </span>
                    ) : null}
                  </div>

                  {monitor.description ? (
                    <p className="text-muted text-sm mb-4 line-clamp-2">
                      {monitor.description}
                    </p>
                  ) : null}

                  {specRows.length ? (
                    <div className="space-y-2 text-sm mb-4">
                      {specRows.map((row) => (
                        <div key={row.label} className="flex justify-between">
                          <span className="text-muted">{row.label}</span>
                          <span className={row.valueClass}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {monitor.bestFor?.length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {monitor.bestFor.slice(0, 2).map((use) => (
                        <span
                          key={use}
                          className="px-2 py-1 bg-slate text-cream-subtle text-xs rounded"
                        >
                          {use}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </section>

        {/* Technology Types */}
        <section className="mb-16">
          <h2 className="text-cream text-xl font-semibold mb-6">
            How Launch Monitor Technology Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {techTypes.map((tech) => (
              <div
                key={tech.name}
                className="border border-default bg-charcoal rounded-lg p-6"
              >
                <div className="p-2 rounded-lg bg-masters-green/10 text-masters-green w-fit mb-4">
                  <tech.icon className="w-5 h-5" />
                </div>
                <h3 className="text-cream font-semibold mb-2">{tech.name}</h3>
                <p className="text-muted text-sm mb-3">{tech.description}</p>
                <p className="text-xs text-cream-subtle">
                  Examples: {tech.examples}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Comparison Table */}
        <section className="mb-16">
          <h2 className="text-cream text-xl font-semibold mb-6">
            Quick Comparison
          </h2>
          
          <div className="border border-default rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-charcoal border-b border-default">
                  <tr>
                    <th className="text-left p-4 text-cream font-semibold">System</th>
                    <th className="text-left p-4 text-cream font-semibold">Technology</th>
                    <th className="text-left p-4 text-cream font-semibold">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {launchMonitors.map((monitor) => (
                    <tr key={monitor.slug} className="border-b border-default last:border-b-0">
                      <td className="p-4">
                        <Link
                          href={`/launch-monitors/${monitor.slug}`}
                          className="text-cream hover:text-masters-green transition-colors font-medium"
                        >
                          {monitor.name}
                        </Link>
                      </td>
                      <td className="p-4 text-muted">{monitor.technology ?? ""}</td>
                      <td className="p-4 text-cream font-mono">{monitor.price ?? ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Education CTA */}
        <section className="border border-default bg-charcoal rounded-lg p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-cream text-xl font-semibold mb-2">
                New to Launch Monitors?
              </h2>
              <p className="text-muted">
                Learn about radar vs camera technology, key metrics, and how to choose 
                the right system for your space and budget.
              </p>
            </div>
            <div className="flex gap-4 flex-shrink-0">
              <Link
                href="/blog"
                className="px-6 py-3 bg-masters-green text-deep-black font-semibold rounded-lg hover:bg-masters-green/90 transition-colors"
              >
                Read Buyer&apos;s Guide
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
