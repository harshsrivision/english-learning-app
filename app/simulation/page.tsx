import type { Metadata } from "next";
import { SimulationStudio } from "@/components/simulation-studio";

export const metadata: Metadata = {
  title: "English Conversation Simulations - Real Scenarios | Bolo English",
  description: "Job interview, restaurant, client call - real English scenarios mein practice karo. AI ke saath fear khatam."
};

export default function SimulationPage() {
  return <SimulationStudio />;
}
