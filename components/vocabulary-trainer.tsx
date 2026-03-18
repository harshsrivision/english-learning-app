"use client";

import { useEffect, useState } from "react";
import { VocabularyTerm } from "@/lib/types";

type VocabularyStatus = "new" | "learning" | "mastered";

type VocabularyTrainerProps = {
  terms: VocabularyTerm[];
};

const statusOrder: Record<VocabularyStatus, number> = {
  new: 0,
  learning: 1,
  mastered: 2
};

export function VocabularyTrainer({ terms }: VocabularyTrainerProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [revealedCardId, setRevealedCardId] = useState<number | null>(terms[0]?.id ?? null);
  const [statuses, setStatuses] = useState<Record<number, VocabularyStatus>>({});
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("bolo-vocabulary-statuses");
    if (saved) {
      setStatuses(JSON.parse(saved) as Record<number, VocabularyStatus>);
    }

    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (!hasLoaded) {
      return;
    }

    window.localStorage.setItem("bolo-vocabulary-statuses", JSON.stringify(statuses));
  }, [hasLoaded, statuses]);

  const categories = ["All", ...new Set(terms.map((term) => term.category))];
  const levels = ["All", ...new Set(terms.map((term) => term.level))];
  const filteredTerms = terms
    .filter((term) => {
      const matchesQuery =
        term.english.toLowerCase().includes(query.toLowerCase()) ||
        term.hindi.toLowerCase().includes(query.toLowerCase()) ||
        term.usage.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = selectedCategory === "All" || term.category === selectedCategory;
      const matchesLevel = selectedLevel === "All" || term.level === selectedLevel;

      return matchesQuery && matchesCategory && matchesLevel;
    })
    .sort((left, right) => {
      const leftStatus = statuses[left.id] ?? "new";
      const rightStatus = statuses[right.id] ?? "new";

      return statusOrder[leftStatus] - statusOrder[rightStatus];
    });

  const masteredCount = Object.values(statuses).filter((status) => status === "mastered").length;
  const learningCount = Object.values(statuses).filter((status) => status === "learning").length;
  const reviewCount = filteredTerms.filter((term) => (statuses[term.id] ?? "new") !== "mastered").length;

  function setStatus(id: number, status: VocabularyStatus) {
    setStatuses((current) => ({
      ...current,
      [id]: status
    }));
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-ink/10 bg-white/85 p-6 shadow-card">
          <label className="text-sm font-semibold text-ink" htmlFor="vocabulary-search">
            Search words or Hindi meanings
          </label>
          <input
            id="vocabulary-search"
            aria-label="Search vocabulary words or Hindi meanings"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search: schedule, parinam, polite..."
            className="mt-3 w-full rounded-full border border-ink/10 bg-sand px-5 py-3 text-sm text-ink outline-none placeholder:text-ink/35 focus:border-teal"
          />

          <div className="mt-6">
            <p className="text-sm font-semibold text-ink">Category</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  aria-label={`Filter vocabulary by category ${category}`}
                  aria-pressed={selectedCategory === category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    selectedCategory === category ? "bg-teal text-white" : "bg-sand text-ink hover:bg-white"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm font-semibold text-ink">Level</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {levels.map((level) => (
                <button
                  key={level}
                  type="button"
                  aria-label={`Filter vocabulary by level ${level}`}
                  aria-pressed={selectedLevel === level}
                  onClick={() => setSelectedLevel(level)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    selectedLevel === level ? "bg-clay text-white" : "bg-sand text-ink hover:bg-white"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <div className="rounded-[2rem] border border-ink/10 bg-white/85 p-5 shadow-card">
            <p className="text-sm text-ink/60">Mastered</p>
            <p className="mt-2 text-3xl font-semibold text-teal">{masteredCount}</p>
          </div>
          <div className="rounded-[2rem] border border-ink/10 bg-white/85 p-5 shadow-card">
            <p className="text-sm text-ink/60">Learning</p>
            <p className="mt-2 text-3xl font-semibold text-clay">{learningCount}</p>
          </div>
          <div className="rounded-[2rem] border border-ink/10 bg-white/85 p-5 shadow-card">
            <p className="text-sm text-ink/60">Need Review</p>
            <p className="mt-2 text-3xl font-semibold text-ink">{reviewCount}</p>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-ink/10 bg-ink p-6 text-white shadow-card">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold">Hindi Vocabulary Review</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {filteredTerms.slice(0, 3).map((term) => (
            <div key={term.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-white/65">{term.category}</p>
              <h3 className="mt-2 font-display text-3xl">{term.english}</h3>
              <p className="mt-3 text-base font-semibold text-gold">{term.hindi}</p>
              <p className="mt-3 text-sm leading-6 text-white/80">{term.usage}</p>
            </div>
          ))}
        </div>
      </div>

      {filteredTerms.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {filteredTerms.map((term) => {
            const status = statuses[term.id] ?? "new";
            const isRevealed = revealedCardId === term.id;

            return (
              <article key={term.id} className="rounded-[2rem] border border-ink/10 bg-white/85 p-6 shadow-card">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-teal">{term.category}</p>
                    <h3 className="mt-2 font-display text-3xl text-ink">{term.english}</h3>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] ${
                      status === "mastered"
                        ? "bg-teal/10 text-teal"
                        : status === "learning"
                          ? "bg-clay/10 text-clay"
                          : "bg-sand text-ink/70"
                    }`}
                  >
                    {status}
                  </span>
                </div>

                <p className="mt-3 text-sm uppercase tracking-[0.2em] text-ink/45">{term.level}</p>

                <div className="mt-5 rounded-3xl bg-sand p-5">
                  <p className="text-sm font-semibold text-ink">Hindi meaning</p>
                  <p className="mt-2 text-2xl font-semibold text-clay">{isRevealed ? term.hindi : "Tap reveal to study this meaning"}</p>
                  <p className="mt-4 text-sm leading-6 text-ink/70">
                    {isRevealed ? term.usage : "Usage sentence stays hidden until you reveal the card."}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    aria-label={`${isRevealed ? "Hide" : "Reveal"} Hindi meaning for ${term.english}`}
                    onClick={() => setRevealedCardId(isRevealed ? null : term.id)}
                    className="rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold text-ink hover:border-teal hover:text-teal"
                  >
                    {isRevealed ? "Hide" : "Reveal"}
                  </button>
                  <button
                    type="button"
                    aria-label={`Mark ${term.english} as learning`}
                    onClick={() => setStatus(term.id, "learning")}
                    className="rounded-full bg-clay px-4 py-2 text-sm font-semibold text-white hover:bg-clay/90"
                  >
                    Mark Learning
                  </button>
                  <button
                    type="button"
                    aria-label={`Mark ${term.english} as mastered`}
                    onClick={() => setStatus(term.id, "mastered")}
                    className="rounded-full bg-teal px-4 py-2 text-sm font-semibold text-white hover:bg-teal/90"
                  >
                    Mark Mastered
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[2rem] border border-dashed border-ink/15 bg-white/70 p-8 text-center text-sm text-ink/60">
          No vocabulary items match the current filters. Try a different category, level, or search term.
        </div>
      )}
    </div>
  );
}
