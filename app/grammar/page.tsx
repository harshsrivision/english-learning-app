"use client";

import type { Route } from "next";
import Link from "next/link";
import { GrammarTopicCard } from "@/components/grammar-topic-card";
import { SectionHeading } from "@/components/section-heading";
import { grammarTopicCards } from "@/lib/app-data";

export default function GrammarPage() {
  return (
    <main className="section-shell space-y-10">
      <SectionHeading
        eyebrow="Grammar Lab"
        title="Grammar Jo Samajh Aaye"
        subtitle="Grammar That Actually Sticks"
        description="Ek rule, 5 examples, aur ek drill - bas itna hi. Isi format mein learner overthinking chhodkar bolna start karta hai."
      />

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {grammarTopicCards.map((topic, index) => (
          <GrammarTopicCard
            key={topic.id}
            title={topic.title}
            subtitle={topic.hindiSubtitle}
            level={topic.level}
            duration={topic.duration}
            hook={topic.hook}
            description={topic.description}
            href={`/lessons/${topic.lessonId}` as Route}
            delay={index * 0.05}
          />
        ))}
      </div>

      <section className="surface-card halo-panel flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <h2 className="font-display text-3xl text-ink">Roadmap ke saath padho</h2>
          <p className="mt-2 text-base font-medium text-stone">Grammar ko CEFR path ke saath dekhoge to samajh aur retention dono better honge.</p>
        </div>
        <Link href={"/roadmap" as Route} aria-label="Open roadmap page" className="inline-flex rounded-full bg-forest px-5 py-3 text-sm font-bold text-white">
          Open Roadmap
        </Link>
      </section>
    </main>
  );
}
