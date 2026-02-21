# How to Create Blog Articles

This folder contains all blog articles for GolfSimMap. Articles are written in Markdown format.

## Quick Start

1. Create a new file in this folder with `.md` extension
2. Copy the template below
3. Fill in your content
4. Save and deploy

If you are using Supabase-backed blog content:

1. Add article rows to `public.blog_posts` (see `add-blog-posts-table.sql`).
2. Set `is_published = true` and `published_at` when ready to publish.
3. Keep `content` as Markdown (the app renders it to HTML).
4. After publish/update, call `POST /api/revalidate-blog` to refresh `/blog`, post page, and sitemap immediately.

---

## Article Template

```markdown
---
title: "Your Article Title"
excerpt: "A brief summary that appears on the blog listing page (1-2 sentences)"
date: "2026-02-11"
readTime: "5 min read"
category: "Tips"
author: "Your Name"
featured: false
---

Write your article content here using Markdown formatting.

## Section Header

Your paragraphs go here. Use **bold** for emphasis and [links](/search) for internal pages.

- Bullet points
- Are great for lists
- Easy to read

1. Numbered lists
2. Work too
3. For steps

> "Blockquotes for highlighting important quotes or tips"

---

## Markdown Reference

### Text Formatting

| Format | Syntax | Result |
|--------|--------|--------|
| Bold | `**text**` | **text** |
| Italic | `*text*` | *text* |
| Bold + Italic | `***text***` | ***text*** |
| Strikethrough | `~~text~~` | ~~text~~ |

### Headers

```markdown
# Main Title (H1) - Usually just one per article
## Section (H2) - Main sections
### Subsection (H3) - Sub-sections
```

### Links

```markdown
[Link text](https://example.com)           - External link
[Link text](/search)                       - Internal link
[Link text](/blog/another-article)         - Link to another article
```

### Lists

```markdown
- Unordered item 1
- Unordered item 2
  - Nested item
  - Nested item

1. Ordered item 1
2. Ordered item 2
3. Ordered item 3
```

### Tables

```markdown
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
```

### Blockquotes

```markdown
> This is a blockquote. Use it for:
> - Important tips
> - Quotes from experts
> - Callout information
```

### Horizontal Rule

```markdown
---
```

---

## Frontmatter Fields Explained

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| `title` | **Yes** | The article headline | `"How to Choose a Golf Simulator"` |
| `excerpt` | **Yes** | Short description (1-2 sentences) | `"TrackMan vs Foresight..."` |
| `date` | **Yes** | Publication date (recommended ISO format) | `"2026-02-11"` |
| `readTime` | **Yes** | Estimated reading time | `"5 min read"` |
| `category` | **Yes** | Article category | `"Tips"`, `"Buying Guide"`, `"News"` |
| `author` | No | Author name (defaults to team) | `"John Smith"` |
| `featured` | No | Pin to top of blog page | `true` or `false` |
| `faq` / `faqs` | No | FAQ items for FAQ schema | See FAQ examples below |

---

## FAQ Schema (Auto + Frontmatter)

Blog posts now support FAQ schema in two ways:

1. Frontmatter FAQ (manual)
2. Auto-parse from article section

### Option 1: Frontmatter FAQ

Use `faq` or `faqs` in frontmatter:

```markdown
---
title: "Best Launch Monitor for Home Use"
excerpt: "How to choose launch monitor hardware for your budget and space."
date: "2026-02-11"
readTime: "6 min read"
category: "Buying Guide"
faqs:
  - question: "What launch monitor is best for beginners?"
    answer: "Most beginners should start with camera-based systems in the sub-$3,000 range."
  - question: "Do I need a gaming PC?"
    answer: "Some systems require a PC, while others support iPad-only setups."
---
```

### Option 2: Auto-Parse from Article Body

If frontmatter FAQ is missing, the system will parse a section named:

- `## FAQ`
- `## Frequently Asked Questions`

Then each `###` heading under that section becomes a question, and the paragraph/list below it becomes the answer.

```markdown
## FAQ

### How much does a home simulator cost?
Most setups start around $3,000 and can exceed $20,000 depending on hardware and build quality.

### Is 9-foot ceiling height enough?
For many golfers yes, but taller players often benefit from 10-foot ceilings.
```

Notes:
- Frontmatter FAQ takes priority over auto-parsed FAQ.
- Keep FAQ content visible on-page (not schema-only) to align with Google guidelines.

### Category Options

- `Tips` - General advice and how-tos
- `Buying Guide` - Product comparisons and recommendations
- `News` - Industry updates and announcements
- `Reviews` - Venue or equipment reviews

---

## File Naming

Use URL-friendly file names (lowercase, hyphens, no spaces):

✅ Good: `how-to-choose-golf-simulator.md`
❌ Bad: `How To Choose Golf Simulator.md`

The filename becomes the URL slug:
- File: `winter-practice-tips.md`
- URL: `/blog/winter-practice-tips`

---

## Writing Tips

### 1. Start with the Problem
Readers want to know you understand their situation. Start with a relatable problem or question.

**Good:** "Finding the right golf simulator feels overwhelming with so many options..."

### 2. Use Short Paragraphs
Mobile readers skim. Keep paragraphs to 2-3 sentences max.

### 3. Include Subheadings
Break up long content with H2 (`##`) and H3 (`###`) headers.

### 4. Add Lists and Tables
Bullet points and tables make information easier to scan.

### 5. End with Action
Tell readers what to do next:
- "Ready to find a venue? [Search now](/search)"
- "Have questions? [Contact us](/contact)"

### 6. Link to Other Pages
Link to relevant site pages using internal links:
- `/search` - Search venues
- `/launch-monitors` - Launch monitor directory
- `/blog/another-article` - Related articles

---

## Example Article

```markdown
---
title: "5 Winter Golf Practice Tips"
excerpt: "Don't let cold weather kill your game. Here's how to stay sharp using indoor simulators."
date: "2026-02-11"
readTime: "4 min read"
category: "Tips"
author: "GolfSimMap Team"
featured: false
---

Winter doesn't have to mean a rusty golf swing. Indoor simulators let you practice year-round—and actually improve faster than on the course.

## 1. Track Your Baseline

First session? Hit 10 shots with each club and record:

- Club head speed
- Ball speed
- Carry distance

This gives you numbers to improve against.

## 2. Pick One Focus Area

Don't try to fix everything. Pick **one metric** to work on:

| Goal | Focus On |
|------|----------|
| More distance | Club speed |
| Stop slicing | Face angle |
| Better control | Strike location |

## 3. Make It Fun

Balance serious practice with fun rounds:
- Play Pebble Beach
- Compete with friends
- Try different game modes

> "The best practice happens when you're enjoying yourself."

## Find a Venue

Ready to start? [Find indoor golf near you](/search) and book a bay today.
```

---

## Publishing Checklist

Before deploying, check:

- [ ] Frontmatter fields are filled in
- [ ] Title is under 60 characters (for SEO)
- [ ] Excerpt is compelling (appears in blog cards)
- [ ] All internal links work
- [ ] No spelling errors
- [ ] Images referenced correctly (if any)
- [ ] If using FAQ schema, FAQ content is visible in the article body

---

## Need Help?

- Internal pages: `/search`, `/launch-monitors`, `/contact`, `/blog/[slug]`
- Markdown syntax: [Basic Syntax Guide](https://www.markdownguide.org/basic-syntax/)
- Questions? Check existing articles in this folder for examples.
