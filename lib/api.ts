"use client";

const endpointPaths = {
  analyze: "/analyze",
  apiBase: "/api",
  chat: "/chat",
  conversation: "/chat",
  correct: "/correct",
  correction: "/correct",
  chapterProgress: "/chapter-progress",
  curriculumStructure: "/api/curriculum/structure",
  curriculumSystems: "/api/curriculum/systems",
  dailyProgress: "/daily-progress",
  health: "/health",
  lessonProgress: "/lesson-progress",
  lessonUnlocks: "/lesson-unlocks",
  lessons: "/lessons",
  login: "/login",
  pronunciation: "/pronunciation",
  signup: "/signup",
  user: "/user",
  vocabulary: "/vocabulary",
  vocabularyProgress: "/vocabulary-progress"
} as const;

const DEFAULT_TIMEOUT_MS = 20000;
const DEFAULT_API_BASE_URL = "http://localhost:4000";
const BACKEND_TIMEOUT_MESSAGE = "The Bolo English backend took too long to respond. It may still be starting up.";
const BACKEND_CONNECTION_MESSAGE =
  "Could not reach the Bolo English backend. Check NEXT_PUBLIC_API_BASE_URL, backend CORS, or that the local API is running on port 4000.";
const AUTH_EMAIL_EXISTS_MESSAGE = "Yeh email pehle se registered hai";
const AUTH_INVALID_CREDENTIALS_MESSAGE = "Email ya password galat hai";
const AUTH_NETWORK_ERROR_MESSAGE = "Server se connect nahi ho pa raha, thodi der mein try karo";

export type ApiEndpointKey = keyof typeof endpointPaths;

type ApiFetchOptions = RequestInit & {
  timeoutMs?: number;
};

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function trimApiSuffix(value: string) {
  return value.replace(/\/api$/i, "");
}

function isApiEndpointKey(value: string): value is ApiEndpointKey {
  return Object.prototype.hasOwnProperty.call(endpointPaths, value);
}

function readApiErrorMessage(payload: unknown, fallback: string) {
  if (
    payload &&
    typeof payload === "object" &&
    "message" in payload &&
    typeof payload.message === "string" &&
    payload.message.includes("Application failed to respond")
  ) {
    return BACKEND_TIMEOUT_MESSAGE;
  }

  if (payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string") {
    return payload.error;
  }

  if (payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string") {
    return payload.message;
  }

  if (typeof payload === "string" && payload.trim()) {
    if (payload.includes("Application failed to respond")) {
      return BACKEND_TIMEOUT_MESSAGE;
    }

    return payload;
  }

  return fallback;
}

export class ApiRequestError extends Error {
  status?: number;
  payload?: unknown;

  constructor(message: string, status?: number, payload?: unknown) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.payload = payload;
  }
}

export function getApiBaseUrl() {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  return trimApiSuffix(trimTrailingSlash(configuredBaseUrl || DEFAULT_API_BASE_URL));
}

function resolveApiUrl(endpoint: ApiEndpointKey | string) {
  if (isApiEndpointKey(endpoint)) {
    return `${getApiBaseUrl()}${endpointPaths[endpoint]}`;
  }

  if (/^https?:\/\//i.test(endpoint)) {
    return endpoint;
  }

  const normalizedPath = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
}

export function getApiUrl(endpoint: ApiEndpointKey) {
  return resolveApiUrl(endpoint);
}

export async function checkBackendHealth() {
  try {
    const response = await fetch(getApiUrl("health"), {
      signal: AbortSignal.timeout(5000)
    });

    return response.ok;
  } catch {
    return false;
  }
}

export function toApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiRequestError) {
    return error.message;
  }

  if (error instanceof DOMException && error.name === "AbortError") {
    return BACKEND_TIMEOUT_MESSAGE;
  }

  if (error instanceof TypeError) {
    return BACKEND_CONNECTION_MESSAGE;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export function toAuthApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiRequestError) {
    if (error.status === 409) {
      return AUTH_EMAIL_EXISTS_MESSAGE;
    }

    if (error.status === 401) {
      return AUTH_INVALID_CREDENTIALS_MESSAGE;
    }
  }

  if (error instanceof DOMException && error.name === "AbortError") {
    return AUTH_NETWORK_ERROR_MESSAGE;
  }

  if (error instanceof TypeError) {
    return AUTH_NETWORK_ERROR_MESSAGE;
  }

  const message = toApiErrorMessage(error, fallback).toLowerCase();

  if (message.includes("already exists") || message.includes("already registered")) {
    return AUTH_EMAIL_EXISTS_MESSAGE;
  }

  if (message.includes("invalid credentials")) {
    return AUTH_INVALID_CREDENTIALS_MESSAGE;
  }

  if (message.includes("could not reach") || message.includes("failed to respond")) {
    return AUTH_NETWORK_ERROR_MESSAGE;
  }

  return fallback;
}

export async function apiFetchJson<T>(endpoint: ApiEndpointKey | string, options: ApiFetchOptions = {}) {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, headers, ...init } = options;
  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => controller.abort(), timeoutMs);
  const url = resolveApiUrl(endpoint);
  const requestHeaders = new Headers(headers ?? undefined);

  if (init.body && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(url, {
      ...init,
      headers: requestHeaders,
      signal: controller.signal
    });
    const contentType = response.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json") ? await response.json().catch(() => null) : await response.text().catch(() => null);

    if (!response.ok) {
      throw new ApiRequestError(readApiErrorMessage(payload, `Request to ${url} failed.`), response.status, payload);
    }

    return payload as T;
  } finally {
    globalThis.clearTimeout(timeoutId);
  }
}

export async function correctSentence(sentence: string) {
  return apiFetchJson<{ result: string }>("correct", {
    method: "POST",
    body: JSON.stringify({ sentence })
  });
}
