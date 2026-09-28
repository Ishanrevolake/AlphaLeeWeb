"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Camera, Check, Download, Dumbbell, ImagePlus, LogOut, MessageCircle, Plus, Scale, ShoppingBasket, Upload, Utensils } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { hasVerifiedPayment } from "@/lib/clientAccess";
import { resumeSignup } from "@/lib/onboardingDraft";

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
  meal_name: string;
  food_items: string;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fats_g: number | null;
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
      carbs?: number;
      fat?: number;
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

type ProgressPhoto = {
  id: string;
  captured_on: string;
  view_type: "front" | "side" | "back";
  storage_path: string;
  file_name: string;
  signedUrl?: string;
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
  const [selectedMealDay, setSelectedMealDay] = useState("");
  const [measurements, setMeasurements] = useState<ProgressMeasurement[]>([]);
  const [progressPhotos, setProgressPhotos] = useState<ProgressPhoto[]>([]);
  const [weightInput, setWeightInput] = useState("");
  const [waistInput, setWaistInput] = useState("");
  const [isSavingMeasurement, setIsSavingMeasurement] = useState(false);
  const [uploadingPhotoView, setUploadingPhotoView] = useState("");
  const [dashboardMessage, setDashboardMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isExportingPlans, setIsExportingPlans] = useState(false);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      router.replace("/signup/step-1");
      return;
    }

    setCurrentUserId(user.id);

    const programmeAccess = await hasVerifiedPayment(user.id);

    if (!programmeAccess) {
      router.replace(await resumeSignup(user));
      return;
    }

    setHasProgrammeAccess(programmeAccess);

    const profileResult = await supabase
      .from("profiles")
      .select("full_name, first_name, email")
      .eq("id", user.id)
      .maybeSingle();

    setProfile(profileResult.data || { full_name: null, first_name: null, email: user.email || null });

    if (programmeAccess) {
      const [taskResult, mealResult, exerciseResult, measurementResult, photoResult] = await Promise.all([
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
        supabase
          .from("progress_photos")
          .select("id, captured_on, view_type, storage_path, file_name")
          .eq("client_id", user.id)
          .order("captured_on", { ascending: false })
          .order("created_at", { ascending: false }),
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
            meal_name: meal.name,
            food_items: (meal.items || []).filter(Boolean).join("\n"),
            calories: meal.calories || null,
            protein_g: meal.protein || null,
            carbs_g: meal.carbs || null,
            fats_g: meal.fat || null,
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
      const photoRows = (photoResult.data || []) as ProgressPhoto[];
      const hydratedPhotos = await Promise.all(photoRows.map(async (photo) => {
        const { data } = await supabase.storage.from("progress-photos").createSignedUrl(photo.storage_path, 60 * 30);
        return { ...photo, signedUrl: data?.signedUrl };
      }));
      setProgressPhotos(hydratedPhotos);
    } else {
      setTasks([]);
      setMealPlans([]);
      setExercisePlans([]);
      setMeasurements([]);
      setProgressPhotos([]);
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
    const measuredOn = new Date().toISOString().slice(0, 10);
    const existingToday = measurements.find((item) => item.measured_on === measuredOn);
    const payload = {
      client_id: currentUserId,
      measured_on: measuredOn,
      body_weight_kg: weight ?? existingToday?.body_weight_kg ?? null,
      waist_cm: waist ?? existingToday?.waist_cm ?? null,
    };
    const { error } = existingToday
      ? await supabase.from("progress_measurements").update(payload).eq("id", existingToday.id)
      : await supabase.from("progress_measurements").insert(payload);

    if (error) {
      setDashboardMessage(error.message);
    } else {
      setWeightInput("");
      setWaistInput("");
      await loadDashboard();
    }
    setIsSavingMeasurement(false);
  };

  const uploadProgressPhoto = async (viewType: ProgressPhoto["view_type"], file: File | null) => {
    if (!currentUserId || !file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setDashboardMessage("Progress photos must be JPG, PNG, or WebP images.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setDashboardMessage("Progress photos must be smaller than 10 MB.");
      return;
    }

    setUploadingPhotoView(viewType);
    setDashboardMessage("");
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const capturedOn = new Date().toISOString().slice(0, 10);
    const storagePath = `${currentUserId}/${capturedOn}/${viewType}-${Date.now()}-${safeName}`;
    const { error: uploadError } = await supabase.storage.from("progress-photos").upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (uploadError) {
      setDashboardMessage(uploadError.message);
      setUploadingPhotoView("");
      return;
    }

    const { error: recordError } = await supabase.from("progress_photos").insert({
      client_id: currentUserId,
      captured_on: capturedOn,
      view_type: viewType,
      storage_path: storagePath,
      file_name: file.name,
    });

    if (recordError) {
      await supabase.storage.from("progress-photos").remove([storagePath]);
      setDashboardMessage(recordError.message);
    } else {
      await loadDashboard();
    }
    setUploadingPhotoView("");
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
  const activeMealDay = mealDayLabels.includes(selectedMealDay) ? selectedMealDay : mealDayLabels[0] || "";
  const visibleMealGroup = groupedMeals.find((group) => group.day === activeMealDay);
  const shoppingItems = Array.from(new Set(
    mealItems
      .flatMap((item) => item.food_items.split(/,|\n/).map((food) => food.trim()))
      .filter(Boolean),
  ));
  const weightDelta = latestMeasurement?.body_weight_kg != null && firstMeasurement?.body_weight_kg != null
    ? Number(latestMeasurement.body_weight_kg) - Number(firstMeasurement.body_weight_kg)
    : null;
  const waistDelta = latestMeasurement?.waist_cm != null && firstMeasurement?.waist_cm != null
    ? Number(latestMeasurement.waist_cm) - Number(firstMeasurement.waist_cm)
    : null;

  const downloadPlans = async () => {
    if (!mealItems.length && !exerciseItems.length) return;

    setIsExportingPlans(true);
    setDashboardMessage("");

    try {
      const XLSX = await import("xlsx");
      const workbook = XLSX.utils.book_new();

      if (mealItems.length) {
        const mealRows = mealPlans.flatMap((plan) =>
          plan.meal_plan_items
            .slice()
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((item) => ({
              "Plan": plan.title,
              "Day": item.day_label || "Daily",
              "Meal": item.meal_label,
              "Meal name": item.meal_name,
              "Food items": item.food_items,
              "Calories (kcal)": item.calories ?? "",
              "Protein (g)": item.protein_g ?? "",
              "Carbs (g)": item.carbs_g ?? "",
              "Fat (g)": item.fats_g ?? "",
              "Notes": item.notes || "",
            })),
        );
        const mealSheet = XLSX.utils.json_to_sheet(mealRows);
        mealSheet["!cols"] = [
          { wch: 24 }, { wch: 14 }, { wch: 18 }, { wch: 28 }, { wch: 48 },
          { wch: 16 }, { wch: 14 }, { wch: 12 }, { wch: 10 }, { wch: 36 },
        ];
        XLSX.utils.book_append_sheet(workbook, mealSheet, "Meal Plan");
      }

      if (exerciseItems.length) {
        const exerciseRows = exercisePlans.flatMap((plan) =>
          plan.exercise_plan_items
            .slice()
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((item) => ({
              "Plan": plan.title,
              "Day": item.day_label || "Unscheduled",
              "Exercise": item.exercise_name,
              "Sets": item.sets || "",
              "Reps": item.reps || "",
              "Notes": item.notes || "",
            })),
        );
        const exerciseSheet = XLSX.utils.json_to_sheet(exerciseRows);
        exerciseSheet["!cols"] = [
          { wch: 24 }, { wch: 14 }, { wch: 30 }, { wch: 12 }, { wch: 12 }, { wch: 48 },
        ];
        XLSX.utils.book_append_sheet(workbook, exerciseSheet, "Exercises");
      }

      const safeName = displayName.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-|-$/g, "") || "client";
      XLSX.writeFile(workbook, `${safeName}-fitness-plans-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch {
      setDashboardMessage("We could not create the Excel file. Please try again.");
    } finally {
      setIsExportingPlans(false);
    }
  };

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
              Your programme, meals, measurements and trainer updates all live here.
            </p>
            {profile?.email && <p className="mt-1 text-xs font-bold text-[#5B5D66]">Signed in as {profile.email}</p>}
          </div>
          <Button type="button" variant="secondary" onClick={signOut} className="h-11 gap-2 rounded-xl border-2 border-[#14161D] bg-white px-5 text-[#14161D]">
            <LogOut size={16} />
            Sign out
          </Button>
        </div>

        {dashboardMessage && <div className="mb-5 rounded-xl bg-[#FBE4DE] p-4 text-sm font-bold text-[#8F2F20]">{dashboardMessage}</div>}

        <div className="mb-6 flex flex-wrap justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={downloadPlans}
            disabled={!mealItems.length && !exerciseItems.length}
            isLoading={isExportingPlans}
            className="h-11 gap-2 rounded-xl border-2 border-[#3F6B4F] bg-white px-5 text-[#3F6B4F] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={16} />
            Download plans
          </Button>
          <Link href="/ask-alpha/dashboard" className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#14161D] px-5 text-sm font-black text-white transition-colors hover:bg-[#E1472B]">
            <MessageCircle size={16} />
            Open Ask Alpha
          </Link>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <DashboardStat icon={<Dumbbell size={19} />} value={`${completedTasks}/${tasks.length}`} label="Tasks completed" tone="bg-[#FBE4DE] text-[#E1472B]" />
          <DashboardStat icon={<Utensils size={19} />} value={mealPlans.length} label="Active meal plans" tone="bg-[#E4EEE3] text-[#3F6B4F]" />
          <DashboardStat icon={<Scale size={19} />} value={latestMeasurement?.body_weight_kg ? `${latestMeasurement.body_weight_kg}kg` : "—"} label="Latest weight" tone="bg-[#F5EAD3] text-[#B98A2E]" />
        </div>

        {hasProgrammeAccess && (
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
                {groupedMeals.length ? (
                  <div>
                    <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
                      {mealDayLabels.map((day) => {
                        const count = mealItems.filter((item) => (item.day_label || "Daily") === day).length;
                        const isActive = day === activeMealDay;
                        return (
                          <button
                            type="button"
                            key={day}
                            onClick={() => setSelectedMealDay(day)}
                            className={`min-w-[76px] rounded-xl border px-3 py-2 text-center transition-colors ${isActive ? "border-[#3F6B4F] bg-[#3F6B4F] text-white" : "border-[#E7E1D3] bg-[#F6F3EC] text-[#5B5D66] hover:border-[#3F6B4F]"}`}
                          >
                            <div className="text-[10px] font-black uppercase tracking-wide">{day.slice(0, 3)}</div>
                            <div className="mt-0.5 text-xs font-bold">{count} {count === 1 ? "meal" : "meals"}</div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h3 className="text-sm font-black uppercase tracking-wider text-[#3F6B4F]">{activeMealDay}</h3>
                      <span className="text-xs font-bold text-[#5B5D66]">{visibleMealGroup?.items.length || 0} scheduled</span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {visibleMealGroup?.items.sort((a, b) => a.sort_order - b.sort_order).map((item) => {
                        const ingredients = item.food_items.split(/,|\n/).map((food) => food.trim()).filter(Boolean);
                        return (
                          <article key={item.id} className="rounded-2xl border border-[#E7E1D3] bg-[#F6F3EC] p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-[10px] font-black uppercase tracking-[0.12em] text-[#3F6B4F]">{item.meal_label}</div>
                                <h4 className="mt-1 text-base font-black text-[#14161D]">{item.meal_name || item.meal_label}</h4>
                              </div>
                              {item.calories != null && <span className="shrink-0 rounded-full bg-white px-2.5 py-1 font-mono text-[11px] font-bold text-[#5B5D66]">{item.calories} kcal</span>}
                            </div>

                            {ingredients.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-1.5">
                                {ingredients.map((ingredient, index) => <span key={`${ingredient}-${index}`} className="rounded-lg border border-[#E7E1D3] bg-white px-2 py-1 text-xs font-semibold text-[#5B5D66]">{ingredient}</span>)}
                              </div>
                            )}

                            {(item.protein_g != null || item.carbs_g != null || item.fats_g != null) && (
                              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#E7E1D3] pt-3 text-center">
                                <MacroBadge label="Protein" value={item.protein_g} />
                                <MacroBadge label="Carbs" value={item.carbs_g} />
                                <MacroBadge label="Fat" value={item.fats_g} />
                              </div>
                            )}
                            {item.notes && <p className="mt-3 text-xs leading-5 text-[#5B5D66]">{item.notes}</p>}
                          </article>
                        );
                      })}
                    </div>
                  </div>
                ) : <EmptyState icon={<Utensils size={24}/>} title="No meal plan yet" text="Once your coach prepares your meals, they will appear here."/>}
              </DashboardCard>
              <DashboardCard eyebrow="From your meal plan" title="Shopping List" subtitle="Food items assigned by your coach">
                {shoppingItems.length ? <div className="space-y-1">{shoppingItems.map((food)=><label key={food} className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2.5 text-sm transition-colors hover:bg-[#F6F3EC]"><input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-[#3F6B4F]"/><span className="font-semibold leading-5 text-[#3D4048]">{food}</span></label>)}</div> : <EmptyState icon={<ShoppingBasket size={24}/>} title="Nothing to list yet" text="Shopping items will be generated from your meal plan."/>}
              </DashboardCard>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <MetricCard title="Weight" value={latestMeasurement?.body_weight_kg != null ? `${latestMeasurement.body_weight_kg} kg` : "—"} delta={weightDelta} unit="kg" measurements={measurements} field="body_weight_kg" input={weightInput} setInput={setWeightInput}/>
              <MetricCard title="Waist" value={latestMeasurement?.waist_cm != null ? `${latestMeasurement.waist_cm} cm` : "—"} delta={waistDelta} unit="cm" measurements={measurements} field="waist_cm" input={waistInput} setInput={setWaistInput}/>
            </div>
            <div className="flex justify-end"><Button type="button" onClick={saveMeasurement} isLoading={isSavingMeasurement} className="gap-2 rounded-xl bg-[#14161D] px-5 text-white"><Plus size={16}/>Save today&apos;s measurements</Button></div>

            <DashboardCard eyebrow="Weekly" title="Progress Photos" subtitle="Front, side and back photos help your coach track visual change.">
              <div className="grid gap-3 sm:grid-cols-3">
                {(["front", "side", "back"] as const).map((viewType) => (
                  <label key={viewType} className="relative flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#E7E1D3] bg-[#F6F3EC] p-5 text-center transition-colors hover:border-[#E1472B] hover:bg-[#FBE4DE]">
                    {uploadingPhotoView === viewType ? <div className="text-sm font-black text-[#E1472B]">Uploading...</div> : <><Upload size={24} className="text-[#E1472B]" /><div className="mt-2 font-black capitalize">{viewType} photo</div><div className="mt-1 text-xs font-semibold text-[#5B5D66]">JPG, PNG or WebP · max 10 MB</div></>}
                    <input type="file" accept="image/jpeg,image/png,image/webp" disabled={Boolean(uploadingPhotoView)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-wait" onChange={(event) => { const file = event.target.files?.[0] || null; void uploadProgressPhoto(viewType, file); event.currentTarget.value = ""; }} />
                  </label>
                ))}
              </div>

              {progressPhotos.length ? (
                <div className="mt-6">
                  <div className="mb-3 text-xs font-black uppercase tracking-[0.14em] text-[#5B5D66]">Photo history</div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {progressPhotos.map((photo) => (
                      <article key={photo.id} className="overflow-hidden rounded-xl border border-[#E7E1D3] bg-[#F6F3EC]">
                        {photo.signedUrl ? <a href={photo.signedUrl} target="_blank" rel="noreferrer"><img src={photo.signedUrl} alt={`${photo.view_type} progress photo from ${photo.captured_on}`} className="aspect-[4/5] w-full object-cover" /></a> : <div className="flex aspect-[4/5] items-center justify-center text-gray-400"><Camera size={28} /></div>}
                        <div className="flex items-center justify-between gap-3 p-3"><span className="font-black capitalize">{photo.view_type}</span><span className="text-xs font-bold text-[#5B5D66]">{new Date(`${photo.captured_on}T00:00:00`).toLocaleDateString()}</span></div>
                      </article>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-5"><EmptyState icon={<ImagePlus size={25}/>} title="No progress photos yet" text="Upload front, side, and back photos to build your visual progress history."/></div>
              )}
            </DashboardCard>
          </div>
        )}

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

function MacroBadge({ label, value }: { label: string; value: number | null }) {
  return (
    <div>
      <div className="font-mono text-xs font-black text-[#14161D]">{value != null ? `${value}g` : "—"}</div>
      <div className="mt-0.5 text-[9px] font-black uppercase tracking-wide text-[#7A7C84]">{label}</div>
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
