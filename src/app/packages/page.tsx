"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useFunnelStore } from '@/store/funnelStore';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PlanCard } from '@/components/ui/PlanCard';
import { Check, X } from 'lucide-react';

const PACKAGES = [
  {
    id: 'rookie',
    letter: 'R',
    title: 'Rookie Bundle',
    subtitle: '03 Months',
    price: 'Rs. 73,350',
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
    letter: 'I',
    title: 'Intermediate Bundle',
    subtitle: '03 Months',
    price: 'Rs. 59,850',
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
    letter: 'A',
    title: 'Advanced Bundle',
    subtitle: '06 Months',
    price: 'Rs. 95,200',
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
  }
];

export default function PackagesPage() {
  const router = useRouter();
  const { setPackage, selectedPackage } = useFunnelStore();
  const [infoPackage, setInfoPackage] = useState<typeof PACKAGES[0] | null>(null);

  const [mounted, setMounted] = React.useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="min-h-screen py-12 px-6 flex flex-col items-center">
      <motion.div 
        className="w-full max-w-[1000px] mt-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-12">
          <h1 className="text-[13px] font-bold tracking-[0.2em] text-gray-400 mb-8 uppercase">Choose your package</h1>
        </div>

        <div className="grid md:grid-cols-3 gap-8 pb-24">
          {PACKAGES.map((pkg) => (
            <PlanCard
              key={pkg.id}
              {...pkg}
              isSelected={selectedPackage === pkg.id}
              onClick={() => setPackage(pkg.id)}
              onInfoClick={(e) => setInfoPackage(pkg)}
              onStartNow={() => {
                setPackage(pkg.id);
                router.push('/signup/step-1');
              }}
            />
          ))}
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
              
              <div className="text-[3.5rem] leading-none font-black text-[#cca751] mb-2">{infoPackage.letter}</div>
              <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">{infoPackage.title}</h2>
              <div className="text-[#cca751] font-bold text-[17px] mb-6">{infoPackage.subtitle} • {infoPackage.price}</div>
              
              <div className="bg-[#F9F8F4] rounded-2xl p-5 mb-8 border border-[#cca751]/10">
                <p className="text-gray-700 font-medium mb-3 leading-relaxed text-[15px]">{infoPackage.detailSubtitle}</p>
                <p className="text-[13px] font-bold text-[#cca751] uppercase tracking-wider">{infoPackage.example}</p>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 text-[17px] mb-4 tracking-tight">What's included:</h3>
                {infoPackage.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start">
                    <div className="mt-0.5 bg-[#cca751]/10 p-1 rounded-full mr-3 shrink-0">
                      <Check className="h-3 w-3 text-[#cca751]" strokeWidth={4} />
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
