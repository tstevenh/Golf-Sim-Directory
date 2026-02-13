import fs from "fs";
import path from "path";
import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import gfm from "remark-gfm";

const postsDirectory = path.join(process.cwd(), "content/blog");
const SIX_MONTHS = 15552000;
const BLOG_CACHE_TAG = "blog-posts";
const BLOG_CONTENT_SOURCE = (process.env.BLOG_CONTENT_SOURCE || "supabase").toLowerCase();

interface SupabaseBlogPostRow {
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  read_time: string | null;
  category: string | null;
  author: string | null;
  featured: boolean | null;
  cover_image: string | null;
  faq: unknown;
  published_at: string | null;
}

type SupabaseBlogLoadResult =
  | { ok: true; rows: SupabaseBlogPostRow[] }
  | { ok: false };

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const blogSupabase =
  supabaseUrl && supabaseServiceRole
    ? createClient(supabaseUrl, supabaseServiceRole)
    : null;

export interface BlogFaqItem {
  question: string;
  answer: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  category: string;
  author: string;
  featured?: boolean;
  coverImage?: string;
  faq?: BlogFaqItem[];
}

function toText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseFaqEntries(value: unknown): BlogFaqItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const record = entry as Record<string, unknown>;
      const question = toText(record.question ?? record.q ?? record.name);
      const answer = toText(record.answer ?? record.a ?? record.text);
      if (!question || !answer) return null;
      return { question, answer };
    })
    .filter((entry): entry is BlogFaqItem => Boolean(entry));
}

function parseFaqFromFrontmatter(data: Record<string, unknown>): BlogFaqItem[] {
  return parseFaqEntries(data.faq ?? data.faqs);
}

