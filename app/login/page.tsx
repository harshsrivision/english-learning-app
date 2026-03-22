"use client";

import Link from "next/link";
import type { Route } from "next";
import { motion } from "framer-motion";
import { ArrowRight, KeyRound, Mail, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSafeRedirectPath } from "@/lib/auth-navigation";
import { apiFetchJson, toApiErrorMessage } from "@/lib/api";
import { activateLearnerProgress } from "@/lib/local-progress";
import { storeUserId } from "@/lib/user-session";
import { useUserSession } from "@/lib/use-user-session";

type LoginResponse = {
  userId?: number;
  error?: string;
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasSession, isChecking } = useUserSession();
  const redirectPath = getSafeRedirectPath(searchParams.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isChecking && hasSession) {
      router.replace(redirectPath);
    }
  }, [hasSession, isChecking, redirectPath, router]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextEmail = email.trim().toLowerCase();

    if (!nextEmail || !password || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const data = await apiFetchJson<LoginResponse>("login", {
        method: "POST",
        timeoutMs: 15000,
        body: JSON.stringify({ email: nextEmail, password })
      });

      if (typeof data.userId !== "number") {
        throw new Error("Login failed.");
      }

      activateLearnerProgress(data.userId);
      storeUserId(data.userId);
      router.replace(redirectPath);
    } catch (requestError) {
      setError(toApiErrorMessage(requestError, "Login failed."));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isChecking || hasSession) {
    return (
      <main className="section-shell">
        <div className="surface-card p-8 text-sm text-stone">
          {isChecking ? "Checking your saved learner session..." : "Your session is already active. Opening your learning flow..."}
        </div>
      </main>
    );
  }

  return (
    <main className="section-shell">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="surface-card halo-panel p-6 sm:p-8"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-forest">Welcome Back</p>
          <h1 className="mt-4 font-display text-4xl text-ink">Login Karo Aur Wapas Practice Par Aao</h1>
          <p className="mt-4 text-base leading-8 text-stone">Apna learner session resume karo, dashboard kholke streak continue karo, aur wahi se bolna start karo jahan kal chhoda tha.</p>
          <div className="mt-8 space-y-4">
            <div className="rounded-[1.5rem] bg-white p-5 shadow-card">
              <div className="flex items-center gap-3 text-forest">
                <UserRound className="h-5 w-5" />
                <div>
                  <p className="font-semibold text-ink">Active learner session</p>
                  <p className="mt-1 text-xs font-medium text-stone">Tumhara current progress locally ready rehta hai</p>
                </div>
              </div>
              <p className="mt-2 text-sm leading-7 text-stone">Login ke baad user ID locally save hoti hai, isliye practice pages ko repeat login ki zaroorat nahi padti.</p>
            </div>
            <div className="rounded-[1.5rem] bg-white p-5 shadow-card">
              <div className="flex items-center gap-3 text-forest">
                <ArrowRight className="h-5 w-5" />
                <div>
                  <p className="font-semibold text-ink">Resume instantly</p>
                  <p className="mt-1 text-xs font-medium text-stone">Jahan chhoda tha, wahi se flow dobara pakdo</p>
                </div>
              </div>
              <p className="mt-2 text-sm leading-7 text-stone">Dashboard, lessons, vocabulary, aur speaking pages login ke baad ek hi flow mein available ho jaate hain.</p>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="surface-card p-6 sm:p-8"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-forest">Account Access</p>
          <h2 className="mt-4 font-display text-3xl text-ink">Sign in to continue your English practice</h2>
          <p className="mt-3 text-sm font-medium text-stone">Email aur password ke saath wapas apne learning flow mein aao</p>
          <p className="mt-3 text-sm leading-7 text-stone">Email aur password ke saath login karo. Agar account nahi hai to neeche signup link se turant create kar sakte ho.</p>

          <form onSubmit={(event) => void login(event)} className="mt-8 space-y-5">
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
                  aria-label="Password"
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-14 w-full bg-transparent text-sm text-ink outline-none placeholder:text-stone/50"
                />
              </div>
            </label>

            <button
              type="submit"
              aria-label="Log in to your account"
              disabled={!email.trim() || !password || isSubmitting}
              className="inline-flex h-14 items-center justify-center rounded-full bg-forest px-8 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-forest/50"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </form>

          {error ? <p className="mt-4 rounded-2xl bg-clay/10 px-4 py-3 text-sm text-clay">{error}</p> : null}
          <p className="mt-6 text-sm text-stone">
            Need an account?{" "}
            <Link href={{ pathname: "/signup", query: redirectPath !== "/dashboard" ? { next: redirectPath } : undefined }} aria-label="Open signup page" className="font-semibold text-forest hover:text-forest-dark">
              Create one here
            </Link>
          </p>
        </motion.section>
      </div>
    </main>
  );
}
