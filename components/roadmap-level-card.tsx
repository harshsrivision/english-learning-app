"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LockKeyhole } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type { RoadmapLevel } from "@/lib/app-data";
import { buildCurriculumLevelRoute } from "@/lib/curriculum-lessons";
import { mapRoadmapLevelToCurriculumLevel } from "@/lib/curriculum";

type RoadmapLevelCardProps = {
  level: RoadmapLevel;
  unlocked: boolean;
  active: boolean;
  mobile?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
};

const badgeClassByLevel = {
  A0: "bg-slate-100 text-slate-700",
  A1: "bg-forest-soft text-forest",
  A2: "bg-sky text-blue-700",
  B1: "bg-yellow-100 text-yellow-700",
  B2: "bg-orange-100 text-orange-700",
  C1: "bg-red-100 text-red-700"
} as const;

function CardBody({ level, unlocked, active }: { level: RoadmapLevel; unlocked: boolean; active: boolean }) {
  const curriculumHref = buildCurriculumLevelRoute(mapRoadmapLevelToCurriculumLevel(level.level)) as Route;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${badgeClassByLevel[level.level]}`}>{level.level}</span>
        <span className="text-sm font-semibold text-stone">{level.months}</span>
      </div>
      <div>
        <h3 className="font-display text-2xl text-ink">{level.title}</h3>
        <p className="mt-2 text-sm font-semibold text-stone">{level.hindiTitle}</p>
      </div>
      <div className="rounded-[1.3rem] bg-mist p-4 text-sm text-stone">
        <p className="font-semibold text-ink">Vocabulary milestone</p>
        <p className="mt-2">{level.vocabulary}</p>
      </div>
      <div className="space-y-3 text-sm leading-7 text-stone">
        {level.outcomes.map((outcome) => (
          <p key={outcome}>• {outcome}</p>
        ))}
      </div>
      {unlocked ? (
        <Link
          href={curriculumHref}
          aria-label={`Explore ${level.level} curriculum`}
          className={`inline-flex rounded-full px-4 py-3 text-sm font-bold ${active ? "bg-forest text-white" : "bg-ink/5 text-ink"}`}
        >
          Explore Level
        </Link>
      ) : (
        <div className="inline-flex items-center gap-2 rounded-full bg-ink/5 px-4 py-3 text-sm font-semibold text-stone">
          <LockKeyhole className="h-4 w-4" />
          Locked for now
        </div>
      )}
    </div>
  );
}

export function RoadmapLevelCard({ level, unlocked, active, mobile = false, expanded = false, onToggle }: RoadmapLevelCardProps) {
  if (mobile) {
    return (
      <motion.div layout className={`surface-card overflow-hidden p-0 ${active ? "border-forest/25" : ""}`}>
        <button
          type="button"
          aria-label={`Toggle ${level.level} roadmap details`}
          aria-expanded={expanded}
          onClick={onToggle}
          className="flex w-full items-center justify-between px-5 py-4 text-left"
        >
          <div>
            <p className="text-sm font-bold text-forest">{level.level}</p>
            <h3 className="mt-1 font-display text-xl text-ink">{level.title}</h3>
            <p className="mt-1 text-sm text-stone">{level.hindiTitle}</p>
          </div>
          <ChevronDown className={`h-5 w-5 text-stone transition ${expanded ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {expanded ? (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <div className="border-t border-ink/10 px-5 py-5">
                <CardBody level={level} unlocked={unlocked} active={active} />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <motion.article whileHover={{ y: -6 }} className={`surface-card min-w-[290px] p-6 ${active ? "border-forest/30" : ""}`}>
      <CardBody level={level} unlocked={unlocked} active={active} />
    </motion.article>
  );
}