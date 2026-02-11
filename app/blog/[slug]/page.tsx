import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { notFound } from "next/navigation";
import { getPostBySlug, getAllSlugs } from "@/lib/blog";

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
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  
  if (!post) {
    notFound();
  }
  
  return (
    <div className="min-h-screen bg-deep-black">
      <div className="absolute inset-0 scorecard-grid opacity-20" />
      
      <article className="relative z-10">
        {/* Navigation Bar */}
        <div className="border-b border-subtle bg-deep-black/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link 
                href="/blog" 
                className="inline-flex items-center gap-2 text-muted hover:text-cream transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to articles</span>
                <span className="sm:hidden">Back</span>
              </Link>
              

            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
          
          {/* Article Content */}
          <div className="grid lg:grid-cols-[1fr_280px] gap-12">
            {/* Main Content */}
            <div>
              <div 
                className="prose prose-invert max-w-none
                  /* Typography */
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
                  
                  /* Lists */
                  prose-ul:my-6 prose-ul:space-y-2.5
                  prose-ol:my-6 prose-ol:space-y-2.5
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 border border-masters-green/50 bg-masters-green/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-masters-green" />
                    </div>
                    <div>
                      <span className="block text-sm font-medium text-cream">Written by {post.author}</span>
                      <span className="block text-xs text-muted">Published on {post.date}</span>
                    </div>
                  </div>
                  
                  <Link 
                    href="/blog" 
                    className="inline-flex items-center gap-2 text-masters-green hover:text-cream transition-colors text-sm"
                  >
                    Read more articles
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Sidebar - Sticky on desktop */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-6">
                {/* Quick Nav */}
                <div className="border border-default bg-charcoal p-5">
                  <h3 className="text-cream font-semibold mb-4 text-sm uppercase tracking-wider">In This Article</h3>
                  <nav className="space-y-2">
                    <a href="#" className="block text-sm text-muted hover:text-masters-green transition-colors py-1">
                      Introduction
                    </a>
                    <a href="#" className="block text-sm text-muted hover:text-masters-green transition-colors py-1">
                      Key Points
                    </a>
                    <a href="#" className="block text-sm text-muted hover:text-masters-green transition-colors py-1">
                      Conclusion
                    </a>
                  </nav>
                </div>
                
                {/* CTA */}
                <div className="border border-masters-green/30 bg-masters-green/5 p-5">
                  <h3 className="text-cream font-semibold mb-2">Find a Venue</h3>
                  <p className="text-muted text-sm mb-4">
                    Browse indoor golf simulators near you.
                  </p>
                  <Link href="/search" className="btn-primary w-full text-center text-sm py-2.5">
                    Search Now
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
        
        {/* Bottom CTA Section */}
        <div className="border-t border-subtle bg-charcoal/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="border border-default bg-charcoal p-6 sm:p-8 text-center">
              <h3 className="text-cream text-xl mb-3">Ready to find your next indoor golf session?</h3>
              <p className="text-muted mb-6 max-w-xl mx-auto">
                Browse thousands of indoor golf simulator venues across the USA. 
                Compare launch monitors, pricing, and amenities.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/search" className="btn-primary">
                  Search Venues
                </Link>
                <Link href="/launch-monitors" className="btn-outline">
                  Compare Launch Monitors
                </Link>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
