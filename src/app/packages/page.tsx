"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useFunnelStore } from '@/store/funnelStore';
import { PlanCard } from '@/components/ui/PlanCard';
import { PACKAGES, PACKAGE_CATEGORIES, type PackageCategory } from '@/lib/packages';
import { supabase } from '@/lib/supabase';

const SERVICE_IDS = new Set([
  'consult-inperson',
  'consult-online',
  'programme-review',
  'technique-single',
  'technique-full',
]);

export default function PackagesPage() {
  const router = useRouter();
  const { setPackage, selectedPackage } = useFunnelStore();
  const [infoPackage, setInfoPackage] = useState<typeof PACKAGES[0] | null>(null);
  const [activeCategory, setActiveCategory] = useState<PackageCategory>('All');

  const [mounted, setMounted] = React.useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const categoryPackages = activeCategory === 'All'
    ? PACKAGES
    : PACKAGES.filter(p => p.category === activeCategory);
  const filteredPackages = categoryPackages.filter((pkg) => !SERVICE_IDS.has(pkg.id));

  const startSignupForPackage = async (packageId: string) => {
    setPackage(packageId);
    const { data } = await supabase.auth.getSession();
    router.push(data.session ? '/signup/step-2' : '/signup/step-1');
  };

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 flex flex-col items-center">
      <motion.div
        className="w-full max-w-[1200px] mt-6 sm:mt-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-[13px] font-bold tracking-[0.2em] text-gray-400 mb-6 uppercase">Choose your package</h1>

          <div className="flex sm:flex-wrap justify-start sm:justify-center gap-2 md:gap-4 mb-10 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {PACKAGE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 sm:px-6 py-2.5 rounded-full text-[14px] font-bold transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-[#FF0000] text-white shadow-md'
                    : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center w-full">
          {activeCategory === 'Bundles' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl bg-white p-5 sm:p-6 rounded-3xl mb-8 border border-gray-100 shadow-sm text-center"
            >
              <h2 className="text-xl font-black text-gray-900 mb-2 tracking-tight">Why Select a Bundle?</h2>
              <p className="text-[14px] text-gray-600 font-medium leading-relaxed">
                Save money while staying committed to long-term goals. Ideal for transformations that require months of consistent effort.
              </p>
            </motion.div>
          )}

          {(activeCategory === 'All' || activeCategory === 'Bundles' || activeCategory === 'Monthly' || activeCategory === 'Annual') && (
             <motion.div
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               className="max-w-3xl bg-[#FF0000]/5 p-5 sm:p-6 rounded-3xl mb-10 sm:mb-12 border border-[#FF0000]/20 flex flex-col md:flex-row items-center gap-5 sm:gap-6"
             >
               <div className="shrink-0 bg-white shadow-sm p-3 rounded-2xl border border-gray-100">
                 <div className="text-[#FF0000] font-black text-xl">ADD-ON</div>
               </div>
               <div className="text-center md:text-left">
                 <h3 className="font-bold text-gray-900 mb-1">24-Hour Reply Guarantee</h3>
                 <p className="text-[14px] text-gray-600 font-medium mb-1">
                   Need clarification or technical support faster? Ensure our team assists you within 24 hours.
                 </p>
                 <p className="text-[14px] font-bold text-[#FF0000]">Just Rs. 5000 per month in addition to your subscription.</p>
               </div>
             </motion.div>
          )}

          {filteredPackages.length > 0 && <motion.div
            key={activeCategory}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className={`grid gap-5 sm:gap-8 pb-24 max-w-[1000px] w-full ${
              filteredPackages.length === 1 ? 'grid-cols-1 md:max-w-md' :
              filteredPackages.length === 2 ? 'grid-cols-1 md:grid-cols-2 md:max-w-3xl' :
              'grid-cols-1 md:grid-cols-3'
            }`}
          >
            {filteredPackages.map((pkg) => (
              <PlanCard
                key={pkg.id}
                letter={pkg.letter}
                title={pkg.title}
                subtitle={pkg.subtitle}
                price={pkg.price}
                oldPriceText={pkg.oldPriceText}
                strikeOldPrice={pkg.strikeOldPrice}
                footerText={pkg.footerText}
                isPopular={pkg.isPopular}
                isSelected={selectedPackage === pkg.id}
                onClick={() => setPackage(pkg.id)}
                onInfoClick={() => setInfoPackage(pkg)}
                onStartNow={() => {
                  startSignupForPackage(pkg.id);
                }}
              />
            ))}
          </motion.div>}

        </div>
      </motion.div>

      <AnimatePresence>
        {infoPackage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInfoPackage(null)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl md:rounded-[2rem] p-6 md:p-10 max-w-xl w-full shadow-2xl max-h-[90svh] overflow-y-auto border border-gray-100"
            >
              <button
                onClick={() => setInfoPackage(null)}
                className="absolute top-6 right-6 h-10 w-10 bg-gray-50 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="text-5xl sm:text-[3.5rem] leading-none font-black text-[#FF0000] mb-2">{infoPackage.letter}</div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2 tracking-tight pr-10">{infoPackage.title}</h2>
              <div className="text-[#FF0000] font-bold text-[17px] mb-6">{infoPackage.subtitle} - {infoPackage.price}</div>

              <div className="bg-[#F9F8F4] rounded-2xl p-5 mb-8 border border-red-500/10">
                <p className="text-gray-700 font-medium mb-3 leading-relaxed text-[15px]">{infoPackage.detailSubtitle}</p>
                <p className="text-[13px] font-bold text-[#FF0000] uppercase tracking-wider">{infoPackage.example}</p>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 text-[17px] mb-4 tracking-tight">What&apos;s included:</h3>
                {infoPackage.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start">
                    <div className="mt-0.5 bg-red-500/10 p-1 rounded-full mr-3 shrink-0">
                      <Check className="h-3 w-3 text-[#FF0000]" strokeWidth={4} />
                    </div>
                    <span className="text-gray-700 font-medium leading-relaxed text-[15px]">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
