import "server-only";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

const blogAdminClient =
  supabaseUrl && supabaseServiceRole
    ? createClient(supabaseUrl, supabaseServiceRole)
    : null;

export interface BlogPostAdminRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  read_time: string | null;
  category: string | null;
  author: string | null;
  featured: boolean;
  cover_image: string | null;
  faq: unknown;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogPostAdminInput {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  read_time: string;
  category: string;
  author: string;
  featured: boolean;
  cover_image: string;
  faq: unknown;
  is_published: boolean;
  published_at: string | null;
}

export function getBlogAdminClient() {
  if (!blogAdminClient) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return blogAdminClient;
}

export function normalizeBlogSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function normalizeFaq(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    const parsed = JSON.parse(trimmed) as unknown;
    if (!Array.isArray(parsed)) {
      throw new Error("FAQ must be a JSON array.");
    }
    return parsed;
  }
  return [];
}

export function normalizeBlogInput(body: unknown): BlogPostAdminInput {
  const record = (body || {}) as Record<string, unknown>;

  const slug = normalizeBlogSlug(String(record.slug || ""));
  const title = String(record.title || "").trim();
  const content = String(record.content || "").trim();
  const excerpt = String(record.excerpt || "").trim();
  const read_time = String(record.read_time || "").trim();
  const category = String(record.category || "").trim();
  const author = String(record.author || "").trim() || "GolfSimMap Team";
  const cover_image = String(record.cover_image || "").trim();
  const featured = Boolean(record.featured);
  const is_published = Boolean(record.is_published);
  const publishedRaw = String(record.published_at || "").trim();
  let published_at: string | null = null;
  if (publishedRaw) {
    const parsed = new Date(publishedRaw);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error("Published date is invalid.");
    }
    published_at = parsed.toISOString();
  }
  const faq = normalizeFaq(record.faq);

  if (!slug) {
    throw new Error("Slug is required.");
  }
  if (!title) {
    throw new Error("Title is required.");
  }
  if (!content) {
    throw new Error("Content is required.");
  }

  return {
    slug,
    title,
    excerpt,
    content,
    read_time,
    category,
    author,
    featured,
    cover_image,
    faq,
    is_published,
    published_at,
  };
}
