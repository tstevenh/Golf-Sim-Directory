import Link from "next/link";
import { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getBlogAdminClient } from "@/lib/blog-admin";

interface BlogPostListRow {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  author: string | null;
  featured: boolean;
  is_published: boolean;
  published_at: string | null;
  updated_at: string;
}

export const metadata: Metadata = {
  title: "Admin - Blog",
};

export default async function AdminBlogPage() {
  await requireAdmin();

  const blogAdmin = getBlogAdminClient();
  const { data, error } = await blogAdmin
    .from("blog_posts")
    .select("id, slug, title, category, author, featured, is_published, published_at, updated_at, created_at")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const posts = (data || []) as BlogPostListRow[];

  return (
    <div className="min-h-screen bg-deep-black py-12">
      <div className="absolute inset-0 scorecard-grid opacity-20" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-masters-green" />
              <span className="text-masters-green text-xs font-mono uppercase tracking-widest">
                Admin
              </span>
            </div>
            <h1 className="text-cream mb-2">Blog CMS</h1>
            <p className="text-muted">Create, edit, and publish blog posts.</p>
          </div>
          <Link
            href="/admin/blog/new"
            className="px-4 py-2 bg-masters-green text-deep-black font-medium hover:bg-masters-green/90 transition-colors"
          >
            + New Post
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="border border-default bg-charcoal p-10 text-center">
            <p className="text-muted mb-4">No blog posts yet.</p>
            <Link
              href="/admin/blog/new"
              className="text-masters-green hover:text-cream transition-colors"
            >
              Create your first post →
            </Link>
          </div>
        ) : (
          <div className="border border-default bg-charcoal overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-deep-black border-b border-default">
                <tr>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-muted">Title</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-muted">Status</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-muted">Updated</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-b border-default/50 last:border-b-0">
                    <td className="px-4 py-4">
                      <p className="text-cream font-medium">{post.title}</p>
                      <p className="text-xs text-muted">
                        /blog/{post.slug}
                        {post.category ? ` • ${post.category}` : ""}
                        {post.author ? ` • ${post.author}` : ""}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-xs px-2 py-1 border ${post.is_published ? "border-masters-green text-masters-green" : "border-default text-muted"}`}>
                          {post.is_published ? "Published" : "Draft"}
                        </span>
                        {post.featured ? (
                          <span className="text-xs px-2 py-1 border border-muted-gold text-muted-gold">
                            Featured
                          </span>
                        ) : null}
                      </div>
                      {post.published_at ? (
                        <p className="text-xs text-muted mt-1">
                          {new Date(post.published_at).toLocaleString()}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 text-sm text-muted">
                      {new Date(post.updated_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3 text-sm">
                        <Link
                          href={`/admin/blog/${post.id}`}
                          className="text-masters-green hover:text-cream transition-colors"
                        >
                          Edit
                        </Link>
                        {post.is_published ? (
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            className="text-muted hover:text-cream transition-colors"
                          >
                            View
                          </Link>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8">
          <Link href="/dashboard" className="text-muted hover:text-cream transition-colors">
            ← Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
