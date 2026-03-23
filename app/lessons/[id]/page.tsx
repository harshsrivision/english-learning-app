import { notFound } from "next/navigation";
import { LessonDetailView } from "@/components/lesson-detail-view";

type LessonPageProps = {
  params: Promise<{ id: string }>;
};

export default async function LessonPage({ params }: LessonPageProps) {
  const { id } = await params;
  const lessonId = Number(id);

  if (!Number.isInteger(lessonId) || lessonId <= 0) {
    notFound();
  }

  return <LessonDetailView lessonId={lessonId} />;
}
