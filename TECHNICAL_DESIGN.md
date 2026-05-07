# Steps Guidance — Technical Design Document

> **Audience:** Developers, technical reviewers, and engineering leads.  
> **Companion doc:** See `README.md` for the end-user guide (student & admin workflows).  
> **Live app:** [steps-abroad.vercel.app](https://steps-abroad.vercel.app)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Repository Structure](#2-repository-structure)
3. [Tech Stack](#3-tech-stack)
4. [System Architecture](#4-system-architecture)
5. [Authentication & Role Model](#5-authentication--role-model)
6. [Data Model](#6-data-model)
7. [API Design](#7-api-design)
8. [Assessment Engine](#8-assessment-engine)
9. [AI Integration](#9-ai-integration)
10. [PDF Generation](#10-pdf-generation)
11. [Frontend Architecture](#11-frontend-architecture)
12. [Deployment](#12-deployment)
13. [Environment Variables](#13-environment-variables)
14. [Local Development Setup](#14-local-development-setup)
15. [Known Constraints & Design Decisions](#15-known-constraints--design-decisions)

---

## 1. Project Overview

**Steps Guidance** is a structured **career discovery platform**. Students complete a multi-section questionnaire (sections A–G); the backend scores their responses, derives trait profiles, matches them to career paths, and generates an AI-written advisory summary. Admins manage the question bank and view/export student results.

### Core capabilities

| Capability | Description |
|---|---|
| Role-based access | Separate student and admin authentication flows |
| Adaptive questionnaire | 7-section (A–G) assessment, one question at a time, with resume support |
| AI-generated report | Scores, trait chart, career matches, and an AI advisor narrative |
| Admin dashboard | User management, question bank editor, PDF export, system status |

---

## 2. Repository Structure

```
steps-abroad/
├── frontend/          # Client-side application
│   ├── src/
│   │   ├── app/       # Pages / routes
│   │   ├── components/
│   │   ├── lib/       # Utilities, API clients
│   │   └── types/
│   ├── public/
│   └── README.md      # Frontend setup guide
│
├── backend/           # API server
│   ├── src/
│   │   ├── routes/    # REST endpoints
│   │   ├── controllers/
│   │   ├── models/    # Data schemas
│   │   ├── services/  # Business logic (scoring, AI, PDF)
│   │   └── middleware/
│   └── README.md      # Backend setup guide
│
├── .gitignore
├── bun.lock           # Bun lockfile
├── bun.lockb          # Binary Bun lockfile
└── README.md          # End-user guide (this repo's root README)
```

---

## 3. Tech Stack

### Runtime & Tooling

| Layer | Technology | Notes |
|---|---|---|
| Package manager / runtime | **Bun** | Used across both frontend and backend (`bun.lock` at root) |
| Language | **TypeScript** (72.8%) + JavaScript (26%) | Strict typing throughout |

### Frontend

| Concern | Technology |
|---|---|
| Framework | React / Next.js (TypeScript) |
| Styling | Tailwind CSS or CSS Modules |
| State management | React context / hooks |
| HTTP client | Fetch API or Axios |
| Hosting | **Vercel** |

### Backend

| Concern | Technology |
|---|---|
| Runtime | Node.js via **Bun** |
| Framework | Express.js or Hono (lightweight, Bun-compatible) |
| Authentication | JWT (JSON Web Tokens) |
| Database | PostgreSQL or Supabase (inferred from system status checks) |
| ORM / query | Prisma or Drizzle |
| AI integration | OpenAI API (GPT-4) or Anthropic Claude API |
| PDF generation | Puppeteer or `pdf-lib` |

> **Note:** The exact library choices for database ORM, AI provider, and PDF renderer are confirmed by the `backend/` source. Reviewers should check `backend/package.json` for the definitive list.

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser / App                             │
│              (Next.js frontend on Vercel)                        │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS REST API
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Backend API Server                         │
│         (Node/Bun, Express/Hono, JWT middleware)                 │
│                                                                  │
│   ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐   │
│   │  Auth       │  │  Assessment  │  │  Admin              │   │
│   │  Routes     │  │  Engine      │  │  Routes             │   │
│   └─────────────┘  └──────┬───────┘  └─────────────────────┘   │
│                           │                                      │
│              ┌────────────┼────────────┐                         │
│              ▼            ▼            ▼                         │
│        ┌──────────┐ ┌──────────┐ ┌──────────┐                  │
│        │ Database │ │ AI API   │ │ PDF Gen  │                   │
│        │ (Postgres│ │(OpenAI / │ │(Puppeteer│                   │
│        │ /Supabase│ │ Claude)  │ │/ pdf-lib)│                   │
│        └──────────┘ └──────────┘ └──────────┘                  │
└─────────────────────────────────────────────────────────────────┘
```

**Request lifecycle (assessment submit):**

1. Student submits final answer → `POST /api/assessment/submit`
2. Backend validates JWT, retrieves all stored answers
3. Scoring service calculates section scores and trait values
4. AI service sends prompt + scores to the LLM; receives advisory narrative
5. Results are persisted to database; student's account is marked **completed**
6. Response returned → frontend renders the results page

---

## 5. Authentication & Role Model

### Roles

| Role | Login credential | Access |
|---|---|---|
| **Student** | Gmail address + password | Assessment, own results only |
| **Admin** | Username (non-email) + password | Full admin dashboard |

### Auth flow

```
Client                         Backend
  │                               │
  │─── POST /api/auth/login ──────▶│
  │    { email/username, password }│
  │                               │── Validate credentials in DB
  │                               │── Sign JWT { userId, role }
  │◀── { token, role } ───────────│
  │                               │
  │── All subsequent requests ────▶│
  │   Authorization: Bearer <JWT>  │── Middleware verifies token & role
```

### Student email rule

In production mode, student emails are **validated to be `@gmail.com` format** before account creation and login. This is enforced at both the frontend (form validation) and backend (middleware check).

### Retake lock

Once a student's assessment is marked `completed = true` in the database, all `GET /api/assessment` calls redirect them to the results page. Retakes are blocked at the API level, not just the UI.

---

## 6. Data Model

> Approximate schema — verify against `backend/src/models/` for exact field names and types.

### `users`

| Field | Type | Notes |
|---|---|---|
| `id` | UUID / INT | Primary key |
| `name` | VARCHAR | Display name |
| `email` | VARCHAR | Unique; must be Gmail for students |
| `password_hash` | VARCHAR | bcrypt hashed |
| `role` | ENUM | `student` \| `admin` |
| `created_at` | TIMESTAMP | |

### `assessment_progress`

| Field | Type | Notes |
|---|---|---|
| `id` | UUID / INT | |
| `user_id` | FK → users | |
| `current_question_index` | INT | Supports resume |
| `answers` | JSONB | `{ questionId: selectedOptionId }` |
| `completed` | BOOLEAN | Set `true` on final submit |
| `submitted_at` | TIMESTAMP | |

### `questions`

| Field | Type | Notes |
|---|---|---|
| `id` | UUID / INT | |
| `section` | CHAR(1) | A–G |
| `layer` | VARCHAR | Survey depth tag |
| `type` | ENUM | `multiple_choice` \| `forced_choice` \| `scale` |
| `text` | TEXT | Question body |
| `order_index` | INT | Position within section |
| `allow_custom_answer` | BOOLEAN | Enables free-text on one option |

### `question_options`

| Field | Type | Notes |
|---|---|---|
| `id` | UUID / INT | |
| `question_id` | FK → questions | |
| `label` | VARCHAR | Visible text |
| `internal_id` | VARCHAR | Optional scoring tag |
| `hint_text` | VARCHAR | Shown when `allow_custom_answer = true` |

### `results`

| Field | Type | Notes |
|---|---|---|
| `id` | UUID / INT | |
| `user_id` | FK → users | |
| `section_scores` | JSONB | Score per section A–G |
| `trait_scores` | JSONB | Derived trait values |
| `ai_readiness_score` | FLOAT | |
| `career_matches` | JSONB | Ranked career fit list |
| `ai_summary` | TEXT | LLM-generated narrative |
| `created_at` | TIMESTAMP | |

---

## 7. API Design

All endpoints are prefixed `/api`. Protected routes require `Authorization: Bearer <JWT>`.

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/login` | None | Student or admin login; returns JWT |
| `POST` | `/auth/logout` | Any | Invalidate session / clear client token |

### Assessment (Student)

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/assessment` | Student | Fetch questions and current progress |
| `POST` | `/assessment/answer` | Student | Save a single answer (in-progress) |
| `POST` | `/assessment/submit` | Student | Submit all answers; triggers scoring + AI |
| `GET` | `/assessment/result` | Student | Fetch own completed results |

### Admin — Users

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/admin/users` | Admin | List all students |
| `POST` | `/admin/users` | Admin | Create a new student account |
| `DELETE` | `/admin/users/:id` | Admin | Permanently delete student + data |
| `GET` | `/admin/users/:id/result` | Admin | View a student's full results |
| `GET` | `/admin/users/:id/pdf` | Admin | Download student result as PDF |

### Admin — Question Bank

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/admin/questions` | Admin | List all questions grouped by section |
| `POST` | `/admin/questions` | Admin | Create a new question |
| `DELETE` | `/admin/questions/:id` | Admin | Delete a question |

### System

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/system/status` | Admin | Returns health of DB, AI API, and server |

---

## 8. Assessment Engine

### Sections

The questionnaire is divided into **7 sections (A–G)**. Sections are always presented in alphabetical order. New questions added via the admin panel are appended to the end of their chosen section.

### Scoring logic

After submit, the backend:

1. Groups answers by section (A–G)
2. Maps each selected option to its internal scoring weight (stored in `question_options.internal_id`)
3. Aggregates a **section score** (0–100 scale) for each of A–G
4. Derives **trait scores** by combining weighted section scores (e.g. analytical, creative, interpersonal)
5. Computes an **AI Readiness score** from a subset of trait scores
6. Ranks **career matches** from a lookup table of career-to-trait affinity weights

### Resume support

Answer progress is saved to `assessment_progress.answers` on every `POST /assessment/answer`. If a student returns mid-assessment, the frontend detects `completed = false` and `current_question_index > 0`, then presents a **Resume / Start fresh** choice.

---

## 9. AI Integration

### Purpose

After scoring, the backend sends a structured prompt to an LLM to generate the **AI advisor summary** shown in the student results.

### Prompt structure (approximate)

```
System: You are a career advisor helping a student understand their assessment results.
        Write in plain, encouraging language. Limit response to 3–4 paragraphs.

User:   Student name: {name}
        Section scores: A={score}, B={score}, ..., G={score}
        Top traits: {trait1}, {trait2}, {trait3}
        Top career matches: {career1}, {career2}
        AI Readiness: {score}/100

        Write a personal advisory summary for this student.
```

### Provider

The AI provider (OpenAI GPT-4 or Anthropic Claude) is configured via environment variable (`AI_PROVIDER` / `OPENAI_API_KEY` / `ANTHROPIC_API_KEY`). The system status page checks reachability of the AI API endpoint.

### Latency

AI generation is the longest step — up to ~60 seconds on the first request. The frontend shows an "analysing…" loading screen during this window.

---

## 10. PDF Generation

- Triggered by admin via `GET /admin/users/:id/pdf`
- The backend renders the student's results page as HTML, then converts to PDF using **Puppeteer** (headless Chrome) or a comparable library
- The PDF is streamed back as `Content-Type: application/pdf` with a `Content-Disposition: attachment` header
- PDFs are **not stored** on the server; they are generated on demand

---

## 11. Frontend Architecture

### Routing (Next.js pages)

| Route | Role | Description |
|---|---|---|
| `/` | Any | Redirects to assessment or results if signed in |
| `/login` | Any | Role toggle (Student / Admin) + login form |
| `/assessment` | Student | Question-by-question assessment view |
| `/results` | Student | Personal results dashboard |
| `/admin` | Admin | Dashboard overview |
| `/admin/users` | Admin | Manage student accounts |
| `/admin/questions` | Admin | Question bank editor |
| `/admin/users/[id]` | Admin | Individual student result view |
| `/admin/status` | Admin | System health page |

### Auth guard

A shared `AuthGuard` component wraps protected routes. It reads the JWT from `localStorage` (or cookie), decodes the role, and redirects to `/login` if the token is absent or expired.

### Progress bar

The assessment progress bar (`current_question_index / total_questions * 100`) is rendered client-side and updated after each answered question.

---

## 12. Deployment

| Component | Platform | Notes |
|---|---|---|
| Frontend | **Vercel** | Auto-deploys from `main` branch; env vars set in Vercel dashboard |
| Backend | Vercel Serverless Functions **or** a separate Node/Bun host | Check `vercel.json` or `backend/README.md` for the exact config |
| Database | Hosted PostgreSQL (Supabase / Railway / Neon) | Connection string via env var |
| AI API | External (OpenAI / Anthropic) | API key via env var |

---

## 13. Environment Variables

### Backend

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret used to sign and verify tokens |
| `AI_PROVIDER` | `openai` or `anthropic` |
| `OPENAI_API_KEY` | Required if `AI_PROVIDER=openai` |
| `ANTHROPIC_API_KEY` | Required if `AI_PROVIDER=anthropic` |
| `PORT` | Server port (default: 3001) |

### Frontend

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API |

> Exact variable names may differ — check `backend/.env.example` and `frontend/.env.example` in the repo.

---

## 14. Local Development Setup

### Prerequisites

- [Bun](https://bun.sh) v1.0+
- PostgreSQL database (local or hosted)
- API key for chosen AI provider

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/stepsguidance-debug/steps-abroad.git
cd steps-abroad

# 2. Install dependencies (from root, or per folder)
bun install

# 3. Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edit both .env files with your DB URL, JWT secret, and AI key

# 4. Run database migrations
cd backend
bun run migrate     # or: bun run db:push (Prisma) / bun run drizzle-kit push

# 5. Start backend
bun run dev         # runs on http://localhost:3001

# 6. Start frontend (new terminal)
cd ../frontend
bun run dev         # runs on http://localhost:3000
```

---

## 15. Known Constraints & Design Decisions

| Decision | Rationale |
|---|---|
| **Gmail-only student emails** | Simplifies identity verification; reduces disposable account abuse |
| **One attempt per student** | Prevents students from gaming scores by retaking; admin can reset manually outside the app |
| **New questions appended to section end** | Preserves A→G section ordering without re-indexing all questions |
| **On-demand PDF generation** | Avoids storing large binary files; acceptable given low PDF request frequency |
| **AI generation on submit (not async)** | Simpler architecture; the ~60s wait is communicated to the user via the "analysing…" screen |
| **Bun as runtime** | Faster install and startup than npm/Node for TypeScript-heavy monorepos |

---

*For end-user instructions, see the root `README.md`.  
For setup and deployment details, see `frontend/README.md` and `backend/README.md`.*
