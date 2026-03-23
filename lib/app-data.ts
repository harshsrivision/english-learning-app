export type CefrLevel = "A0" | "A1" | "A2" | "B1" | "B2" | "C1";

export type HomeStep = {
  id: string;
  stepNumber: string;
  title: string;
  hindiSubtitle: string;
  description: string;
};

export type Testimonial = {
  name: string;
  city: string;
  quote: string;
  level: CefrLevel;
  timeline: string;
};

export type FeatureCardData = {
  id: string;
  title: string;
  hindiSubtitle: string;
  description: string;
};

export type CoursePreview = {
  id: number;
  level: CefrLevel;
  title: string;
  hindiSubtitle: string;
  duration: string;
  description: string;
  href: string;
};

export type WeeklyMetric =
  | "vocabularyWords"
  | "speakingDrills"
  | "perfectGrammarDays"
  | "roleplays"
  | "articlesRead"
  | "writingPieces";

export type DailyPlanBlock = {
  id: string;
  title: string;
  hindiSubtitle: string;
  duration: string;
  xp: number;
  description: string;
  statBoosts: {
    lessonsCompleted?: number;
    speakingMinutes?: number;
    vocabularyWords?: number;
  };
  weeklyMetric?: WeeklyMetric;
  weeklyMetricAmount?: number;
};

export type WeeklyChallenge = {
  id: string;
  name: string;
  hindiSubtitle: string;
  goal: string;
  reward: string;
  goalTotal: number;
  metric: WeeklyMetric;
};

export type RoadmapLevel = {
  level: CefrLevel;
  title: string;
  hindiTitle: string;
  months: string;
  vocabulary: string;
  outcomes: string[];
};

export type GrammarTopicCardData = {
  id: string;
  title: string;
  hindiSubtitle: string;
  level: CefrLevel;
  duration: string;
  hook: string;
  description: string;
  lessonId: number;
};

export const homeTrustLine = "4.8 rated | 12,000+ learners | Used in 18 Indian cities";

export const howItWorksSteps: HomeStep[] = [
  {
    id: "level",
    stepNumber: "01",
    title: "Apna Level Chunno",
    hindiSubtitle: "Choose your level",
    description: "Start from A0 and move toward B2 with a roadmap that feels clear from day one."
  },
  {
    id: "plan",
    stepNumber: "02",
    title: "Roz 30-40 Min Seekho",
    hindiSubtitle: "Follow your daily lesson plan",
    description: "Every day mixes vocabulary, grammar, listening, reading, speaking, and one AI roleplay."
  },
  {
    id: "score",
    stepNumber: "03",
    title: "AI Se Bolo, Score Pao",
    hindiSubtitle: "Speak with AI, get scored, level up",
    description: "Practice out loud, get instant feedback, and build confidence before real conversations."
  }
];

export const testimonials: Testimonial[] = [
  {
    name: "Priya Sharma",
    city: "Lucknow",
    quote: "Pehle English bolne mein bahut dara lagta tha, ab office mein presentations deti hoon!",
    level: "B1",
    timeline: "Reached B1 in 4 months"
  },
  {
    name: "Rahul Verma",
    city: "Patna",
    quote: "Job interview mein English ki wajah se reject hota tha, ab selected ho gaya!",
    level: "A2",
    timeline: "Reached A2 in 6 weeks"
  },
  {
    name: "Anjali Singh",
    city: "Bhopal",
    quote: "Bolo English ne meri life badal di - seedha aur simple seekhne ka tarika!",
    level: "B2",
    timeline: "Reached B2 in 8 months"
  }
];

export const featureCards: FeatureCardData[] = [
  {
    id: "ai-speaking",
    title: "AI Speaking Partner",
    hindiSubtitle: "Hindi guidance ke saath bolne ki practice",
    description: "24/7 available, Hindi guidance included"
  },
  {
    id: "pronunciation",
    title: "Pronunciation Scoring",
    hindiSubtitle: "Har line par clear score milega",
    description: "5-dimension scoring on every sentence"
  },
  {
    id: "roadmap",
    title: "CEFR Roadmap",
    hindiSubtitle: "A0 se C1 tak seedha raasta",
    description: "Clear path from A0 to C1, no confusion"
  },
  {
    id: "xp",
    title: "XP & Badges",
    hindiSubtitle: "Game jaisa progress, roz motivation",
    description: "Level up like a game, stay motivated"
  },
  {
    id: "daily-plan",
    title: "Daily Plan",
    hindiSubtitle: "Roz ka session pehle se tayyar",
    description: "Structured 45-min sessions, no guesswork"
  },
  {
    id: "simulations",
    title: "200+ Simulations",
    hindiSubtitle: "Interview se travel tak real scenarios",
    description: "Real scenarios: interviews, meetings, travel"
  }
];

