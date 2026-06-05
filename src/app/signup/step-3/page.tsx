"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, Copy, Landmark, MessageCircle, Upload } from 'lucide-react';
import { useFunnelStore } from '@/store/funnelStore';
import { Button } from '@/components/ui/Button';
import {
  formatLkrPrice,
  getPackageById,
  getPackageTotalPrice,
  PACKAGES,
  parseLkrPrice,
  REPLY_GUARANTEE_ADDON_PRICE,
} from '@/lib/packages';
import { supabase } from '@/lib/supabase';
import { getLatestPayment } from '@/lib/clientAccess';

const BANK_DETAILS = [
  { label: 'Account Name', value: 'Alpha Lee Fitness' },
  { label: 'Bank', value: 'Commercial Bank' },
  { label: 'Account Number', value: '0000000000' },
  { label: 'Branch', value: 'Colombo' },
];

function getSubmitErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const message = String((error as { message?: unknown }).message || '').trim();
    if (message) return message;
  }

  return 'Something went wrong while submitting your onboarding details.';
}

function createPaymentReference() {
  return `ALF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export default function Step3Page() {
  const router = useRouter();
  const store = useFunnelStore();
  const selectedPackage = getPackageById(store.selectedPackage);
  const replyGuaranteeEligible = selectedPackage?.category !== 'One-Off';
  const replyGuaranteeSelected = Boolean(replyGuaranteeEligible && store.replyGuaranteeAddon);
  const total = getPackageTotalPrice(store.selectedPackage, replyGuaranteeSelected);
  const replyGuaranteePrice = formatLkrPrice(REPLY_GUARANTEE_ADDON_PRICE);
  const [slipName, setSlipName] = useState(store.paymentSlipName || '');
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');
  const [showPackageSelector, setShowPackageSelector] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
    if (!store.paymentReference) {
      store.createPaymentReference();
    }
  }, [store]);

  useEffect(() => {
    if (selectedPackage?.category === 'One-Off' && store.replyGuaranteeAddon) {
      store.setReplyGuaranteeAddon(false);
    }
  }, [selectedPackage?.category, store]);

  const paymentReference = store.paymentReference || 'ALF-PENDING';

  if (!mounted) return null;

  if (!selectedPackage || !store.firstName) {
    router.push('/signup/step-1');
    return null;
  }

  if (!store.primaryGoal) {
    router.push('/signup/step-2');
    return null;
  }

  const copyValue = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(''), 1400);
    } catch {
      setCopied('');
    }
  };

  const toOptionalNumber = (value: string) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && value.trim() ? parsed : null;
  };

  const submitPayment = async () => {
    if (!slipFile) {
      setError('Please upload your payment slip before submitting.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData.user) {
        throw new Error('Please log in before submitting your payment details.');
      }

      const userId = userData.user.id;
      const existingPayment = await getLatestPayment(userId);

      if (existingPayment) {
        store.setDetails({
          paymentMethod: 'bank',
          paymentReference: existingPayment.reference,
          paymentSlipName: existingPayment.slip_file_name || slipFile.name,
        });
        router.push('/signup/success');
        return;
      }

      const safeFileName = slipFile.name.replace(/[^a-zA-Z0-9._-]/g, '-');
      const slipPath = `${userId}/${Date.now()}-${safeFileName}`;

      const { error: uploadError } = await supabase.storage
        .from('payment-slips')
        .upload(slipPath, slipFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Payment slip upload failed: ${uploadError.message}`);
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: store.firstName,
          last_name: store.lastName,
          full_name: store.name,
          email: store.email,
          phone: store.phone,
        })
        .eq('id', userId);

      if (profileError) {
        throw new Error(`Profile update failed: ${profileError.message}`);
      }

      const { data: onboarding, error: onboardingError } = await supabase
        .from('onboarding_submissions')
        .insert({
          user_id: userId,
          age: toOptionalNumber(store.age),
          gender: store.gender || null,
          height_cm: toOptionalNumber(store.height),
          current_weight_kg: toOptionalNumber(store.weight),
          goal_weight_kg: toOptionalNumber(store.goalWeight),
          experience_level: store.experienceLevel || null,
          workout_location: store.workoutLocation || null,
          workout_days: store.workoutDays || null,
          diet_preference: store.dietPreference || null,
          primary_goal: store.primaryGoal || null,
          allergies: store.allergies || null,
          injuries: store.injuries || null,
          notes: store.notes || null,
        })
        .select('id')
        .single();

      if (onboardingError) {
        throw new Error(`Onboarding submission failed: ${onboardingError.message}`);
      }

      const { data: packageSelection, error: packageError } = await supabase
        .from('package_selections')
        .insert({
          user_id: userId,
          onboarding_submission_id: onboarding.id,
          package_id: selectedPackage.id,
          package_title: selectedPackage.title,
          package_category: selectedPackage.category,
          package_subtitle: selectedPackage.subtitle,
          base_price_lkr: total.basePrice,
          reply_guarantee_addon: replyGuaranteeSelected,
          addon_price_lkr: replyGuaranteeSelected ? REPLY_GUARANTEE_ADDON_PRICE : 0,
          total_price_lkr: total.totalPrice,
        })
        .select('id')
        .single();

      if (packageError) {
        throw new Error(`Package selection failed: ${packageError.message}`);
      }

      let submittedReference = paymentReference;
      let payment:
        | {
            id: string;
          }
        | null = null;
      let paymentErrorMessage = '';

      for (let attempt = 0; attempt < 3; attempt += 1) {
        if (attempt > 0 || submittedReference === 'ALF-PENDING') {
          submittedReference = createPaymentReference();
        }

        const { data: paymentData, error: paymentError } = await supabase
          .from('payments')
          .insert({
            user_id: userId,
            package_selection_id: packageSelection.id,
            method: 'bank',
            reference: submittedReference,
            amount_lkr: total.totalPrice || parseLkrPrice(selectedPackage.price),
            slip_file_name: slipFile.name,
            slip_storage_path: slipPath,
          })
          .select('id')
          .single();

        if (!paymentError) {
          payment = paymentData;
          break;
        }

        paymentErrorMessage = paymentError.message;

        if (paymentError.code !== '23505') {
          break;
        }
      }

      if (!payment) {
        throw new Error(`Payment record failed: ${paymentErrorMessage || 'Unable to create payment record.'}`);
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (accessToken) {
        await fetch('/api/payments/notify-coach', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentId: payment.id,
            paymentReference: submittedReference,
            slipPath,
            slipFileName: slipFile.name,
          }),
        });
      }

      store.setDetails({
        paymentMethod: 'bank',
        paymentReference: submittedReference,
        paymentSlipName: slipFile.name,
      });
      router.push('/signup/success');
    } catch (submitError) {
      setError(getSubmitErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 flex flex-col items-center">
      <motion.div
        className="mt-4 w-full max-w-3xl rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:mt-8 sm:p-8 md:p-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <div className="text-[12px] font-black uppercase tracking-[0.2em] text-[#FF0000] mb-3">Payment</div>
          <h1 className="text-3xl sm:text-4xl font-black mb-3 font-outfit text-gray-900 tracking-tight">Secure Your Spot</h1>
          <p className="text-gray-600 font-medium">
            You&apos;ve selected <span className="font-bold text-[#FF0000]">{selectedPackage.title}</span>.
          </p>
        </div>

        <div className="rounded-2xl bg-[#F9F8F4] border border-gray-100 p-5 mb-5 text-left">
          <div className="space-y-3">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="text-sm font-bold text-gray-500">Selected package</div>
                <div className="text-[15px] font-black text-gray-900">{selectedPackage.title}</div>
                <div className="mt-1 text-sm font-semibold text-gray-500">{selectedPackage.subtitle}</div>
              </div>
              <div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end">
                <div className="text-lg font-black text-gray-900">{total.formattedBasePrice}</div>
                <button
                  type="button"
                  onClick={() => setShowPackageSelector((value) => !value)}
                  className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-black text-gray-600 transition-colors hover:border-[#FF0000] hover:text-[#FF0000]"
                >
                  {showPackageSelector ? 'Close packages' : 'Change package'}
                </button>
              </div>
            </div>

            {showPackageSelector && (
              <div className="grid gap-3 border-t border-gray-200 pt-4 sm:grid-cols-2">
                {PACKAGES.map((pkg) => {
                  const isSelected = pkg.id === selectedPackage.id;

                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => {
                        store.setPackage(pkg.id);
                        if (pkg.category === 'One-Off') {
                          store.setReplyGuaranteeAddon(false);
                        }
                        setShowPackageSelector(false);
                        setError('');
                      }}
                      className={`rounded-2xl border p-4 text-left transition-colors ${
                        isSelected
                          ? 'border-[#FF0000] bg-white shadow-sm'
                          : 'border-gray-200 bg-white/70 hover:border-gray-300 hover:bg-white'
                      }`}
                    >
                      <div className="flex min-w-0 items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[13px] font-black text-gray-900">{pkg.title}</div>
                          <div className="mt-1 text-xs font-bold text-gray-500">{pkg.subtitle}</div>
                        </div>
                        <div className="shrink-0 text-sm font-black text-gray-900">{pkg.price}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {replyGuaranteeSelected && (
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

        {replyGuaranteeEligible && (
          <div className="mb-8 rounded-3xl border border-[#FF0000]/15 bg-[#FF0000]/5 p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#FF0000] shadow-sm">
                  <MessageCircle size={22} />
                </span>
                <div>
                  <div className="text-lg font-black text-gray-900">24-Hour Reply Guarantee</div>
                  <p className="mt-1 text-sm font-semibold leading-relaxed text-gray-600">
                    Add priority WhatsApp support with replies guaranteed within 24 hours.
                  </p>
                  <div className="mt-2 text-sm font-black text-[#FF0000]">{replyGuaranteePrice} per month</div>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={replyGuaranteeSelected}
                onClick={() => store.setReplyGuaranteeAddon(!replyGuaranteeSelected)}
                className={`flex h-12 min-w-[112px] items-center justify-center rounded-full px-5 text-sm font-black transition-colors ${
                  replyGuaranteeSelected
                    ? 'bg-[#FF0000] text-white shadow-lg shadow-red-500/20'
                    : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:text-[#FF0000]'
                }`}
              >
                {replyGuaranteeSelected ? 'Added' : 'Add'}
              </button>
            </div>
          </div>
        )}

        <div className="mb-8">
          <button
            type="button"
            className="relative flex w-full items-center gap-4 rounded-2xl border-2 border-[#FF0000] bg-[#FF0000]/5 p-5 text-left"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
              <Landmark size={24} />
            </span>
            <span>
              <span className="block text-lg font-black text-gray-900">Bank Transfer</span>
              <span className="text-sm font-semibold text-gray-500">Manual verification required</span>
            </span>
            <CheckCircle2 className="absolute right-4 top-4 text-[#FF0000]" size={20} />
          </button>
        </div>

        <div className="space-y-5">
          <div className="rounded-3xl border border-gray-100 bg-[#F9F8F4] p-5 sm:p-6">
            <div className="mb-4 flex flex-col gap-4 border-b border-gray-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="text-[12px] font-black uppercase tracking-[0.18em] text-gray-500">Payment Reference</div>
                <div className="mt-1 break-all text-2xl font-black text-gray-900">{paymentReference}</div>
              </div>
              <button
                type="button"
                onClick={() => copyValue(paymentReference, 'reference')}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-black text-gray-700 shadow-sm transition-colors hover:text-[#FF0000]"
              >
                <Copy size={16} />
                {copied === 'reference' ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="space-y-3">
              {BANK_DETAILS.map((detail) => (
                <div key={detail.label} className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4">
                  <div className="min-w-0">
                    <div className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">{detail.label}</div>
                    <div className="break-all text-sm font-bold text-gray-900 sm:text-base">{detail.value}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyValue(detail.value, detail.label)}
                    className="shrink-0 rounded-full border border-gray-200 px-3 py-2 text-xs font-black text-gray-500 transition-colors hover:border-[#FF0000] hover:text-[#FF0000]"
                  >
                    {copied === detail.label ? 'Copied' : 'Copy'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <label className={`relative flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center transition-all ${
            slipName ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white hover:border-[#FF0000] hover:bg-[#FF0000]/5'
          }`}>
            <Upload className={slipName ? 'text-green-600' : 'text-[#FF0000]'} size={34} />
            <span className="mt-3 text-lg font-black text-gray-900">
              {slipName ? 'Payment slip selected' : 'Upload payment slip'}
            </span>
            <span className="mt-1 text-sm font-semibold text-gray-500">
              <span className="block max-w-full break-words">{slipName || 'PNG, JPG, or PDF. This will later upload to Supabase Storage.'}</span>
            </span>
            <input
              type="file"
              accept="image/png,image/jpeg,application/pdf"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              onChange={(event) => {
                const file = event.target.files?.[0];
                setSlipName(file?.name || '');
                setSlipFile(file || null);
                setError('');
              }}
            />
          </label>
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-600">
            {error}
          </div>
        )}

        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-3">
          <Button variant="secondary" onClick={() => router.push('/signup/step-2')} className="h-14 w-full font-bold sm:w-auto">
            Back to Details
          </Button>
          <Button onClick={submitPayment} size="lg" isLoading={isSubmitting} className="h-14 w-full font-bold bg-gray-900 hover:bg-gray-800 text-white sm:w-auto">
            Submit for Verification
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
