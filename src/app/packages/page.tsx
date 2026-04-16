"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useFunnelStore } from '@/store/funnelStore';
import { PlanCard } from '@/components/ui/PlanCard';
import { Check, X } from 'lucide-react';

type Category = 'Bundles' | 'Monthly' | 'Annual' | 'One-Off';
const CATEGORIES: Category[] = ['Bundles', 'Annual', 'Monthly', 'One-Off'];

const PACKAGES = [
  // Annual
  {
    id: 'annual',
    category: 'Annual',
    letter: 'A',
    title: 'Annual Package',
    subtitle: '12 Months',
    price: 'Rs. 148,500',
    oldPriceText: 'Rs. 360,000',
    strikeOldPrice: true,
    footerText: '+ Top Tier Support',
    detailSubtitle: '12 Month service subscription. recommended for individuals with longterm goals',
    example: 'Invest in the longer term & save yourself some dough',
    features: [
      'Flexible meal plan adapted across the months',
      'Training plan personalized to goals & lifestyle',
      'Progress Check ins every 2 weeks for 3 months there on, every 4 weeks',
      'Dietary Supplementation guide',
      '48-72 Hour whatsapp reply guarantee',
      'Pause-resume service for legitimate reasons like health or travel',
      'Voice calls can be prescheduled'
    ]
  },
  // Bundles
  {
    id: 'rookie',
    category: 'Bundles',
    letter: 'R',
    title: 'Rookie Bundle',
    subtitle: '03 Months',
    price: 'Rs. 81,500',
    footerText: '+ High Attention',
    isPopular: true,
    detailSubtitle: '03 Month service subscription. recommended for individuals seeking higher levels of attention from the coaching service.',
    example: 'Example: Beginners',
    features: [
      'Meal plan personalized to your goals',
      'Training plan personalized to your fitness capacity',
      'Progress Check ins every week for 4 weeks. There on, progress check ins every 2 weeks for continued plan adjustments',
      'Supplementation guide',
      '24-48 Hour whatsapp reply guarantee'
    ]
  },
  {
    id: 'intermediate',
    category: 'Bundles',
    letter: 'I',
    title: 'Intermediate Bundle',
    subtitle: '03 Months',
    price: 'Rs. 66,500',
    footerText: '+ Moderate Attention',
    detailSubtitle: '03 Month service subscription. recommended for individuals seeking moderate levels of attention from the coaching service.',
    example: 'Example: experienced beginners or intermediates',
    features: [
      'Meal plan personalized to your goals',
      'Training plan personalized to your fitness capacity',
      'Progress Check ins every 2 weeks for 4 weeks. There on, progress check ins every 4 weeks for continued plan adjustments',
      'Supplementation guide',
      '48-72 Hour whatsapp reply guarantee'
    ]
  },
  {
    id: 'advanced',
    category: 'Bundles',
    letter: 'A',
    title: 'Advanced Bundle',
    subtitle: '06 Months',
    price: 'Rs. 98,500',
    footerText: '+ Lower Attention',
    detailSubtitle: '06 Month service subscription. recommended for individuals seeking lower levels of attention from the coaching service.',
    example: 'Example: advanced or more independent intermediates',
    features: [
      'Meal plan personalized to your goals',
      'Training plan personalized to your fitness capacity',
      'Progress Check ins every 4 weeks for 3 months. There on, progress check ins every 6 weeks for continued plan adjustments',
      'Supplementation guide',
      '72-96 Hour whatsapp reply guarantee'
    ]
  },
  // Monthly
  {
    id: 'package-1',
    category: 'Monthly',
    letter: 'P1',
    title: 'Package 1',
    subtitle: '1 Month',
    price: 'Rs. 35,500',
    oldPriceText: 'Rs. 33,500',
    strikeOldPrice: false,
    footerText: '+ High Attention',
    detailSubtitle: '1 month service – charged monthly. High attention package.',
    example: 'For maximum weekly accountability',
    features: [
      'Meal plan personalized to your goals',
      '4 week training plan personalized to your fitness capacity and goals',
      'Weekly Progress Check ins for continued plan adjustments',
      'Alpha Chef recipe Ebook (30+ recipes)',
      'Supplementation guide',
      '24-48 Hour whatsapp reply guarantee'
    ]
  },
  {
    id: 'package-2',
    category: 'Monthly',
    letter: 'P2',
    title: 'Package 2',
    subtitle: '1 Month',
    price: 'Rs. 32,500',
    oldPriceText: 'Rs. 30,500',
    strikeOldPrice: false,
    footerText: '+ Moderate Attention',
    detailSubtitle: '1 month service – charged monthly. moderate attention package.',
    example: 'For standard accountability',
    features: [
      'Meal plan personalized to your goals',
      '4 week training plan personalized to your fitness capacity and goals',
      'Progress Check ins every 2 weeks for continued plan adjustments',
      'Supplementation guide',
      '48-72 Hour whatsapp reply guarantee'
    ]
  },
  // One-Off
  {
    id: 'training-only',
    category: 'One-Off',
    letter: 'T',
    title: 'Training Plan Only',
    subtitle: '6 Weeks',
    price: 'Rs. 22,500',
    footerText: 'No Coaching',
    detailSubtitle: 'One-time plans that include a customized training plan only.',
    example: '6 week training plan',
    features: [
      'Built to your fitness levels',
      'Customised to your gym or home training environment',
      'Customised to your physique goals',
      'Not online coaching'
    ]
  },
  {
    id: 'meal-only',
    category: 'One-Off',
    letter: 'M',
    title: 'Meal Plan Only',
    subtitle: 'One Time',
    price: 'Rs. 22,500',
    footerText: 'No Coaching',
    detailSubtitle: 'One-time plans that include a customized meal plan only.',
    example: 'One time meal plan',
    features: [
      'Meal plan personalized to your goals',
      'Meal options customised to your like and dislikes',
      'Supplementation guide',
      'Not online coaching'
    ]
  }
];

