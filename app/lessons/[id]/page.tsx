import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonLevelBrowser } from "@/components/lesson-level-browser";

type LessonPageProps = {
  params: Promise<{ id: string }>;
};

const levelMetadata: Record<number, Metadata> = {
  1: {
    title: "Level 1 English Lessons - Beginner Hindi Support | Bolo English",
    description: "Beginner path with Hindi-guided English chapters, chapter progress, aur first-step fluency practice."
  },
  2: {
    title: "Level 2 English Lessons - A2 Growth Path | Bolo English",
    description: "A2 level English chapters with clear progress, practice flow, aur Hindi support for confident daily English."
  },
  3: {
    title: "Level 3 English Lessons - B1 Practice Path | Bolo English",
    description: "B1 level English chapters for structured speaking, grammar control, aur chapter-based fluency practice."
  },
  4: {
    title: "Level 4 English Lessons - B2 to C1 Path | Bolo English",
    description: "Advanced English chapters with professional practice, revision, aur strong CEFR progress tracking."
  }
};

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { id } = await params;
  const levelId = Number(id);
  return levelMetadata[levelId] ?? {
    title: "English Level Lessons | Bolo English",
    description: "Structured English lessons with Hindi support and chapter-by-chapter progress."
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { id } = await params;
  const levelId = Number(id);

  if (!Number.isInteger(levelId) || levelId < 1 || levelId > 4) {
    notFound();
  }

  return <LessonLevelBrowser levelId={levelId} />;
}
