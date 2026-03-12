"use client";

import { useEffect, useRef, useState } from "react";

type Level = "beginner" | "intermediate" | "advanced" | "professional";
type RecordingState = "idle" | "recording" | "processing";
type PermissionState = "idle" | "granted" | "denied";
type RecognitionState = "checking" | "available" | "unavailable";
type AnalysisState = "idle" | "loading" | "success" | "error";

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
  isFinal?: boolean;
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

type PracticeScenario = {
  title: string;
  prompt: string;
  hindiHint: string;
  target: string;
  level: Level;
};

type SpeakingSessionFeedback = {
  feedback: string;
  hindiExplanation: string;
  fluencyScore: number;
  grammarScore: number;
  nextPrompt: string;
};

type PronunciationIssue = {
  sound: string;
  word: string;
  feedback: string;
};

type PronunciationReview = {
  overallScore: number;
  issues: PronunciationIssue[];
  hindiTips: string[];
};

type CorrectionResponse = {
  result: string;
};

type PronunciationScoreResponse = {
  score?: number;
  feedback?: string;
  error?: string;
};

type PronunciationScore = {
  score: number;
  feedback: string;
};

type SentenceAnalysis = {
  corrected: string;
  explanation: string;
  tip: string;
  pronunciationTip: string;
  fluencyFeedback: string;
  error?: string;
};

const practiceScenarios = [
  {
    title: "Manager Introduction",
    prompt: "Introduce yourself to a new manager in English.",
    hindiHint: "Pehle apna naam, role, experience aur ek strength bolo.",
    target: "Speak for 20 to 30 seconds with a calm pace.",
    level: "intermediate"
  },
  {
    title: "Customer Support",
    prompt: "Apologize for a delay and explain the next step.",
    hindiHint: "Pehle sorry bolo, phir problem aur solution clear karo.",
    target: "Use polite English and one clear action step.",
    level: "beginner"
  },
  {
    title: "Interview Answer",
    prompt: "Describe one recent achievement from your work or studies.",
    hindiHint: "Situation, action aur result ko short structure mein bolo.",
    target: "Give a structured answer with confidence.",
    level: "advanced"
  }
] as const satisfies ReadonlyArray<PracticeScenario>;

const fillerWords = new Set(["um", "uh", "like", "actually", "basically"]);
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";
const analyzeApiUrl = process.env.NEXT_PUBLIC_ANALYZE_API_URL ?? "http://localhost:4000/analyze";
const correctionApiUrl = process.env.NEXT_PUBLIC_CORRECTION_API_URL ?? "http://localhost:4000/correct";
const dailyProgressApiUrl = process.env.NEXT_PUBLIC_DAILY_PROGRESS_API_URL ?? "http://localhost:4000/daily-progress";
const pronunciationApiUrl = process.env.NEXT_PUBLIC_PRONUNCIATION_API_URL ?? "http://localhost:4000/pronunciation";

type SpeakingPracticeProps = {
  userId: number;
};

