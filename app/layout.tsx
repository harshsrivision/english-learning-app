import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { SiteFooter } from "@/components/site-footer";
import { Noto_Sans_Devanagari, Sora } from "next/font/google";

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display"
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "Bolo English",
  description: "A mobile-first English speaking platform built for Hindi speakers from India's Tier 2 and Tier 3 cities."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sora.variable} ${notoSansDevanagari.variable} scroll-smooth`}>
      <body className="min-h-screen bg-mist text-ink antialiased">
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
