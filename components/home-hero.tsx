"use client";

import { motion } from "framer-motion";
import { MessageCircleMore, Mic2, PlayCircle, Sparkles, Volume2 } from "lucide-react";
import Link from "next/link";
import { homeTrustLine } from "@/lib/app-data";
import { useUserSession } from "@/lib/use-user-session";

function VoiceBar({ delay }: { delay: number }) {
  return (
    <motion.div
      className="h-12 w-2 origin-bottom rounded-full bg-forest"
      animate={{ scaleY: [0.35, 1, 0.55, 1.15, 0.4] }}
      transition={{ repeat: Infinity, duration: 1.6, delay }}
    />
  );
}

export function HomeHero() {
  const { hasSession, isChecking } = useUserSession();

  const primaryHref = isChecking ? "/roadmap" : hasSession ? "/dashboard" : "/signup";
  const primaryLabel = isChecking ? "Explore Roadmap" : hasSession ? "Continue Learning" : "Create Free Account";
  const secondaryHref = "/speaking";
  const secondaryLabel = hasSession ? "Open Speaking Lab" : "Try Speaking Practice";

  return (
    <section className="hero-grid overflow-hidden">
      <div className="section-shell relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-20">
        <div className="absolute right-0 top-8 hidden h-72 w-72 rounded-full bg-forest/10 blur-3xl lg:block" />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 space-y-7"
        >
          <div className="inline-flex items-center rounded-full border border-forest/10 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-forest">
            India-first spoken English
          </div>
          <div className="space-y-4">
            <h1 className="max-w-3xl font-display text-4xl leading-tight text-ink sm:text-5xl lg:text-6xl">
              Hindi Bolte Ho? English Bolna Seekho.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-stone sm:text-xl">
              Structured AI-led practice that takes you from your first sentence to boardroom confidence, built specifically for Hindi speakers.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={primaryHref}
              aria-label={primaryLabel}
              className="inline-flex items-center justify-center rounded-full bg-forest px-6 py-4 text-sm font-bold text-white transition hover:bg-forest-dark"
            >
              {primaryLabel}
            </Link>
            <Link
              href={secondaryHref}
              aria-label={secondaryLabel}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 px-6 py-4 text-sm font-bold text-ink transition hover:border-forest hover:text-forest"
            >
              <Mic2 className="h-4 w-4" />
              {secondaryLabel}
            </Link>
            <Link
              href="#how-it-works"
              aria-label="Jump to how it works section"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 px-6 py-4 text-sm font-bold text-ink transition hover:border-forest hover:text-forest"
            >
              <PlayCircle className="h-4 w-4" />
              Watch How It Works
            </Link>
          </div>

          <div className="rounded-[1.6rem] bg-white/80 p-4 shadow-card sm:max-w-xl">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-forest-soft text-forest">
                <Mic2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">Speaking tab is live</p>
                <p className="mt-1 text-sm leading-7 text-stone">Microphone practice, pronunciation review, correction, aur Hindi coaching ab homepage se seedha available hai.</p>
              </div>
            </div>
          </div>

          <p className="text-sm font-medium text-stone">STAR {homeTrustLine}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="relative mx-auto w-full max-w-md"
        >
          <div className="surface-card halo-panel relative overflow-hidden p-6 sm:p-8">
            <motion.div
              className="absolute inset-0 rounded-[2rem] border border-forest/20"
              animate={{ scale: [1, 1.04, 1], opacity: [0.25, 0.45, 0.25] }}
              transition={{ repeat: Infinity, duration: 3.2 }}
            />
            <div className="relative space-y-6">
              <div className="flex items-center justify-between rounded-[1.5rem] bg-ink px-5 py-4 text-white">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-white/65">AI Coach</p>
                  <p className="mt-2 text-sm font-semibold">Bolke dikhao: &quot;Tell me about yourself.&quot;</p>
                </div>
                <Sparkles className="h-5 w-5 text-sun" />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="relative flex h-36 w-36 items-center justify-center rounded-full bg-forest-soft">
                  <motion.div
                    className="absolute h-28 w-28 rounded-full border border-forest/25"
                    animate={{ scale: [1, 1.18, 1], opacity: [0.2, 0.6, 0.2] }}
                    transition={{ repeat: Infinity, duration: 2.2 }}
                  />
                  <motion.div
                    className="absolute h-36 w-36 rounded-full border border-forest/15"
                    animate={{ scale: [0.95, 1.08, 0.95], opacity: [0.15, 0.3, 0.15] }}
                    transition={{ repeat: Infinity, duration: 2.8 }}
                  />
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-forest shadow-card">
                    <Mic2 className="h-10 w-10" />
                  </div>
                </div>

                <div className="flex items-end gap-2">
                  <VoiceBar delay={0} />
                  <VoiceBar delay={0.1} />
                  <VoiceBar delay={0.2} />
                  <VoiceBar delay={0.3} />
                  <VoiceBar delay={0.4} />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.5rem] bg-white p-4 shadow-card">
                  <div className="flex items-center gap-2 text-forest">
                    <Volume2 className="h-4 w-4" />
                    <p className="text-sm font-semibold text-ink">Pronunciation score</p>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-ink">8.6/10</p>
                  <p className="mt-2 text-sm text-stone">&quot;th&quot; sound ko aur soft bolna hai.</p>
                </div>
                <div className="rounded-[1.5rem] bg-sky p-4">
                  <div className="flex items-center gap-2 text-ink">
                    <MessageCircleMore className="h-4 w-4" />
                    <p className="text-sm font-semibold text-ink">Hindi hint</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-stone">Sentence ko 2 chhote parts mein bolo, confidence turant badhega.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
