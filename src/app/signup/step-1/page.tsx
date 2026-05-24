"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff, Lock, X } from 'lucide-react';
import { useFunnelStore } from '@/store/funnelStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';
import { getLatestPayment } from '@/lib/clientAccess';

const formSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(7, "Phone number is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

export default function Step1Page() {
  const router = useRouter();
  const store = useFunnelStore();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showLoginPassword, setShowLoginPassword] = React.useState(false);
  const [isLoginOpen, setIsLoginOpen] = React.useState(false);
  const [loginError, setLoginError] = React.useState('');
  const [accountEmail, setAccountEmail] = React.useState('');
  const [authMessage, setAuthMessage] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: store.firstName || '',
      lastName: store.lastName || '',
      email: store.email || '',
      phone: store.phone || '',
      password: '',
      confirmPassword: '',
    }
  });

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setLoginError('');
    setAuthMessage('');

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          full_name: `${data.firstName} ${data.lastName}`,
          phone: data.phone,
        },
      },
    });

    setIsSubmitting(false);

    if (authError) {
      setLoginError(authError.message);
      setAccountEmail(data.email);
      setIsLoginOpen(true);
      return;
    }

    store.setDetails({
      firstName: data.firstName,
      lastName: data.lastName,
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      phone: data.phone,
    });
    setAccountEmail(data.email);

    if (authData.session) {
      router.push('/signup/step-2');
      return;
    }

    setAuthMessage('Account created. If email confirmation is enabled in Supabase, confirm your email first, then log in to continue.');
    setIsLoginOpen(true);
  };

  const onLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setLoginError('');

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') || '').trim();
    const password = String(formData.get('password') || '');

    if (!email || !password) {
      setLoginError('Please enter your email and password.');
      setIsSubmitting(false);
      return;
    }

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setIsSubmitting(false);
      setLoginError(signInError.message);
      return;
    }

    const latestPayment = signInData.user?.id ? await getLatestPayment(signInData.user.id) : null;
    setIsSubmitting(false);
    setIsLoginOpen(false);
    router.push(latestPayment ? '/signup/success' : store.selectedPackage ? '/signup/step-2' : '/packages');
  };

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 flex flex-col items-center">
      <motion.div
        className="mt-4 w-full max-w-xl rounded-3xl border border-gray-100 bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] sm:mt-8 sm:p-8 md:p-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <div className="text-[12px] font-black uppercase tracking-[0.2em] text-[#FF0000] mb-3">Create client account</div>
          <h1 className="text-3xl sm:text-4xl font-black mb-2 font-outfit text-gray-900 tracking-tight">Set up your login</h1>
          <p className="text-gray-500 font-medium">These credentials will become your client portal login once Supabase auth is connected.</p>
        </div>

        <form id="step1-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5 pb-24">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="First Name *" placeholder="John" {...register("firstName")} error={errors.firstName?.message} />
            <Input label="Last Name *" placeholder="Doe" {...register("lastName")} error={errors.lastName?.message} />
          </div>
          <Input type="email" label="Email Address *" placeholder="john@example.com" {...register("email")} error={errors.email?.message} />
          <Input type="tel" label="WhatsApp / Phone *" placeholder="+94 77 123 4567" {...register("phone")} error={errors.phone?.message} />
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                label="Password *"
                placeholder="Minimum 8 characters"
                className="pr-12"
                {...register("password")}
                error={errors.password?.message}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-4 top-[47px] text-gray-400 transition-colors hover:text-[#FF0000]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <Input
              type={showPassword ? "text" : "password"}
              label="Confirm Password *"
              placeholder="Repeat password"
              {...register("confirmPassword")}
              error={errors.confirmPassword?.message}
            />
          </div>
        </form>
      </motion.div>

      <div className="fixed bottom-0 left-0 w-full bg-[#F9F8F4]/90 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] z-[90]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-center gap-3 sm:gap-4">
          <Button type="button" variant="secondary" onClick={() => router.back()} className="flex-1 max-w-[200px] h-14 font-bold text-[15px] bg-white hover:bg-gray-50 text-gray-700 border border-gray-200">
            Back
          </Button>
          <Button type="submit" form="step1-form" size="lg" isLoading={isSubmitting} className="flex-1 max-w-[200px] h-14 font-bold text-[15px] bg-gray-900 hover:bg-gray-800 text-white shadow-xl shadow-gray-900/10">
            Create Account
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isLoginOpen && (
          <div className="fixed left-0 top-0 z-[120] flex h-screen w-screen items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-950/45 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              className="relative my-auto max-h-[calc(100svh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl sm:p-8"
            >
              <button
                type="button"
                onClick={() => setIsLoginOpen(false)}
                className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                aria-label="Close login"
              >
                <X size={20} />
              </button>

              <div className="mb-6 pr-10">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF0000]/10 text-[#FF0000]">
                  <Lock size={22} />
                </div>
                <h2 className="text-3xl font-black tracking-tight text-gray-900">Login to continue</h2>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-gray-500">
                  Enter your email and password to open your onboarding form.
                </p>
              </div>

              {authMessage && (
                <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold leading-relaxed text-amber-700">
                  {authMessage}
                </div>
              )}

              <form onSubmit={onLogin} className="space-y-4">
                <Input
                  name="email"
                  type="email"
                  label="Email Address"
                  placeholder="you@example.com"
                  defaultValue={accountEmail || store.email}
                  autoComplete="email"
                />
                <div className="relative">
                  <Input
                    name="password"
                    type={showLoginPassword ? "text" : "password"}
                    label="Password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword((value) => !value)}
                    className="absolute bottom-4 right-4 text-gray-400 transition-colors hover:text-[#FF0000]"
                    aria-label={showLoginPassword ? "Hide password" : "Show password"}
                  >
                    {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {loginError && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-600">
                    {loginError}
                  </div>
                )}

                <Button type="submit" isLoading={isSubmitting} className="h-13 w-full bg-gray-900 text-white hover:bg-[#FF0000]">
                  Login
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
