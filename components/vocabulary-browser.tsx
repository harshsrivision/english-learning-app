"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { foundationVocabularyTerms } from "@/server/vocabulary-foundation";
import { advancedVocabularyTerms } from "@/server/vocabulary-advanced";
import { apiFetchJson } from "@/lib/api";
import { readLearnedWordIds, writeLearnedWordIds } from "@/lib/guest-learning-progress";
import { readLearnerProgress, recordLearnerProgress } from "@/lib/local-progress";
import { getLevelBadgeClasses, getProgressWidthClass, type CefrLevel, type VocabularyCategory, type VocabularyTerm } from "@/lib/learning";
import { useUserSession } from "@/lib/use-user-session";

const levelFilters: Array<"All" | CefrLevel> = ["All", "A0", "A1", "A2", "B1", "B2", "C1"];
const categoryFilters: Array<"All" | VocabularyCategory> = [
  "All",
  "Work",
  "Business",
  "Daily Life",
  "Travel",
  "Personality",
  "Communication",
  "Meetings",
  "Interview",
  "Leadership",
  "Social"
];
const fallbackVocabularyWords = [...foundationVocabularyTerms, ...advancedVocabularyTerms].slice(0, 100) as VocabularyTerm[];

function getCategoryBadgeClass() {
  return "rounded-full bg-forest-soft px-3 py-1 text-xs font-semibold text-forest";
}

function getVocabularyApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/+$/, "");
}

