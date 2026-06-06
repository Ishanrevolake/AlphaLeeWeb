"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, LogOut, MessageCircle, RefreshCw, Send, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatAskAlphaPrice } from "@/lib/askAlpha";
import { supabase } from "@/lib/supabase";

type AccessState = "checking" | "login" | "denied" | "ready";
type StaffRole = "coach" | "admin";

type AskAlphaThread = {
  id: string;
  order_id: string;
  user_id: string;
  subject: string;
  status: "open" | "answered" | "closed";
  created_at: string;
  updated_at: string;
};

type AskAlphaMessage = {
  id: string;
  thread_id: string;
  sender_id: string | null;
  sender_role: "client" | "coach" | "admin";
  body: string;
  created_at: string;
};

type AskAlphaOrder = {
  id: string;
  product_title: string;
  question_credits: number;
  amount_lkr: number;
  reference: string;
};

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
};

type HydratedThread = AskAlphaThread & {
  profile: Profile | null;
  order: AskAlphaOrder | null;
  messages: AskAlphaMessage[];
};

const threadStatusTone: Record<AskAlphaThread["status"], string> = {
  open: "bg-amber-50 text-amber-700 ring-amber-200",
  answered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  closed: "bg-gray-100 text-gray-600 ring-gray-200",
};

export default function CoachAskAlphaPage() {
  const [accessState, setAccessState] = useState<AccessState>("checking");
  const [threads, setThreads] = useState<HydratedThread[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [staffUserId, setStaffUserId] = useState("");
  const [staffRole, setStaffRole] = useState<StaffRole>("coach");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [activeThreadId, setActiveThreadId] = useState("");

  const loadThreads = async () => {
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

    const role = String(profile?.role || "");

    if (profileError || !["coach", "admin"].includes(role)) {
      setAccessState("denied");
      setIsLoading(false);
      return;
    }

    setStaffUserId(user.id);
    setStaffRole(role as StaffRole);

    const { data: threadData, error: threadError } = await supabase
      .from("ask_alpha_threads")
      .select("id, order_id, user_id, subject, status, created_at, updated_at")
      .order("updated_at", { ascending: false });

    if (threadError) {
      setMessage(threadError.message);
      setAccessState("ready");
      setIsLoading(false);
      return;
    }

    const baseThreads = (threadData || []) as AskAlphaThread[];
    const threadIds = baseThreads.map((thread) => thread.id);
    const orderIds = Array.from(new Set(baseThreads.map((thread) => thread.order_id).filter(Boolean)));
    const userIds = Array.from(new Set(baseThreads.map((thread) => thread.user_id).filter(Boolean)));

    const [profileResult, orderResult, messageResult] = await Promise.all([
      userIds.length
        ? supabase.from("profiles").select("id, full_name, email, phone").in("id", userIds)
        : Promise.resolve({ data: [], error: null }),
      orderIds.length
        ? supabase.from("ask_alpha_orders").select("id, product_title, question_credits, amount_lkr, reference").in("id", orderIds)
        : Promise.resolve({ data: [], error: null }),
      threadIds.length
        ? supabase.from("ask_alpha_messages").select("id, thread_id, sender_id, sender_role, body, created_at").in("thread_id", threadIds).order("created_at", { ascending: true })
        : Promise.resolve({ data: [], error: null }),
    ]);

    const profiles = ((profileResult.data || []) as Profile[]).reduce<Record<string, Profile>>((map, item) => {
      map[item.id] = item;
      return map;
    }, {});

    const orders = ((orderResult.data || []) as AskAlphaOrder[]).reduce<Record<string, AskAlphaOrder>>((map, item) => {
      map[item.id] = item;
      return map;
    }, {});

    const messages = ((messageResult.data || []) as AskAlphaMessage[]).reduce<Record<string, AskAlphaMessage[]>>((map, item) => {
      map[item.thread_id] = [...(map[item.thread_id] || []), item];
      return map;
    }, {});

    setThreads(
      baseThreads.map((thread) => ({
        ...thread,
        profile: profiles[thread.user_id] || null,
        order: orders[thread.order_id] || null,
        messages: messages[thread.id] || [],
      })),
    );
    setAccessState("ready");
    setIsLoading(false);
  };

  useEffect(() => {
    loadThreads();
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

    await loadThreads();
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setThreads([]);
    setAccessState("login");
  };

  const submitReply = async (threadId: string) => {
    const body = (replyDrafts[threadId] || "").trim();

    if (!body || !staffUserId) return;

    setActiveThreadId(threadId);
    setMessage("");

    const { error: messageError } = await supabase.from("ask_alpha_messages").insert({
      thread_id: threadId,
      sender_id: staffUserId,
      sender_role: staffRole,
      body,
    });

    if (messageError) {
      setMessage(messageError.message);
      setActiveThreadId("");
      return;
    }

    const { error: updateError } = await supabase
      .from("ask_alpha_threads")
      .update({ status: "answered" })
      .eq("id", threadId);

    if (updateError) {
      setMessage(updateError.message);
      setActiveThreadId("");
      return;
    }

    setReplyDrafts((drafts) => ({ ...drafts, [threadId]: "" }));
    await loadThreads();
    setActiveThreadId("");
  };

  const updateThreadStatus = async (threadId: string, status: AskAlphaThread["status"]) => {
    setActiveThreadId(threadId);
    setMessage("");

    const { error } = await supabase.from("ask_alpha_threads").update({ status }).eq("id", threadId);

    if (error) {
      setMessage(error.message);
      setActiveThreadId("");
      return;
    }

    await loadThreads();
    setActiveThreadId("");
  };

  if (accessState === "checking") {
    return (
      <div className="flex min-h-[calc(100svh-64px)] items-center justify-center px-4">
        <div className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Loading Ask Alpha inbox</div>
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
              Use a coach or admin account to reply to Ask Alpha questions.
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
            <div className="mb-3 text-[12px] font-black uppercase tracking-[0.2em] text-[#FF0000]">Coach inbox</div>
            <h1 className="font-outfit text-3xl font-black tracking-tight text-gray-900 sm:text-5xl">Ask Alpha Messages</h1>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-relaxed text-gray-600 sm:text-base">
              Read paid client questions, reply inside the thread, and close threads when they are complete.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/coach/payments"
              className="inline-flex h-12 items-center justify-center rounded-full border-2 border-gray-900 bg-white px-5 text-sm font-black uppercase tracking-[0.08em] text-gray-900 alpha-black-block-shadow transition-colors hover:bg-gray-50"
            >
              Payments
            </Link>
            <Button type="button" variant="secondary" onClick={loadThreads} isLoading={isLoading} className="h-12 gap-2 rounded-full px-5">
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

        <div className="space-y-5">
          {threads.length ? (
            threads.map((thread) => (
              <article key={thread.id} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="font-outfit text-2xl font-black tracking-tight text-gray-900">{thread.subject}</h2>
                      <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] ring-1 ${threadStatusTone[thread.status]}`}>
                        {thread.status}
                      </span>
                    </div>
                    <div className="mt-2 text-sm font-semibold text-gray-500">
                      {thread.profile?.full_name || "Client"} | {thread.profile?.email || "No email"} | {thread.profile?.phone || "No phone"}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs font-black uppercase tracking-[0.12em] text-gray-400">
                      <span>{thread.order?.product_title || "Ask Alpha"}</span>
                      <span>{thread.order?.reference || "No reference"}</span>
                      {thread.order && <span>{formatAskAlphaPrice(thread.order.amount_lkr)}</span>}
                      <span>Updated {new Date(thread.updated_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => updateThreadStatus(thread.id, thread.status === "closed" ? "open" : "closed")}
                      isLoading={activeThreadId === thread.id}
                      className="h-11 rounded-full px-4 text-sm"
                    >
                      {thread.status === "closed" ? "Reopen" : "Close"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 rounded-3xl bg-[#F9F8F4] p-4">
                  {thread.messages.map((item) => {
                    const isStaff = item.sender_role === "coach" || item.sender_role === "admin";

                    return (
                      <div key={item.id} className={`flex ${isStaff ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[88%] rounded-2xl p-4 text-sm font-semibold leading-relaxed ${
                          isStaff ? "bg-gray-900 text-white" : "bg-white text-gray-700"
                        }`}>
                          <div className={`mb-2 text-[11px] font-black uppercase tracking-[0.12em] ${isStaff ? "text-white/50" : "text-[#FF0000]"}`}>
                            {isStaff ? "Coach" : thread.profile?.full_name || "Client"}
                          </div>
                          <p className="whitespace-pre-wrap">{item.body}</p>
                          <div className={`mt-2 text-[11px] font-bold ${isStaff ? "text-white/45" : "text-gray-400"}`}>
                            {new Date(item.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {thread.status !== "closed" && (
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <textarea
                      value={replyDrafts[thread.id] || ""}
                      onChange={(event) => setReplyDrafts((drafts) => ({ ...drafts, [thread.id]: event.target.value }))}
                      rows={3}
                      placeholder="Write your answer..."
                      className="min-h-14 flex-1 resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold leading-relaxed text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-[#FF0000]"
                    />
                    <Button
                      type="button"
                      onClick={() => submitReply(thread.id)}
                      isLoading={activeThreadId === thread.id}
                      className="h-12 gap-2 rounded-full bg-gray-900 px-5 text-white hover:bg-[#FF0000]"
                    >
                      <Send size={16} />
                      Send reply
                    </Button>
                  </div>
                )}
              </article>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-8 text-center shadow-sm">
              <MessageCircle className="mx-auto text-[#FF0000]" size={34} />
              <div className="mt-4 font-black text-gray-900">No Ask Alpha questions yet</div>
              <p className="mx-auto mt-2 max-w-sm text-sm font-semibold leading-relaxed text-gray-500">
                Verified clients can submit questions from their client dashboard.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