function buildFeedback(transcript: string) {
  const words = transcript
    .trim()
    .split(/\s+/)
    .map((word) => word.replace(/[^\w']/g, "").toLowerCase())
    .filter(Boolean);

  const wordCount = words.length;
  const fillerCount = words.filter((word) => fillerWords.has(word)).length;
  const fluencyScore = Math.min(94, Math.max(42, 54 + wordCount * 2 - fillerCount * 6));
  const pronunciationScore = Math.min(91, Math.max(48, 60 + Math.min(wordCount, 14) - fillerCount * 5));

  const strengths = [
    wordCount >= 14 ? "You are building longer English responses instead of isolated phrases." : "Your short sentences are easy to control and improve.",
    fillerCount === 0 ? "You are avoiding filler words well." : "You are aware of your flow and can now trim filler words."
  ];

  const improvements = [
    wordCount < 10 ? "Add one more supporting sentence so your answer sounds complete." : "Pause briefly between ideas to sound more deliberate.",
    "Stress key nouns and verbs slightly more for stronger pronunciation."
  ];

  const hindiSummary =
    wordCount < 10
      ? "Answer thoda chhota hai. Ek extra sentence jodo taki response complete lage."
      : "Flow achha hai. Ab thoda pause aur important words par stress badhao.";

  return {
    fluencyScore,
    pronunciationScore,
    strengths,
    improvements,
    hindiSummary
  };
}

export function SpeakingPractice({ userId }: SpeakingPracticeProps) {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [permissionState, setPermissionState] = useState<PermissionState>("idle");
  const [recognitionState, setRecognitionState] = useState<RecognitionState>("checking");
  const [analysisState, setAnalysisState] = useState<AnalysisState>("idle");
  const [transcript, setTranscript] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [pronunciationScore, setPronunciationScore] = useState<number | null>(null);
  const [pronunciationFeedback, setPronunciationFeedback] = useState("");
  const [sessionFeedback, setSessionFeedback] = useState<SpeakingSessionFeedback | null>(null);
  const [pronunciationReview, setPronunciationReview] = useState<PronunciationReview | null>(null);
  const [sentenceAnalysis, setSentenceAnalysis] = useState<SentenceAnalysis | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const transcriptRef = useRef("");
  const stopRequestedRef = useRef(false);

  const scenario = practiceScenarios[selectedScenarioIndex];
  const localFeedback = buildFeedback(transcript);

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    const Recognition = getSpeechRecognitionConstructor();
    setRecognitionState(Recognition ? "available" : "unavailable");
  }, []);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      recognitionRef.current?.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [audioUrl]);

  function clearPreviousAnalysis() {
    setFeedback("");
    setPronunciationScore(null);
    setPronunciationFeedback("");
    setSessionFeedback(null);
    setPronunciationReview(null);
    setSentenceAnalysis(null);
    setAnalysisState("idle");
  }

  async function sendSentence(sentence: string) {
    try {
      const response = await fetch(correctionApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ sentence })
      });

      const data = (await response.json()) as CorrectionResponse & { error?: string };

      if (!response.ok || typeof data.result !== "string") {
        throw new Error(data.error ?? "Correction request failed");
      }

      return data;
    } catch (requestError) {
      console.error("Correction API error", requestError);
      throw new Error(requestError instanceof Error ? requestError.message : "Correction request failed");
    }
  }

  async function checkPronunciation(sentence: string) {
    try {
      const response = await fetch(pronunciationApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ sentence })
      });

      const data = (await response.json()) as PronunciationScoreResponse;

      if (!response.ok || typeof data.score !== "number" || typeof data.feedback !== "string") {
        throw new Error(data.error ?? "Pronunciation request failed");
      }

      return {
        score: data.score,
        feedback: data.feedback
      } satisfies PronunciationScore;
    } catch (requestError) {
      console.error("Pronunciation API error", requestError);
      throw new Error(requestError instanceof Error ? requestError.message : "Pronunciation request failed");
    }
  }

  async function analyzeSpeech(sentence: string) {
    try {
      const response = await fetch(analyzeApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ sentence })
      });

      const data = (await response.json()) as SentenceAnalysis;

      if (
        !response.ok ||
        typeof data.corrected !== "string" ||
        typeof data.explanation !== "string" ||
        typeof data.tip !== "string" ||
        typeof data.pronunciationTip !== "string" ||
        typeof data.fluencyFeedback !== "string"
      ) {
        throw new Error(data.error ?? "Sentence analysis failed");
      }

      return data;
    } catch (requestError) {
      console.error("Analyze API error", requestError);
      throw new Error(requestError instanceof Error ? requestError.message : "Sentence analysis failed");
    }
  }

  async function fetchSpeakingSession(sentence: string) {
    try {
      const response = await fetch(`${apiBaseUrl}/speaking/session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: scenario.prompt,
          transcribedText: sentence,
          level: scenario.level
        })
      });

      if (!response.ok) {
        throw new Error("Speaking session request failed");
      }

      return (await response.json()) as SpeakingSessionFeedback;
    } catch (requestError) {
      console.error("Speaking session API error", requestError);
      throw new Error(requestError instanceof Error ? requestError.message : "Speaking session request failed");
    }
  }

  async function fetchPronunciationReview(sentence: string) {
    try {
      const response = await fetch(`${apiBaseUrl}/pronunciation/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          transcript: sentence
        })
      });

      if (!response.ok) {
        throw new Error("Pronunciation review request failed");
      }

      return (await response.json()) as PronunciationReview;
    } catch (requestError) {
      console.error("Pronunciation review API error", requestError);
      throw new Error(requestError instanceof Error ? requestError.message : "Pronunciation review request failed");
    }
  }

  async function saveSpokenSentenceProgress() {
    try {
      const response = await fetch(dailyProgressApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId,
          sentences: 1,
          words: 0,
          lessons: 0,
          mode: "increment"
        })
      });

      const data = (await response.json()) as { success?: boolean; error?: string };

      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "Daily progress could not be saved.");
      }
    } catch (requestError) {
      console.error("Daily progress API error", requestError);
      throw new Error(requestError instanceof Error ? requestError.message : "Daily progress could not be saved.");
    }
  }

  async function analyzeTranscript() {
    const trimmedTranscript = transcriptRef.current.trim();

    if (trimmedTranscript.length < 3) {
      setAnalysisState("idle");
      setError("Speak or type at least a short sentence before requesting feedback.");
      return;
    }

    setAnalysisState("loading");
    setError(null);

    try {
      const [scoreResult, speakingResult, pronunciationReviewResult, correctionResult, sentenceAnalysisResult] = await Promise.allSettled([
        checkPronunciation(trimmedTranscript),
        fetchSpeakingSession(trimmedTranscript),
        fetchPronunciationReview(trimmedTranscript),
        sendSentence(trimmedTranscript),
        analyzeSpeech(trimmedTranscript)
      ]);

      let hasRemoteFeedback = false;
      let hasRemoteFailure = false;

      if (scoreResult.status === "fulfilled") {
        setPronunciationScore(scoreResult.value.score);
        setPronunciationFeedback(scoreResult.value.feedback);
        hasRemoteFeedback = true;
      } else {
        setPronunciationScore(null);
        setPronunciationFeedback("");
        hasRemoteFailure = true;
      }

      if (speakingResult.status === "fulfilled") {
        setSessionFeedback(speakingResult.value);
        hasRemoteFeedback = true;
      } else {
        setSessionFeedback(null);
        hasRemoteFailure = true;
      }

      if (pronunciationReviewResult.status === "fulfilled") {
        setPronunciationReview(pronunciationReviewResult.value);
        hasRemoteFeedback = true;
      } else {
        setPronunciationReview(null);
        hasRemoteFailure = true;
      }

      if (correctionResult.status === "fulfilled") {
        setFeedback(correctionResult.value.result);
        hasRemoteFeedback = true;
      } else {
        setFeedback("");
        hasRemoteFailure = true;
      }

      if (sentenceAnalysisResult.status === "fulfilled") {
        setSentenceAnalysis(sentenceAnalysisResult.value);
        hasRemoteFeedback = true;

        try {
          await saveSpokenSentenceProgress();
        } catch {
          hasRemoteFailure = true;
        }
      } else {
        setSentenceAnalysis(null);
        hasRemoteFailure = true;
      }

      if (!hasRemoteFeedback) {
        throw new Error("Analysis request failed");
      }

      setAnalysisState("success");
      if (hasRemoteFailure) {
        setError("Some analysis services or progress-saving steps were unavailable. Available feedback is still shown below.");
      }
    } catch {
      setFeedback("");
      setPronunciationScore(null);
      setPronunciationFeedback("");
      setSessionFeedback(null);
      setPronunciationReview(null);
      setSentenceAnalysis(null);
      setAnalysisState("error");
      setError("The API feedback service is unavailable right now. Local speaking feedback is still shown below.");
    } finally {
      setRecordingState("idle");
    }
  }

  async function startRecording() {
    if (recordingState === "recording" || recordingState === "processing") {
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Microphone access is not supported in this browser.");
      return;
    }

    if (typeof MediaRecorder === "undefined") {
      setError("Audio recording is not supported in this browser.");
      return;
    }

    try {
      setError(null);
      setTranscript("");
      transcriptRef.current = "";
      stopRequestedRef.current = false;
      clearPreviousAnalysis();

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setPermissionState("granted");

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      setRecordingState("recording");

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        mediaRecorderRef.current = null;
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

        if (chunksRef.current.length > 0) {
          const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
          const nextUrl = URL.createObjectURL(audioBlob);
          setAudioUrl((currentUrl) => {
            if (currentUrl) {
              URL.revokeObjectURL(currentUrl);
            }

            return nextUrl;
          });
        }

        void analyzeTranscript();
      };

      recorder.start();

      const Recognition = getSpeechRecognitionConstructor();
      if (Recognition) {
        setRecognitionState("available");
        const recognition = new Recognition();
        recognition.lang = "en-US";
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.onresult = (event) => {
          const nextTranscript = Array.from(event.results)
            .map((result) => result[0]?.transcript ?? "")
            .join(" ")
            .trim();

          const latestResult = event.results[event.results.length - 1] as SpeechRecognitionResultLike | undefined;

          setTranscript(nextTranscript);

          if (latestResult?.isFinal && nextTranscript.length >= 3) {
            void analyzeSpeech(nextTranscript)
              .then((result) => {
                setSentenceAnalysis(result);
              })
              .catch((requestError) => {
                console.error("Live analyze API error", requestError);
              });
          }
        };
        recognition.onerror = (event) => {
          if (event.error !== "aborted") {
            setError(`Speech recognition error: ${event.error}. You can still type the transcript manually.`);
          }
        };
        recognition.onend = () => {
          if (stopRequestedRef.current || mediaRecorderRef.current?.state !== "recording") {
            return;
          }

          try {
            recognition.start();
          } catch {
            setError("Live transcription stopped. You can finish the recording and edit the transcript manually.");
          }
        };

        try {
          recognitionRef.current = recognition;
          recognition.start();
        } catch {
          recognitionRef.current = null;
          setError("Speech recognition could not start. You can keep recording and type the transcript manually.");
        }
      } else {
        setRecognitionState("unavailable");
      }
    } catch {
      mediaRecorderRef.current = null;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setPermissionState("denied");
      setRecordingState("idle");
      setError("Microphone permission was denied or unavailable.");
    }
  }

  function stopRecording() {
    if (recordingState !== "recording") {
      return;
    }

    setRecordingState("processing");
    stopRequestedRef.current = true;

    recognitionRef.current?.stop();
    recognitionRef.current = null;

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      return;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    void analyzeTranscript();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8">
      <section className="rounded-[2rem] border border-ink/10 bg-white/85 p-6 shadow-card sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-teal">AI Speaking Practice</p>
        <h1 className="mt-4 font-display text-3xl text-ink sm:text-4xl">Speak into your microphone and review the result.</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-ink/75">
          The page uses browser microphone access for live capture. If speech recognition is available, the transcript updates while you speak so you can compare your spoken English with the prompt.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {practiceScenarios.map((item, index) => (
            <button
              key={item.title}
              type="button"
              onClick={() => {
                setSelectedScenarioIndex(index);
                clearPreviousAnalysis();
                setError(null);
              }}
              disabled={recordingState !== "idle"}
              className={`rounded-3xl p-5 text-left transition ${
                selectedScenarioIndex === index ? "bg-teal text-white" : "bg-sand text-ink hover:bg-white"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <p className="text-sm font-bold">{item.title}</p>
              <p className={`mt-2 text-sm ${selectedScenarioIndex === index ? "text-white/85" : "text-ink/70"}`}>{item.target}</p>
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl bg-sand p-5">
            <p className="text-sm font-bold text-clay">Scenario</p>
            <p className="mt-2 text-sm text-ink/75">{scenario.prompt}</p>
          </div>
          <div className="rounded-3xl bg-sand p-5">
            <p className="text-sm font-bold text-clay">Hindi Hint</p>
            <p className="mt-2 text-sm text-ink/75">{scenario.hindiHint}</p>
          </div>
          <div className="rounded-3xl bg-sand p-5">
            <p className="text-sm font-bold text-clay">Target</p>
            <p className="mt-2 text-sm text-ink/75">{scenario.target}</p>
          </div>
        </div>

        <div className="mt-8 rounded-[2rem] border border-dashed border-ink/15 p-5 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-lg font-semibold text-ink">Microphone capture</p>
              <p className="mt-2 text-sm text-ink/60">
                Permission: <span className="font-semibold text-ink">{permissionState}</span> | Status:{" "}
                <span className="font-semibold text-ink">{recordingState}</span>
              </p>
              <p className="mt-2 text-sm text-ink/60">
                Live transcript: <span className="font-semibold text-ink">{recognitionState}</span>
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={startRecording}
                disabled={recordingState !== "idle"}
                className="w-full rounded-full bg-teal px-6 py-3 text-sm font-bold text-white hover:bg-teal/90 disabled:cursor-not-allowed disabled:bg-teal/50 sm:w-auto"
              >
                Start Recording
              </button>
              <button
                type="button"
                onClick={stopRecording}
                disabled={recordingState !== "recording"}
                className="w-full rounded-full border border-ink/15 px-6 py-3 text-sm font-bold text-ink hover:border-clay hover:text-clay disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                Stop
              </button>
              <button
                type="button"
                onClick={() => void analyzeTranscript()}
                disabled={recordingState !== "idle" || transcript.trim().length < 3 || analysisState === "loading"}
                className="w-full rounded-full border border-ink/15 px-6 py-3 text-sm font-bold text-ink hover:border-teal hover:text-teal disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {analysisState === "loading" ? "Analyzing..." : "Analyze Transcript"}
              </button>
            </div>
          </div>

          {error ? <p className="mt-4 rounded-2xl bg-clay/10 px-4 py-3 text-sm text-clay">{error}</p> : null}
          {recognitionState === "unavailable" ? (
            <p className="mt-4 rounded-2xl bg-sand px-4 py-3 text-sm text-ink/70">
              Live speech-to-text is not available in this browser. You can still record audio and type or edit the transcript manually.
            </p>
          ) : null}

          <label className="mt-6 block text-sm font-semibold text-ink" htmlFor="transcript">
            Live transcript
          </label>
          <textarea
            id="transcript"
            value={transcript}
            onChange={(event) => {
              setTranscript(event.target.value);
              clearPreviousAnalysis();
              setError(null);
            }}
            placeholder="Your English speech transcript will appear here. You can also edit it manually."
            className="mt-3 min-h-40 w-full rounded-[1.5rem] border border-ink/10 bg-sand px-5 py-4 text-sm leading-6 text-ink outline-none ring-0 placeholder:text-ink/35 focus:border-teal"
          />

          {audioUrl ? (
            <div className="mt-6">
              <p className="text-sm font-semibold text-ink">Latest recording</p>
              <audio controls className="mt-3 w-full">
                <source src={audioUrl} type="audio/webm" />
              </audio>
            </div>
          ) : null}
        </div>
      </section>

      <aside className="rounded-[2rem] border border-ink/10 bg-ink p-6 text-white shadow-card sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold">Feedback</p>
        <h2 className="mt-4 font-display text-2xl sm:text-3xl">Pronunciation and fluency review</h2>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5">
            <p className="text-sm text-white/65">Fluency</p>
            <p className="mt-2 text-3xl font-semibold">{sessionFeedback?.fluencyScore ?? localFeedback.fluencyScore}%</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5">
            <p className="text-sm text-white/65">Pronunciation</p>
            <p className="mt-2 text-3xl font-semibold">
              {pronunciationReview?.overallScore ?? localFeedback.pronunciationScore}%
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl bg-white/5 p-5">
          <p className="text-sm font-semibold text-gold">Pronunciation Score</p>
          <p className="mt-3 text-3xl font-semibold text-white">{pronunciationScore ?? 0}/100</p>
        </div>

        <div className="mt-6 rounded-3xl bg-white/5 p-5">
          <p className="text-sm font-semibold text-gold">Feedback</p>
          <p className="mt-3 text-sm leading-6 text-white/80">
            {pronunciationFeedback || "Speak a sentence and run analysis to see pronunciation feedback."}
          </p>
        </div>

        <div className="mt-6 rounded-3xl bg-white/5 p-5">
          <p className="text-sm font-semibold text-gold">AI feedback</p>
          <p className="mt-3 text-sm leading-6 text-white/80">
            {feedback || "Record or type a sentence, then run analysis to see the AI correction feedback."}
          </p>
        </div>

        <div className="mt-6 rounded-3xl bg-white/5 p-5">
          <p className="text-sm font-semibold text-gold">Sentence coach</p>
          <div className="mt-3 space-y-4 text-sm leading-6 text-white/80">
            <div>
              <p className="font-semibold text-white">Correct sentence</p>
              <p>{sentenceAnalysis?.corrected ?? "Your corrected sentence will appear here after analysis."}</p>
            </div>
            <div>
              <p className="font-semibold text-white">Hindi explanation</p>
              <p>{sentenceAnalysis?.explanation ?? "Hindi explanation will appear here."}</p>
            </div>
            <div>
              <p className="font-semibold text-white">Improvement tip</p>
              <p>{sentenceAnalysis?.tip ?? "A speaking improvement tip will appear here."}</p>
            </div>
            <div>
              <p className="font-semibold text-white">Pronunciation tip</p>
              <p>{sentenceAnalysis?.pronunciationTip ?? "A pronunciation tip will appear here."}</p>
            </div>
            <div>
              <p className="font-semibold text-white">Fluency feedback</p>
              <p>{sentenceAnalysis?.fluencyFeedback ?? "Fluency feedback will appear here."}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl bg-white/5 p-5">
          <p className="text-sm font-semibold text-gold">Hindi coaching</p>
          <p className="mt-3 text-sm leading-6 text-white/80">
            {sessionFeedback?.hindiExplanation ?? localFeedback.hindiSummary}
          </p>
        </div>

        <div className="mt-6 rounded-3xl bg-white/5 p-5">
          <p className="text-sm font-semibold text-gold">Coach feedback</p>
          <p className="mt-3 text-sm leading-6 text-white/80">
            {sessionFeedback?.feedback ?? localFeedback.strengths[0]}
          </p>
          {sessionFeedback ? (
            <p className="mt-4 text-sm leading-6 text-white/65">
              Grammar score: <span className="font-semibold text-white">{sessionFeedback.grammarScore}%</span>
            </p>
          ) : null}
        </div>

        <div className="mt-6 space-y-4">
          {localFeedback.strengths.map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/80">
              <span className="font-semibold text-gold">Strength:</span> {item}
            </div>
          ))}
          {(pronunciationReview?.issues.length
            ? pronunciationReview.issues.map((issue) => `${issue.word} (${issue.sound}): ${issue.feedback}`)
            : localFeedback.improvements
          ).map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/80">
              <span className="font-semibold text-gold">Improve:</span> {item}
            </div>
          ))}
        </div>

        {sessionFeedback?.nextPrompt ? (
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-semibold text-gold">Next prompt</p>
            <p className="mt-3 text-sm leading-6 text-white/80">{sessionFeedback.nextPrompt}</p>
          </div>
        ) : null}

        {pronunciationReview?.hindiTips.length ? (
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-semibold text-gold">Hindi pronunciation tips</p>
            <div className="mt-3 space-y-3">
              {pronunciationReview.hindiTips.map((tip) => (
                <p key={tip} className="text-sm leading-6 text-white/80">
                  {tip}
                </p>
              ))}
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
