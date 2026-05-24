"use client";

import React, { useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, CheckCircle2, Clock3, MessageCircle, RefreshCw } from 'lucide-react';
import { useFunnelStore } from '@/store/funnelStore';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { getLatestPayment, type LatestPayment, type PaymentStatus } from '@/lib/clientAccess';

const statusContent: Record<PaymentStatus, {
  eyebrow: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tone: string;
}> = {
  pending_verification: {
    eyebrow: 'Pending verification',
    title: 'Your payment slip is still processing',
    description: 'We have your payment slip. Your coach will review it and update the status here after verification.',
    icon: <Clock3 size={48} strokeWidth={2} />,
    tone: 'border-amber-200 bg-amber-50 text-amber-600',
  },
  verified: {
    eyebrow: 'Payment verified',
    title: 'You are cleared to enter the dashboard',
    description: 'Your payment has been verified. You can now open your main client dashboard.',
    icon: <CheckCircle2 size={48} strokeWidth={2} />,
    tone: 'border-emerald-200 bg-emerald-50 text-emerald-600',
  },
  rejected: {
    eyebrow: 'Verification needs attention',
    title: 'Your payment could not be verified yet',
    description: 'Please check the note below and submit a clear payment slip again, or contact Alpha Lee for help.',
    icon: <AlertCircle size={48} strokeWidth={2} />,
    tone: 'border-red-200 bg-red-50 text-red-600',
  },
};

export default function SuccessPage() {
  const router = useRouter();
  const { firstName, paymentReference, paymentMethod, paymentSlipName } = useFunnelStore();
  const [mounted, setMounted] = React.useState(false);
  const [payment, setPayment] = React.useState<LatestPayment | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const loadPayment = useCallback(async () => {
    setIsLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      router.replace('/signup/step-1');
      return;
    }

    const latestPayment = await getLatestPayment(user.id);
    setPayment(latestPayment);
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    setMounted(true);
    loadPayment();
  }, [loadPayment]);

  if (!mounted) return null;

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100svh-64px)] items-center justify-center px-4">
        <div className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Loading payment status</div>
      </div>
    );
  }

  const status = payment?.status || 'pending_verification';
  const content = statusContent[status];
  const reference = payment?.reference || paymentReference || 'ALF-PENDING';
  const method = paymentMethod || 'bank';
  const slipName = payment?.slip_file_name || paymentSlipName;

  return (
    <div className="min-h-screen bg-white py-10 sm:py-12 px-4 sm:px-6 flex flex-col items-center justify-center">
      <motion.div
        className="text-center max-w-2xl"
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        <div className="flex justify-center mb-6">
          <motion.div
            className={`flex h-24 w-24 items-center justify-center rounded-full border ${content.tone}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            {content.icon}
          </motion.div>
        </div>

        <div className="text-[12px] font-black uppercase tracking-[0.22em] text-[#FF0000] mb-4">{content.eyebrow}</div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 font-outfit text-gray-900 tracking-tight">
          {content.title}
        </h1>

        <p className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-10 font-medium leading-relaxed">
          Thanks, {firstName || 'future athlete'}. {content.description}
        </p>

        <div className="mx-auto mb-10 grid max-w-xl gap-3 rounded-3xl border border-gray-100 bg-[#F9F8F4] p-5 text-left sm:p-6">
          <div className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4">
            <span className="text-[12px] font-black uppercase tracking-[0.16em] text-gray-400">Reference</span>
            <span className="font-black text-gray-900">{reference}</span>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4">
            <span className="text-[12px] font-black uppercase tracking-[0.16em] text-gray-400">Status</span>
            <span className="font-black capitalize text-gray-900">{status.replace('_', ' ')}</span>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4">
            <span className="text-[12px] font-black uppercase tracking-[0.16em] text-gray-400">Method</span>
            <span className="font-black capitalize text-gray-900">{method} transfer</span>
          </div>
          {slipName && (
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4">
              <span className="text-[12px] font-black uppercase tracking-[0.16em] text-gray-400">Slip</span>
              <span className="max-w-[55%] truncate font-black text-gray-900">{slipName}</span>
            </div>
          )}
          {payment?.verified_at && (
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4">
              <span className="text-[12px] font-black uppercase tracking-[0.16em] text-gray-400">Verified</span>
              <span className="font-black text-gray-900">{new Date(payment.verified_at).toLocaleString()}</span>
            </div>
          )}
          {payment?.rejection_reason && (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold leading-relaxed text-red-700">
              {payment.rejection_reason}
            </div>
          )}
        </div>

        {status === 'verified' ? (
          <Link
            href="/dashboard"
            className="mb-8 inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-gray-900 px-7 text-base font-black text-white shadow-xl shadow-gray-900/10 transition-colors hover:bg-[#FF0000]"
          >
            Open main dashboard
            <ArrowRight size={18} />
          </Link>
        ) : (
          <Button type="button" variant="secondary" onClick={loadPayment} isLoading={isLoading} className="mb-8 h-12 gap-2 rounded-full px-5">
            <RefreshCw size={16} />
            Refresh status
          </Button>
        )}

        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center">
          <MessageCircle className="text-[#FF0000] mb-4" size={32} />
          <h3 className="text-xl font-bold mb-2 text-gray-900">What happens next?</h3>
          <p className="text-gray-600 font-medium mb-4">
            {status === 'verified'
              ? 'Your coach can now start the starter-plan setup process inside the main dashboard.'
              : 'Keep this page bookmarked or log in again later to see the latest payment verification status.'}
          </p>
          <Button variant="outline" type="button">
            Message Alpha Lee
          </Button>
        </div>

        <Link href="/packages" className="mt-8 inline-block text-sm font-black text-gray-500 transition-colors hover:text-[#FF0000]">
          Back to packages
        </Link>
      </motion.div>
    </div>
  );
}
