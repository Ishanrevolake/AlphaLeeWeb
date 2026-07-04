import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import {
  getPostDate,
  getPublishedBlogPostBySlug,
  getReadingTime,
} from "@/lib/blogPosts";

type BlogPostPageProps = {
  params: {
    slug: string;
  };
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getPublishedBlogPostBySlug(params.slug);

  return {
    title: `${post.title} | Alpha Lee Fitness Blog`,
    description: post.excerpt ?? undefined,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getPublishedBlogPostBySlug(params.slug);
  const hasHtmlContent = /<\/?[a-z][\s\S]*>/i.test(post.content ?? "") || /&lt;\/?[a-z][\s\S]*?&gt;/i.test(post.content ?? "");
  const paragraphs = (post.content ?? "")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <article className="bg-[#F9F8F4] px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-gray-600 transition-colors hover:text-[#FF0000]"
        >
          <ArrowLeft size={18} strokeWidth={3} />
          Blog
        </Link>

        <header className="mb-8">
          <div className="mb-5 flex flex-wrap items-center gap-3 text-xs font-black uppercase tracking-[0.18em] text-gray-500">
            {post.category ? <span className="text-[#FF0000]">{post.category}</span> : null}
            <span>{getPostDate(post)}</span>
            <span>{getReadingTime(post.content)}</span>
          </div>
          <h1 className="font-outfit text-[clamp(2.5rem,10vw,5rem)] font-black leading-[0.98] tracking-tight text-gray-900">
            {post.title}
          </h1>
          {post.excerpt ? (
            <p className="mt-6 max-w-5xl text-lg font-medium leading-relaxed text-gray-600 sm:text-xl">
              {post.excerpt}
            </p>
          ) : null}
        </header>

        {post.cover_image_url ? (
          <div className="mx-auto mb-10 overflow-hidden rounded-[1.5rem] bg-gray-900 shadow-[0_16px_48px_rgba(0,0,0,0.08)]">
            <img
              src={post.cover_image_url}
              alt=""
              className="h-[240px] w-full object-cover sm:h-[320px] lg:h-[380px]"
            />
          </div>
        ) : null}

        <div className="rounded-[2rem] bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] sm:p-8 lg:p-10">
          {hasHtmlContent ? (
            <div
              className="space-y-6 text-lg font-medium leading-8 text-gray-700 [&_a]:font-bold [&_a]:text-[#FF0000] [&_h2]:font-outfit [&_h2]:text-3xl [&_h2]:font-black [&_h2]:leading-tight [&_h2]:tracking-tight [&_h2]:text-gray-900 [&_h3]:font-outfit [&_h3]:text-2xl [&_h3]:font-black [&_h3]:leading-tight [&_h3]:tracking-tight [&_h3]:text-gray-900 [&_iframe]:aspect-video [&_iframe]:h-auto [&_iframe]:w-full [&_iframe]:rounded-[1rem] [&_iframe]:border-0 [&_img]:w-full [&_img]:rounded-[1rem] [&_img]:object-cover [&_strong]:font-black"
              dangerouslySetInnerHTML={{ __html: post.content ?? "" }}
            />
          ) : paragraphs.length > 0 ? (
            <div className="space-y-6 text-lg font-medium leading-8 text-gray-700">
              {paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          ) : (
            <p className="text-lg font-medium text-gray-500">This post does not have content yet.</p>
          )}
        </div>
      </div>
    </article>
  );
}
