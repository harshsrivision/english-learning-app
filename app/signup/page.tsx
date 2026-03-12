"use client";

import Link from "next/link";
import { useEffect } from "react";
import { DashboardAccountForm } from "@/components/dashboard-account-form";
import { getStoredUserId } from "@/lib/user-session";

export default function SignupPage() {
  useEffect(() => {
    if (getStoredUserId()) {
      window.location.href = "/dashboard";
    }
  }, []);

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6 sm:py-16">
      <DashboardAccountForm />
      <p className="text-center text-sm text-ink/65">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-teal hover:text-teal/80">
          Log in
        </Link>
      </p>
    </main>
  );
}
