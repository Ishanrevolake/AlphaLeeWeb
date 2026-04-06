import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: '--font-sans' });
const outfitFont = Outfit({ subsets: ["latin"], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: "Train with Alpha Lee | Personal Training",
  description: "Start your transformation with premium fitness coaching programs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${plusJakartaSans.variable} ${outfitFont.variable} font-sans bg-[#F9F8F4] text-gray-900 selection:bg-[#FF0000]/30`}>
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#F9F8F4]/80 border-b border-gray-200/50 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="max-w-7xl mx-auto px-6 h-[76px] flex items-center justify-between">
              <Link href="/" className="font-black text-2xl tracking-tighter hover:text-gray-600 transition-colors">
                ALPHA LEE
              </Link>
              <nav className="hidden lg:flex items-center space-x-6 font-bold text-[14px] xl:text-[15px] xl:space-x-8 tracking-wide">
                <Link href="/packages" className="text-gray-500 hover:text-[#FF0000] transition-colors duration-200">Find a Programme</Link>
                <Link href="/recipe-book" className="text-gray-500 hover:text-[#FF0000] transition-colors duration-200">Alpha Chef Recipe Book</Link>
                <Link href="/testimonials" className="text-gray-500 hover:text-[#FF0000] transition-colors duration-200">Testimonials</Link>
                <Link href="#" className="bg-[#FF0000] text-white px-5 py-2 rounded-full hover:bg-[#cc0000] transition-colors duration-200 shadow-sm">Download Mobile App</Link>
              </nav>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
