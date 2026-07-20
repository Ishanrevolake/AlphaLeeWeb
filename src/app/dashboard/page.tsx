"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Dumbbell, ImagePlus, LogOut, MessageCircle, Plus, Scale, Send, ShoppingBasket, Utensils } from "lucide-react";
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

type ClientWorkoutPlanRow = {
  client_id: string;
  assigned_program_id: string | null;
  focus: string | null;
  start_date: string | null;
  trainer_notes: string | null;
  days: Array<{
    id: string;
    day: string;
    title: string;
    exercises: Array<{
      id: string;
      name: string;
      sets?: string;
      reps?: string;
      notes?: string;
    }>;
  }> | null;
};

type ClientMealPlanRow = {
  client_id: string;
  focus: string | null;
  start_date: string | null;
  trainer_notes: string | null;
  days: Array<{
    id: string;
    day: string;
    meals: Array<{
      id: string;
      name: string;
      mealTime?: string;
      items?: string[];
      calories?: number;
      protein?: number;
      notes?: string;
    }>;
  }> | null;
};

type ProgressMeasurement = {
  id: string;
  measured_on: string;
  body_weight_kg: number | null;
  waist_cm: number | null;
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
  const [selectedWorkoutDay, setSelectedWorkoutDay] = useState("all");
  const [measurements, setMeasurements] = useState<ProgressMeasurement[]>([]);
  const [weightInput, setWeightInput] = useState("");
  const [waistInput, setWaistInput] = useState("");
  const [isSavingMeasurement, setIsSavingMeasurement] = useState(false);
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
      const [taskResult, mealResult, exerciseResult, measurementResult] = await Promise.all([
        supabase
          .from("client_tasks")
          .select("id, title, description, due_on, status")
          .eq("client_id", user.id)
          .order("due_on", { ascending: true, nullsFirst: false }),
        supabase
          .from("client_meal_plans")
          .select("client_id, focus, start_date, trainer_notes, days")
          .eq("client_id", user.id)
          .limit(1),
        supabase
          .from("client_workout_plans")
          .select("client_id, assigned_program_id, focus, start_date, trainer_notes, days")
          .eq("client_id", user.id)
          .limit(1),
        supabase
          .from("progress_measurements")
          .select("id, measured_on, body_weight_kg, waist_cm")
          .eq("client_id", user.id)
          .order("measured_on", { ascending: true }),
      ]);

      setTasks((taskResult.data || []) as ClientTask[]);
      const clientMealRows = (mealResult.data || []) as ClientMealPlanRow[];
      const clientWorkoutRows = (exerciseResult.data || []) as ClientWorkoutPlanRow[];

      setMealPlans(clientMealRows.map((plan) => ({
        id: plan.client_id,
        title: plan.focus || "Custom nutrition plan",
        notes: plan.trainer_notes,
        starts_on: plan.start_date,
        ends_on: null,
        meal_plan_items: (plan.days || []).flatMap((day, dayIndex) =>
          (day.meals || []).map((meal, mealIndex) => ({
            id: meal.id || `${day.id}-${mealIndex}`,
            day_label: day.day,
            meal_label: meal.mealTime || meal.name,
            food_items: [meal.name, ...(meal.items || [])].filter(Boolean).join("\n"),
            calories: meal.calories || null,
            protein_g: meal.protein || null,
            notes: meal.notes || null,
            sort_order: dayIndex * 100 + mealIndex,
          })),
        ),
      })));

      setExercisePlans(clientWorkoutRows.map((plan) => ({
        id: plan.client_id,
        title: plan.focus || plan.assigned_program_id || "Workout programme",
        notes: plan.trainer_notes,
        exercise_plan_items: (plan.days || []).flatMap((day, dayIndex) =>
          (day.exercises || []).map((exercise, exerciseIndex) => ({
            id: exercise.id || `${day.id}-${exerciseIndex}`,
            day_label: day.day,
            exercise_name: exercise.name,
            sets: exercise.sets || null,
            reps: exercise.reps || null,
            notes: [
              day.title,
              exercise.sets ? `Sets: ${exercise.sets}` : null,
              exercise.reps ? `Reps: ${exercise.reps}` : null,
              exercise.notes || null,
            ].filter(Boolean).join(" · ") || null,
            sort_order: dayIndex * 100 + exerciseIndex,
          })),
        ),
      })));
      setMeasurements((measurementResult.data || []) as ProgressMeasurement[]);
    } else {
      setTasks([]);
      setMealPlans([]);
      setExercisePlans([]);
      setMeasurements([]);
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

  const saveMeasurement = async () => {
    const weight = weightInput ? Number(weightInput) : null;
    const waist = waistInput ? Number(waistInput) : null;

    if (!currentUserId || (!weight && !waist)) return;

    setIsSavingMeasurement(true);
    const { error } = await supabase.from("progress_measurements").insert({
      client_id: currentUserId,
      measured_on: new Date().toISOString().slice(0, 10),
      body_weight_kg: weight,
      waist_cm: waist,
    });

    if (error) {
      setAskAlphaMessage(error.message);
    } else {
      setWeightInput("");
      setWaistInput("");
      await loadDashboard();
    }
    setIsSavingMeasurement(false);
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
  const latestMeasurement = measurements[measurements.length - 1];
  const firstMeasurement = measurements[0];
  const completedTasks = tasks.filter((task) => task.status === "done").length;
  const mealItems = mealPlans.flatMap((plan) => plan.meal_plan_items);
  const exerciseItems = exercisePlans.flatMap((plan) => plan.exercise_plan_items);
  const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const workoutDayLabels = Array.from(new Set(exerciseItems.map((item) => item.day_label || "Unscheduled")));
  const mealDayLabels = Array.from(new Set(mealItems.map((item) => item.day_label || "Daily")));
  const allExerciseGroups = workoutDayLabels.map((day) => ({
    day,
    items: exerciseItems.filter((item) => (item.day_label || "Unscheduled") === day),
  })).filter((group) => group.items.length);
  const groupedExercises = selectedWorkoutDay === "all"
    ? allExerciseGroups
    : allExerciseGroups.filter((group) => group.day === selectedWorkoutDay);
  const groupedMeals = mealDayLabels.map((day) => ({
    day,
    items: mealItems.filter((item) => (item.day_label || "Daily") === day),
  })).filter((group) => group.items.length);
  const weightDelta = latestMeasurement?.body_weight_kg != null && firstMeasurement?.body_weight_kg != null
    ? Number(latestMeasurement.body_weight_kg) - Number(firstMeasurement.body_weight_kg)
    : null;
  const waistDelta = latestMeasurement?.waist_cm != null && firstMeasurement?.waist_cm != null
    ? Number(latestMeasurement.waist_cm) - Number(firstMeasurement.waist_cm)
    : null;

  return (
    <div className="min-h-screen bg-[#F6F3EC] px-4 py-8 text-[#14161D] sm:px-6 sm:py-10">
      <motion.div
        className="mx-auto w-full max-w-7xl"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 text-[12px] font-black uppercase tracking-[0.18em] text-[#E1472B]">Client dashboard</div>
            <h1 className="font-outfit text-3xl font-black tracking-tight text-[#14161D] sm:text-5xl">
              Welcome back, {displayName}
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-[#5B5D66] sm:text-base">
              {hasProgrammeAccess
                ? "Your programme, meals, measurements and coach messages all live here."
                : "Your Ask Alpha question credits and replies live here after payment verification."}
            </p>
            {profile?.email && <p className="mt-1 text-xs font-bold text-[#5B5D66]">Signed in as {profile.email}</p>}
          </div>
          <Button type="button" variant="secondary" onClick={signOut} className="h-11 gap-2 rounded-xl border-2 border-[#14161D] bg-white px-5 text-[#14161D]">
            <LogOut size={16} />
            Sign out
          </Button>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardStat icon={<Dumbbell size={19} />} value={`${completedTasks}/${tasks.length}`} label="Tasks completed" tone="bg-[#FBE4DE] text-[#E1472B]" />
          <DashboardStat icon={<Utensils size={19} />} value={mealPlans.length} label="Active meal plans" tone="bg-[#E4EEE3] text-[#3F6B4F]" />
          <DashboardStat icon={<Scale size={19} />} value={latestMeasurement?.body_weight_kg ? `${latestMeasurement.body_weight_kg}kg` : "—"} label="Latest weight" tone="bg-[#F5EAD3] text-[#B98A2E]" />
          <DashboardStat icon={<MessageCircle size={19} />} value={remainingAskAlphaCredits} label="Ask Alpha credits" tone="bg-[#EDEBF6] text-[#514A77]" />
        </div>

        {!hasProgrammeAccess ? (
          <section className="rounded-2xl border border-[#E7E1D3] bg-white p-6 text-center shadow-sm sm:p-8">
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
          <div className="space-y-6">
            <DashboardCard eyebrow="Training" title="Your Workout Programme" subtitle={exercisePlans[0]?.title || "Your coach will publish your programme here."}>
              {groupedExercises.length ? (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                    <button type="button" onClick={() => setSelectedWorkoutDay("all")} aria-pressed={selectedWorkoutDay === "all"} className={`rounded-xl border p-3 text-center transition-all ${selectedWorkoutDay === "all" ? "border-[#14161D] bg-[#14161D] text-white shadow-md" : "border-[#E7E1D3] bg-[#F6F3EC] hover:border-[#14161D]"}`}>
                      <div className="text-[10px] font-black uppercase">All exercises</div>
                      <div className="mx-auto mt-2 flex h-8 w-8 items-center justify-center rounded-full border border-current text-xs font-black">{exerciseItems.length}</div>
                      <div className="mt-1 text-[10px] opacity-70">Exercises</div>
                    </button>
                    {workoutDayLabels.slice(0, 7).map((day) => {
                      const count = exerciseItems.filter((item) => (item.day_label || "Unscheduled") === day).length;
                      const isSelected = selectedWorkoutDay === day;
                      return (
                        <button type="button" key={day} onClick={() => setSelectedWorkoutDay(day)} aria-pressed={isSelected} className={`rounded-xl border p-3 text-center transition-all ${isSelected ? "border-[#E1472B] bg-[#E1472B] text-white shadow-md" : "border-[#E1472B] bg-[#FBE4DE] hover:bg-[#f8d4cb]"}`}>
                          <div className="text-[10px] font-black uppercase">{day}</div>
                          <div className="mx-auto mt-2 flex h-8 w-8 items-center justify-center rounded-full border border-current text-xs font-black">{count}</div>
                          <div className="mt-1 text-[10px] opacity-70">Exercises</div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="hidden">
                    <button type="button" onClick={() => setSelectedWorkoutDay("all")} aria-pressed={selectedWorkoutDay === "all"} className={`rounded-xl border p-3 text-center transition-all ${selectedWorkoutDay === "all" ? "border-[#14161D] bg-[#14161D] text-white shadow-md" : "border-[#E7E1D3] bg-[#F6F3EC] hover:border-[#14161D]"}`}>
                      <div className={`text-[10px] font-black uppercase ${selectedWorkoutDay === "all" ? "text-white/70" : "text-[#5B5D66]"}`}>All exercises</div>
                      <div className="mx-auto mt-2 flex h-8 w-8 items-center justify-center rounded-full border border-current text-xs font-black">{exerciseItems.length}</div>
                      <div className={`mt-1 text-[10px] ${selectedWorkoutDay === "all" ? "text-white/70" : "text-[#5B5D66]"}`}>Exercises</div>
                    </button>
                    {(workoutDayLabels.length ? workoutDayLabels : dayOrder).slice(0, 7).map((day) => {
                      const count = exerciseItems.filter((item) => (item.day_label || "Unscheduled") === day).length;
                      return <div key={day} className={`rounded-xl border p-3 text-center ${count ? "border-[#E1472B] bg-[#FBE4DE]" : "border-[#E7E1D3] bg-[#F6F3EC]"}`}><div className="text-[10px] font-black uppercase text-[#5B5D66]">{day.slice(0, 3)}</div><div className="mx-auto mt-2 flex h-8 w-8 items-center justify-center rounded-full border border-current text-xs font-black">{count || "—"}</div><div className="mt-1 text-[10px] text-[#5B5D66]">{count ? "Exercises" : "Rest"}</div></div>;
                    })}
                  </div>
                  {groupedExercises.map((group) => <div key={group.day}><h3 className="mb-2 text-sm font-black uppercase tracking-wider text-[#5B5D66]">{group.day}</h3>{group.items.sort((a,b) => a.sort_order-b.sort_order).map((item) => <div key={item.id} className="flex items-center gap-3 border-b border-[#E7E1D3] px-1 py-3 last:border-0"><div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-[#E7E1D3] text-[#3F6B4F]"><Check size={14}/></div><div><div className="text-sm font-bold">{item.exercise_name}</div><div className="text-xs text-[#5B5D66]">{item.notes || "Assigned exercise"}</div></div><div className="ml-auto whitespace-nowrap font-mono text-xs text-[#5B5D66]">{[item.sets, item.reps].filter(Boolean).join(" × ")}</div></div>)}</div>)}
                </div>
              ) : <EmptyState icon={<Dumbbell size={24}/>} title="No exercise plan yet" text="Your assigned training sessions will appear here."/>}
            </DashboardCard>

            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <DashboardCard eyebrow="Nutrition" title="Meal Plan" subtitle={mealPlans[0]?.notes || mealPlans[0]?.title || "Prepared by your coach"}>
                {groupedMeals.length ? groupedMeals.map((group) => <div key={group.day} className="mb-5 last:mb-0"><h3 className="mb-2 text-xs font-black uppercase tracking-wider text-[#3F6B4F]">{group.day}</h3>{group.items.sort((a,b)=>a.sort_order-b.sort_order).map((item)=><div key={item.id} className="mb-2 rounded-xl border border-[#E7E1D3] bg-[#F6F3EC] p-4"><div className="flex justify-between gap-3"><div className="text-sm font-black">{item.meal_label}</div>{item.calories && <div className="font-mono text-xs text-[#5B5D66]">{item.calories} kcal</div>}</div><p className="mt-1 text-sm leading-6 text-[#5B5D66]">{item.food_items}</p>{item.protein_g && <div className="mt-2 text-xs font-bold text-[#3F6B4F]">{item.protein_g}g protein</div>}</div>)}</div>) : <EmptyState icon={<Utensils size={24}/>} title="No meal plan yet" text="Once your coach prepares your meals, they will appear here."/>}
              </DashboardCard>
              <DashboardCard eyebrow="From your meal plan" title="Shopping List" subtitle="Food items assigned by your coach">
                {mealItems.length ? <div className="space-y-2">{Array.from(new Set(mealItems.flatMap((item) => item.food_items.split(/,|\n/).map((food) => food.trim())).filter(Boolean))).map((food)=><label key={food} className="flex cursor-pointer items-center gap-3 border-b border-dashed border-[#E7E1D3] py-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-[#3F6B4F]"/>{food}</label>)}</div> : <EmptyState icon={<ShoppingBasket size={24}/>} title="Nothing to list yet" text="Shopping items will be generated from your meal plan."/>}
              </DashboardCard>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <MetricCard title="Weight" value={latestMeasurement?.body_weight_kg != null ? `${latestMeasurement.body_weight_kg} kg` : "—"} delta={weightDelta} unit="kg" measurements={measurements} field="body_weight_kg" input={weightInput} setInput={setWeightInput}/>
              <MetricCard title="Waist" value={latestMeasurement?.waist_cm != null ? `${latestMeasurement.waist_cm} cm` : "—"} delta={waistDelta} unit="cm" measurements={measurements} field="waist_cm" input={waistInput} setInput={setWaistInput}/>
            </div>
            <div className="flex justify-end"><Button type="button" onClick={saveMeasurement} isLoading={isSavingMeasurement} className="gap-2 rounded-xl bg-[#14161D] px-5 text-white"><Plus size={16}/>Save today&apos;s measurements</Button></div>

            <DashboardCard eyebrow="Weekly" title="Progress Photos" subtitle="Front, side and back photos help your coach track visual change.">
              <EmptyState icon={<ImagePlus size={25}/>} title="Progress photo uploads need setup" text="Your database does not yet include progress-photo storage. No demo photos are shown in place of your real data."/>
            </DashboardCard>
          </div>
        )}

        <DashboardCard eyebrow="Direct line" title="Ask Alpha Messages" subtitle="Your paid questions and replies from Alpha Lee.">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div className="text-sm font-bold text-[#5B5D66]">{remainingAskAlphaCredits} question credit{remainingAskAlphaCredits === 1 ? "" : "s"} remaining</div><Link href="/ask-alpha" className="rounded-lg bg-[#14161D] px-4 py-2 text-sm font-black text-white">Buy credits</Link></div>
          {askAlphaOrders.length > 0 && <div className="mb-5 grid gap-2 sm:grid-cols-3">{askAlphaOrders.slice(0,3).map((order)=><div key={order.id} className="rounded-xl bg-[#F6F3EC] p-3"><div className="text-sm font-black">{order.product_title}</div><div className="mt-1 flex justify-between text-xs text-[#5B5D66]"><span>{formatAskAlphaPrice(order.amount_lkr)}</span><span>{askAlphaStatusLabel[order.status]}</span></div></div>)}</div>}
          {remainingAskAlphaCredits > 0 && <div className="mb-6 grid gap-3 rounded-xl border border-[#E7E1D3] bg-[#F6F3EC] p-4"><input value={newQuestionSubject} onChange={(e)=>setNewQuestionSubject(e.target.value)} placeholder="Short subject" className="rounded-lg border border-[#E7E1D3] bg-white px-4 py-3 text-sm text-[#14161D] placeholder:text-gray-400"/><textarea value={newQuestionBody} onChange={(e)=>setNewQuestionBody(e.target.value)} rows={3} placeholder="Ask about your programme, nutrition or technique..." className="resize-none rounded-lg border border-[#E7E1D3] bg-white px-4 py-3 text-sm text-[#14161D] placeholder:text-gray-400"/><Button type="button" onClick={submitNewQuestion} isLoading={isSendingQuestion} className="w-fit gap-2 rounded-lg bg-[#E1472B] text-white"><Send size={15}/>Send question</Button></div>}
          {askAlphaMessage && <div className="mb-4 rounded-lg bg-[#FBE4DE] p-3 text-sm font-bold">{askAlphaMessage}</div>}
          <div className="space-y-4">{askAlphaThreads.length ? askAlphaThreads.map((thread)=><article key={thread.id} className="rounded-xl border border-[#E7E1D3] bg-[#F6F3EC] p-4"><div className="mb-3 flex justify-between gap-3"><h3 className="font-outfit text-lg font-black">{thread.subject}</h3><span className="text-[10px] font-black uppercase tracking-wider text-[#5B5D66]">{thread.status}</span></div><div className="space-y-2">{thread.messages.map((message)=><div key={message.id} className={`flex ${message.sender_role === "client" ? "justify-end" : "justify-start"}`}><div className={`max-w-[85%] rounded-xl p-3 text-sm leading-6 ${message.sender_role === "client" ? "bg-[#14161D] text-white" : "border border-[#E7E1D3] bg-white"}`}>{message.body}<div className="mt-1 text-[10px] opacity-50">{new Date(message.created_at).toLocaleString()}</div></div></div>)}</div>{thread.status !== "closed" && <div className="mt-3 flex gap-2"><textarea value={replyDrafts[thread.id] || ""} onChange={(e)=>setReplyDrafts((drafts)=>({...drafts,[thread.id]:e.target.value}))} rows={2} placeholder="Reply in this thread" className="flex-1 resize-none rounded-lg border border-[#E7E1D3] bg-white px-3 py-2 text-sm text-[#14161D]"/><Button type="button" onClick={()=>submitThreadReply(thread.id)} isLoading={activeReplyThreadId === thread.id} className="self-end rounded-lg bg-[#E1472B] text-white">Reply</Button></div>}</article>) : <EmptyState icon={<MessageCircle size={24}/>} title="No messages yet" text="Your conversation with Alpha Lee will appear here."/>}</div>
        </DashboardCard>
      </motion.div>
    </div>
  );
}

function DashboardCard({ eyebrow, title, subtitle, children }: { eyebrow: string; title: string; subtitle?: string; children: React.ReactNode }) {
  return <section className="mb-6 rounded-2xl border border-[#E7E1D3] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(20,22,29,0.1)] sm:p-7"><div className="mb-5"><div className="text-[11px] font-black uppercase tracking-[0.14em] text-[#5B5D66]">{eyebrow}</div><h2 className="mt-1 font-outfit text-2xl font-black tracking-tight">{title}</h2>{subtitle && <p className="mt-1 text-sm text-[#5B5D66]">{subtitle}</p>}</div>{children}</section>;
}

function MetricCard({ title, value, delta, unit, measurements, field, input, setInput }: { title: string; value: string; delta: number | null; unit: string; measurements: ProgressMeasurement[]; field: "body_weight_kg" | "waist_cm"; input: string; setInput: (value: string) => void }) {
  const points = measurements.filter((item) => item[field] != null).slice(-8);
  const values = points.map((item) => Number(item[field]));
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 0;
  return <DashboardCard eyebrow={title === "Weight" ? "Daily" : "Weekly"} title={title}><div className="flex items-end gap-6"><div><div className="font-outfit text-3xl font-black">{value}</div><div className="text-[11px] font-bold uppercase tracking-wider text-[#5B5D66]">Latest</div></div>{delta != null && <div><div className={`text-lg font-black ${delta <= 0 ? "text-[#3F6B4F]" : "text-[#E1472B]"}`}>{delta > 0 ? "+" : ""}{delta.toFixed(1)} {unit}</div><div className="text-[11px] font-bold uppercase tracking-wider text-[#5B5D66]">Recorded trend</div></div>}</div><div className="mt-6 flex h-28 items-end gap-2 rounded-xl bg-[#F6F3EC] p-4">{values.length ? values.map((point,index)=>{const height=max===min ? 60 : 22+((point-min)/(max-min))*62;return <div key={`${point}-${index}`} className="flex-1 rounded-t bg-[#E1472B]" style={{height:`${height}%`}} title={`${points[index].measured_on}: ${point} ${unit}`}/>}) : <div className="m-auto text-sm font-bold text-[#5B5D66]">No measurements logged yet</div>}</div><div className="mt-4 flex items-center gap-2"><input type="number" step="0.1" value={input} onChange={(e)=>setInput(e.target.value)} placeholder={`Enter ${title.toLowerCase()}`} className="min-w-0 flex-1 rounded-lg border border-[#E7E1D3] bg-white px-3 py-2 text-sm text-[#14161D] placeholder:text-gray-400"/><span className="text-sm font-bold text-[#5B5D66]">{unit}</span></div></DashboardCard>;
}

function DashboardStat({ icon, value, label, tone }: { icon: React.ReactNode; value: React.ReactNode; label: string; tone: string }) {
  return (
    <div className="rounded-2xl border border-[#E7E1D3] bg-white p-5 shadow-sm">
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}>{icon}</div>
      <div className="font-outfit text-2xl font-black text-[#14161D]">{value}</div>
      <div className="text-sm font-medium text-[#5B5D66]">{label}</div>
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
