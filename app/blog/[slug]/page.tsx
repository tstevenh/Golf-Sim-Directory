import { Metadata } from "next";
import Link from "next/link";
import { Calendar, Clock, User, Search, MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import { getPostBySlug, getAllSlugs, getRelatedPosts } from "@/lib/blog";
import { SocialShare } from "@/components/ui/SocialShare";
import { RelatedArticles } from "@/components/blog/RelatedArticles";
import Image from "next/image";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  
  if (!post) {
    return {
      title: "Article Not Found",
    };
  }
  
  return {
    title: `${post.title} — GolfSimMap Blog`,
    description: post.excerpt,
    alternates: {
      canonical: `https://golfsimmap.com/blog/${slug}`,
    },
    openGraph: {
      title: `${post.title} — GolfSimMap Blog`,
      description: post.excerpt,
      type: "article",
      url: `https://golfsimmap.com/blog/${slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  
  if (!post) {
    notFound();
  }
  
  // Get related articles
  const relatedPosts = getRelatedPosts(slug, post.category, 3);
  
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date ? new Date(post.date).toISOString() : undefined,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "GolfSimMap",
      url: "https://golfsimmap.com",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://golfsimmap.com/blog/${slug}`,
    },
  };

  return (
    <div className="min-h-screen bg-deep-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <div className="absolute inset-0 scorecard-grid opacity-20" />

      <article className="relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          {/* Article Header */}
          <header className="mb-12 pb-8 border-b border-subtle">
            {/* Category & Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="text-xs font-mono uppercase tracking-wider text-masters-green bg-masters-green/10 px-3 py-1.5">
                {post.category}
              </span>
              <span className="text-sm text-muted flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {post.date}
              </span>
              <span className="text-sm text-muted flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {post.readTime}
              </span>
            </div>
            
            {/* Title */}
            <h1 className="text-cream text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight tracking-tight">
              {post.title}
            </h1>
            
            {/* Excerpt - Lead paragraph */}
            <p className="text-lg sm:text-xl text-cream/80 leading-relaxed mb-8 max-w-3xl">
              {post.excerpt}
            </p>
            
            {/* Cover Image */}
            {post.coverImage && (
              <div className="relative w-full aspect-[16/9] mb-8 rounded-lg overflow-hidden border border-subtle/50">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
            
            {/* Author */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border border-masters-green/50 bg-masters-green/10 flex items-center justify-center">
                <User className="w-5 h-5 text-masters-green" />
              </div>
              <div>
                <span className="block text-sm font-medium text-cream">{post.author}</span>
                <span className="block text-xs text-muted">GolfSimMap Contributor</span>
              </div>
            </div>
          </header>
          
          {/* Article Content - Single Section */}
          <div className="article-content">
            <div 
              className="prose prose-invert max-w-none
                /* Typography - paragraphs */
                prose-p:text-cream/80 prose-p:text-lg prose-p:leading-[1.9] prose-p:mb-6
                
                /* Headings */
                prose-headings:text-cream prose-headings:font-bold prose-headings:tracking-tight
                prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-5 prose-h2:pt-4 prose-h2:border-t prose-h2:border-subtle/50
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
                prose-h4:text-lg prose-h4:mt-6 prose-h4:mb-3
                
                /* Bold */
                prose-strong:text-cream prose-strong:font-semibold
                
                /* Links */
                prose-a:text-masters-green prose-a:font-medium prose-a:no-underline 
                hover:prose-a:text-cream hover:prose-a:underline prose-a:transition-colors
                
                /* Lists - critical fixes for spacing */
                prose-ul:my-6 prose-ul:pl-6
                prose-ol:my-6 prose-ol:pl-6
                prose-li:text-cream/80 prose-li:text-lg prose-li:leading-relaxed
                prose-li:marker:text-masters-green prose-li:marker:font-bold
                
                /* Blockquotes */
                prose-blockquote:border-l-2 prose-blockquote:border-masters-green 
                prose-blockquote:bg-masters-green/5 prose-blockquote:py-4 prose-blockquote:px-6
                prose-blockquote:my-8 prose-blockquote:rounded-r
                prose-blockquote:text-cream/90 prose-blockquote:text-lg prose-blockquote:italic
                prose-blockquote:not-italic
                
                /* Tables */
                prose-table:my-8 prose-table:border-collapse
                prose-thead:border-b prose-thead:border-subtle
                prose-th:text-left prose-th:py-3 prose-th:px-4 prose-th:text-cream prose-th:font-semibold prose-th:bg-charcoal
                prose-td:py-3 prose-td:px-4 prose-td:text-cream/80 prose-td:border-b prose-td:border-subtle/50
                prose-tr:hover:prose-tr:bg-charcoal/50
                
                /* Horizontal Rule */
                prose-hr:my-10 prose-hr:border-subtle prose-hr:border-t-2
                
                /* First paragraph styling */
                [&>p:first-of-type]:text-xl [&>p:first-of-type]:text-cream/90 [&>p:first-of-type]:font-medium
                
                /* Code (if any) */
                prose-code:text-masters-green prose-code:bg-masters-green/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                
                /* Images */
                prose-img:rounded prose-img:my-8 prose-img:border prose-img:border-subtle"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            
            {/* Article Footer */}
            <div className="mt-16 pt-8 border-t border-subtle">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 border border-masters-green/50 bg-masters-green/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-masters-green" />
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-cream">Written by {post.author}</span>
                    <span className="block text-xs text-muted">Published on {post.date}</span>
                  </div>
                </div>
                
                <SocialShare 
                  url={`https://golfsimmap.com/blog/${slug}`} 
                  title={post.title} 
                />
              </div>
            </div>
            
            {/* Related Articles */}
            <RelatedArticles posts={relatedPosts} />
          </div>
        </div>
        
        {/* Compact Sticky Bottom CTA - Horizontal Bar Design */}
        <div className="fixed bottom-4 left-4 right-4 z-40">
          <div className="max-w-4xl mx-auto">
            <div className="bg-charcoal/95 backdrop-blur-md border border-subtle/60 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-5">
                {/* Left - Text */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-cream font-semibold text-base sm:text-lg mb-1 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-masters-green flex-shrink-0" />
                    Find golf simulators near you
                  </h3>
                  <p className="text-muted text-sm hidden sm:block">
                    Search 3,000+ venues by city and state.
                  </p>
                </div>
                
                {/* Right - Buttons */}
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  <Link
                    href="/search"
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-masters-green hover:bg-masters-green/90 text-deep-black font-semibold text-sm rounded-lg transition-colors"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </Link>
                  <Link
                    href="/venue/us"
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate hover:bg-slate/80 text-cream font-medium text-sm rounded-lg transition-colors border border-subtle/50"
                  >
                    <span>Browse</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom padding for sticky CTA */}
        <div className="h-28 sm:h-24" />
      </article>
    </div>
  );
}
