"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Dumbbell, Utensils, MessageCircle, FileVideo, ShieldCheck } from "lucide-react";
import Image from "next/image";
import bgNew1 from "@/assets/bgnew1.png";

import { InterestForm } from "@/components/InterestForm";
import { TransformationGallery } from "@/components/TransformationGallery";

export default function LandingPage() {
  const router = useRouter();
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const latestYoutubeVideo = {
    title: "Latest Coaching Video",
    embedUrl: "https://www.youtube.com/embed/videoseries?list=UUqWnR5ZcahbpQq78szOwnpA"
  };

  return (
    <div className="flex flex-col flex-1 bg-white">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 py-16 sm:py-20 lg:py-32 overflow-hidden bg-black text-white flex items-center justify-center min-h-[calc(100svh-64px)] md:min-h-[80vh]">
        <Image
          src={bgNew1}
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/65 pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.h1 
            className="text-[clamp(2.35rem,11vw,4.75rem)] lg:text-7xl font-black mb-6 tracking-tight font-outfit leading-[0.98] sm:leading-tight"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            A RELIABLE GUIDE
            <br />
            TO YOUR
            <br />
            <span className="text-[#FF0000]">TRANSFOMATION</span>
          </motion.h1>
          <motion.p 
            className="text-sm sm:text-lg lg:text-2xl text-white/80 mb-8 sm:mb-10 max-w-3xl mx-auto font-medium leading-relaxed"
            {...fadeIn}
          >
            We deliver time efficient training and flexible meal plans for Sri Lankans worldwide.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button onClick={() => router.push("/packages")} size="lg" className="w-full text-sm sm:w-auto sm:text-base py-4 px-7 sm:px-8 rounded-full font-black alpha-hero-red-shadow">
              Find Your Programme
            </Button>
            <Button
              onClick={() => router.push("/process-details")}
              variant="secondary"
              size="lg"
              className="w-full bg-white text-sm text-gray-900 hover:bg-gray-100 sm:w-auto sm:text-base py-4 px-7 sm:px-8 rounded-full font-black alpha-hero-white-shadow"
            >
              Process Details
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-[#F9F8F4]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-gray-900 font-outfit tracking-tight">How It Works</h2>
            <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto text-center">
              Evidence-based coaching. Structured, tracked, and adjusted for continuous progress
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Customized Workouts", desc: "Training plan personalized to your fitness capacity, gym environment, or home setup.", icon: Dumbbell },
              { title: "Personalized Menus", desc: "Flexible meal plans tailored to your location, preferences, and changing needs", icon: Utensils },
              { title: "Form Review", desc: "Expert technique review with actionable feedback and training adjustments to improve performance.", icon: FileVideo },
              { title: "Whatsapp Support", desc: "Get answers quickly with guaranteed reply windows directly through WhatsApp voice notes or texts.", icon: MessageCircle },
              { title: "Ongoing Adjustments", desc: "Your plan is continuously adapted based on performance, feedback, and actual training & diet effort.", icon: ShieldCheck },
              { title: "Process Details", desc: "See the full coaching journey, setup steps, starter week, and support expectations before you join.", icon: ArrowRight, isAction: true }
            ].map((benefit, i) => (
              <motion.div 
                key={i}
                role={benefit.isAction ? "button" : undefined}
                tabIndex={benefit.isAction ? 0 : undefined}
                onClick={benefit.isAction ? () => router.push("/process-details") : undefined}
                onKeyDown={benefit.isAction ? (event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    router.push("/process-details");
                  }
                } : undefined}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`bg-white p-6 sm:p-8 lg:p-10 rounded-3xl lg:rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.03)] border-2 border-transparent hover:border-[#FF0000]/20 transition-all duration-500 group ${benefit.isAction ? "cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:ring-offset-4" : ""}`}
              >
                <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 ${benefit.isAction ? "bg-gray-900 text-white group-hover:bg-[#FF0000]" : "bg-gradient-to-br from-red-500/20 to-red-600/10 text-[#FF0000]"}`}>
                  <benefit.icon size={32} strokeWidth={2} />
                </div>
                <h3 className="text-2xl font-black mb-4 font-outfit tracking-tight text-gray-900">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed font-medium text-[16px]">{benefit.desc}</p>
                {benefit.isAction && (
                  <div className="mt-8 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-[#FF0000]">
                    Learn more
                    <ArrowRight size={16} strokeWidth={3} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ask Alpha Section */}
      <section className="bg-white px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <div className="mb-4 text-[12px] font-black uppercase tracking-[0.22em] text-[#FF0000]">Paid Q&A</div>
            <h2 className="font-outfit text-4xl font-black tracking-tight text-gray-900 lg:text-5xl">
              Need <span className="text-[#FF0000]">expert advice?</span>
            </h2>
            <p className="mt-5 text-base font-semibold leading-relaxed text-gray-600 sm:text-lg">
              Whether it&apos;s training, nutrition, or technique, ask Alpha and receive personalized guidance tailored to your goals.
            </p>
          </div>
          <div className="rounded-3xl border-2 border-gray-900 bg-[#F9F8F4] p-5 alpha-panel-shadow sm:p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { title: "1 Question", text: "One focused answer" },
                { title: "3 Pack", text: "Save on follow-ups" },
                { title: "Form Review", text: "Video technique feedback" },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl bg-white p-4">
                  <div className="font-outfit text-lg font-black tracking-tight text-gray-900">{item.title}</div>
                  <p className="mt-2 text-sm font-bold leading-relaxed text-gray-500">{item.text}</p>
                </div>
              ))}
            </div>
            <Button
              type="button"
              onClick={() => router.push("/ask-alpha")}
              size="lg"
              className="mt-6 h-13 w-full rounded-full bg-gray-900 text-white hover:bg-[#FF0000]"
            >
              Buy Question Credits
            </Button>
          </div>
        </div>
      </section>

      {/* Video Gallery Section */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 bg-gray-950 text-white border-y border-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10 text-center">
            <h2 className="text-3xl md:text-4xl font-black font-outfit tracking-tight">
              Watch <span className="text-[#FF0000]">Alpha Lee</span>
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-sm sm:text-base font-medium leading-relaxed text-white/65">
              Training, nutrition, and coaching videos from the Alpha Lee Fitness YouTube channel.
            </p>
          </div>

          <div className="mx-auto max-w-3xl">
            <motion.article
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-[0_20px_60px_rgba(0,0,0,0.22)]"
            >
              <div className="aspect-video bg-black">
                <iframe
                  src={latestYoutubeVideo.embedUrl}
                  title={latestYoutubeVideo.title}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              <div className="p-5">
                <h3 className="font-outfit text-xl font-black tracking-tight">{latestYoutubeVideo.title}</h3>
              </div>
            </motion.article>
          </div>
        </div>
      </section>

      {/* Interest Form Section */}
      <InterestForm />

      {/* Transformation Gallery Section */}
      <section className="overflow-hidden bg-[#F9F8F4] px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <TransformationGallery variant="marquee" />
        </div>
      </section>

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
