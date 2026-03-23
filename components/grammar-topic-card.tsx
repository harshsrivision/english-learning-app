"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import type { CefrLevel } from "@/lib/app-data";

const badgeClassByLevel: Record<CefrLevel, string> = {
  A0: "bg-stone/10 text-stone",
  A1: "bg-forest-soft text-forest",
  A2: "bg-forest-soft text-forest",
  B1: "bg-gold/10 text-gold",
  B2: "bg-gold/20 text-gold",
  C1: "bg-ink/10 text-ink"
};

type GrammarTopicCardProps = {
  title: string;
  subtitle: string;
  level: CefrLevel;
  duration: string;
  hook: string;
  description: string;
  href: Route;
  delay?: number;
};

export function GrammarTopicCard({ title, subtitle, level, duration, hook, description, href, delay = 0 }: GrammarTopicCardProps) {
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
      <Link href={href} aria-label={`Open lesson for grammar topic ${title}`} className="mt-auto inline-flex items-center gap-2 text-sm font-bold text-forest">
        Open Related Lesson
        <ArrowRight className="h-4 w-4" />
      </Link>
    </motion.article>
  );
}
