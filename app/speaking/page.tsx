import type { Metadata } from "next";
import { SpeakingPageClient } from "@/components/speaking-page-client";

export const metadata: Metadata = {
  title: "AI Speaking Practice - English Bolna Seekho | Bolo English",
  description: "Microphone se English practice karo, AI se instant feedback pao. Hindi-guided pronunciation coaching free mein."
};

export default function SpeakingPage() {
  return <SpeakingPageClient />;
}
