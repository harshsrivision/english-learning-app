"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import type { CefrLevel } from "@/lib/app-data";

const badgeClassByLevel: Record<CefrLevel, string> = {
  A0: "bg-slate-100 text-slate-700",
  A1: "bg-forest-soft text-forest",
  A2: "bg-sky text-blue-700",
  B1: "bg-yellow-100 text-yellow-700",
  B2: "bg-orange-100 text-orange-700",
  C1: "bg-red-100 text-red-700"
};

type TestimonialCardProps = {
  name: string;
  city: string;
  quote: string;
  level: CefrLevel;
  timeline: string;
  delay?: number;
};

export function TestimonialCard({ name, city, quote, level, timeline, delay = 0 }: TestimonialCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -6 }}
      className="surface-card flex h-full flex-col gap-5 p-6"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-2xl text-ink">{name}</h3>
          <span className="mt-2 inline-flex rounded-full bg-mist px-3 py-1 text-xs font-semibold text-stone">{city}</span>
        </div>
        <div className="flex items-center gap-1 text-sun">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} className="h-4 w-4 fill-current" />
          ))}
        </div>
      </div>
      <p className="text-base leading-8 text-stone">“{quote}”</p>
      <div className="mt-auto flex items-center justify-between gap-3 text-sm">
        <span className={`rounded-full px-3 py-1 font-bold ${badgeClassByLevel[level]}`}>{level}</span>
        <span className="font-semibold text-stone">{timeline}</span>
      </div>
    </motion.article>
  );
}
