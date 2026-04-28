# Steps Guidance — External Backend Plan

You chose to keep your own **Node/Express + MongoDB Atlas + Gemini** backend. Lovable's sandbox cannot run that server, so the split is:

- **Lovable builds:** the entire React frontend (all pages, components, state, routing, API client) + a complete `/server` reference codebase you can copy out and deploy.
- **You deploy:** the `/server` code to Render / Railway / Fly / your own VPS, with your `.env` (the MongoDB URI you provided + a `GEMINI_API_KEY` + a `JWT_SECRET`).
- **Connect:** frontend reads `VITE_API_BASE_URL` and calls your hosted server.

> Until your server is live, the frontend will run against built-in **mock data** so every screen is visible and clickable. Flip one env var to switch to the real API.

## What I'll build

### 1. Frontend (runs in Lovable preview now)

Pages, all themed navy + gold:
- `/login` — already built; add Admin/Student auth submit + redirect.
- `/admin` — Overview: 4 stat cards (Total / Answered / Pending / Avg AI Readiness) + student grid with gold-circle avatar, status badge, readiness score. Click a card → student result.
- `/admin/users` — Manage Users table + "Add Student" modal (name/email/password) + delete confirm.
- `/admin/questions` — Question Bank, 7 accordions A–G with count badges, read-only question cards.
- `/admin/results/:userId` — full result dashboard for any student.
- `/assessment` — Student questionnaire: gold progress bar, section badge, MCQ / forced-choice / 1–5 scale renderers, "Analysing your profile with AI…" loader on submit.
- `/results` — Student's own dashboard: AI Readiness hero badge (green/amber/red), 4 trait cards, Recharts donut, section scores table with bars + fit pills, Primary (gold border) + Secondary (silver border) career cards with degrees + job roles + AI risk pills (🟢🟡🔴 + tooltip advice), contradiction flag cards (red left border), italic gold-bordered AI summary card.

Plus:
- `AuthContext` (JWT in `localStorage`), `ProtectedRoute` with role check.
- `apiClient.ts` — single fetch wrapper using `VITE_API_BASE_URL`; toggles to mock data when unset.
- Realistic mock fixtures: 1 admin, 6 students with varied statuses + 2 fully-generated results.
- Toasts for 401 / 429 / 402 / 500.

### 2. Reference `/server` codebase (deploy yourself)

I'll write a complete, production-shaped Express app under `/server` in the project tree. It won't run in Lovable, but you can `cp -r server` to your own repo and deploy.

Structure:
```text
server/
  index.js                 Express app + CORS + JWT middleware
  .env.example             MONGODB_URI, JWT_SECRET, GEMINI_API_KEY, PORT
  models/
    User.js                name, email, passwordHash, role, status
    Question.js            section, sectionTitle, text, type, options, order
    Response.js            userId, answers[{questionId, selectedOption}], submittedAt
    Result.js              traitScores, behaviourProfile, aiReadinessIndex,
                           contradictionFlags, sectionScores, careerFit, aiSuggestionSummary
  middleware/
    auth.js                verifyJWT, requireAdmin
  routes/
    auth.js                POST /api/auth/login
    admin.js               GET/POST/DELETE /api/admin/users, POST /api/admin/questions
    questions.js           GET /api/questions
    responses.js           POST /api/responses/submit
    results.js             GET /api/results/:userId, POST /api/results/generate/:userId
  services/
    gemini.js              analyzeProfile() → Gemini 2.5 Pro structured output
                           checkAiRisk(jobRole) → Gemini 2.5 Flash w/ search grounding
                           parallel Promise.all per role
  scripts/
    seed.js                seeds admin (admin@stepsguidance.com / Admin123!) +
                           50-question bank across sections A–G
  README.md                exact deploy steps for Render + how to set
                           VITE_API_BASE_URL in Lovable
```

Scoring rubric in `services/gemini.js`:
- Weights: 40% behavioural / 30% performance / 20% consistency / 10% self-perception
- Traits: Analytical / Creative / Applied / Social as %
- Section scores 0–100 with Strong ≥75 / Moderate 50–74 / Weak <50
- Career mapping: Primary ≥80, Secondary 60–80, Rejected <40 — each with UG, PG (capped at Masters), 3 job roles
- Contradiction detection across answers
- AI Readiness Index 0–100

### 3. Seed credentials

`scripts/seed.js` creates:
- **Admin** — `admin@stepsguidance.com` / `Admin123!`
- **50 questions** across sections A–G aligned with the rubric (you can replace the JSON anytime)

## How you'll connect it

1. I commit the `/server` folder + a `server/README.md` with exact Render deploy steps.
2. You deploy it, get a public URL like `https://steps-guidance-api.onrender.com`.
3. In Lovable: **Project Settings → Environment Variables** add `VITE_API_BASE_URL=https://your-url`. Frontend immediately stops using mocks.
4. Run `node scripts/seed.js` once on your server to load the admin + questions.

## Build order

1. API client + AuthContext + mock fixtures + protected routes.
2. Admin shell (sidebar) + Overview + Manage Users + Question Bank.
3. Student questionnaire + submit flow + analysing loader.
4. Result dashboard (donut, sections, career cards, risk pills, contradictions, AI summary).
5. Wire Login form to API client.
6. Write full `/server` reference codebase + `seed.js` + README.
7. Polish: empty states, loading skeletons, 401/429/402 toasts.

## Things I'll decide unless you object

- **50-question content** — generated coherent set across A–G. Send your exact list anytime to replace.
- **Scale rendering** — 1–5 radio row.
- **Mock mode toggle** — automatic when `VITE_API_BASE_URL` is empty; no manual switch needed.
- **CORS** — server allows the Lovable preview origin + your future custom domain (configurable via `CLIENT_ORIGIN` env var).

Approve and I'll start with the frontend so you can see every screen end-to-end with mock data, then drop in the `/server` codebase for you to deploy.