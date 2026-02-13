import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

interface RevalidateBlogPayload {
  slug?: string;
}

function isAuthorized(request: Request): boolean {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected) return false;

  const url = new URL(request.url);
  const querySecret = url.searchParams.get("secret");
  const headerSecret = request.headers.get("x-revalidate-secret");
  const authHeader = request.headers.get("authorization");
  const bearerSecret = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  return querySecret === expected || headerSecret === expected || bearerSecret === expected;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let payload: RevalidateBlogPayload = {};
  try {
    payload = (await request.json()) as RevalidateBlogPayload;
  } catch {
    payload = {};
  }

  const slug = typeof payload.slug === "string" ? payload.slug.trim() : "";

  revalidateTag("blog-posts", "max");
  revalidatePath("/blog");
  if (slug) {
    revalidatePath(`/blog/${slug}`);
  }
  revalidatePath("/sitemap.xml");

  return NextResponse.json({
    ok: true,
    revalidated: slug ? ["/blog", `/blog/${slug}`, "/sitemap.xml"] : ["/blog", "/sitemap.xml"],
  });
}

