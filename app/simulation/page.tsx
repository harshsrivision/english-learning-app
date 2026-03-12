"use client";

import { ScenarioCard } from "@/components/cards";
import { SectionTitle } from "@/components/section-title";
import { useRequiredUserId } from "@/lib/use-required-user-id";
import { scenarios } from "@/lib/mock-data";

export default function SimulationPage() {
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
        eyebrow="Conversation Simulations"
        title="Practice difficult situations before they happen in real life"
        description="Each simulation pairs English prompts with Hindi coaching cues and tracks whether the learner reached the intended communication outcome."
      />
      <div className="grid gap-6 lg:grid-cols-3">
        {scenarios.map((scenario) => (
          <ScenarioCard key={scenario.id} scenario={scenario} />
        ))}
      </div>
    </main>
  );
}
