"use client";

import { GrammarCard } from "@/components/cards";
import { SectionTitle } from "@/components/section-title";
import { useRequiredUserId } from "@/lib/use-required-user-id";
import { grammarTopics } from "@/lib/mock-data";

export default function GrammarPage() {
  const { userId, isChecking } = useRequiredUserId();

  if (isChecking || !userId) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="rounded-[2rem] border border-dashed border-ink/15 bg-white/70 p-8 text-sm text-ink/65">Checking account session...</div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 sm:py-16">
      <SectionTitle
        eyebrow="Grammar in Hindi"
        title="Clear English grammar explanations for Hindi speakers"
        description="The lessons explain tense patterns, sentence flow, and professional phrasing in Hindi so learners can understand the logic before they speak."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        {grammarTopics.map((topic) => (
          <GrammarCard key={topic.id} topic={topic} />
        ))}
      </div>
    </main>
  );
}
