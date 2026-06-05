"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, ExternalLink, Eye, EyeOff, Lock, LogOut, RefreshCw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { supabase } from "@/lib/supabase";

type PaymentStatus = "pending_verification" | "verified" | "rejected";

type PaymentRecord = {
  id: string;
  reference: string;
  amount_lkr: number;
  status: PaymentStatus;
  submitted_at: string;
  verified_at: string | null;
  rejection_reason: string | null;
  slip_file_name: string | null;
  slip_storage_path: string | null;
  profiles:
    | {
        full_name: string | null;
        email: string | null;
        phone: string | null;
      }
    | Array<{
        full_name: string | null;
        email: string | null;
        phone: string | null;
      }>
    | null;
  package_selections:
    | {
        package_title: string | null;
        package_subtitle: string | null;
        total_price_lkr: number | null;
      }
    | Array<{
        package_title: string | null;
        package_subtitle: string | null;
        total_price_lkr: number | null;
      }>
    | null;
  signedSlipUrl?: string;
};

type AccessState = "checking" | "login" | "denied" | "ready";

const statusStyles: Record<PaymentStatus, string> = {
  pending_verification: "bg-amber-50 text-amber-700 ring-amber-200",
  verified: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  rejected: "bg-red-50 text-red-700 ring-red-200",
};

const statusLabels: Record<PaymentStatus, string> = {
  pending_verification: "Pending",
  verified: "Verified",
  rejected: "Rejected",
};

