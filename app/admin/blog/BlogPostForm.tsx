"use client";

import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface BlogPostFormInitialData {
  id?: string;
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
}

interface BlogPostFormProps {
  mode: "create" | "edit";
  initialData?: BlogPostFormInitialData;
}

interface FormState {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  readTime: string;
  category: string;
  author: string;
  coverImage: string;
  faqJson: string;
  featured: boolean;
  isPublished: boolean;
  publishedAt: string;
}

interface FaqEntryInput {
  question?: string;
  answer?: string;
}

interface ParsedFrontmatter {
  fields: Record<string, string>;
  faqEntries: { question: string; answer: string }[];
}

interface ParsedMarkdownImport {
  fields: Record<string, string>;
  faqEntries: { question: string; answer: string }[];
  content: string;
  fallbackSlug: string;
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function toDateTimeLocal(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const adjusted = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return adjusted.toISOString().slice(0, 16);
}

function buildInitialState(initialData?: BlogPostFormInitialData): FormState {
  return {
    slug: initialData?.slug || "",
    title: initialData?.title || "",
    excerpt: initialData?.excerpt || "",
    content: initialData?.content || "",
    readTime: initialData?.read_time || "",
    category: initialData?.category || "",
    author: initialData?.author || "GolfSimMap Team",
    coverImage: initialData?.cover_image || "",
    faqJson: JSON.stringify(Array.isArray(initialData?.faq) ? initialData?.faq : [], null, 2),
    featured: Boolean(initialData?.featured),
    isPublished: Boolean(initialData?.is_published),
    publishedAt: toDateTimeLocal(initialData?.published_at),
  };
}

function stripWrappingQuotes(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function parseYamlLikeFaq(value: string): { question: string; answer: string }[] | null {
  const lines = value.split(/\r?\n/);
  const items: FaqEntryInput[] = [];
  let current: FaqEntryInput | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/^(faq|faqs):$/i.test(trimmed)) continue;

    const questionMatch = trimmed.match(/^-\s*question:\s*(.+)$/i) || trimmed.match(/^question:\s*(.+)$/i);
    if (questionMatch) {
      if (current) items.push(current);
      current = { question: stripWrappingQuotes(questionMatch[1]) };
      continue;
    }

    const answerMatch = trimmed.match(/^answer:\s*(.+)$/i);
    if (answerMatch) {
      if (!current) current = {};
      current.answer = stripWrappingQuotes(answerMatch[1]);
      continue;
    }

    // Support wrapped answer text across multiple lines.
    if (current?.answer) {
      current.answer = `${current.answer} ${stripWrappingQuotes(trimmed)}`.trim();
      continue;
    }

    return null;
  }

  if (current) items.push(current);
  if (!items.length) return null;

  const normalized = items
    .map((item) => ({
      question: (item.question || "").trim(),
      answer: (item.answer || "").trim(),
    }))
    .filter((item) => item.question && item.answer);

  return normalized.length === items.length ? normalized : null;
}

function parseFaqInput(value: string): unknown[] {
  const trimmed = value.trim();
  if (!trimmed) return [];

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (!Array.isArray(parsed)) {
      throw new Error("FAQ must be a JSON array.");
    }
    return parsed;
  } catch {
    const yamlLikeParsed = parseYamlLikeFaq(trimmed);
    if (!yamlLikeParsed) {
      throw new Error("FAQ must be valid JSON array or YAML-style question/answer list.");
    }
    return yamlLikeParsed;
  }
}

function parseBooleanString(value: string | undefined): boolean | null {
  if (!value) return null;
  const normalized = stripWrappingQuotes(value).toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return null;
}

