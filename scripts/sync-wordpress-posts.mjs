import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const DEFAULT_WORDPRESS_URL = "https://alf.lk";
const WORDS_PER_MINUTE = 220;

function loadEnvFile(fileName) {
  const filePath = resolve(process.cwd(), fileName);

  if (!existsSync(filePath)) {
    return;
  }

  const lines = readFileSync(filePath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }

    const separator = trimmed.indexOf("=");
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function getArgValue(name) {
  const prefix = `--${name}=`;
  const arg = process.argv.find((value) => value.startsWith(prefix));

  return arg ? arg.slice(prefix.length) : null;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function decodeHtml(value = "") {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([a-f0-9]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripTags(value = "") {
  return decodeHtml(value)
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanUrl(value = "") {
  return decodeHtml(value.replace(/\\\//g, "/").replace(/\\"/g, "\"")).trim();
}

function youtubeEmbedUrl(url) {
  const cleaned = cleanUrl(url);
  const shortMatch = cleaned.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  const watchMatch = cleaned.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  const embedMatch = cleaned.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
  const id = shortMatch?.[1] ?? watchMatch?.[1] ?? embedMatch?.[1];

  return id ? `https://www.youtube.com/embed/${id}` : null;
}

function extractYouTubeEmbeds(html = "") {
  const urls = new Set();
  const decoded = decodeHtml(html);
  const patterns = [
    /youtube_url["']?\s*:\s*["']([^"']+)["']/gi,
    /https?:\\?\/\\?\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[^"'&<\s]+/gi,
    /https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[^"'&<\s]+/gi,
  ];

  for (const pattern of patterns) {
    for (const match of decoded.matchAll(pattern)) {
      const rawUrl = match[1] ?? match[0];
      const embedUrl = youtubeEmbedUrl(rawUrl);

      if (embedUrl) {
        urls.add(embedUrl);
      }
    }
  }

  return [...urls];
}

function sanitizeInlineHtml(value = "") {
  return decodeHtml(value)
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/\s(?:class|id|style|data-[\w-]+|aria-[\w-]+|onclick|on\w+)=(["']).*?\1/gi, "")
    .replace(/\s(?:class|id|style|data-[\w-]+|aria-[\w-]+|onclick|on\w+)=[^\s>]+/gi, "")
    .trim();
}

function collectTagContents(html = "", tagName) {
  const pattern = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "gi");

  return [...html.matchAll(pattern)]
    .map((match) => sanitizeInlineHtml(match[1]))
    .filter((value) => stripTags(value).length > 0);
}

function collectImages(html = "") {
  return [...html.matchAll(/<img[^>]+src=(["'])(.*?)\1[^>]*>/gi)]
    .map((match) => cleanUrl(match[2]))
    .filter(Boolean);
}

function normalizeWordPressContent(html = "") {
  const headings = collectTagContents(html, "h2");
  const h3s = collectTagContents(html, "h3");
  const paragraphs = collectTagContents(html, "p");
  const images = collectImages(html);
  const videos = extractYouTubeEmbeds(html);
  const blocks = [];

  for (const heading of headings) {
    blocks.push(`<h2>${heading}</h2>`);
  }

  for (const heading of h3s) {
    blocks.push(`<h3>${heading}</h3>`);
  }

  for (const paragraph of paragraphs) {
    blocks.push(`<p>${paragraph}</p>`);
  }

  for (const imageUrl of images) {
    blocks.push(`<img src="${imageUrl}" alt="" loading="lazy" />`);
  }

  for (const videoUrl of videos) {
    blocks.push(
      `<iframe src="${videoUrl}" title="Video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`,
    );
  }

  if (blocks.length > 0) {
    return blocks.join("\n\n");
  }

  const fallback = stripTags(html);

  return fallback ? `<p>${fallback}</p>` : "";
}

function getCategory(post) {
  const terms = post?._embedded?.["wp:term"];
  const categories = Array.isArray(terms?.[0]) ? terms[0] : [];

  return categories[0]?.name ?? null;
}

function getCoverImage(post) {
  const media = post?._embedded?.["wp:featuredmedia"]?.[0];

  return media?.source_url ?? media?.media_details?.sizes?.large?.source_url ?? null;
}

function getPublishedAt(post) {
  const value = post.date_gmt || post.date;

  if (!value) {
    return null;
  }

  const date = new Date(value.endsWith("Z") ? value : `${value}Z`);

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function toBlogPostRow(post) {
  const content = normalizeWordPressContent(post.content?.rendered ?? "");
  const plainContent = stripTags(content);
  const readingMinutes = Math.max(1, Math.ceil(plainContent.split(/\s+/).filter(Boolean).length / WORDS_PER_MINUTE));

  return {
    wordpress_id: post.id,
    title: stripTags(post.title?.rendered ?? "Untitled"),
    slug: post.slug,
    excerpt: stripTags(post.excerpt?.rendered ?? ""),
    content,
    status: post.status === "publish" ? "published" : "draft",
    category: getCategory(post),
    cover_image_url: getCoverImage(post),
    published_at: getPublishedAt(post),
    updated_at: new Date().toISOString(),
    reading_minutes: readingMinutes,
  };
}

async function fetchWordPressPosts({ baseUrl, slug }) {
  const posts = [];
  let page = 1;
  let totalPages = 1;

  do {
    const url = new URL("/wp-json/wp/v2/posts", baseUrl);
    url.searchParams.set("_embed", "1");
    url.searchParams.set("per_page", slug ? "1" : "100");
    url.searchParams.set("page", String(page));

    if (slug) {
      url.searchParams.set("slug", slug);
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`WordPress request failed: ${response.status} ${response.statusText}`);
    }

    const pagePosts = await response.json();
    totalPages = Number(response.headers.get("x-wp-totalpages") ?? "1");
    posts.push(...pagePosts);
    page += 1;
  } while (!slug && page <= totalPages);

  return posts;
}

async function main() {
  loadEnvFile(".env.local");

  const wordpressUrl = getArgValue("wordpress-url") ?? process.env.WORDPRESS_URL ?? DEFAULT_WORDPRESS_URL;
  const slug = getArgValue("slug");
  const dryRun = hasFlag("dry-run");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  const posts = await fetchWordPressPosts({ baseUrl: wordpressUrl, slug });
  const rows = posts.map(toBlogPostRow);

  if (rows.length === 0) {
    console.log(slug ? `No WordPress post found for slug "${slug}".` : "No WordPress posts found.");
    return;
  }

  if (dryRun) {
    console.log(JSON.stringify(rows, null, 2));
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const rowsForDatabase = rows.map(({ reading_minutes: _readingMinutes, ...row }) => row);
  let { error } = await supabase
    .from("blog_posts")
    .upsert(rowsForDatabase, { onConflict: "wordpress_id" });

  if (error && error.message.includes("wordpress_id")) {
    console.warn("wordpress_id column was not found. Retrying sync by slug.");

    const slugRows = rowsForDatabase.map(({ wordpress_id: _wordpressId, ...row }) => row);
    const retry = await supabase
      .from("blog_posts")
      .upsert(slugRows, { onConflict: "slug" });

    error = retry.error;
  }

  if (error) {
    throw new Error(`Supabase upsert failed: ${error.message}`);
  }

  for (const row of rows) {
    console.log(`Synced "${row.title}" (${row.slug}) - ${row.reading_minutes} min read`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
