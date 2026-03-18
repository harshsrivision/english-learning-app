"use client";

import { motion } from "framer-motion";
import { BookOpen, CheckCircle2, Mic2, Save, Sparkles, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { SectionHeading } from "@/components/section-heading";
import { apiFetchJson, getApiUrl, toApiErrorMessage } from "@/lib/api";
import { recordLearnerProgress } from "@/lib/local-progress";
import { useRequiredUserId } from "@/lib/use-required-user-id";

type DailyProgressResponse = {
  success?: boolean;
  sentences_spoken?: number;
  words_learned?: number;
  lessons_completed?: number;
  error?: string;
};

const quickActions = [
  { id: "sentence", title: "Practice Sentence", subtitle: "Ek aur line bolkar confidence badhao", icon: Mic2 },
  { id: "words", title: "Add 5 Words", subtitle: "Vocabulary ko roz thoda push do", icon: BookOpen },
  { id: "lesson", title: "Complete Lesson", subtitle: "Aaj ka ek milestone close karo", icon: CheckCircle2 }
] as const;

export default function PracticePage() {
  const { userId: activeUserId, isChecking } = useRequiredUserId();
  const [userId, setUserId] = useState("");
  const [sentences, setSentences] = useState(0);
  const [words, setWords] = useState(0);
  const [lessons, setLessons] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeUserId) {
      setUserId(String(activeUserId));
    }
  }, [activeUserId]);

  useEffect(() => {
    if (!activeUserId) {
      return;
    }

    let ignore = false;

    async function loadCurrentProgress() {
      try {
        const dailyProgressApiUrl = getApiUrl("dailyProgress");
        const data = await apiFetchJson<DailyProgressResponse>(`${dailyProgressApiUrl}/${activeUserId}`, {
          timeoutMs: 15000
        });

        if (!ignore) {
          setSentences(data.sentences_spoken ?? 0);
          setWords(data.words_learned ?? 0);
          setLessons(data.lessons_completed ?? 0);
        }
      } catch (requestError) {
        if (!ignore) {
          const message = toApiErrorMessage(requestError, "Daily progress could not be loaded.");
          setError(message);
        }
      }
    }

    void loadCurrentProgress();

    return () => {
      ignore = true;
    };
  }, [activeUserId]);

  if (isChecking || !activeUserId) {
    return (
      <main className="section-shell">
        <div className="surface-card p-8 text-sm text-stone">Checking account session...</div>
      </main>
    );
  }

  function clearFeedback() {
    setStatusMessage(null);
    setError(null);
  }

  function setCounters(nextProgress: { sentences: number; words: number; lessons: number }) {
    setSentences(nextProgress.sentences);
    setWords(nextProgress.words);
    setLessons(nextProgress.lessons);
  }

  async function recordSentence() {
    clearFeedback();
    const previousProgress = { sentences, words, lessons };
    const nextProgress = {
      sentences: sentences + 1,
      words,
      lessons
    };

    setCounters(nextProgress);
    const saved = await saveDailyProgress(nextProgress, false);

    if (!saved) {
      setCounters(previousProgress);
      return;
    }

    recordLearnerProgress({
      xp: 8,
      speakingMinutes: 1,
      streakActivity: true
    });
    setStatusMessage("Sentence practice saved.");
  }

  async function learnWords() {
    clearFeedback();
    const previousProgress = { sentences, words, lessons };
    const nextProgress = {
      sentences,
      words: words + 5,
      lessons
    };

    setCounters(nextProgress);
    const saved = await saveDailyProgress(nextProgress, false);

    if (!saved) {
      setCounters(previousProgress);
      return;
    }

    recordLearnerProgress({
      xp: 20,
      vocabularyWords: 5,
      streakActivity: true,
      weeklyStats: {
        vocabularyWords: 5
      }
    });
    setStatusMessage("5 vocabulary words saved to today's progress.");
  }

  async function completeLesson() {
    clearFeedback();
    const previousProgress = { sentences, words, lessons };
    const nextProgress = {
      sentences,
      words,
      lessons: lessons + 1
    };

    setCounters(nextProgress);
    const saved = await saveDailyProgress(nextProgress, false);

    if (!saved) {
      setCounters(previousProgress);
      return;
    }

    recordLearnerProgress({
      xp: 35,
      lessonsCompleted: 1,
      streakActivity: true
    });
    setStatusMessage("Lesson completion saved.");
  }

  async function saveDailyProgress(
    nextProgress: {
      sentences: number;
      words: number;
      lessons: number;
    } = {
      sentences,
      words,
      lessons
    },
    showSuccessMessage = true
  ) {
    setIsSaving(true);
    setStatusMessage(null);
    setError(null);

    const trimmedUserId = userId.trim();
    const parsedUserId = Number(trimmedUserId);

    if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
      setIsSaving(false);
      setError("Enter a valid positive user ID.");
      return false;
    }

    try {
      const data = await apiFetchJson<DailyProgressResponse>("dailyProgress", {
        method: "POST",
        timeoutMs: 15000,
        body: JSON.stringify({
          userId: parsedUserId,
          sentences: nextProgress.sentences,
          words: nextProgress.words,
          lessons: nextProgress.lessons
        })
      });

      if (!data.success) {
        throw new Error("Daily progress could not be saved.");
      }

      if (showSuccessMessage) {
        setStatusMessage("Today's progress has been saved.");
      }

      return true;
    } catch (requestError) {
      const message = toApiErrorMessage(requestError, "Daily progress could not be saved.");
      setError(message);
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  const statCards = [
    { title: "Sentences Spoken Today", subtitle: "Aaj mic kitni baar khula", value: sentences, icon: Mic2 },
    { title: "Words Learned Today", subtitle: "Aaj ki active vocabulary", value: words, icon: BookOpen },
    { title: "Lessons Completed Today", subtitle: "Aaj ka finished progress", value: lessons, icon: CheckCircle2 }
  ] as const;

  return (
    <main className="section-shell space-y-8">
      <SectionHeading
        eyebrow="Daily Practice"
        title="Roz Ka Practice Tracker"
        subtitle="Aaj kya kiya, kitna kiya, aur kya save hua"
        description="Yeh page quick actions ke liye hai. Jab tum short practice karte ho, yahaan se sentences, words, aur lesson completions ko turant update kar sakte ho."
      />

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="surface-card halo-panel p-6 sm:p-8">
          <div className="flex items-center gap-3 text-forest">
            <Sparkles className="h-5 w-5" />
            <p className="text-sm font-semibold uppercase tracking-[0.22em]">Practice routine</p>
          </div>
          <h2 className="mt-4 font-display text-3xl text-ink">Small actions, fast momentum</h2>
          <p className="mt-2 text-base font-medium text-stone">Chhote steps bhi roz ke progress ko strong banate hain</p>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-stone">
            Hindi speakers ke liye consistency sabse bada unlock hai. Isliye yahan big study session ke bina bhi progress save ho sakta hai.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {statCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.article
                  key={card.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="rounded-[1.6rem] bg-white p-5 shadow-card"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-soft text-forest">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-display text-xl text-ink">{card.title}</h3>
                  <p className="mt-2 text-sm text-stone">{card.subtitle}</p>
                  <p className="mt-4 text-3xl font-bold text-ink">{card.value}</p>
                </motion.article>
              );
            })}
          </div>
        </div>

        <div className="surface-card p-6 sm:p-8">
          <h2 className="font-display text-3xl text-ink">Quick Actions</h2>
          <p className="mt-2 text-base font-medium text-stone">Ek tap mein aaj ka short practice update karo</p>
          <div className="mt-6 space-y-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              const onClick = action.id === "sentence" ? recordSentence : action.id === "words" ? learnWords : completeLesson;

              return (
                <button
                  key={action.id}
                  type="button"
                  aria-label={action.title}
                  onClick={() => void onClick()}
                  disabled={isSaving}
                  className="flex w-full items-center justify-between rounded-[1.6rem] border border-ink/10 bg-mist px-5 py-4 text-left transition hover:border-forest/20 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-forest shadow-card">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-ink">{action.title}</p>
                      <p className="mt-1 text-sm text-stone">{action.subtitle}</p>
                    </div>
                  </div>
                  <Zap className="h-5 w-5 text-gold" />
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-[1.6rem] bg-ink p-5 text-white">
            <p className="text-xs uppercase tracking-[0.22em] text-white/65">Save progress</p>
            <p className="mt-2 text-sm leading-7 text-white/80">Quick actions save to the backend immediately. Use this button if you want to sync the current counters again for the active learner.</p>
            <button
              type="button"
              aria-label="Save all daily practice progress"
              onClick={() => void saveDailyProgress()}
              disabled={isSaving}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-forest px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-forest/50"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save All Progress"}
            </button>
          </div>
        </div>
      </section>

      <section className="surface-card p-6 sm:p-8">
        <label className="text-sm font-semibold text-ink" htmlFor="user-id">
          Active user ID
        </label>
        <p className="mt-2 text-sm leading-7 text-stone">Local session se user ID auto-fill hota hai. Zaroorat pade to tum ise manually bhi change kar sakte ho.</p>
        <input
          id="user-id"
          aria-label="Edit active user ID"
          type="number"
          min="1"
          step="1"
          value={userId}
          onChange={(event) => {
            clearFeedback();
            setUserId(event.target.value);
          }}
          placeholder="Enter user ID"
          className="mt-4 h-14 w-full max-w-xs rounded-full border border-ink/10 bg-mist px-5 text-sm text-ink outline-none placeholder:text-stone/50 focus:border-forest"
        />

        {statusMessage ? <p className="mt-4 rounded-2xl bg-forest-soft px-4 py-3 text-sm text-forest">{statusMessage}</p> : null}
        {error ? <p className="mt-4 rounded-2xl bg-clay/10 px-4 py-3 text-sm text-clay">{error}</p> : null}
      </section>
    </main>
  );
}
