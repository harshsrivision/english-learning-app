"use client";

import { motion } from "framer-motion";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  subtitle: string;
  description?: string;
  align?: "left" | "center";
};

export function SectionHeading({ eyebrow, title, subtitle, description, align = "left" }: SectionHeadingProps) {
  const alignment = align === "center" ? "mx-auto text-center" : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`max-w-3xl space-y-3 ${alignment}`}
    >
      {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.28em] text-forest">{eyebrow}</p> : null}
      <h2 className="font-display text-3xl leading-tight text-ink sm:text-4xl">{title}</h2>
      <p className="text-base font-medium leading-7 text-stone sm:text-lg">{subtitle}</p>
      {description ? <p className="text-sm leading-7 text-stone/90 sm:text-base">{description}</p> : null}
    </motion.div>
  );
}
