"use client";

import { motion } from "framer-motion";
import { BarChart3, Flame, Medal, Zap } from "lucide-react";
import type { CefrLevel } from "@/lib/app-data";

type DashboardTopBarProps = {
  streakDays: number;
  totalXp: number;
  currentLevel: CefrLevel;
  badgeCount: number;
};

const levelClassByBadge: Record<CefrLevel, string> = {
  A0: "bg-slate-100 text-slate-700",
  A1: "bg-forest-soft text-forest",
  A2: "bg-sky text-blue-700",
  B1: "bg-yellow-100 text-yellow-700",
  B2: "bg-orange-100 text-orange-700",
  C1: "bg-red-100 text-red-700"
};

export function DashboardTopBar({ streakDays, totalXp, currentLevel, badgeCount }: DashboardTopBarProps) {
  const items = [
    { label: "Streak", subtitle: "Roz ka silsila", value: `${streakDays} days`, icon: Flame, accent: "text-clay" },
    { label: "XP", subtitle: "Total earned points", value: totalXp.toLocaleString(), icon: Zap, accent: "text-forest" },
    { label: "Level", subtitle: "Current CEFR stage", value: currentLevel, icon: BarChart3, accent: "text-ink" },
    { label: "Badges", subtitle: "Unlocked rewards", value: badgeCount, icon: Medal, accent: "text-gold" }
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-20 z-30 rounded-[1.75rem] border border-ink/10 bg-white/90 p-3 shadow-card backdrop-blur"
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} className="rounded-[1.35rem] bg-mist px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-stone">{item.label}</p>
                  <p className="mt-1 text-xs text-stone">{item.subtitle}</p>
                </div>
                <Icon className={`h-5 w-5 ${item.accent}`} />
              </div>
              {item.label === "Level" ? (
                <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-bold ${levelClassByBadge[currentLevel]}`}>{item.value}</span>
              ) : (
                <p className="mt-3 text-2xl font-bold text-ink">{item.value}</p>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
