"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

type FeatureCardProps = {
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  delay?: number;
};

export function FeatureCard({ title, subtitle, description, icon: Icon, delay = 0 }: FeatureCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.45, delay }}
      whileHover={{ y: -8 }}
      className="surface-card flex h-full flex-col gap-4 p-6"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-soft text-forest">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <h3 className="font-display text-2xl text-ink">{title}</h3>
        <p className="mt-2 text-sm font-semibold text-stone">{subtitle}</p>
      </div>
      <p className="text-sm leading-7 text-stone">{description}</p>
    </motion.article>
  );
}
