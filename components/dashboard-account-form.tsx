"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { KeyRound, Mail, UserRound } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { activateLearnerProgress } from "@/lib/local-progress";
import { storeUserId } from "@/lib/user-session";

type CreateUserResponse = {
  userId?: number;
  error?: string;
};

const AUTH_NETWORK_ERROR_MESSAGE = "Server se connect nahi ho pa raha, thodi der mein try karo";
const AUTH_EMAIL_EXISTS_MESSAGE = "Yeh email pehle se registered hai";
const AUTH_GENERIC_ERROR_MESSAGE = "Kuch problem aayi, dobara try karo";

function getAuthApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/+$/, "");
}

export function DashboardAccountForm() {
  const router = useRouter();
  const redirectTimeoutRef = useRef<number | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current !== null) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextName = name.trim();
    const nextEmail = email.trim().toLowerCase();

    if (!nextName || !nextEmail || !password || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`${getAuthApiBaseUrl()}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nextName, email: nextEmail, password })
      });
      const data = (await response.json().catch(() => null)) as CreateUserResponse | null;

      if (!response.ok) {
        if (response.status === 409) {
          setError(AUTH_EMAIL_EXISTS_MESSAGE);
        } else {
          setError(AUTH_GENERIC_ERROR_MESSAGE);
        }

        return;
      }

      if (typeof data?.userId !== "number") {
        throw new Error("Signup response missing user ID.");
      }

      storeUserId(data.userId);
      activateLearnerProgress(data.userId);
      setSuccessMessage("Account ban gaya! Dashboard khul raha hai...");
      redirectTimeoutRef.current = window.setTimeout(() => {
        router.replace("/dashboard" as Route);
      }, 900);
    } catch (requestError) {
      if (requestError instanceof TypeError || (requestError instanceof DOMException && requestError.name === "AbortError")) {
        setError(AUTH_NETWORK_ERROR_MESSAGE);
      } else {
        setError(AUTH_GENERIC_ERROR_MESSAGE);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="surface-card p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-forest">Create Account</p>
      <h2 className="mt-4 font-display text-3xl text-ink">Learner profile banao aur session save karo</h2>
      <p className="mt-3 max-w-xl text-sm leading-7 text-stone">Name, email, aur password ke saath account create karo. Signup ke baad tum seedha apne learning flow par pahunch jaoge.</p>

      <form onSubmit={(event) => void createUser(event)} className="mt-6 space-y-5">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink">Full name</span>
          <div className="flex items-center gap-3 rounded-full border border-ink/10 bg-mist px-5">
            <UserRound className="h-4 w-4 text-stone" />
            <input
              aria-label="Full name"
              name="name"
              autoComplete="name"
              placeholder="Enter your name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-14 w-full bg-transparent text-sm text-ink outline-none placeholder:text-stone/50"
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink">Email</span>
          <div className="flex items-center gap-3 rounded-full border border-ink/10 bg-mist px-5">
            <Mail className="h-4 w-4 text-stone" />
            <input
              aria-label="Email address"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-14 w-full bg-transparent text-sm text-ink outline-none placeholder:text-stone/50"
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink">Password</span>
          <div className="flex items-center gap-3 rounded-full border border-ink/10 bg-mist px-5">
            <KeyRound className="h-4 w-4 text-stone" />
            <input
              aria-label="Create a password"
              type="password"
              name="password"
              autoComplete="new-password"
              placeholder="Create a password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-14 w-full bg-transparent text-sm text-ink outline-none placeholder:text-stone/50"
            />
          </div>
        </label>

        <button
          type="submit"
          aria-label="Create learner account"
          disabled={!name.trim() || !email.trim() || !password || isSubmitting}
          className="inline-flex h-14 items-center justify-center rounded-full bg-forest px-8 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-forest/50"
        >
          {isSubmitting ? "Creating..." : "Sign Up"}
        </button>
      </form>

      {successMessage ? <p className="mt-4 rounded-2xl bg-forest-soft px-4 py-3 text-sm font-semibold text-forest">{successMessage}</p> : null}
      {error ? <p className="mt-4 rounded-2xl bg-clay/10 px-4 py-3 text-sm text-clay">{error}</p> : null}
    </div>
  );
}