function formatFaqAsYaml(entries: { question: string; answer: string }[]): string {
  return entries
    .map((entry) => {
      const question = entry.question.replace(/"/g, '\\"');
      const answer = entry.answer.replace(/"/g, '\\"');
      return `- question: "${question}"\n  answer: "${answer}"`;
    })
    .join("\n");
}

function toFallbackSlugFromFileName(fileName: string): string {
  const withoutExtension = fileName.replace(/\.[^.]+$/, "");
  return toSlug(withoutExtension);
}

function parseFrontmatterBlock(frontmatter: string): ParsedFrontmatter {
  const fields: Record<string, string> = {};
  const faqLines: string[] = [];
  let currentKey = "";

  for (const rawLine of frontmatter.split("\n")) {
    const line = rawLine.replace(/\t/g, "  ");
    const trimmed = line.trim();
    if (!trimmed) continue;

    const topLevelMatch =
      !line.startsWith(" ") && !line.startsWith("\t")
        ? line.match(/^([A-Za-z_][A-Za-z0-9_-]*):\s*(.*)$/)
        : null;

    if (topLevelMatch) {
      currentKey = topLevelMatch[1].toLowerCase();
      const rawValue = topLevelMatch[2] || "";

      if (currentKey === "faq" || currentKey === "faqs") {
        if (rawValue.trim()) {
          faqLines.push(rawValue.trim());
        }
      } else {
        fields[currentKey] = stripWrappingQuotes(rawValue);
      }
      continue;
    }

    if ((currentKey === "faq" || currentKey === "faqs") && trimmed) {
      faqLines.push(line.trimStart());
    }
  }

  const faqEntries = faqLines.length ? parseYamlLikeFaq(faqLines.join("\n")) || [] : [];
  return { fields, faqEntries };
}

function parseMarkdownImport(text: string, fileName: string): ParsedMarkdownImport {
  const normalized = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);

  if (!match) {
    return {
      fields: {},
      faqEntries: [],
      content: normalized.trim(),
      fallbackSlug: toFallbackSlugFromFileName(fileName),
    };
  }

  const parsedFrontmatter = parseFrontmatterBlock(match[1]);
  return {
    fields: parsedFrontmatter.fields,
    faqEntries: parsedFrontmatter.faqEntries,
    content: match[2].trim(),
    fallbackSlug: toFallbackSlugFromFileName(fileName),
  };
}

function toPublishedAtValue(fields: Record<string, string>): string {
  const raw = fields.published_at || fields.date || "";
  if (!raw) return "";
  const trimmed = stripWrappingQuotes(raw);
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return `${trimmed}T09:00`;
  }
  return toDateTimeLocal(trimmed);
}

