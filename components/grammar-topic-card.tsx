"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { CefrLevel } from "@/lib/app-data";

const badgeClassByLevel: Record<CefrLevel, string> = {
  A0: "bg-slate-100 text-slate-700",
  A1: "bg-forest-soft text-forest",
  A2: "bg-sky text-blue-700",
  B1: "bg-yellow-100 text-yellow-700",
  B2: "bg-orange-100 text-orange-700",
  C1: "bg-red-100 text-red-700"
};

type GrammarTopicCardProps = {
  title: string;
  subtitle: string;
  level: CefrLevel;
  duration: string;
  hook: string;
  description: string;
  delay?: number;
};

export function GrammarTopicCard({ title, subtitle, level, duration, hook, description, delay = 0 }: GrammarTopicCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.45, delay }}
      whileHover={{ y: -6 }}
      className="surface-card flex h-full flex-col gap-5 p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${badgeClassByLevel[level]}`}>{level}</span>
        <span className="text-sm font-semibold text-stone">{duration}</span>
      </div>
      <div>
        <h3 className="font-display text-2xl text-ink">{title}</h3>
        <p className="mt-2 text-sm font-semibold text-stone">{subtitle}</p>
      </div>
      <p className="rounded-[1.3rem] bg-mist px-4 py-3 text-sm leading-6 text-stone">{hook}</p>
      <p className="text-sm leading-7 text-stone">{description}</p>
      <Link href="/practice" aria-label={`Practice ${title}`} className="mt-auto inline-flex items-center gap-2 text-sm font-bold text-forest">
        Practice This Topic
        <ArrowRight className="h-4 w-4" />
      </Link>
    </motion.article>
  );
}
