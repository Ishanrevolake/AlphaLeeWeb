import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  status: string | null;
  category: string | null;
  cover_image_url: string | null;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

const publishedSelect =
  "id,title,slug,excerpt,content,status,category,cover_image_url,published_at,created_at,updated_at";

function decodeHtml(value = "") {
  let decoded = value;

  for (let index = 0; index < 3; index += 1) {
    const next = decoded
      .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
      .replace(/&#x([a-f0-9]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&quot;/gi, "\"")
      .replace(/&#039;/g, "'")
      .replace(/&apos;/gi, "'")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">");

    if (next === decoded) {
      break;
    }

    decoded = next;
  }

  return decoded;
}

function stripHtml(value: string | null) {
  if (!value) {
    return null;
  }

  const text = decodeHtml(value)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return text || null;
}

function cleanText(value: string | null) {
  return stripHtml(value);
}

function sanitizeUrl(value = "") {
  const decoded = decodeHtml(value).trim();

  if (/^(https?:|mailto:|tel:|\/)/i.test(decoded)) {
    return decoded.replace(/"/g, "&quot;");
  }

  return "";
}

function sanitizeAttributes(tagName: string, attributes = "") {
  const allowed = new Map<string, Set<string>>([
    ["a", new Set(["href", "target", "rel"])],
    ["img", new Set(["src", "alt", "loading"])],
    ["iframe", new Set(["src", "title", "loading", "allow", "allowfullscreen"])],
  ]);
  const allowedForTag = allowed.get(tagName);

  if (!allowedForTag) {
    return "";
  }

  const cleaned: string[] = [];
  const attrPattern = /([a-zA-Z:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  let match: RegExpExecArray | null;

  while ((match = attrPattern.exec(attributes)) !== null) {
    const name = match[1].toLowerCase();
    const rawValue = match[2] ?? match[3] ?? match[4] ?? "";

    if (!allowedForTag.has(name)) {
      continue;
    }

    if ((name === "href" || name === "src") && !sanitizeUrl(rawValue)) {
      continue;
    }

    if (name === "target") {
      cleaned.push('target="_blank"');
      continue;
    }

    if (name === "rel") {
      cleaned.push('rel="noopener noreferrer"');
      continue;
    }

    if (name === "allowfullscreen") {
      cleaned.push("allowfullscreen");
      continue;
    }

    const value = name === "href" || name === "src" ? sanitizeUrl(rawValue) : decodeHtml(rawValue).replace(/"/g, "&quot;");
    cleaned.push(`${name}="${value}"`);
  }

  if (tagName === "a" && !cleaned.some((attribute) => attribute.startsWith("rel="))) {
    cleaned.push('rel="noopener noreferrer"');
  }

  if (tagName === "img" && !cleaned.some((attribute) => attribute.startsWith("loading="))) {
    cleaned.push('loading="lazy"');
  }

  if (tagName === "iframe" && !cleaned.some((attribute) => attribute.startsWith("loading="))) {
    cleaned.push('loading="lazy"');
  }

  return cleaned.length ? ` ${cleaned.join(" ")}` : "";
}

function sanitizeBlogContent(value: string | null) {
  if (!value) {
    return null;
  }

  const allowedTags = new Set([
    "a",
    "blockquote",
    "br",
    "em",
    "h2",
    "h3",
    "h4",
    "iframe",
    "img",
    "li",
    "ol",
    "p",
    "strong",
    "ul",
  ]);

  const cleaned = decodeHtml(value)
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<\/?span[^>]*>/gi, "")
    .replace(/<([a-z0-9]+)([^>]*)>/gi, (match, rawTagName, attributes) => {
      const tagName = String(rawTagName).toLowerCase();

      if (!allowedTags.has(tagName)) {
        return "";
      }

      if (tagName === "br") {
        return "<br />";
      }

      return `<${tagName}${sanitizeAttributes(tagName, attributes)}>`;
    })
    .replace(/<\/([a-z0-9]+)>/gi, (match, rawTagName) => {
      const tagName = String(rawTagName).toLowerCase();

      return allowedTags.has(tagName) && tagName !== "br" ? `</${tagName}>` : "";
    })
    .trim();

  return cleaned || null;
}

function cleanBlogPost(post: BlogPost): BlogPost {
  return {
    ...post,
    title: cleanText(post.title) ?? "Untitled",
    excerpt: cleanText(post.excerpt),
    content: sanitizeBlogContent(post.content),
    category: cleanText(post.category),
  };
}

export async function getPublishedBlogPosts() {
  noStore();

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("blog_posts")
    .select(publishedSelect)
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load blog posts: ${error.message}`);
  }

  return ((data ?? []) as BlogPost[]).map(cleanBlogPost);
}

export async function getPublishedBlogPostBySlug(slug: string) {
  noStore();

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("blog_posts")
    .select(publishedSelect)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load blog post: ${error.message}`);
  }

  if (!data) {
    notFound();
  }

  return cleanBlogPost(data as BlogPost);
}

export function getPostDate(post: Pick<BlogPost, "published_at" | "created_at">) {
  const value = post.published_at ?? post.created_at;

  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function getReadingTime(content: string | null) {
  const text = stripHtml(content);

  if (!text) {
    return "1 min read";
  }

  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 220));

  return `${minutes} min read`;
}
