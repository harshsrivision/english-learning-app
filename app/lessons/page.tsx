import type { Metadata } from "next";
import { LessonsHub } from "@/components/lessons-hub";

export const metadata: Metadata = {
  title: "English Lessons - Hindi Speakers ke liye Structured Path | Bolo English",
  description: "200+ structured English lessons A0 se C1 tak - Hindi hints ke saath. Roz 30 min mein English fluency ki taraf."
};

export default function LessonsPage() {
  return <LessonsHub />;
}