export const coursePreviewCards: CoursePreview[] = [
  {
    id: 1,
    level: "A0",
    title: "Daily Introduction",
    hindiSubtitle: "Apna parichay dena aur basic greeting ko natural banana",
    duration: "15 min",
    description: "Short self-introduction, name, city, and polite greeting flow.",
    href: "/lessons"
  },
  {
    id: 2,
    level: "A2",
    title: "Workplace English",
    hindiSubtitle: "Office meetings aur updates ko confidence se bolna",
    duration: "20 min",
    description: "Useful lines for meetings, follow-ups, and asking for clarification.",
    href: "/lessons"
  },
  {
    id: 3,
    level: "B1",
    title: "Client Presentation",
    hindiSubtitle: "Presentation mein structure, clarity, aur business words",
    duration: "30 min",
    description: "Present ideas with structure, control, and better business vocabulary.",
    href: "/lessons"
  },
  {
    id: 4,
    level: "B2",
    title: "Leadership Communication",
    hindiSubtitle: "Senior-level tone, persuasion aur negotiation",
    duration: "35 min",
    description: "Lead high-stakes conversations with calm, polish, and authority.",
    href: "/lessons"
  }
];

export const dailyPlanBlocks: DailyPlanBlock[] = [
  {
    id: "warm-up",
    title: "Warm-Up Review",
    hindiSubtitle: "Kal ka quick revision",
    duration: "3 min",
    xp: 10,
    description: "Revise yesterday's best lines before starting new work.",
    weeklyMetricAmount: 0,
    statBoosts: {}
  },
  {
    id: "vocabulary",
    title: "New Vocabulary",
    hindiSubtitle: "Aaj ke 5 naye words",
    duration: "5 min",
    xp: 20,
    description: "Learn useful English words tied to work, travel, and daily life.",
    statBoosts: { vocabularyWords: 5 },
    weeklyMetric: "vocabularyWords",
    weeklyMetricAmount: 5
  },
  {
    id: "grammar",
    title: "Grammar Point",
    hindiSubtitle: "Ek rule jo turant yaad rahe",
    duration: "5 min",
    xp: 15,
    description: "One grammar concept with five examples and one short drill.",
    statBoosts: {},
    weeklyMetric: "perfectGrammarDays",
    weeklyMetricAmount: 1
  },
  {
    id: "listening",
    title: "Listening Exercise",
    hindiSubtitle: "Sunke samajhne ki training",
    duration: "5 min",
    xp: 15,
    description: "Sharpen comprehension with short Indian-accent friendly listening clips.",
    statBoosts: {},
    weeklyMetricAmount: 0
  },
  {
    id: "reading",
    title: "Reading Practice",
    hindiSubtitle: "Chhota passage, clear meaning",
    duration: "5 min",
    xp: 15,
    description: "Read a short article and spot useful phrases you can reuse out loud.",
    statBoosts: {},
    weeklyMetric: "articlesRead",
    weeklyMetricAmount: 1
  },
  {
    id: "speaking",
    title: "Speaking Drill",
    hindiSubtitle: "Mic kholo aur zor se bolo",
    duration: "5 min",
    xp: 25,
    description: "Record one focused speaking drill and work on rhythm plus clarity.",
    statBoosts: { speakingMinutes: 5 },
    weeklyMetric: "speakingDrills",
    weeklyMetricAmount: 1
  },
  {
    id: "roleplay",
    title: "AI Roleplay Conversation",
    hindiSubtitle: "Real situation mein AI ke saath practice",
    duration: "7 min",
    xp: 30,
    description: "Handle an interview, meeting, or support call with AI-led prompts.",
    statBoosts: { speakingMinutes: 7, lessonsCompleted: 1 },
    weeklyMetric: "roleplays",
    weeklyMetricAmount: 1
  },
  {
    id: "quiz",
    title: "Daily Quiz + XP",
    hindiSubtitle: "Aaj ka quick check",
    duration: "1 min",
    xp: 10,
    description: "Finish with one minute of recall to lock the session into memory.",
    statBoosts: {},
    weeklyMetricAmount: 0
  }
];

