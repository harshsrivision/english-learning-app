import type { Metadata } from "next";
import { ConversationCoach } from "@/components/conversation-coach";

export const metadata: Metadata = {
  title: "AI Se Baat Karo - English Conversation Practice | Bolo English",
  description: "Practice English conversation with AI - no judgment. Hindi-speaking learners ke liye simple prompts aur real confidence building."
};

export default function ConversationPage() {
  return <ConversationCoach />;
}
