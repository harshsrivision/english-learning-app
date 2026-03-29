import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Bolo English",
  description: "Bolo English privacy policy for learner accounts, progress data, and support contact."
};

export default function PrivacyPage() {
  return (
    <main className="section-shell space-y-8">
      <section className="surface-card p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-forest">Privacy Policy</p>
        <h1 className="mt-4 font-display text-4xl text-ink">Your data, explained simply</h1>
        <p className="mt-4 text-sm leading-7 text-stone">
          We collect basic account details like your name, email, and learning progress so we can personalize lessons, save your practice history, and improve your experience inside Bolo English.
        </p>
        <p className="mt-4 text-sm leading-7 text-stone">
          Hum naam, email, aur learning progress jaisa basic data sirf isliye rakhte hain taaki app tumhare liye personalized rahe, progress save ho, aur learning flow better ban sake.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="surface-card p-6">
          <h2 className="font-display text-2xl text-ink">What we collect</h2>
          <p className="mt-3 text-sm leading-7 text-stone">Name, email address, saved learner progress, vocabulary activity, lesson progress, and conversation/speaking usage data that helps the app remember your journey.</p>
          <p className="mt-3 text-sm leading-7 text-stone">Hum naam, email, progress stats, vocabulary aur lesson activity, aur speaking/conversation usage jaise data collect karte hain.</p>
        </article>
        <article className="surface-card p-6">
          <h2 className="font-display text-2xl text-ink">How we use it</h2>
          <p className="mt-3 text-sm leading-7 text-stone">We use this data to personalize learning, unlock the right content, save progress, and understand what is helping learners improve.</p>
          <p className="mt-3 text-sm leading-7 text-stone">Yeh data learning personalize karne, sahi content dikhane, progress save karne, aur learner improvement samajhne ke liye use hota hai.</p>
        </article>
        <article className="surface-card p-6">
          <h2 className="font-display text-2xl text-ink">No selling of data</h2>
          <p className="mt-3 text-sm leading-7 text-stone">We do not sell your personal data to third parties.</p>
          <p className="mt-3 text-sm leading-7 text-stone">Hum aapka personal data kisi third party ko bechte nahi hain.</p>
        </article>
        <article className="surface-card p-6">
          <h2 className="font-display text-2xl text-ink">Contact</h2>
          <p className="mt-3 text-sm leading-7 text-stone">For privacy questions, email us at hello@boloenglish.in.</p>
          <p className="mt-3 text-sm leading-7 text-stone">Privacy se related sawal ke liye humein hello@boloenglish.in par email karo.</p>
        </article>
      </section>
    </main>
  );
}
