import type { Metadata } from "next";
import { Suspense } from "react";
import { ConversationCoach } from "@/components/conversation-coach";

export const metadata: Metadata = {
  title: "AI Se Baat Karo - English Conversation Practice | Bolo English",
  description: "Practice English conversation with AI - no judgment. Hindi-speaking learners ke liye simple prompts aur real confidence building."
};

function ConversationPageFallback() {
  return (
    <main className="section-shell">
      <div className="surface-card p-6 text-sm text-stone sm:p-8">Conversation lab load ho raha hai...</div>
    </main>
  );
}

export default function ConversationPage() {
  return (
    <Suspense fallback={<ConversationPageFallback />}>
      <ConversationCoach />
    </Suspense>
  );
}
