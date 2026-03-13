"use client";

import { useEffect, useState } from "react";
import { SectionTitle } from "@/components/section-title";
import { getApiUrl } from "@/lib/api";
import { useRequiredUserId } from "@/lib/use-required-user-id";

type VocabularyWord = {
  id: number;
  word: string;
  meaning: string;
  example: string;
};

type VocabularyProgressResponse = {
  success?: boolean;
  correctCount?: number;
  error?: string;
};

export default function VocabularyPage() {
  const { userId, isChecking } = useRequiredUserId();
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeWordId, setActiveWordId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [practiceMessage, setPracticeMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadVocabulary() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(getApiUrl("vocabulary"));
        const data = (await response.json()) as VocabularyWord[] | { error?: string };

        if (!response.ok || !Array.isArray(data)) {
          throw new Error(!Array.isArray(data) ? data.error ?? "Vocabulary could not be loaded." : "Vocabulary could not be loaded.");
        }

        if (!ignore) {
          setWords(data);
        }
      } catch (requestError) {
        const message = requestError instanceof Error ? requestError.message : "Vocabulary could not be loaded.";

        if (!ignore) {
          setError(message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void loadVocabulary();

    return () => {
      ignore = true;
    };
  }, []);

  if (isChecking || !userId) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="rounded-[2rem] border border-dashed border-ink/15 bg-white/70 p-8 text-sm text-ink/65">Checking account session...</div>
      </main>
    );
  }

  async function recordPractice(wordId: number, word: string) {
    if (!userId) {
      setError("Log in before saving vocabulary practice.");
      return;
    }

    setActiveWordId(wordId);
    setPracticeMessage(null);
    setError(null);

    try {
      const response = await fetch(getApiUrl("vocabularyProgress"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId,
          wordId
        })
      });

      const data = (await response.json()) as VocabularyProgressResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "Vocabulary progress could not be saved.");
      }

      setPracticeMessage(`Saved practice for "${word}"${typeof data.correctCount === "number" ? ` (${data.correctCount}x)` : ""}.`);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Vocabulary progress could not be saved.";
      setError(message);
    } finally {
      setActiveWordId(null);
    }
  }

  return (
    <main className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 sm:py-16">
      <SectionTitle
        eyebrow="Vocabulary Builder"
        title="Study key words and save practice history"
        description="Words are loaded from the backend vocabulary table. Use the practice button to record progress for the logged-in learner while you review meaning and usage."
      />

      {error ? <p className="rounded-2xl bg-clay/10 px-4 py-3 text-sm text-clay">{error}</p> : null}
      {practiceMessage ? <p className="rounded-2xl bg-teal/10 px-4 py-3 text-sm text-teal">{practiceMessage}</p> : null}

      {isLoading ? (
        <div className="rounded-[2rem] border border-dashed border-ink/15 bg-white/70 p-8 text-sm text-ink/65">Loading vocabulary...</div>
      ) : (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {words.map((word) => (
            <article key={word.id} className="rounded-[2rem] border border-ink/10 bg-white/85 p-6 shadow-card">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-teal">Word of Practice</p>
              <h2 className="mt-4 font-display text-3xl text-ink">{word.word}</h2>
              <div className="mt-5 rounded-3xl bg-sand/80 p-5">
                <p className="text-sm font-semibold text-clay">Meaning</p>
                <p className="mt-2 text-2xl font-semibold text-ink">{word.meaning}</p>
                <p className="mt-4 text-sm font-semibold text-clay">Example</p>
                <p className="mt-2 text-sm leading-6 text-ink/75">{word.example}</p>
              </div>

              <button
                type="button"
                onClick={() => void recordPractice(word.id, word.word)}
                disabled={activeWordId === word.id}
                className="mt-6 rounded-full bg-clay px-5 py-3 text-sm font-bold text-white hover:bg-clay/90 disabled:cursor-not-allowed disabled:bg-clay/50"
              >
                {activeWordId === word.id ? "Saving..." : "Mark Practiced"}
              </button>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
