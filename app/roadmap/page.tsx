import type { Metadata } from "next";
import { RoadmapPageClient } from "@/components/roadmap-page-client";

export const metadata: Metadata = {
  title: "CEFR English Roadmap - A0 se C1 tak | Bolo English",
  description: "Apna English journey dekho - A0 beginner se C1 advanced tak. Har level ke goals, vocabulary, aur timeline."
};

export default function RoadmapPage() {
  return <RoadmapPageClient />;
}
