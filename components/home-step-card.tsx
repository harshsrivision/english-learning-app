"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

type HomeStepCardProps = {
  stepNumber: string;
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  delay?: number;
};

export function HomeStepCard({ stepNumber, title, subtitle, description, icon: Icon, delay = 0 }: HomeStepCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, x: 28 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.5, delay }}
      className="surface-card flex h-full flex-col gap-5 p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <p className="font-display text-5xl text-forest/20">{stepNumber}</p>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-soft text-forest">
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div>
        <h3 className="font-display text-2xl text-ink">{title}</h3>
        <p className="mt-2 text-sm font-semibold text-stone">{subtitle}</p>
      </div>
      <p className="text-sm leading-7 text-stone">{description}</p>
    </motion.article>
  );
}
