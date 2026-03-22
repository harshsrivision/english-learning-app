"use client";

import Link from "next/link";
import type { Route } from "next";
import { motion } from "framer-motion";
import { useEffect } from "react";
import type { MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { DashboardAccountForm } from "@/components/dashboard-account-form";
import { buildLoginHref, defaultAuthenticatedPath, readRedirectPathFromLocation } from "@/lib/auth-navigation";
import { useUserSession } from "@/lib/use-user-session";

export default function SignupPage() {
  const router = useRouter();
  const { hasSession, isChecking } = useUserSession();

  useEffect(() => {
    if (!isChecking && hasSession) {
      router.replace(readRedirectPathFromLocation() as Route);
    }
  }, [hasSession, isChecking, router]);

  function openLogin(event: MouseEvent<HTMLAnchorElement>) {
    const redirectPath = readRedirectPathFromLocation();

    if (redirectPath === defaultAuthenticatedPath) {
      return;
    }

    event.preventDefault();
    router.push(buildLoginHref(redirectPath));
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
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-forest">Start Free</p>
          <h1 className="mt-4 font-display text-4xl text-ink">Naya Account Banao, Seedha Practice Start Karo</h1>
          <p className="mt-4 text-base leading-8 text-stone">Signup ke baad tumhara learner profile local session ke saath save ho jayega, taaki dashboard, vocabulary, aur speaking tools instantly ready ho jaayein.</p>
          <div className="mt-8 space-y-4 text-sm leading-7 text-stone">
            <div className="rounded-[1.5rem] bg-white p-5 shadow-card">Beginner ho ya working professional, same platform tumhe A0 se confident English tak le jayega.</div>
            <div className="rounded-[1.5rem] bg-white p-5 shadow-card">Local session save hone ki wajah se roz login friction kam ho jata hai, jo phone-first users ke liye important hai.</div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="space-y-5"
        >
          <DashboardAccountForm />
          <p className="text-center text-sm text-stone">
            Already have an account?{" "}
            <Link href="/login" onClick={openLogin} aria-label="Open login page" className="font-semibold text-forest hover:text-forest-dark">
              Log in
            </Link>
          </p>
        </motion.section>
      </div>
    </main>
  );
}
