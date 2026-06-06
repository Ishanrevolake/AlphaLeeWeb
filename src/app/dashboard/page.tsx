"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CalendarDays, CheckCircle2, ClipboardList, Dumbbell, LogOut, MessageCircle, Send, Utensils } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { formatAskAlphaPrice } from "@/lib/askAlpha";
import { hasVerifiedAskAlphaOrder, hasVerifiedPayment, type PaymentStatus } from "@/lib/clientAccess";

type Profile = {
  full_name: string | null;
  first_name: string | null;
  email: string | null;
};

type ClientTask = {
  id: string;
  title: string;
  description: string | null;
  due_on: string | null;
  status: "todo" | "in_progress" | "done";
};

type MealPlanItem = {
  id: string;
  day_label: string | null;
  meal_label: string;
  food_items: string;
  calories: number | null;
  protein_g: number | null;
  notes: string | null;
  sort_order: number;
};

type MealPlan = {
  id: string;
  title: string;
  notes: string | null;
  starts_on: string | null;
  ends_on: string | null;
  meal_plan_items: MealPlanItem[];
};

type ExercisePlanItem = {
  id: string;
  day_label: string | null;
  exercise_name: string;
  sets: string | null;
  reps: string | null;
  notes: string | null;
  sort_order: number;
};

type ExercisePlan = {
  id: string;
  title: string;
  notes: string | null;
  exercise_plan_items: ExercisePlanItem[];
};

type AskAlphaOrder = {
  id: string;
  product_title: string;
  question_credits: number;
  amount_lkr: number;
  reference: string;
  status: PaymentStatus;
  submitted_at: string;
  verified_at: string | null;
  rejection_reason: string | null;
};

