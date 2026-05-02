# Steps Guidance — Backend Guide

This folder is the **server** (API) for Steps Guidance. The **frontend** (website) sends requests here: login, load questions, save answers, generate results, admin tasks, etc.

Think of it as the **brain + memory**; the website is the **face**.

---

## 1. What this server does (in plain words)

| Job | Simple explanation |
|-----|---------------------|
| **Accounts** | Creates admin and student logins; checks passwords; issues a **token** (JWT) so the browser stays signed in securely. |
| **Question bank** | Stores all assessment questions (text, section A–G, type, choices). Adds new ones in the **right place** inside each section. |
| **Answers** | Saves student progress (**draft**) and final **submit**. |
| **Results** | After submit, builds a structured **result** using **Google Gemini** (AI) from the student’s answers. |
| **Admin APIs** | List/create/delete students, health checks. |

Everything sensitive (password hashing, AI keys, database) stays **here**, not in the frontend.

---

## 2. Tech stack (short)

- **Node.js** + **Express** — listens for HTTP requests.
- **MongoDB** via **Mongoose** — stores admins, students, questions, responses, AI results.
- **JWT** — signed login tokens.
- **bcrypt** — password hashing.
- **Google Gemini** — generates scored results and summaries.

Again, you only need these names when talking to engineers.

---

## 3. How data is organised (two MongoDB databases)

One **`MONGODB_URI`** connects to Mongo, but data is split into **two database names** (see `DB_ADMIN` and `DB_STUDENTS` in `.env`):

| Database (env name) | Example name | Main collections |
|---------------------|--------------|------------------|
| **Admin DB** | `stepsguidance_admin` (`DB_ADMIN`) | Questions, admin accounts, **student login accounts** |
| **Students / results DB** | `stepsguidance_students` (`DB_STUDENTS`) | Saved answers (**responses**) and generated **results** |

**Plain English:** Accounts and exam content live in the “admin” database; submitted answers and AI results live in the “students” database.

---

## 4. Folder map

| Path | Role |
|------|------|
| `index.js` | Starts Express, CORS, routes, database bootstrap. |
| `routes/` | URL groups: `auth`, `admin`, `questions`, `responses`, `results`, `health`. |
| `services/` | Business logic: questions (create/order/sanitize), students delete, **result generation** (Gemini). |
| `models/` | Mongo schemas (shape of each collection). |
| `middleware/` | JWT check, “admin only” guard. |
| `data/` | Seed question text and section titles (`questionBank.js`). |
| `scripts/seed.js` | Fills database with starter questions (**destructive reset** — use only when you intend to). |
| `utils/` | Small helpers (e.g. Gmail format checks). |
| `.env.example` | Lists required **environment variables** (copy to `.env`). |

---

## 5. Main API routes (conceptual)

| Area | Typical paths | Who can call |
|------|----------------|--------------|
| Health | `/api/health`, `/api/health/full` | Public / admin details as configured |
| Auth | `/api/auth/login` | Anyone with credentials |
| Questions | `/api/questions` GET (student + admin), POST/DELETE admin | JWT; writes need admin |
| Responses | Draft PATCH/GET, submit POST | **Student** JWT |
| Results | Fetch result, queue status | Student self + admin views |
| Admin | `/api/admin/students` | Admin JWT |

Exact paths live under `routes/*.js`.

---

## 6. Question order (sections A → G)

When an admin **creates** a question:

- It is inserted **after the last question of that same section** (e.g. new **A** after existing **A**s).
- If that section did not exist yet, it slots into the correct **A–G order** compared to other sections—not always at the very end of the whole quiz.

Sorting for students uses the numeric **`order`** field (plus stable tie‑break).

---

## 7. Results & AI

After a successful submit:

1. Answers are stored.
2. A service builds a readable text blob for Gemini.
3. Gemini returns structured JSON (traits, readiness, careers, summary).
4. That is validated/clamped and saved as a **Result** document linked to the student.

**Important:** You need **`GEMINI_API_KEY`** (and sensible model names in `.env`) or result generation fails.

---

## 8. How to run locally (developers)

### Requirements

- **Node.js** (LTS)
- **MongoDB** running and reachable (`MONGODB_URI`)

### Setup

From this `backend/` folder:

```bash
npm install
```

Copy `.env.example` → `.env` and fill **Mongo URI**, **JWT_SECRET**, **Gemini key**, **PORT**, and **FRONTEND_URL** / **CLIENT_ORIGIN** for CORS.

```bash
npm run dev
```

Uses **nodemon** (restarts on file changes).

Production-style:

```bash
npm start
```

### One-time seed (optional)

```bash
npm run seed
```

**Warning:** The seed script is written to **reset** relevant collections for development. Read `scripts/seed.js` before running on anything important.

---

## 9. Environment variables (`backend/.env`)

Use `.env.example` as the checklist. High level:

| Topic | Examples | Plain meaning |
|-------|----------|----------------|
| Database | `MONGODB_URI`, `DB_ADMIN`, `DB_STUDENTS` | Where Mongo lives and database names |
| Security | `JWT_SECRET`, `JWT_EXPIRES_IN` | Sign login tokens; change secret in production |
| Server | `PORT`, `NODE_ENV` | Which port listens; dev vs production behaviour |
| CORS | `FRONTEND_URL`, `CLIENT_ORIGIN` | Which website origins may call the API from a browser |
| AI | `GEMINI_API_KEY`, `GEMINI_MODEL_*`, queue settings | Powers result generation |

Never commit real `.env` files to public git.

---

## 10. Common issues (plain troubleshooting)

| Symptom | What to check |
|---------|----------------|
| “CORS blocked” | `FRONTEND_URL` / `CLIENT_ORIGIN` includes your exact site URL (scheme + host + port). |
| Login works on Postman but not browser | Same CORS issue, or wrong API URL on the frontend. |
| Results never finish | `GEMINI_API_KEY`, model names, network; server logs. |
| Students don’t see new questions | Frontend not using mocks; student refreshes assessment; backend actually saved the question. |
| Delete student/question errors (old builds) | API returns **204** with no JSON body — frontend must not call `.json()` on empty responses (already fixed in current `apiClient`). |

---

## 11. Where to read next

- **Frontend pages & UX** → `frontend/README.md`
- **Exact env placeholders** → `backend/.env.example` and `frontend/.env.example`

---

*Written for organisers, juniors, and anyone onboarding. For line-by-line behaviour, inspect `routes/` and `services/` in this folder.*
