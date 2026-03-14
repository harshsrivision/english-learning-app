import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Playfair_Display, Inter } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400","500","600","700"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Bolo English",
  description: "English speaking platform for Hindi speakers from beginner to professional level."
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="font-sans bg-white text-black">
        <Navbar />
        {children}
      </body>
    </html>
  );
}