"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { clearStoredUserId, getStoredUserId } from "@/lib/user-session";

const appLinks = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/lessons", label: "Lessons" },
  { href: "/speaking", label: "Speaking" },
  { href: "/conversation", label: "Conversation" },
  { href: "/grammar", label: "Grammar" },
  { href: "/vocabulary", label: "Vocabulary" },
  { href: "/simulation", label: "Simulations" }
] as const satisfies ReadonlyArray<{ href: Route; label: string }>;

const authLinks = [
  { href: "/login", label: "Login" },
  { href: "/signup" as Route, label: "Signup" }
] as const satisfies ReadonlyArray<{ href: Route; label: string }>;

export function Navbar() {
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    setUserId(getStoredUserId());
  }, []);

  function logout() {
    clearStoredUserId();
    window.location.href = "/login";
  }

  return (
    <header className="sticky top-0 z-20 border-b border-ink/10 bg-sand/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/" className="font-display text-2xl font-semibold tracking-wide text-clay">
          Bolo English
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm font-semibold text-ink/75">
          {appLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-teal">
              {link.label}
            </Link>
          ))}
          {userId ? (
            <>
              <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-clay">User {userId}</span>
              <button type="button" onClick={logout} className="hover:text-teal">
                Logout
              </button>
            </>
          ) : (
            authLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-teal">
                {link.label}
              </Link>
            ))
          )}
        </nav>
      </div>
    </header>
  );
}
