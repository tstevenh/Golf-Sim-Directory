import { Metadata } from "next";
import Link from "next/link";
import { 
  Trophy, 
  Monitor, 
  UtensilsCrossed, 
  Heart, 
  Users, 
  Briefcase, 
  Baby,
  Zap,
  GraduationCap,
  ArrowRight
} from "lucide-react";

export const metadata: Metadata = {
  title: "Best Golf Simulators by Category | GolfSimMap",
  description: "Discover the best golf simulators by category — date night, serious practice, family-friendly, corporate events, and more.",
};

const categories = [
  {
    id: "vibe",
    title: "By Vibe",
    description: "Find the perfect atmosphere for your outing",
    items: [
      { label: "Upscale Lounge", href: "/best/vibe/upscale-lounge", icon: Trophy },
      { label: "Sports Bar", href: "/best/vibe/sports-bar", icon: Monitor },
      { label: "Tech Lab", href: "/best/vibe/tech-lab", icon: Zap },
      { label: "Party Atmosphere", href: "/best/vibe/party-atmosphere", icon: Users },
    ],
  },
  {
    id: "tags",
    title: "By Experience",
    description: "Curated venues for specific occasions",
    items: [
      { label: "Date Night", href: "/best/date-night", icon: Heart },
      { label: "Corporate Events", href: "/best/corporate-events", icon: Briefcase },
      { label: "Family Friendly", href: "/best/family-friendly", icon: Baby },
      { label: "Serious Practice", href: "/best/serious-practice", icon: Zap },
    ],
  },
  {
    id: "hardware",
    title: "By Hardware",
    description: "Find venues with your preferred technology",
    items: [
      { label: "TrackMan", href: "/best/hardware/trackman", icon: Monitor },
      { label: "Foresight", href: "/best/hardware/foresight", icon: Monitor },
      { label: "Uneekor", href: "/best/hardware/uneekor", icon: Monitor },
      { label: "Full Swing", href: "/best/hardware/full-swing", icon: Monitor },
    ],
  },
  {
    id: "who-its-for",
    title: "By Golfer Type",
    description: "Venues tailored to your skill level and needs",
    items: [
      { label: "Beginners", href: "/best/who-its-for/beginners", icon: GraduationCap },
      { label: "Serious Golfers", href: "/best/who-its-for/serious-golfers", icon: Zap },
      { label: "Families", href: "/best/who-its-for/families", icon: Baby },
      { label: "Large Groups", href: "/best/who-its-for/large-groups", icon: Users },
    ],
  },
];

export default function BestByIndexPage() {
  return (
    <div className="min-h-screen bg-deep-black">
      <div className="absolute inset-0 scorecard-grid opacity-20" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-masters-green" />
            <span className="text-masters-green text-xs font-mono uppercase tracking-widest">Categories</span>
          </div>
          
          <h1 className="text-cream mb-4">Best Golf Simulators</h1>
          <p className="text-muted max-w-2xl text-lg">
            Find the perfect golf simulator venue by category. Whether you&apos;re planning 
            a date night, corporate event, or serious practice session, we&apos;ve got you covered.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {categories.map((category) => (
            <div key={category.id} className="border border-default bg-charcoal p-6">
              <div className="mb-6">
                <h2 className="text-cream text-xl mb-2">{category.title}</h2>
                <p className="text-muted text-sm">{category.description}</p>
              </div>
              
              <div className="space-y-2">
                {category.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center justify-between gap-4 p-4 bg-slate hover:bg-masters-green/10 border border-default hover:border-masters-green transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-muted group-hover:text-masters-green transition-colors" />
                        <span className="text-cream group-hover:text-masters-green transition-colors">
                          {item.label}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted group-hover:text-masters-green group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center border border-default bg-charcoal p-8">
          <h2 className="text-cream mb-2">Own a golf simulator venue?</h2>
          <p className="text-muted mb-6">
            Get featured in our best-by categories and reach more golfers.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/submit" className="btn-primary">
              Submit Your Venue
            </Link>
            <Link href="/claim" className="btn-outline">
              Claim Listing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
