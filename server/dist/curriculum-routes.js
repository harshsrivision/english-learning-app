"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.curriculumRouter = void 0;
const express_1 = require("express");
const database_1 = require("./database");
const curriculum_data_1 = require("./generated/curriculum-data");
exports.curriculumRouter = (0, express_1.Router)();
function parseLevelId(value) {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed >= 1 && parsed <= 4 ? parsed : null;
}
function parseChapterId(value) {
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
function buildChapterRouteId(chapterId) {
    const match = chapterId.match(/^L(\d+)-C(\d+)$/i);
    if (!match) {
        return chapterId;
    }
    return `${match[1]}-${match[2]}`;
}
function deriveChapterType(title, summary) {
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
function toInteger(value) {
    return typeof value === "number" ? value : Number(value);
}
function toErrorMessage(error, fallback) {
    return error instanceof Error ? error.message : fallback;
}
async function getCurriculumLevelsFromDb() {
    const db = await (0, database_1.initDB)();
    const [levelsResult, chaptersResult, lessonTitlesResult] = await Promise.all([
        db.query(`SELECT level_id, slug, title, cefr_band, outcome, chapter_count, lesson_count
       FROM course_levels
       ORDER BY level_id ASC`),
        db.query(`SELECT chapter_id, level_id, order_index, title, summary
       FROM course_chapters
       ORDER BY level_id ASC, order_index ASC`),
        db.query(`SELECT lesson_id, chapter_id, order_index, title
       FROM course_lessons
       ORDER BY chapter_id ASC, order_index ASC`)
    ]);
    const lessonTitlesByChapter = new Map();
    for (const lessonTitle of lessonTitlesResult.rows) {
        const chapterLessonTitles = lessonTitlesByChapter.get(lessonTitle.chapter_id) ?? [];
        chapterLessonTitles.push({
            lesson_id: lessonTitle.lesson_id,
            order_index: toInteger(lessonTitle.order_index),
            title: lessonTitle.title
        });
        lessonTitlesByChapter.set(lessonTitle.chapter_id, chapterLessonTitles);
    }
    const chaptersByLevel = new Map();
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
exports.curriculumRouter.get("/manifest", (_req, res) => {
    res.json(curriculum_data_1.curriculumManifest);
});
exports.curriculumRouter.get("/structure", (_req, res) => {
    res.json(curriculum_data_1.curriculumStructure);
});
exports.curriculumRouter.get("/systems", (_req, res) => {
    res.json(curriculum_data_1.completeCurriculumCourse.systems);
});
exports.curriculumRouter.get("/levels", async (_req, res) => {
    try {
        const levels = await getCurriculumLevelsFromDb();
        return res.json(levels);
    }
    catch (error) {
        return res.status(500).json({ error: toErrorMessage(error, "Curriculum levels could not be loaded.") });
    }
});
exports.curriculumRouter.get("/levels/:levelId", async (req, res) => {
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
    }
    catch (error) {
        return res.status(500).json({ error: toErrorMessage(error, "Curriculum level could not be loaded.") });
    }
});
exports.curriculumRouter.get("/levels/:levelId/lessons", (req, res) => {
    const levelId = parseLevelId(req.params.levelId);
    if (!levelId) {
        return res.status(400).json({ error: "Level ID must be 1, 2, 3, or 4." });
    }
    const level = (0, curriculum_data_1.getCurriculumLevel)(levelId);
    if (!level) {
        return res.status(404).json({ error: "Level not found." });
    }
    const lessons = curriculum_data_1.completeCurriculumCourse.lessons.filter((lesson) => lesson.level === levelId);
    return res.json(lessons);
});
exports.curriculumRouter.get("/chapters/:levelId", (req, res) => {
    const levelId = parseLevelId(req.params.levelId);
    if (!levelId) {
        return res.status(400).json({ error: "Level ID must be 1, 2, 3, or 4." });
    }
    const level = (0, curriculum_data_1.getCurriculumLevel)(levelId);
    if (!level) {
        return res.status(404).json({ error: "Level not found." });
    }
    return res.json(level.chapters.map((chapter) => ({
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
    })));
});
exports.curriculumRouter.get("/levels/1/phase-2", (_req, res) => {
    res.json(curriculum_data_1.level1CurriculumLessons);
});
exports.curriculumRouter.get("/lessons/:lessonId", (req, res) => {
    const requestedId = req.params.lessonId?.trim();
    const chapterId = parseChapterId(requestedId);
    if (chapterId) {
        const lessons = curriculum_data_1.completeCurriculumCourse.lessons.filter((lesson) => lesson.chapter_id === chapterId);
        if (!lessons.length) {
            return res.status(404).json({ error: "Chapter not found." });
        }
        return res.json(lessons);
    }
    const lesson = (0, curriculum_data_1.getCurriculumLesson)(requestedId ?? "");
    if (!lesson) {
        return res.status(404).json({ error: "Lesson not found." });
    }
    return res.json(lesson);
});
