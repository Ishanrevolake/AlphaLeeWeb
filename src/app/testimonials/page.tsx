"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import T1 from "@/Testimonials/T1.png";
import T2 from "@/Testimonials/T2.png";
import T3 from "@/Testimonials/T3.png";
import T4 from "@/Testimonials/T4.png";
import T5 from "@/Testimonials/T5.png";
import T6 from "@/Testimonials/T6.png";

const REVIEWS = [
  {
    name: "Jason M.",
    role: "Elite Bundle Client",
    body: "Working with Alpha Lee completely changed my life. I went from struggling with motivation to losing 20kg in 6 months. His custom nutrition plans actually include foods I enjoy!",
    rating: 5,
    tag: "Weight Loss"
  },
  {
    name: "Sarah T.",
    role: "Intermediate Bundle Client",
    body: "The ALF Recipe book combined with the customized training protocols showed incredible results. The accountability check-ins were the game changer I needed.",
    rating: 5,
    tag: "Muscle Gain"
  },
  {
    name: "David K.",
    role: "Rookie Bundle Client",
    body: "I thought I knew how to train, but Alpha Lee optimized everything. I spend less time in the gym now but my physique is looking better than it ever has.",
    rating: 5,
    tag: "Recomposition"
  },
  {
    name: "Amanda L.",
    role: "Advanced Bundle Client",
    body: "Best investment I've made for my health. The 24-hour WhatsApp support kept me sane while traveling.",
    rating: 5,
    tag: "Lifestyle"
  },
  {
    name: "Michael R.",
    role: "Elite Bundle Client",
    body: "Broke through a 2-year plateau in just 12 weeks. The attention to detail in my bio-mechanics and form completely eliminated my shoulder pain.",
    rating: 5,
    tag: "Strength"
  },
  {
    name: "Jessica W.",
    role: "Intermediate Bundle Client",
    body: "I love the Alpha Chef recipes! I was so tired of plain chicken and rice. Alpha Lee's coaching approach is sustainable, intelligent, and highly effective.",
    rating: 5,
    tag: "Nutrition"
  }
];

export default function TestimonialsPage() {
  const galleryImages = [T1, T2, T3, T4, T5, T6];

  return (
    <div className="flex flex-col flex-1 bg-gray-50 min-h-screen pt-24 pb-32">
      <div className="max-w-7xl mx-auto px-6 w-full">
        
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-[#FF0000] font-bold tracking-[0.2em] uppercase text-sm mb-4 font-sans">Real Results</h2>
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight mb-6 font-outfit">
              Don&apos;t just take our word for it.
            </h1>
            <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto">
              See what dedicated clients have achieved through tailored coaching, precision nutrition, and relentless accountability.
            </p>
          </motion.div>
        </div>

        {/* Reviews Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {REVIEWS.map((review, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative group hover:shadow-xl transition-shadow"
            >
              <div className="absolute top-8 right-8 text-gray-100 group-hover:text-[#cca751]/10 transition-colors">
                <Quote size={48} className="text-gray-100 group-hover:text-[#FF0000]/10 transition-colors" />
              </div>
              
              <div className="flex mb-4">
                {[...Array(review.rating)].map((_, idx) => (
                  <Star key={idx} size={18} className="fill-[#FF0000] text-[#FF0000] mr-1" />
                ))}
              </div>
              
              <p className="text-gray-700 font-medium text-lg leading-relaxed mb-6 relative z-10">
                &quot;{review.body}&quot;
              </p>
              
              <div className="flex items-center justify-between mt-auto">
                <div>
                  <div className="font-bold text-gray-900">{review.name}</div>
                  <div className="text-sm font-medium text-gray-500">{review.role}</div>
                </div>
                <div className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">
                  {review.tag}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Transformation Gallery */}
        <div className="mt-32 mb-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-[#FF0000] font-bold tracking-[0.2em] uppercase text-sm mb-4 font-sans">Visual Proof</h2>
            <h3 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight font-outfit mb-12">
              Transformations
            </h3>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-8">
            {galleryImages.map((img, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.15)] group bg-gray-200 border-4 border-white"
              >
                <Image 
                  src={img} 
                  alt={`Transformation ${i + 1}`} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-700" 
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA section after reviews */}
        <motion.div 
          className="mt-32 text-center bg-gray-900 rounded-[3rem] p-12 md:p-20 relative overflow-hidden"
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
