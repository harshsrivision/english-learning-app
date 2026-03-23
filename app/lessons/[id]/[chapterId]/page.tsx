import { notFound } from "next/navigation";
import { ChapterDetailView } from "@/components/chapter-detail-view";

type ChapterPageProps = {
  params: Promise<{ id: string; chapterId: string }>;
};

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { id, chapterId } = await params;
  const lessonId = Number(id);

  if (!Number.isInteger(lessonId) || lessonId <= 0 || !chapterId) {
    notFound();
  }

  return <ChapterDetailView lessonId={lessonId} chapterId={chapterId} />;
}
