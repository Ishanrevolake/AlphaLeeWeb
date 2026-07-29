"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, Eye, EyeOff, Lock, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ASK_ALPHA_OFFERS, createAskAlphaReference, formatAskAlphaPrice, getAskAlphaOfferById } from "@/lib/askAlpha";
import { supabase } from "@/lib/supabase";

const BANK_DETAILS = [
  { label: "Account Name", value: "Alpha Lee Fitness" },
  { label: "Bank", value: "Commercial Bank" },
  { label: "Account Number", value: "0000000000" },
  { label: "Branch", value: "Colombo" },
];

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) return String(error.message);
  return "Something went wrong. Please try again.";
}

export default function AskAlphaAccountPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F9F8F4]" />}>
      <AskAlphaAccountStep />
    </Suspense>
  );
}

function AskAlphaAccountStep() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const offerId = searchParams.get("offer");
  const offer = useMemo(() => getAskAlphaOfferById(offerId) || ASK_ALPHA_OFFERS[0], [offerId]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [paymentReference, setPaymentReference] = useState(createAskAlphaReference());
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipName, setSlipName] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id || null);
      setIsChecking(false);
    });
  }, []);

  const handleAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");

    try {
      if (authMode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setUserId(data.user.id);
        return;
      }

      const firstName = String(form.get("firstName") || "").trim();
      const lastName = String(form.get("lastName") || "").trim();
      const phone = String(form.get("phone") || "").trim();
      if (!firstName || !lastName || !phone) throw new Error("Please enter your name and phone number.");

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { first_name: firstName, last_name: lastName, full_name: `${firstName} ${lastName}`, phone } },
      });
      if (error) throw error;
      if (!data.session) {
        setAuthMode("login");
        setMessage("Account created. Confirm your email if required, then log in to continue.");
        return;
      }
      setUserId(data.user?.id || null);
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyValue = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(""), 1400);
  };

  const submitPayment = async () => {
    if (!userId || !offer || !slipFile) {
      setMessage("Please upload your payment slip before submitting.");
      return;
    }
    setIsSubmitting(true);
    setMessage("");

    try {
      const safeName = slipFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const slipPath = `${userId}/ask-alpha-${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage.from("payment-slips").upload(slipPath, slipFile, { cacheControl: "3600" });
      if (uploadError) throw uploadError;

      let submittedReference = paymentReference;
      let askOrder: { id: string } | null = null;
      let orderError: unknown = null;

      // An interrupted submission can leave its unique reference behind.
      // Generate a new one on conflict so retrying is safe.
      for (let attempt = 0; attempt < 3; attempt += 1) {
        if (attempt > 0) submittedReference = createAskAlphaReference();
        const { data, error } = await supabase.from("ask_alpha_orders").insert({
          user_id: userId,
          product_id: offer.id,
          product_title: offer.title,
          question_credits: offer.questionCredits,
          amount_lkr: offer.priceLkr,
          method: "bank",
          reference: submittedReference,
          slip_file_name: slipFile.name,
          slip_storage_path: slipPath,
        }).select("id").single();

        if (!error) {
          askOrder = data;
          break;
        }
        orderError = error;
        if (error.code !== "23505") break;
      }
      if (!askOrder) throw orderError || new Error("Unable to create the Ask Alpha order.");

      const { error: paymentError } = await supabase.from("payments").insert({
        user_id: userId,
        ask_alpha_order_id: askOrder.id,
        service_type: "ask_alpha",
        method: "bank",
        reference: submittedReference,
        amount_lkr: offer.priceLkr,
        slip_file_name: slipFile.name,
        slip_storage_path: slipPath,
      });
      if (paymentError) {
        // Some deployed schemas automatically create the matching payment.
        // If it exists, the 409 is an idempotent success rather than a failure.
        const { data: syncedPayment } = await supabase
          .from("payments")
          .select("id")
          .eq("ask_alpha_order_id", askOrder.id)
          .maybeSingle();
        if (!syncedPayment) throw paymentError;
      }

      const { data: mainPayments } = await supabase.from("payments").select("id").eq("user_id", userId).limit(1);
      await supabase
        .from("profiles")
        .update({ client_type: mainPayments?.length ? "both" : "ask_alpha" })
        .eq("id", userId);

      setPaymentReference(createAskAlphaReference());
      router.push("/signup/success");
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F4] px-4 py-10 sm:px-6 sm:py-16">
      <motion.div className="mx-auto max-w-2xl" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
        <Link href="/ask-alpha" className="mb-6 inline-flex items-center gap-2 text-sm font-black text-gray-500 hover:text-[#FF0000]">
          <ArrowLeft size={17} /> Change package
        </Link>

        <div className="mb-5 rounded-2xl border border-[#FF0000]/20 bg-white p-4">
          <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#FF0000]">Selected package</div>
          <div className="mt-1 flex items-center justify-between gap-4">
            <div className="font-outfit text-xl font-black text-gray-900">{offer.title}</div>
            <div className="shrink-0 font-black text-gray-900">{formatAskAlphaPrice(offer.priceLkr)}</div>
          </div>
        </div>

        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          {isChecking ? (
            <div className="py-12 text-center text-sm font-black uppercase tracking-wider text-gray-400">Loading</div>
          ) : !userId ? (
            <>
              <div className="mb-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF0000]/10 text-[#FF0000]"><Lock size={22} /></div>
                <h1 className="font-outfit text-3xl font-black tracking-tight text-gray-900">{authMode === "signup" ? "Create your Q&A account" : "Log in to continue"}</h1>
                <p className="mt-2 text-sm font-semibold text-gray-500">Create or access your client account before submitting payment.</p>
              </div>
              <div className="mb-5 grid grid-cols-2 rounded-full bg-[#F9F8F4] p-1">
                {(["signup", "login"] as const).map((mode) => (
                  <button key={mode} type="button" onClick={() => { setAuthMode(mode); setMessage(""); }} className={`rounded-full px-4 py-2 text-sm font-black ${authMode === mode ? "bg-white shadow-sm" : "text-gray-500"}`}>
                    {mode === "signup" ? "Sign up" : "Log in"}
                  </button>
                ))}
              </div>
              <form onSubmit={handleAuth} className="space-y-4">
                {authMode === "signup" && <div className="grid gap-4 sm:grid-cols-2"><Input name="firstName" label="First Name" placeholder="John" /><Input name="lastName" label="Last Name" placeholder="Doe" /></div>}
                <Input name="email" type="email" label="Email Address" placeholder="you@example.com" autoComplete="email" />
                {authMode === "signup" && <Input name="phone" type="tel" label="WhatsApp / Phone" placeholder="+94 77 123 4567" />}
                <div className="relative">
                  <Input name="password" type={showPassword ? "text" : "password"} label="Password" placeholder="Minimum 8 characters" autoComplete={authMode === "signup" ? "new-password" : "current-password"} className="pr-12" />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute bottom-4 right-4 text-gray-400" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
                {message && <div className="rounded-2xl bg-gray-50 p-4 text-sm font-bold text-gray-700">{message}</div>}
                <Button type="submit" isLoading={isSubmitting} className="h-14 w-full rounded-full bg-gray-900 text-white hover:bg-[#FF0000]">{authMode === "signup" ? "Create Account" : "Log In"}</Button>
              </form>
            </>
          ) : (
            <div className="space-y-6">
              <div><div className="text-xs font-black uppercase tracking-wider text-[#FF0000]">Payment</div><h1 className="mt-2 font-outfit text-3xl font-black">Submit your payment slip</h1></div>
              <div className="rounded-2xl bg-[#F9F8F4] p-4">
                <div className="mb-4 flex items-center justify-between gap-4 border-b border-gray-200 pb-4">
                  <div><div className="text-[11px] font-black uppercase text-gray-400">Reference</div><div className="mt-1 text-xl font-black">{paymentReference}</div></div>
                  <button type="button" onClick={() => copyValue(paymentReference, "reference")} className="rounded-full bg-white px-4 py-2 text-sm font-black"><Copy size={14} className="mr-2 inline" />{copied === "reference" ? "Copied" : "Copy"}</button>
                </div>
                {BANK_DETAILS.map((detail) => <div key={detail.label} className="flex justify-between border-b border-gray-200 py-3 last:border-0"><span className="text-sm font-bold text-gray-500">{detail.label}</span><span className="text-sm font-black">{detail.value}</span></div>)}
              </div>
              <label className={`relative flex cursor-pointer flex-col items-center rounded-3xl border-2 border-dashed p-8 text-center ${slipName ? "border-green-400 bg-green-50" : "border-gray-200"}`}>
                <Upload className={slipName ? "text-green-600" : "text-[#FF0000]"} size={30} />
                <span className="mt-3 font-black">{slipName || "Upload payment slip"}</span>
                <span className="mt-1 text-sm text-gray-500">PNG, JPG, or PDF</span>
                <input type="file" accept="image/png,image/jpeg,application/pdf" className="absolute inset-0 h-full w-full opacity-0" onChange={(event) => { const file = event.target.files?.[0] || null; setSlipFile(file); setSlipName(file?.name || ""); }} />
              </label>
              {message && <div className="rounded-2xl bg-gray-50 p-4 text-sm font-bold text-gray-700">{message}</div>}
              <Button type="button" onClick={submitPayment} isLoading={isSubmitting} className="h-14 w-full rounded-full bg-gray-900 text-white hover:bg-[#FF0000]">Submit for Verification</Button>
            </div>
          )}
        </section>
      </motion.div>
    </div>
  );
}
