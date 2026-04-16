"use client";

import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-[80vh] px-6 text-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <h1 className="text-5xl lg:text-7xl font-black mb-6 tracking-tighter text-gray-900 font-outfit">
          ABOUT <span className="text-[#FF0000]">US</span>
        </h1>
        <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto">
          A reliable guide to your health & fitness transformation for Sri Lankans living around the world. We provide time-efficient workout plans and a variety of meal options.
        </p>
      </motion.div>
    </div>
  );
}
