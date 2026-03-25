"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.curriculumRouter = void 0;
const express_1 = require("express");
const curriculum_data_1 = require("./generated/curriculum-data");
exports.curriculumRouter = (0, express_1.Router)();
function parseLevelId(value) {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed >= 1 && parsed <= 4 ? parsed : null;
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
exports.curriculumRouter.get("/levels", (_req, res) => {
    res.json(curriculum_data_1.curriculumStructure.levels);
});
exports.curriculumRouter.get("/levels/:levelId", (req, res) => {
    const levelId = parseLevelId(req.params.levelId);
    if (!levelId) {
        return res.status(400).json({ error: "Level ID must be 1, 2, 3, or 4." });
    }
    const level = (0, curriculum_data_1.getCurriculumLevel)(levelId);
    if (!level) {
        return res.status(404).json({ error: "Level not found." });
    }
    return res.json(level);
});
exports.curriculumRouter.get("/levels/:levelId/lessons", (req, res) => {
    const levelId = parseLevelId(req.params.levelId);
    if (!levelId) {
        return res.status(400).json({ error: "Level ID must be 1, 2, 3, or 4." });
    }
    const lessons = curriculum_data_1.completeCurriculumCourse.lessons.filter((lesson) => lesson.level === levelId);
    return res.json(lessons);
});
exports.curriculumRouter.get("/levels/1/phase-2", (_req, res) => {
    res.json(curriculum_data_1.level1CurriculumLessons);
});
exports.curriculumRouter.get("/lessons/:lessonId", (req, res) => {
    const lesson = (0, curriculum_data_1.getCurriculumLesson)(req.params.lessonId);
    if (!lesson) {
        return res.status(404).json({ error: "Lesson not found." });
    }
    return res.json(lesson);
});
