"use client";

import { motion } from "framer-motion";
import Image, { type StaticImageData } from "next/image";
import T1 from "@/Testimonials/T1.png";
import T2 from "@/Testimonials/T2.png";
import T3 from "@/Testimonials/T3.png";
import T4 from "@/Testimonials/T4.png";
import T5 from "@/Testimonials/T5.png";
import T6 from "@/Testimonials/T6.png";

const galleryImages: StaticImageData[] = [T1, T2, T3, T4, T5, T6];

type TransformationGalleryProps = {
  variant?: "grid" | "marquee";
};

export function TransformationGallery({ variant = "grid" }: TransformationGalleryProps) {
  const imageSet = variant === "marquee" ? [...galleryImages, ...galleryImages] : galleryImages;

  return (
    <div className="text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="mb-4 font-sans text-sm font-bold uppercase tracking-[0.2em] text-[#FF0000]">Visual Proof</h2>
        <h3 className="mb-12 font-outfit text-3xl font-black tracking-tight text-gray-900 md:text-5xl">
          Transformations
        </h3>
      </motion.div>

      {variant === "marquee" ? (
        <div className="scrolling-wrapper -mx-4 overflow-hidden px-4 sm:-mx-6 sm:px-6">
          <div className="scrolling-marquee flex w-max gap-4 sm:gap-6 lg:gap-8">
            {imageSet.map((img, i) => (
              <div
                key={`${img.src}-${i}`}
                className="relative aspect-[4/5] w-[72vw] max-w-[320px] shrink-0 overflow-hidden rounded-3xl border-4 border-white bg-gray-200 shadow-[0_10px_30px_rgba(0,0,0,0.15)] sm:w-[42vw] md:w-[30vw] lg:w-[260px]"
              >
                <Image
                  src={img}
                  alt={`Transformation ${(i % galleryImages.length) + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 72vw, (max-width: 768px) 42vw, (max-width: 1024px) 30vw, 260px"
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-8">
          {galleryImages.map((img, i) => (
            <motion.div
              key={img.src}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative aspect-[4/5] overflow-hidden rounded-3xl border-4 border-white bg-gray-200 shadow-[0_10px_30px_rgba(0,0,0,0.15)]"
            >
              <Image
                src={img}
                alt={`Transformation ${i + 1}`}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
