import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import { Header } from "@/components/ui/Header";
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
          <Header />
          {children}
        </div>
      </body>
    </html>
  );
}
