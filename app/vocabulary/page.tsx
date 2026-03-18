"use client";

import { motion } from "framer-motion";
import { BookOpen, CheckCircle2, Sparkles, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { SectionHeading } from "@/components/section-heading";
import { apiFetchJson, toApiErrorMessage } from "@/lib/api";
import { recordLearnerProgress } from "@/lib/local-progress";
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

        const data = await apiFetchJson<VocabularyWord[] | { error?: string }>("vocabulary", {
          timeoutMs: 15000
        });

        if (!Array.isArray(data)) {
          throw new Error("Vocabulary could not be loaded.");
        }

        if (!ignore) {
          setWords(data);
        }
      } catch (requestError) {
        const message = toApiErrorMessage(requestError, "Vocabulary could not be loaded.");

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
      <main className="section-shell">
        <div className="surface-card p-8 text-sm text-stone">Checking account session...</div>
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
      const data = await apiFetchJson<VocabularyProgressResponse>("vocabularyProgress", {
        method: "POST",
        timeoutMs: 15000,
        body: JSON.stringify({
          userId,
          wordId
        })
      });

      if (!data.success) {
        throw new Error("Vocabulary progress could not be saved.");
      }

      const isFirstSavedWord = data.correctCount === 1;
      recordLearnerProgress({
        xp: isFirstSavedWord ? 12 : 4,
        vocabularyWords: isFirstSavedWord ? 1 : 0,
        streakActivity: true,
        weeklyStats: {
          vocabularyWords: isFirstSavedWord ? 1 : 0
        }
      });

      setPracticeMessage(`Saved practice for '${word}'${typeof data.correctCount === "number" ? ` (${data.correctCount}x)` : ""}.`);
    } catch (requestError) {
      const message = toApiErrorMessage(requestError, "Vocabulary progress could not be saved.");
      setError(message);
    } finally {
      setActiveWordId(null);
    }
  }

  const exampleCount = words.filter((word) => word.example.trim().length > 0).length;

  return (
    <main className="section-shell space-y-10">
      <SectionHeading
        eyebrow="Vocabulary"
        title="Word Bank Jo Kaam Aaye"
        subtitle="Useful English words with Hindi meaning, context, and quick practice"
        description="Sirf list ya rote memorisation nahi. Yahaan har word ka practical meaning aur usage diya gaya hai, taaki bolte waqt yaad bhi aaye."
      />

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="surface-card halo-panel p-6 sm:p-8">
          <div className="flex items-center gap-3 text-forest">
            <Sparkles className="h-5 w-5" />
            <p className="text-sm font-semibold uppercase tracking-[0.22em]">Vocabulary system</p>
          </div>
          <h2 className="mt-4 font-display text-3xl text-ink">Learn less, use more</h2>
          <p className="mt-2 text-base font-medium text-stone">Kam shabd yaad karo, lekin unhe baar baar bolkar pakka karo</p>
          <p className="mt-3 text-sm leading-7 text-stone">Har word ko teen cheezon ke saath pakdo: meaning, sentence, aur one real-life use case. Isi se passive word active speech mein aata hai.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.5rem] bg-white p-5 shadow-card">
              <p className="text-sm text-stone">Backend words</p>
              <p className="mt-3 text-3xl font-bold text-ink">{words.length}</p>
            </div>
            <div className="rounded-[1.5rem] bg-white p-5 shadow-card">
              <p className="text-sm text-stone">Example lines</p>
              <p className="mt-3 text-3xl font-bold text-ink">{exampleCount}</p>
            </div>
            <div className="rounded-[1.5rem] bg-white p-5 shadow-card">
              <p className="text-sm text-stone">Suggested target</p>
              <p className="mt-3 text-3xl font-bold text-ink">5/day</p>
            </div>
          </div>
        </div>

        <div className="surface-card p-6 sm:p-8">
          <h2 className="font-display text-3xl text-ink">Daily Review Ladder</h2>
          <p className="mt-2 text-base font-medium text-stone">Har word ko yaad se use tak le jane ka chhota routine</p>
          <div className="mt-6 space-y-3">
            {["Word padho", "Hindi meaning bolo", "Example line repeat karo", "Apni line banao"].map((item, index) => (
              <div key={item} className="flex items-center gap-4 rounded-[1.4rem] bg-mist px-4 py-4 text-sm text-stone">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white font-bold text-forest shadow-card">{index + 1}</div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {error ? <p className="rounded-2xl bg-clay/10 px-4 py-3 text-sm text-clay">{error}</p> : null}
      {practiceMessage ? <p className="rounded-2xl bg-forest-soft px-4 py-3 text-sm text-forest">{practiceMessage}</p> : null}

      {isLoading ? (
        <div className="surface-card p-8 text-sm text-stone">Loading vocabulary...</div>
      ) : (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {words.map((word, index) => (
            <motion.article
              key={word.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: index * 0.03 }}
              whileHover={{ y: -6 }}
              className="surface-card flex h-full flex-col gap-5 p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-forest-soft px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-forest">Word of Practice</span>
                <BookOpen className="h-5 w-5 text-forest" />
              </div>
              <div>
                <h2 className="font-display text-3xl text-ink">{word.word}</h2>
                <p className="mt-2 text-sm font-semibold text-stone">Hindi meaning ke saath active recall</p>
              </div>
              <div className="rounded-[1.5rem] bg-mist p-5">
                <p className="text-sm font-semibold text-ink">Meaning</p>
                <p className="mt-2 text-2xl font-semibold text-clay">{word.meaning}</p>
                <p className="mt-4 text-sm font-semibold text-ink">Example</p>
                <p className="mt-2 text-sm leading-7 text-stone">{word.example}</p>
              </div>

              <button
                type="button"
                aria-label={`Mark ${word.word} as practiced`}
                onClick={() => void recordPractice(word.id, word.word)}
                disabled={activeWordId === word.id}
                className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-forest px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-forest/50"
              >
                <Target className="h-4 w-4" />
                {activeWordId === word.id ? "Saving..." : "Mark Practiced"}
              </button>
            </motion.article>
          ))}
        </section>
      )}

      <section className="surface-card p-6 sm:p-8">
        <div className="flex items-center gap-3 text-forest">
          <CheckCircle2 className="h-5 w-5" />
          <div>
            <h2 className="font-display text-3xl text-ink">Use It Tonight</h2>
            <p className="mt-2 text-sm font-medium text-stone">Aaj hi nayi vocabulary ko kisi real sentence mein daalo</p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-7 text-stone">Aaj ke 3 words chunno aur unse ek WhatsApp-style self-introduction ya office update sentence banao. Real use se retention sabse fast hota hai.</p>
      </section>
    </main>
  );
}
