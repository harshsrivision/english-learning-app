"use client";

import { useEffect, useRef, useState } from "react";
import { apiFetchJson, getApiUrl, toApiErrorMessage } from "@/lib/api";
import { recordLearnerProgress } from "@/lib/local-progress";
import { useRequiredUserId } from "@/lib/use-required-user-id";

type Lesson = {
  id: number;
  level: string;
  title: string;
  example: string;
};

type LessonProgressRow = {
  lesson: string;
  score: number | null;
  completed_at: string | null;
  error?: string;
};

type LessonProgressResponse = {
  success?: boolean;
  alreadyCompleted?: boolean;
  currentStreak?: number;
  lessonsCompletedToday?: number;
  error?: string;
};

type DailyProgressResponse = {
  success?: boolean;
  currentStreak?: number;
  progress?: {
    sentences_spoken?: number;
    words_learned?: number;
    lessons_completed?: number;
  };
  error?: string;
};

type SentenceAnalysis = {
  corrected: string;
  explanation: string;
  tip: string;
  pronunciationTip: string;
  fluencyFeedback: string;
  error?: string;
};

type RecognitionState = "checking" | "available" | "unavailable";

type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

type SpeechRecognitionAlternativeLike = {
  transcript: string;
};

type SpeechRecognitionResultLike = {
  0: SpeechRecognitionAlternativeLike;
  length: number;
};

type SpeechRecognitionEventLike = {
  results: ArrayLike<SpeechRecognitionResultLike>;
};

function getSpeechRecognitionConstructor() {
  const speechWindow = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };

  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
}

function getNextUnlockedLessonId(lessonList: Lesson[], completedIds: number[]) {
  const completedIdSet = new Set(completedIds);
  const nextIncompleteLesson = lessonList.find((lesson) => !completedIdSet.has(lesson.id));

  return nextIncompleteLesson?.id ?? lessonList[0]?.id ?? null;
}

