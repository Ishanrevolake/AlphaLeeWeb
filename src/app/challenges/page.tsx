"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useState } from "react";

export default function ChallengesPage() {
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    email: "",
    city: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(formData.name && formData.dob && formData.email && formData.city) {
      setSubmitted(true);
    }
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen px-6 py-12 bg-[#F9F8F4]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-5xl w-full bg-white p-0 rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden flex flex-col md:flex-row"
      >
        {/* Left Side: Logo & Info */}
        <div className="flex-1 bg-gray-900 p-12 md:p-16 flex flex-col justify-center text-left relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-600 via-gray-900 to-black pointer-events-none" />
          
          <div className="z-10 h-16 w-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-md border border-white/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#FF0000]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          
          <h1 className="z-10 text-4xl lg:text-5xl font-black mb-6 tracking-tighter text-white font-outfit">
            ALF <span className="text-[#FF0000]">CHALLENGES</span>
          </h1>
          <p className="z-10 text-lg text-gray-400 font-medium leading-relaxed max-w-sm">
            To stay informed of upcoming ALF challenges and competitive community fitness programs, subscribe to our early access list!
          </p>
        </div>

        {/* Right Side: Form */}
        <div className="flex-1 p-10 md:p-16 bg-white flex flex-col justify-center">
          {submitted ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-green-50 text-green-700 p-8 rounded-3xl font-bold border border-green-200 text-center shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)]"
            >
              <div className="mb-4 h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-xl tracking-tight">Thank you for subscribing!</span>
              <p className="font-medium text-green-600 mt-2 text-base">We&apos;ll be in touch soon.</p>
            </motion.div>
          ) : (
            <>
              <h2 className="text-2xl font-black text-gray-900 mb-8 font-outfit tracking-tight">Join the Waitlist</h2>
              <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-left w-full">
                <div className="space-y-1.5 focus-within:text-[#FF0000] text-gray-500 transition-colors">
                  <label htmlFor="name" className="font-bold text-[13px] ml-1 uppercase tracking-wider">Your name <span className="text-[#FF0000]">*</span></label>
                  <Input 
                    label=""
                    id="name"
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 focus-within:text-[#FF0000] text-gray-500 transition-colors">
                    <label htmlFor="dob" className="font-bold text-[13px] ml-1 uppercase tracking-wider">Date of Birth <span className="text-[#FF0000]">*</span></label>
                    <Input 
                      label=""
                      id="dob"
                      type="date" 
                      value={formData.dob}
                      onChange={(e) => setFormData({...formData, dob: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-1.5 focus-within:text-[#FF0000] text-gray-500 transition-colors">
                    <label htmlFor="city" className="font-bold text-[13px] ml-1 uppercase tracking-wider">City <span className="text-[#FF0000]">*</span></label>
                    <Input 
                      label=""
                      id="city"
                      type="text" 
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5 focus-within:text-[#FF0000] text-gray-500 transition-colors">
                  <label htmlFor="email" className="font-bold text-[13px] ml-1 uppercase tracking-wider">Your email <span className="text-[#FF0000]">*</span></label>
                  <Input 
                    label=""
                    id="email"
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                
                <Button type="submit" size="lg" className="w-full h-[60px] mt-2 shadow-xl shadow-red-500/25 rounded-2xl bg-[#FF0000] hover:bg-[#cc0000] text-white font-black tracking-widest uppercase text-base">
                  Submit Details
                </Button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
