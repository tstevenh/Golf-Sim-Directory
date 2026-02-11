import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import type { BlogPost } from "@/lib/blog";

interface RelatedArticlesProps {
  posts: BlogPost[];
}

export function RelatedArticles({ posts }: RelatedArticlesProps) {
  if (posts.length === 0) return null;

  return (
    <div className="mt-16 pt-8 border-t border-subtle">
      <h3 className="text-cream text-lg font-semibold mb-6">Related Articles</h3>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block border border-subtle/50 bg-charcoal/30 p-4 rounded-lg hover:border-masters-green/50 transition-colors"
          >
            {/* Category & Read Time */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-masters-green">
                {post.category}
              </span>
              <span className="text-xs text-muted flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {post.readTime}
              </span>
            </div>
            
            {/* Title */}
            <h4 className="text-cream text-base font-medium leading-snug mb-2 group-hover:text-masters-green transition-colors line-clamp-2">
              {post.title}
            </h4>
            
            {/* Excerpt */}
            <p className="text-muted text-sm line-clamp-2 mb-3">
              {post.excerpt}
            </p>
            
            {/* Read More */}
            <span className="inline-flex items-center gap-1 text-sm text-masters-green group-hover:gap-2 transition-all">
              Read
              <ArrowRight className="w-3 h-3" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
