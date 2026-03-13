"use client";

import { useState } from "react";
import { getApiUrl } from "@/lib/api";
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

export default function ConversationPage() {
  const { userId, isChecking } = useRequiredUserId();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isChecking || !userId) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="rounded-[2rem] border border-dashed border-ink/15 bg-white/70 p-8 text-sm text-ink/65">Checking account session...</div>
      </main>
    );
  }

  async function sendMessage() {
    const nextMessage = input.trim();

    if (!nextMessage || isSending) {
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const response = await fetch(getApiUrl("conversation"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: nextMessage })
      });

      const data = (await response.json()) as ChatResponse;

      if (!response.ok || !data.reply) {
        throw new Error(data.error ?? "Conversation request failed.");
      }

      const reply = data.reply;

      setMessages((currentMessages) => [
        ...currentMessages,
        { id: Date.now(), speaker: "You", text: nextMessage },
        { id: Date.now() + 1, speaker: "AI Teacher", text: reply }
      ]);
      setInput("");
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Conversation request failed.";
      setError(message);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <section className="rounded-[2rem] border border-ink/10 bg-white/85 p-8 shadow-card">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-teal">Conversation Practice</p>
        <h1 className="mt-4 font-display text-4xl text-ink">Practice simple English chat with an AI teacher.</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-ink/75">
          Type a sentence in English and the assistant will reply in simple English so you can keep the conversation going.
        </p>

        <div className="mt-8 rounded-[2rem] border border-ink/10 bg-sand/80 p-6">
          <div className="space-y-4">
            {messages.length ? (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-3xl rounded-3xl px-5 py-4 text-sm leading-6 shadow-sm ${
                    message.speaker === "You" ? "ml-auto bg-teal text-white" : "bg-white text-ink"
                  }`}
                >
                  <p className={`text-xs font-bold uppercase tracking-[0.2em] ${message.speaker === "You" ? "text-white/75" : "text-clay"}`}>
                    {message.speaker}
                  </p>
                  <p className="mt-2">{message.text}</p>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-ink/15 bg-white/70 px-5 py-6 text-sm text-ink/65">
                Start with: <span className="font-semibold text-ink">Hello, I want to practice English.</span>
              </div>
            )}
          </div>
        </div>

        {error ? <p className="mt-4 rounded-2xl bg-clay/10 px-4 py-3 text-sm text-clay">{error}</p> : null}

        <div className="mt-6 flex flex-col gap-4 sm:flex-row">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void sendMessage();
              }
            }}
            placeholder="Type your English message here"
            className="h-14 flex-1 rounded-full border border-ink/10 bg-sand px-5 text-sm text-ink outline-none placeholder:text-ink/35 focus:border-teal"
          />
          <button
            type="button"
            onClick={() => void sendMessage()}
            disabled={isSending || !input.trim()}
            className="h-14 rounded-full bg-clay px-8 text-sm font-bold text-white hover:bg-clay/90 disabled:cursor-not-allowed disabled:bg-clay/50"
          >
            {isSending ? "Sending..." : "Send"}
          </button>
        </div>
      </section>
    </main>
  );
}
