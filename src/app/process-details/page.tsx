"use client";

import { motion } from "framer-motion";

export default function ProcessDetailsPage() {
  return (
    <div className="min-h-screen py-24 px-6 bg-[#F9F8F4]">
      <motion.div 
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-5xl lg:text-7xl font-black mb-12 text-gray-900 font-outfit tracking-tighter">
          ONLINE COACHING <span className="text-[#FF0000]">SERVICE</span>
        </h1>

        <div className="space-y-16">
          <section>
            <h2 className="text-3xl font-black mb-6 border-b-2 border-red-500/20 pb-4 inline-block tracking-tight text-gray-800">CONNECT & DATA GATHERING</h2>
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-gray-100">
              <p className="text-gray-600 mb-5 text-[17px] font-medium leading-relaxed">First, you select a package or bundle and submit your interest in joining with our online coaching subscription service.</p>
              <p className="text-gray-600 mb-6 text-[17px] font-medium leading-relaxed">We contact you through whatsapp and start the set up process and also get your payment processed. Apart from the basic data gathering, we require you to submit:</p>
              <ul className="list-none space-y-4 text-gray-700 font-medium">
                <li className="flex items-start">
                  <div className="mt-1 h-2 w-2 rounded-full bg-[#FF0000] mr-4 shrink-0"></div>
                  A physical assessment video using our reference material.
                </li>
                <li className="flex items-start">
                  <div className="mt-1 h-2 w-2 rounded-full bg-[#FF0000] mr-4 shrink-0"></div>
                  Your current training plan and cardio routine (if any).
                </li>
                <li className="flex items-start">
                  <div className="mt-1 h-2 w-2 rounded-full bg-[#FF0000] mr-4 shrink-0"></div>
                  Your current calorie and protein intake. If you do not know, share pictures of the food & drinks you consume for a 24 hour period.
                </li>
              </ul>
              <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-[#FF0000] font-bold text-[15px] uppercase tracking-wider">Once the data is gathered, we start developing your starter plan. This will usually take 48 hours.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-black mb-6 border-b-2 border-red-500/20 pb-4 inline-block tracking-tight text-gray-800">STARTER WEEK</h2>
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-gray-100 space-y-6">
              <p className="text-gray-600 text-[17px] font-medium leading-relaxed">Once built and handed over, you will review the plan and list down your questions. Once addressed, you can start.</p>
              <p className="text-gray-600 text-[17px] font-medium leading-relaxed">During the first week, all clients are expected to submit a recording of each exercise performed using a manageable weight. Only once the technique is cleared are you allowed to use more challenging weights. Based on reviewing those videos, your coach will further customize the plan.</p>
              <p className="text-gray-600 text-[17px] font-medium leading-relaxed">Meal plan wise, we start you off with a minimum of 10 meal options. (If you are a vegan living in Sri Lanka, you will get fewer options in general because of local constraints.)</p>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-black mb-6 border-b-2 border-red-500/20 pb-4 inline-block tracking-tight text-gray-800">ONGOING SUPPORT</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { title: "Progress Updates", desc: "We expect all clients to submit a progress update every week describing how well or poorly they followed the plan. A form will be provided." },
                { title: "Logging Stats", desc: "We expect all clients to journal/log their lifting data as they follow the plan. This data is very important for future plan updates." },
                { title: "Answering Questions", desc: "Questions must be submitted via whatsapp text messages or voice notes. They are addressed within 48-72 hours (unless you purchased a 24-hour reply guarantee)." },
                { title: "Voice Calls", desc: "All voice calls must be scheduled beforehand. We offer them to all clients, on all packages." }
              ].map((item, idx) => (
                <div key={idx} className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <h3 className="text-xl font-bold mb-4 text-gray-900 tracking-tight">{item.title}</h3>
                  <p className="text-gray-600 font-medium leading-relaxed text-[15px]">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>
          <section>
            <h2 className="text-3xl font-black mb-6 border-b-2 border-red-500/20 pb-4 inline-block tracking-tight text-gray-800">IMPORTANT NOTES</h2>
            <div className="bg-[#FF0000]/10 rounded-[2.5rem] p-8 md:p-12 border border-[#FF0000]/20 space-y-6">
              <div className="flex items-start">
                <div className="mt-1.5 h-3 w-3 rounded-full bg-[#FF0000] mr-4 shrink-0 shadow-[0_0_10px_rgba(255,0,0,0.5)]"></div>
                <p className="text-gray-900 text-[17px] font-bold leading-relaxed">Our service never offers instant replies or call-on-demand services. Discussion dates and times can be scheduled on request.</p>
              </div>
              <div className="flex items-start">
                <div className="mt-1.5 h-3 w-3 rounded-full bg-[#FF0000] mr-4 shrink-0 shadow-[0_0_10px_rgba(255,0,0,0.5)]"></div>
                <p className="text-gray-900 text-[17px] font-bold leading-relaxed">We do not provide permanent access to our Google Drive folders. Make sure to download or save a copy of your plans before or after you leave the service.</p>
              </div>
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
