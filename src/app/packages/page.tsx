"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Circle, X } from 'lucide-react';
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

const SERVICE_SECTIONS = [
  {
    id: 'consultations',
    eyebrow: 'Consultations',
    title: 'One-On-One Fitness Consultations',
    description: 'Need personalised guidance or want to discuss multiple aspects of your fitness journey? A consultation gives you dedicated time to discuss your goals, challenges, and questions while receiving recommendations specific to your situation. Choose between online or in-person support.',
    packageIds: ['consult-inperson', 'consult-online'],
  },
  {
    id: 'programme-review-section',
    eyebrow: 'Training Programme Review',
    title: 'Get Your Training Programme Professionally Assessed',
    description: 'Already have a workout programme but want to know if it is structured correctly? Receive feedback on your current programme with recommendations to help improve your results.',
    packageIds: ['programme-review'],
  },
  {
    id: 'technique-review',
    eyebrow: 'Exercise Technique Review',
    title: 'Improve Your Exercise Technique',
    description: 'Get professional feedback on your lifting technique through video review. Whether you want to fix a specific movement or have multiple exercises assessed, choose the option that fits your needs.',
    packageIds: ['technique-single', 'technique-full'],
  },
] as const;

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
  const showServiceSections = activeCategory === 'All' || activeCategory === 'One-Off';

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

          {showServiceSections && (
            <div className="w-full max-w-[1000px] space-y-16 pb-24">
              {SERVICE_SECTIONS.map((section) => {
                const sectionPackages = section.packageIds
                  .map((packageId) => PACKAGES.find((pkg) => pkg.id === packageId))
                  .filter((pkg): pkg is (typeof PACKAGES)[number] => Boolean(pkg));

                return (
                  <motion.section
                    key={section.id}
                    id={section.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="scroll-mt-24 text-left"
                  >
                    <div className="mb-6 max-w-3xl">
                      <div className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-[#FF0000]">{section.eyebrow}</div>
                      <h2 className="font-outfit text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">{section.title}</h2>
                      <p className="mt-3 text-[15px] font-medium leading-7 text-gray-600 sm:text-base">{section.description}</p>
                    </div>

                    <div className={`grid gap-5 ${sectionPackages.length > 1 ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
                      {sectionPackages.map((pkg) => {
                        const isSelected = selectedPackage === pkg.id;

                        return (
                          <article
                            key={pkg.id}
                            className={`flex flex-col rounded-xl border bg-white p-6 transition-all sm:p-7 ${isSelected ? 'border-[#FF0000] shadow-[8px_8px_0_#111827]' : 'border-gray-200 hover:border-gray-300'}`}
                          >
                            <button type="button" onClick={() => setPackage(pkg.id)} className="w-full text-left">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <div className="text-sm font-bold text-gray-400">{pkg.subtitle}</div>
                                  <h3 className="mt-1 font-outfit text-xl font-black tracking-tight text-gray-950 sm:text-2xl">{pkg.title}</h3>
                                </div>
                                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${isSelected ? 'border-[#FF0000] text-[#FF0000]' : 'border-gray-200 text-gray-300'}`}>
                                  {isSelected ? <Check size={17} strokeWidth={3} /> : <Circle size={10} />}
                                </span>
                              </div>
                              <div className="mt-5 font-outfit text-3xl font-black text-gray-950">{pkg.price}</div>
                              <p className="mt-4 text-[15px] font-medium leading-7 text-gray-600">{pkg.detailSubtitle}</p>
                            </button>

                            {pkg.suitableFor && (
                              <div className="mt-6">
                                <div className="text-xs font-black uppercase tracking-[0.08em] text-gray-400">Suitable For</div>
                                <ul className="mt-3 space-y-2">
                                  {pkg.suitableFor.map((item) => (
                                    <li key={item} className="flex items-start gap-3 text-[15px] font-medium leading-6 text-gray-600">
                                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#FF0000]" />
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            <div className="mt-6">
                              <div className="text-xs font-black uppercase tracking-[0.08em] text-gray-400">Includes</div>
                              <ul className={`mt-3 grid gap-x-8 gap-y-3 ${sectionPackages.length === 1 ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
                                {pkg.features.map((feature) => (
                                  <li key={feature} className="flex items-start gap-3 text-[15px] font-bold leading-6 text-gray-900">
                                    <Check className="mt-1 h-4 w-4 shrink-0 text-[#FF0000]" strokeWidth={3} />
                                    {feature}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {pkg.footnote && <p className="mt-6 text-sm italic leading-6 text-gray-400">{pkg.footnote}</p>}

                            <button
                              type="button"
                              onClick={() => startSignupForPackage(pkg.id)}
                              className="mt-7 inline-flex h-12 items-center justify-center rounded-full bg-gray-950 px-6 text-sm font-black uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#FF0000]"
                            >
                              Select Service
                            </button>
                          </article>
                        );
                      })}
                    </div>
                  </motion.section>
                );
              })}
            </div>
          )}
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