export function VocabularyBrowser() {
  const { userId } = useUserSession();
  const [words, setWords] = useState<VocabularyTerm[]>([]);
  const [learnedWordIds, setLearnedWordIds] = useState<number[]>([]);
  const [streakDays, setStreakDays] = useState(0);
  const [activeLevel, setActiveLevel] = useState<"All" | CefrLevel>("All");
  const [activeCategory, setActiveCategory] = useState<"All" | VocabularyCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedWordId, setExpandedWordId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLearnedWordIds(readLearnedWordIds());
    setStreakDays(readLearnerProgress().streakDays);
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadWords() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`${getVocabularyApiBaseUrl()}/vocabulary`);

        if (!response.ok) {
          throw new Error("Failed to load vocabulary");
        }

        const data = (await response.json().catch(() => [])) as VocabularyTerm[];
        const nextWords = Array.isArray(data) && data.length ? data.slice(0, 100) : fallbackVocabularyWords;

        if (!ignore) {
          setWords(nextWords);
        }
      } catch {
        if (!ignore) {
          setWords(fallbackVocabularyWords);
          setError("Vocabulary offline mode mein dikhayi ja rahi hai — backend se connect nahi ho pa raha.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void loadWords();

    return () => {
      ignore = true;
    };
  }, []);

  const learnedSet = useMemo(() => new Set(learnedWordIds), [learnedWordIds]);
  const filteredWords = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return words.filter((word) => {
      const english = word.english ?? "";
      const hindi = word.hindi ?? "";
      const hindiPronunciation = word.hindiPronunciation ?? "";
      const matchesLevel = activeLevel === "All" || word.cefrLevel === activeLevel;
      const matchesCategory = activeCategory === "All" || word.category === activeCategory;
      const matchesQuery =
        !normalizedQuery ||
        english.toLowerCase().includes(normalizedQuery) ||
        hindi.toLowerCase().includes(normalizedQuery) ||
        hindiPronunciation.toLowerCase().includes(normalizedQuery);

      return matchesLevel && matchesCategory && matchesQuery;
    });
  }, [activeCategory, activeLevel, searchQuery, words]);

  const learnedCount = learnedWordIds.length;
  const progressPercent = words.length ? Math.round((learnedCount / words.length) * 100) : 0;

  async function toggleLearned(wordId: number) {
    const isLearned = learnedSet.has(wordId);
    const nextWordIds = isLearned ? learnedWordIds.filter((id) => id !== wordId) : Array.from(new Set([...learnedWordIds, wordId]));

    setLearnedWordIds(nextWordIds);
    writeLearnedWordIds(nextWordIds);

    if (!isLearned) {
      recordLearnerProgress({
        xp: 4,
        vocabularyWords: 1,
        streakActivity: true,
        weeklyStats: { vocabularyWords: 1 }
      });
    }

    if (!isLearned && userId) {
      try {
        await apiFetchJson<{ success?: boolean }>("vocabularyProgress", {
          method: "POST",
          timeoutMs: 15000,
          body: JSON.stringify({ userId, wordId })
        });
      } catch {
        // Local learned state stays responsive even if backend sync misses.
      }
    }
  }

  return (
    <main className="section-shell space-y-6">
      <section className="surface-card p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-forest">Vocabulary progress</p>
            <p className="mt-2 font-display text-3xl text-ink">{learnedCount} / 100 words learned</p>
            <div className="mt-4 h-2 w-full max-w-sm rounded-full bg-ink/10">
              <div className={`h-2 rounded-full bg-forest transition-all ${getProgressWidthClass(progressPercent)}`} />
            </div>
          </div>
          <div className="rounded-[1.5rem] bg-forest px-5 py-3 text-white">
            <p className="text-xs uppercase tracking-[0.22em] text-white/70">Current streak</p>
            <p className="mt-1 text-2xl font-bold">{streakDays} days</p>
          </div>
        </div>
      </section>

      <section className="surface-card p-6 sm:p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-forest">Level</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {levelFilters.map((level) => (
              <button
                key={level}
                type="button"
                aria-label={`Filter vocabulary by level ${level}`}
                onClick={() => setActiveLevel(level)}
                className={
                  activeLevel === level
                    ? "rounded-full bg-forest px-4 py-2 text-xs font-bold text-white"
                    : "rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold text-stone hover:border-forest/30"
                }
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-forest">Category</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {categoryFilters.map((category) => (
              <button
                key={category}
                type="button"
                aria-label={`Filter vocabulary by category ${category}`}
                onClick={() => setActiveCategory(category)}
                className={
                  activeCategory === category
                    ? "rounded-full bg-forest px-4 py-2 text-xs font-bold text-white"
                    : "rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold text-stone hover:border-forest/30"
                }
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <input
            aria-label="Search vocabulary words by English or Hindi"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by English or Hindi"
            className="h-12 w-full rounded-full border border-ink/10 bg-mist px-5 text-sm text-ink outline-none placeholder:text-stone/60 focus:border-forest"
          />
        </div>
      </section>

      {error ? <p className="rounded-[1.5rem] bg-red-50 px-5 py-4 text-sm text-red-800">{error}</p> : null}
      {isLoading ? <div className="surface-card p-6 text-sm text-stone">Vocabulary loading ho rahi hai...</div> : null}

      {!isLoading ? (
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredWords.length ? (
            filteredWords.map((word) => {
              const isExpanded = expandedWordId === word.id;
              const isLearned = learnedSet.has(word.id);

              return (
                <article
                  key={word.id}
                  className={`surface-card cursor-pointer p-6 transition hover:shadow-float ${isLearned ? "border-2 border-green-400" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      <span className={getLevelBadgeClasses(word.cefrLevel)}>{word.cefrLevel}</span>
                      <span className={getCategoryBadgeClass()}>{word.category}</span>
                    </div>
                    <button
                      type="button"
                      aria-label={`${isExpanded ? "Collapse" : "Expand"} vocabulary card for ${word.english}`}
                      onClick={() => setExpandedWordId(isExpanded ? null : word.id)}
                      className="inline-flex items-center justify-center rounded-full border border-ink/10 bg-white p-2 text-stone transition hover:border-forest/30 hover:text-forest"
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>

                  <button
                    type="button"
                    aria-label={`Open details for vocabulary word ${word.english}`}
                    onClick={() => setExpandedWordId(isExpanded ? null : word.id)}
                    className="w-full text-left"
                  >
                    <p className="mt-4 font-display text-3xl text-ink">{word.english}</p>
                    <p className="mt-2 text-base font-semibold text-forest">{word.hindi}</p>
                    <p className="mt-1 text-xs italic text-stone">{word.hindiPronunciation ?? ""}</p>
                  </button>

                  {isExpanded ? (
                    <div className="mt-5 space-y-4">
                      <div className="rounded-[1.5rem] bg-gold/10 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">MEMORY TIP</p>
                        <p className="mt-2 text-sm leading-7 text-stone">{word.memoryTip ?? ""}</p>
                      </div>

                      <div className="rounded-r-2xl border-l-4 border-forest bg-mist px-5 py-4">
                        <p className="text-sm font-semibold text-ink">{word.usage}</p>
                        <p className="mt-1 text-xs text-stone">{word.hindiUsage ?? ""}</p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone">Kab bolte hain?</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(word.useCases ?? []).map((useCase) => (
                            <span key={useCase} className="rounded-full border border-ink/10 bg-mist px-3 py-1 text-xs text-stone">
                              {useCase}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone">Similar words</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(word.synonyms ?? []).map((synonym) => (
                            <span key={synonym} className="rounded-full bg-sky px-3 py-1 text-xs font-semibold text-blue-700">
                              {synonym}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-5 border-t border-ink/10 pt-4">
                    <button
                      type="button"
                      aria-label={`${isLearned ? "Unmark" : "Mark"} ${word.english} as learned`}
                      onClick={() => void toggleLearned(word.id)}
                      className={`w-full rounded-full border px-5 py-3 text-sm font-bold ${isLearned ? "border-green-400 bg-green-100 text-green-800" : "border-ink/10 bg-white text-ink hover:border-forest/30"}`}
                    >
                      {isLearned ? "Learned" : "I know this"}
                    </button>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="col-span-full rounded-[2rem] border border-dashed border-ink/15 bg-white/80 px-6 py-16 text-center">
              <p className="font-display text-2xl text-ink">Koi word nahi mila</p>
              <p className="mt-2 text-sm text-stone">Filter change karke dekho</p>
            </div>
          )}
        </section>
      ) : null}
    </main>
  );
}