export default function CoachPaymentsPage() {
  const [accessState, setAccessState] = useState<AccessState>("checking");
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activePaymentId, setActivePaymentId] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const loadPayments = async () => {
    setIsLoading(true);
    setMessage("");

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      setAccessState("login");
      setIsLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile || !["coach", "admin"].includes(String(profile.role))) {
      setAccessState("denied");
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("payments")
      .select(
        `
        id,
        reference,
        amount_lkr,
        status,
        submitted_at,
        verified_at,
        rejection_reason,
        slip_file_name,
        slip_storage_path,
        profiles:user_id (
          full_name,
          email,
          phone
        ),
        package_selections:package_selection_id (
          package_title,
          package_subtitle,
          total_price_lkr
        )
      `,
      )
      .order("submitted_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      setAccessState("ready");
      setIsLoading(false);
      return;
    }

    const records = (data || []) as PaymentRecord[];
    const withSlipUrls = await Promise.all(
      records.map(async (payment) => {
        if (!payment.slip_storage_path) return payment;

        const { data: signedSlip } = await supabase.storage
          .from("payment-slips")
          .createSignedUrl(payment.slip_storage_path, 60 * 15);

        return {
          ...payment,
          signedSlipUrl: signedSlip?.signedUrl,
        };
      }),
    );

    setPayments(withSlipUrls);
    setAccessState("ready");
    setIsLoading(false);
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage(error.message);
      setIsLoading(false);
      return;
    }

    await loadPayments();
  };

  const updatePaymentStatus = async (paymentId: string, status: PaymentStatus, rejectionReason?: string) => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      setAccessState("login");
      return;
    }

    setActivePaymentId(paymentId);
    setMessage("");

    const patch =
      status === "verified"
        ? {
            status,
            verified_at: new Date().toISOString(),
            verified_by: user.id,
            rejection_reason: null,
          }
        : {
            status,
            verified_at: null,
            verified_by: null,
            rejection_reason: rejectionReason || "Payment could not be verified.",
          };

    const { error } = await supabase.from("payments").update(patch).eq("id", paymentId);

    if (error) {
      setMessage(error.message);
      setActivePaymentId("");
      return;
    }

    await loadPayments();
    setActivePaymentId("");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setPayments([]);
    setAccessState("login");
  };

  if (accessState === "checking") {
    return (
      <div className="flex min-h-[calc(100svh-64px)] items-center justify-center px-4">
        <div className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Loading payments</div>
      </div>
    );
  }

  if (accessState === "login") {
    return (
      <div className="flex min-h-[calc(100svh-64px)] items-center justify-center px-4 py-10">
        <motion.div
          className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="mb-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF0000]/10 text-[#FF0000]">
              <Lock size={22} />
            </div>
            <h1 className="font-outfit text-3xl font-black tracking-tight text-gray-900">Coach Login</h1>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-gray-500">
              Use a coach or admin account to review submitted payment slips.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input name="email" type="email" label="Email Address" placeholder="coach@example.com" autoComplete="email" />
            <div className="relative">
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                label="Password"
                placeholder="Enter password"
                autoComplete="current-password"
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
            {message && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-600">{message}</div>}
            <Button type="submit" isLoading={isLoading} className="h-13 w-full bg-gray-900 text-white hover:bg-[#FF0000]">
              Login
            </Button>
          </form>
        </motion.div>
      </div>
    );
  }

  if (accessState === "denied") {
    return (
      <div className="flex min-h-[calc(100svh-64px)] items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg rounded-3xl border border-gray-100 bg-white p-6 text-center shadow-sm sm:p-8">
          <XCircle className="mx-auto text-[#FF0000]" size={34} />
          <h1 className="mt-4 font-outfit text-3xl font-black tracking-tight text-gray-900">Coach access required</h1>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-gray-500">
            Your account needs the `coach` or `admin` role in the profiles table.
          </p>
          <Button type="button" variant="secondary" onClick={signOut} className="mt-6 h-12 rounded-full px-5">
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F8F4] px-4 py-8 sm:px-6 sm:py-10">
      <motion.div
        className="mx-auto w-full max-w-6xl"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 text-[12px] font-black uppercase tracking-[0.2em] text-[#FF0000]">Coach payments</div>
            <h1 className="font-outfit text-3xl font-black tracking-tight text-gray-900 sm:text-5xl">Payment Verification</h1>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-relaxed text-gray-600 sm:text-base">
              Verified payments unlock the client dashboard automatically.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="secondary" onClick={loadPayments} isLoading={isLoading} className="h-12 gap-2 rounded-full px-5">
              <RefreshCw size={16} />
              Refresh
            </Button>
            <Button type="button" variant="secondary" onClick={signOut} className="h-12 gap-2 rounded-full px-5">
              <LogOut size={16} />
              Sign out
            </Button>
          </div>
        </div>

        {message && <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-600">{message}</div>}

        <div className="space-y-4">
          {payments.length ? (
            payments.map((payment) => {
              const profile = Array.isArray(payment.profiles) ? payment.profiles[0] : payment.profiles;
              const packageSelection = Array.isArray(payment.package_selections)
                ? payment.package_selections[0]
                : payment.package_selections;

              return (
                <article key={payment.id} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="font-outfit text-2xl font-black tracking-tight text-gray-900">
                          {profile?.full_name || "Client"}
                        </h2>
                        <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] ring-1 ${statusStyles[payment.status]}`}>
                          {statusLabels[payment.status]}
                        </span>
                      </div>
                      <div className="mt-2 break-words text-sm font-semibold text-gray-500">
                        {profile?.email || "No email"} | {profile?.phone || "No phone"}
                      </div>
                      <div className="mt-4 grid gap-3 text-sm font-bold text-gray-700 sm:grid-cols-2 lg:grid-cols-4">
                        <Info label="Reference" value={payment.reference} />
                        <Info label="Amount" value={`Rs. ${Number(payment.amount_lkr || 0).toLocaleString("en-US")}`} />
                        <Info label="Package" value={packageSelection?.package_title || "Not selected"} />
                        <Info label="Submitted" value={new Date(payment.submitted_at).toLocaleString()} />
                      </div>
                      {payment.rejection_reason && (
                        <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-3 text-sm font-bold text-red-700">
                          {payment.rejection_reason}
                        </div>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:flex-wrap lg:justify-end">
                      {payment.signedSlipUrl ? (
                        <Link
                          href={payment.signedSlipUrl}
                          target="_blank"
                          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-5 text-sm font-black text-gray-700 shadow-sm transition-colors hover:text-[#FF0000] sm:w-auto"
                        >
                          <ExternalLink size={16} />
                          Open slip
                        </Link>
                      ) : (
                        <span className="inline-flex h-12 w-full items-center justify-center rounded-full border border-gray-200 bg-gray-50 px-5 text-sm font-black text-gray-400 sm:w-auto">
                          No slip
                        </span>
                      )}
                      <Button
                        type="button"
                        onClick={() => updatePaymentStatus(payment.id, "verified")}
                        isLoading={activePaymentId === payment.id}
                        disabled={payment.status === "verified"}
                        className="h-12 w-full gap-2 rounded-full bg-emerald-600 px-5 text-white shadow-none hover:bg-emerald-700 sm:w-auto"
                      >
                        <CheckCircle2 size={16} />
                        Verify
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          const reason = window.prompt("Reason for rejection?", "Payment slip could not be verified.");
                          if (reason !== null) {
                            updatePaymentStatus(payment.id, "rejected", reason);
                          }
                        }}
                        disabled={payment.status === "rejected"}
                        className="h-12 w-full gap-2 rounded-full px-5 text-red-600 sm:w-auto"
                      >
                        <XCircle size={16} />
                        Reject
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-8 text-center shadow-sm">
              <div className="font-black text-gray-900">No payment submissions yet</div>
              <p className="mx-auto mt-2 max-w-sm text-sm font-semibold leading-relaxed text-gray-500">
                New bank-transfer submissions will appear here.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#F9F8F4] p-3">
      <div className="text-[11px] font-black uppercase tracking-[0.14em] text-gray-400">{label}</div>
      <div className="mt-1 truncate text-gray-900">{value}</div>
    </div>
  );
}
