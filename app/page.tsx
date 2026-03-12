import Link from "next/link";
import { LessonCard, ScenarioCard, VocabularyCard } from "@/components/cards";
import { SectionTitle } from "@/components/section-title";
import { lessons, scenarios, vocabularyTerms } from "@/lib/mock-data";

const highlights = [
  "AI speaking practice with instant Hindi guidance",
  "Pronunciation scoring with sound-level feedback",
  "Vocabulary tracks for daily life, jobs, and business",
  "Real conversation simulations from public to corporate settings"
];

export default function HomePage() {
  return (
    <main>
      <section className="grid-pattern">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-8">
            <span className="inline-flex rounded-full border border-clay/20 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-clay">
              Hindi to English fluency
            </span>
            <div className="space-y-5">
              <h1 className="max-w-3xl bg-hero-glow bg-clip-text font-display text-5xl leading-tight text-ink sm:text-6xl">
                Learn English speaking from first sentence to boardroom confidence.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-ink/75">
                Bolo English helps Hindi speakers build grammar, pronunciation, vocabulary, and live speaking confidence with structured AI-led practice.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link href="/speaking" className="rounded-full bg-clay px-6 py-3 text-sm font-bold text-white hover:bg-clay/90">
                Start Speaking Practice
              </Link>
              <Link href="/simulation" className="rounded-full border border-ink/15 px-6 py-3 text-sm font-bold text-ink hover:border-teal hover:text-teal">
                Explore Simulations
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {highlights.map((highlight) => (
                <div key={highlight} className="rounded-2xl border border-ink/10 bg-white/80 px-4 py-4 text-sm text-ink/75 shadow-card">
                  {highlight}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] border border-ink/10 bg-white/85 p-8 shadow-card">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-teal">Learning Path</p>
            <div className="mt-6 space-y-5">
              {[
                "Beginner: greetings, daily conversation, sentence basics",
                "Intermediate: workplace English, confidence building, correction loops",
                "Advanced: interviews, presentations, nuanced grammar",
                "Professional: persuasion, leadership speaking, stakeholder communication"
              ].map((step) => (
                <div key={step} className="rounded-2xl bg-sand px-4 py-4 text-sm leading-6 text-ink/80">
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-10 px-6 py-16">
        <SectionTitle
          eyebrow="Courses"
          title="Structured speaking journeys for every stage"
          description="Each path mixes AI conversation, Hindi explanation, and pronunciation checkpoints so learners can progress without getting lost."
        />
        <div className="grid gap-6 lg:grid-cols-4">
          {lessons.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-10 px-6 py-16">
        <SectionTitle
          eyebrow="Vocabulary"
          title="Useful English, not just word lists"
          description="Practice vocabulary in context with Hindi meaning, sentence usage, and category-based revision."
        />
        <div className="grid gap-6 lg:grid-cols-2">
          {vocabularyTerms.slice(0, 2).map((term) => (
            <VocabularyCard key={term.id} term={term} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-10 px-6 py-16">
        <SectionTitle
          eyebrow="Simulations"
          title="Move from safe practice to real-world speaking pressure"
          description="Conversation scenarios are designed to reflect the moments where Hindi speakers often hesitate in English."
        />
        <div className="grid gap-6 lg:grid-cols-3">
          {scenarios.map((scenario) => (
            <ScenarioCard key={scenario.id} scenario={scenario} />
          ))}
        </div>
      </section>
    </main>
  );
}
