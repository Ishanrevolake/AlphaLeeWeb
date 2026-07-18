"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle, Check, CheckCircle2, Circle, Copy, Eye, EyeOff, Lock, MessageCircle, RefreshCw, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ASK_ALPHA_OFFERS, createAskAlphaReference, formatAskAlphaPrice, getAskAlphaOfferById } from "@/lib/askAlpha";
import { getLatestAskAlphaOrder, type LatestAskAlphaOrder, type PaymentStatus } from "@/lib/clientAccess";
import { supabase } from "@/lib/supabase";
import { PACKAGES } from "@/lib/packages";
import { useFunnelStore } from "@/store/funnelStore";

const SERVICE_SECTIONS = [
  { eyebrow: "Consultations", title: "One-On-One Fitness Consultations", description: "Need personalised guidance or want to discuss multiple aspects of your fitness journey? A consultation gives you dedicated time to discuss your goals, challenges, and questions while receiving recommendations specific to your situation. Choose between online or in-person support.", packageIds: ["consult-inperson", "consult-online"] },
  { eyebrow: "Training Programme Review", title: "Get Your Training Programme Professionally Assessed", description: "Already have a workout programme but want to know if it is structured correctly? Receive feedback on your current programme with recommendations to help improve your results.", packageIds: ["programme-review"] },
  { eyebrow: "Exercise Technique Review", title: "Improve Your Exercise Technique", description: "Get professional feedback on your lifting technique through video review. Whether you want to fix a specific movement or have multiple exercises assessed, choose the option that fits your needs.", packageIds: ["technique-single", "technique-full"] },
] as const;

const BANK_DETAILS = [
  { label: "Account Name", value: "Alpha Lee Fitness" },
  { label: "Bank", value: "Commercial Bank" },
  { label: "Account Number", value: "0000000000" },
  { label: "Branch", value: "Colombo" },
];

const statusCopy: Record<PaymentStatus, { label: string; tone: string; text: string }> = {
  pending_verification: {
    label: "Pending verification",
    tone: "border-amber-200 bg-amber-50 text-amber-700",
    text: "Your payment slip is waiting for coach approval. Chat unlocks once it is verified.",
  },
  verified: {
    label: "Verified",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
    text: "Your Ask Alpha credits are active. Open the dashboard to ask your question.",
  },
  rejected: {
    label: "Needs attention",
    tone: "border-red-200 bg-red-50 text-red-700",
    text: "Your payment could not be verified. Please submit a clearer slip or contact Alpha Lee.",
  },
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    const message = String((error as { message?: unknown }).message || "").trim();
    if (message) return message;
  }
  return "Something went wrong. Please try again.";
}

