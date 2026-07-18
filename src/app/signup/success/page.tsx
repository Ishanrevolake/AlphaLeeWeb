"use client";

import React, { useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, CheckCircle2, Clock3, MessageCircle, RefreshCw } from "lucide-react";
import { useFunnelStore } from "@/store/funnelStore";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import {
  getLatestAskAlphaOrder,
  getLatestPayment,
  type LatestAskAlphaOrder,
  type LatestPayment,
  type PaymentStatus,
} from "@/lib/clientAccess";

const statusContent: Record<
  PaymentStatus,
  {
    eyebrow: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    tone: string;
  }
> = {
  pending_verification: {
    eyebrow: "Pending verification",
    title: "Your payment slips are being reviewed",
    description: "We have your submitted slip details. Alpha Lee will review each payment and update the status here.",
    icon: <Clock3 size={48} strokeWidth={2} />,
    tone: "border-amber-200 bg-amber-50 text-amber-600",
  },
  verified: {
    eyebrow: "Payment verified",
    title: "You are cleared to continue",
    description: "Your verified purchases are now available from your dashboard.",
    icon: <CheckCircle2 size={48} strokeWidth={2} />,
    tone: "border-emerald-200 bg-emerald-50 text-emerald-600",
  },
  rejected: {
    eyebrow: "Verification needs attention",
    title: "A payment needs attention",
    description: "Please check the notes below and submit a clearer slip where needed, or contact Alpha Lee for help.",
    icon: <AlertCircle size={48} strokeWidth={2} />,
    tone: "border-red-200 bg-red-50 text-red-600",
  },
};

type StatusItem = {
  id: string;
  title: string;
  subtitle: string;
  reference: string;
  amountLkr: number;
  status: PaymentStatus;
  slipName: string | null;
  submittedAt: string | null;
  verifiedAt: string | null;
  rejectionReason: string | null;
};

function getPageStatus(items: StatusItem[]): PaymentStatus {
  if (items.some((item) => item.status === "pending_verification")) {
    return "pending_verification";
  }

  if (items.some((item) => item.status === "rejected")) {
    return "rejected";
  }

  return "verified";
}

function formatStatus(status: PaymentStatus) {
  return status.replace("_", " ");
}

function formatLkr(amount: number) {
  return `Rs. ${Number(amount || 0).toLocaleString("en-US")}`;
}

