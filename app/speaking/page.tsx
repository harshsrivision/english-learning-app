"use client";

import { useState } from "react";
import { correctSentence } from "@/lib/api";

export default function SpeakingPage() {
  const [sentence, setSentence] = useState("");
  const [result, setResult] = useState("");

  async function handleSubmit() {
    if (!sentence.trim()) return;

    const data = await correctSentence(sentence);
    setResult(data.result);
  }

  return (
    <main className="grid-pattern">
      <div className="mx-auto max-w-4xl px-6 py-20">

        <h1 className="font-display text-4xl mb-6 text-ink">
          Speaking Practice
        </h1>

        <div className="space-y-4">

          <input
            className="w-full rounded-lg border border-ink/20 px-4 py-3 text-ink"
            placeholder="Speak or type a sentence..."
            value={sentence}
            onChange={(e) => setSentence(e.target.value)}
          />

          <button
            onClick={handleSubmit}
            className="rounded-full bg-clay px-6 py-3 text-white font-bold hover:bg-clay/90"
          >
            Analyze Sentence
          </button>

          {result && (
            <div className="rounded-xl bg-sand p-5 text-ink/80 shadow-card">
              {result}
            </div>
          )}

        </div>
      </div>
    </main>
  );
}