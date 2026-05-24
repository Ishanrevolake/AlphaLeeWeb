"use client";

import type React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ChevronDown, Eye, EyeOff, LayoutDashboard, Lock, LogIn, LogOut, Menu, UserCircle, X } from "lucide-react";
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
    { href: "/packages", label: "Find a Programme" },
    { href: "/process-details", label: "Process Details" },
    { href: "/recipe-book", label: "Alpha Chef Recipe Book" },
    { href: "/blog", label: "Fitness Blog" }
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
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#F9F8F4]/80 border-b border-gray-200/50 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 md:h-[76px] flex items-center justify-between">
        <Link href="/" className="font-black text-xl sm:text-2xl tracking-tighter hover:text-gray-600 transition-colors" onClick={() => setIsOpen(false)}>
          ALPHA LEE
        </Link>
        <nav className="hidden lg:flex items-center space-x-1 font-semibold text-[12px] xl:text-[14px] xl:space-x-2 tracking-wide">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href} 
                className={`transition-all duration-200 whitespace-nowrap px-3 py-1.5 rounded-lg ${isActive ? 'text-[#FF0000] bg-red-500/10 font-bold' : 'text-gray-500 hover:text-[#FF0000] hover:bg-gray-100'}`}
              >
                {link.label}
              </Link>
            );
          })}
          
          <div className="relative group">
            <button className={`flex items-center gap-1 transition-all duration-200 whitespace-nowrap px-3 py-1.5 rounded-lg ${(pathname === "/testimonials" || pathname === "/about") ? 'text-[#FF0000] bg-red-500/10 font-bold' : 'text-gray-500 hover:text-[#FF0000] hover:bg-gray-100'}`}>
              More <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
            </button>
            <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-200 z-50">
              <div className="w-40 bg-white border border-gray-100 shadow-xl rounded-xl py-2 flex flex-col">
                <Link href="/testimonials" className={`px-4 py-2 text-[13px] hover:bg-gray-50 transition-colors ${pathname === '/testimonials' ? 'text-[#FF0000] font-bold' : 'text-gray-600 hover:text-[#FF0000]'}`}>
                  Testimonials
                </Link>
                <Link href="/about" className={`px-4 py-2 text-[13px] hover:bg-gray-50 transition-colors ${pathname === '/about' ? 'text-[#FF0000] font-bold' : 'text-gray-600 hover:text-[#FF0000]'}`}>
                  About Us
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="flex items-center gap-2">
          {userId ? (
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setIsProfileOpen((open) => !open)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white transition-colors hover:bg-[#FF0000]"
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
              className="hidden sm:inline-flex h-10 items-center gap-2 rounded-full bg-gray-900 px-4 text-[13px] font-black text-white transition-colors hover:bg-[#FF0000]"
            >
              <LogIn size={16} />
              Login
            </button>
          )}

          <button
            type="button"
            className="lg:hidden h-10 w-10 rounded-full border border-gray-200 bg-white/80 flex items-center justify-center text-gray-800"
            onClick={() => setIsOpen((open) => !open)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <nav className="lg:hidden border-t border-gray-200/70 bg-[#F9F8F4]/95 px-4 py-4 shadow-lg max-h-[calc(100svh-4rem)] overflow-y-auto">
          <div className="flex flex-col gap-2 font-bold text-sm">
            {[...links, { href: "/testimonials", label: "Testimonials" }, { href: "/about", label: "About Us" }].map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`rounded-2xl px-4 py-3 transition-colors ${isActive ? "bg-red-500/10 text-[#FF0000]" : "bg-white/70 text-gray-700 hover:text-[#FF0000]"}`}
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
                  className="flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-3 text-left font-black text-gray-700 transition-colors hover:text-[#FF0000] disabled:cursor-wait disabled:opacity-60"
                >
                  <LayoutDashboard size={18} />
                  {isCheckingDashboard ? "Checking..." : "Go to Dashboard"}
                </button>
                <button
                  type="button"
                  onClick={signOut}
                  className="flex items-center gap-3 rounded-2xl bg-gray-900 px-4 py-3 text-left font-black text-white transition-colors hover:bg-[#FF0000]"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={openLogin}
                className="rounded-2xl bg-gray-900 px-4 py-3 text-left font-black text-white transition-colors hover:bg-[#FF0000]"
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