type AskAlphaThread = {
  id: string;
  order_id: string;
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

type HydratedAskAlphaThread = AskAlphaThread & {
  messages: AskAlphaMessage[];
};

const statusLabel: Record<ClientTask["status"], string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

const askAlphaStatusLabel: Record<PaymentStatus, string> = {
  pending_verification: "Pending",
  verified: "Verified",
  rejected: "Rejected",
};

export default function DashboardPage() {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [hasProgrammeAccess, setHasProgrammeAccess] = useState(false);
  const [tasks, setTasks] = useState<ClientTask[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [exercisePlans, setExercisePlans] = useState<ExercisePlan[]>([]);
  const [askAlphaOrders, setAskAlphaOrders] = useState<AskAlphaOrder[]>([]);
  const [askAlphaThreads, setAskAlphaThreads] = useState<HydratedAskAlphaThread[]>([]);
  const [newQuestionSubject, setNewQuestionSubject] = useState("");
  const [newQuestionBody, setNewQuestionBody] = useState("");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [askAlphaMessage, setAskAlphaMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingQuestion, setIsSendingQuestion] = useState(false);
  const [activeReplyThreadId, setActiveReplyThreadId] = useState("");

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      router.replace("/signup/step-1");
      return;
    }

    setCurrentUserId(user.id);

    const [programmeAccess, askAlphaAccess] = await Promise.all([
      hasVerifiedPayment(user.id),
      hasVerifiedAskAlphaOrder(user.id),
    ]);

    if (!programmeAccess && !askAlphaAccess) {
      router.replace("/packages");
      return;
    }

    setHasProgrammeAccess(programmeAccess);

    const profileResult = await supabase
      .from("profiles")
      .select("full_name, first_name, email")
      .eq("id", user.id)
      .maybeSingle();

    setProfile(profileResult.data || { full_name: null, first_name: null, email: user.email || null });

    const askOrderResult = await supabase
      .from("ask_alpha_orders")
      .select("id, product_title, question_credits, amount_lkr, reference, status, submitted_at, verified_at, rejection_reason")
      .eq("user_id", user.id)
      .order("submitted_at", { ascending: false });

    const orders = askOrderResult.error ? [] : ((askOrderResult.data || []) as AskAlphaOrder[]);
    setAskAlphaOrders(orders);

    const threadResult = await supabase
      .from("ask_alpha_threads")
      .select("id, order_id, subject, status, created_at, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    const threads = threadResult.error ? [] : ((threadResult.data || []) as AskAlphaThread[]);
    const threadIds = threads.map((thread) => thread.id);
    const messageResult = threadIds.length
      ? await supabase
          .from("ask_alpha_messages")
          .select("id, thread_id, sender_id, sender_role, body, created_at")
          .in("thread_id", threadIds)
          .order("created_at", { ascending: true })
      : { data: [], error: null };

    const messages = messageResult.error ? [] : ((messageResult.data || []) as AskAlphaMessage[]);
    const messagesByThread = messages.reduce<Record<string, AskAlphaMessage[]>>((grouped, message) => {
      grouped[message.thread_id] = [...(grouped[message.thread_id] || []), message];
      return grouped;
    }, {});

    setAskAlphaThreads(
      threads.map((thread) => ({
        ...thread,
        messages: messagesByThread[thread.id] || [],
      })),
    );

    if (programmeAccess) {
      const [taskResult, mealResult, exerciseResult] = await Promise.all([
        supabase
          .from("client_tasks")
          .select("id, title, description, due_on, status")
          .eq("client_id", user.id)
          .order("due_on", { ascending: true, nullsFirst: false }),
        supabase
          .from("meal_plans")
          .select("id, title, notes, starts_on, ends_on, meal_plan_items(id, day_label, meal_label, food_items, calories, protein_g, notes, sort_order)")
          .eq("client_id", user.id)
          .eq("is_active", true)
          .order("created_at", { ascending: false }),
        supabase
          .from("exercise_plans")
          .select("id, title, notes, exercise_plan_items(id, day_label, exercise_name, sets, reps, notes, sort_order)")
          .eq("client_id", user.id)
          .eq("is_active", true)
          .order("created_at", { ascending: false }),
      ]);

      setTasks((taskResult.data || []) as ClientTask[]);
      setMealPlans((mealResult.data || []) as MealPlan[]);
      setExercisePlans((exerciseResult.data || []) as ExercisePlan[]);
    } else {
      setTasks([]);
      setMealPlans([]);
      setExercisePlans([]);
    }

    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const verifiedAskAlphaOrders = askAlphaOrders.filter((order) => order.status === "verified");
  const totalAskAlphaCredits = verifiedAskAlphaOrders.reduce((total, order) => total + Number(order.question_credits || 0), 0);
  const usedAskAlphaCredits = askAlphaThreads.length;
  const remainingAskAlphaCredits = Math.max(0, totalAskAlphaCredits - usedAskAlphaCredits);

  const nextAskAlphaOrder = useMemo(() => {
    return verifiedAskAlphaOrders.find((order) => {
      const usedForOrder = askAlphaThreads.filter((thread) => thread.order_id === order.id).length;
      return usedForOrder < Number(order.question_credits || 0);
    });
  }, [askAlphaThreads, verifiedAskAlphaOrders]);

  const submitNewQuestion = async () => {
    if (!currentUserId || !nextAskAlphaOrder) {
      setAskAlphaMessage("You need a verified Ask Alpha credit before submitting a new question.");
      return;
    }

    const subject = newQuestionSubject.trim();
    const body = newQuestionBody.trim();

    if (!subject || !body) {
      setAskAlphaMessage("Please add a short subject and your question.");
      return;
    }

    setIsSendingQuestion(true);
    setAskAlphaMessage("");

    const { data: thread, error: threadError } = await supabase
      .from("ask_alpha_threads")
      .insert({
        order_id: nextAskAlphaOrder.id,
        user_id: currentUserId,
        subject,
        status: "open",
      })
      .select("id")
      .single();

    if (threadError || !thread) {
      setAskAlphaMessage(threadError?.message || "Unable to create your question thread.");
      setIsSendingQuestion(false);
      return;
    }

    const { error: messageError } = await supabase.from("ask_alpha_messages").insert({
      thread_id: thread.id,
      sender_id: currentUserId,
      sender_role: "client",
      body,
    });

    if (messageError) {
      setAskAlphaMessage(messageError.message);
      setIsSendingQuestion(false);
      return;
    }

    setNewQuestionSubject("");
    setNewQuestionBody("");
    await loadDashboard();
    setIsSendingQuestion(false);
  };

  const submitThreadReply = async (threadId: string) => {
    const body = (replyDrafts[threadId] || "").trim();

    if (!currentUserId || !body) {
      return;
    }

    setActiveReplyThreadId(threadId);
    setAskAlphaMessage("");

    const { error: messageError } = await supabase.from("ask_alpha_messages").insert({
      thread_id: threadId,
      sender_id: currentUserId,
      sender_role: "client",
      body,
    });

    if (messageError) {
      setAskAlphaMessage(messageError.message);
      setActiveReplyThreadId("");
      return;
    }

    await supabase.from("ask_alpha_threads").update({ status: "open" }).eq("id", threadId);
    setReplyDrafts((drafts) => ({ ...drafts, [threadId]: "" }));
    await loadDashboard();
    setActiveReplyThreadId("");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100svh-64px)] items-center justify-center px-4">
        <div className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Loading dashboard</div>
      </div>
    );
  }

  const displayName = profile?.first_name || profile?.full_name || "Client";

  return (
    <div className="min-h-screen bg-[#F9F8F4] px-4 py-8 sm:px-6 sm:py-10">
      <motion.div
        className="mx-auto w-full max-w-6xl"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 text-[12px] font-black uppercase tracking-[0.2em] text-[#FF0000]">Client dashboard</div>
            <h1 className="font-outfit text-3xl font-black tracking-tight text-gray-900 sm:text-5xl">
              Welcome back, {displayName}
            </h1>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-relaxed text-gray-600 sm:text-base">
              {hasProgrammeAccess
                ? "Your assigned tasks, meal plan, training work, and Ask Alpha messages live here."
                : "Your Ask Alpha question credits and replies live here after payment verification."}
            </p>
          </div>
          <Button type="button" variant="secondary" onClick={signOut} className="h-12 gap-2 rounded-full px-5">
            <LogOut size={16} />
            Sign out
          </Button>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardStat icon={<ClipboardList size={20} />} value={tasks.length} label="Assigned tasks" tone="bg-[#FF0000]/10 text-[#FF0000]" />
          <DashboardStat icon={<Utensils size={20} />} value={mealPlans.length} label="Active meal plans" tone="bg-emerald-50 text-emerald-600" />
          <DashboardStat icon={<Dumbbell size={20} />} value={exercisePlans.length} label="Exercise plans" tone="bg-gray-100 text-gray-700" />
          <DashboardStat icon={<MessageCircle size={20} />} value={remainingAskAlphaCredits} label="Ask Alpha credits" tone="bg-black text-white" />
        </div>

        <section className="mb-6 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-2 text-[12px] font-black uppercase tracking-[0.18em] text-[#FF0000]">Paid Q&A</div>
              <h2 className="font-outfit text-2xl font-black tracking-tight text-gray-900">Ask Alpha Messages</h2>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-gray-500">
                One verified credit unlocks one focused question. Replies inside an existing thread do not use extra credits.
              </p>
            </div>
            <Link
              href="/ask-alpha"
              className="inline-flex h-11 items-center justify-center rounded-full bg-gray-900 px-5 text-sm font-black text-white transition-colors hover:bg-[#FF0000]"
            >
              Buy credits
            </Link>
          </div>

          <div className="mb-5 grid gap-3 md:grid-cols-3">
            {askAlphaOrders.length ? (
              askAlphaOrders.slice(0, 3).map((order) => (
                <div key={order.id} className="rounded-2xl bg-[#F9F8F4] p-4">
                  <div className="text-sm font-black text-gray-900">{order.product_title}</div>
                  <div className="mt-1 text-xs font-bold text-gray-500">{order.reference}</div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-sm font-black text-gray-900">{formatAskAlphaPrice(order.amount_lkr)}</span>
                    <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-gray-500">
                      {askAlphaStatusLabel[order.status]}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-[#F9F8F4] p-4 text-sm font-bold text-gray-500 md:col-span-3">
                No Ask Alpha payments yet.
              </div>
            )}
          </div>

          {remainingAskAlphaCredits > 0 ? (
            <div className="mb-6 rounded-3xl border border-[#FF0000]/15 bg-[#FF0000]/5 p-4 sm:p-5">
              <h3 className="font-outfit text-xl font-black tracking-tight text-gray-900">Ask a new question</h3>
              <div className="mt-4 space-y-3">
                <input
                  value={newQuestionSubject}
                  onChange={(event) => setNewQuestionSubject(event.target.value)}
                  placeholder="Short subject"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-[#FF0000]"
                />
                <textarea
                  value={newQuestionBody}
                  onChange={(event) => setNewQuestionBody(event.target.value)}
                  rows={5}
                  placeholder="Write your focused training, nutrition, or form-review question here. If you want a video reviewed, paste a public video link."
                  className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold leading-relaxed text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-[#FF0000]"
                />
                <Button type="button" onClick={submitNewQuestion} isLoading={isSendingQuestion} className="h-12 gap-2 rounded-full bg-gray-900 px-5 text-white hover:bg-[#FF0000]">
                  <Send size={16} />
                  Submit question
                </Button>
              </div>
            </div>
          ) : (
            <div className="mb-6 rounded-2xl border border-gray-100 bg-[#F9F8F4] p-4 text-sm font-bold leading-relaxed text-gray-600">
              You have no unused verified question credits right now. Buy a credit or wait for your latest payment to be verified.
            </div>
          )}

          {askAlphaMessage && (
            <div className="mb-5 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm font-bold leading-relaxed text-gray-700">
              {askAlphaMessage}
            </div>
          )}

          <div className="space-y-4">
            {askAlphaThreads.length ? (
              askAlphaThreads.map((thread) => (
                <article key={thread.id} className="rounded-3xl border border-gray-100 bg-[#F9F8F4] p-4 sm:p-5">
                  <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-outfit text-xl font-black tracking-tight text-gray-900">{thread.subject}</h3>
                      <div className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-gray-400">
                        {thread.status} | {new Date(thread.updated_at).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {thread.messages.map((message) => {
                      const isClient = message.sender_role === "client";
                      return (
                        <div key={message.id} className={`flex ${isClient ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[88%] rounded-2xl p-4 text-sm font-semibold leading-relaxed ${
                            isClient ? "bg-gray-900 text-white" : "bg-white text-gray-700"
                          }`}>
                            <div className={`mb-2 text-[11px] font-black uppercase tracking-[0.12em] ${isClient ? "text-white/50" : "text-[#FF0000]"}`}>
                              {isClient ? "You" : "Alpha Lee"}
                            </div>
                            <p className="whitespace-pre-wrap">{message.body}</p>
                            <div className={`mt-2 text-[11px] font-bold ${isClient ? "text-white/45" : "text-gray-400"}`}>
                              {new Date(message.created_at).toLocaleString()}
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
                        rows={2}
                        placeholder="Reply in this thread"
                        className="min-h-12 flex-1 resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold leading-relaxed text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-[#FF0000]"
                      />
                      <Button
                        type="button"
                        onClick={() => submitThreadReply(thread.id)}
                        isLoading={activeReplyThreadId === thread.id}
                        className="h-12 gap-2 rounded-full bg-gray-900 px-5 text-white hover:bg-[#FF0000]"
                      >
                        <Send size={16} />
                        Reply
                      </Button>
                    </div>
                  )}
                </article>
              ))
            ) : (
              <EmptyState icon={<MessageCircle size={24} />} title="No questions submitted yet" text="Once your Ask Alpha payment is verified, submit your first focused question here." />
            )}
          </div>
        </section>

        {!hasProgrammeAccess ? (
          <section className="rounded-3xl border border-gray-100 bg-white p-6 text-center shadow-sm sm:p-8">
            <h2 className="font-outfit text-2xl font-black tracking-tight text-gray-900">Want the full coaching dashboard?</h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-gray-500">
              Ask Alpha gives paid answers to focused questions. Full coaching packages unlock training plans, meal plans, progress tasks, and ongoing coaching support.
            </p>
            <Link
              href="/packages"
              className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-[#FF0000] px-6 text-sm font-black uppercase tracking-[0.08em] text-white transition-colors hover:bg-red-700"
            >
              View programmes
            </Link>
          </section>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <h2 className="font-outfit text-2xl font-black tracking-tight text-gray-900">Task List</h2>
                <ClipboardList className="text-[#FF0000]" size={22} />
              </div>

              {tasks.length ? (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div key={task.id} className="rounded-2xl border border-gray-100 bg-[#F9F8F4] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-black text-gray-900">{task.title}</div>
                          {task.description && <p className="mt-1 text-sm font-semibold leading-relaxed text-gray-600">{task.description}</p>}
                        </div>
                        <span className="shrink-0 rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-gray-500">
                          {statusLabel[task.status]}
                        </span>
                      </div>
                      {task.due_on && (
                        <div className="mt-3 flex items-center gap-2 text-xs font-bold text-gray-500">
                          <CalendarDays size={14} />
                          Due {task.due_on}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={<CheckCircle2 size={24} />} title="No tasks assigned yet" text="Your coach will add your first checklist after verification and setup." />
              )}
            </section>

            <section className="space-y-6">
              <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <h2 className="font-outfit text-2xl font-black tracking-tight text-gray-900">Meal Plans</h2>
                  <Utensils className="text-emerald-600" size={22} />
                </div>

                {mealPlans.length ? (
                  <div className="space-y-5">
                    {mealPlans.map((plan) => (
                      <div key={plan.id} className="rounded-2xl border border-gray-100 bg-[#F9F8F4] p-4">
                        <div className="mb-3">
                          <div className="font-black text-gray-900">{plan.title}</div>
                          {plan.notes && <p className="mt-1 text-sm font-semibold leading-relaxed text-gray-600">{plan.notes}</p>}
                        </div>
                        <div className="space-y-2">
                          {[...plan.meal_plan_items]
                            .sort((a, b) => a.sort_order - b.sort_order)
                            .map((item) => (
                              <div key={item.id} className="rounded-xl bg-white p-3">
                                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                  <div className="font-black text-gray-900">{item.meal_label}</div>
                                  <div className="text-xs font-bold text-gray-500">{item.day_label || "Daily"}</div>
                                </div>
                                <p className="mt-1 text-sm font-semibold leading-relaxed text-gray-600">{item.food_items}</p>
                                {(item.calories || item.protein_g) && (
                                  <div className="mt-2 text-xs font-black text-[#FF0000]">
                                    {item.calories ? `${item.calories} kcal` : ""}{item.calories && item.protein_g ? " | " : ""}{item.protein_g ? `${item.protein_g}g protein` : ""}
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={<Utensils size={24} />} title="No meal plan yet" text="Once your coach prepares your meals, they will appear here." />
                )}
              </div>

              <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <h2 className="font-outfit text-2xl font-black tracking-tight text-gray-900">Exercise Plans</h2>
                  <Dumbbell className="text-gray-700" size={22} />
                </div>

                {exercisePlans.length ? (
                  <div className="space-y-4">
                    {exercisePlans.map((plan) => (
                      <div key={plan.id} className="rounded-2xl border border-gray-100 bg-[#F9F8F4] p-4">
                        <div className="mb-3 font-black text-gray-900">{plan.title}</div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {[...plan.exercise_plan_items]
                            .sort((a, b) => a.sort_order - b.sort_order)
                            .map((item) => (
                              <div key={item.id} className="rounded-xl bg-white p-3">
                                <div className="font-black text-gray-900">{item.exercise_name}</div>
                                <div className="mt-1 text-xs font-bold text-gray-500">
                                  {[item.day_label, item.sets, item.reps].filter(Boolean).join(" | ") || "Details pending"}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={<Dumbbell size={24} />} title="No exercise plan yet" text="Your assigned training sessions will appear here." />
                )}
              </div>
            </section>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function DashboardStat({ icon, value, label, tone }: { icon: React.ReactNode; value: number; label: string; tone: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-full ${tone}`}>{icon}</div>
      <div className="text-2xl font-black text-gray-900">{value}</div>
      <div className="text-sm font-bold text-gray-500">{label}</div>
    </div>
  );
}

function EmptyState({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-[#F9F8F4] p-6 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-gray-500">
        {icon}
      </div>
      <div className="font-black text-gray-900">{title}</div>
      <p className="mx-auto mt-2 max-w-sm text-sm font-semibold leading-relaxed text-gray-500">{text}</p>
    </div>
  );
}
