# Bolo English

Starter web application for Hindi speakers learning English speaking from beginner to professional level.

## Stack

- Frontend: Next.js App Router + Tailwind CSS
- Backend: Node.js + Express API
- Database: PostgreSQL

## Features

- AI speaking practice flow scaffold
- Hindi grammar explanations
- Pronunciation feedback API contract
- Vocabulary learning pages and schema
- Conversation simulation pages and API

## Project Structure

```text
app/                  Next.js frontend pages
components/           Reusable UI components
lib/                  Shared types and mock data
server/               Express API
db/                   PostgreSQL schema and seed scripts
```

## Run

```bash
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`.
API runs on `http://localhost:4000`.

## Database

1. Create a PostgreSQL database named `bolo_english`.
2. Run `db/schema.sql`.
3. Run `db/seed.sql`.

## API Endpoints

- `GET /api/health`
- `GET /api/lessons`
- `GET /api/grammar-topics`
- `GET /api/vocabulary`
- `GET /api/conversations/scenarios`
- `POST /api/speaking/session`
- `POST /api/pronunciation/analyze`
- `POST /api/conversations/simulate`
