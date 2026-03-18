"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

type ProgressStatCardProps = {
  title: string;
  subtitle: string;
  value: string;
  icon: LucideIcon;
  delay?: number;
};

export function ProgressStatCard({ title, subtitle, value, icon: Icon, delay = 0 }: ProgressStatCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.45, delay }}
      whileHover={{ y: -5 }}
      className="surface-card flex h-full flex-col gap-4 p-5"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-soft text-forest">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="font-display text-xl text-ink">{title}</h3>
        <p className="mt-1 text-sm text-stone">{subtitle}</p>
      </div>
      <p className="mt-auto text-3xl font-bold text-ink">{value}</p>
    </motion.article>
  );
}
