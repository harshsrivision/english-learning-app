import { GrammarTopic, Lesson, Scenario, VocabularyTerm } from "@/lib/types";

export function LessonCard({ lesson }: { lesson: Lesson }) {
  return (
    <div className="rounded-3xl border border-ink/10 bg-white/80 p-6 shadow-card">
      <div className="mb-4 flex items-center justify-between gap-4">
        <span className="rounded-full bg-clay/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-clay">
          {lesson.level}
        </span>
        <span className="text-sm text-ink/60">{lesson.durationMinutes} min</span>
      </div>
      <h3 className="font-display text-2xl text-ink">{lesson.title}</h3>
      <p className="mt-3 text-sm font-semibold text-teal">{lesson.focus}</p>
      <p className="mt-4 text-sm leading-6 text-ink/70">{lesson.hindiSummary}</p>
    </div>
  );
}

export function GrammarCard({ topic }: { topic: GrammarTopic }) {
  return (
    <div className="rounded-3xl border border-ink/10 bg-white/80 p-6 shadow-card">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">{topic.level}</p>
      <h3 className="mt-2 font-display text-2xl text-ink">{topic.englishTitle}</h3>
      <p className="text-sm font-semibold text-clay">{topic.hindiTitle}</p>
      <p className="mt-4 text-sm leading-6 text-ink/75">{topic.explanation}</p>
      <p className="mt-4 rounded-2xl bg-sand px-4 py-3 text-sm text-ink/75">{topic.example}</p>
    </div>
  );
}

export function VocabularyCard({ term }: { term: VocabularyTerm }) {
  return (
    <div className="rounded-3xl border border-ink/10 bg-white/80 p-6 shadow-card">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-display text-2xl text-ink">{term.english}</h3>
        <span className="rounded-full bg-teal/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-teal">
          {term.category}
        </span>
      </div>
      <p className="mt-2 text-sm font-semibold text-clay">{term.hindi}</p>
      <p className="mt-4 text-sm leading-6 text-ink/75">{term.usage}</p>
      <p className="mt-4 text-xs uppercase tracking-[0.2em] text-ink/50">{term.level}</p>
    </div>
  );
}

export function ScenarioCard({ scenario }: { scenario: Scenario }) {
  return (
    <div className="rounded-3xl border border-ink/10 bg-white/80 p-6 shadow-card">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">{scenario.difficulty}</p>
      <h3 className="mt-2 font-display text-2xl text-ink">{scenario.title}</h3>
      <p className="mt-4 text-sm leading-6 text-ink/75">{scenario.context}</p>
      <p className="mt-4 rounded-2xl bg-teal px-4 py-3 text-sm text-white">{scenario.targetOutcome}</p>
    </div>
  );
}
