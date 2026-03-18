"use client";

import { motion } from "framer-motion";
import { ArrowRight, BriefcaseBusiness, Building2, Coffee, Headphones, Send, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SectionHeading } from "@/components/section-heading";
import { apiFetchJson, toApiErrorMessage } from "@/lib/api";
import { recordLearnerProgress } from "@/lib/local-progress";
import { scenarios as fallbackScenarios } from "@/lib/mock-data";
import { useRequiredUserId } from "@/lib/use-required-user-id";

type ScenarioLevel = "beginner" | "intermediate" | "advanced" | "professional";

type SimulationScenario = {
  id: number;
  title: string;
  context: string;
  difficulty: ScenarioLevel;
  targetOutcome: string;
};

type SimulationResponse = {
  scenario?: string;
  aiResponse?: string;
  hintInHindi?: string;
  suggestedReply?: string;
  error?: string;
};

const scenarioIcons = [Coffee, BriefcaseBusiness, Building2] as const;
const prepChecklist = [
  "Pehle apna objective socho: order dena hai, answer dena hai, ya issue solve karna hai.",
  "3 simple English lines pehle se ready rakho.",
  "Fast bolne ke bajay clear bolna choose karo.",
  "If you get stuck, use one recovery line: Let me explain it clearly."
];

export default function SimulationPage() {
  const { userId, isChecking } = useRequiredUserId();
  const [scenarios, setScenarios] = useState<SimulationScenario[]>(fallbackScenarios);
  const [selectedScenarioId, setSelectedScenarioId] = useState<number>(fallbackScenarios[0]?.id ?? 1);
  const [learnerMessage, setLearnerMessage] = useState("");
  const [result, setResult] = useState<SimulationResponse | null>(null);
  const [isLoadingScenarios, setIsLoadingScenarios] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadScenarios() {
      try {
        setIsLoadingScenarios(true);
        const data = await apiFetchJson<SimulationScenario[] | { error?: string }>("/api/conversations/scenarios", {
          timeoutMs: 15000
        });

        if (!Array.isArray(data) || !data.length) {
          throw new Error("Scenario library could not be loaded.");
        }

        if (!ignore) {
          setScenarios(data);
          setSelectedScenarioId((currentId) => (data.some((scenario) => scenario.id === currentId) ? currentId : data[0].id));
        }
      } catch (requestError) {
        if (!ignore) {
          setError(toApiErrorMessage(requestError, "Scenario library could not be loaded."));
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

  const selectedScenario = useMemo(
    () => scenarios.find((scenario) => scenario.id === selectedScenarioId) ?? scenarios[0] ?? null,
    [scenarios, selectedScenarioId]
  );

  if (isChecking || !userId) {
    return (
      <main className="section-shell">
        <div className="surface-card p-8 text-sm text-stone">Checking account session...</div>
      </main>
    );
  }

  async function runSimulation() {
    if (!selectedScenario || !learnerMessage.trim() || isSimulating) {
      return;
    }

    setIsSimulating(true);
    setError(null);
    setResult(null);

    try {
      const data = await apiFetchJson<SimulationResponse>("/api/conversations/simulate", {
        method: "POST",
        timeoutMs: 20000,
        body: JSON.stringify({
          scenarioId: selectedScenario.id,
          learnerMessage: learnerMessage.trim(),
          proficiency: selectedScenario.difficulty
        })
      });

      if (!data.aiResponse || !data.hintInHindi) {
        throw new Error("Simulation response was incomplete.");
      }

      setResult(data);
      recordLearnerProgress({
        xp: 28,
        speakingMinutes: 6,
        streakActivity: true,
        weeklyStats: {
          roleplays: 1
        }
      });
    } catch (requestError) {
      setError(toApiErrorMessage(requestError, "Simulation could not be completed."));
    } finally {
      setIsSimulating(false);
    }
  }

  return (
    <main className="section-shell space-y-10">
      <SectionHeading
        eyebrow="Simulations"
        title="Real-Life Simulation Room"
        subtitle="Practice the moments jahan English bolte waqt sabse zyada hesitation hoti hai"
        description="Interview, restaurant, client call, ya travel counter - pehle yahaan practice karo, phir real life mein calmly handle karo."
      />

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="surface-card halo-panel p-6 sm:p-8">
          <div className="flex items-center gap-3 text-forest">
            <Sparkles className="h-5 w-5" />
            <p className="text-sm font-semibold uppercase tracking-[0.22em]">Simulation flow</p>
          </div>
          <h2 className="mt-4 font-display text-3xl text-ink">From safe practice to real pressure</h2>
          <p className="mt-2 text-base font-medium text-stone">Pehle rehearsal karo, phir asli situation ko confidently handle karo</p>
          <p className="mt-3 text-sm leading-7 text-stone">Har scenario tumhe ek real-world context deta hai, ek target outcome deta hai, aur backend AI tumhare reply ko next turn ke saath आगे badhata hai.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.5rem] bg-white p-5 shadow-card">
              <p className="text-sm font-semibold text-ink">Prompt samjho</p>
              <p className="mt-2 text-sm text-stone">Situation ko Hindi context ke saath absorb karo.</p>
            </div>
            <div className="rounded-[1.5rem] bg-white p-5 shadow-card">
              <p className="text-sm font-semibold text-ink">Response build karo</p>
              <p className="mt-2 text-sm text-stone">2-3 short lines se answer ka skeleton banao.</p>
            </div>
            <div className="rounded-[1.5rem] bg-white p-5 shadow-card">
              <p className="text-sm font-semibold text-ink">AI turn lo</p>
              <p className="mt-2 text-sm text-stone">Real reply, Hindi hint, aur suggested answer ek hi step mein dekho.</p>
            </div>
          </div>
        </div>

        <div className="surface-card p-6 sm:p-8">
          <h2 className="font-display text-3xl text-ink">Before You Start</h2>
          <p className="mt-2 text-base font-medium text-stone">Shuru karne se pehle ye chhoti tayari hesitation kam karti hai</p>
          <div className="mt-6 space-y-3">
            {prepChecklist.map((item) => (
              <div key={item} className="rounded-[1.4rem] bg-mist px-4 py-4 text-sm leading-7 text-stone">
                {item}
              </div>
            ))}
          </div>
          <Link href="/conversation" aria-label="Open conversation practice" className="mt-6 inline-flex items-center gap-2 rounded-full bg-forest px-5 py-3 text-sm font-bold text-white">
            Open Conversation Practice
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {error ? <p className="rounded-2xl bg-clay/10 px-4 py-3 text-sm text-clay">{error}</p> : null}

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Scenario Library"
          title="Aaj Kaunse Moment Ki Practice Karni Hai?"
          subtitle="Pick a setting and start speaking with intention"
        />
        {isLoadingScenarios ? <div className="surface-card p-6 text-sm text-stone">Loading scenarios...</div> : null}
        <div className="grid gap-6 lg:grid-cols-3">
          {scenarios.map((scenario, index) => {
            const Icon = scenarioIcons[index % scenarioIcons.length];
            const isSelected = scenario.id === selectedScenarioId;

            return (
              <motion.article
                key={scenario.id}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
                whileHover={{ y: -6 }}
                className={`surface-card flex h-full flex-col gap-5 p-6 ${isSelected ? "border-forest/25" : ""}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-soft text-forest">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-mist px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-stone">{scenario.difficulty}</span>
                </div>
                <div>
                  <h3 className="font-display text-2xl text-ink">{scenario.title}</h3>
                  <p className="mt-2 text-sm font-semibold text-stone">Hindi context ke saath guided scenario</p>
                </div>
                <p className="text-sm leading-7 text-stone">{scenario.context}</p>
                <div className="rounded-[1.5rem] bg-sky px-4 py-4 text-sm font-medium leading-7 text-stone">
                  Target outcome: {scenario.targetOutcome}
                </div>
                <button
                  type="button"
                  aria-label={`Select ${scenario.title} simulation`}
                  onClick={() => {
                    setSelectedScenarioId(scenario.id);
                    setLearnerMessage("");
                    setResult(null);
                    setError(null);
                  }}
                  className={`mt-auto inline-flex items-center gap-2 text-sm font-bold ${isSelected ? "text-forest" : "text-ink"}`}
                >
                  {isSelected ? "Selected" : "Start Scenario"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </motion.article>
            );
          })}
        </div>
      </section>

      {selectedScenario ? (
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="surface-card p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-teal">Active Simulation</p>
            <h2 className="mt-4 font-display text-3xl text-ink">{selectedScenario.title}</h2>
            <p className="mt-2 text-sm font-medium text-stone">Backend roleplay ke saath apna real answer test karo</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] bg-mist p-5">
                <p className="text-sm font-semibold text-ink">Scenario context</p>
                <p className="mt-2 text-sm leading-7 text-stone">{selectedScenario.context}</p>
              </div>
              <div className="rounded-[1.5rem] bg-mist p-5">
                <p className="text-sm font-semibold text-ink">Target outcome</p>
                <p className="mt-2 text-sm leading-7 text-stone">{selectedScenario.targetOutcome}</p>
              </div>
            </div>

            <label className="mt-6 block text-sm font-semibold text-ink" htmlFor="simulation-message">
              Your response
            </label>
            <textarea
              id="simulation-message"
              aria-label="Type your simulation response"
              value={learnerMessage}
              onChange={(event) => setLearnerMessage(event.target.value)}
              placeholder="Type the English line you would say in this situation."
              className="mt-3 min-h-40 w-full rounded-[1.5rem] border border-ink/10 bg-sand px-5 py-4 text-sm leading-6 text-ink outline-none placeholder:text-ink/35 focus:border-teal"
            />

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                aria-label="Run AI simulation"
                onClick={() => void runSimulation()}
                disabled={isSimulating || learnerMessage.trim().length < 3}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-forest/50"
              >
                <Send className="h-4 w-4" />
                {isSimulating ? "Running..." : "Run Simulation"}
              </button>
              <button
                type="button"
                aria-label="Clear current simulation response"
                onClick={() => {
                  setLearnerMessage("");
                  setResult(null);
                  setError(null);
                }}
                className="inline-flex items-center justify-center rounded-full border border-ink/10 px-6 py-3 text-sm font-bold text-ink transition hover:border-forest hover:text-forest"
              >
                Reset Response
              </button>
            </div>
          </div>

          <aside className="surface-card p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold">AI Coach</p>
            <h2 className="mt-4 font-display text-3xl text-ink">Live Roleplay Feedback</h2>
            <p className="mt-2 text-sm font-medium text-stone">AI ka next turn, Hindi hint, aur suggested reply yahin dikhega</p>

            {result ? (
              <div className="mt-6 space-y-4">
                <div className="rounded-[1.5rem] bg-mist p-5">
                  <p className="text-sm font-semibold text-ink">AI response</p>
                  <p className="mt-3 text-sm leading-7 text-stone">{result.aiResponse}</p>
                </div>
                <div className="rounded-[1.5rem] bg-mist p-5">
                  <p className="text-sm font-semibold text-ink">Hindi hint</p>
                  <p className="mt-3 text-sm leading-7 text-stone">{result.hintInHindi}</p>
                </div>
                <div className="rounded-[1.5rem] bg-mist p-5">
                  <p className="text-sm font-semibold text-ink">Suggested reply</p>
                  <p className="mt-3 text-sm leading-7 text-stone">{result.suggestedReply ?? "Use the AI response and Hindi hint to build your next line."}</p>
                  {result.suggestedReply ? (
                    <button
                      type="button"
                      aria-label="Use suggested reply in the response box"
                      onClick={() => setLearnerMessage(result.suggestedReply ?? "")}
                      className="mt-4 inline-flex rounded-full bg-forest px-4 py-2 text-sm font-bold text-white"
                    >
                      Use Suggested Reply
                    </button>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-[1.5rem] border border-dashed border-ink/15 bg-white/70 px-5 py-6 text-sm text-stone">
                Pick a scenario, type your English response, and run the simulation to see the backend reply.
              </div>
            )}
          </aside>
        </section>
      ) : null}

      <section className="grid gap-6 md:grid-cols-2">
        <div className="surface-card p-6 sm:p-8">
          <div className="flex items-center gap-3 text-forest">
            <ShieldCheck className="h-5 w-5" />
            <div>
              <h2 className="font-display text-3xl text-ink">What gets better?</h2>
              <p className="mt-2 text-sm font-medium text-stone">Simulation se kaunse real speaking skills sharp hote hain</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-7 text-stone">Simulations se sirf vocabulary nahi badhti. Recovery lines, calm tone, aur real-world decision language bhi improve hoti hai.</p>
        </div>
        <div className="surface-card p-6 sm:p-8">
          <div className="flex items-center gap-3 text-forest">
            <Headphones className="h-5 w-5" />
            <div>
              <h2 className="font-display text-3xl text-ink">Best way to use it</h2>
              <p className="mt-2 text-sm font-medium text-stone">Ek hi scenario ko kaise repeat karke fluency nikalo</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-7 text-stone">Ek scenario ko 3 baar bolo: first attempt, corrected attempt, then fast confident attempt. Teeno mein difference turant sunai dega.</p>
        </div>
      </section>
    </main>
  );
}