export function BlogPostForm({ mode, initialData }: BlogPostFormProps) {
  const router = useRouter();
  const contentRef = useRef<HTMLTextAreaElement | null>(null);
  const [form, setForm] = useState<FormState>(() => buildInitialState(initialData));
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingInline, setIsUploadingInline] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [inlineFile, setInlineFile] = useState<File | null>(null);
  const [inlineAltText, setInlineAltText] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const apiPath = useMemo(() => {
    if (mode === "edit" && initialData?.id) {
      return `/api/admin/blog/${initialData.id}`;
    }
    return "/api/admin/blog";
  }, [mode, initialData?.id]);

  async function uploadImage(
    file: File,
    scope: "cover" | "inline",
    options?: { slug?: string }
  ) {
    const payload = new FormData();
    payload.append("file", file);
    payload.append("scope", scope);
    if (options?.slug) {
      payload.append("slug", options.slug);
    }

    const res = await fetch("/api/admin/blog/upload-image", {
      method: "POST",
      body: payload,
    });
    const data = (await res.json()) as { error?: string; url?: string };
    if (!res.ok || !data.url) {
      throw new Error(data.error || "Image upload failed.");
    }
    return data.url;
  }

  async function onUploadCover() {
    if (!coverFile) {
      setError("Pick a cover image first.");
      return;
    }

    setError("");
    setSuccess("");
    setIsUploadingCover(true);

    try {
      const coverSlug = toSlug(form.slug || form.title);
      if (!coverSlug) {
        setError("Set title or slug first, then upload cover image.");
        setIsUploadingCover(false);
        return;
      }

      const url = await uploadImage(coverFile, "cover", { slug: coverSlug });
      setForm((prev) => ({ ...prev, coverImage: url }));
      setCoverFile(null);
      setSuccess(`Cover image uploaded as ${coverSlug}-cover.webp.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload cover image.");
    } finally {
      setIsUploadingCover(false);
    }
  }

  async function onUploadInline() {
    if (!inlineFile) {
      setError("Pick an inline image first.");
      return;
    }

    setError("");
    setSuccess("");
    setIsUploadingInline(true);

    try {
      const url = await uploadImage(inlineFile, "inline");
      const alt = inlineAltText.trim() || "Blog image";
      const markdownImage = `![${alt}](${url})`;

      const textarea = contentRef.current;
      if (!textarea) {
        setForm((prev) => ({
          ...prev,
          content: `${prev.content}\n\n${markdownImage}\n`,
        }));
      } else {
        const start = textarea.selectionStart ?? form.content.length;
        const end = textarea.selectionEnd ?? form.content.length;
        const before = form.content.slice(0, start);
        const after = form.content.slice(end);
        const withSpacing = `${before}\n\n${markdownImage}\n\n${after}`.trim();
        setForm((prev) => ({ ...prev, content: withSpacing }));
      }

      setInlineFile(null);
      setInlineAltText("");
      setSuccess("Inline image uploaded and inserted into content.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload inline image.");
    } finally {
      setIsUploadingInline(false);
    }
  }

  async function onImportMarkdown(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setSuccess("");

    try {
      const text = await file.text();
      const parsed = parseMarkdownImport(text, file.name);
      const featured = parseBooleanString(parsed.fields.featured);
      const published = parseBooleanString(parsed.fields.is_published || parsed.fields.published);
      const publishedAt = toPublishedAtValue(parsed.fields);

      setForm((prev) => {
        const title = parsed.fields.title || prev.title;
        const slugSource = parsed.fields.slug || title || prev.slug || parsed.fallbackSlug;

        return {
          ...prev,
          title,
          slug: toSlug(slugSource),
          excerpt: parsed.fields.excerpt || prev.excerpt,
          content: parsed.content || prev.content,
          readTime: parsed.fields.readtime || parsed.fields.read_time || prev.readTime,
          category: parsed.fields.category || prev.category,
          author: parsed.fields.author || prev.author || "GolfSimMap Team",
          faqJson: parsed.faqEntries.length ? formatFaqAsYaml(parsed.faqEntries) : prev.faqJson,
          featured: featured ?? prev.featured,
          isPublished: published ?? prev.isPublished,
          publishedAt: publishedAt || prev.publishedAt,
        };
      });

      setSuccess("Markdown imported. Review fields, upload cover image, then save.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import Markdown file.");
    } finally {
      event.target.value = "";
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    let parsedFaq: unknown[] = [];
    try {
      parsedFaq = parseFaqInput(form.faqJson);
    } catch (err) {
      setError(err instanceof Error ? err.message : "FAQ format is invalid.");
      setIsSaving(false);
      return;
    }

    const payload = {
      slug: form.slug,
      title: form.title,
      excerpt: form.excerpt,
      content: form.content,
      read_time: form.readTime,
      category: form.category,
      author: form.author,
      cover_image: form.coverImage,
      featured: form.featured,
      faq: parsedFaq,
      is_published: form.isPublished,
      published_at: form.publishedAt || null,
    };

    try {
      const res = await fetch(apiPath, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { error?: string; id?: string; slug?: string };

      if (!res.ok) {
        setError(data.error || "Failed to save blog post.");
        return;
      }

      if (mode === "create" && data.id) {
        router.push(`/admin/blog/${data.id}`);
        router.refresh();
        return;
      }

      setSuccess("Saved.");
      router.refresh();
    } catch {
      setError("Network error while saving.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 border border-default bg-charcoal p-6">
      <div className="border border-default p-4 space-y-3">
        <p className="text-sm text-cream">Import Markdown article</p>
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-muted">Markdown file</span>
          <input
            type="file"
            accept=".md,.mdx,text/markdown,text/plain"
            onChange={onImportMarkdown}
            className="mt-1 block w-full text-sm text-muted"
          />
        </label>
        <p className="text-xs text-muted">
          Reads frontmatter (`title`, `excerpt`, `date`, `readTime`/`read_time`, `category`, `author`,
          `featured`, `faq`/`faqs`) and fills the form automatically.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-muted">Title</span>
          <input
            value={form.title ?? ""}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            className="mt-1 w-full px-3 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none"
            required
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-muted">Slug</span>
          <div className="mt-1 flex gap-2">
            <input
              value={form.slug ?? ""}
              onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
              className="w-full px-3 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none"
              required
            />
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, slug: toSlug(prev.title || prev.slug) }))}
              className="px-3 py-2 border border-default text-muted hover:text-cream hover:border-masters-green transition-colors text-sm"
            >
              Generate
            </button>
          </div>
        </label>
      </div>

      <label className="block">
        <span className="text-xs uppercase tracking-wide text-muted">Excerpt</span>
        <textarea
          value={form.excerpt ?? ""}
          onChange={(e) => setForm((prev) => ({ ...prev, excerpt: e.target.value }))}
          rows={3}
          className="mt-1 w-full px-3 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none"
        />
      </label>

      <label className="block">
        <span className="text-xs uppercase tracking-wide text-muted">Content (Markdown)</span>
        <textarea
          ref={contentRef}
          value={form.content ?? ""}
          onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
          rows={18}
          className="mt-1 w-full px-3 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none font-mono text-sm"
          required
        />
      </label>

      <div className="border border-default p-4 space-y-3">
        <p className="text-sm text-cream">Inline image upload</p>
        <div className="grid md:grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs uppercase tracking-wide text-muted">Image file</span>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              onChange={(e) => setInlineFile(e.target.files?.[0] || null)}
              className="mt-1 block w-full text-sm text-muted"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wide text-muted">Alt text</span>
            <input
              value={inlineAltText ?? ""}
              onChange={(e) => setInlineAltText(e.target.value)}
              placeholder="Describe the image"
              className="mt-1 w-full px-3 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={onUploadInline}
          disabled={isUploadingInline}
          className="px-4 py-2 border border-default text-muted hover:text-cream hover:border-masters-green transition-colors disabled:opacity-50"
        >
          {isUploadingInline ? "Uploading..." : "Upload + Insert Inline Image"}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-muted">Read Time</span>
          <input
            value={form.readTime ?? ""}
            onChange={(e) => setForm((prev) => ({ ...prev, readTime: e.target.value }))}
            placeholder="6 min read"
            className="mt-1 w-full px-3 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-muted">Category</span>
          <input
            value={form.category ?? ""}
            onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
            placeholder="Tips / Buying Guide / News"
            className="mt-1 w-full px-3 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-muted">Author</span>
          <input
            value={form.author ?? ""}
            onChange={(e) => setForm((prev) => ({ ...prev, author: e.target.value }))}
            className="mt-1 w-full px-3 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-muted">Cover Image URL</span>
          <input
            value={form.coverImage ?? ""}
            onChange={(e) => setForm((prev) => ({ ...prev, coverImage: e.target.value }))}
            className="mt-1 w-full px-3 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none"
          />
        </label>
      </div>

      <div className="border border-default p-4 space-y-3">
        <p className="text-sm text-cream">Cover image upload</p>
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-muted">Image file</span>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
            className="mt-1 block w-full text-sm text-muted"
          />
        </label>
        <button
          type="button"
          onClick={onUploadCover}
          disabled={isUploadingCover}
          className="px-4 py-2 border border-default text-muted hover:text-cream hover:border-masters-green transition-colors disabled:opacity-50"
        >
          {isUploadingCover ? "Uploading..." : "Upload Cover to Cloudinary"}
        </button>
      </div>

      <label className="block">
        <span className="text-xs uppercase tracking-wide text-muted">FAQ (JSON array or YAML-style list)</span>
        <textarea
          value={form.faqJson ?? ""}
          onChange={(e) => setForm((prev) => ({ ...prev, faqJson: e.target.value }))}
          rows={6}
          placeholder={'- question: "Is a golf simulator accurate?"\n  answer: "Yes, if setup quality is solid."'}
          className="mt-1 w-full px-3 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none font-mono text-sm"
        />
      </label>

      <div className="grid md:grid-cols-2 gap-4">
        <label className="flex items-center gap-2 text-sm text-cream">
          <input
            type="checkbox"
            checked={Boolean(form.featured)}
            onChange={(e) => setForm((prev) => ({ ...prev, featured: e.target.checked }))}
            className="rounded border-default text-masters-green focus:ring-masters-green"
          />
          Featured Post
        </label>
        <label className="flex items-center gap-2 text-sm text-cream">
          <input
            type="checkbox"
            checked={Boolean(form.isPublished)}
            onChange={(e) => setForm((prev) => ({ ...prev, isPublished: e.target.checked }))}
            className="rounded border-default text-masters-green focus:ring-masters-green"
          />
          Published
        </label>
      </div>

      <label className="block">
        <span className="text-xs uppercase tracking-wide text-muted">Published At (optional)</span>
        <input
          type="datetime-local"
          value={form.publishedAt ?? ""}
          onChange={(e) => setForm((prev) => ({ ...prev, publishedAt: e.target.value }))}
          className="mt-1 w-full md:w-auto px-3 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none"
        />
      </label>

      {error ? <p className="text-sm text-sunday-red">{error}</p> : null}
      {success ? <p className="text-sm text-masters-green">{success}</p> : null}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="px-4 py-2 bg-masters-green text-deep-black font-medium hover:bg-masters-green/90 transition-colors disabled:opacity-50"
        >
          {isSaving ? "Saving..." : mode === "create" ? "Create Post" : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/blog")}
          className="px-4 py-2 border border-default text-muted hover:text-cream hover:border-masters-green transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