function cleanMarkdownText(value: string): string {
  return value
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/[`*_~]/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractFaqFromMarkdown(markdown: string): BlogFaqItem[] {
  const lines = markdown.split("\n");
  const headingPattern = /^(#{1,6})\s+(.+?)\s*#*\s*$/;
  const faqSectionPattern = /^(faq|frequently asked questions?)[:\s]*$/i;

  let faqStartIndex = -1;
  let faqHeadingLevel = 0;

  for (let i = 0; i < lines.length; i += 1) {
    const match = lines[i].match(headingPattern);
    if (!match) continue;

    const level = match[1].length;
    const headingText = cleanMarkdownText(match[2]).toLowerCase();
    if (faqSectionPattern.test(headingText)) {
      faqStartIndex = i;
      faqHeadingLevel = level;
      break;
    }
  }

  if (faqStartIndex === -1) return [];

  const faqs: BlogFaqItem[] = [];
  let currentQuestion = "";
  let answerLines: string[] = [];

  const pushCurrentFaq = () => {
    const question = cleanMarkdownText(currentQuestion);
    const answer = cleanMarkdownText(
      answerLines
        .map((line) => line.replace(/^[-*+]\s+/, "").trim())
        .join(" ")
    );

    if (question && answer) {
      faqs.push({ question, answer });
    }

    currentQuestion = "";
    answerLines = [];
  };

  for (let i = faqStartIndex + 1; i < lines.length; i += 1) {
    const line = lines[i];
    const headingMatch = line.match(headingPattern);

    if (headingMatch) {
      const level = headingMatch[1].length;
      const headingText = cleanMarkdownText(headingMatch[2]);

      if (level <= faqHeadingLevel) {
        pushCurrentFaq();
        break;
      }

      if (currentQuestion) {
        pushCurrentFaq();
      }
      currentQuestion = headingText;
      continue;
    }

    if (currentQuestion && line.trim()) {
      answerLines.push(line);
    }
  }

  pushCurrentFaq();
  return faqs;
}

async function markdownToHtml(markdown: string): Promise<string> {
  const processedContent = await remark()
    .use(gfm)
    .use(html, { allowDangerousHtml: true })
    .process(markdown);
  return processedContent.toString();
}

function mapSupabaseRowToBlogPost(row: SupabaseBlogPostRow): BlogPost {
  const markdown = toText(row.content);
  const faqFromColumn = parseFaqEntries(row.faq);
  const faq = faqFromColumn.length ? faqFromColumn : extractFaqFromMarkdown(markdown);

  return {
    slug: toText(row.slug),
    title: toText(row.title),
    excerpt: toText(row.excerpt),
    content: markdown,
    date: toText(row.published_at),
    readTime: toText(row.read_time),
    category: toText(row.category),
    author: toText(row.author) || "GolfSimMap Team",
    featured: Boolean(row.featured),
    coverImage: toText(row.cover_image),
    faq,
  };
}

const getCachedSupabasePosts = unstable_cache(
  async (): Promise<SupabaseBlogLoadResult> => {
    if (!blogSupabase) {
      return { ok: false };
    }

    const { data, error } = await blogSupabase
      .from("blog_posts")
      .select(
        "slug, title, excerpt, content, read_time, category, author, featured, cover_image, faq, published_at"
      )
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    if (error) {
      return { ok: false };
    }

    return {
      ok: true,
      rows: (data || []) as SupabaseBlogPostRow[],
    };
  },
  ["blog-posts-supabase"],
  { revalidate: SIX_MONTHS, tags: [BLOG_CACHE_TAG] }
);

const getCachedSupabasePostBySlug = unstable_cache(
  async (slug: string): Promise<SupabaseBlogLoadResult> => {
    if (!blogSupabase) {
      return { ok: false };
    }

    const { data, error } = await blogSupabase
      .from("blog_posts")
      .select(
        "slug, title, excerpt, content, read_time, category, author, featured, cover_image, faq, published_at"
      )
      .eq("is_published", true)
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      return { ok: false };
    }

    return {
      ok: true,
      rows: data ? [data as SupabaseBlogPostRow] : [],
    };
  },
  ["blog-post-by-slug-supabase"],
  { revalidate: SIX_MONTHS, tags: [BLOG_CACHE_TAG] }
);

function getAllPostsFromFilesystem(): BlogPost[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const allPosts = fileNames
    .filter((fileName) => fileName.endsWith(".md") || fileName.endsWith(".mdx"))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx?$/, "");
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);
      const frontmatter = data as Record<string, unknown>;
      const frontmatterFaq = parseFaqFromFrontmatter(frontmatter);
      const faq = frontmatterFaq.length ? frontmatterFaq : extractFaqFromMarkdown(content);

      return {
        slug,
        title: data.title || "",
        excerpt: data.excerpt || "",
        content: content || "",
        date: data.date || "",
        readTime: data.readTime || "",
        category: data.category || "",
        author: data.author || "GolfSimMap Team",
        featured: data.featured || false,
        coverImage: data.coverImage || "",
        faq,
      };
    });

  return allPosts.sort((a, b) => {
    if (a.date < b.date) return 1;
    return -1;
  });
}

async function getPostBySlugFromFilesystem(slug: string): Promise<BlogPost | null> {
  const mdxPath = path.join(postsDirectory, `${slug}.mdx`);
  const mdPath = path.join(postsDirectory, `${slug}.md`);
  const fullPath = fs.existsSync(mdxPath) ? mdxPath : fs.existsSync(mdPath) ? mdPath : null;

  if (!fullPath) return null;

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  const frontmatter = data as Record<string, unknown>;
  const frontmatterFaq = parseFaqFromFrontmatter(frontmatter);
  const faq = frontmatterFaq.length ? frontmatterFaq : extractFaqFromMarkdown(content);
  const contentHtml = await markdownToHtml(content);

  return {
    slug,
    title: data.title || "",
    excerpt: data.excerpt || "",
    content: contentHtml,
    date: data.date || "",
    readTime: data.readTime || "",
    category: data.category || "",
    author: data.author || "GolfSimMap Team",
    featured: data.featured || false,
    coverImage: data.coverImage || "",
    faq,
  };
}

export async function getAllPosts(): Promise<BlogPost[]> {
  if (BLOG_CONTENT_SOURCE !== "filesystem") {
    const result = await getCachedSupabasePosts();
    if (result.ok) {
      return result.rows.map(mapSupabaseRowToBlogPost);
    }
  }

  return getAllPostsFromFilesystem();
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  if (BLOG_CONTENT_SOURCE !== "filesystem") {
    const result = await getCachedSupabasePostBySlug(slug);
    if (result.ok) {
      const row = result.rows[0];
      if (!row) return null;
      const post = mapSupabaseRowToBlogPost(row);
      return {
        ...post,
        content: await markdownToHtml(post.content),
      };
    }
  }

  return getPostBySlugFromFilesystem(slug);
}

export async function getAllSlugs(): Promise<string[]> {
  const posts = await getAllPosts();
  return posts.map((post) => post.slug);
}

export async function getRelatedPosts(
  currentSlug: string,
  category: string,
  limit: number = 3
): Promise<BlogPost[]> {
  const allPosts = await getAllPosts();
  const otherPosts = allPosts.filter((post) => post.slug !== currentSlug);
  const sameCategory = otherPosts.filter((post) => post.category === category);

  if (sameCategory.length >= limit) {
    return sameCategory.slice(0, limit);
  }

  const remaining = limit - sameCategory.length;
  const differentCategory = otherPosts.filter((post) => post.category !== category);
  return [...sameCategory, ...differentCategory.slice(0, remaining)];
}

