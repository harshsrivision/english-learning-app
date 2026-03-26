import { Check, X } from "lucide-react";
import { HomePageClient } from "@/components/home-page-client";
import { SectionHeading } from "@/components/section-heading";

const comparisonRows = [
  { feature: "Hindi-first design", bolo: true, duolingo: false, helloEnglish: "Partial" },
  { feature: "AI speaking coach", bolo: true, duolingo: false, helloEnglish: false },
  { feature: "India-relevant content", bolo: true, duolingo: false, helloEnglish: true },
  { feature: "CEFR roadmap", bolo: true, duolingo: false, helloEnglish: false },
  { feature: "Free to start", bolo: true, duolingo: true, helloEnglish: true },
  { feature: "Job interview prep", bolo: true, duolingo: false, helloEnglish: false }
] as const;

const faqs = [
  {
    question: "Bolo English kya hai?",
    answer:
      "Bolo English ek AI-powered English learning app hai jo specially Hindi speakers ke liye banaya gaya hai. Isme 200+ structured lessons, pronunciation coaching, vocabulary practice, aur real conversation simulations hain."
  },
  {
    question: "Kya Bolo English free hai?",
    answer:
      "Haan, Bolo English bilkul free start kar sakte ho. Pehla lesson, vocabulary, grammar, aur basic AI speaking practice sab free hai."
  },
  {
    question: "Kitne time mein English fluent ho sakte hain?",
    answer:
      "Roz 30-45 minutes practice se 3-6 mahine mein confident A2-B1 level English bol sakte ho. Consistency sabse important hai."
  },
  {
    question: "Kya Hindi bolne walon ke liye specially design hai?",
    answer:
      "Bilkul. Har lesson mein Hindi hints, Hinglish explanations, aur India-relevant examples hain. Lucknow, Patna, Bhopal jaise cities ke learners ke liye perfect hai."
  },
  {
    question: "Mobile par kaam karta hai?",
    answer:
      "Haan, Bolo English fully mobile-optimized hai. Kisi bhi phone ke browser mein seedha open kar sakte ho."
  }
] as const;

function renderComparisonValue(value: boolean | "Partial") {
  if (value === "Partial") {
    return <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">Partial</span>;
  }

  return value ? <Check className="mx-auto h-5 w-5 text-forest" /> : <X className="mx-auto h-5 w-5 text-ink" />;
}

export default function HomePage() {
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Bolo English",
    description: "AI-powered English learning app for Hindi speakers in India",
    url: "https://english-learning-app-beta-ten.vercel.app",
    applicationCategory: "EducationApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR"
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "12000"
    },
    inLanguage: ["hi", "en"],
    audience: {
      "@type": "Audience",
      audienceType: "Hindi speakers learning English in India"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <HomePageClient />

      <section className="section-shell">
        <div className="surface-card halo-panel p-6 sm:p-8">
          <SectionHeading
            eyebrow="Why Bolo English?"
            title="Bolo English dusre apps se alag kyun hai?"
            subtitle="Hindi-first learning, AI speaking, aur India-relevant practice ek hi jagah"
            description="Agar goal sirf streak nahi, balki real spoken English confidence hai, to comparison clean dikhna chahiye."
          />

          <div className="mt-8 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-sm text-stone">
                  <th className="px-4 py-3">Feature</th>
                  <th className="px-4 py-3">Bolo English</th>
                  <th className="px-4 py-3">Duolingo</th>
                  <th className="px-4 py-3">Hello English</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.feature} className="bg-white/90 text-sm text-ink">
                    <td className="rounded-l-[1.5rem] border border-ink/10 border-r-0 px-4 py-4 font-semibold">{row.feature}</td>
                    <td className="border-y border-ink/10 px-4 py-4 text-center">{renderComparisonValue(row.bolo)}</td>
                    <td className="border-y border-ink/10 px-4 py-4 text-center">{renderComparisonValue(row.duolingo)}</td>
                    <td className="rounded-r-[1.5rem] border border-ink/10 border-l-0 px-4 py-4 text-center">{renderComparisonValue(row.helloEnglish)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section-shell space-y-8 pb-20">
        <SectionHeading
          eyebrow="FAQs"
          title="Frequently Asked Questions"
          subtitle="Hindi speakers ke common sawaalon ka seedha jawab"
          description="Yeh section search visibility bhi improve karta hai aur new learners ko turant clarity deta hai ki Bolo English unke liye kaise useful hoga."
        />

        <div className="grid gap-5 lg:grid-cols-2">
          {faqs.map((faq) => (
            <article key={faq.question} className="surface-card p-6">
              <h2 className="font-display text-2xl text-ink">{faq.question}</h2>
              <p className="mt-3 text-sm leading-7 text-stone">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}