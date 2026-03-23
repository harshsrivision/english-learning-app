"use client";

import { Mic2, Sparkles, Volume2 } from "lucide-react";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { SpeakingPractice } from "@/components/speaking-practice";
import { useRequiredUserId } from "@/lib/use-required-user-id";

export default function SpeakingPage() {
  const { userId, isChecking } = useRequiredUserId({ redirectIfMissing: false });

  return (
    <main className="section-shell space-y-8">
      <SectionHeading
        eyebrow="Speaking Lab"
        title="Bolke Practice Karo"
        subtitle="Microphone, live transcript, AI feedback, aur Hindi coaching ek hi jagah"
        description="Yeh page un learners ke liye hai jo sirf read nahi, actually bolkar fluency build karna chahte hain. Prompt pick karo, bolo, aur turant review dekho."
      />

      {!isChecking && !userId ? (
        <section className="surface-card p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-forest">Login karo to progress save ho — Start Free</p>
            <Link
              href="/signup"
              aria-label="Open signup page to save speaking progress"
              className="inline-flex items-center justify-center rounded-full bg-forest px-5 py-3 text-sm font-bold text-white"
            >
              Start Free
            </Link>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="surface-card p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-soft text-forest">
            <Mic2 className="h-5 w-5" />
          </div>
          <h2 className="mt-4 font-display text-2xl text-ink">Speak naturally</h2>
          <p className="mt-2 text-sm font-medium text-stone">Apni asli bolne ki rhythm par kaam karo</p>
          <p className="mt-2 text-sm leading-7 text-stone">Script ya memorised lines ke bajay apni real delivery practice karo.</p>
        </div>
        <div className="surface-card p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-soft text-forest">
            <Volume2 className="h-5 w-5" />
          </div>
          <h2 className="mt-4 font-display text-2xl text-ink">Hear the gaps</h2>
          <p className="mt-2 text-sm font-medium text-stone">Sunke pakdo ki kaha hesitation ya sound issue aa raha hai</p>
          <p className="mt-2 text-sm leading-7 text-stone">Recording aur transcript dono dekhkar hesitation aur pronunciation gap pakdo.</p>
        </div>
        <div className="surface-card p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-soft text-forest">
            <Sparkles className="h-5 w-5" />
          </div>
          <h2 className="mt-4 font-display text-2xl text-ink">Improve fast</h2>
          <p className="mt-2 text-sm font-medium text-stone">Har attempt ke baad next try ko turant better banao</p>
          <p className="mt-2 text-sm leading-7 text-stone">AI aur Hindi coaching ko use karke next attempt ko instantly better banao.</p>
        </div>
      </section>

      <SpeakingPractice userId={userId} />
    </main>
  );
}
