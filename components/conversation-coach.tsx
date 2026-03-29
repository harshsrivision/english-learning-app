"use client";

import { Bot, RotateCcw, Send } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SectionHeading } from "@/components/section-heading";
import { findConversationScenario, type ConversationScenarioId } from "@/lib/conversation-scenarios";
import { recordLearnerProgress } from "@/lib/local-progress";

type StoredConversationMessage = {
  role: "user" | "ai";
  text: string;
  time: string;
};

type ConversationMessage = {
  id: string;
  role: "user" | "ai" | "system";
  text: string;
  time: string;
};

const conversationStorageKey = "bolo-conversation-history";
const starterPrompts: Array<{ label: string; message: string; scenarioId?: ConversationScenarioId }> = [
  { label: "Tell me about yourself", message: "Tell me about yourself" },
  { label: "Practice job interview", message: "Practice job interview", scenarioId: "job-interview" },
  { label: "Practice ordering food", message: "Practice ordering food", scenarioId: "restaurant" },
  { label: "Handle client issue", message: "Handle client issue", scenarioId: "client-escalation" }
];
const CHAT_ERROR_MESSAGE = "AI se connect nahi ho pa raha — thodi der mein try karo";

function getConversationApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/+$/, "");
}

function createMessage(role: ConversationMessage["role"], text: string, time = new Date().toISOString()) {
  return {
    id: `${role}-${time}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    text,
    time
  } satisfies ConversationMessage;
}

function buildChatMessage(userMessage: string, scenarioId: ConversationScenarioId | null) {
  const scenario = findConversationScenario(scenarioId);

  if (!scenario) {
    return userMessage;
  }

  return [
    "You are a supportive English conversation coach for a Hindi-speaking learner.",
    `Stay in this scenario: ${scenario.title}.`,
    `Scenario context: ${scenario.context}`,
    `Target outcome: ${scenario.targetOutcome}`,
    "Reply in short, simple English and keep the learner talking.",
    `Learner message: ${userMessage}`
  ].join("\n\n");
}

function formatTimeLabel(time: string) {
  const date = new Date(time);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function ConversationCoach() {
  const searchParams = useSearchParams();
  const scenarioFromQuery = findConversationScenario(searchParams.get("scenario"));
  const seededScenarioIdRef = useRef<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [activeScenarioId, setActiveScenarioId] = useState<ConversationScenarioId | null>(null);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const storedValue = window.localStorage.getItem(conversationStorageKey);

    if (!storedValue) {
      setHasHydrated(true);
      return;
    }

    try {
      const parsedValue = JSON.parse(storedValue) as StoredConversationMessage[];

      if (Array.isArray(parsedValue)) {
        setMessages(
          parsedValue
            .filter((item): item is StoredConversationMessage => Boolean(item?.role && item?.text && item?.time))
            .map((item) => createMessage(item.role, item.text, item.time))
        );
      }
    } catch {
      setMessages([]);
    } finally {
      setHasHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    const persistableMessages = messages
      .filter((message) => message.role === "user" || message.role === "ai")
      .map(({ role, text, time }) => ({ role, text, time }));

    if (!persistableMessages.length) {
      window.localStorage.removeItem(conversationStorageKey);
      return;
    }

    window.localStorage.setItem(conversationStorageKey, JSON.stringify(persistableMessages));
  }, [hasHydrated, messages]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isSending]);

  useEffect(() => {
    if (!hasHydrated || messages.length > 0 || !scenarioFromQuery || seededScenarioIdRef.current === scenarioFromQuery.id) {
      return;
    }

    setActiveScenarioId(scenarioFromQuery.id);
    setMessages([createMessage("ai", scenarioFromQuery.opener)]);
    seededScenarioIdRef.current = scenarioFromQuery.id;
  }, [hasHydrated, messages.length, scenarioFromQuery]);

  const activeScenario = useMemo(() => findConversationScenario(activeScenarioId), [activeScenarioId]);
  const hasMessages = messages.length > 0;

  async function requestReply(userMessage: string, scenarioId: ConversationScenarioId | null) {
    const response = await fetch(`${getConversationApiBaseUrl()}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: buildChatMessage(userMessage, scenarioId) })
    });
    const data = (await response.json().catch(() => null)) as { reply?: string } | null;

    if (!response.ok || typeof data?.reply !== "string" || !data.reply.trim()) {
      throw new Error("Chat reply missing");
    }

    return data.reply.trim();
  }

  async function sendMessage(seedMessage?: string, nextScenarioId?: ConversationScenarioId | null) {
    const nextMessage = (seedMessage ?? input).trim();
    const scenarioId = nextScenarioId ?? activeScenarioId;

    if (!nextMessage || isSending) {
      return;
    }

    if (nextScenarioId) {
      setActiveScenarioId(nextScenarioId);
    }

    const userMessage = createMessage("user", nextMessage);
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsSending(true);

    try {
      const reply = await requestReply(nextMessage, scenarioId ?? null);
      setMessages((current) => [...current, createMessage("ai", reply)]);
      recordLearnerProgress({
        xp: 6,
        speakingMinutes: 2,
        streakActivity: true,
        weeklyStats: scenarioId ? { roleplays: 1 } : undefined
      });
    } catch {
      setMessages((current) => [...current, createMessage("system", CHAT_ERROR_MESSAGE)]);
    } finally {
      setIsSending(false);
    }
  }

  function resetConversation() {
    setMessages([]);
    setInput("");
    setIsSending(false);
    setActiveScenarioId(null);
  }

  return (
    <main className="section-shell space-y-8">
      <SectionHeading
        eyebrow="Conversation Lab"
        title="AI Se Baat Karo"
        subtitle="Practice English conversation with AI - no judgment"
        description="Starter prompts se shuru karo, phir apni taraf se reply build karo. Yahan goal perfect grammar nahi, balki real conversation confidence banana hai."
      />

      {activeScenario ? (
        <section className="surface-card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-forest">Active scenario</p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-2xl text-ink">{activeScenario.title}</h2>
              <p className="mt-2 text-sm text-stone">{activeScenario.context}</p>
            </div>
            <span className="rounded-full bg-forest-soft px-4 py-2 text-sm font-semibold text-forest">{activeScenario.targetOutcome}</span>
          </div>
        </section>
      ) : null}

      <section className="surface-card p-6 sm:p-8">
        <div className="flex flex-wrap gap-3">
          {starterPrompts.map((prompt) => (
            <button
              key={prompt.label}
              type="button"
              aria-label={`Use starter prompt ${prompt.label}`}
              onClick={() => void sendMessage(prompt.message, prompt.scenarioId ?? null)}
              className="rounded-full border border-ink/10 bg-mist px-4 py-2 text-sm font-semibold text-ink transition hover:border-forest hover:text-forest"
            >
              {prompt.label}
            </button>
          ))}
        </div>

        <div ref={listRef} className="mt-6 max-h-[28rem] space-y-4 overflow-y-auto rounded-[1.8rem] bg-mist p-5">
          {hasMessages ? (
            messages.map((message) => {
              if (message.role === "system") {
                return (
                  <div key={message.id} className="flex justify-center">
                    <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-5 py-4 text-center text-sm text-red-700">
                      {message.text}
                    </div>
                  </div>
                );
              }

              return (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={
                      message.role === "user"
                        ? "max-w-2xl rounded-[1.5rem] bg-forest px-5 py-4 text-sm leading-7 text-white"
                        : "max-w-2xl rounded-[1.5rem] border border-ink/10 bg-white px-5 py-4 text-sm leading-7 text-ink shadow-card"
                    }
                  >
                    <div className={`flex items-center justify-between gap-4 text-xs font-bold uppercase tracking-[0.22em] ${message.role === "user" ? "text-white/70" : "text-stone"}`}>
                      <span>{message.role === "user" ? "You" : "AI Coach"}</span>
                      <span>{formatTimeLabel(message.time)}</span>
                    </div>
                    <p className="mt-2">{message.text}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-ink/15 bg-white/80 px-5 py-8 text-sm text-stone">
              Ek prompt choose karo ya seedha apni line type karke chat shuru karo.
            </div>
          )}

          {isSending ? (
            <div className="flex justify-start">
              <div className="surface-card max-w-md rounded-[1.5rem] px-5 py-4 text-sm text-stone">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone">AI Coach</p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-forest animate-bounce [animation-delay:0ms]" />
                    <span className="h-2 w-2 rounded-full bg-forest animate-bounce [animation-delay:150ms]" />
                    <span className="h-2 w-2 rounded-full bg-forest animate-bounce [animation-delay:300ms]" />
                  </div>
                  <p>AI soch raha hai...</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>

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
          onClick={resetConversation}
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


