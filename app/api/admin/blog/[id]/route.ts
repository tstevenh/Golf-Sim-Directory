import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getUser } from "@/lib/auth";
import { getBlogAdminClient, normalizeBlogInput } from "@/lib/blog-admin";

// PATCH /api/admin/blog/[id] - Update blog post
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user?.id || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const input = normalizeBlogInput(body);
    const blogAdmin = getBlogAdminClient();

    const { data: existing, error: existingError } = await blogAdmin
      .from("blog_posts")
      .select("slug, published_at")
      .eq("id", id)
      .maybeSingle();

    if (existingError) throw existingError;
    if (!existing) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    const publishedAt = input.is_published
      ? input.published_at || existing.published_at || new Date().toISOString()
      : null;

    const updatePayload = {
      slug: input.slug,
      title: input.title,
      excerpt: input.excerpt || null,
      content: input.content,
      read_time: input.read_time || null,
      category: input.category || null,
      author: input.author || "GolfSimMap Team",
      featured: input.featured,
      cover_image: input.cover_image || null,
      faq: input.faq,
      is_published: input.is_published,
      published_at: publishedAt,
    };

    const { data, error } = await blogAdmin
      .from("blog_posts")
      .update(updatePayload)
      .eq("id", id)
      .select("id, slug")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Slug already exists." }, { status: 409 });
      }
      throw error;
    }

    revalidateTag("blog-posts", "max");
    revalidatePath("/blog");
    revalidatePath(`/blog/${data.slug}`);
    if (existing.slug !== data.slug) {
      revalidatePath(`/blog/${existing.slug}`);
    }
    revalidatePath("/sitemap.xml");
    revalidatePath("/admin/blog");
    revalidatePath(`/admin/blog/${id}`);

    return NextResponse.json({
      ok: true,
      id: data.id,
      slug: data.slug,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update blog post";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