export const weeklyChallenges: WeeklyChallenge[] = [
  {
    id: "vocab-sprint",
    name: "Vocabulary Sprint",
    hindiSubtitle: "50 words seekho aur speed pakdo",
    goal: "Learn 50 words",
    reward: "150 XP + Vocab Champ badge",
    goalTotal: 50,
    metric: "vocabularyWords"
  },
  {
    id: "speaking-marathon",
    name: "Speaking Marathon",
    hindiSubtitle: "7 din, 7 speaking drills",
    goal: "7 speaking drills in 7 days",
    reward: "200 XP",
    goalTotal: 7,
    metric: "speakingDrills"
  },
  {
    id: "grammar-week",
    name: "Perfect Grammar Week",
    hindiSubtitle: "Roz grammar pe full control",
    goal: "90%+ on all grammar exercises",
    reward: "175 XP",
    goalTotal: 7,
    metric: "perfectGrammarDays"
  },
  {
    id: "conversation-blitz",
    name: "Conversation Blitz",
    hindiSubtitle: "Roleplay mein hesitation khatam",
    goal: "5 roleplay scenarios",
    reward: "160 XP",
    goalTotal: 5,
    metric: "roleplays"
  },
  {
    id: "reading-race",
    name: "Reading Race",
    hindiSubtitle: "Roz thoda padhke fluency badhao",
    goal: "Read 5 articles",
    reward: "130 XP",
    goalTotal: 5,
    metric: "articlesRead"
  },
  {
    id: "writing-challenge",
    name: "Writing Challenge",
    hindiSubtitle: "3 AI-reviewed pieces likho",
    goal: "3 AI-reviewed pieces",
    reward: "140 XP",
    goalTotal: 3,
    metric: "writingPieces"
  }
];

export const roadmapLevels: RoadmapLevel[] = [
  {
    level: "A0",
    title: "Absolute Beginner",
    hindiTitle: "Bilkul shuruaat",
    months: "0-3 months",
    vocabulary: "0-200 words",
    outcomes: [
      "Can introduce yourself with name, city, and job",
      "Can understand slow everyday greetings",
      "Can speak in short memorized sentences"
    ]
  },
  {
    level: "A1",
    title: "Beginner",
    hindiTitle: "Rozmarra English ki shuruaat",
    months: "3-6 months",
    vocabulary: "500-800 words",
    outcomes: [
      "Can ask and answer simple daily questions",
      "Can describe family, routine, and preferences",
      "Can manage short public interactions politely"
    ]
  },
  {
    level: "A2",
    title: "Elementary",
    hindiTitle: "Basic se practical bolna",
    months: "6-12 months",
    vocabulary: "1,500-2,000 words",
    outcomes: [
      "Can handle simple travel, shopping, and office exchanges",
      "Can talk about past and future plans in simple English",
      "Can participate in short interviews with support"
    ]
  },
  {
    level: "B1",
    title: "Intermediate",
    hindiTitle: "Ab baat jamne lagti hai",
    months: "12-18 months",
    vocabulary: "3,000-4,000 words",
    outcomes: [
      "Can explain ideas with reasons and examples",
      "Can manage meetings, presentations, and phone calls",
      "Can maintain longer conversations without freezing"
    ]
  },
  {
    level: "B2",
    title: "Upper Intermediate",
    hindiTitle: "Confident professional communication",
    months: "18-22 months",
    vocabulary: "6,000-8,000 words",
    outcomes: [
      "Can present opinions clearly in groups",
      "Can negotiate, persuade, and clarify under pressure",
      "Can speak naturally across work and social situations"
    ]
  },
  {
    level: "C1",
    title: "Advanced",
    hindiTitle: "Fluent aur polished communication",
    months: "22-28 months",
    vocabulary: "12,000-15,000 words",
    outcomes: [
      "Can lead complex meetings and strategic conversations",
      "Can adapt tone for clients, leadership, and interviews",
      "Can speak with nuance, confidence, and precision"
    ]
  }
];

