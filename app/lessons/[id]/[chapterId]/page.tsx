import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChapterLessonBrowser } from "@/components/chapter-lesson-browser";

type ChapterPageProps = {
  params: Promise<{ id: string; chapterId: string }>;
};

export async function generateMetadata({ params }: ChapterPageProps): Promise<Metadata> {
  const { id, chapterId } = await params;
  const chapterNumber = chapterId.split("-")[1] ?? "1";

  return {
    title: `English Chapter Practice - Level ${id} Chapter ${chapterNumber} | Bolo English`,
    description: "Hindi-guided explanation, examples, and chapter practice with progress tracking for English learners."
  };
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { id, chapterId } = await params;
  const levelId = Number(id);

  if (!Number.isInteger(levelId) || levelId < 1 || levelId > 4 || !/^(\d+)-(\d+)$/.test(chapterId)) {
    notFound();
  }

  return <ChapterLessonBrowser levelId={levelId} chapterRouteId={chapterId} />;
}
