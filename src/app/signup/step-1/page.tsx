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
import { ProgressBar } from '@/components/ui/ProgressBar';

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  gender: z.string().min(1, "Please select an option"),
  experienceLevel: z.string().min(1, "Please select an option"),
  activityLevel: z.string().min(1, "Please select an option"),
  workoutLocation: z.string().min(1, "Please select an option"),
  workoutDays: z.string().min(1, "Please select an option"),
});

type FormValues = z.infer<typeof formSchema>;

const RadioCard = ({ label, value, selectedValue, onChange, description }: { 
  label: string, value: string, selectedValue: string, onChange: (val: string) => void, description?: string 
}) => {
  const isSelected = selectedValue === value;
  return (
    <div 
      onClick={() => onChange(value)}
      className={`cursor-pointer border-2 rounded-xl p-4 transition-all duration-200 flex items-center ${
        isSelected ? 'border-[#cca751] bg-[#cca751]/5 shadow-sm' : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
    >
      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center mr-4 shrink-0 transition-colors ${
        isSelected ? 'border-[#cca751]' : 'border-gray-300 bg-white'
      }`}>
        {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-[#cca751]" />}
      </div>
      <div>
        <div className={`font-semibold ${isSelected ? 'text-[#cca751]' : 'text-gray-900'}`}>{label}</div>
        {description && <div className="text-gray-500 text-sm mt-0.5 leading-tight">{description}</div>}
      </div>
    </div>
  );
};

export default function Step1Page() {
  const router = useRouter();
  const store = useFunnelStore();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { 
      name: store.name || '', 
      email: store.email || '',
      gender: store.gender || '',
      experienceLevel: store.experienceLevel || '',
      activityLevel: store.activityLevel || '',
      workoutLocation: store.workoutLocation || '',
      workoutDays: store.workoutDays || ''
    }
  });

  const gender = watch('gender');
  const expLevel = watch('experienceLevel');
  const actLevel = watch('activityLevel');
  const workLoc = watch('workoutLocation');
  const workDays = watch('workoutDays');

  const [mounted, setMounted] = React.useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const onSubmit = (data: FormValues) => {
    store.setDetails({
      name: data.name,
      email: data.email,
      gender: data.gender,
      experienceLevel: data.experienceLevel,
      activityLevel: data.activityLevel,
      workoutLocation: data.workoutLocation,
      workoutDays: data.workoutDays
    });
    router.push('/signup/step-2');
  };

  return (
    <div className="min-h-screen py-12 px-6 flex flex-col items-center">
      <div className="w-full max-w-xl mx-auto mb-10 mt-8">
        <ProgressBar currentStep={1} totalSteps={3} />
      </div>
      
      <motion.div 
        className="bg-white p-8 md:p-10 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-100 w-full max-w-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-black mb-2 font-outfit text-gray-900 tracking-tight">Let&apos;s get to know you</h1>
        <p className="text-gray-500 mb-8 font-medium">We&apos;ll use this to customize your transformation plan.</p>

        <form id="step1-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-24">
          <div className="space-y-4">
            <Input label="Full Name *" placeholder="John Doe" {...register("name")} error={errors.name?.message} />
            <Input type="email" label="Email Address *" placeholder="john@example.com" {...register("email")} error={errors.email?.message} />
          </div>
          
          <div className="pt-4 border-t border-gray-100">
            <label className="block text-[15px] font-bold text-gray-900 mb-3">Gender *</label>
            <div className="grid grid-cols-2 gap-3">
              <RadioCard label="Male" value="Male" selectedValue={gender} onChange={(v) => setValue('gender', v, {shouldValidate: true})} />
              <RadioCard label="Female" value="Female" selectedValue={gender} onChange={(v) => setValue('gender', v, {shouldValidate: true})} />
            </div>
            {errors.gender && <span className="text-sm text-red-500 mt-1">{errors.gender.message}</span>}
          </div>

          <div>
            <label className="block text-[15px] font-bold text-gray-900 mb-3">Training experience level *</label>
            <div className="space-y-3">
              <RadioCard label="Beginner" value="Beginner" selectedValue={expLevel} onChange={(v) => setValue('experienceLevel', v, {shouldValidate: true})} />
              <RadioCard label="Intermediate" value="Intermediate" selectedValue={expLevel} onChange={(v) => setValue('experienceLevel', v, {shouldValidate: true})} />
              <RadioCard label="Advanced" value="Advanced" selectedValue={expLevel} onChange={(v) => setValue('experienceLevel', v, {shouldValidate: true})} />
            </div>
            {errors.experienceLevel && <span className="text-sm text-red-500 mt-1">{errors.experienceLevel.message}</span>}
          </div>

          <div>
            <label className="block text-[15px] font-bold text-gray-900 mb-3">Current activity level *</label>
            <div className="space-y-3">
              <RadioCard label="Light" description="(desk job)" value="Light" selectedValue={actLevel} onChange={(v) => setValue('activityLevel', v, {shouldValidate: true})} />
              <RadioCard label="Moderate" description="(travelling salesman, teacher etc)" value="Moderate" selectedValue={actLevel} onChange={(v) => setValue('activityLevel', v, {shouldValidate: true})} />
              <RadioCard label="High" description="(e.g; Mechanic, construction worker)" value="High" selectedValue={actLevel} onChange={(v) => setValue('activityLevel', v, {shouldValidate: true})} />
            </div>
            {errors.activityLevel && <span className="text-sm text-red-500 mt-1">{errors.activityLevel.message}</span>}
          </div>

          <div>
            <label className="block text-[15px] font-bold text-gray-900 mb-3">Where will you be working out? *</label>
            <div className="space-y-3">
              <RadioCard label="Gym" value="Gym" selectedValue={workLoc} onChange={(v) => setValue('workoutLocation', v, {shouldValidate: true})} />
              <RadioCard label="Home" description="(whatsapp me pics of ur training equipment, if any)" value="Home" selectedValue={workLoc} onChange={(v) => setValue('workoutLocation', v, {shouldValidate: true})} />
            </div>
            {errors.workoutLocation && <span className="text-sm text-red-500 mt-1">{errors.workoutLocation.message}</span>}
          </div>

          <div>
            <label className="block text-[15px] font-bold text-gray-900 mb-3">How many days a week can you workout? *</label>
            <div className="grid grid-cols-5 gap-2">
              {['2', '3', '4', '5', '6'].map((day) => (
                <div 
                  key={day}
                  onClick={() => setValue('workoutDays', day, {shouldValidate: true})}
                  className={`cursor-pointer border-2 rounded-xl py-3 text-center transition-all duration-200 font-bold ${
                    workDays === day ? 'border-[#cca751] bg-[#cca751] text-white shadow-md' : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>
            {errors.workoutDays && <span className="text-sm text-red-500 mt-1">{errors.workoutDays.message}</span>}
          </div>
        </form>
      </motion.div>
      
      {/* Positioned Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-[#F9F8F4]/90 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] z-[90]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-center gap-4">
          <Button type="button" variant="secondary" onClick={() => router.back()} className="flex-1 max-w-[200px] h-14 font-bold text-[15px] bg-white hover:bg-gray-50 text-gray-700 border border-gray-200">
            Back
          </Button>
          <Button type="submit" form="step1-form" size="lg" className="flex-1 max-w-[200px] h-14 font-bold text-[15px] bg-gray-900 hover:bg-gray-800 text-white shadow-xl shadow-gray-900/10">
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
