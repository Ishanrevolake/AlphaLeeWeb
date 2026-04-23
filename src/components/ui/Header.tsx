"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

export function Header() {
  const pathname = usePathname();

  const links = [
    { href: "/packages", label: "Find a Programme" },
    { href: "/process-details", label: "Process Details" },
    { href: "/recipe-book", label: "Alpha Chef Recipe Book" },
    { href: "/challenges", label: "ALF Challenges" },
    { href: "/blog", label: "Fitness Blog" }
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#F9F8F4]/80 border-b border-gray-200/50 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-6 h-[76px] flex items-center justify-between">
        <Link href="/" className="font-black text-2xl tracking-tighter hover:text-gray-600 transition-colors">
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

          <Link href="/packages" className="bg-[#FF0000] text-white px-5 py-2 rounded-full hover:bg-[#cc0000] transition-colors duration-200 shadow-sm whitespace-nowrap ml-4 font-bold tracking-wide">
            Download Mobile App
          </Link>
        </nav>
      </div>
    </header>
  );
}
