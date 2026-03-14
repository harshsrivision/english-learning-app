"use client";

const endpointOverrides = {
  analyze: process.env.NEXT_PUBLIC_ANALYZE_API_URL,
  apiBase: process.env.NEXT_PUBLIC_API_BASE_URL,
  conversation: process.env.NEXT_PUBLIC_CONVERSATION_API_URL,
  correction: process.env.NEXT_PUBLIC_CORRECTION_API_URL,
  dailyProgress: process.env.NEXT_PUBLIC_DAILY_PROGRESS_API_URL,
  lessonProgress: process.env.NEXT_PUBLIC_LESSON_PROGRESS_API_URL,
  lessons: process.env.NEXT_PUBLIC_LESSONS_API_URL,
  login: process.env.NEXT_PUBLIC_LOGIN_API_URL,
  pronunciation: process.env.NEXT_PUBLIC_PRONUNCIATION_API_URL,
  signup: process.env.NEXT_PUBLIC_SIGNUP_API_URL,
  user: process.env.NEXT_PUBLIC_USER_API_URL,
  vocabulary: process.env.NEXT_PUBLIC_VOCABULARY_API_URL,
  vocabularyProgress: process.env.NEXT_PUBLIC_VOCABULARY_PROGRESS_API_URL
} as const;

const endpointPaths = {
  analyze: "/analyze",
  apiBase: "/api",
  conversation: "/chat",
  correction: "/correct",
  dailyProgress: "/daily-progress",
  lessonProgress: "/lesson-progress",
  lessons: "/lessons",
  login: "/login",
  pronunciation: "/pronunciation",
  signup: "/signup",
  user: "/user",
  vocabulary: "/vocabulary",
  vocabularyProgress: "/vocabulary-progress"
} as const;

const endpointEnvKeys = {
  analyze: "NEXT_PUBLIC_ANALYZE_API_URL",
  apiBase: "NEXT_PUBLIC_API_BASE_URL",
  conversation: "NEXT_PUBLIC_CONVERSATION_API_URL",
  correction: "NEXT_PUBLIC_CORRECTION_API_URL",
  dailyProgress: "NEXT_PUBLIC_DAILY_PROGRESS_API_URL",
  lessonProgress: "NEXT_PUBLIC_LESSON_PROGRESS_API_URL",
  lessons: "NEXT_PUBLIC_LESSONS_API_URL",
  login: "NEXT_PUBLIC_LOGIN_API_URL",
  pronunciation: "NEXT_PUBLIC_PRONUNCIATION_API_URL",
  signup: "NEXT_PUBLIC_SIGNUP_API_URL",
  user: "NEXT_PUBLIC_USER_API_URL",
  vocabulary: "NEXT_PUBLIC_VOCABULARY_API_URL",
  vocabularyProgress: "NEXT_PUBLIC_VOCABULARY_PROGRESS_API_URL"
} as const;

export type ApiEndpointKey = keyof typeof endpointPaths;

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function getApiOrigin() {
  const configuredOrigin =
    process.env.NEXT_PUBLIC_API_URL?.trim() ??
    process.env.NEXT_PUBLIC_API_ORIGIN?.trim();

  if (configuredOrigin) {
    return trimTrailingSlash(configuredOrigin);
  }

  throw new Error(
    "API is not configured. Set NEXT_PUBLIC_API_URL to your deployed backend URL."
  );
}

export function getApiUrl(endpoint: ApiEndpointKey) {
  const override = endpointOverrides[endpoint]?.trim();

  if (override) {
    return override;
  }

  const apiOrigin = getApiOrigin();

  return `${apiOrigin}${endpointPaths[endpoint]}`;
}
export async function correctSentence(sentence: string) {
  const url = getApiUrl("correction");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ sentence })
  });

  if (!res.ok) {
    throw new Error("Correction request failed");
  }

  return res.json();
}