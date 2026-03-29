import type { Metadata } from "next";
import { Noto_Sans_Devanagari, Sora } from "next/font/google";
import "./globals.css";
import { BackendStatusBanner } from "@/components/backend-status-banner";
import { Navbar } from "@/components/navbar";
import { SiteFooter } from "@/components/site-footer";

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
  metadataBase: new URL("https://english-learning-app-beta-ten.vercel.app"),
  title: "Bolo English - Hindi Speakers ke liye English Sikhna",
  description:
    "India ka sabse acha English learning app Hindi speakers ke liye. AI-powered speaking practice, 200+ lessons, pronunciation coaching, aur CEFR roadmap - bilkul free shuru karo.",
  keywords: [
    "english sikhne ka app",
    "hindi speaker english learning",
    "english bolna sikhein",
    "english speaking practice hindi mein",
    "best english app india",
    "english learning app india free",
    "hindi to english fluency",
    "AI english speaking coach india",
    "english sikhna free",
    "spoken english course hindi",
    "bolo english",
    "english practice app lucknow",
    "tier 2 city english learning india"
  ],
  authors: [{ name: "Bolo English" }],
  creator: "Bolo English",
  publisher: "Bolo English",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  openGraph: {
    type: "website",
    locale: "hi_IN",
    alternateLocale: "en_IN",
    url: "https://english-learning-app-beta-ten.vercel.app",
    siteName: "Bolo English",
    title: "Bolo English - Hindi Se English Fluency",
    description: "Hindi speakers ke liye India ka best AI English learning app. Free mein shuru karo, boardroom confidence tak pahuncho.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Bolo English - Hindi Se English Fluency"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Bolo English - Hindi Se English Fluency",
    description: "India ka best Hindi-to-English AI learning app. Free shuru karo.",
    images: ["/og-image.png"]
  },
  alternates: {
    canonical: "https://english-learning-app-beta-ten.vercel.app"
  },
  verification: {
    google: "add-your-google-search-console-verification-here"
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi" className={`${sora.variable} ${notoSansDevanagari.variable} scroll-smooth`}>
      <body className="min-h-screen bg-mist text-ink antialiased">
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <div className="mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
            <BackendStatusBanner />
          </div>
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
