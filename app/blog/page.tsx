import { Metadata } from "next";
import Link from "next/link";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Indoor Golf Blog — Tips, Guides & Industry News",
  description: "Tips, buying guides, and industry news for indoor golf enthusiasts. Learn about launch monitors, simulator setups, and venue reviews.",
  alternates: {
    canonical: "https://golfsimmap.com/blog",
  },
  openGraph: {
    title: "Indoor Golf Blog — Tips, Guides & Industry News",
    description: "Tips, buying guides, and industry news for indoor golf enthusiasts. Learn about launch monitors, simulator setups, and venue reviews.",
    type: "website",
    url: "https://golfsimmap.com/blog",
  },
};

export default function BlogPage() {
  const posts = getAllPosts();
  const featuredPost = posts.find((p) => p.featured);
  const regularPosts = posts.filter((p) => !p.featured);
  const siteUrl = "https://golfsimmap.com";
  const toAbsoluteUrl = (url: string) => {
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${siteUrl}${url.startsWith("/") ? url : `/${url}`}`;
  };
  const blogCollectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "GolfSimMap Blog",
    description:
      "Tips, buying guides, and industry news for indoor golf enthusiasts. Learn about launch monitors, simulator setups, and venue reviews.",
    url: `${siteUrl}/blog`,
    mainEntity: {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListOrderDescending",
      numberOfItems: posts.length,
      itemListElement: posts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${siteUrl}/blog/${post.slug}`,
        name: post.title,
        image: post.coverImage ? toAbsoluteUrl(post.coverImage) : undefined,
      })),
    },
  };

  return (
    <div className="min-h-screen bg-deep-black py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogCollectionSchema) }}
      />
      <div className="absolute inset-0 scorecard-grid opacity-20" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-masters-green" />
            <span className="text-masters-green text-xs font-mono uppercase tracking-widest">Blog</span>
          </div>
          <h1 className="text-cream text-3xl md:text-4xl mb-4">Latest Articles</h1>
          <p className="text-muted max-w-2xl">
            Tips, buying guides, and insights for indoor golf enthusiasts. 
            Whether you&apos;re a venue owner or a golfer looking for your next session.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16 border border-default rounded-lg bg-charcoal">
            <p className="text-muted">No articles yet. Check back soon!</p>
          </div>
        ) : (
          <>
            {/* Featured Post */}
            {featuredPost && (
              <Link href={`/blog/${featuredPost.slug}`} className="block mb-12">
                <article className="border border-default bg-charcoal overflow-hidden hover:border-masters-green/50 transition-colors cursor-pointer">
                  <div className="p-8">
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      <span className="text-xs font-mono uppercase tracking-wider text-masters-green bg-masters-green/10 px-2 py-1">
                        {featuredPost.category}
                      </span>
                      <span className="text-xs text-muted flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {featuredPost.date}
                      </span>
                      <span className="text-xs text-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {featuredPost.readTime}
                      </span>
                    </div>
                    <h2 className="text-cream text-2xl md:text-3xl mb-4">
                      {featuredPost.title}
                    </h2>
                    <p className="text-muted mb-6 text-lg">
                      {featuredPost.excerpt}
                    </p>
                    <span className="inline-flex items-center gap-2 text-masters-green group-hover:text-cream transition-colors">
                      Read Article
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </article>
              </Link>
            )}

            {/* Regular Posts */}
            <div className="grid md:grid-cols-2 gap-6">
              {regularPosts.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="block">
                  <article className="border border-default bg-charcoal p-6 hover:border-masters-green/50 transition-colors cursor-pointer h-full">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="text-xs font-mono uppercase tracking-wider text-masters-green">
                        {post.category}
                      </span>
                      <span className="text-xs text-muted">{post.date}</span>
                    </div>
                    <h3 className="text-cream text-xl mb-3 leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-muted text-sm mb-4">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                      <span className="text-sm text-masters-green group-hover:text-cream transition-colors">
                        Read →
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Empty State / Coming More */}
        <div className="mt-12 text-center border-t border-subtle pt-12">
          <p className="text-muted mb-4">
            Have a topic suggestion? Let us know.
          </p>
          <Link
            href="/contact"
            className="text-masters-green hover:text-cream transition-colors text-sm"
          >
            Contact us →
          </Link>
        </div>

        {/* Back to Home */}
        <div className="mt-12">
          <Link href="/" className="text-muted hover:text-cream transition-colors text-sm">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
