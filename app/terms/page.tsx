import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Bolo English",
  description: "Terms of Service for using Bolo English in India."
};

export default function TermsPage() {
  return (
    <main className="section-shell space-y-8">
      <section className="surface-card p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-forest">Terms of Service</p>
        <h1 className="mt-4 font-display text-4xl text-ink">Simple terms for using Bolo English</h1>
        <p className="mt-4 text-sm leading-7 text-stone">
          Bolo English is designed for learners who want to practice English responsibly. We recommend use by adults, and users under 18 should use the app with guidance from a parent, guardian, or teacher.
        </p>
        <p className="mt-4 text-sm leading-7 text-stone">
          Bolo English un learners ke liye hai jo responsibly English practice karna chahte hain. 18+ recommended hai, aur 18 se kam users ko parent, guardian, ya teacher ke guidance ke saath use karna chahiye.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="surface-card p-6">
          <h2 className="font-display text-2xl text-ink">Acceptable use</h2>
          <p className="mt-3 text-sm leading-7 text-stone">By using the app, you agree not to misuse the service, abuse other users, try to break the system, or use the platform for harmful or illegal activity.</p>
          <p className="mt-3 text-sm leading-7 text-stone">App use karte waqt aap agree karte ho ki service ka misuse, harmful activity, ya system ko damage karne ki koshish nahi karoge.</p>
        </article>
        <article className="surface-card p-6">
          <h2 className="font-display text-2xl text-ink">Limitation of liability</h2>
          <p className="mt-3 text-sm leading-7 text-stone">Bolo English is provided as-is. We work hard to keep it useful and stable, but we cannot guarantee uninterrupted service or specific learning outcomes for every learner.</p>
          <p className="mt-3 text-sm leading-7 text-stone">Bolo English as-is provide kiya jata hai. Hum app ko useful aur stable rakhne ki poori koshish karte hain, lekin har time uninterrupted service ya fixed results guarantee nahi kar sakte.</p>
        </article>
        <article className="surface-card p-6">
          <h2 className="font-display text-2xl text-ink">Governing law</h2>
          <p className="mt-3 text-sm leading-7 text-stone">These terms are governed by the laws of India.</p>
          <p className="mt-3 text-sm leading-7 text-stone">Yeh terms India ke kanoon ke under governed honge.</p>
        </article>
        <article className="surface-card p-6">
          <h2 className="font-display text-2xl text-ink">Contact</h2>
          <p className="mt-3 text-sm leading-7 text-stone">For support, contact hello@boloenglish.in.</p>
          <p className="mt-3 text-sm leading-7 text-stone">Support ke liye hello@boloenglish.in par contact karo.</p>
        </article>
      </section>
    </main>
  );
}
