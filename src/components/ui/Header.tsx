"use client";

import type React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Eye, EyeOff, LayoutDashboard, Lock, LogIn, LogOut, Menu, UserCircle, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { supabase } from "@/lib/supabase";
import { getLatestPayment } from "@/lib/clientAccess";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCheckingDashboard, setIsCheckingDashboard] = useState(false);
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);

  const links = [
    { href: "/process-details", label: "Process Details" },
    { href: "/recipe-book", label: "Recipe Book" },
    { href: "/blog", label: "Blog" },
    { href: "/testimonials", label: "Testimonials" },
    { href: "/about", label: "About Us" }
  ];

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (isMounted) {
        setUserId(data.user?.id || null);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
      setIsProfileOpen(false);
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const openLogin = () => {
    setIsOpen(false);
    setIsProfileOpen(false);
    setLoginMessage("");
    setIsLoginOpen(true);
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoggingIn(true);
    setLoginMessage("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    if (!email || !password) {
      setLoginMessage("Please enter your email and password.");
      setIsLoggingIn(false);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setIsLoggingIn(false);
      setLoginMessage(error.message);
      return;
    }

    const userId = data.user?.id;
    const latestPayment = userId ? await getLatestPayment(userId) : null;
    setIsLoggingIn(false);
    setIsLoginOpen(false);
    setUserId(userId || null);
    router.push(latestPayment ? "/signup/success" : "/packages");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserId(null);
    setIsProfileOpen(false);
    setIsOpen(false);
    router.push("/");
  };

  const goToDashboard = async () => {
    if (!userId) {
      openLogin();
      return;
    }

    setIsCheckingDashboard(true);
    const latestPayment = await getLatestPayment(userId);
    setIsCheckingDashboard(false);
    setIsProfileOpen(false);
    setIsOpen(false);

    if (latestPayment?.status === "verified") {
      router.push("/dashboard");
      return;
    }

    setIsPendingModalOpen(true);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-black text-white border-b border-white/10 shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 md:h-[76px] flex items-center justify-between">
        <Link href="/" className="font-black text-xl sm:text-2xl tracking-tighter text-white hover:text-gray-300 transition-colors" onClick={() => setIsOpen(false)}>
          ALPHA LEE
        </Link>
        <nav className="hidden lg:flex items-center space-x-1 font-semibold text-[12px] xl:text-[14px] xl:space-x-2 tracking-wide">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href} 
                className={`transition-all duration-200 whitespace-nowrap px-3 py-1.5 rounded-lg ${isActive ? 'text-[#FF0000] bg-red-500/15 font-bold' : 'text-white/75 hover:text-white hover:bg-white/10'}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {userId ? (
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setIsProfileOpen((open) => !open)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-900 transition-colors hover:bg-[#FF0000] hover:text-white"
                aria-label="Open profile menu"
                aria-expanded={isProfileOpen}
              >
                <UserCircle size={22} />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    className="absolute right-0 top-full z-50 mt-3 w-56 overflow-hidden rounded-2xl border border-gray-100 bg-white py-2 shadow-xl"
                  >
                    <button
                      type="button"
                      onClick={goToDashboard}
                      disabled={isCheckingDashboard}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-black text-gray-700 transition-colors hover:bg-gray-50 hover:text-[#FF0000] disabled:cursor-wait disabled:opacity-60"
                    >
                      <LayoutDashboard size={17} />
                      {isCheckingDashboard ? "Checking..." : "Go to Dashboard"}
                    </button>
                    <button
                      type="button"
                      onClick={signOut}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-black text-gray-700 transition-colors hover:bg-gray-50 hover:text-[#FF0000]"
                    >
                      <LogOut size={17} />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              type="button"
              onClick={openLogin}
              className="hidden sm:inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-[13px] font-black text-gray-900 transition-colors hover:bg-[#FF0000] hover:text-white"
            >
              <LogIn size={16} />
              Login
            </button>
          )}

          <button
            type="button"
            className="lg:hidden h-10 w-10 rounded-full border border-white/20 bg-white/10 flex items-center justify-center text-white"
            onClick={() => setIsOpen((open) => !open)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <nav className="lg:hidden border-t border-white/10 bg-black px-4 py-4 shadow-lg max-h-[calc(100svh-4rem)] overflow-y-auto">
          <div className="flex flex-col gap-2 font-bold text-sm">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`rounded-2xl px-4 py-3 transition-colors ${isActive ? "bg-red-500/15 text-[#FF0000]" : "bg-white/10 text-white hover:bg-white/15 hover:text-white"}`}
                >
                  {link.label}
                </Link>
              );
            })}
            {userId ? (
              <>
                <button
                  type="button"
                  onClick={goToDashboard}
                  disabled={isCheckingDashboard}
                  className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-left font-black text-white transition-colors hover:bg-white/15 disabled:cursor-wait disabled:opacity-60"
                >
                  <LayoutDashboard size={18} />
                  {isCheckingDashboard ? "Checking..." : "Go to Dashboard"}
                </button>
                <button
                  type="button"
                  onClick={signOut}
                  className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-left font-black text-gray-900 transition-colors hover:bg-[#FF0000] hover:text-white"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={openLogin}
                className="rounded-2xl bg-white px-4 py-3 text-left font-black text-gray-900 transition-colors hover:bg-[#FF0000] hover:text-white"
              >
                Login
              </button>
            )}
          </div>
        </nav>
      )}

      <AnimatePresence>
        {isLoginOpen && (
          <div className="fixed left-0 top-0 z-[120] flex h-screen w-screen items-center justify-center p-4">
            <motion.button
              type="button"
              aria-label="Close login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLoginOpen(false)}
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
                <h2 className="text-3xl font-black tracking-tight text-gray-900">Client Login</h2>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-gray-500">
                  Access your coaching portal after your account is approved.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <Input name="email" type="email" label="Email Address" placeholder="you@example.com" autoComplete="email" />
                <div className="relative">
                  <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    label="Password"
                    placeholder="Enter your password"
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

                {loginMessage && (
                  <div className="rounded-2xl border border-[#FF0000]/20 bg-[#FF0000]/5 p-4 text-sm font-bold leading-relaxed text-gray-700">
                    {loginMessage}
                  </div>
                )}

                <Button type="submit" isLoading={isLoggingIn} className="h-13 w-full bg-gray-900 text-white hover:bg-[#FF0000]">
                  Login
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPendingModalOpen && (
          <div className="fixed left-0 top-0 z-[130] flex h-screen w-screen items-center justify-center p-4">
            <motion.button
              type="button"
              aria-label="Close payment status message"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPendingModalOpen(false)}
              className="absolute inset-0 bg-gray-950/45 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              className="relative w-full max-w-md rounded-3xl border border-gray-100 bg-white p-6 text-center shadow-2xl sm:p-8"
            >
              <button
                type="button"
                onClick={() => setIsPendingModalOpen(false)}
                className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                aria-label="Close"
              >
                <X size={20} />
              </button>

              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <AlertCircle size={28} />
              </div>
              <h2 className="pr-8 text-2xl font-black tracking-tight text-gray-900 sm:pr-0">Payment Approval Pending</h2>
              <p className="mt-3 text-sm font-semibold leading-relaxed text-gray-500">
                Your payment slip is still under review. Please wait until Alpha Lee approves your payment before opening the dashboard.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button type="button" variant="secondary" onClick={() => setIsPendingModalOpen(false)} className="h-12 flex-1 rounded-full">
                  Close
                </Button>
                <Button type="button" onClick={() => router.push("/signup/success")} className="h-12 flex-1 rounded-full bg-gray-900 text-white hover:bg-[#FF0000]">
                  View Status
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
