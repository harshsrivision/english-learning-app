"use client";

import { ArrowRight, BriefcaseBusiness, Building2, Coffee, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SectionHeading } from "@/components/section-heading";
import { apiFetchJson, toApiErrorMessage } from "@/lib/api";
import { recordLearnerProgress } from "@/lib/local-progress";
import { scenarios as fallbackScenarios } from "@/lib/mock-data";

type ScenarioLevel = "beginner" | "intermediate" | "advanced" | "professional";

type SimulationScenario = {
  id: number;
  title: string;
  context: string;
  difficulty: ScenarioLevel;
  targetOutcome: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "ai";
  text: string;
};

type ChatResponse = {
  reply?: string;
  error?: string;
};

const scenarioIcons = [Coffee, BriefcaseBusiness, Building2] as const;

function createMessage(role: ChatMessage["role"], text: string) {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    text
  } satisfies ChatMessage;
}

function buildScenarioPrompt(scenario: SimulationScenario, messages: ChatMessage[], learnerMessage?: string) {
  const history = messages
    .slice(-4)
    .map((message) => `${message.role === "user" ? "Learner" : "Scenario partner"}: ${message.text}`)
    .join("\n");

  return [
    `You are roleplaying a real-life English practice scenario for a Hindi-speaking learner.`,
    `Scenario: ${scenario.title}`,
    `Context: ${scenario.context}`,
    `Target outcome: ${scenario.targetOutcome}`,
    `Reply in simple English, stay in character, and keep the learner speaking.`,
    history ? `Recent conversation:\n${history}` : "Start the simulation with the first line from the other person in this scenario.",
    learnerMessage ? `Learner says: ${learnerMessage}` : "Open the scenario now."
  ].join("\n\n");
}