export default function AskAlphaPage() {
  const router = useRouter();
  const { setPackage, selectedPackage } = useFunnelStore();
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedOfferId, setSelectedOfferId] = useState(ASK_ALPHA_OFFERS[0]?.id || "");
  const [paymentReference, setPaymentReference] = useState(createAskAlphaReference());
  const [latestOrder, setLatestOrder] = useState<LatestAskAlphaOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState("");
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipName, setSlipName] = useState("");

  const selectedOffer = useMemo(() => getAskAlphaOfferById(selectedOfferId) || ASK_ALPHA_OFFERS[0], [selectedOfferId]);

  const loadUserAndOrder = useCallback(async () => {
    setIsLoading(true);
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    setUserId(user?.id || null);

    if (user?.id) {
      setLatestOrder(await getLatestAskAlphaOrder(user.id));
    } else {
      setLatestOrder(null);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadUserAndOrder();
  }, [loadUserAndOrder]);

  const copyValue = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(""), 1400);
    } catch {
      setCopied("");
    }
  };

  const handleAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const firstName = String(formData.get("firstName") || "").trim();
    const lastName = String(formData.get("lastName") || "").trim();
    const phone = String(formData.get("phone") || "").trim();

    try {
      if (authMode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await loadUserAndOrder();
        setMessage("You are logged in. Choose your Ask Alpha option and upload your slip.");
        return;
      }

      if (!firstName || !lastName || !phone) {
        throw new Error("Please enter your name and phone number.");
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`,
            phone,
          },
        },
      });

      if (error) throw error;

      if (!data.session) {
        setAuthMode("login");
        setMessage("Account created. If email confirmation is enabled, confirm your email first, then log in here.");
        return;
      }

      await loadUserAndOrder();
      setMessage("Account created. Choose your Ask Alpha option and upload your slip.");
    } catch (authError) {
      setMessage(getErrorMessage(authError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitPayment = async () => {
    if (!userId) {
      setMessage("Please create an account or log in first.");
      return;
    }

    if (!selectedOffer) {
      setMessage("Please choose an Ask Alpha option.");
      return;
    }

    if (!slipFile) {
      setMessage("Please upload your payment slip before submitting.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const safeFileName = slipFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const slipPath = `${userId}/ask-alpha-${Date.now()}-${safeFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("payment-slips")
        .upload(slipPath, slipFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Payment slip upload failed: ${uploadError.message}`);
      }

      let submittedReference = paymentReference || createAskAlphaReference();
      let order: { id: string } | null = null;
      let orderErrorMessage = "";

      for (let attempt = 0; attempt < 3; attempt += 1) {
        if (attempt > 0) {
          submittedReference = createAskAlphaReference();
        }

        const { data, error } = await supabase
          .from("ask_alpha_orders")
          .insert({
            user_id: userId,
            product_id: selectedOffer.id,
            product_title: selectedOffer.title,
            question_credits: selectedOffer.questionCredits,
            amount_lkr: selectedOffer.priceLkr,
            method: "bank",
            reference: submittedReference,
            slip_file_name: slipFile.name,
            slip_storage_path: slipPath,
          })
          .select("id")
          .single();

        if (!error) {
          order = data;
          break;
        }

        orderErrorMessage = error.message;
        if (error.code !== "23505") break;
      }

      if (!order) {
        throw new Error(`Ask Alpha payment record failed: ${orderErrorMessage || "Unable to create order."}`);
      }

      setPaymentReference(createAskAlphaReference());
      setSlipFile(null);
      setSlipName("");
      await loadUserAndOrder();
      setMessage("Your Ask Alpha payment slip was submitted for verification.");
    } catch (submitError) {
      setMessage(getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserId(null);
    setLatestOrder(null);
  };

  const startServiceSignup = async (packageId: string) => {
    setPackage(packageId);
    const { data } = await supabase.auth.getSession();
    router.push(data.session ? "/signup/step-2" : "/signup/step-1");
  };

  return (
    <div className="min-h-screen bg-[#F9F8F4] px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mb-10 text-center"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-4 text-[12px] font-black uppercase tracking-[0.24em] text-[#FF0000]">Paid Q&A</div>
          <h1 className="font-outfit text-[clamp(2rem,8vw,4rem)] font-black uppercase leading-none tracking-tight text-gray-900">
            NEED <span className="text-[#FF0000]">EXPERT</span> ADVICE?
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-base font-semibold leading-relaxed text-gray-600 sm:text-lg">
            Have a specific question but don&apos;t need a full consultation? Purchase question credits and receive focused answers about training, nutrition, progress, and fitness.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {ASK_ALPHA_OFFERS.map((offer) => {
                const isSelected = selectedOfferId === offer.id;

                return (
                  <button
                    key={offer.id}
                    type="button"
                    onClick={() => setSelectedOfferId(offer.id)}
                    className={`rounded-3xl border-2 bg-white p-5 text-left transition-all ${
                      isSelected ? "border-[#FF0000] alpha-panel-shadow" : "border-gray-100 hover:border-gray-300"
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="rounded-full bg-[#FF0000]/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#FF0000]">
                        {offer.questionCredits} credit{offer.questionCredits > 1 ? "s" : ""}
                      </div>
                      {isSelected && <CheckCircle2 className="text-[#FF0000]" size={20} />}
                    </div>
                    <h2 className="font-outfit text-xl font-black tracking-tight text-gray-900">{offer.title}</h2>
                    <p className="mt-1 text-sm font-bold text-gray-500">{offer.subtitle}</p>
                    <div className="mt-4 text-2xl font-black text-gray-900">{formatAskAlphaPrice(offer.priceLkr)}</div>
                    <p className="mt-4 text-sm font-semibold leading-relaxed text-gray-600">{offer.description}</p>
                    <ul className="mt-5 space-y-2">
                      {offer.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm font-bold leading-relaxed text-gray-700">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#FF0000]" strokeWidth={4} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>

            <div className="rounded-3xl border border-[#FF0000]/15 bg-[#FF0000]/5 p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#FF0000]">
                  <AlertCircle size={22} />
                </div>
                <div>
                  <h2 className="font-outfit text-xl font-black tracking-tight text-gray-900">Ask Alpha is best for focused guidance</h2>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-gray-600">
                    Use it for training questions, nutrition clarification, exercise selection, progress troubleshooting, and general fitness guidance. Complete training programmes, full diet plans, medical advice, and ongoing coaching support are not included. Credits are valid for 30 days from purchase.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <aside className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            {isLoading ? (
              <div className="py-12 text-center text-sm font-black uppercase tracking-[0.18em] text-gray-400">Loading</div>
            ) : userId ? (
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[12px] font-black uppercase tracking-[0.2em] text-[#FF0000]">Payment</div>
                    <h2 className="mt-2 font-outfit text-3xl font-black tracking-tight text-gray-900">Submit your slip</h2>
                  </div>
                  <button type="button" onClick={signOut} className="text-sm font-black text-gray-400 transition-colors hover:text-[#FF0000]">
                    Sign out
                  </button>
                </div>

                {latestOrder && (
                  <div className={`rounded-2xl border p-4 ${statusCopy[latestOrder.status].tone}`}>
                    <div className="text-sm font-black uppercase tracking-[0.14em]">{statusCopy[latestOrder.status].label}</div>
                    <p className="mt-2 text-sm font-bold leading-relaxed">{statusCopy[latestOrder.status].text}</p>
                    <div className="mt-3 rounded-xl bg-white/70 p-3 text-sm font-black text-gray-900">
                      {latestOrder.product_title} | {latestOrder.reference}
                    </div>
                    {latestOrder.rejection_reason && (
                      <p className="mt-3 text-sm font-bold leading-relaxed">{latestOrder.rejection_reason}</p>
                    )}
                    <div className="mt-4 flex flex-wrap gap-3">
                      {latestOrder.status === "verified" && (
                        <Link
                          href="/dashboard"
                          className="inline-flex h-11 items-center justify-center rounded-full bg-gray-900 px-4 text-sm font-black text-white transition-colors hover:bg-[#FF0000]"
                        >
                          Open dashboard
                        </Link>
                      )}
                      <Button type="button" variant="secondary" onClick={loadUserAndOrder} className="h-11 gap-2 rounded-full px-4 text-sm">
                        <RefreshCw size={15} />
                        Refresh
                      </Button>
                    </div>
                  </div>
                )}

                <div className="rounded-2xl bg-[#F9F8F4] p-4">
                  <div className="mb-4 flex flex-col gap-3 border-b border-gray-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">Payment reference</div>
                      <div className="mt-1 break-all text-xl font-black text-gray-900">{paymentReference}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyValue(paymentReference, "reference")}
                      className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-black text-gray-700 shadow-sm transition-colors hover:text-[#FF0000]"
                    >
                      <Copy size={15} />
                      {copied === "reference" ? "Copied" : "Copy"}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {BANK_DETAILS.map((detail) => (
                      <div key={detail.label} className="flex items-center justify-between gap-4 rounded-2xl bg-white p-3">
                        <div className="min-w-0">
                          <div className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">{detail.label}</div>
                          <div className="break-all text-sm font-bold text-gray-900">{detail.value}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyValue(detail.value, detail.label)}
                          className="shrink-0 rounded-full border border-gray-200 px-3 py-2 text-xs font-black text-gray-500 transition-colors hover:border-[#FF0000] hover:text-[#FF0000]"
                        >
                          {copied === detail.label ? "Copied" : "Copy"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <label
                  className={`relative flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center transition-all ${
                    slipName ? "border-green-400 bg-green-50" : "border-gray-200 bg-white hover:border-[#FF0000] hover:bg-[#FF0000]/5"
                  }`}
                >
                  <Upload className={slipName ? "text-green-600" : "text-[#FF0000]"} size={32} />
                  <span className="mt-3 text-lg font-black text-gray-900">{slipName ? "Payment slip selected" : "Upload payment slip"}</span>
                  <span className="mt-1 max-w-full break-words text-sm font-semibold text-gray-500">{slipName || "PNG, JPG, or PDF"}</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,application/pdf"
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      setSlipFile(file || null);
                      setSlipName(file?.name || "");
                      setMessage("");
                    }}
                  />
                </label>

                {message && (
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm font-bold leading-relaxed text-gray-700">
                    {message}
                  </div>
                )}

                <Button type="button" size="lg" onClick={submitPayment} isLoading={isSubmitting} className="h-14 w-full rounded-full bg-gray-900 text-white hover:bg-[#FF0000]">
                  Submit for Verification
                </Button>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF0000]/10 text-[#FF0000]">
                    <Lock size={22} />
                  </div>
                  <h2 className="font-outfit text-3xl font-black tracking-tight text-gray-900">
                    {authMode === "signup" ? "Create your Q&A account" : "Log in to continue"}
                  </h2>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-gray-500">
                    Your paid questions and answers will live inside your client dashboard.
                  </p>
                </div>

                <div className="mb-5 grid grid-cols-2 rounded-full bg-[#F9F8F4] p-1">
                  <button
                    type="button"
                    onClick={() => setAuthMode("signup")}
                    className={`rounded-full px-4 py-2 text-sm font-black transition-colors ${authMode === "signup" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
                  >
                    Sign up
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode("login")}
                    className={`rounded-full px-4 py-2 text-sm font-black transition-colors ${authMode === "login" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
                  >
                    Log in
                  </button>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                  {authMode === "signup" && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input name="firstName" label="First Name" placeholder="John" />
                      <Input name="lastName" label="Last Name" placeholder="Doe" />
                    </div>
                  )}
                  <Input name="email" type="email" label="Email Address" placeholder="you@example.com" autoComplete="email" />
                  {authMode === "signup" && <Input name="phone" type="tel" label="WhatsApp / Phone" placeholder="+94 77 123 4567" />}
                  <div className="relative">
                    <Input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      label="Password"
                      placeholder="Minimum 8 characters"
                      autoComplete={authMode === "signup" ? "new-password" : "current-password"}
                      className="pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute bottom-4 right-4 text-gray-400 transition-colors hover:text-[#FF0000]"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {message && (
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm font-bold leading-relaxed text-gray-700">
                      {message}
                    </div>
                  )}

                  <Button type="submit" isLoading={isSubmitting} className="h-13 w-full rounded-full bg-gray-900 text-white hover:bg-[#FF0000]">
                    {authMode === "signup" ? "Create Account" : "Log In"}
                  </Button>
                </form>
              </div>
            )}
          </aside>
        </div>

        <div className="mt-16 space-y-16">
          {SERVICE_SECTIONS.map((section) => {
            const sectionPackages = section.packageIds.map((id) => PACKAGES.find((pkg) => pkg.id === id)).filter((pkg): pkg is (typeof PACKAGES)[number] => Boolean(pkg));
            return (
              <motion.section key={section.eyebrow} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <div className="mb-6 max-w-3xl">
                  <div className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-[#FF0000]">{section.eyebrow}</div>
                  <h2 className="font-outfit text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">{section.title}</h2>
                  <p className="mt-3 text-[15px] font-medium leading-7 text-gray-600 sm:text-base">{section.description}</p>
                </div>
                <div className={`grid gap-5 ${sectionPackages.length > 1 ? "lg:grid-cols-2" : "grid-cols-1"}`}>
                  {sectionPackages.map((pkg) => {
                    const isSelected = selectedPackage === pkg.id;
                    return (
                      <article key={pkg.id} className={`flex flex-col rounded-xl border bg-white p-6 transition-all sm:p-7 ${isSelected ? "border-[#FF0000] shadow-[8px_8px_0_#111827]" : "border-gray-200 hover:border-gray-300"}`}>
                        <button type="button" onClick={() => setPackage(pkg.id)} className="w-full text-left">
                          <div className="flex items-start justify-between gap-4">
                            <div><div className="text-sm font-bold text-gray-400">{pkg.subtitle}</div><h3 className="mt-1 font-outfit text-xl font-black tracking-tight text-gray-950 sm:text-2xl">{pkg.title}</h3></div>
                            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${isSelected ? "border-[#FF0000] text-[#FF0000]" : "border-gray-200 text-gray-300"}`}>{isSelected ? <Check size={17} strokeWidth={3} /> : <Circle size={10} />}</span>
                          </div>
                          <div className="mt-5 font-outfit text-3xl font-black text-gray-950">{pkg.price}</div>
                          <p className="mt-4 text-[15px] font-medium leading-7 text-gray-600">{pkg.detailSubtitle}</p>
                        </button>
                        {pkg.suitableFor && <div className="mt-6"><div className="text-xs font-black uppercase tracking-[0.08em] text-gray-400">Suitable For</div><ul className="mt-3 space-y-2">{pkg.suitableFor.map((item) => <li key={item} className="flex items-start gap-3 text-[15px] font-medium leading-6 text-gray-600"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#FF0000]" />{item}</li>)}</ul></div>}
                        <div className="mt-6"><div className="text-xs font-black uppercase tracking-[0.08em] text-gray-400">Includes</div><ul className={`mt-3 grid gap-x-8 gap-y-3 ${sectionPackages.length === 1 ? "sm:grid-cols-2" : "grid-cols-1"}`}>{pkg.features.map((feature) => <li key={feature} className="flex items-start gap-3 text-[15px] font-bold leading-6 text-gray-900"><Check className="mt-1 h-4 w-4 shrink-0 text-[#FF0000]" strokeWidth={3} />{feature}</li>)}</ul></div>
                        {pkg.footnote && <p className="mt-6 text-sm italic leading-6 text-gray-400">{pkg.footnote}</p>}
                        <button type="button" onClick={() => startServiceSignup(pkg.id)} className="mt-7 inline-flex h-12 items-center justify-center rounded-full bg-gray-950 px-6 text-sm font-black uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#FF0000]">Select Service</button>
                      </article>
                    );
                  })}
                </div>
              </motion.section>
            );
          })}
        </div>

        <section className="mt-10 rounded-3xl bg-black p-6 text-white sm:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#FF0000]">
                <MessageCircle size={24} />
              </div>
              <div>
                <h2 className="font-outfit text-2xl font-black tracking-tight">Already verified?</h2>
                <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-white/70">
                  Open your dashboard to submit your question, see replies, and continue the thread.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-black uppercase tracking-[0.08em] text-gray-900 transition-colors hover:bg-[#FF0000] hover:text-white"
            >
              Open Dashboard
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
