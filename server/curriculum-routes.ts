import { Router } from "express";
import { completeCurriculumCourse, curriculumManifest, curriculumStructure, getCurriculumLesson, getCurriculumLevel, level1CurriculumLessons } from "./generated/curriculum-data";

export const curriculumRouter = Router();

function parseLevelId(value: string | undefined) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 4 ? parsed : null;
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

curriculumRouter.get("/levels", (_req, res) => {
  res.json(curriculumStructure.levels);
});

curriculumRouter.get("/levels/:levelId", (req, res) => {
  const levelId = parseLevelId(req.params.levelId);

  if (!levelId) {
    return res.status(400).json({ error: "Level ID must be 1, 2, 3, or 4." });
  }

  const level = getCurriculumLevel(levelId);

  if (!level) {
    return res.status(404).json({ error: "Level not found." });
  }

  return res.json(level);
});

curriculumRouter.get("/levels/:levelId/lessons", (req, res) => {
  const levelId = parseLevelId(req.params.levelId);

  if (!levelId) {
    return res.status(400).json({ error: "Level ID must be 1, 2, 3, or 4." });
  }

  const lessons = completeCurriculumCourse.lessons.filter((lesson) => lesson.level === levelId);
  return res.json(lessons);
});

curriculumRouter.get("/levels/1/phase-2", (_req, res) => {
  res.json(level1CurriculumLessons);
});

curriculumRouter.get("/lessons/:lessonId", (req, res) => {
  const lesson = getCurriculumLesson(req.params.lessonId);

  if (!lesson) {
    return res.status(404).json({ error: "Lesson not found." });
  }

  return res.json(lesson);
});