export const grammarTopicCards: GrammarTopicCardData[] = [
  {
    id: "present-tense",
    title: "Present Tense",
    hindiSubtitle: "Aaj kya kar rahe ho?",
    level: "A1",
    duration: "15 min",
    hook: "Daily routine, habit, aur abhi chal raha action samajhne ke liye.",
    description: "One clear rule, five examples, and one mini speaking drill.",
    lessonId: 7
  },
  {
    id: "past-tense",
    title: "Past Tense",
    hindiSubtitle: "Kal kya hua?",
    level: "A2",
    duration: "20 min",
    hook: "Yesterday, last week, aur finished actions ko naturally bolne ke liye.",
    description: "Useful for stories, interviews, and experience sharing.",
    lessonId: 10
  },
  {
    id: "future-tense",
    title: "Future Tense",
    hindiSubtitle: "Kal kya hoga?",
    level: "A2",
    duration: "15 min",
    hook: "Plans, promises, aur upcoming work ke liye future sentence patterns.",
    description: "Short structure practice with confident speaking prompts.",
    lessonId: 11
  },
  {
    id: "questions",
    title: "Question Structures",
    hindiSubtitle: "Kaise puchte hain?",
    level: "A1",
    duration: "15 min",
    hook: "What, where, why, when aur polite questions ka simple system.",
    description: "Great for classroom, office, and travel conversations.",
    lessonId: 8
  },
  {
    id: "articles",
    title: "Articles (a/an/the)",
    hindiSubtitle: "Ye lagana kyun zaroori hai?",
    level: "A1",
    duration: "10 min",
    hook: "Small words jo sentence ko natural aur correct bana dete hain.",
    description: "Quick fixes for one of the most common Hindi-speaker mistakes.",
    lessonId: 5
  },
  {
    id: "prepositions",
    title: "Prepositions",
    hindiSubtitle: "In, on, at - kab kya?",
    level: "A2",
    duration: "15 min",
    hook: "Time, place, aur movement ke liye right preposition choose karna.",
    description: "Use realistic examples from office, home, and travel.",
    lessonId: 9
  },
  {
    id: "tenses-overview",
    title: "Tenses Overview",
    hindiSubtitle: "Sab tenses ek saath",
    level: "B1",
    duration: "25 min",
    hook: "Poora tense map ek jagah, taaki confusion finally khatam ho.",
    description: "Ideal when you want the full picture instead of isolated rules.",
    lessonId: 15
  },
  {
    id: "modals",
    title: "Modals and Polite English",
    hindiSubtitle: "Can, could, should kab bolna hai?",
    level: "B1",
    duration: "20 min",
    hook: "Polite request, advice, ability, aur office English ke liye.",
    description: "Makes your English sound more natural and professional.",
    lessonId: 16
  },
  {
    id: "conditionals",
    title: "Conditionals",
    hindiSubtitle: "Agar... toh... wale sentences",
    level: "B1",
    duration: "20 min",
    hook: "If I study, I will pass — yeh pattern B1 se zaroor seekho.",
    description: "0, 1st, 2nd conditional with real office and life examples.",
    lessonId: 21
  },
  {
    id: "passive-voice",
    title: "Passive Voice",
    hindiSubtitle: "Kaam kiya gaya vs kaam kiya",
    level: "B2",
    duration: "20 min",
    hook: "Reports, emails, aur formal writing mein passive voice common hai.",
    description: "Learn when to use it and how to switch between active and passive.",
    lessonId: 14
  },
  {
    id: "reported-speech",
    title: "Reported Speech",
    hindiSubtitle: "Unhone kaha ki...",
    level: "B1",
    duration: "15 min",
    hook: "Meetings mein kisi ki baat doosre ko batane ke liye.",
    description: "Direct se indirect speech mein convert karna with tense shifts.",
    lessonId: 13
  },
  {
    id: "connectors",
    title: "Discourse Markers",
    hindiSubtitle: "Ideas ko jodne wale phrases",
    level: "B1",
    duration: "15 min",
    hook: "However, therefore, in addition — presentations ke liye essential.",
    description: "Make your English flow naturally from one idea to the next.",
    lessonId: 17
  }
];
