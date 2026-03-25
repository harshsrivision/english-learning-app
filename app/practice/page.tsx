"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, CheckCircle2, Mic2, Save, Sparkles, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { SectionHeading } from "@/components/section-heading";
import { apiFetchJson, getApiUrl, toApiErrorMessage } from "@/lib/api";
import { buildSignupHref } from "@/lib/auth-navigation";
import { recordLearnerProgress } from "@/lib/local-progress";
import { useRequiredUserId } from "@/lib/use-required-user-id";

type DailyProgressResponse = {
  success?: boolean;
  sentences_spoken?: number;
  words_learned?: number;
  lessons_completed?: number;
  progress?: {
    sentences_spoken?: number;
    words_learned?: number;
    lessons_completed?: number;
  };
  error?: string;
};

const quickActions = [
  { id: "sentence", title: "Practice Sentence", subtitle: "Ek aur line bolkar confidence badhao", icon: Mic2 },
  { id: "words", title: "Add 5 Words", subtitle: "Vocabulary ko roz thoda push do", icon: BookOpen },
  { id: "lesson", title: "Complete Lesson", subtitle: "Aaj ka ek milestone close karo", icon: CheckCircle2 }
] as const;

export default function PracticePage() {
  const { userId: activeUserId, isChecking } = useRequiredUserId({ redirectIfMissing: false });
  const signupHref = buildSignupHref("/practice");
  const [sentences, setSentences] = useState(0);
  const [words, setWords] = useState(0);
  const [lessons, setLessons] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeUserId) {
      setSentences(0);
      setWords(0);
      setLessons(0);
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

  function clearFeedback() {
    setStatusMessage(null);
    setError(null);
  }

  function setCounters(nextProgress: { sentences: number; words: number; lessons: number }) {
    setSentences(nextProgress.sentences);
    setWords(nextProgress.words);
    setLessons(nextProgress.lessons);
  }

  function getSuccessMessage(loggedInMessage: string, guestMessage: string) {
    return activeUserId ? loggedInMessage : guestMessage;
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
    setStatusMessage(getSuccessMessage("Sentence practice save ho gayi.", "Sentence practice local mode mein add ho gayi."));
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
    setStatusMessage(getSuccessMessage("5 words aaj ke progress mein save ho gaye.", "5 words local practice mein add ho gaye."));
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
    setStatusMessage(getSuccessMessage("Lesson completion save ho gaya.", "Lesson completion local mode mein add ho gaya."));
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
    if (!activeUserId) {
      if (showSuccessMessage) {
        setStatusMessage("Guest mode mein progress local hi rahega. Login karke backend sync karo.");
      }

      return true;
    }

    setIsSaving(true);
    setStatusMessage(null);
    setError(null);

    try {
      const data = await apiFetchJson<DailyProgressResponse>("dailyProgress", {
        method: "POST",
        timeoutMs: 15000,
        body: JSON.stringify({
          userId: activeUserId,
          sentences: nextProgress.sentences,
          words: nextProgress.words,
          lessons: nextProgress.lessons
        })
      });

      if (!data.success) {
        throw new Error("Daily progress could not be saved.");
      }

      if (showSuccessMessage) {
        setStatusMessage("Aaj ka practice backend par sync ho gaya.");
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

      {!isChecking && !activeUserId ? (
        <section className="surface-card p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-forest">Progress save karne ke liye login karo</p>
            <Link
              href={signupHref}
              aria-label="Open signup page to sync practice progress"
              className="inline-flex items-center justify-center rounded-full bg-forest px-5 py-3 text-sm font-bold text-white"
            >
              Start Free
            </Link>
          </div>
        </section>
      ) : null}

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
            <p className="mt-2 text-sm leading-7 text-white/80">
              {activeUserId
                ? "Quick actions backend par turant sync hote hain. Zaroorat pade to is button se current counters dobara save kar sakte ho."
                : "Quick actions abhi local mode mein chal rahe hain. Login ke baad yahi counters backend ke saath sync honge."}
            </p>
            {activeUserId ? (
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
            ) : (
              <Link
                href={signupHref}
                aria-label="Create an account to sync daily practice progress"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-forest px-5 py-3 text-sm font-bold text-white"
              >
                <Save className="h-4 w-4" />
                Start Free
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="surface-card p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-forest">{activeUserId ? "Synced session" : "Guest mode"}</p>
        <h2 className="mt-4 font-display text-3xl text-ink">{activeUserId ? "Backend sync is active" : "Practice without login"}</h2>
        <p className="mt-3 text-sm leading-7 text-stone">
          {activeUserId
            ? `User ID ${activeUserId} ke saath tumhara practice backend aur local progress dono ke saath sync ho raha hai.`
            : "Quick actions sabke liye kaam karte hain. Bas guest mode mein yeh progress is device par local hi rahega jab tak tum login nahi karte."}
        </p>

        {statusMessage ? <p className="mt-4 rounded-2xl bg-forest-soft px-4 py-3 text-sm text-forest">{statusMessage}</p> : null}
        {error ? <p className="mt-4 rounded-2xl bg-clay/10 px-4 py-3 text-sm text-clay">{error}</p> : null}
      </section>
    </main>
  );
}
