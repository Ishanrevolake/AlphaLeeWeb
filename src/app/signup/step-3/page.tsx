"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CreditCard, Landmark, Loader2 } from 'lucide-react';
import { useFunnelStore } from '@/store/funnelStore';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { getPackageById, getPackageTotalPrice } from '@/lib/packages';

export default function Step3Page() {
  const router = useRouter();
  const store = useFunnelStore();
  const selectedPackage = getPackageById(store.selectedPackage);
  const total = getPackageTotalPrice(store.selectedPackage, store.replyGuaranteeAddon);
  const [loadingType, setLoadingType] = useState<'stripe' | 'bank' | null>(null);

  const [mounted, setMounted] = React.useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  if (!selectedPackage || !store.name || !store.email) {
    router.push('/signup/step-1');
    return null;
  }

  const handleStripePayment = async () => {
    setLoadingType('stripe');
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userDetails: useFunnelStore.getState(),
          packageName: selectedPackage.id
        })
      });

      const session = await response.json();
      if (session?.url) {
        window.location.href = session.url;
      } else {
        setTimeout(() => router.push('/signup/success'), 1500);
      }
    } catch (error) {
      console.error(error);
      setLoadingType(null);
    }
  };

  const handleBankTransfer = async () => {
    setLoadingType('bank');
    setTimeout(() => {
      router.push('/signup/success');
    }, 1500);
  };

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 flex flex-col items-center">
      <div className="w-full max-w-xl mx-auto mb-8 sm:mb-10 mt-4 sm:mt-8">
        <ProgressBar currentStep={3} totalSteps={3} />
      </div>

      <motion.div
        className="bg-white p-5 sm:p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100 w-full max-w-xl text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl sm:text-4xl font-black mb-4 font-outfit text-gray-900 tracking-tight">Secure Your Spot</h1>
        <p className="text-gray-600 font-medium mb-6">
          You&apos;ve selected <span className="font-bold text-primary">{selectedPackage.title}</span>.
        </p>

        <div className="rounded-2xl bg-[#F9F8F4] border border-gray-100 p-5 mb-8 text-left">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-sm font-bold text-gray-500">{selectedPackage.subtitle}</div>
                <div className="text-[15px] font-black text-gray-900">{selectedPackage.title}</div>
              </div>
              <div className="text-lg font-black text-gray-900 shrink-0">{total.formattedBasePrice}</div>
            </div>
            {store.replyGuaranteeAddon && (
              <div className="flex items-start justify-between gap-4 border-t border-gray-200 pt-3">
                <div className="text-[15px] font-bold text-gray-700">24-Hour Reply Guarantee</div>
                <div className="text-lg font-black text-gray-900 shrink-0">{total.formattedAddonPrice}</div>
              </div>
            )}
            <div className="flex items-end justify-between gap-4 border-t border-gray-200 pt-4">
              <div className="text-[12px] font-black uppercase tracking-[0.16em] text-gray-500">Final price</div>
              <div className="text-2xl sm:text-3xl font-black text-gray-900 text-right">{total.formattedTotalPrice}</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleStripePayment}
            disabled={loadingType !== null}
            className="w-full relative flex items-center justify-between gap-3 sm:gap-4 p-4 sm:p-6 rounded-2xl border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all focus:outline-none"
          >
            <div className="flex items-center min-w-0">
              <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mr-4">
                <CreditCard size={24} />
              </div>
              <div className="text-left min-w-0">
                <span className="block font-bold text-gray-900 text-base sm:text-lg">Pay with Card</span>
                <span className="text-gray-500 text-sm font-medium">Instant & secure via Stripe</span>
              </div>
            </div>
            {loadingType === 'stripe' ? <Loader2 className="animate-spin text-primary" size={24} /> : null}
          </button>

          <button
            onClick={handleBankTransfer}
            disabled={loadingType !== null}
            className="w-full relative flex items-center justify-between gap-3 sm:gap-4 p-4 sm:p-6 rounded-2xl border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all focus:outline-none"
          >
            <div className="flex items-center min-w-0">
              <div className="h-12 w-12 rounded-full bg-green-50 text-green-500 flex items-center justify-center mr-4">
                <Landmark size={24} />
              </div>
              <div className="text-left min-w-0">
                <span className="block font-bold text-gray-900 text-base sm:text-lg">Bank Transfer</span>
                <span className="text-gray-500 text-sm font-medium">Manual verification required</span>
              </div>
            </div>
            {loadingType === 'bank' ? <Loader2 className="animate-spin text-primary" size={24} /> : null}
          </button>
        </div>

        <div className="mt-10 flex justify-center">
          <Button variant="secondary" onClick={() => router.push('/signup/step-2')}>
            Back to Summary
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
