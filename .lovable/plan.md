# Build the full Steps Guidance app + external `/server` backend

## What exists today
- Only `src/pages/Login.tsx` (UI shell, no submit logic)
- Navy + gold theme tokens in `src/index.css`
- No Admin pages, no Student questionnaire, no Results page, no `/server` folder, no API client, no auth context

## What I'll build

### 1. Frontend foundation
- `src/lib/apiClient.ts` — fetch wrapper using `import.meta.env.VITE_API_BASE_URL`. If unset, returns realistic **mock data** so every screen works in the Lovable preview without a backend.
- `src/context/AuthContext.tsx` — JWT in `localStorage`, `login()`, `logout()`, `user`, `role`.
- `src/components/ProtectedRoute.tsx` — redirects to `/login`, enforces `admin` vs `student` role.
- `src/lib/mocks.ts` — 1 admin, 6 students (varied statuses), 50 questions (sections A–G), 2 fully generated results.
- Routes added in `src/App.tsx`.

### 2. Login wired up
- `src/pages/Login.tsx` — submit calls `apiClient.login()`, stores JWT, redirects to `/admin` or `/assessment` based on role. Toast on error.

### 3. Admin area
- `src/pages/admin/AdminLayout.tsx` — sidebar (Overview / Manage Users / Question Bank / Logout), topbar with admin name.
- `src/pages/admin/Overview.tsx` — 4 stat cards (Total / Answered / Pending / Avg AI Readiness) + student grid (gold avatar, status badge, readiness score). Click → result.
- `src/pages/admin/ManageUsers.tsx` — table + "Add Student" modal (name/email/password) + delete confirm dialog.
- `src/pages/admin/QuestionBank.tsx` — 7 accordions A–G with count badges, read-only question cards.
- `src/pages/admin/StudentResult.tsx` — reuses the Result dashboard for any selected student.

### 4. Student area
- `src/pages/Assessment.tsx` — gold progress bar, section badge, MCQ / forced-choice / 1–5 scale renderers, prev/next, "Analysing your profile with AI…" overlay on submit, then redirect to `/results`.
- `src/pages/Results.tsx` — AI Readiness hero badge (green/amber/red), 4 trait cards, Recharts donut, section scores table with bars + Strong/Moderate/Weak pills, Primary (gold border) + Secondary (silver border) career cards with degrees, 3 job roles each, AI risk pills (🟢🟡🔴 + tooltip), red-bordered contradiction cards, italic gold-bordered AI summary.

### 5. `/server` reference backend (committed to repo, you deploy it)
```text
server/
  package.json
  .env.example         MONGODB_URI, JWT_SECRET, GEMINI_API_KEY, PORT, CLIENT_ORIGIN
  index.js             Express + CORS + JWT middleware
  models/
    User.js            name, email, passwordHash, role, status
    Question.js        section, sectionTitle, text, type, options, order
    Response.js        userId, answers[], submittedAt
    Result.js          traitScores, behaviourProfile, aiReadinessIndex,
                       contradictionFlags, sectionScores, careerFit, aiSummary
  middleware/auth.js   verifyJWT, requireAdmin
  routes/
    auth.js            POST /api/auth/login
    admin.js           GET/POST/DELETE /api/admin/users
    questions.js       GET /api/questions
    responses.js       POST /api/responses/submit  (triggers Gemini analysis)
    results.js         GET /api/results/:userId
  services/gemini.js   analyzeProfile() → Gemini 2.5 Pro structured output
                       checkAiRisk(role) → Gemini 2.5 Flash w/ search grounding
                       Promise.all over career roles
  scripts/seed.js      seeds admin@stepsguidance.com / Admin123! + 50 questions
  README.md            local + Render deploy steps
```

Scoring rubric in `services/gemini.js`: 40% behavioural / 30% performance / 20% consistency / 10% self-perception. Traits as %, section scores 0–100 (Strong ≥75 / Moderate 50–74 / Weak <50), career mapping (Primary ≥80, Secondary 60–80), contradiction detection, AI Readiness Index 0–100.

### 6. README updates — running locally
A new `RUN_LOCALLY.md` at the repo root with exact commands:

**Frontend (this repo):**
```bash
git clone <your-repo-url>
cd <repo>
npm install
# optional: create .env with VITE_API_BASE_URL=http://localhost:5000
npm run dev          # http://localhost:8080
```

**Backend (the /server folder):**
```bash
cd server
npm install
cp .env.example .env
# edit .env: MONGODB_URI=<your real Atlas URI>
#           GEMINI_API_KEY=<your real key>
#           JWT_SECRET=<any long random string>
#           CLIENT_ORIGIN=http://localhost:8080
node scripts/seed.js   # one time: creates admin + 50 questions
npm run dev            # nodemon on http://localhost:5000
```

Then log in at `http://localhost:8080/login` with `admin@stepsguidance.com` / `Admin123!`.

## Why you can't see admin/student now
Those pages have not been generated yet. After this plan is approved I'll create every file listed above so all screens are visible in the Lovable preview (using mock data), and the `/server` folder will be ready for you to copy out, plug your real Mongo URI + Gemini key into, and run locally or deploy.

## Assumptions (tell me if any are wrong)
- 50 questions: I generate a coherent default set across A–G. You can edit `server/scripts/seed.js` anytime.
- Scale questions render as 1–5 radio rows.
- Mock mode auto-toggles when `VITE_API_BASE_URL` is empty — no manual switch.
- Server uses Express + Mongoose + jsonwebtoken + bcryptjs + @google/generative-ai.

Approve and I'll build all of it in one pass.
