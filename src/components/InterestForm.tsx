"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ChevronDown, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function InterestForm() {
  const [showGuaranteeModal, setShowGuaranteeModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");

  const planOptions = [
    "Rookie Bundle - 3 months",
    "Intermediate Bundle - 3 months",
    "Advanced Bundle - 6 months",
    "2026 Annual Offer - 60% OFF",
    "Package 01 - monthly",
    "Package 02 - monthly",
    "Training Plan Only",
    "Meal Plan Only"
  ];

  return (
    <section className="py-24 px-6 bg-white border-t border-gray-100 relative z-20">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-16 items-start">
        
        {/* Left Side */}
        <div className="lg:w-1/2 flex flex-col justify-start pt-10">
          <h2 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter font-outfit leading-[0.95]">
            <span className="text-[#FF0000]">Interested</span><br />
            in Joining?
          </h2>
          <p className="text-gray-800 font-medium text-lg max-w-sm leading-relaxed">
            Submit your interest and we will WhatsApp you and get your set up & payment process started..
          </p>
        </div>

        {/* Right Side - Form */}
        <div className="lg:w-1/2 w-full">
          <form className="flex flex-col space-y-4" onSubmit={(e) => e.preventDefault()}>
            
            {/* Custom Modern Dropdown */}
            <div className="relative">
              <div 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full px-6 py-4 rounded-full border ${isDropdownOpen ? 'border-primary ring-2 ring-primary/20 bg-white' : 'border-gray-200 bg-[#f8f9fa]'} hover:bg-white text-gray-800 font-medium cursor-pointer transition-all shadow-sm flex items-center justify-between text-[15px]`}
              >
                <span className={selectedPlan ? 'text-gray-900 font-bold' : 'text-gray-400'}>
                  {selectedPlan || "Subscription you're interested in"}
                </span>
                <ChevronDown size={20} className={`text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-100 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] overflow-hidden z-20 py-2"
                  >
                    {planOptions.map((plan) => (
                      <div 
                        key={plan}
                        onClick={() => { setSelectedPlan(plan); setIsDropdownOpen(false); }}
                        className={`px-6 py-3.5 cursor-pointer hover:bg-red-50 hover:text-[#FF0000] transition-colors text-[15px] ${selectedPlan === plan ? 'bg-red-50 text-[#FF0000] font-bold' : 'text-gray-600 font-medium'}`}
                      >
                        {plan}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Input label="" placeholder="First Name" className="rounded-full bg-[#f8f9fa] hover:bg-white focus:bg-white border border-gray-200 shadow-sm px-6 transition-colors" required />
            <Input label="" placeholder="Last Name" className="rounded-full bg-[#f8f9fa] hover:bg-white focus:bg-white border border-gray-200 shadow-sm px-6 transition-colors" required />
            <Input label="" placeholder="Email" type="email" className="rounded-full bg-[#f8f9fa] hover:bg-white focus:bg-white border border-gray-200 shadow-sm px-6 transition-colors" required />
            
            <div className="relative flex items-center">
               <span className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center text-gray-400 font-medium">
                 🇱🇰 <span className="mx-1 text-gray-500">+94</span>
               </span>
               <input 
                 className="w-full px-6 py-4 pl-[88px] border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 bg-[#f8f9fa] hover:bg-white focus:bg-white placeholder:text-gray-400 font-medium shadow-sm text-[15px]"
                 placeholder="Whatsapp Number" 
                 required 
               />
            </div>

            <textarea 
              rows={5} 
              placeholder="Describe Your Goal" 
              className="w-full px-6 py-4 border border-gray-200 rounded-3xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 bg-[#f8f9fa] hover:bg-white focus:bg-white placeholder:text-gray-400 font-medium shadow-sm resize-y text-[15px]"
              required
            />

            <div className="flex items-center space-x-3 pt-2 pl-2">
              <input type="checkbox" id="guarantee" className="w-5 h-5 rounded border-gray-300 text-[#FF0000] focus:ring-[#FF0000] cursor-pointer" />
              <label htmlFor="guarantee" className="text-gray-800 font-semibold cursor-pointer text-[15px]">
                Interested in the <span className="text-[#FF0000] hover:underline" onClick={(e) => { e.preventDefault(); setShowGuaranteeModal(true); }}>24hr Reply Guarantee?</span>
              </label>
            </div>

            <div className="pt-6">
              <Button type="submit" className="rounded-full px-8 h-12 text-lg font-bold tracking-wide bg-black hover:bg-neutral-800 text-white shadow-xl transition-all w-32 flex justify-center items-center">
                Submit
              </Button>
            </div>
            
          </form>
        </div>

      </div>

      {/* Guarantee Modal */}
      <AnimatePresence>
        {showGuaranteeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pt-[10vh]">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
              onClick={() => setShowGuaranteeModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ ease: "easeOut", duration: 0.2 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-10 shadow-2xl z-[101]"
            >
              <button 
                onClick={() => setShowGuaranteeModal(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 transition-colors bg-gray-100 hover:bg-gray-200 p-2 rounded-full"
                aria-label="Close modal"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
              
              <h3 className="text-2xl lg:text-3xl font-black mb-6 font-outfit uppercase tracking-tight text-gray-900 border-b border-gray-100 pb-4">
                24-HR <span className="text-[#FF0000]">REPLY GUARANTEE</span>
              </h3>
              
              <p className="text-gray-600 font-medium mb-6 leading-relaxed text-[16px]">
                Whether you have a specific question, need clarification on your planning or require technical support, our <span className="text-gray-900 font-bold">24-Hour Reply Guarantee</span> ensures our team will assist you within 24 hours.
              </p>
              
              <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                <p className="text-[#FF0000] font-bold leading-relaxed text-[16px]">
                  If reliable communication is what you are looking for purchase this add-on for just Rs. 5000 per month in addition to your subscription.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
