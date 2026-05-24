"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CalendarDays, CheckCircle2, ClipboardList, Dumbbell, LogOut, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { hasVerifiedPayment } from '@/lib/clientAccess';

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
  status: 'todo' | 'in_progress' | 'done';
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

const statusLabel: Record<ClientTask['status'], string> = {
  todo: 'To do',
  in_progress: 'In progress',
  done: 'Done',
};

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tasks, setTasks] = useState<ClientTask[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [exercisePlans, setExercisePlans] = useState<ExercisePlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        router.replace('/signup/step-1');
        return;
      }

      const isPaidClient = await hasVerifiedPayment(user.id);

      if (!isPaidClient) {
        router.replace('/signup/step-2');
        return;
      }

      const [profileResult, taskResult, mealResult, exerciseResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('full_name, first_name, email')
          .eq('id', user.id)
          .maybeSingle(),
        supabase
          .from('client_tasks')
          .select('id, title, description, due_on, status')
          .eq('client_id', user.id)
          .order('due_on', { ascending: true, nullsFirst: false }),
        supabase
          .from('meal_plans')
          .select('id, title, notes, starts_on, ends_on, meal_plan_items(id, day_label, meal_label, food_items, calories, protein_g, notes, sort_order)')
          .eq('client_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false }),
        supabase
          .from('exercise_plans')
          .select('id, title, notes, exercise_plan_items(id, day_label, exercise_name, sets, reps, notes, sort_order)')
          .eq('client_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false }),
      ]);

      setProfile(profileResult.data || { full_name: null, first_name: null, email: user.email || null });
      setTasks((taskResult.data || []) as ClientTask[]);
      setMealPlans((mealResult.data || []) as MealPlan[]);
      setExercisePlans((exerciseResult.data || []) as ExercisePlan[]);
      setIsLoading(false);
    };

    loadDashboard();
  }, [router]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100svh-64px)] items-center justify-center px-4">
        <div className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Loading dashboard</div>
      </div>
    );
  }

  const displayName = profile?.first_name || profile?.full_name || 'Client';

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
              Your assigned tasks, meal plan, and training work will appear here after your coach updates your programme.
            </p>
          </div>
          <Button type="button" variant="secondary" onClick={signOut} className="h-12 gap-2 rounded-full px-5">
            <LogOut size={16} />
            Sign out
          </Button>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#FF0000]/10 text-[#FF0000]">
              <ClipboardList size={20} />
            </div>
            <div className="text-2xl font-black text-gray-900">{tasks.length}</div>
            <div className="text-sm font-bold text-gray-500">Assigned tasks</div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Utensils size={20} />
            </div>
            <div className="text-2xl font-black text-gray-900">{mealPlans.length}</div>
            <div className="text-sm font-bold text-gray-500">Active meal plans</div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-700">
              <Dumbbell size={20} />
            </div>
            <div className="text-2xl font-black text-gray-900">{exercisePlans.length}</div>
            <div className="text-sm font-bold text-gray-500">Exercise plans</div>
          </div>
        </div>

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
                                <div className="text-xs font-bold text-gray-500">{item.day_label || 'Daily'}</div>
                              </div>
                              <p className="mt-1 text-sm font-semibold leading-relaxed text-gray-600">{item.food_items}</p>
                              {(item.calories || item.protein_g) && (
                                <div className="mt-2 text-xs font-black text-[#FF0000]">
                                  {item.calories ? `${item.calories} kcal` : ''}{item.calories && item.protein_g ? ' | ' : ''}{item.protein_g ? `${item.protein_g}g protein` : ''}
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
                                {[item.day_label, item.sets, item.reps].filter(Boolean).join(' | ') || 'Details pending'}
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
      </motion.div>
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
