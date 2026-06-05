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

  return (data ?? []) as BlogPost[];
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

  return data as BlogPost;
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
  if (!content) {
    return "1 min read";
  }

  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 220));

  return `${minutes} min read`;
}
