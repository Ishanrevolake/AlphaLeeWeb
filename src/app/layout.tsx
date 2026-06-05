import type { Metadata } from "next";
import localFont from "next/font/local";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-sans",
  weight: "100 900",
});

const geistDisplay = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-outfit",
  weight: "100 900",
});

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
      <body className={`${geistSans.variable} ${geistDisplay.variable} sharp-edge font-sans bg-[#F9F8F4] text-gray-900 selection:bg-[#FF0000]/30 overflow-x-hidden`}>
        <div className="flex min-h-screen flex-col overflow-x-hidden">
          <Header />
          <main className="flex-1 flex justify-center w-full min-w-0">
            <div className="w-full min-w-0 relative">{children}</div>
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
