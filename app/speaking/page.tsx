"use client";

import { SpeakingPractice } from "@/components/speaking-practice";
import { useRequiredUserId } from "@/lib/use-required-user-id";

export default function SpeakingPage() {
  const { userId, isChecking } = useRequiredUserId();

  if (isChecking || !userId) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="rounded-[2rem] border border-dashed border-ink/15 bg-white/70 p-8 text-sm text-ink/65">Checking account session...</div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16">
      <SpeakingPractice userId={userId} />
    </main>
  );
}
