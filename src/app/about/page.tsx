"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Dumbbell, Eye, HeartHandshake, MessageCircle, RefreshCw, ShieldCheck, Target, Utensils } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import headCoachImage from "../../assets/head-coach.jpeg";
import documentationAdministrator from "@/assets/documentation-administrator.jpg";

function InstagramIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[21px] w-[21px]" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="currentColor">
      <path d="M21.6 7.2a3 3 0 0 0-2.1-2.1C17.7 4.6 12 4.6 12 4.6s-5.7 0-7.5.5a3 3 0 0 0-2.1 2.1A31 31 0 0 0 2 12a31 31 0 0 0 .4 4.8 3 3 0 0 0 2.1 2.1c1.8.5 7.5.5 7.5.5s5.7 0 7.5-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 22 12a31 31 0 0 0-.4-4.8ZM10 15.4V8.6l5.8 3.4L10 15.4Z" />
    </svg>
  );
}

const values = [
  {
    title: "Evidence-Based Practices",
    description: "Grounding our coaching approach in scientific research and practical knowledge.",
    icon: ShieldCheck,
  },
  {
    title: "Flexibility And Adaptability",
    description: "Offering pause-resume service and dynamic plan changes to suit individual needs.",
    icon: RefreshCw,
  },
  {
    title: "Supportive Communication",
    description: "Fostering strong coach-client relationships through open and reliable communication.",
    icon: MessageCircle,
  },
  {
    title: "Nourishment And Enjoyment",
    description: "Providing a rich meal database for delicious and nutritious food choices.",
    icon: Utensils,
  },
  {
    title: "Resilience And Contingency Planning",
    description: "Overcoming challenges and ensuring unwavering progress.",
    icon: HeartHandshake,
  },
];

const team = [
  {
    name: "Lalitha Epaarachchi",
    role: "Head Coach",
    image: headCoachImage,
    socials: {
      youtube: "https://www.youtube.com/@AlphaLeeFitness",
      instagram: "https://www.instagram.com/lalitha_epaarachchi?igsh=MWI3czMxaG84OGJiZQ==",
    },
  },
  {
    name: "Monali Nawarathna",
    role: "Documentation Administrator",
    image: documentationAdministrator,
    socials: {
      youtube: "",
      instagram: "",
    },
  },
];

