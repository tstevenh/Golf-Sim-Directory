import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import gfm from "remark-gfm";

const postsDirectory = path.join(process.cwd(), "content/blog");

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
