"use client";

import { ArrowRight, BriefcaseBusiness, Building2, Coffee } from "lucide-react";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { conversationScenarios } from "@/lib/conversation-scenarios";

const scenarioIcons = {
  restaurant: Coffee,
  "job-interview": BriefcaseBusiness,
  "client-escalation": Building2
} as const;

export function SimulationStudio() {
  return (
    <main className="section-shell space-y-8">
      <SectionHeading
        eyebrow="Simulations"
        title="Real English Scenario Practice"
        subtitle="Job interview, restaurant, client call - sab yahin rehearse karo"
        description="Scenario choose karo, phir conversation page par seedha live roleplay start karo. Har simulation ka pehla AI line usi context ke hisaab se automatically start hoga."
      />

      <section className="grid gap-5 lg:grid-cols-3">
        {conversationScenarios.map((scenario) => {
          const Icon = scenarioIcons[scenario.id];

          return (
            <article key={scenario.id} className="surface-card flex h-full flex-col gap-5 p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-soft text-forest">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="rounded-full border border-ink/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-stone">{scenario.difficulty}</span>
              </div>
              <div>
                <h2 className="font-display text-2xl text-ink">{scenario.title}</h2>
                <p className="mt-2 text-sm leading-7 text-stone">{scenario.context}</p>
              </div>
              <div className="rounded-[1.5rem] bg-forest-soft p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-forest">First AI line</p>
                <p className="mt-2 text-sm leading-7 text-stone">{scenario.opener}</p>
              </div>
              <div className="rounded-[1.5rem] bg-mist p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone">Target outcome</p>
                <p className="mt-2 text-sm leading-7 text-stone">{scenario.targetOutcome}</p>
              </div>
              <Link
                href={`/conversation?scenario=${scenario.id}`}
                aria-label={`Start simulation for ${scenario.title}`}
                className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-forest px-5 py-3 text-sm font-bold text-white"
              >
                Start Simulation
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          );
        })}
      </section>
    </main>
  );
}
