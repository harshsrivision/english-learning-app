# Curriculum System

This repo now includes a production-ready English curriculum package built for a four-level learning path.

## Files

- `server/curriculum/blueprint-level-1.json` to `server/curriculum/blueprint-level-4.json`: authoring blueprints for all four levels.
- `server/curriculum/build-course.mjs`: generator that builds all curriculum artifacts.
- `server/generated/curriculum-phase-1-course-structure.json`: level, chapter, and lesson outline.
- `server/generated/curriculum-phase-2-level-1-lessons.json`: complete beginner lessons.
- `server/generated/curriculum-phase-3-complete-course.json`: full 200-lesson curriculum.
- `server/generated/curriculum-data.ts`: typed runtime export for the API.
- `db/course-curriculum-schema.sql`: database schema for the curriculum tables.
- `db/generated/course-curriculum-seed.sql`: SQL seed for all generated levels, chapters, and lessons.

## API

The server now exposes these endpoints under `/api/curriculum`:

- `/manifest`
- `/structure`
- `/systems`
- `/levels`
- `/levels/:levelId`
- `/levels/:levelId/lessons`
- `/levels/1/phase-2`
- `/lessons/:lessonId`

## Regeneration

Run the generator before a server build if you update any blueprint file:

```bash
npm --prefix server run generate:curriculum
```

The server build now regenerates the curriculum automatically.
