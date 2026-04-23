"use client";

import Link from "next/link";
import { Phone, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-black text-white pt-16 pb-8 border-t-[6px] border-[#FF0000]">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        {/* Column 1: Brand & Socials */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <Link href="/" className="font-black text-3xl tracking-tighter hover:text-gray-300 transition-colors mb-2">
            ALPHA LEE
          </Link>
          <div className="text-[12px] uppercase tracking-[0.3em] font-sans text-gray-400 mb-8">F I T N E S S</div>
          <div className="flex items-center space-x-4">
            <a href="https://web.facebook.com/alphaleefitness" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:bg-[#FF0000] hover:border-[#FF0000] transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="https://www.instagram.com/lalitha_epaarachchi/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:bg-[#FF0000] hover:border-[#FF0000] transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a href="https://www.youtube.com/@AlphaLeeFitness" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:bg-[#FF0000] hover:border-[#FF0000] transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
            </a>
          </div>
        </div>

        {/* Column 2: Navigation Links */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h4 className="font-bold mb-6 tracking-wide uppercase text-sm text-gray-500">Navigation</h4>
          <ul className="space-y-4 font-medium text-[15px] text-gray-300">
            <li><Link href="/packages" className="hover:text-[#FF0000] transition-colors">Find a Programme</Link></li>
            <li><Link href="/process-details" className="hover:text-[#FF0000] transition-colors">Process Details</Link></li>
            <li><Link href="/recipe-book" className="hover:text-[#FF0000] transition-colors">Recipe Book</Link></li>
            <li><Link href="/challenges" className="hover:text-[#FF0000] transition-colors">Challenges</Link></li>
          </ul>
        </div>

        {/* Column 3: More Links */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h4 className="font-bold mb-6 tracking-wide uppercase text-sm text-gray-500">More</h4>
          <ul className="space-y-4 font-medium text-[15px] text-gray-300 mb-8">
            <li><Link href="/blog" className="hover:text-[#FF0000] transition-colors">Fitness Blog</Link></li>
            <li><Link href="/testimonials" className="hover:text-[#FF0000] transition-colors">Testimonials</Link></li>
            <li><Link href="/about" className="hover:text-[#FF0000] transition-colors">About Us</Link></li>
          </ul>
        </div>

        {/* Column 4: Newsletter & Direct Contact */}
        <div className="flex flex-col items-center md:items-end text-center md:text-right">
          <div className="w-full flex justify-center md:justify-end mb-8 gap-8">
             <div className="flex flex-col items-center md:items-center">
               <Phone size={24} className="text-gray-400 mb-2" />
               <span className="text-[15px] font-bold">076 6277 835</span>
               <span className="text-sm text-gray-500">(Lee)</span>
             </div>
             <div className="flex flex-col items-center md:items-center">
               <Mail size={24} className="text-gray-400 mb-2" />
               <span className="text-[15px] font-bold">info@alf.lk</span>
             </div>
          </div>
          
          <h4 className="font-bold mb-4 tracking-wide text-[13px] md:text-sm">Subscribe for news and offers</h4>
          <form className="relative w-full max-w-[280px]" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Email" 
              required
              className="w-full bg-white text-gray-900 rounded-full pl-5 pr-[85px] py-2.5 outline-none border-none placeholder-gray-500 text-[15px]"
            />
            <button type="submit" className="absolute right-1 top-1 bottom-1 rounded-full bg-black hover:bg-neutral-800 text-white px-5 font-bold text-[13px] tracking-wide transition-colors flex items-center justify-center">
              SEND
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-gray-500 font-medium tracking-wide">
          © {new Date().getFullYear()} Alpha Lee Fitness. All Rights Reserved.
        </p>
        <div className="flex space-x-6 text-sm text-gray-500 font-medium">
          <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
