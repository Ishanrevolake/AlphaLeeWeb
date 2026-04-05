"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CreditCard, Landmark, Loader2 } from 'lucide-react';
import { useFunnelStore } from '@/store/funnelStore';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';

export default function Step2Page() {
  const router = useRouter();
  const { name, email, selectedPackage } = useFunnelStore();
  const [loadingType, setLoadingType] = useState<'stripe' | 'bank' | null>(null);

  const [mounted, setMounted] = React.useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  if (!selectedPackage || !name || !email) {
    // If not properly filled, push back
    router.push('/signup/step-1');
    return null;
  }

  const handleStripePayment = async () => {
    setLoadingType('stripe');
    try {
      // In a real app we'll save user data to Supabase here first,
      // then call /api/checkout to get the Stripe URL, and redirect.
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userDetails: useFunnelStore.getState(),
          packageName: selectedPackage 
        })
      });
      
      const session = await response.json();
      if (session?.url) {
        window.location.href = session.url;
      } else {
        // Fallback for UI review without Stripe API keys configured yet
        setTimeout(() => router.push('/signup/success'), 1500);
      }
    } catch (error) {
      console.error(error);
      setLoadingType(null);
    }
  };

  const handleBankTransfer = async () => {
    setLoadingType('bank');
    // Mock save to DB and proceed
    setTimeout(() => {
      router.push('/signup/success');
    }, 1500);
  };

  return (
    <div className="min-h-screen py-12 px-6 flex flex-col items-center">
      <div className="w-full max-w-xl mx-auto mb-10 mt-8">
        <ProgressBar currentStep={2} totalSteps={3} />
      </div>

      <motion.div 
        className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100 w-full max-w-xl text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-black mb-4 font-outfit text-gray-900">Secure Your Spot</h1>
        <p className="text-gray-600 font-medium mb-8">
          You've selected the <span className="font-bold text-primary capitalize">{selectedPackage}</span> plan. Choose your preferred payment method below.
        </p>

        <div className="space-y-4">
          <button 
            onClick={handleStripePayment}
            disabled={loadingType !== null}
            className="w-full relative flex items-center justify-between p-6 rounded-2xl border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all focus:outline-none"
          >
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mr-4">
                <CreditCard size={24} />
              </div>
              <div className="text-left">
                <span className="block font-bold text-gray-900 text-lg">Pay with Card</span>
                <span className="text-gray-500 text-sm font-medium">Instant & secure via Stripe</span>
              </div>
            </div>
            {loadingType === 'stripe' ? <Loader2 className="animate-spin text-primary" size={24} /> : null}
          </button>

          <button 
            onClick={handleBankTransfer}
            disabled={loadingType !== null}
            className="w-full relative flex items-center justify-between p-6 rounded-2xl border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all focus:outline-none"
          >
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-green-50 text-green-500 flex items-center justify-center mr-4">
                <Landmark size={24} />
              </div>
              <div className="text-left">
                <span className="block font-bold text-gray-900 text-lg">Bank Transfer</span>
                <span className="text-gray-500 text-sm font-medium">Manual verification required</span>
              </div>
            </div>
            {loadingType === 'bank' ? <Loader2 className="animate-spin text-primary" size={24} /> : null}
          </button>
        </div>

        <div className="mt-10 flex justify-center">
          <Button variant="secondary" onClick={() => router.back()}>
            Back to Details
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
