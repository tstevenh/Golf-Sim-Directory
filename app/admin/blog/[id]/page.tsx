import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { BlogPostForm } from "../BlogPostForm";
import { BlogPostAdminRow, getBlogAdminClient } from "@/lib/blog-admin";

interface AdminEditBlogPostPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Admin - Edit Blog Post",
};

export default async function AdminEditBlogPostPage({ params }: AdminEditBlogPostPageProps) {
  await requireAdmin();

  const { id } = await params;
  const blogAdmin = getBlogAdminClient();
  const { data, error } = await blogAdmin
    .from("blog_posts")
    .select(
      "id, slug, title, excerpt, content, read_time, category, author, featured, cover_image, faq, is_published, published_at, created_at, updated_at"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    notFound();
  }

  const post = data as BlogPostAdminRow;

  return (
    <div className="min-h-screen bg-deep-black py-12">
      <div className="absolute inset-0 scorecard-grid opacity-20" />
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-masters-green" />
            <span className="text-masters-green text-xs font-mono uppercase tracking-widest">
              Admin
            </span>
          </div>
          <h1 className="text-cream mb-2">Edit Blog Post</h1>
          <p className="text-muted">
            Last updated {new Date(post.updated_at).toLocaleString()}
          </p>
        </div>

        <BlogPostForm
          mode="edit"
          initialData={{
            id: post.id,
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt,
            content: post.content,
            read_time: post.read_time,
            category: post.category,
            author: post.author,
            featured: post.featured,
            cover_image: post.cover_image,
            faq: post.faq,
            is_published: post.is_published,
            published_at: post.published_at,
          }}
        />

        <div className="mt-8 flex items-center gap-4 text-sm">
          <Link href="/admin/blog" className="text-muted hover:text-cream transition-colors">
            ← Back to Blog CMS
          </Link>
          {post.is_published ? (
            <Link
              href={`/blog/${post.slug}`}
              target="_blank"
              className="text-masters-green hover:text-cream transition-colors"
            >
              View live post →
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