const distinctiveBenefits = [
  {
    title: "Evidence-First Personalized Planning",
    description: "Our coaching approach is grounded in evidence-based practices, ensuring that each client receives a tailored workout plan and meal plan aligned with their specific goals and needs.",
  },
  {
    title: "Pause-Resume Service",
    description: "Distinctive in Sri Lanka, our unique pause-resume service empowers clients with the flexibility to use our coaching on their terms. Take breaks when needed and seamlessly resume your fitness journey without interruptions.",
  },
  {
    title: "Reliable Communication and Strong Coach-Client Relationships",
    description: "We prioritize open and supportive communication. Our clients get to choose the level of attention they need.",
  },
  {
    title: "Continuous Monitoring and Dynamic Plan Changes",
    description: "Our commitment to your progress drives us to monitor your development closely. We adjust and fine-tune your fitness plan dynamically, ensuring you achieve the best possible results.",
  },
  {
    title: "Rich Meal Database",
    description: "Enjoy a vast collection of nutritious meals that add flavor and variety to your meal plan. We believe in making wellness enjoyable through delicious and nourishing food choices.",
    link: "https://shop.alf.lk/",
  },
  {
    title: "Contingency Planning for Unwavering Progress",
    description: "No obstacle will stand in your way. We have a robust contingency strategy to keep you on track, no matter the challenges you encounter. All you need to do is communicate your challenges.",
  },
];

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col flex-1 bg-white">
      <section className="bg-gray-950 px-4 py-16 text-white sm:px-6 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <p className="mb-5 text-[12px] font-black uppercase tracking-[0.24em] text-[#FF0000]">
              About Alpha Lee Fitness
            </p>
            <h1 className="font-outfit text-[clamp(2.4rem,8vw,5.6rem)] font-black leading-[0.98] tracking-tight">
              Health and fitness for Sri Lankans everywhere.
            </h1>
            <p className="mt-7 max-w-3xl text-base font-semibold leading-8 text-white/75 sm:text-xl">
              Welcome to Alpha Lee Fitness, where we believe health and fitness are cornerstones of the Sri Lankan community.
              I&apos;m Lalitha Epaarachchi, a former software engineer turned self-educated fitness coach and small business
              owner since 2018. I am thrilled to have you here.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="relative min-h-[360px] overflow-hidden border border-white/10 bg-black sm:min-h-[480px]"
          >
            <Image
              src="/images/process-details/firstSection.png"
              alt="Lalitha Epaarachchi, Alpha Lee Fitness head coach"
              fill
              priority
              sizes="(min-width: 1024px) 44vw, 100vw"
              className="object-contain object-bottom"
            />
            <div className="absolute left-6 top-6 inline-flex h-16 w-16 items-center justify-center bg-white text-[#FF0000] sm:left-8 sm:top-8">
              <Dumbbell size={32} strokeWidth={2.5} />
            </div>
            <p className="absolute bottom-6 left-6 right-6 text-sm font-bold uppercase tracking-[0.18em] text-white/60 sm:bottom-8 sm:left-8 sm:right-8">
              Reliable guidance. Realistic systems. Sustainable progress.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="bg-[#F9F8F4] px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <h2 className="font-outfit text-[clamp(2.2rem,7vw,4.5rem)] font-black tracking-tight text-gray-900">
              Our Purpose and Direction
            </h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <article className="border border-gray-200 bg-white p-8 shadow-[0_18px_50px_rgba(0,0,0,0.06)] sm:p-10">
              <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gray-950 text-white">
                <Eye size={34} strokeWidth={2.4} />
              </div>
              <h3 className="font-outfit text-3xl font-black tracking-tight text-[#FF0000]">Vision</h3>
              <p className="mt-5 text-lg font-semibold leading-8 text-gray-600">
                Empowering Sri Lankans globally with useful health and fitness information and services.
              </p>
            </article>
            <article className="border border-gray-200 bg-white p-8 shadow-[0_18px_50px_rgba(0,0,0,0.06)] sm:p-10">
              <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#FF0000] text-white">
                <Target size={34} strokeWidth={2.4} />
              </div>
              <h3 className="font-outfit text-3xl font-black tracking-tight text-[#FF0000]">Mission</h3>
              <p className="mt-5 text-lg font-semibold leading-8 text-gray-600">
                Guiding Sri Lankans worldwide through evidence-based fitness coaching for holistic wellbeing.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-gray-950 px-4 py-16 text-white sm:px-6 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <h2 className="font-outfit text-[clamp(2.2rem,7vw,4.5rem)] font-black tracking-tight">
              Our Core Values
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {values.map((value, index) => (
              <motion.article
                key={value.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className={index === values.length - 1 ? "border border-white/10 bg-white/[0.06] p-6 md:col-span-2 md:mx-auto md:w-1/2 sm:p-8" : "border border-white/10 bg-white/[0.06] p-6 sm:p-8"}
              >
                <value.icon className="mb-6 text-[#FF0000]" size={30} strokeWidth={2.4} />
                <h3 className="font-outfit text-2xl font-black tracking-tight">{value.title}</h3>
                <p className="mt-4 text-base font-semibold leading-8 text-white/72">{value.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="relative min-h-[280px] overflow-hidden border border-gray-200 bg-white p-8 shadow-[0_18px_50px_rgba(0,0,0,0.06)] sm:min-h-[420px]">
            <Image
              src="/images/process-details/sectionNew.jpg"
              alt="Alpha Lee Fitness brand mark"
              fill
              sizes="(min-width: 1024px) 36vw, 100vw"
              className="object-contain p-6"
            />
            <p className="absolute bottom-6 left-6 z-10 text-sm font-black uppercase tracking-[0.2em] text-gray-500 sm:bottom-8 sm:left-8">
              Story
            </p>
          </div>
          <div>
            <p className="mb-4 text-[12px] font-black uppercase tracking-[0.24em] text-[#FF0000]">
              ALF Story
            </p>
            <h2 className="font-outfit text-[clamp(2.2rem,7vw,4.7rem)] font-black leading-tight tracking-tight text-gray-900">
              The Birth Of Alpha Lee Fitness
            </h2>
            <div className="mt-8 space-y-6 text-base font-semibold leading-8 text-gray-600 sm:text-lg">
              <p>
                In 2015, I embarked on a life-changing journey, co-founding &quot;Natty Muscle,&quot; which eventually led to
                the birth of Alpha Lee Fitness Pvt Limited. By day, I was a dedicated software engineer, but by night, my
                true passion as a trainer emerged.
              </p>
              <p>
                From personal training sessions to leading invigorating group classes at Independence Square and conducting
                a successful workshop at a leading tech company in Sri Lanka, Direct Fn, I witnessed the profound impact of
                fitness on lives. That experience solidified my transition from software engineer to self-educated fitness
                trainer.
              </p>
              <p>
                It also put me face to face with a new problem: the fitness trainer career was quite an underpaid profession.
                To support my family responsibilities while helping people make sustainable changes, I needed a more scalable
                method of doing business.
              </p>
              <p>
                In 2017-2018, I took on a solitary quest, working tirelessly to crack the code for an online coaching model
                that could revolutionize the Sri Lankan fitness industry, making a significant impact while also being
                profitable. Drawing on my software engineering background, I was determined and unstoppable.
              </p>
              <p>
                And then, in 2018, Alpha Lee Fitness Pvt Limited was born &ndash; a beacon of hope and knowledge, transcending
                borders and time zones, poised to reshape the world of Sri Lankan fitness. From 2019 onwards, I pursued my
                passion with unwavering dedication. As I recruited and scaled operations, I empowered Sri Lankans worldwide
                with evidence-based fitness knowledge. This is only the beginning of my story, where innovation, passion, and
                the desire to transform lives takes precedence. Join me at Alpha Lee Fitness Pvt Limited, where we redefine
                fitness possibilities and inspire a healthier, happier existence together.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F9F8F4] px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="font-outfit text-[clamp(2.5rem,8vw,5rem)] font-black tracking-tight text-gray-900">
              The Team.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base font-semibold leading-relaxed text-gray-500 sm:text-lg">
              Our team works every day to help ensure you get the best services.
            </p>
          </div>
          <div className="grid gap-8 lg:grid-cols-2">
            {team.map((member) => (
              <article key={member.name} className="overflow-hidden border border-gray-200 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.07)]">
                <div className="relative aspect-[4/3] bg-gray-100">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-7 text-center sm:p-8">
                  <h3 className="font-outfit text-2xl font-black tracking-tight text-gray-900">{member.name}</h3>
                  <p className="mt-3 text-sm font-black uppercase tracking-[0.18em] text-gray-500">{member.role}</p>
                  <div className="mt-5 flex justify-center gap-3">
                    {member.socials.instagram ? (
                      <a
                        href={member.socials.instagram}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${member.name} on Instagram`}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-900 transition-colors hover:border-[#FF0000] hover:bg-[#FF0000] hover:text-white"
                      >
                        <InstagramIcon />
                      </a>
                    ) : (
                      <span
                        aria-label={`${member.name} Instagram link unavailable`}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-gray-300"
                      >
                        <InstagramIcon />
                      </span>
                    )}
                    {member.socials.youtube ? (
                      <a
                        href={member.socials.youtube}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${member.name} on YouTube`}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-900 transition-colors hover:border-[#FF0000] hover:bg-[#FF0000] hover:text-white"
                      >
                        <YoutubeIcon />
                      </a>
                    ) : (
                      <span
                        aria-label={`${member.name} YouTube link unavailable`}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-gray-300"
                      >
                        <YoutubeIcon />
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="mb-4 text-[12px] font-black uppercase tracking-[0.24em] text-[#FF0000]">
              Distinctive Benefits
            </p>
            <h2 className="font-outfit text-[clamp(2.2rem,7vw,4.5rem)] font-black tracking-tight text-gray-900">
              6 Reasons to Start your Journey with us
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {distinctiveBenefits.map((benefit, index) => (
              <article key={benefit.title} className="border border-gray-200 bg-[#F9F8F4] p-7 shadow-[0_18px_50px_rgba(0,0,0,0.04)] sm:p-8">
                <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-full bg-[#FF0000] text-base font-black text-white">
                  {index + 1}
                </div>
                <h3 className="font-outfit text-2xl font-black tracking-tight text-gray-900">{benefit.title}</h3>
                <p className="mt-4 text-base font-semibold leading-8 text-gray-600">
                  {benefit.description}
                  {benefit.link && (
                    <>
                      {" "}
                      Checkout our Alpha Chef Recipe{" "}
                      <a href={benefit.link} target="_blank" rel="noreferrer" className="font-black text-[#FF0000] underline underline-offset-4">
                        EBook
                      </a>
                      .
                    </>
                  )}
                </p>
              </article>
            ))}
          </div>
          <div className="mx-auto mt-10 max-w-4xl border border-gray-200 bg-white p-7 text-center shadow-[0_18px_50px_rgba(0,0,0,0.05)] sm:p-10">
            <p className="text-lg font-bold leading-8 text-gray-700">
              It takes more than just buying a weight loss diet plan or workout plan to reach your goals. Our online fitness coaching service understands that and is willing and able to guide you through your unique journey. Start your lifestyle transformation journey with us now!
            </p>
            <Button
              onClick={() => router.push("/packages")}
              size="lg"
              className="mt-8 h-14 rounded-full bg-[#FF0000] px-10 text-lg font-black tracking-wide text-white shadow-2xl shadow-red-500/30 transition-all hover:bg-red-700"
            >
              Join Now
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
