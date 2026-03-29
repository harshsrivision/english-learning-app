"use client";

import { motion } from "framer-motion";
import { BookOpen, Instagram, Mail, Map, Mic2, Trophy } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { buildLoginHref, defaultAuthenticatedPath } from "@/lib/auth-navigation";

const footerColumns = [
  {
    title: "About",
    subtitle: "Hum kya banate hain",
    links: [
      { href: "/", label: "Home" },
      { href: "/roadmap", label: "Roadmap" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" }
    ]
  },
  {
    title: "Learn",
    subtitle: "Core learning pages",
    links: [
      { href: "/curriculum", label: "Curriculum" },
      { href: "/lessons", label: "Lessons" },
      { href: "/grammar", label: "Grammar" },
      { href: "/vocabulary", label: "Vocabulary" }
    ]
  },
  {
    title: "Practice",
    subtitle: "Roz bolne ki jagah",
    links: [
      { href: "/speaking", label: "Speaking" },
      { href: "/practice", label: "Daily Practice" },
      { href: "/simulation", label: "Simulations" }
    ]
  },
  {
    title: "Progress",
    subtitle: "Track what you unlock",
    links: [
      { href: "/achievements", label: "Achievements" },
      { href: "/conversation", label: "Conversation" },
      { href: "/login", label: "Login" }
    ]
  }
] as const;

const quickLinks = [
  { href: "/curriculum", label: "Curriculum", icon: BookOpen },
  { href: "/speaking", label: "Speaking", icon: Mic2 },
  { href: "/roadmap", label: "Roadmap", icon: Map },
  { href: "/achievements", label: "Achievements", icon: Trophy }
] as const;

function resolveFooterHref(href: string, loginHref: Route) {
  return href === "/login" ? loginHref : (href as Route);
}

export function SiteFooter() {
  const pathname = usePathname();
  const loginHref = buildLoginHref(pathname === "/" ? defaultAuthenticatedPath : pathname);

  return (
    <footer className="border-t border-ink/10 bg-white/95">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        className="section-shell space-y-10"
      >
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {footerColumns.map((column) => (
            <div key={column.title} className="space-y-4">
              <div>
                <h3 className="font-display text-xl text-ink">{column.title}</h3>
                <p className="mt-2 text-sm text-stone">{column.subtitle}</p>
              </div>
              <div className="space-y-3 text-sm text-stone">
                {column.links.map((link) => (
                  <Link key={link.label} href={resolveFooterHref(link.href, loginHref)} aria-label={`Open ${link.label}`} className="block transition hover:text-forest">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <section className="rounded-[1.8rem] border border-ink/10 bg-mist p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-forest">Contact Us</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="flex items-start gap-3 text-sm text-stone">
              <Mail className="mt-0.5 h-4 w-4 text-forest" />
              <div>
                <p className="font-semibold text-ink">Email</p>
                <p>hello@boloenglish.in</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm text-stone">
              <Instagram className="mt-0.5 h-4 w-4 text-forest" />
              <div>
                <p className="font-semibold text-ink">Instagram</p>
                <p>@boloenglish</p>
              </div>
            </div>
            <div className="text-sm text-stone">
              <p className="font-semibold text-ink">Made with {"\u2764\uFE0F"} in Lucknow, India</p>
              <p className="mt-1">Hindi speakers ke liye proudly built.</p>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-4 border-t border-ink/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-stone">Built for Hindi speakers. Made in India.</p>
          <div className="flex flex-wrap items-center gap-3">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.label}
                  href={link.href as Route}
                  aria-label={`Open ${link.label}`}
                  className="inline-flex items-center gap-2 rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-forest hover:text-forest"
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </motion.div>
    </footer>
  );
}

