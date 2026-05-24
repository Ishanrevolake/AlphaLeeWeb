"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { useFunnelStore } from '@/store/funnelStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';
import { getLatestPayment } from '@/lib/clientAccess';
import { getPackageById } from '@/lib/packages';

const requiredString = (message: string) =>
  z.string({ error: message }).trim().min(1, message);

const formSchema = z.object({
  age: requiredString("Age is required"),
  gender: requiredString("Please select your gender"),
  height: requiredString("Height is required"),
  weight: requiredString("Current weight is required"),
  goalWeight: requiredString("Goal weight is required"),
  experienceLevel: requiredString("Please select your training experience"),
  workoutLocation: requiredString("Please select your training setup"),
  workoutDays: requiredString("Please select your training days"),
  dietPreference: requiredString("Please select your dietary preference"),
  allergies: z.string().optional(),
  injuries: z.string().optional(),
  primaryGoal: requiredString("Please select your main goal"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const sectionTitleClass = "text-xl sm:text-2xl font-black tracking-tight text-gray-900";
const selectClass = "w-full rounded-2xl border border-gray-200 bg-white px-4 py-4 font-bold text-gray-900 shadow-sm outline-none transition focus:border-[#FF0000] focus:ring-2 focus:ring-primary/20";

function FieldSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-gray-100 bg-[#F9F8F4] p-5 sm:p-6">
      <h2 className={sectionTitleClass}>{title}</h2>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

const SelectField = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string }
>(({ label, error, children, ...props }, ref) => {
  return (
    <div className="flex flex-col space-y-2 w-full">
      <label className="text-sm font-bold text-gray-900 ml-1 tracking-tight">{label}</label>
      <select ref={ref} className={`${selectClass} ${error ? 'border-red-500' : ''}`} {...props}>
        {children}
      </select>
      {error && <span className="text-sm text-red-500 font-medium ml-1">{error}</span>}
    </div>
  );
});

SelectField.displayName = 'SelectField';

export default function Step2Page() {
  const router = useRouter();
  const store = useFunnelStore();
  const [mounted, setMounted] = React.useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = React.useState(true);
  const [packageMessage, setPackageMessage] = React.useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: store.age || '',
      gender: store.gender || '',
      height: store.height || '',
      weight: store.weight || '',
      goalWeight: store.goalWeight || '',
      experienceLevel: store.experienceLevel || '',
      workoutLocation: store.workoutLocation || '',
      workoutDays: store.workoutDays || '',
      dietPreference: store.dietPreference || '',
      allergies: store.allergies || '',
      injuries: store.injuries || '',
      primaryGoal: store.primaryGoal || '',
      notes: store.notes || '',
    }
  });

  useEffect(() => {
    const prepareForm = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        router.push('/signup/step-1');
        return;
      }

      const latestPayment = await getLatestPayment(user.id);

      if (latestPayment) {
        router.push('/signup/success');
        return;
      }

      if (!store.firstName || !store.email) {
        const metadata = user.user_metadata || {};
        const firstName = String(metadata.first_name || '');
        const lastName = String(metadata.last_name || '');

        store.setDetails({
          firstName,
          lastName,
          name: String(metadata.full_name || `${firstName} ${lastName}`.trim()),
          email: user.email || '',
          phone: String(metadata.phone || ''),
        });
      }

      const { data: latestOnboarding } = await supabase
        .from('onboarding_submissions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestOnboarding) {
        reset({
          age: latestOnboarding.age ? String(latestOnboarding.age) : store.age,
          gender: latestOnboarding.gender || store.gender,
          height: latestOnboarding.height_cm ? String(latestOnboarding.height_cm) : store.height,
          weight: latestOnboarding.current_weight_kg ? String(latestOnboarding.current_weight_kg) : store.weight,
          goalWeight: latestOnboarding.goal_weight_kg ? String(latestOnboarding.goal_weight_kg) : store.goalWeight,
          experienceLevel: latestOnboarding.experience_level || store.experienceLevel,
          workoutLocation: latestOnboarding.workout_location || store.workoutLocation,
          workoutDays: latestOnboarding.workout_days || store.workoutDays,
          dietPreference: latestOnboarding.diet_preference || store.dietPreference,
          allergies: latestOnboarding.allergies || store.allergies,
          injuries: latestOnboarding.injuries || store.injuries,
          primaryGoal: latestOnboarding.primary_goal || store.primaryGoal,
          notes: latestOnboarding.notes || store.notes,
        });
      }

      setMounted(true);
      setIsCheckingAccess(false);
    };

    prepareForm();
  }, [router, reset, store]);

  if (!mounted || isCheckingAccess) return null;

  const onSubmit = (data: FormValues) => {
    store.setDetails(data);
    if (!store.selectedPackage) {
      setPackageMessage('Please choose a package first so we can calculate your payment details.');
      return;
    }
    router.push('/signup/step-3');
  };

  const selectedPackage = getPackageById(store.selectedPackage);

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 flex flex-col items-center">
      <motion.div
        className="mt-4 w-full max-w-3xl rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:mt-8 sm:p-8 md:p-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8 text-center sm:text-left">
          <div className="text-[12px] font-black uppercase tracking-[0.2em] text-[#FF0000] mb-3">Client intake</div>
          <h1 className="text-3xl sm:text-4xl font-black mb-2 font-outfit text-gray-900 tracking-tight">Tell Us About You</h1>
          <p className="text-gray-600 font-medium">This helps us build your personalised plan from day one.</p>
        </div>

        <div className="mb-6 rounded-3xl border border-gray-100 bg-[#F9F8F4] p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-[12px] font-black uppercase tracking-[0.18em] text-gray-400">Selected package</div>
              <div className="mt-1 text-lg font-black text-gray-900">
                {selectedPackage ? selectedPackage.title : 'No package selected'}
              </div>
              {selectedPackage && (
                <div className="mt-1 text-sm font-semibold text-gray-500">
                  {selectedPackage.subtitle} | {selectedPackage.price}
                </div>
              )}
            </div>
            <Button type="button" variant="secondary" onClick={() => router.push('/packages')} className="h-12 rounded-full px-5">
              {selectedPackage ? 'Change Package' : 'Choose Package'}
            </Button>
          </div>
          {packageMessage && (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold leading-relaxed text-amber-700">
              {packageMessage}
            </div>
          )}
        </div>

        <form id="step2-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-24">
          <FieldSection title="Physical Stats">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input type="number" label="Age *" placeholder="28" {...register("age")} error={errors.age?.message} />
              <SelectField label="Gender *" {...register("gender")} error={errors.gender?.message}>
                <option value="">Select...</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </SelectField>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input type="number" label="Height (cm) *" placeholder="175" {...register("height")} error={errors.height?.message} />
              <Input type="number" label="Current Weight (kg) *" placeholder="80" {...register("weight")} error={errors.weight?.message} />
            </div>
            <Input type="number" label="Goal Weight (kg) *" placeholder="72" {...register("goalWeight")} error={errors.goalWeight?.message} />
          </FieldSection>

          <FieldSection title="Training Background">
            <SelectField label="Training Experience *" {...register("experienceLevel")} error={errors.experienceLevel?.message}>
              <option value="">Select...</option>
              <option>Beginner (0-1 year)</option>
              <option>Intermediate (1-3 years)</option>
              <option>Advanced (3+ years)</option>
            </SelectField>
            <SelectField label="Gym or Home? *" {...register("workoutLocation")} error={errors.workoutLocation?.message}>
              <option value="">Select...</option>
              <option>Commercial Gym</option>
              <option>Home Setup</option>
              <option>No Equipment</option>
            </SelectField>
            <SelectField label="Training Days Per Week *" {...register("workoutDays")} error={errors.workoutDays?.message}>
              <option value="">Select...</option>
              <option>3 days</option>
              <option>4 days</option>
              <option>5 days</option>
              <option>6 days</option>
            </SelectField>
          </FieldSection>

          <FieldSection title="Nutrition & Health">
            <SelectField label="Dietary Preference *" {...register("dietPreference")} error={errors.dietPreference?.message}>
              <option value="">Select...</option>
              <option>No restrictions</option>
              <option>Vegetarian</option>
              <option>Vegan</option>
              <option>Gluten-free</option>
              <option>Other</option>
            </SelectField>
            <Input label="Food Allergies / Intolerances" placeholder="e.g. lactose, nuts (leave blank if none)" {...register("allergies")} />
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900 ml-1 tracking-tight">Injuries or Medical Conditions</label>
              <textarea
                rows={4}
                placeholder="Describe any injuries, conditions, or areas to avoid..."
                className="w-full px-4 py-4 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 bg-white placeholder:text-gray-400 font-medium border-gray-200 shadow-sm focus:shadow-md"
                {...register("injuries")}
              />
            </div>
          </FieldSection>

          <FieldSection title="Your Primary Goal">
            <SelectField label="Main Goal *" {...register("primaryGoal")} error={errors.primaryGoal?.message}>
              <option value="">Select...</option>
              <option>Lose Fat</option>
              <option>Build Muscle</option>
              <option>Body Recomposition</option>
              <option>Improve Fitness</option>
              <option>Strength Gains</option>
            </SelectField>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900 ml-1 tracking-tight">Additional Notes for Your Trainer</label>
              <textarea
                rows={4}
                placeholder="Anything else you'd like Alpha Lee to know..."
                className="w-full px-4 py-4 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 bg-white placeholder:text-gray-400 font-medium border-gray-200 shadow-sm focus:shadow-md"
                {...register("notes")}
              />
            </div>
          </FieldSection>
        </form>
      </motion.div>

      <div className="fixed bottom-0 left-0 w-full bg-[#F9F8F4]/90 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] z-[90]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-center gap-3 sm:gap-4">
          <Button type="button" variant="secondary" onClick={() => router.push('/signup/step-1')} className="flex-1 max-w-[200px] h-14 font-bold text-[15px] bg-white hover:bg-gray-50 text-gray-700 border border-gray-200">
            Back
          </Button>
          <Button type="submit" form="step2-form" size="lg" className="flex-1 max-w-[220px] h-14 font-bold text-[15px] bg-gray-900 hover:bg-gray-800 text-white shadow-xl shadow-gray-900/10">
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
