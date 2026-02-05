import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog | GolfSimMap",
  description: "News, tips, and insights about indoor golf simulators and the golf industry.",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-deep-black py-12">
      <div className="absolute inset-0 scorecard-grid opacity-20" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-masters-green" />
            <span className="text-masters-green text-xs font-mono uppercase tracking-widest">Blog</span>
          </div>
          <h1 className="text-cream mb-4">Latest Articles</h1>
          <p className="text-muted">News, tips, and insights about indoor golf.</p>
        </div>

        <div className="space-y-8">
          {[
            {
              title: "How to Choose the Right Golf Simulator",
              excerpt: "TrackMan vs Foresight vs Uneekor — we break down the differences.",
              date: "Coming soon",
            },
            {
              title: "Indoor Golf Etiquette: Do&apos;s and Don&apos;ts",
              excerpt: "Make the most of your simulator session with these tips.",
              date: "Coming soon",
            },
            {
              title: "Best Golf Simulators for Beginners",
              excerpt: "Where to start if you&apos;re new to the indoor golf scene.",
              date: "Coming soon",
            },
          ].map((post, index) => (
            <article key={index} className="border border-default bg-charcoal p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs text-muted uppercase tracking-wider">{post.date}</span>
              </div>
              <h2 className="text-cream text-xl mb-2">{post.title}</h2>
              <p className="text-muted">{post.excerpt}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-subtle">
          <Link href="/" className="text-muted hover:text-cream transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
