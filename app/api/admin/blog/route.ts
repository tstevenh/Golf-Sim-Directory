import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getUser } from "@/lib/auth";
import { getBlogAdminClient, normalizeBlogInput } from "@/lib/blog-admin";

// POST /api/admin/blog - Create blog post
export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user?.id || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const input = normalizeBlogInput(body);
    const blogAdmin = getBlogAdminClient();

    const insertPayload = {
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
      published_at: input.is_published
        ? input.published_at || new Date().toISOString()
        : null,
    };

    const { data, error } = await blogAdmin
      .from("blog_posts")
      .insert(insertPayload)
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
    revalidatePath("/sitemap.xml");
    revalidatePath("/admin/blog");

    return NextResponse.json({
      ok: true,
      id: data.id,
      slug: data.slug,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create blog post";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