export default function LessonsPage() {
  const { isChecking, userId } = useRequiredUserId();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [transcript, setTranscript] = useState("");
  const [analysis, setAnalysis] = useState<SentenceAnalysis | null>(null);
  const [recognitionState, setRecognitionState] = useState<RecognitionState>("checking");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const stopRequestedRef = useRef(false);

  const completedLessonIdSet = new Set(completedLessonIds);
  const nextUnlockedLessonId = getNextUnlockedLessonId(lessons, completedLessonIds);
  const activeLesson =
    lessons.find((lesson) => lesson.id === selectedLessonId) ??
    lessons.find((lesson) => lesson.id === nextUnlockedLessonId) ??
    lessons[0] ??
    null;
  const isActiveLessonCompleted = activeLesson ? completedLessonIdSet.has(activeLesson.id) : false;

  useEffect(() => {
    const Recognition = getSpeechRecognitionConstructor();
    setRecognitionState(Recognition ? "available" : "unavailable");

    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    if (!userId) {
      return;
    }

    let ignore = false;

    async function loadLessons() {
      try {
        setIsLoading(true);
        setError(null);

        const lessonsApiUrl = getApiUrl("lessons");
        const lessonProgressApiUrl = getApiUrl("lessonProgress");
        const [lessonData, progressData] = await Promise.all([
          apiFetchJson<Lesson[] | { error?: string }>(lessonsApiUrl, { timeoutMs: 15000 }),
          apiFetchJson<LessonProgressRow[] | { error?: string }>(`${lessonProgressApiUrl}/${userId}`, { timeoutMs: 15000 })
        ]);

        if (!Array.isArray(lessonData)) {
          throw new Error("Lesson request failed.");
        }

        if (!Array.isArray(progressData)) {
          throw new Error("Lesson progress request failed.");
        }

        if (ignore) {
          return;
        }

        const nextCompletedIds = progressData
          .map((item) => Number(item.lesson))
          .filter((lessonId) => Number.isInteger(lessonId) && lessonId > 0);

        const defaultLessonId = getNextUnlockedLessonId(lessonData, nextCompletedIds);

        setLessons(lessonData);
        setCompletedLessonIds(nextCompletedIds);
        setSelectedLessonId((currentId) => {
          if (currentId && lessonData.some((lesson) => lesson.id === currentId)) {
            return currentId;
          }

          return defaultLessonId;
        });
      } catch (requestError) {
        const message = toApiErrorMessage(requestError, "Lesson request failed.");

        if (!ignore) {
          setError(message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void loadLessons();

    return () => {
      ignore = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!activeLesson) {
      return;
    }

    setSelectedLessonId((currentId) => currentId ?? activeLesson.id);
  }, [activeLesson]);

  if (isChecking || !userId) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="rounded-[2rem] border border-dashed border-ink/15 bg-white/70 p-8 text-sm text-ink/65">Checking account session...</div>
      </main>
    );
  }

  function clearPracticeState() {
    setTranscript("");
    setAnalysis(null);
    setError(null);
    setStatusMessage(null);
  }

  function isLessonUnlocked(lessonId: number) {
    return completedLessonIdSet.has(lessonId) || lessonId === nextUnlockedLessonId;
  }

  function selectLesson(lesson: Lesson) {
    if (!isLessonUnlocked(lesson.id)) {
      setError(`Complete "${lessons.find((item) => item.id === nextUnlockedLessonId)?.title ?? "the previous lesson"}" first to unlock this lesson.`);
      setStatusMessage(null);
      return;
    }

    if (isRecording) {
      stopSpeaking();
    }

    setSelectedLessonId(lesson.id);
    clearPracticeState();
  }

  function startSpeaking() {
    if (isRecording || isAnalyzing || isCompleting) {
      return;
    }

    const Recognition = getSpeechRecognitionConstructor();

    if (!Recognition) {
      setRecognitionState("unavailable");
      setError("Speech recognition is not available in this browser. You can still type the sentence manually.");
      return;
    }

    stopRequestedRef.current = false;
    setError(null);
    setStatusMessage(null);
    setAnalysis(null);
    setTranscript("");

    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      const nextTranscript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();

      setTranscript(nextTranscript);
    };
    recognition.onerror = (event) => {
      if (event.error !== "aborted") {
        setError(`Speech recognition error: ${event.error}. You can type the answer manually.`);
      }
    };
    recognition.onend = () => {
      if (stopRequestedRef.current) {
        setIsRecording(false);
        recognitionRef.current = null;
        return;
      }

      try {
        recognition.start();
      } catch {
        setIsRecording(false);
        recognitionRef.current = null;
        setError("Live speech capture stopped. You can continue by typing your sentence.");
      }
    };

    try {
      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
    } catch {
      recognitionRef.current = null;
      setIsRecording(false);
      setError("Speech recognition could not start. Please type your answer instead.");
    }
  }

  function stopSpeaking() {
    if (!isRecording) {
      return;
    }

    stopRequestedRef.current = true;
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsRecording(false);
  }

  async function analyzeLessonPractice() {
    if (!userId || !activeLesson || isAnalyzing || isCompleting) {
      return;
    }

    const trimmedTranscript = transcript.trim();

    if (trimmedTranscript.length < 3) {
      setError("Speak or type at least a short sentence before analyzing the lesson.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setStatusMessage(null);

    try {
      const analysisData = await apiFetchJson<SentenceAnalysis>("analyze", {
        method: "POST",
        timeoutMs: 30000,
        body: JSON.stringify({ sentence: trimmedTranscript })
      });

      if (
        typeof analysisData.corrected !== "string" ||
        typeof analysisData.explanation !== "string" ||
        typeof analysisData.tip !== "string" ||
        typeof analysisData.pronunciationTip !== "string" ||
        typeof analysisData.fluencyFeedback !== "string"
      ) {
        throw new Error("Lesson analysis failed.");
      }

      const progressData = await apiFetchJson<DailyProgressResponse>("dailyProgress", {
        method: "POST",
        timeoutMs: 15000,
        body: JSON.stringify({
          userId,
          sentences: 1,
          words: 0,
          lessons: 0,
          mode: "increment"
        })
      });

      if (!progressData.success) {
        throw new Error("Speaking progress could not be saved.");
      }

      recordLearnerProgress({
        xp: 18,
        speakingMinutes: 3,
        streakActivity: true,
        weeklyStats: {
          speakingDrills: 1
        }
      });

      setAnalysis(analysisData);
      setStatusMessage(
        isActiveLessonCompleted
          ? `Feedback is ready. "${activeLesson.title}" is already completed, and today's speaking progress was saved.`
          : `Feedback is ready. Review it and then mark "${activeLesson.title}" complete.`
      );
    } catch (requestError) {
      const message = toApiErrorMessage(requestError, "Lesson practice failed.");
      setError(message);
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function markLessonComplete() {
    if (!userId || !activeLesson || !analysis || isActiveLessonCompleted || isCompleting) {
      return;
    }

    setIsCompleting(true);
    setError(null);
    setStatusMessage(null);

    try {
      const completionData = await apiFetchJson<LessonProgressResponse>("lessonProgress", {
        method: "POST",
        timeoutMs: 15000,
        body: JSON.stringify({
          userId,
          lessonId: activeLesson.id,
          score: 100
        })
      });

      if (!completionData.success) {
        throw new Error("Lesson completion could not be saved.");
      }

      if (!completionData.alreadyCompleted) {
        recordLearnerProgress({
          xp: 60,
          lessonsCompleted: 1,
          speakingMinutes: 4,
          streakActivity: true
        });
      }

      setCompletedLessonIds((currentIds) => (currentIds.includes(activeLesson.id) ? currentIds : [...currentIds, activeLesson.id]));
      setStatusMessage(
        completionData.alreadyCompleted
          ? `"${activeLesson.title}" was already completed earlier.`
          : `"${activeLesson.title}" is now complete${completionData.currentStreak ? ` and your streak is ${completionData.currentStreak} days.` : "."}`
      );
    } catch (requestError) {
      const message = toApiErrorMessage(requestError, "Lesson completion failed.");
      setError(message);
    } finally {
      setIsCompleting(false);
    }
  }

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 sm:py-16">
      <section className="rounded-[2rem] border border-ink/10 bg-white/85 p-6 shadow-card sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-teal">Interactive Lessons</p>
        <h1 className="mt-4 font-display text-4xl text-ink">Practice each lesson by speaking, then get AI coaching.</h1>
        <p className="mt-3 text-base font-medium text-stone">Har lesson ko bolkar complete karo aur Hindi support ke saath improve karo</p>
        <p className="mt-4 max-w-3xl text-base leading-7 text-ink/75">
          Complete lessons in order. Each lesson now has a sentence to repeat, speech capture or manual typing, AI feedback, and a completion step that updates your dashboard.
        </p>

        {error ? <p className="mt-6 rounded-2xl bg-clay/10 px-4 py-3 text-sm text-clay">{error}</p> : null}
        {statusMessage ? <p className="mt-4 rounded-2xl bg-teal/10 px-4 py-3 text-sm text-teal">{statusMessage}</p> : null}

        {isLoading ? (
          <div className="mt-8 rounded-3xl border border-dashed border-ink/15 bg-sand/80 px-6 py-8 text-sm text-ink/65">
            Loading lessons...
          </div>
        ) : !lessons.length ? (
          <div className="mt-8 rounded-3xl border border-dashed border-ink/15 bg-sand/80 px-6 py-8 text-sm text-ink/65">
            No lessons are available yet.
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {lessons.map((lesson) => {
                const isSelected = lesson.id === activeLesson?.id;
                const isCompleted = completedLessonIdSet.has(lesson.id);
                const isUnlocked = isLessonUnlocked(lesson.id);

                return (
                  <article
                    key={lesson.id}
                    className={`rounded-[2rem] border p-6 shadow-sm transition ${
                      isSelected ? "border-teal bg-white" : "border-ink/10 bg-sand/80"
                    } ${!isUnlocked ? "opacity-70" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay">{lesson.level}</p>
                        <h2 className="mt-3 font-display text-2xl text-ink">{lesson.title}</h2>
                        <p className="mt-2 text-sm font-medium text-stone">Is lesson ko repeat karke confidence build karo</p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          isCompleted ? "bg-teal/10 text-teal" : isUnlocked ? "bg-white text-ink/70" : "bg-ink/10 text-ink/55"
                        }`}
                      >
                        {isCompleted ? "Completed" : isUnlocked ? "Unlocked" : "Locked"}
                      </span>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-ink/75">{lesson.example}</p>
                    <button
                      type="button"
                      aria-label={`Select ${lesson.title}`}
                      onClick={() => selectLesson(lesson)}
                      disabled={!isUnlocked}
                      className="mt-6 rounded-full bg-clay px-5 py-3 text-sm font-bold text-white hover:bg-clay/90 disabled:cursor-not-allowed disabled:bg-clay/40"
                    >
                      {isSelected ? "Selected" : isCompleted ? "Review Lesson" : isUnlocked ? "Start Lesson" : "Complete Previous Lesson"}
                    </button>
                  </article>
                );
              })}
            </div>

            {activeLesson ? (
              <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="rounded-[2rem] border border-ink/10 bg-white/85 p-6 shadow-card sm:p-8">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-teal">Lesson Exercise</p>
                  <h2 className="mt-4 font-display text-3xl text-ink">{activeLesson.title}</h2>
                  <p className="mt-2 text-sm font-medium text-stone">Sentence suno, bolo, phir feedback ke saath isse better banao</p>
                  <p className="mt-4 text-sm font-semibold uppercase tracking-[0.2em] text-clay">Repeat this sentence</p>
                  <div className="mt-3 rounded-[1.5rem] bg-sand/80 p-5">
                    <p className="text-lg font-semibold text-ink">{activeLesson.example}</p>
                  </div>

                  <div className="mt-6 rounded-[1.5rem] border border-dashed border-ink/15 p-5">
                    <p className="text-sm font-semibold text-ink">Speech recognition</p>
                    <p className="mt-2 text-sm text-ink/65">
                      Status: <span className="font-semibold text-ink">{recognitionState}</span>
                    </p>
                    {recognitionState === "unavailable" ? (
                      <p className="mt-3 rounded-2xl bg-sand px-4 py-3 text-sm text-ink/70">
                        This browser does not expose speech recognition. Type your spoken answer manually and continue.
                      </p>
                    ) : null}

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        aria-label="Start lesson speech capture"
                        onClick={startSpeaking}
                        disabled={isRecording || isAnalyzing || isCompleting}
                        className="w-full rounded-full bg-teal px-6 py-3 text-sm font-bold text-white hover:bg-teal/90 disabled:cursor-not-allowed disabled:bg-teal/50 sm:w-auto"
                      >
                        {isRecording ? "Listening..." : "Start Speaking"}
                      </button>
                      <button
                        type="button"
                        aria-label="Stop lesson speech capture"
                        onClick={stopSpeaking}
                        disabled={!isRecording}
                        className="w-full rounded-full border border-ink/15 px-6 py-3 text-sm font-bold text-ink hover:border-clay hover:text-clay disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                      >
                        Stop
                      </button>
                      <button
                        type="button"
                        aria-label="Analyze lesson answer"
                        onClick={() => void analyzeLessonPractice()}
                        disabled={isRecording || isAnalyzing || isCompleting || transcript.trim().length < 3}
                        className="w-full rounded-full bg-clay px-6 py-3 text-sm font-bold text-white hover:bg-clay/90 disabled:cursor-not-allowed disabled:bg-clay/50 sm:w-auto"
                      >
                        {isAnalyzing ? "Analyzing..." : "Analyze Answer"}
                      </button>
                    </div>
                  </div>

                  <label className="mt-6 block text-sm font-semibold text-ink" htmlFor="lesson-transcript">
                    Your spoken sentence
                  </label>
                  <textarea
                    id="lesson-transcript"
                    aria-label="Type or edit your spoken lesson sentence"
                    value={transcript}
                    onChange={(event) => {
                      setTranscript(event.target.value);
                      setAnalysis(null);
                      setError(null);
                      setStatusMessage(null);
                    }}
                    placeholder="Your speech transcript will appear here. You can also type the sentence yourself."
                    className="mt-3 min-h-40 w-full rounded-[1.5rem] border border-ink/10 bg-sand px-5 py-4 text-sm leading-6 text-ink outline-none placeholder:text-ink/35 focus:border-teal"
                  />
                </div>

                <aside className="rounded-[2rem] border border-ink/10 bg-ink p-6 text-white shadow-card sm:p-8">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold">AI Feedback</p>
                  <h2 className="mt-4 font-display text-3xl">Lesson speaking coach</h2>
                  <p className="mt-3 text-sm font-medium text-white/70">Yahaan tumhe correction, explanation, aur next-step coaching milegi</p>

                  <div className="mt-6 rounded-3xl bg-white/5 p-5">
                    <p className="text-sm font-semibold text-gold">Completion status</p>
                    <p className="mt-3 text-sm leading-6 text-white/80">
                      {isActiveLessonCompleted
                        ? "This lesson is already complete. You can still re-practice the sentence and save another spoken attempt."
                        : analysis
                          ? "Feedback is ready. Mark this lesson complete to unlock the next one."
                          : "Speak or type your answer first. After analysis, you can mark this lesson complete."}
                    </p>
                    {!isActiveLessonCompleted && analysis ? (
                      <button
                        type="button"
                        aria-label="Mark current lesson complete"
                        onClick={() => void markLessonComplete()}
                        disabled={isCompleting}
                        className="mt-5 rounded-full bg-gold px-5 py-3 text-sm font-bold text-ink hover:bg-gold/90 disabled:cursor-not-allowed disabled:bg-gold/50"
                      >
                        {isCompleting ? "Saving..." : "Mark Lesson Complete"}
                      </button>
                    ) : null}
                  </div>

                  <div className="mt-6 rounded-3xl bg-white/5 p-5">
                    <p className="text-sm font-semibold text-gold">Correct sentence</p>
                    <p className="mt-3 text-sm leading-6 text-white/80">
                      {analysis?.corrected ?? "Your corrected sentence will appear here after analysis."}
                    </p>
                  </div>

                  <div className="mt-6 rounded-3xl bg-white/5 p-5">
                    <p className="text-sm font-semibold text-gold">Hindi explanation</p>
                    <p className="mt-3 text-sm leading-6 text-white/80">
                      {analysis?.explanation ?? "A Hindi explanation will appear here after analysis."}
                    </p>
                  </div>

                  <div className="mt-6 rounded-3xl bg-white/5 p-5">
                    <p className="text-sm font-semibold text-gold">Improvement tip</p>
                    <p className="mt-3 text-sm leading-6 text-white/80">
                      {analysis?.tip ?? "A practice tip will appear here after analysis."}
                    </p>
                  </div>

                  <div className="mt-6 rounded-3xl bg-white/5 p-5">
                    <p className="text-sm font-semibold text-gold">Pronunciation tip</p>
                    <p className="mt-3 text-sm leading-6 text-white/80">
                      {analysis?.pronunciationTip ?? "A pronunciation tip will appear here after analysis."}
                    </p>
                  </div>

                  <div className="mt-6 rounded-3xl bg-white/5 p-5">
                    <p className="text-sm font-semibold text-gold">Fluency feedback</p>
                    <p className="mt-3 text-sm leading-6 text-white/80">
                      {analysis?.fluencyFeedback ?? "Fluency feedback will appear here after analysis."}
                    </p>
                  </div>
                </aside>
              </section>
            ) : null}
          </div>
        )}
      </section>
    </main>
  );
}













