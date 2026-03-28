import { Router } from "express";
import { initDB } from "./database";
import { completeCurriculumCourse, curriculumManifest, curriculumStructure, getCurriculumLesson, getCurriculumLevel, level1CurriculumLessons } from "./generated/curriculum-data";

export const curriculumRouter = Router();

type CurriculumLevelRow = {
  level_id: number | string;
  slug: string;
  title: string;
  cefr_band: string;
  outcome: string;
  chapter_count: number | string;
  lesson_count: number | string;
};

type CurriculumChapterRow = {
  chapter_id: string;
  level_id: number | string;
  order_index: number | string;
  title: string;
  summary: string;
};

type CurriculumLessonTitleRow = {
  lesson_id: string;
  chapter_id: string;
  order_index: number | string;
  title: string;
};

function parseLevelId(value: string | undefined) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 4 ? parsed : null;
}

function parseChapterId(value: string | undefined) {
  if (!value) {
    return null;
  }

  const normalizedValue = value.trim();

  if (/^L\d+-C\d+$/i.test(normalizedValue)) {
    return normalizedValue.toUpperCase();
  }

  const match = normalizedValue.match(/^(\d+)-(\d+)$/);

  if (!match) {
    return null;
  }

  const levelId = Number(match[1]);
  const chapterOrder = Number(match[2]);

  if (!Number.isInteger(levelId) || levelId < 1 || levelId > 4 || !Number.isInteger(chapterOrder) || chapterOrder < 1) {
    return null;
  }

  return `L${levelId}-C${chapterOrder}`;
}

function buildChapterRouteId(chapterId: string) {
  const match = chapterId.match(/^L(\d+)-C(\d+)$/i);

  if (!match) {
    return chapterId;
  }

  return `${match[1]}-${match[2]}`;
}

function deriveChapterType(title: string, summary: string) {
  const combined = `${title} ${summary}`.toLowerCase();

  if (/sound|first|survival|basic|introduction/.test(combined)) {
    return "Foundation";
  }

  if (/home|family|daily|travel|shop|community|routine|life/.test(combined)) {
    return "Daily Life";
  }

  if (/speak|conversation|discussion|talk|presentation|interview|role-play/.test(combined)) {
    return "Speaking";
  }

  if (/work|office|professional|client|business|leadership|meeting/.test(combined)) {
    return "Professional";
  }

  return "Revision";
}

function toInteger(value: number | string) {
  return typeof value === "number" ? value : Number(value);
}

function toErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

async function getCurriculumLevelsFromDb() {
  const db = await initDB();
  const [levelsResult, chaptersResult, lessonTitlesResult] = await Promise.all([
    db.query<CurriculumLevelRow>(
      `SELECT level_id, slug, title, cefr_band, outcome, chapter_count, lesson_count
       FROM course_levels
       ORDER BY level_id ASC`
    ),
    db.query<CurriculumChapterRow>(
      `SELECT chapter_id, level_id, order_index, title, summary
       FROM course_chapters
       ORDER BY level_id ASC, order_index ASC`
    ),
    db.query<CurriculumLessonTitleRow>(
      `SELECT lesson_id, chapter_id, order_index, title
       FROM course_lessons
       ORDER BY chapter_id ASC, order_index ASC`
    )
  ]);

  const lessonTitlesByChapter = new Map<
    string,
    Array<{
      lesson_id: string;
      order_index: number;
      title: string;
    }>
  >();

  for (const lessonTitle of lessonTitlesResult.rows) {
    const chapterLessonTitles = lessonTitlesByChapter.get(lessonTitle.chapter_id) ?? [];
    chapterLessonTitles.push({
      lesson_id: lessonTitle.lesson_id,
      order_index: toInteger(lessonTitle.order_index),
      title: lessonTitle.title
    });
    lessonTitlesByChapter.set(lessonTitle.chapter_id, chapterLessonTitles);
  }

  const chaptersByLevel = new Map<
    number,
    Array<{
      chapter_id: string;
      order_index: number;
      title: string;
      summary: string;
      lesson_titles: Array<{
        lesson_id: string;
        order_index: number;
        title: string;
      }>;
    }>
  >();

  for (const chapter of chaptersResult.rows) {
    const levelId = toInteger(chapter.level_id);
    const levelChapters = chaptersByLevel.get(levelId) ?? [];
    levelChapters.push({
      chapter_id: chapter.chapter_id,
      order_index: toInteger(chapter.order_index),
      title: chapter.title,
      summary: chapter.summary,
      lesson_titles: lessonTitlesByChapter.get(chapter.chapter_id) ?? []
    });
    chaptersByLevel.set(levelId, levelChapters);
  }

  return levelsResult.rows.map((level) => {
    const levelId = toInteger(level.level_id);

    return {
      level: levelId,
      slug: level.slug,
      title: level.title,
      cefr_band: level.cefr_band,
      outcome: level.outcome,
      chapter_count: toInteger(level.chapter_count),
      lesson_count: toInteger(level.lesson_count),
      chapters: chaptersByLevel.get(levelId) ?? []
    };
  });
}

