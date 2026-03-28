import { Router } from "express";
import { initDB } from "./database";
import { completeCurriculumCourse, curriculumManifest, curriculumStructure, level1CurriculumLessons } from "./generated/curriculum-data";

export const curriculumRouter = Router();

type CurriculumLevelResponse = (typeof curriculumStructure.levels)[number];
type CurriculumLessonResponse = (typeof completeCurriculumCourse.lessons)[number];
type CurriculumLessonTitleResponse = CurriculumLevelResponse["chapters"][number]["lesson_titles"][number];

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

type CurriculumLessonRow = {
  level_id: number | string;
  level_title: string;
  cefr_band: string;
  chapter_id: string;
  chapter_title: string;
  chapter_summary: string;
  lesson_id: string;
  order_index: number | string;
  global_order_index: number | string;
  title: string;
  learning_objective: string;
  grammar_topic: unknown;
  content: unknown;
  vocabulary_list: unknown;
  exercises: unknown;
  quiz: unknown;
  answers: unknown;
  common_mistakes: unknown;
  confidence_tip: string;
  revision: unknown;
  unlock_logic: unknown;
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

function parseStructuredValue<T>(value: unknown) {
  if (typeof value !== "string") {
    return value as T;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return value as T;
  }
}

async function getCurriculumLevelsFromDb(): Promise<CurriculumLevelResponse[]> {
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

  const lessonTitlesByChapter = new Map<string, CurriculumLessonTitleResponse[]>();

  for (const lessonTitle of lessonTitlesResult.rows) {
    const chapterLessonTitles = lessonTitlesByChapter.get(lessonTitle.chapter_id) ?? [];
    chapterLessonTitles.push({
      lesson_id: lessonTitle.lesson_id,
      order_index: toInteger(lessonTitle.order_index),
      title: lessonTitle.title
    });
    lessonTitlesByChapter.set(lessonTitle.chapter_id, chapterLessonTitles);
  }

  const chaptersByLevel = new Map<number, CurriculumLevelResponse["chapters"]>();

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

async function getCurriculumLevelFromDb(levelId: number) {
  const levels = await getCurriculumLevelsFromDb();
  return levels.find((level) => level.level === levelId) ?? null;
}

async function getCurriculumLessonsFromDb(filters: { levelId?: number; chapterId?: string; lessonId?: string } = {}): Promise<CurriculumLessonResponse[]> {
  const db = await initDB();
  const params: unknown[] = [];
  const whereClauses: string[] = [];

  if (typeof filters.levelId === "number") {
    params.push(filters.levelId);
    whereClauses.push(`cl.level_id = $${params.length}`);
  }

  if (filters.chapterId) {
    params.push(filters.chapterId);
    whereClauses.push(`cl.chapter_id = $${params.length}`);
  }

  if (filters.lessonId) {
    params.push(filters.lessonId);
    whereClauses.push(`cl.lesson_id = $${params.length}`);
  }

  const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";
  const lessonRows = await db.query<CurriculumLessonRow>(
    `SELECT cl.level_id, cl.level_title, cl.cefr_band, cl.chapter_id, cl.chapter_title, cc.summary AS chapter_summary,
            cl.lesson_id, cl.order_index, cl.global_order_index, cl.title, cl.learning_objective,
            cl.grammar_topic, cl.content, cl.vocabulary_list, cl.exercises, cl.quiz, cl.answers,
            cl.common_mistakes, cl.confidence_tip, cl.revision, cl.unlock_logic
     FROM course_lessons cl
     INNER JOIN course_chapters cc ON cc.chapter_id = cl.chapter_id
     ${whereSql}
     ORDER BY cl.global_order_index ASC`,
    params
  );

  return lessonRows.rows.map((lesson) => ({
    level: toInteger(lesson.level_id),
    level_title: lesson.level_title,
    cefr_band: lesson.cefr_band,
    chapter: lesson.chapter_title,
    chapter_id: lesson.chapter_id,
    lesson_id: lesson.lesson_id,
    order_index: toInteger(lesson.order_index),
    global_order_index: toInteger(lesson.global_order_index),
    title: lesson.title,
    learning_objective: lesson.learning_objective,
    grammar_topic: parseStructuredValue<CurriculumLessonResponse["grammar_topic"]>(lesson.grammar_topic),
    vocabulary_list: parseStructuredValue<CurriculumLessonResponse["vocabulary_list"]>(lesson.vocabulary_list),
    content: parseStructuredValue<CurriculumLessonResponse["content"]>(lesson.content),
    exercises: parseStructuredValue<CurriculumLessonResponse["exercises"]>(lesson.exercises),
    quiz: parseStructuredValue<CurriculumLessonResponse["quiz"]>(lesson.quiz),
    answers: parseStructuredValue<CurriculumLessonResponse["answers"]>(lesson.answers),
    common_mistakes: parseStructuredValue<CurriculumLessonResponse["common_mistakes"]>(lesson.common_mistakes),
    confidence_tip: lesson.confidence_tip,
    revision: parseStructuredValue<CurriculumLessonResponse["revision"]>(lesson.revision),
    unlock_logic: parseStructuredValue<CurriculumLessonResponse["unlock_logic"]>(lesson.unlock_logic),
    chapter_summary: lesson.chapter_summary
  }));
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
    const level = await getCurriculumLevelFromDb(levelId);

    if (!level) {
      return res.status(404).json({ error: "Level not found." });
    }

    return res.json(level);
  } catch (error) {
    return res.status(500).json({ error: toErrorMessage(error, "Curriculum level could not be loaded.") });
  }
});

curriculumRouter.get("/levels/:levelId/lessons", async (req, res) => {
  const levelId = parseLevelId(req.params.levelId);

  if (!levelId) {
    return res.status(400).json({ error: "Level ID must be 1, 2, 3, or 4." });
  }

  try {
    const level = await getCurriculumLevelFromDb(levelId);

    if (!level) {
      return res.status(404).json({ error: "Level not found." });
    }

    const lessons = await getCurriculumLessonsFromDb({ levelId });
    return res.json(lessons);
  } catch (error) {
    return res.status(500).json({ error: toErrorMessage(error, "Curriculum lessons could not be loaded.") });
  }
});

curriculumRouter.get("/chapters/:levelId", async (req, res) => {
  const levelId = parseLevelId(req.params.levelId);

  if (!levelId) {
    return res.status(400).json({ error: "Level ID must be 1, 2, 3, or 4." });
  }

  try {
    const level = await getCurriculumLevelFromDb(levelId);

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
  } catch (error) {
    return res.status(500).json({ error: toErrorMessage(error, "Curriculum chapters could not be loaded.") });
  }
});

curriculumRouter.get("/levels/1/phase-2", (_req, res) => {
  res.json(level1CurriculumLessons);
});

curriculumRouter.get("/lessons/:lessonId", async (req, res) => {
  const requestedId = req.params.lessonId?.trim();
  const chapterId = parseChapterId(requestedId);

  try {
    if (chapterId) {
      const lessons = await getCurriculumLessonsFromDb({ chapterId });

      if (!lessons.length) {
        return res.status(404).json({ error: "Chapter not found." });
      }

      return res.json(lessons);
    }

    const lesson = (await getCurriculumLessonsFromDb({ lessonId: requestedId ?? "" }))[0] ?? null;

    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found." });
    }

    return res.json(lesson);
  } catch (error) {
    return res.status(500).json({ error: toErrorMessage(error, "Curriculum lesson could not be loaded.") });
  }
});


