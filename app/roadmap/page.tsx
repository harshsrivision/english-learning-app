"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { RoadmapLevelCard } from "@/components/roadmap-level-card";
import { SectionHeading } from "@/components/section-heading";
import { roadmapLevels, type CefrLevel } from "@/lib/app-data";
import { getCurrentCefrLevel, getLevelIndex } from "@/lib/local-progress";
import { useLearnerProgress } from "@/lib/use-learner-progress";

export default function RoadmapPage() {
  const { progress } = useLearnerProgress();
  const [selectedOpenLevel, setSelectedOpenLevel] = useState<CefrLevel | null>(null);
  const [hasChosenOpenLevel, setHasChosenOpenLevel] = useState(false);

  const currentLevel = progress ? getCurrentCefrLevel(progress.totalXp) : "A0";
  const currentLevelIndex = getLevelIndex(currentLevel);
  const openLevel = hasChosenOpenLevel ? selectedOpenLevel : currentLevel;

  if (!progress) {
    return (
      <main className="section-shell">
        <div className="surface-card p-6 text-sm text-stone">Roadmap loading ho raha hai...</div>
      </main>
    );
  }

  return (
    <main className="section-shell space-y-10">
      <SectionHeading
        eyebrow="CEFR Roadmap"
        title="Tera English Ka Safar"
        subtitle="Your Journey from Zero to Fluent"
        description="Har level par tum kya bol paoge, kitna time lag sakta hai, aur kaunsa stage abhi unlock hua hai - sab ek jagah clearly dikhega."
      />

      <section className="surface-card halo-panel p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-display text-3xl text-ink">Current Unlock: {currentLevel}</h2>
            <p className="mt-2 text-sm font-medium text-stone">Abhi tum isi stage tak pahunch chuke ho</p>
            <p className="mt-3 text-base font-medium text-stone">Aaj ke XP ke hisaab se yahin tak ka path khul chuka hai.</p>
          </div>
          <Link href="/lessons" aria-label="Start current roadmap lessons" className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-3 text-sm font-bold text-white">
            Start This Level
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="hidden lg:block">
        <div className="overflow-x-auto pb-4">
          <div className="flex min-w-max items-start gap-4">
            {roadmapLevels.map((level, index) => {
              const unlocked = index <= currentLevelIndex;
              const active = level.level === currentLevel;

              return (
                <div key={level.level} className="flex items-start gap-4">
                  <RoadmapLevelCard level={level} unlocked={unlocked} active={active} />
                  {index < roadmapLevels.length - 1 ? (
                    <div className="flex h-full items-center pt-28 text-forest">
                      <ArrowRight className="h-6 w-6" />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="space-y-4 lg:hidden">
        {roadmapLevels.map((level, index) => {
          const unlocked = index <= currentLevelIndex;
          const active = level.level === currentLevel;
          const expanded = openLevel === level.level;

          return (
            <RoadmapLevelCard
              key={level.level}
              level={level}
              unlocked={unlocked}
              active={active}
              mobile
              expanded={expanded}
              onToggle={() => {
                setHasChosenOpenLevel(true);
                setSelectedOpenLevel((current) => (current === level.level ? null : level.level));
              }}
            />
          );
        })}
      </section>
    </main>
  );
}