export default function SuccessPage() {
  const router = useRouter();
  const { firstName, paymentReference, paymentSlipName } = useFunnelStore();
  const [mounted, setMounted] = React.useState(false);
  const [payment, setPayment] = React.useState<LatestPayment | null>(null);
  const [askAlphaOrder, setAskAlphaOrder] = React.useState<LatestAskAlphaOrder | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const loadStatuses = useCallback(async () => {
    setIsLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      router.replace("/signup/step-1");
      return;
    }

    const [latestPayment, latestAskAlphaOrder] = await Promise.all([
      getLatestPayment(user.id),
      getLatestAskAlphaOrder(user.id),
    ]);

    setPayment(latestPayment);
    setAskAlphaOrder(latestAskAlphaOrder);
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    setMounted(true);
    loadStatuses();
  }, [loadStatuses]);

  if (!mounted) return null;

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100svh-64px)] items-center justify-center px-4">
        <div className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Loading payment status</div>
      </div>
    );
  }

  const statusItems: StatusItem[] = [
    payment
      ? {
          id: payment.id,
          title: "Programme Payment",
          subtitle: "Online coaching package",
          reference: payment.reference || paymentReference || "ALF-PENDING",
          amountLkr: payment.amount_lkr,
          status: payment.status,
          slipName: payment.slip_file_name || paymentSlipName,
          submittedAt: payment.submitted_at,
          verifiedAt: payment.verified_at,
          rejectionReason: payment.rejection_reason,
        }
      : null,
    askAlphaOrder
      ? {
          id: askAlphaOrder.id,
          title: "Ask Alpha Payment",
          subtitle: askAlphaOrder.product_title,
          reference: askAlphaOrder.reference,
          amountLkr: askAlphaOrder.amount_lkr,
          status: askAlphaOrder.status,
          slipName: askAlphaOrder.slip_file_name,
          submittedAt: askAlphaOrder.submitted_at,
          verifiedAt: askAlphaOrder.verified_at,
          rejectionReason: askAlphaOrder.rejection_reason,
        }
      : null,
  ].filter(Boolean) as StatusItem[];

  const pageStatus = statusItems.length ? getPageStatus(statusItems) : "pending_verification";
  const content = statusContent[pageStatus];
  const hasVerifiedStatus = statusItems.some((item) => item.status === "verified");

  return (
    <div className="min-h-screen bg-white px-4 py-10 sm:px-6 sm:py-12">
      <motion.div
        className="mx-auto max-w-3xl text-center"
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        <div className="mb-6 flex justify-center">
          <motion.div
            className={`flex h-24 w-24 items-center justify-center rounded-full border ${content.tone}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            {content.icon}
          </motion.div>
        </div>

        <div className="mb-4 text-[12px] font-black uppercase tracking-[0.22em] text-[#FF0000]">{content.eyebrow}</div>
        <h1 className="mb-6 font-outfit text-3xl font-black tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
          {content.title}
        </h1>

        <p className="mx-auto mb-8 max-w-2xl text-lg font-medium leading-relaxed text-gray-600 sm:mb-10 sm:text-xl">
          Thanks, {firstName || "future athlete"}. {content.description}
        </p>

        {statusItems.length ? (
          <div className="mx-auto mb-10 grid gap-4 text-left">
            {statusItems.map((item) => (
              <PaymentStatusCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="mx-auto mb-10 rounded-3xl border border-dashed border-gray-200 bg-[#F9F8F4] p-6 text-center">
            <div className="font-black text-gray-900">No payment submissions found</div>
            <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-relaxed text-gray-500">
              If you uploaded a slip from another browser or account, make sure you log in with the same email address used during submission.
            </p>
          </div>
        )}

        <div className="mb-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {hasVerifiedStatus && (
            <Link
              href="/dashboard"
              className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 px-7 text-base font-black text-white shadow-xl shadow-gray-900/10 transition-colors hover:bg-[#FF0000] sm:w-auto"
            >
              Open dashboard
              <ArrowRight size={18} />
            </Link>
          )}
          <Button type="button" variant="secondary" onClick={loadStatuses} isLoading={isLoading} className="h-12 w-full gap-2 rounded-full px-5 sm:w-auto">
            <RefreshCw size={16} />
            Refresh status
          </Button>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-6 sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
            <MessageCircle className="text-[#FF0000]" size={32} />
            <div>
              <h3 className="text-xl font-bold text-gray-900">Need expert advice?</h3>
              <p className="mt-1 text-sm font-semibold leading-relaxed text-gray-600">
                Whether it&apos;s training, nutrition, or technique, ask Alpha and receive personalized guidance tailored to your goals.
              </p>
            </div>
          </div>
          <Button variant="outline" type="button" onClick={() => router.push("/ask-alpha")} className="shrink-0">
            Ask Alpha
          </Button>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm font-black text-gray-500">
          <Link href="/packages" className="transition-colors hover:text-[#FF0000]">
            Back to programmes
          </Link>
          <Link href="/ask-alpha" className="transition-colors hover:text-[#FF0000]">
            Back to Ask Alpha
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

function PaymentStatusCard({ item }: { item: StatusItem }) {
  const status = statusContent[item.status];

  return (
    <article className="rounded-3xl border border-gray-100 bg-[#F9F8F4] p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-outfit text-2xl font-black tracking-tight text-gray-900">{item.title}</h2>
          <p className="mt-1 text-sm font-bold text-gray-500">{item.subtitle}</p>
        </div>
        <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] ${status.tone}`}>
          {formatStatus(item.status)}
        </span>
      </div>

      <div className="grid gap-3">
        <StatusRow label="Reference" value={item.reference} />
        <StatusRow label="Amount" value={formatLkr(item.amountLkr)} />
        <StatusRow label="Method" value="Bank transfer" />
        {item.slipName && <StatusRow label="Slip" value={item.slipName} />}
        {item.submittedAt && <StatusRow label="Submitted" value={new Date(item.submittedAt).toLocaleString()} />}
        {item.verifiedAt && <StatusRow label="Verified" value={new Date(item.verifiedAt).toLocaleString()} />}
        {item.rejectionReason && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold leading-relaxed text-red-700">
            {item.rejectionReason}
          </div>
        )}
      </div>
    </article>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <span className="text-[12px] font-black uppercase tracking-[0.16em] text-gray-400">{label}</span>
      <span className="min-w-0 max-w-full break-words font-black text-gray-900 sm:max-w-[58%] sm:text-right">{value}</span>
    </div>
  );
}
