"use client";

import { useEffect, useState } from "react";
import { useRequiredUserId } from "@/lib/use-required-user-id";

type DailyProgressResponse = {
  success?: boolean;
  sentences_spoken?: number;
  words_learned?: number;
  lessons_completed?: number;
  error?: string;
};

const dailyProgressApiUrl = process.env.NEXT_PUBLIC_DAILY_PROGRESS_API_URL ?? "http://localhost:4000/daily-progress";

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
        const response = await fetch(`${dailyProgressApiUrl}/${activeUserId}`);
        const data = (await response.json()) as DailyProgressResponse;

        if (!response.ok) {
          throw new Error(data.error ?? "Daily progress could not be loaded.");
        }

        if (!ignore) {
          setSentences(data.sentences_spoken ?? 0);
          setWords(data.words_learned ?? 0);
          setLessons(data.lessons_completed ?? 0);
        }
      } catch (requestError) {
        if (!ignore) {
          const message = requestError instanceof Error ? requestError.message : "Daily progress could not be loaded.";
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
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="rounded-[2rem] border border-dashed border-ink/15 bg-white/70 p-8 text-sm text-ink/65">Checking account session...</div>
      </main>
    );
  }

  function clearFeedback() {
    setStatusMessage(null);
    setError(null);
  }

  async function recordSentence() {
    clearFeedback();
    const nextProgress = {
      sentences: sentences + 1,
      words,
      lessons
    };

    setSentences(nextProgress.sentences);
    await saveDailyProgress(nextProgress, false);
  }

  function learnWords() {
    clearFeedback();
    setWords((currentWords) => currentWords + 5);
  }

  function completeLesson() {
    clearFeedback();
    setLessons((currentLessons) => currentLessons + 1);
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
      return;
    }

    try {
      const response = await fetch(dailyProgressApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: parsedUserId,
          sentences: nextProgress.sentences,
          words: nextProgress.words,
          lessons: nextProgress.lessons
        })
      });

      const data = (await response.json()) as DailyProgressResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "Daily progress could not be saved.");
      }

      if (showSuccessMessage) {
        setStatusMessage("Today's progress has been saved.");
      }
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Daily progress could not be saved.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <section className="rounded-[2rem] border border-ink/10 bg-white/85 p-8 shadow-card">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-teal">Daily Practice</p>
        <h1 className="mt-4 font-display text-4xl text-ink">Track what you practiced today.</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-ink/75">
          Count spoken sentences, learned words, and completed lessons. Sentence practice saves to the backend automatically, and the active user ID is loaded from login when available.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="rounded-[2rem] bg-sand/80 p-6">
            <p className="text-sm font-semibold text-clay">Sentences Spoken Today</p>
            <p className="mt-3 text-4xl font-semibold text-ink">{sentences}</p>
            <button
              type="button"
              onClick={recordSentence}
              className="mt-5 rounded-full bg-teal px-5 py-3 text-sm font-bold text-white hover:bg-teal/90"
            >
              Practice Sentence
            </button>
          </article>

          <article className="rounded-[2rem] bg-sand/80 p-6">
            <p className="text-sm font-semibold text-clay">Words Learned Today</p>
            <p className="mt-3 text-4xl font-semibold text-ink">{words}</p>
            <button
              type="button"
              onClick={learnWords}
              className="mt-5 rounded-full bg-clay px-5 py-3 text-sm font-bold text-white hover:bg-clay/90"
            >
              Add 5 Words
            </button>
          </article>

          <article className="rounded-[2rem] bg-sand/80 p-6">
            <p className="text-sm font-semibold text-clay">Lessons Completed Today</p>
            <p className="mt-3 text-4xl font-semibold text-ink">{lessons}</p>
            <button
              type="button"
              onClick={completeLesson}
              className="mt-5 rounded-full bg-ink px-5 py-3 text-sm font-bold text-white hover:bg-ink/90"
            >
              Complete Lesson
            </button>
          </article>
        </div>

        <div className="mt-8 rounded-[2rem] border border-ink/10 bg-white p-6">
          <label className="text-sm font-semibold text-ink" htmlFor="user-id">
            User ID
          </label>
          <p className="mt-2 text-sm text-ink/65">Daily progress is saved against the logged-in learner. You can also enter a user ID manually.</p>
          <input
            id="user-id"
            type="number"
            min="1"
            step="1"
            value={userId}
            onChange={(event) => {
              clearFeedback();
              setUserId(event.target.value);
            }}
            placeholder="Enter user ID"
            className="mt-4 h-14 w-full max-w-xs rounded-full border border-ink/10 bg-sand px-5 text-sm text-ink outline-none placeholder:text-ink/35 focus:border-teal"
          />

          <div className="mt-6 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => void saveDailyProgress()}
              disabled={isSaving}
              className="h-14 rounded-full bg-gold px-8 text-sm font-bold text-ink hover:bg-gold/90 disabled:cursor-not-allowed disabled:bg-gold/60"
            >
              {isSaving ? "Saving..." : "Save All Progress"}
            </button>
          </div>

          {statusMessage ? <p className="mt-4 rounded-2xl bg-teal/10 px-4 py-3 text-sm text-teal">{statusMessage}</p> : null}
          {error ? <p className="mt-4 rounded-2xl bg-clay/10 px-4 py-3 text-sm text-clay">{error}</p> : null}
        </div>
      </section>
    </main>
  );
}
