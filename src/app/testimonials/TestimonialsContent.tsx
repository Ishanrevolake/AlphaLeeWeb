"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TransformationGallery } from "@/components/TransformationGallery";

export type TestimonialReview = {
  id: string;
  name: string;
  body: string;
  rating: number;
};

type TestimonialsContentProps = {
  reviews: TestimonialReview[];
};

export default function TestimonialsContent({ reviews }: TestimonialsContentProps) {
  return (
    <div className="flex flex-col flex-1 bg-gray-50 min-h-screen pt-16 sm:pt-24 pb-20 sm:pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
        
        {/* Header */}
        <div className="text-center mb-12 sm:mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-[#FF0000] font-bold tracking-[0.2em] uppercase text-sm mb-4 font-sans">Real Results</h2>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-gray-900 tracking-tight mb-6 font-outfit">
              Don&apos;t just take our word for it.
            </h1>
            <p className="text-lg sm:text-xl text-gray-500 font-medium max-w-2xl mx-auto">
              See what dedicated clients have achieved through tailored coaching, precision nutrition, and relentless accountability.
            </p>
          </motion.div>
        </div>

        {/* Reviews Grid */}
        {reviews.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            {reviews.map((review, i) => (
              <motion.div 
                key={review.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 relative group hover:shadow-xl transition-shadow"
              >
                <div className="absolute top-8 right-8 text-gray-100 group-hover:text-[#cca751]/10 transition-colors">
                  <Quote size={48} className="text-gray-100 group-hover:text-[#FF0000]/10 transition-colors" />
                </div>
                
                <div className="flex mb-4">
                  {Array.from({ length: review.rating }).map((_, idx) => (
                    <Star key={idx} size={18} className="fill-[#FF0000] text-[#FF0000] mr-1" />
                  ))}
                </div>
                
                <p className="text-gray-700 font-medium text-lg leading-relaxed mb-6 relative z-10">
                  &quot;{review.body}&quot;
                </p>
                
                <div className="flex items-center justify-between mt-auto">
                  <div>
                    <div className="font-bold text-gray-900">{review.name}</div>
                    <div className="text-sm font-medium text-gray-500">Verified Client</div>
                  </div>
                  <div className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">
                    Approved
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white border border-gray-100 rounded-3xl p-8 sm:p-12 text-center shadow-sm"
          >
            <Quote size={44} className="mx-auto mb-5 text-[#FF0000]/20" />
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 font-outfit mb-3">
              More client stories are on the way.
            </h2>
            <p className="text-gray-500 font-medium max-w-xl mx-auto">
              Approved testimonials will appear here as soon as they are published.
            </p>
          </motion.div>
        )}

        {/* Transformation Gallery */}
        <div className="mt-20 mb-10 sm:mt-32">
          <TransformationGallery />
        </div>

        {/* CTA section after reviews */}
        <motion.div 
          className="mt-20 sm:mt-32 text-center bg-gray-900 rounded-3xl md:rounded-[3rem] p-6 sm:p-12 md:p-20 relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FF0000] via-transparent to-transparent pointer-events-none" />
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-6 relative z-10 font-outfit">
            Ready to write your own success story?
          </h2>
          <p className="text-xl text-gray-400 font-medium mb-10 max-w-xl mx-auto relative z-10">
            Join the elite team and start your tailored transformation program today.
          </p>
          <Button size="lg" className="text-lg bg-[#cca751] text-white hover:bg-[#b89546] shadow-xl shadow-[#cca751]/20 rounded-full relative z-10">
            Start Your Journey
          </Button>
        </motion.div>

      </div>
    </div>
  );
}
