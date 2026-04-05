"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Dumbbell, Activity, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="flex flex-col flex-1 bg-white">
      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:py-32 overflow-hidden bg-gray-900 text-white flex items-center justify-center min-h-[80vh]">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-dark via-gray-900 to-black pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.h1 
            className="text-5xl lg:text-7xl font-black mb-6 tracking-tight font-outfit"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Train with <span className="text-primary">Alpha Lee</span>
          </motion.h1>
          <motion.p 
            className="text-xl lg:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto font-medium"
            {...fadeIn}
          >
            Stop guessing. Start transforming. Join the elite coaching program designed to shatter your limits and build your best physique.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button onClick={() => router.push("/packages")} size="lg" className="text-lg py-5 px-10 shadow-2xl shadow-primary/40 rounded-full font-black">
              Start Your Transformation
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4 text-gray-900 font-outfit">Why Choose Alpha Lee?</h2>
            <p className="text-xl text-gray-600 font-medium">Everything you need to succeed, nothing you don&apos;t.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Customized Workouts", desc: "Tailored to your specific goals, body type, and schedule. No cookie-cutter plans.", icon: Dumbbell },
              { title: "Nutrition Mastery", desc: "Flexible dieting protocols that allow you to eat foods you love while shedding fat.", icon: Activity },
              { title: "24/7 Accountability", desc: "Weekly check-ins and direct access to ensure you're always on track.", icon: ShieldCheck }
            ].map((benefit, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary">
                  <benefit.icon size={28} strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed font-medium">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* Sticky Mobile CTA Background Spacer */}
      <div className="h-24 md:h-0"></div>

      {/* Sticky CTA (Mobile mostly) */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-white/90 backdrop-blur-md border-t border-gray-200 md:hidden z-50">
        <Button onClick={() => router.push("/packages")} size="lg" className="w-full text-lg shadow-xl shadow-primary/30">
          Start Now
        </Button>
      </div>
    </div>
  );
}
