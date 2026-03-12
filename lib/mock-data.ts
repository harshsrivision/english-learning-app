import {
  GrammarTopic,
  LearnerSnapshot,
  Lesson,
  RecentActivity,
  Scenario,
  SkillProgress,
  VocabularyTerm,
  WeeklyGoal
} from "@/lib/types";

export const lessons: Lesson[] = [
  {
    id: 1,
    title: "Daily Introduction",
    level: "beginner",
    durationMinutes: 15,
    focus: "Simple self-introduction and greeting flow",
    hindiSummary: "Apna parichay dena, naam batana, aur basic greeting ko natural tarike se bolna."
  },
  {
    id: 2,
    title: "Workplace English",
    level: "intermediate",
    durationMinutes: 20,
    focus: "Meetings, updates, and asking for clarification",
    hindiSummary: "Office meetings mein update dena aur doubt clear karne ke liye useful English."
  },
  {
    id: 3,
    title: "Client Presentation",
    level: "advanced",
    durationMinutes: 30,
    focus: "Structured pitch, confidence, and business vocabulary",
    hindiSummary: "Professional presentation ke liye structured speaking aur impact language."
  },
  {
    id: 4,
    title: "Leadership Communication",
    level: "professional",
    durationMinutes: 35,
    focus: "Negotiation, persuasion, and executive tone",
    hindiSummary: "Senior-level communication ke liye persuasive aur polished English speaking."
  }
];

export const grammarTopics: GrammarTopic[] = [
  {
    id: 1,
    englishTitle: "Simple Present",
    hindiTitle: "Simple Present Tense",
    explanation: "Jab hum habit, routine ya universal truth ke baare mein bolte hain tab simple present use hota hai.",
    example: "I go to the office every day. / Main roz office jata hoon.",
    level: "beginner"
  },
  {
    id: 2,
    englishTitle: "Present Continuous",
    hindiTitle: "Present Continuous Tense",
    explanation: "Jo kaam abhi chal raha hai uske liye is tense ka use hota hai. Helping verb plus verb-ing lagta hai.",
    example: "She is speaking with the teacher. / Woh teacher se baat kar rahi hai.",
    level: "beginner"
  },
  {
    id: 3,
    englishTitle: "Modal Verbs",
    hindiTitle: "Can, Could, Should ka use",
    explanation: "Permission, ability, suggestion aur polite request batane ke liye modal verbs ka use hota hai.",
    example: "Could you repeat that please? / Kya aap ise dobara bol sakte hain?",
    level: "intermediate"
  },
  {
    id: 4,
    englishTitle: "Professional Connectors",
    hindiTitle: "Formal linking phrases",
    explanation: "Presentation aur meetings mein ideas ko connect karne ke liye however, therefore, in addition jaise phrases use hote hain.",
    example: "Therefore, we recommend a phased rollout. / Isliye hum phase-wise rollout suggest karte hain.",
    level: "professional"
  }
];

export const vocabularyTerms: VocabularyTerm[] = [
  {
    id: 1,
    english: "Schedule",
    hindi: "Samay-sarani / plan",
    category: "Work",
    usage: "I will share the project schedule by evening.",
    level: "intermediate"
  },
  {
    id: 2,
    english: "Confident",
    hindi: "Atmavishvas se bhara hua",
    category: "Personality",
    usage: "You sound more confident when you speak slowly.",
    level: "beginner"
  },
  {
    id: 3,
    english: "Negotiate",
    hindi: "Baat-cheet karke samjhauta karna",
    category: "Business",
    usage: "We need to negotiate the final price with the client.",
    level: "advanced"
  },
  {
    id: 4,
    english: "Outcome",
    hindi: "Parinam",
    category: "Meetings",
    usage: "Let us focus on the expected outcome of this call.",
    level: "professional"
  },
  {
    id: 5,
    english: "Clarify",
    hindi: "Spasht karna",
    category: "Communication",
    usage: "Could you clarify the second point once more?",
    level: "intermediate"
  },
  {
    id: 6,
    english: "Deadline",
    hindi: "Antim tareekh",
    category: "Work",
    usage: "We must finish this report before the deadline.",
    level: "beginner"
  },
  {
    id: 7,
    english: "Collaborate",
    hindi: "Milkar kaam karna",
    category: "Business",
    usage: "Our teams will collaborate on the next release.",
    level: "advanced"
  },
  {
    id: 8,
    english: "Polite",
    hindi: "Vinarm",
    category: "Conversation",
    usage: "A polite tone makes your request sound professional.",
    level: "beginner"
  },
  {
    id: 9,
    english: "Feedback",
    hindi: "Pratikriya / sujhav",
    category: "Meetings",
    usage: "Thank you for the feedback on my presentation.",
    level: "intermediate"
  },
  {
    id: 10,
    english: "Opportunity",
    hindi: "Avasar",
    category: "Career",
    usage: "This role is a good opportunity to improve my communication skills.",
    level: "advanced"
  }
];

export const scenarios: Scenario[] = [
  {
    id: 1,
    title: "Restaurant Visit",
    context: "Practice ordering food, asking about the menu, and paying politely.",
    difficulty: "beginner",
    targetOutcome: "Speak clearly in a basic public interaction."
  },
  {
    id: 2,
    title: "Job Interview",
    context: "Answer common interview questions with Hindi hints and follow-up prompts.",
    difficulty: "advanced",
    targetOutcome: "Explain experience and strengths with confidence."
  },
  {
    id: 3,
    title: "Client Escalation Call",
    context: "Handle an upset customer, show empathy, and propose next steps.",
    difficulty: "professional",
    targetOutcome: "Maintain calm, clarity, and authority in spoken English."
  }
];

export const learnerSnapshot: LearnerSnapshot = {
  name: "Harsh",
  currentLevel: "intermediate",
  nextLevel: "advanced",
  progressToNextLevel: 68,
  streakDays: 14,
  speakingScore: 78,
  pronunciationScore: 74,
  vocabularyMastered: 36,
  grammarCompleted: 18,
  totalLessonsCompleted: 12
};

export const skillProgress: SkillProgress[] = [
  {
    skill: "Speaking Fluency",
    percent: 78,
    note: "Answers are becoming longer and more structured."
  },
  {
    skill: "Pronunciation",
    percent: 74,
    note: "Work on v/w and th sounds for sharper clarity."
  },
  {
    skill: "Grammar Control",
    percent: 71,
    note: "Tense usage is improving in everyday conversation."
  },
  {
    skill: "Professional Vocabulary",
    percent: 63,
    note: "Business words are growing, but recall still needs repetition."
  }
];

export const weeklyGoals: WeeklyGoal[] = [
  {
    title: "Speaking sessions",
    target: "4 practice sessions this week",
    progress: 75
  },
  {
    title: "Vocabulary review",
    target: "20 Hindi-English words",
    progress: 60
  },
  {
    title: "Pronunciation drills",
    target: "3 focused sound exercises",
    progress: 33
  }
];

export const recentActivities: RecentActivity[] = [
  {
    title: "Interview simulation",
    result: "Fluency score improved by 6 points",
    timeLabel: "Today"
  },
  {
    title: "Vocabulary review: Work category",
    result: "8 words marked mastered",
    timeLabel: "Yesterday"
  },
  {
    title: "Pronunciation drill",
    result: "Practiced v/w contrast and sentence stress",
    timeLabel: "2 days ago"
  }
];