export default function PackagesPage() {
  const router = useRouter();
  const { setPackage, selectedPackage } = useFunnelStore();
  const [infoPackage, setInfoPackage] = useState<typeof PACKAGES[0] | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category>('Bundles');

  const [mounted, setMounted] = React.useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const filteredPackages = PACKAGES.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen py-12 px-6 flex flex-col items-center">
      <motion.div 
        className="w-full max-w-[1200px] mt-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-[13px] font-bold tracking-[0.2em] text-gray-400 mb-6 uppercase">Choose your package</h1>
          
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-10">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-full text-[14px] font-bold transition-all ${
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
              className="max-w-2xl bg-white p-6 rounded-3xl mb-8 border border-gray-100 shadow-sm text-center"
            >
              <h2 className="text-xl font-black text-gray-900 mb-2 tracking-tight">Why Select a Bundle?</h2>
              <p className="text-[14px] text-gray-600 font-medium leading-relaxed">
                Save money as well as make a strong commitment to your goals. If you have a goal that requires several months of work, purchasing a bundle will be more cost effective. Significant physical and lifestyle changes often require a significant commitment, both in time and effort.
              </p>
            </motion.div>
          )}

          {(activeCategory === 'Bundles' || activeCategory === 'Monthly' || activeCategory === 'Annual') && (
             <motion.div 
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               className="max-w-3xl bg-[#FF0000]/5 p-6 rounded-3xl mb-12 border border-[#FF0000]/20 flex flex-col md:flex-row items-center gap-6"
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

          <motion.div 
            key={activeCategory}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className={`grid gap-8 pb-24 max-w-[1000px] w-full ${
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
                // Only pass required fields to PlanCard, not category
                isSelected={selectedPackage === pkg.id}
                onClick={() => setPackage(pkg.id)}
                onInfoClick={() => setInfoPackage(pkg)}
                onStartNow={() => {
                  setPackage(pkg.id);
                  router.push('/signup/step-1');
                }}
              />
            ))}
          </motion.div>
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
              className="relative bg-white rounded-[2rem] p-8 md:p-10 max-w-xl w-full shadow-2xl max-h-[90vh] overflow-y-auto border border-gray-100"
            >
              <button 
                onClick={() => setInfoPackage(null)}
                className="absolute top-6 right-6 h-10 w-10 bg-gray-50 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="text-[3.5rem] leading-none font-black text-[#FF0000] mb-2">{infoPackage.letter}</div>
              <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">{infoPackage.title}</h2>
              <div className="text-[#FF0000] font-bold text-[17px] mb-6">{infoPackage.subtitle} • {infoPackage.price}</div>
              
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
