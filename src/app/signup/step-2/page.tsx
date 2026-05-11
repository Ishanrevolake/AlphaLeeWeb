"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useFunnelStore } from '@/store/funnelStore';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import {
  PACKAGES,
  REPLY_GUARANTEE_ADDON_PRICE,
  formatLkrPrice,
  getPackageById,
  getPackageTotalPrice,
} from '@/lib/packages';

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl bg-[#F9F8F4] p-4 border border-gray-100">
    <div className="text-[12px] font-black uppercase tracking-[0.16em] text-gray-400 mb-1">{label}</div>
    <div className="text-[15px] font-bold text-gray-900">{value}</div>
  </div>
);

export default function Step2Page() {
  const router = useRouter();
  const store = useFunnelStore();
  const selectedPackage = getPackageById(store.selectedPackage);
  const total = getPackageTotalPrice(store.selectedPackage, store.replyGuaranteeAddon);

  const [mounted, setMounted] = React.useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  if (!selectedPackage || !store.name || !store.email) {
    router.push('/signup/step-1');
    return null;
  }

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 flex flex-col items-center">
      <div className="w-full max-w-3xl mx-auto mb-8 sm:mb-10 mt-4 sm:mt-8">
        <ProgressBar currentStep={2} totalSteps={3} />
      </div>

      <motion.div
        className="bg-white p-5 sm:p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100 w-full max-w-3xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-black mb-3 font-outfit text-gray-900 tracking-tight">Review Your Request</h1>
          <p className="text-gray-600 font-medium">Confirm your details before moving to payment.</p>
        </div>

        <div className="rounded-3xl border border-red-500/10 bg-[#FF0000]/5 p-5 sm:p-6 mb-6">
          <div className="text-[12px] font-black uppercase tracking-[0.18em] text-[#FF0000] mb-3">Selected package</div>
          <div className="grid md:grid-cols-[1fr_auto] gap-4 md:items-end">
            <div className="space-y-3 min-w-0">
              <select
                value={selectedPackage.id}
                onChange={(event) => store.setPackage(event.target.value)}
                className="w-full min-w-0 rounded-2xl border-2 border-white bg-white px-3 sm:px-4 py-3 text-base sm:text-lg font-black text-gray-900 shadow-sm outline-none transition focus:border-[#FF0000]"
              >
                {PACKAGES.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.title} - {pkg.subtitle} - {pkg.price}
                  </option>
                ))}
              </select>
              <p className="text-sm font-semibold text-gray-500">{selectedPackage.subtitle} - {selectedPackage.footerText}</p>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-gray-900">{selectedPackage.price}</div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mb-6">
          <DetailRow label="Full name" value={store.name} />
          <DetailRow label="Email" value={store.email} />
          <DetailRow label="Gender" value={store.gender} />
          <DetailRow label="Experience" value={store.experienceLevel} />
          <DetailRow label="Activity level" value={store.activityLevel} />
          <DetailRow label="Workout location" value={store.workoutLocation} />
          <DetailRow label="Workout days" value={`${store.workoutDays} days per week`} />
        </div>

        <div className={`p-5 sm:p-6 rounded-3xl border flex flex-col md:flex-row items-center gap-5 sm:gap-6 mb-6 transition-all ${
          store.replyGuaranteeAddon
            ? 'bg-[#FF0000]/10 border-[#FF0000]/40 shadow-sm'
            : 'bg-[#FF0000]/5 border-[#FF0000]/20'
        }`}>
          <div className="shrink-0 bg-white shadow-sm p-3 rounded-2xl border border-gray-100">
            <div className="text-[#FF0000] font-black text-xl">ADD-ON</div>
          </div>
          <div className="text-center md:text-left flex-1">
            <h3 className="font-bold text-gray-900 mb-1">24-Hour Reply Guarantee</h3>
            <p className="text-[14px] text-gray-600 font-medium mb-1">
              Need clarification or technical support faster? Ensure our team assists you within 24 hours.
            </p>
            <p className="text-[14px] font-bold text-[#FF0000]">Just {formatLkrPrice(REPLY_GUARANTEE_ADDON_PRICE)} per month in addition to your subscription.</p>
          </div>
          <Button
            type="button"
            onClick={() => store.setReplyGuaranteeAddon(!store.replyGuaranteeAddon)}
            className={`w-full md:w-auto h-12 font-bold ${
              store.replyGuaranteeAddon
                ? 'bg-gray-900 hover:bg-gray-800 text-white'
                : 'bg-[#FF0000] hover:bg-red-700 text-white'
            }`}
          >
            {store.replyGuaranteeAddon ? 'Remove Add On' : 'Add On'}
          </Button>
        </div>

        <div className="rounded-3xl bg-gray-900 p-5 sm:p-6 text-white mb-8">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4 text-sm font-semibold text-gray-300">
              <span>{selectedPackage.title}</span>
              <span className="shrink-0">{total.formattedBasePrice}</span>
            </div>
            {store.replyGuaranteeAddon && (
              <div className="flex items-start justify-between gap-4 text-sm font-semibold text-gray-300">
                <span>24-Hour Reply Guarantee</span>
                <span className="shrink-0">{total.formattedAddonPrice}</span>
              </div>
            )}
            <div className="border-t border-white/15 pt-4 flex items-end justify-between gap-4">
              <span className="text-sm font-black uppercase tracking-[0.16em] text-white/70">Final price</span>
              <span className="text-2xl sm:text-3xl font-black text-right">{total.formattedTotalPrice}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Button variant="secondary" onClick={() => router.push('/signup/step-1')} className="h-14 font-bold">
            Back to Details
          </Button>
          <Button onClick={() => router.push('/signup/step-3')} size="lg" className="h-14 font-bold bg-gray-900 hover:bg-gray-800 text-white">
            Continue to Payment
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
