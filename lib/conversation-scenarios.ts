export type ConversationScenarioId = "restaurant" | "job-interview" | "client-escalation";

export type ConversationScenario = {
  id: ConversationScenarioId;
  title: string;
  context: string;
  difficulty: "beginner" | "advanced" | "professional";
  targetOutcome: string;
  opener: string;
  starterPrompt: string;
};

export const conversationScenarios: ConversationScenario[] = [
  {
    id: "restaurant",
    title: "Restaurant",
    context: "Practice ordering food, asking about the menu, and speaking politely in a restaurant.",
    difficulty: "beginner",
    targetOutcome: "Speak clearly while ordering, asking questions, and paying politely.",
    opener: "Welcome! What would you like to order today?",
    starterPrompt: "Practice ordering food"
  },
  {
    id: "job-interview",
    title: "Job Interview",
    context: "Practice common interview answers with simple English and confident structure.",
    difficulty: "advanced",
    targetOutcome: "Explain your experience, strengths, and goals with confidence.",
    opener: "Thank you for coming in. Tell me about yourself.",
    starterPrompt: "Practice job interview"
  },
  {
    id: "client-escalation",
    title: "Client Escalation",
    context: "Handle an upset client, show empathy, and propose the next step clearly.",
    difficulty: "professional",
    targetOutcome: "Stay calm, acknowledge the issue, and respond like a professional.",
    opener: "Hello, I'm having an issue with your service...",
    starterPrompt: "Handle client issue"
  }
];

export function findConversationScenario(scenarioId: string | null | undefined) {
  if (!scenarioId) {
    return null;
  }

  return conversationScenarios.find((scenario) => scenario.id === scenarioId) ?? null;
}
