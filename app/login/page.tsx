"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { getStoredUserId, storeUserId } from "@/lib/user-session";

type LoginResponse = {
  userId?: number;
  error?: string;
};

const loginApiUrl = process.env.NEXT_PUBLIC_LOGIN_API_URL ?? "http://localhost:4000/login";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (getStoredUserId()) {
      window.location.href = "/dashboard";
    }
  }, []);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextEmail = email.trim().toLowerCase();

    if (!nextEmail || !password || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(loginApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: nextEmail, password })
      });

      const data = (await response.json()) as LoginResponse;

      if (!response.ok || typeof data.userId !== "number") {
        throw new Error(data.error ?? "Login failed.");
      }

      storeUserId(data.userId);
      window.location.href = "/dashboard";
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Login failed.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
      <section className="rounded-[2rem] border border-ink/10 bg-white/85 p-8 shadow-card">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-teal">Login</p>
        <h1 className="mt-4 font-display text-4xl text-ink">Sign in to continue your English practice.</h1>
        <p className="mt-4 text-base leading-7 text-ink/75">
          After login, the learner ID is stored locally so practice, vocabulary, and dashboard requests can use the active account.
        </p>

        <form onSubmit={(event) => void login(event)} className="mt-8 space-y-6">
          <div className="space-y-4">
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-14 w-full rounded-full border border-ink/10 bg-sand px-5 text-sm text-ink outline-none placeholder:text-ink/35 focus:border-teal"
            />
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-14 w-full rounded-full border border-ink/10 bg-sand px-5 text-sm text-ink outline-none placeholder:text-ink/35 focus:border-teal"
            />
          </div>

          <button
            type="submit"
            disabled={!email.trim() || !password || isSubmitting}
            className="h-14 rounded-full bg-clay px-8 text-sm font-bold text-white hover:bg-clay/90 disabled:cursor-not-allowed disabled:bg-clay/50"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        {error ? <p className="mt-4 rounded-2xl bg-clay/10 px-4 py-3 text-sm text-clay">{error}</p> : null}
        <p className="mt-6 text-sm text-ink/65">
          Need an account?{" "}
          <Link href={"/signup" as Route} className="font-semibold text-teal hover:text-teal/80">
            Create one here
          </Link>
        </p>
      </section>
    </main>
  );
}
