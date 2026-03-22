"use client";

import {
  BarChart3,
  BookOpen,
  BookText,
  Bot,
  CheckCircle2,
  Flame,
  Headphones,
  Medal,
  Mic2,
  Newspaper,
  RotateCcw,
  Trophy,
  Zap
} from "lucide-react";
import { DailyPlanCard } from "@/components/daily-plan-card";
import { DashboardTopBar } from "@/components/dashboard-top-bar";
import { ProgressStatCard } from "@/components/progress-stat-card";
import { SectionHeading } from "@/components/section-heading";
import { dailyPlanBlocks, type DailyPlanBlock } from "@/lib/app-data";
import {
  formatSpeakingHours,
  getChallengeProgress,
  getCurrentCefrLevel,
  getCurrentChallenge,
  getDaysRemainingInWeek,
  getProgressClass,
  getTodayCompletedBlocks,
  getTodayCompletedXp,
  toggleDailyPlanBlock
} from "@/lib/local-progress";
import { useLearnerProgress } from "@/lib/use-learner-progress";

const blockIcons = {
  "warm-up": RotateCcw,
  vocabulary: BookOpen,
  grammar: BookText,
  listening: Headphones,
  reading: Newspaper,
  speaking: Mic2,
  roleplay: Bot,
  quiz: CheckCircle2
} as const;

export default function DashboardPage() {
  const { progress, setProgress } = useLearnerProgress();

  if (!progress) {
    return (
      <main className="section-shell">
        <div className="surface-card p-6 text-sm text-stone">Dashboard loading ho raha hai...</div>
      </main>
    );
  }

  const currentLevel = getCurrentCefrLevel(progress.totalXp);
  const completedToday = new Set(getTodayCompletedBlocks(progress));
  const todayXp = getTodayCompletedXp(progress);
  const currentChallenge = getCurrentChallenge();
  const challengeProgress = getChallengeProgress(progress, currentChallenge);
  const challengePercent = Math.min(100, Math.round((challengeProgress / currentChallenge.goalTotal) * 100));
  const daysRemaining = getDaysRemainingInWeek();

  function handleToggleBlock(block: DailyPlanBlock) {
    setProgress((currentProgress) => toggleDailyPlanBlock(currentProgress, block));
  }

  const stats = [
    { title: "Total XP earned", subtitle: "Ab tak ka all-time score", value: progress.totalXp.toLocaleString(), icon: Zap },
    { title: "Current streak", subtitle: "Kitne din lagatar aaye", value: `${progress.streakDays} days`, icon: Flame },
    { title: "Lessons completed", subtitle: "Session jo finish ho chuke", value: String(progress.lessonsCompleted), icon: CheckCircle2 },
    { title: "Speaking hours logged", subtitle: "Mic ke saath bitaya hua waqt", value: formatSpeakingHours(progress.speakingMinutes), icon: Mic2 },
    { title: "Vocabulary words learned", subtitle: "Yaad kiye hue active words", value: String(progress.vocabularyWords), icon: BookOpen },
    { title: "Current CEFR level", subtitle: "Aaj ka fluency stage", value: currentLevel, icon: BarChart3 }
  ] as const;

  return (
    <main className="section-shell space-y-8">
      <SectionHeading
        eyebrow="Learner Dashboard"
        title="Aaj Ka Progress Center"
        subtitle="Your daily system for XP, streaks, and spoken growth"
        description="Yahaan se tum dekh sakte ho ki aaj kya complete hua, is hafte ka challenge kahan tak pahucha, aur fluency journey kitni tez chal rahi hai."
      />

      <DashboardTopBar streakDays={progress.streakDays} totalXp={progress.totalXp} currentLevel={currentLevel} badgeCount={progress.badges.length} />

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="surface-card p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-3xl text-ink">Aaj Ka Plan</h2>
              <p className="mt-2 text-base font-medium text-stone">Today&apos;s 45-Minute Session</p>
            </div>
            <div className="rounded-[1.5rem] bg-forest px-4 py-3 text-white">
              <p className="text-xs uppercase tracking-[0.22em] text-white/70">XP earned today</p>
              <p className="mt-2 text-3xl font-bold">{todayXp}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {dailyPlanBlocks.map((block) => {
              const Icon = blockIcons[block.id as keyof typeof blockIcons];

              return (
                <DailyPlanCard
                  key={block.id}
                  id={block.id}
                  title={block.title}
                  subtitle={block.hindiSubtitle}
                  duration={block.duration}
                  description={block.description}
                  xp={block.xp}
                  checked={completedToday.has(block.id)}
                  icon={Icon}
                  onToggle={() => handleToggleBlock(block)}
                />
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <section className="surface-card p-6 sm:p-8">
            <div>
              <h2 className="font-display text-3xl text-ink">Is Hafte Ka Challenge</h2>
              <p className="mt-2 text-base font-medium text-stone">This Week&apos;s Challenge</p>
            </div>
            <div className="mt-6 rounded-[1.6rem] bg-mist p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-forest">Current rotation</p>
                  <h3 className="mt-2 font-display text-2xl text-ink">{currentChallenge.name}</h3>
                  <p className="mt-2 text-sm font-semibold text-stone">{currentChallenge.hindiSubtitle}</p>
                </div>
                <Trophy className="h-6 w-6 text-gold" />
              </div>
              <p className="mt-4 text-sm leading-7 text-stone">{currentChallenge.goal}</p>
              <div className="mt-5 h-3 rounded-full bg-white">
                <div className={`h-3 rounded-full bg-forest ${getProgressClass(challengePercent)}`} />
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 text-sm font-semibold text-stone">
                <span>{challengeProgress} / {currentChallenge.goalTotal}</span>
                <span>{daysRemaining === 0 ? "Ends today" : `${daysRemaining} days remaining`}</span>
              </div>
              <div className="mt-5 rounded-[1.3rem] bg-white p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-stone">Reward</p>
                <p className="mt-2 text-sm font-semibold text-ink">{currentChallenge.reward}</p>
              </div>
            </div>
          </section>

          <section className="surface-card p-6 sm:p-8">
            <div>
              <h2 className="font-display text-3xl text-ink">Unlocked Badges</h2>
              <p className="mt-2 text-base font-medium text-stone">Jo consistency dikh rahi hai, uska reward yahan milega</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {progress.badges.length ? (
                progress.badges.map((badge) => (
                  <span key={badge} className="inline-flex items-center gap-2 rounded-full bg-forest-soft px-4 py-2 text-sm font-semibold text-forest">
                    <Medal className="h-4 w-4" />
                    {badge}
                  </span>
                ))
              ) : (
                <p className="text-sm text-stone">Complete a lesson, speaking drill, or streak milestone to unlock your first badge.</p>
              )}
            </div>
          </section>
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Progress Stats"
          title="Har Number Ka Matlab Hai"
          subtitle="The stats that show if your English is actually moving"
          description="Ye cards sirf vanity numbers nahi hain. Inse pata chalta hai ki vocabulary, speaking, aur consistency teenon saath badh rahe hain ya nahi."
        />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map((stat, index) => (
            <ProgressStatCard key={stat.title} title={stat.title} subtitle={stat.subtitle} value={stat.value} icon={stat.icon} delay={index * 0.05} />
          ))}
        </div>
      </section>
    </main>
  );
}

