"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Dumbbell, Utensils, MessageCircle, FileVideo, ShieldCheck } from "lucide-react";
import Image from "next/image";
import T1 from "@/Testimonials/T1.png";
import T2 from "@/Testimonials/T2.png";
import T3 from "@/Testimonials/T3.png";
import T4 from "@/Testimonials/T4.png";
import T5 from "@/Testimonials/T5.png";
import T6 from "@/Testimonials/T6.png";

import { InterestForm } from "@/components/InterestForm";

export default function LandingPage() {
  const router = useRouter();
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const testimonials = [T1, T2, T3, T4, T5, T6];

  return (
    <div className="flex flex-col flex-1 bg-white">
      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:py-32 overflow-hidden bg-gray-900 text-white flex items-center justify-center min-h-[80vh]">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-600 via-gray-900 to-black pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.h1 
            className="text-6xl lg:text-8xl font-black mb-6 tracking-tighter font-outfit leading-tight"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            A Reliable Guide To Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-[#FF0000] to-red-700">Transformation</span>
          </motion.h1>
          <motion.p 
            className="text-xl lg:text-3xl text-gray-300 mb-10 max-w-3xl mx-auto font-medium"
            {...fadeIn}
          >
            We provide time-efficient workout plans and a variety of meal options for Sri Lankans living around the world.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button onClick={() => router.push("/packages")} size="lg" className="text-lg py-4 px-8 shadow-2xl shadow-primary/40 rounded-full font-black">
              View Rates & Details
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Marquee Section */}
      <section className="py-16 bg-gray-100 border-y border-gray-200 overflow-hidden relative">
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-gray-100 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-gray-100 to-transparent z-10 pointer-events-none" />
        
        <div className="mb-10 text-center px-6">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 font-outfit tracking-tight">
            Real Results from <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">Real People</span>
          </h2>
        </div>
        
        <div className="flex overflow-x-hidden scrolling-wrapper">
          <div className="py-8 scrolling-marquee flex gap-8 w-max pl-4">
            {[...testimonials, ...testimonials].map((img, idx) => (
              <div 
                key={idx} 
                className="relative w-[280px] md:w-[350px] aspect-[4/5] flex-none overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.15)]"
              >
                <Image 
                  src={img} 
                  alt={`Client Transformation ${idx + 1}`} 
                  fill 
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 280px, 350px"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-6 bg-[#F9F8F4]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-gray-900 font-outfit tracking-tight">How It Works</h2>
            <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto text-center">
              Our packages include regular check-ins to modify the plan for continuous progress, ensuring your results truly last.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Customized Workouts", desc: "Training plan personalized to your fitness capacity, gym environment, or home setup.", icon: Dumbbell },
              { title: "Personalized Menus", desc: "Meal plans customized to your goals with options tailored to your local constraints and preferences.", icon: Utensils },
              { title: "Form Review", desc: "Upload physical assessment videos and training clips so we can correct your technique and adjust volume.", icon: FileVideo },
              { title: "Whatsapp Support", desc: "Get answers quickly with guaranteed reply windows directly through WhatsApp voice notes or texts.", icon: MessageCircle },
              { title: "Ongoing Adjustments", desc: "We review your weekly logging stats and check-ins to continuously fine-tune your programming.", icon: ShieldCheck }
            ].map((benefit, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white p-10 rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.03)] border-2 border-transparent hover:border-[#FF0000]/20 transition-all duration-500 group"
              >
                <div className="h-16 w-16 bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-2xl flex items-center justify-center mb-8 text-[#FF0000] group-hover:scale-110 transition-transform duration-500">
                  <benefit.icon size={32} strokeWidth={2} />
                </div>
                <h3 className="text-2xl font-black mb-4 font-outfit tracking-tight text-gray-900">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed font-medium text-[16px]">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interest Form Section */}
      <InterestForm />

      {/* Sticky Mobile CTA Background Spacer */}
      <div className="h-24 md:h-0"></div>

      {/* Sticky CTA (Mobile mostly) */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-white/90 backdrop-blur-md border-t border-gray-200 md:hidden z-50">
        <Button onClick={() => router.push("/packages")} size="lg" className="w-full text-lg shadow-xl shadow-primary/30">
          Find a Programme
        </Button>
      </div>
    </div>
  );
}
