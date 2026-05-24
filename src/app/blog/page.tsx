"use client";

import { motion } from "framer-motion";

export default function BlogPage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-[70svh] md:min-h-[80vh] px-4 sm:px-6 py-16 text-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <h1 className="text-[clamp(2.75rem,13vw,4.5rem)] lg:text-7xl font-black mb-6 tracking-tight text-gray-900 font-outfit">
          FITNESS <span className="text-[#FF0000]">BLOG</span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-500 font-medium max-w-xl mx-auto">
          Your source for health tips, workout science, and nutrition guidelines is coming soon.
        </p>
      </motion.div>
    </div>
  );
}
