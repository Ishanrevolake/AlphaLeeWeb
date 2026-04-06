"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ChevronRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function RecipeBookPage() {
  return (
    <div className="flex flex-col flex-1 bg-[#F9F8F4]">
      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:py-24 overflow-hidden bg-gray-900 text-white flex items-center justify-center min-h-[70vh]">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-500/40 via-gray-900 to-black pointer-events-none" />
        <div className="relative z-10 max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <motion.div 
            className="flex-1 text-center md:text-left"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center bg-red-500/20 text-[#FF0000] px-4 py-2 rounded-full font-bold text-sm tracking-wider uppercase mb-6">
              <BookOpen size={16} className="mr-2" />
              Over 40 Recipes
            </div>
            <h1 className="text-4xl lg:text-6xl font-black mb-6 tracking-tight font-outfit">
              Alpha Chef <span className="text-[#FF0000]">Recipe Book</span>
            </h1>
            <p className="text-xl text-gray-300 font-medium mb-8 leading-relaxed max-w-xl mx-auto md:mx-0">
              Stop surviving on bland, repetitive meals. It&apos;s time to make your health and fitness journey unbelievably enjoyable.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
              <Button size="lg" className="w-full sm:w-auto text-lg py-6 px-10 shadow-xl shadow-red-500/40 bg-[#FF0000] hover:bg-red-700 text-white rounded-full font-black">
                Buy Now — Rs. 4,950
              </Button>
            </div>
          </motion.div>
          
          {/* Aesthetic Book Representation */}
          <motion.div 
            className="flex-1 w-full max-w-sm"
            initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="aspect-[3/4] bg-white rounded-r-3xl rounded-l-md shadow-2xl relative border-l-8 border-[#FF0000] overflow-hidden group hover:-translate-y-2 transition-transform duration-500">
              <div className="absolute inset-0 bg-gradient-to-tr from-gray-100 to-gray-50" />
              <div className="absolute top-10 w-full text-center px-6 z-10">
                <h3 className="text-gray-400 font-bold uppercase tracking-[0.2em] text-sm mb-4">Alpha Lee Fitness</h3>
                <h2 className="text-3xl font-black text-gray-900 leading-none">ALPHA CHEF</h2>
                <div className="w-12 h-1 bg-[#FF0000] mx-auto mt-4" />
              </div>
              <div className="absolute bottom-10 w-full text-center px-8 z-10">
                <p className="text-gray-500 font-serif italic mb-6">40+ Expertly Crafted Recipes</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Details Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-16">
          <motion.div 
            className="flex-1 space-y-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <h2 className="text-3xl font-black mb-6 text-gray-900 tracking-tight font-outfit">What&apos;s the ALF Recipe Book?</h2>
              <p className="text-lg text-gray-600 leading-relaxed font-medium">
                Providing over 40 different expertly crafted recipes, made from commonly found ingredients to aid in your health and fitness journey, this book not only puts an end to bland eating, it also makes your health and fitness journey that much more enjoyable.
              </p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
              <p className="text-lg text-gray-700 italic font-medium leading-relaxed">
                &quot;Alpha Lee Fitness with nearly a decade of coaching experience brings to you its very own recipe book to help you reach your fitness goals!&quot;
              </p>
            </div>
          </motion.div>

          <motion.div 
            className="flex-1"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-red-500/5 border-2 border-red-500/20 p-8 rounded-3xl">
              <h3 className="text-xl font-bold mb-6 text-gray-900">Why You Need This Book</h3>
              <ul className="space-y-4">
                {[
                  "Easily sourceable ingredients from local grocery stores",
                  "Calorie and macro breakdowns for every single meal",
                  "Fast preparation times (under 30 minutes)",
                  "Vegetarian and meat-based options included",
                  "Perfect for fat loss, maintenance, or muscle gain"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle2 className="h-6 w-6 text-[#FF0000] shrink-0 mr-3 mt-0.5" />
                    <span className="text-gray-700 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 pt-8 border-t border-red-500/20">
                <div className="text-4xl font-black text-gray-900 mb-2">Rs. 4,950</div>
                <div className="text-gray-500 font-medium mb-6">Digital Download (PDF Format)</div>
                <Button size="lg" className="w-full text-lg cursor-pointer bg-[#FF0000] text-white hover:bg-red-700">
                  Purchase Now <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
