import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getPostDate, getPublishedBlogPosts, getReadingTime } from "@/lib/blogPosts";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();

  return (
    <div className="bg-[#F9F8F4] px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 sm:mb-10">
          <p className="mb-4 text-sm font-black uppercase tracking-[0.22em] text-[#FF0000]">
            Fitness Blog
          </p>
          <div className="grid gap-4 lg:grid-cols-[0.9fr_0.7fr] lg:items-end">
            <h1 className="font-outfit text-[clamp(2.4rem,9vw,4.5rem)] font-black leading-[0.98] tracking-tight text-gray-900">
              TRAINING NOTES FOR REAL PROGRESS
            </h1>
            <p className="max-w-xl text-base font-medium leading-relaxed text-gray-600 sm:text-lg">
              Evidence-based training, nutrition, and coaching advice from Alpha Lee.
            </p>
          </div>
        </header>

        {posts.length > 0 ? (
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex min-h-[430px] flex-col overflow-hidden rounded-[1.25rem] bg-white shadow-[0_10px_36px_rgba(0,0,0,0.06)] transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="aspect-[16/10] bg-gray-900">
                  {post.cover_image_url ? (
                    <img
                      src={post.cover_image_url}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gray-900 font-outfit text-3xl font-black text-white">
                      ALPHA
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-4 flex flex-wrap items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-gray-500">
                    {post.category ? <span>{post.category}</span> : null}
                    <span>{getPostDate(post)}</span>
                    <span>{getReadingTime(post.content)}</span>
                  </div>
                  <h2 className="mb-3 font-outfit text-2xl font-black leading-tight tracking-tight text-gray-900">
                    {post.title}
                  </h2>
                  {post.excerpt ? (
                    <p className="line-clamp-4 text-sm font-medium leading-relaxed text-gray-600">
                      {post.excerpt}
                    </p>
                  ) : null}
                  <div className="mt-auto flex items-center gap-2 pt-6 text-xs font-black uppercase tracking-[0.16em] text-[#FF0000]">
                    Read post
                    <ArrowUpRight size={16} strokeWidth={3} />
                  </div>
                </div>
              </Link>
            ))}
          </section>
        ) : (
          <div className="flex min-h-[40vh] items-center justify-center rounded-[1.25rem] bg-white p-8 text-center shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
            <div>
              <h2 className="mb-3 font-outfit text-3xl font-black tracking-tight text-gray-900">
                No posts published yet
              </h2>
              <p className="mx-auto max-w-md font-medium leading-relaxed text-gray-500">
                Published blog posts from Supabase will appear here automatically.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
