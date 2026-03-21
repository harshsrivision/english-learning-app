"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LogOut, Menu, Mic2, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { clearStoredUserId } from "@/lib/user-session";
import { useUserSession } from "@/lib/use-user-session";

const learnLinks = [
  { href: "/lessons", label: "Lessons" },
  { href: "/grammar", label: "Grammar" },
  { href: "/vocabulary", label: "Vocabulary" },
  { href: "/conversation", label: "Conversation" }
] as const;

const practiceLinks = [
  { href: "/practice", label: "Daily Practice" },
  { href: "/simulation", label: "Simulations" }
] as const;

type NavbarContentProps = {
  pathname: string;
  hasSession: boolean;
};

function getLinkClass(isActive: boolean) {
  return `relative inline-flex items-center pb-1 text-sm font-semibold transition ${
    isActive
      ? "text-ink after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-forest"
      : "text-stone hover:text-ink"
  }`;
}

function NavbarContent({ pathname, hasSession }: NavbarContentProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLearnOpen, setIsLearnOpen] = useState(false);
  const [isPracticeOpen, setIsPracticeOpen] = useState(false);
  const [isMobileLearnOpen, setIsMobileLearnOpen] = useState(false);
  const [isMobilePracticeOpen, setIsMobilePracticeOpen] = useState(false);
  const learnRef = useRef<HTMLDivElement | null>(null);
  const practiceRef = useRef<HTMLDivElement | null>(null);

  const isLearnActive = learnLinks.some((link) => pathname.startsWith(link.href));
  const isPracticeActive = practiceLinks.some((link) => pathname.startsWith(link.href));
  const isSpeakingActive = pathname.startsWith("/speaking");

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!learnRef.current?.contains(event.target as Node)) {
        setIsLearnOpen(false);
      }

      if (!practiceRef.current?.contains(event.target as Node)) {
        setIsPracticeOpen(false);
      }
    }

    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, []);

  function handleLogout() {
    clearStoredUserId();
    window.location.href = "/login";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Go to the Bolo English homepage" className="font-display text-2xl font-bold text-ink">
          Bolo English
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary navigation">
          <Link href="/" aria-label="Open home page" className={getLinkClass(pathname === "/")}>
            Home
          </Link>

          <Link href="/speaking" aria-label="Open speaking page" className={`${getLinkClass(isSpeakingActive)} gap-2`}>
            <Mic2 className="h-4 w-4" />
            Speaking
          </Link>

          <div ref={learnRef} className="relative" onMouseEnter={() => setIsLearnOpen(true)} onMouseLeave={() => setIsLearnOpen(false)}>
            <button
              type="button"
              aria-label="Open learn menu"
              aria-expanded={isLearnOpen}
              onClick={() => setIsLearnOpen((current) => !current)}
              className={`${getLinkClass(isLearnActive)} gap-1`}
            >
              Learn
              <ChevronDown className={`h-4 w-4 transition ${isLearnOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {isLearnOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-1/2 top-full mt-4 w-60 -translate-x-1/2 rounded-[1.5rem] border border-ink/10 bg-white p-3 shadow-float"
                >
                  {learnLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      aria-label={`Open ${link.label}`}
                      className="block rounded-2xl px-4 py-3 text-sm font-semibold text-stone transition hover:bg-forest/5 hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div ref={practiceRef} className="relative" onMouseEnter={() => setIsPracticeOpen(true)} onMouseLeave={() => setIsPracticeOpen(false)}>
            <button
              type="button"
              aria-label="Open practice menu"
              aria-expanded={isPracticeOpen}
              onClick={() => setIsPracticeOpen((current) => !current)}
              className={`${getLinkClass(isPracticeActive)} gap-1`}
            >
              Practice
              <ChevronDown className={`h-4 w-4 transition ${isPracticeOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {isPracticeOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-1/2 top-full mt-4 w-60 -translate-x-1/2 rounded-[1.5rem] border border-ink/10 bg-white p-3 shadow-float"
                >
                  {practiceLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      aria-label={`Open ${link.label}`}
                      className="block rounded-2xl px-4 py-3 text-sm font-semibold text-stone transition hover:bg-forest/5 hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link href="/dashboard" aria-label="Open dashboard" className={getLinkClass(pathname.startsWith("/dashboard"))}>
            Dashboard
          </Link>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {hasSession ? (
            <>
              <Link
                href="/dashboard"
                aria-label="Open your dashboard"
                className="inline-flex items-center rounded-full border border-ink/15 px-5 py-3 text-sm font-semibold text-ink transition hover:border-forest/40 hover:text-forest"
              >
                Continue
              </Link>
              <button
                type="button"
                aria-label="Log out of your account"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-3 text-sm font-bold text-white transition hover:bg-forest-dark"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                aria-label="Log in to your account"
                className="inline-flex items-center rounded-full border border-ink/15 px-5 py-3 text-sm font-semibold text-ink transition hover:border-forest/40 hover:text-forest"
              >
                Login
              </Link>
              <Link
                href="/signup"
                aria-label="Create a free account"
                className="inline-flex items-center rounded-full bg-forest px-5 py-3 text-sm font-bold text-white transition hover:bg-forest-dark"
              >
                Start Free
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label={isDrawerOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isDrawerOpen}
          onClick={() => setIsDrawerOpen((current) => !current)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 text-ink lg:hidden"
        >
          {isDrawerOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.22 }}
            className="border-t border-ink/10 bg-white px-4 py-4 lg:hidden"
          >
            <nav className="mx-auto flex max-w-7xl flex-col gap-2" aria-label="Mobile navigation">
              <Link href="/" aria-label="Open home page" className="rounded-2xl px-4 py-3 text-sm font-semibold text-ink">
                Home
              </Link>
              <Link href="/speaking" aria-label="Open speaking page" className="rounded-2xl px-4 py-3 text-sm font-semibold text-ink">
                Speaking
              </Link>

              <button
                type="button"
                aria-label="Toggle learn links"
                aria-expanded={isMobileLearnOpen}
                onClick={() => setIsMobileLearnOpen((current) => !current)}
                className="flex items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold text-ink"
              >
                <span>Learn</span>
                <ChevronDown className={`h-4 w-4 transition ${isMobileLearnOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {isMobileLearnOpen && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                    <div className="ml-2 flex flex-col gap-2 rounded-[1.5rem] bg-mist p-3">
                      {learnLinks.map((link) => (
                        <Link key={link.href} href={link.href} aria-label={`Open ${link.label}`} className="rounded-2xl px-3 py-3 text-sm font-medium text-stone">
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="button"
                aria-label="Toggle practice links"
                aria-expanded={isMobilePracticeOpen}
                onClick={() => setIsMobilePracticeOpen((current) => !current)}
                className="flex items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold text-ink"
              >
                <span>Practice</span>
                <ChevronDown className={`h-4 w-4 transition ${isMobilePracticeOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {isMobilePracticeOpen && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                    <div className="ml-2 flex flex-col gap-2 rounded-[1.5rem] bg-mist p-3">
                      {practiceLinks.map((link) => (
                        <Link key={link.href} href={link.href} aria-label={`Open ${link.label}`} className="rounded-2xl px-3 py-3 text-sm font-medium text-stone">
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Link href="/dashboard" aria-label="Open dashboard" className="rounded-2xl px-4 py-3 text-sm font-semibold text-ink">
                Dashboard
              </Link>

              <div className="mt-2 flex flex-col gap-2">
                {hasSession ? (
                  <>
                    <Link
                      href="/dashboard"
                      aria-label="Open your dashboard"
                      className="inline-flex items-center justify-center rounded-full border border-ink/15 px-5 py-3 text-sm font-semibold text-ink"
                    >
                      Continue
                    </Link>
                    <button
                      type="button"
                      aria-label="Log out of your account"
                      onClick={handleLogout}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-forest px-5 py-3 text-sm font-bold text-white"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      aria-label="Log in to your account"
                      className="inline-flex items-center justify-center rounded-full border border-ink/15 px-5 py-3 text-sm font-semibold text-ink"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      aria-label="Create a free account"
                      className="inline-flex items-center justify-center rounded-full bg-forest px-5 py-3 text-sm font-bold text-white"
                    >
                      Start Free
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { hasSession } = useUserSession();

  return <NavbarContent key={pathname} pathname={pathname} hasSession={hasSession} />;
}
