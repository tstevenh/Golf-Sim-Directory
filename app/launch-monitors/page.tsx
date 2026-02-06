import { Metadata } from "next";
import Link from "next/link";
import { Target, Cpu, Camera, Radar } from "lucide-react";

export const metadata: Metadata = {
  title: "Golf Launch Monitor Guide & Reviews | GolfSimMap",
  description: "Compare the top golf launch monitors: TrackMan 4, Foresight GCQuad, Uneekor EYE XO. Find specs, pricing, accuracy data, and which system is right for you.",
};

const launchMonitors = [
  {
    slug: "trackman-4",
    name: "TrackMan 4",
    manufacturer: "TrackMan",
    technology: "Dual Radar + Camera",
    price: "$19,995 - $25,495",
    accuracy: "±0.5 yards",
    bestFor: ["Tour Players", "Professionals", "Serious Amateurs"],
    metrics: 40,
    icon: Radar,
    description: "The gold standard used by PGA Tour professionals. Dual Doppler radar tracks full ball flight with unmatched outdoor accuracy.",
    highlight: "Tour-Proven",
  },
  {
    slug: "gcquad",
    name: "Foresight GCQuad",
    manufacturer: "Foresight Sports",
    technology: "Quadrascopic Camera",
    price: "$14,500 - $19,999",
    accuracy: "±0.3 yards",
    bestFor: ["Club Fitters", "Indoor Facilities", "Coaches"],
    metrics: 16,
    icon: Camera,
    description: "Four high-speed cameras capture impact with exceptional precision. The industry leader for indoor club fitting and coaching.",
    highlight: "Most Accurate",
  },
  {
    slug: "uneekor-eyexo",
    name: "Uneekor EYE XO",
    manufacturer: "Uneekor",
    technology: "Dual High-Speed Camera",
    price: "$8,000",
    accuracy: "±0.5° launch",
    bestFor: ["Home Simulators", "Commercial", "Value Seekers"],
    metrics: 24,
    icon: Target,
    description: "Overhead-mounted system with non-marking ball technology. Exceptional value with professional-grade accuracy for indoor setups.",
    highlight: "Best Value",
  },
];

const techTypes = [
  {
    name: "Radar Systems",
    icon: Radar,
    description: "Doppler radar tracks full ball flight from launch to landing. Best for outdoor use and maximum accuracy.",
    examples: "TrackMan, FlightScope",
  },
  {
    name: "Camera Systems",
    icon: Camera,
    description: "High-speed cameras capture impact data with precision. Ideal for indoor simulators and club fitting.",
    examples: "Foresight GCQuad, Uneekor",
  },
  {
    name: "Hybrid Systems",
    icon: Cpu,
    description: "Combine radar and camera technology for comprehensive data in any environment.",
    examples: "TrackMan 4 (Radar + Camera)",
  },
];

export default function LaunchMonitorsIndexPage() {
  return (
    <div className="min-h-screen bg-deep-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <nav className="flex items-center gap-2 text-sm text-muted mb-6">
            <Link href="/" className="hover:text-cream transition-colors">Home</Link>
            <span>/</span>
            <span className="text-cream">Launch Monitors</span>
          </nav>
          
          <h1 className="text-cream text-3xl md:text-4xl font-bold mb-4">
            Golf Launch Monitor Guide
          </h1>
          <p className="text-muted text-lg max-w-2xl">
            Compare the industry&apos;s top launch monitors. Real specifications, verified pricing, 
            and unbiased analysis to help you choose the right system for your game.
          </p>
        </div>

        {/* Featured Systems */}
        <section className="mb-16">
          <h2 className="text-cream text-xl font-semibold mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-masters-green" />
            Top-Rated Launch Monitors
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {launchMonitors.map((monitor) => (
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
                  <span className="px-2 py-1 bg-masters-green/20 text-masters-green text-xs font-medium rounded">
                    {monitor.highlight}
                  </span>
                </div>

                <p className="text-muted text-sm mb-4 line-clamp-2">
                  {monitor.description}
                </p>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted">Technology</span>
                    <span className="text-cream-subtle">{monitor.technology}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Price Range</span>
                    <span className="text-cream font-mono">{monitor.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Accuracy</span>
                    <span className="text-cream-subtle">{monitor.accuracy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Data Points</span>
                    <span className="text-cream-subtle">{monitor.metrics}+</span>
                  </div>
                </div>

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
              </Link>
            ))}
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
                    <th className="text-left p-4 text-cream font-semibold">Best For</th>
                    <th className="text-left p-4 text-cream font-semibold">Indoor/Outdoor</th>
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
                      <td className="p-4 text-muted">{monitor.technology}</td>
                      <td className="p-4 text-cream font-mono">{monitor.price}</td>
                      <td className="p-4 text-muted">{monitor.bestFor[0]}</td>
                      <td className="p-4">
                        <span className="text-cream-subtle">
                          {monitor.slug === 'trackman-4' ? 'Both' : 'Indoor'}
                        </span>
                      </td>
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
