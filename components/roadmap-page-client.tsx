/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { ArrowRight } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { RoadmapLevelCard } from "@/components/roadmap-level-card";
import { SectionHeading } from "@/components/section-heading";
import { type CefrLevel, roadmapLevels } from "@/lib/app-data";
import { buildCurriculumLevelRoute } from "@/lib/curriculum-lessons";
import { mapRoadmapLevelToCurriculumLevel } from "@/lib/curriculum";
import { getCurrentCefrLevel, getLevelIndex } from "@/lib/local-progress";
import { useLearnerProgress } from "@/lib/use-learner-progress";

export function RoadmapPageClient() {
  const { progress } = useLearnerProgress();
  const [currentLevel, setCurrentLevel] = useState<CefrLevel>("A0");
  const [openLevel, setOpenLevel] = useState<CefrLevel>("A0");
  const [hasChosenOpenLevel, setHasChosenOpenLevel] = useState(false);

  useEffect(() => {
    setCurrentLevel(getCurrentCefrLevel(progress.totalXp));
  }, [progress.totalXp]);

  useEffect(() => {
    if (!hasChosenOpenLevel) {
      setOpenLevel(currentLevel);
    }
  }, [currentLevel, hasChosenOpenLevel]);

  const currentLevelIndex = getLevelIndex(currentLevel);
  const currentCurriculumHref = buildCurriculumLevelRoute(mapRoadmapLevelToCurriculumLevel(currentLevel)) as Route;

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
          <Link href={currentCurriculumHref} aria-label="Explore current roadmap curriculum" className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-3 text-sm font-bold text-white">
            Explore This Level
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
                setOpenLevel((current) => (current === level.level ? currentLevel : level.level));
              }}
            />
          );
        })}
      </section>
    </main>
  );
}