export function SimulationStudio() {
  const [scenarios, setScenarios] = useState<SimulationScenario[]>(fallbackScenarios);
  const [activeScenario, setActiveScenario] = useState<SimulationScenario | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoadingScenarios, setIsLoadingScenarios] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadScenarios() {
      try {
        setIsLoadingScenarios(true);
        const data = await apiFetchJson<SimulationScenario[]>("/api/conversations/scenarios", { timeoutMs: 15000 });

        if (!ignore && Array.isArray(data) && data.length) {
          setScenarios(data);
        }
      } catch {
        if (!ignore) {
          setScenarios(fallbackScenarios);
        }
      } finally {
        if (!ignore) {
          setIsLoadingScenarios(false);
        }
      }
    }

    void loadScenarios();

    return () => {
      ignore = true;
    };
  }, []);

  const activeScenarioId = activeScenario?.id ?? null;
  const canSend = Boolean(activeScenario && input.trim() && !isSending);
  const hasMessages = useMemo(() => messages.length > 0, [messages.length]);

  async function requestScenarioReply(scenario: SimulationScenario, nextMessages: ChatMessage[], learnerMessage?: string) {
    const prompt = buildScenarioPrompt(scenario, nextMessages, learnerMessage);
    const data = await apiFetchJson<ChatResponse>("chat", {
      method: "POST",
      timeoutMs: 30000,
      body: JSON.stringify({ message: prompt })
    });

    if (!data.reply) {
      throw new Error("Simulation reply missing hai.");
    }

    return data.reply;
  }

  async function startScenario(scenario: SimulationScenario) {
    if (isSending) {
      return;
    }

    setActiveScenario(scenario);
    setMessages([]);
    setInput("");
    setError(null);
    setIsSending(true);

    try {
      const reply = await requestScenarioReply(scenario, []);
      setMessages([createMessage("ai", reply)]);
      recordLearnerProgress({ xp: 28, speakingMinutes: 6, streakActivity: true, weeklyStats: { roleplays: 1 } });
    } catch (requestError) {
      setError(toApiErrorMessage(requestError, "Simulation abhi start nahi ho pa rahi."));
    } finally {
      setIsSending(false);
    }
  }

  async function sendMessage() {
    if (!activeScenario || !input.trim() || isSending) {
      return;
    }

    const learnerMessage = input.trim();
    const userMessage = createMessage("user", learnerMessage);
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setError(null);
    setIsSending(true);

    try {
      const reply = await requestScenarioReply(activeScenario, nextMessages, learnerMessage);
      setMessages((current) => [...current, createMessage("ai", reply)]);
    } catch (requestError) {
      setError(toApiErrorMessage(requestError, "Simulation ka next turn abhi nahi aa raha."));
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="section-shell space-y-8">
      <SectionHeading
        eyebrow="Simulations"
        title="Real English Scenario Practice"
        subtitle="Job interview, restaurant, client call - sab yahin rehearse karo"
        description="Scenario choose karo, AI se context mein baat shuru karo, aur step by step hesitation hatao. Yeh space real world ke pressure ko safe practice mein convert karta hai."
      />

      {error ? <p className="rounded-[1.5rem] bg-red-50 px-5 py-4 text-sm text-red-800">{error}</p> : null}
      {isLoadingScenarios ? <div className="surface-card p-6 text-sm text-stone">Scenarios load ho rahe hain...</div> : null}

      <section className="grid gap-5 lg:grid-cols-3">
        {scenarios.map((scenario, index) => {
          const Icon = scenarioIcons[index % scenarioIcons.length];
          const isActive = activeScenarioId === scenario.id;

          return (
            <article key={scenario.id} className={`surface-card flex h-full flex-col gap-5 p-6 ${isActive ? "border-forest/30" : ""}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-soft text-forest">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="rounded-full border border-ink/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-stone">{scenario.difficulty}</span>
              </div>
              <div>
                <h2 className="font-display text-2xl text-ink">{scenario.title}</h2>
                <p className="mt-2 text-sm leading-7 text-stone">{scenario.context}</p>
              </div>
              <div className="rounded-[1.5rem] bg-forest-soft p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-forest">Hindi target</p>
                <p className="mt-2 text-sm leading-7 text-stone">{scenario.targetOutcome}</p>
              </div>
              <button
                type="button"
                aria-label={`Start simulation for ${scenario.title}`}
                onClick={() => void startScenario(scenario)}
                disabled={isSending}
                className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-forest px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-forest/50"
              >
                Start Simulation →
                <ArrowRight className="h-4 w-4" />
              </button>
            </article>
          );
        })}
      </section>

      {activeScenario ? (
        <section className="grid gap-6 lg:grid-cols-[0.9fr,1.1fr]">
          <aside className="surface-card p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-forest">Active Scenario</p>
            <h2 className="mt-4 font-display text-3xl text-ink">{activeScenario.title}</h2>
            <p className="mt-3 text-sm leading-7 text-stone">{activeScenario.context}</p>
            <div className="mt-6 rounded-[1.5rem] bg-mist p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone">Target outcome</p>
              <p className="mt-3 text-sm leading-7 text-stone">{activeScenario.targetOutcome}</p>
            </div>
          </aside>

          <div className="surface-card p-6 sm:p-8">
            <div className="space-y-4 rounded-[1.8rem] bg-mist p-5">
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
                        {message.role === "user" ? "You" : "Scenario partner"}
                      </p>
                      <p className="mt-2">{message.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-ink/15 bg-white/80 px-5 py-8 text-sm text-stone">
                  Kisi scenario ko start karte hi AI opener yahin dikhega.
                </div>
              )}

              {isSending ? (
                <div className="flex justify-start">
                  <div className="surface-card max-w-md rounded-[1.5rem] px-5 py-4 text-sm text-stone">
                    AI soch raha hai...
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row">
              <input
                aria-label="Type your reply for the active simulation"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
                placeholder="Type your English reply for this scenario"
                className="h-14 flex-1 rounded-full border border-ink/10 bg-mist px-5 text-sm text-ink outline-none placeholder:text-stone/60 focus:border-forest"
              />
              <button
                type="button"
                aria-label="Send your reply in the active simulation"
                onClick={() => void sendMessage()}
                disabled={!canSend}
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-forest px-6 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-forest/50"
              >
                <Send className="h-4 w-4" />
                Send
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}