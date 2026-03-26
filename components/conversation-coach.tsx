"use client";

import { Bot, RotateCcw, Send } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { SectionHeading } from "@/components/section-heading";
import { apiFetchJson, toApiErrorMessage } from "@/lib/api";
import { recordLearnerProgress } from "@/lib/local-progress";

type ConversationMessage = {
  id: string;
  role: "user" | "ai";
  text: string;
};

type ChatResponse = {
  reply?: string;
  error?: string;
};

const conversationStorageKey = "bolo-conversation";
const starterPrompts = [
  "Tell me about yourself",
  "Practice job interview",
  "Help me with greetings",
  "Practice ordering food"
] as const;

function createMessage(role: ConversationMessage["role"], text: string) {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    text
  } satisfies ConversationMessage;
}

export function ConversationCoach() {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedValue = window.localStorage.getItem(conversationStorageKey);

    if (!storedValue) {
      return;
    }

    try {
      const parsedValue = JSON.parse(storedValue) as ConversationMessage[];

      if (Array.isArray(parsedValue)) {
        setMessages(parsedValue.filter((item): item is ConversationMessage => Boolean(item?.id && item?.role && item?.text)));
      }
    } catch {
      setMessages([]);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(conversationStorageKey, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isSending]);

  const hasMessages = useMemo(() => messages.length > 0, [messages.length]);

  async function sendMessage(seedMessage?: string) {
    const nextMessage = (seedMessage ?? input).trim();

    if (!nextMessage || isSending) {
      return;
    }

    const userMessage = createMessage("user", nextMessage);
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsSending(true);
    setError(null);

    try {
      const data = await apiFetchJson<ChatResponse>("chat", {
        method: "POST",
        timeoutMs: 30000,
        body: JSON.stringify({ message: nextMessage })
      });

      const reply = data.reply?.trim();

      if (!reply) {
        throw new Error("Conversation reply missing hai.");
      }

      setMessages((current) => [...current, createMessage("ai", reply)]);
      recordLearnerProgress({ xp: 6, speakingMinutes: 2, streakActivity: true });
    } catch (requestError) {
      setError(toApiErrorMessage(requestError, "Conversation abhi continue nahi ho pa rahi."));
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="section-shell space-y-8">
      <SectionHeading
        eyebrow="Conversation Lab"
        title="AI Se Baat Karo"
        subtitle="Practice English conversation with AI - no judgment"
        description="Starter prompts se shuru karo, phir apni taraf se reply build karo. Yahan goal perfect grammar nahi, balki real conversation confidence banana hai."
      />

      <section className="surface-card p-6 sm:p-8">
        <div className="flex flex-wrap gap-3">
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

        <div ref={listRef} className="mt-6 max-h-[28rem] space-y-4 overflow-y-auto rounded-[1.8rem] bg-mist p-5">
          {hasMessages ? (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={
                    message.role === "user"
                      ? "max-w-2xl rounded-[1.5rem] bg-forest px-5 py-4 text-sm leading-7 text-white"
                      : "max-w-2xl rounded-[1.5rem] border border-ink/10 bg-white px-5 py-4 text-sm leading-7 text-ink shadow-card"
                  }
                >
                  <p className={`text-xs font-bold uppercase tracking-[0.22em] ${message.role === "user" ? "text-white/70" : "text-stone"}`}>
                    {message.role === "user" ? "You" : "AI Coach"}
                  </p>
                  <p className="mt-2">{message.text}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-ink/15 bg-white/80 px-5 py-8 text-sm text-stone">
              Ek prompt choose karo ya seedha apni line type karke chat shuru karo.
            </div>
          )}

          {isSending ? (
            <div className="flex justify-start">
              <div className="surface-card max-w-md rounded-[1.5rem] px-5 py-4 text-sm text-stone">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone">AI Coach</p>
                <p className="mt-2">AI soch raha hai...</p>
              </div>
            </div>
          ) : null}
        </div>

        {error ? <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p> : null}

        <div className="mt-6 flex flex-col gap-4 sm:flex-row">
          <input
            aria-label="Type your message for the AI conversation coach"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void sendMessage();
              }
            }}
            placeholder="Type your English message here"
            className="h-14 flex-1 rounded-full border border-ink/10 bg-mist px-5 text-sm text-ink outline-none placeholder:text-stone/60 focus:border-forest"
          />
          <button
            type="button"
            aria-label="Send your message to the AI conversation coach"
            onClick={() => void sendMessage()}
            disabled={isSending || !input.trim()}
            className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-forest px-6 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-forest/50"
          >
            <Send className="h-4 w-4" />
            Send
          </button>
        </div>

        <button
          type="button"
          aria-label="Clear saved conversation history"
          onClick={() => {
            setMessages([]);
            setInput("");
            setError(null);
          }}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-ink/10 px-5 py-3 text-sm font-semibold text-ink transition hover:border-forest hover:text-forest"
        >
          <RotateCcw className="h-4 w-4" />
          Reset Chat
        </button>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <article className="surface-card p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-soft text-forest">
            <Bot className="h-5 w-5" />
          </div>
          <h2 className="mt-4 font-display text-2xl text-ink">No pressure practice</h2>
          <p className="mt-2 text-sm leading-7 text-stone">AI tumhe judge nahi karta. Isliye chhote jawab se start karke dheere dheere lambi reply build karna easy lagta hai.</p>
        </article>
        <article className="surface-card p-5">
          <h2 className="font-display text-2xl text-ink">Simple English replies</h2>
          <p className="mt-2 text-sm leading-7 text-stone">Replies easy rakhne ka goal yeh hai ki tum flow pakdo, phir next turn mein ek aur detail add kar sako.</p>
        </article>
        <article className="surface-card p-5">
          <h2 className="font-display text-2xl text-ink">Conversation memory</h2>
          <p className="mt-2 text-sm leading-7 text-stone">Tumhari current chat local device par save rehti hai, taaki dubara aakar wahi se continue kar sako.</p>
        </article>
      </section>
    </main>
  );
}