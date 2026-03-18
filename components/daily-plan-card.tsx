"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

type DailyPlanCardProps = {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  description: string;
  xp: number;
  checked: boolean;
  icon: LucideIcon;
  onToggle: (id: string) => void;
};

export function DailyPlanCard({ id, title, subtitle, duration, description, xp, checked, icon: Icon, onToggle }: DailyPlanCardProps) {
  return (
    <motion.article
      layout
      whileHover={{ y: -4 }}
      className={`rounded-[1.8rem] border p-5 transition ${checked ? "border-forest/20 bg-forest-soft/60" : "border-ink/10 bg-white"}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${checked ? "bg-white text-forest" : "bg-mist text-ink"}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-xl text-ink">{title}</h3>
            <p className="mt-1 text-sm font-semibold text-stone">{subtitle}</p>
            <p className="mt-2 text-sm leading-6 text-stone">{description}</p>
          </div>
        </div>
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={() => onToggle(id)}
          aria-label={`Mark ${title} complete`}
          className="mt-1 h-5 w-5 rounded border-ink/20 text-forest focus:ring-forest"
        />
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 text-sm">
        <span className="rounded-full bg-mist px-3 py-1 font-semibold text-stone">{duration}</span>
        <span className={`rounded-full px-3 py-1 font-bold ${checked ? "bg-forest text-white" : "bg-ink/5 text-ink"}`}>
          +{xp} XP {checked ? "added" : "on completion"}
        </span>
      </div>
    </motion.article>
  );
}
