import type { Metadata } from "next";
import { SignupPageClient } from "@/components/signup-page-client";

export const metadata: Metadata = {
  title: "Free Account Banao - Bolo English Start Karo",
  description: "Free mein Bolo English join karo. Hindi speakers ke liye India ka best AI English learning platform."
};

export default function SignupPage() {
  return <SignupPageClient />;
}
