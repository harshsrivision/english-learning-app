"use client";

import { motion } from "framer-motion";
import { Bot, MessageCircleMore, RotateCcw, Send } from "lucide-react";
import { useState } from "react";
import { SectionHeading } from "@/components/section-heading";
import { apiFetchJson, toApiErrorMessage } from "@/lib/api";
import { recordLearnerProgress } from "@/lib/local-progress";
import { useRequiredUserId } from "@/lib/use-required-user-id";

type Message = {
  id: number;
  speaker: "You" | "AI Teacher";
  text: string;
};

type ChatResponse = {
  reply?: string;
  error?: string;
};

const starterPrompts = [
  "Hello, I want to practice English.",
  "Can you help me answer interview questions?",
  "I want to speak better in office meetings."
];

export default function ConversationPage() {
  const { userId, isChecking } = useRequiredUserId();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isChecking || !userId) {
    return (
      <main className="section-shell">
        <div className="surface-card p-8 text-sm text-stone">Checking account session...</div>
      </main>
    );
  }

  async function sendMessage(nextMessageFromPreset?: string) {
    const nextMessage = (nextMessageFromPreset ?? input).trim();

    if (!nextMessage || isSending) {
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const data = await apiFetchJson<ChatResponse>("chat", {
        method: "POST",
        timeoutMs: 30000,
        body: JSON.stringify({ message: nextMessage })
      });

      if (!data.reply) {
        throw new Error("Conversation request failed.");
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        { id: Date.now(), speaker: "You", text: nextMessage },
        { id: Date.now() + 1, speaker: "AI Teacher", text: data.reply as string }
      ]);
      setInput("");
      recordLearnerProgress({
        xp: 6,
        speakingMinutes: 2,
        streakActivity: true
      });
    } catch (requestError) {
      setError(toApiErrorMessage(requestError, "Conversation request failed."));
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="section-shell space-y-8">
      <SectionHeading
        eyebrow="Conversation Lab"
        title="AI Teacher Ke Saath Chat Karo"
        subtitle="Simple English mein practice karo, hesitation ko dheere dheere hatao"
        description="Is page ka goal grammar test lena nahi hai. Goal hai tumhe conversation mein comfortably hold karwana, especially jab sentence turant banana padta hai."
      />

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="surface-card p-6 sm:p-8">
          <div className="flex items-center gap-3 text-forest">
            <MessageCircleMore className="h-5 w-5" />
            <p className="text-sm font-semibold uppercase tracking-[0.22em]">Live conversation</p>
          </div>
          <h2 className="mt-4 font-display text-3xl text-ink">Keep the chat moving in English</h2>
          <p className="mt-2 text-base font-medium text-stone">Short replies se shuru karo aur dheere dheere conversation lambi karo</p>
          <p className="mt-3 text-sm leading-7 text-stone">AI teacher simple English mein reply karega, taaki tum conversation ko ek natural rhythm mein continue kar sako.</p>

          <div className="mt-6 flex flex-wrap gap-3">
            {starterPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                aria-label={`Use starter prompt ${prompt}`}
                onClick={() => void sendMessage(prompt)}
                className="rounded-full border border-ink/10 bg-mist px-4 py-2 text-sm font-semibold text-ink transition hover:border-forest hover:text-forest"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-[1.8rem] border border-ink/10 bg-mist p-5">
            <div className="space-y-4">
              {messages.length ? (
                messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`max-w-3xl rounded-[1.5rem] px-5 py-4 text-sm leading-7 ${
                      message.speaker === "You" ? "ml-auto bg-forest text-white" : "bg-white text-ink shadow-card"
                    }`}
                  >
                    <p className={`text-xs font-bold uppercase tracking-[0.2em] ${message.speaker === "You" ? "text-white/70" : "text-stone"}`}>
                      {message.speaker}
                    </p>
                    <p className="mt-2">{message.text}</p>
                  </motion.div>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-ink/15 bg-white/70 px-5 py-6 text-sm text-stone">
                  Start with one of the prompts above, or type your own opening line.
                </div>
              )}
            </div>
          </div>

          {error ? <p className="mt-4 rounded-2xl bg-clay/10 px-4 py-3 text-sm text-clay">{error}</p> : null}

          <div className="mt-6 flex flex-col gap-4 sm:flex-row">
            <input
              aria-label="Type your English message"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void sendMessage();
                }
              }}
              placeholder="Type your English message here"
              className="h-14 flex-1 rounded-full border border-ink/10 bg-mist px-5 text-sm text-ink outline-none placeholder:text-stone/50 focus:border-forest"
            />
            <button
              type="button"
              aria-label="Send English message"
              onClick={() => void sendMessage()}
              disabled={isSending || !input.trim()}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-forest px-8 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-forest/50"
            >
              <Send className="h-4 w-4" />
              {isSending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>

        <aside className="surface-card p-6 sm:p-8">
          <div className="flex items-center gap-3 text-forest">
            <Bot className="h-5 w-5" />
            <div>
              <h2 className="font-display text-3xl text-ink">Chat Tips</h2>
              <p className="mt-2 text-sm font-medium text-stone">Ye chhoti habits tumhe zyada natural reply dene mein help karengi</p>
            </div>
          </div>
          <div className="mt-6 space-y-4 text-sm leading-7 text-stone">
            <div className="rounded-[1.4rem] bg-mist px-4 py-4">Short sentence se start karo. Confidence badhne ke baad details add karo.</div>
            <div className="rounded-[1.4rem] bg-mist px-4 py-4">Jab atko, ek bridge line use karo: Let me say that in another way.</div>
            <div className="rounded-[1.4rem] bg-mist px-4 py-4">Har reply ke baad ek follow-up question pucho. Isi se real conversation banti hai.</div>
          </div>
          <button
            type="button"
            aria-label="Clear current conversation"
            onClick={() => {
              setMessages([]);
              setInput("");
              setError(null);
            }}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-ink/10 px-5 py-3 text-sm font-bold text-ink transition hover:border-forest hover:text-forest"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Chat
          </button>
        </aside>
      </section>
    </main>
  );
}