curriculumRouter.get("/manifest", (_req, res) => {
  res.json(curriculumManifest);
});

curriculumRouter.get("/structure", (_req, res) => {
  res.json(curriculumStructure);
});

curriculumRouter.get("/systems", (_req, res) => {
  res.json(completeCurriculumCourse.systems);
});

curriculumRouter.get("/levels", async (_req, res) => {
  try {
    const levels = await getCurriculumLevelsFromDb();
    return res.json(levels);
  } catch (error) {
    return res.status(500).json({ error: toErrorMessage(error, "Curriculum levels could not be loaded.") });
  }
});

curriculumRouter.get("/levels/:levelId", async (req, res) => {
  const levelId = parseLevelId(req.params.levelId);

  if (!levelId) {
    return res.status(400).json({ error: "Level ID must be 1, 2, 3, or 4." });
  }

  try {
    const levels = await getCurriculumLevelsFromDb();
    const level = levels.find((item) => item.level === levelId);

    if (!level) {
      return res.status(404).json({ error: "Level not found." });
    }

    return res.json(level);
  } catch (error) {
    return res.status(500).json({ error: toErrorMessage(error, "Curriculum level could not be loaded.") });
  }
});

curriculumRouter.get("/levels/:levelId/lessons", (req, res) => {
  const levelId = parseLevelId(req.params.levelId);

  if (!levelId) {
    return res.status(400).json({ error: "Level ID must be 1, 2, 3, or 4." });
  }

  const level = getCurriculumLevel(levelId);

  if (!level) {
    return res.status(404).json({ error: "Level not found." });
  }

  const lessons = completeCurriculumCourse.lessons.filter((lesson) => lesson.level === levelId);
  return res.json(lessons);
});

curriculumRouter.get("/chapters/:levelId", (req, res) => {
  const levelId = parseLevelId(req.params.levelId);

  if (!levelId) {
    return res.status(400).json({ error: "Level ID must be 1, 2, 3, or 4." });
  }

  const level = getCurriculumLevel(levelId);

  if (!level) {
    return res.status(404).json({ error: "Level not found." });
  }

  return res.json(
    level.chapters.map((chapter) => ({
      level: level.level,
      level_title: level.title,
      cefr_band: level.cefr_band,
      chapter_id: chapter.chapter_id,
      route_id: buildChapterRouteId(chapter.chapter_id),
      order_index: chapter.order_index,
      title: chapter.title,
      summary: chapter.summary,
      kind: deriveChapterType(chapter.title, chapter.summary),
      type: deriveChapterType(chapter.title, chapter.summary),
      lesson_count: chapter.lesson_titles.length,
      lesson_titles: chapter.lesson_titles
    }))
  );
});

curriculumRouter.get("/levels/1/phase-2", (_req, res) => {
  res.json(level1CurriculumLessons);
});

curriculumRouter.get("/lessons/:lessonId", (req, res) => {
  const requestedId = req.params.lessonId?.trim();
  const chapterId = parseChapterId(requestedId);

  if (chapterId) {
    const lessons = completeCurriculumCourse.lessons.filter((lesson) => lesson.chapter_id === chapterId);

    if (!lessons.length) {
      return res.status(404).json({ error: "Chapter not found." });
    }

    return res.json(lessons);
  }

  const lesson = getCurriculumLesson(requestedId ?? "");

  if (!lesson) {
    return res.status(404).json({ error: "Lesson not found." });
  }

  return res.json(lesson);
});
