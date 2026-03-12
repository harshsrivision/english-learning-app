"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { storeUserId } from "@/lib/user-session";

type CreateUserResponse = {
  userId?: number;
  error?: string;
};

const signupApiUrl = process.env.NEXT_PUBLIC_SIGNUP_API_URL ?? "http://localhost:4000/signup";

export function DashboardAccountForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextName = name.trim();
    const nextEmail = email.trim().toLowerCase();

    if (!nextName || !nextEmail || !password || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(signupApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: nextName,
          email: nextEmail,
          password
        })
      });

      const data = (await response.json()) as CreateUserResponse;

      if (!response.ok || typeof data.userId !== "number") {
        throw new Error(data.error ?? "User creation failed.");
      }

      storeUserId(data.userId);
      window.location.href = "/dashboard";
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "User creation failed.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-[2rem] border border-ink/10 bg-white/85 p-8 shadow-card">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-teal">Create Account</p>
      <h2 className="mt-4 font-display text-3xl text-ink">Create a learner account and save the active session.</h2>
      <p className="mt-3 max-w-xl text-sm leading-6 text-ink/70">
        Sign up with name, email, and password. The new user ID is stored locally so practice and vocabulary activity can use the active account.
      </p>

      <form onSubmit={(event) => void createUser(event)} className="mt-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            name="name"
            autoComplete="name"
            placeholder="Enter your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-14 rounded-full border border-ink/10 bg-sand px-5 text-sm text-ink outline-none placeholder:text-ink/35 focus:border-teal"
          />
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-14 rounded-full border border-ink/10 bg-sand px-5 text-sm text-ink outline-none placeholder:text-ink/35 focus:border-teal"
          />
          <input
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder="Create a password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-14 rounded-full border border-ink/10 bg-sand px-5 text-sm text-ink outline-none placeholder:text-ink/35 focus:border-teal sm:col-span-2"
          />
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <button
            type="submit"
            disabled={!name.trim() || !email.trim() || !password || isSubmitting}
            className="h-14 rounded-full bg-clay px-8 text-sm font-bold text-white hover:bg-clay/90 disabled:cursor-not-allowed disabled:bg-clay/50"
          >
            {isSubmitting ? "Creating..." : "Sign Up"}
          </button>
        </div>
      </form>

      {error ? <p className="mt-4 rounded-2xl bg-clay/10 px-4 py-3 text-sm text-clay">{error}</p> : null}
    </div>
  );
}
