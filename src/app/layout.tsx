import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const openSans = Open_Sans({ subsets: ["latin"] });

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
      <body className={`${openSans.className} bg-[#F9F8F4] text-gray-900`}>
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#F9F8F4]/80 border-b border-gray-200/50 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="max-w-7xl mx-auto px-6 h-[76px] flex items-center justify-between">
              <Link href="/" className="font-black text-2xl tracking-tighter hover:text-gray-600 transition-colors">
                ALPHA LEE
              </Link>
              <nav className="hidden md:flex items-center space-x-10 font-bold text-[15px] tracking-wide">
                <Link href="#" className="text-gray-500 hover:text-[#cca751] transition-colors duration-200">Support</Link>
                <Link href="/packages" className="text-gray-500 hover:text-[#cca751] transition-colors duration-200">Find A programme</Link>
                <Link href="#" className="text-gray-500 hover:text-[#cca751] transition-colors duration-200">Account</Link>
                <Link href="#" className="bg-[#cca751] text-white px-5 py-2 rounded-full hover:bg-[#b89546] transition-colors duration-200 shadow-sm">Download Mobile App</Link>
              </nav>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
