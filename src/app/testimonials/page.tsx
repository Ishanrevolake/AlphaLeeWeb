import { unstable_noStore as noStore } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import TestimonialsContent, { type TestimonialReview } from "./TestimonialsContent";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type TestimonialRow = {
  id: string | number;
  name: string | null;
  text: string | null;
  rating: number | null;
  image_url: string | null;
  instagram_url: string | null;
  approved_at: string | null;
  created_at: string | null;
};

function normalizeRating(rating: number | null) {
  if (typeof rating !== "number" || !Number.isFinite(rating)) {
    return 5;
  }

  return Math.min(5, Math.max(1, Math.round(rating)));
}

async function getApprovedTestimonials(): Promise<TestimonialReview[]> {
  noStore();

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("testimonials")
    .select("id,name,text,rating,image_url,instagram_url,approved_at,created_at")
    .ilike("status", "approved")
    .order("approved_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load approved testimonials:", error.message);
    return [];
  }

  return ((data ?? []) as TestimonialRow[])
    .filter((testimonial) => testimonial.name && testimonial.text)
    .map((testimonial) => ({
      id: String(testimonial.id),
      name: testimonial.name as string,
      body: testimonial.text as string,
      rating: normalizeRating(testimonial.rating),
      imageUrl: testimonial.image_url,
      instagramUrl: testimonial.instagram_url,
    }));
}

export default async function TestimonialsPage() {
  const reviews = await getApprovedTestimonials();

  return <TestimonialsContent reviews={reviews} />;
}
