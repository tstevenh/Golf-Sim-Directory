import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import gfm from "remark-gfm";

const postsDirectory = path.join(process.cwd(), "content/blog");

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
  const entries = parseFaqEntries(data.faq ?? data.faqs);
  return entries;
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

export function getAllPosts(): BlogPost[] {
  // Check if directory exists
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

  // Sort by date (newest first)
  return allPosts.sort((a, b) => {
    if (a.date < b.date) return 1;
    return -1;
  });
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  // Try .mdx first, then .md
  const mdxPath = path.join(postsDirectory, `${slug}.mdx`);
  const mdPath = path.join(postsDirectory, `${slug}.md`);

  const fullPath = fs.existsSync(mdxPath) ? mdxPath : fs.existsSync(mdPath) ? mdPath : null;

  if (!fullPath) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  const frontmatter = data as Record<string, unknown>;
  const frontmatterFaq = parseFaqFromFrontmatter(frontmatter);
  const faq = frontmatterFaq.length ? frontmatterFaq : extractFaqFromMarkdown(content);

  // Convert markdown to HTML
  const processedContent = await remark()
    .use(gfm)
    .use(html, { allowDangerousHtml: true })
    .process(content);
  const contentHtml = processedContent.toString();

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

export function getAllSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames
    .filter((fileName) => fileName.endsWith(".md") || fileName.endsWith(".mdx"))
    .map((fileName) => fileName.replace(/\.mdx?$/, ""));
}

export function getRelatedPosts(currentSlug: string, category: string, limit: number = 3): BlogPost[] {
  const allPosts = getAllPosts();
  
  // Filter out current post
  const otherPosts = allPosts.filter((post) => post.slug !== currentSlug);
  
  // First, try to find posts in the same category
  const sameCategory = otherPosts.filter((post) => post.category === category);
  
  // If we have enough in the same category, return those
  if (sameCategory.length >= limit) {
    return sameCategory.slice(0, limit);
  }
  
  // Otherwise, fill with other recent posts
  const remaining = limit - sameCategory.length;
  const differentCategory = otherPosts.filter((post) => post.category !== category);
  
  return [...sameCategory, ...differentCategory.slice(0, remaining)];
}
