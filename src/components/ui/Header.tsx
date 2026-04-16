"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();

  const links = [
    { href: "/packages", label: "Find a Programme" },
    { href: "/process-details", label: "Process Details" },
    { href: "/recipe-book", label: "Alpha Chef Recipe Book" },
    { href: "/challenges", label: "ALF Challenges" },
    { href: "/blog", label: "Fitness Blog" },
    { href: "/testimonials", label: "Testimonials" },
    { href: "/about", label: "About Us" }
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
          <Link href="/packages" className="bg-[#FF0000] text-white px-5 py-2 rounded-full hover:bg-[#cc0000] transition-colors duration-200 shadow-sm whitespace-nowrap ml-4 font-bold tracking-wide">
            Download Mobile App
          </Link>
        </nav>
      </div>
    </header>
  );
}
