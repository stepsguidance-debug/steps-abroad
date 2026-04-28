# Steps Guidance — Career Guidance Platform

A premium, dark-navy + gold themed platform for students planning higher education abroad. Admins manage students and a 50-question diagnostic; students take the assessment; Gemini analyzes responses and produces a full career-fit report with AI-risk flags per job role.

## Infrastructure

- **Frontend:** React + Vite + Tailwind + React Router (as specified)
- **Backend:** Lovable Cloud (Supabase Postgres + Edge Functions + Auth) replacing Express + MongoDB Atlas. Same routes, same schema shape, same behavior — just on infra that runs in this environment.
- **AI:** Lovable AI Gateway using `google/gemini-2.5-pro` for analysis and `google/gemini-2.5-flash` for per-job AI-risk lookups. Key auto-provisioned — your supplied Gemini key isn't needed.

If you ever want to swap to your own Express + MongoDB Atlas backend, the frontend talks to a thin API layer that's easy to repoint.

## Data Model (Postgres tables, mirroring your collections)

- `profiles` — id, name, email, status (`pending` | `answered`), created_at
- `user_roles` — user_id, role (`admin` | `student`) — separate table for security
- `questions` — id, section (A–G), section_title, question_text, type (`mcq` | `forced-choice` | `scale`), options (jsonb array), order
- `responses` — id, user_id, answers (jsonb: `[{questionId, selectedOption}]`), submitted_at
- `results` — id, user_id, trait_scores (jsonb), behaviour_profile (jsonb), ai_readiness_index, contradiction_flags (jsonb), section_scores (jsonb), career_fit (jsonb: primary/secondary/rejected), ai_suggestion_summary, generated_at

RLS: students read only their own responses/results; admins read/write everything.

## Backend (Edge Functions — equivalent to your Express routes)

| Your route | Implementation |
|---|---|
| `POST /api/auth/login` | Supabase Auth (email/password), returns JWT automatically |
| `GET /api/admin/users` | Direct query with admin RLS |
| `POST /api/admin/users` | `admin-create-user` edge function (creates auth user + profile + role) |
| `DELETE /api/admin/users/:id` | `admin-delete-user` edge function (cascades responses + results) |
| `GET /api/questions` | Direct query |
| `POST /api/admin/questions` | Direct upsert with admin RLS |
| `POST /api/responses/submit` | Direct insert + sets profile.status=`answered` |
| `GET /api/results/:userId` | Direct query |
| `POST /api/results/generate/:userId` | `generate-result` edge function (calls Gemini) |

## Gemini Analysis Pipeline (`generate-result` edge function)

1. Load student's answers + question texts.
2. Call **Gemini 2.5 Pro** via Lovable AI Gateway with structured tool-calling output enforcing this scoring rubric:
   - Weights: 40% behavioural / 30% performance / 20% consistency / 10% self-perception
   - Detect contradictions across answers → `contradictionFlags`
   - Score 4 traits (Analytical, Creative, Applied, Social) as %
   - Score each section A–G (0–100) with fit label (Strong ≥75, Moderate 50–74, Weak <50)
   - AI Readiness Index (0–100)
   - Behaviour profile: ambiguity / discipline / riskAppetite (High/Med/Low)
   - Career mapping: Primary (≥80%), Secondary (60–80%), Rejected (<40%) — each with UG degrees, PG degrees (capped at Masters), and 3 job roles
   - One-paragraph AI summary
3. For each job role in primary + secondary, call **Gemini 2.5 Flash with Google Search Grounding** → returns `safe` | `at-risk` | `high-risk` + one-line advice. Run in parallel with `Promise.all`.
4. Save full result row; return to client.

Rate-limit (429) and credits (402) errors are surfaced as toasts.

## Frontend Pages

**Design system** in `index.css` + `tailwind.config.ts`: HSL tokens for navy `#0B1437`, surface `#0F2057`, gold `#F5A623`, text white / `#A0AEC0`. Inter font. Reusable `glass-card` utility (rounded-2xl, backdrop-blur, semi-transparent). Gold-filled primary + navy-outlined secondary button variants. Subtle world-map SVG watermark + graduation-cap motifs as decorative components.

1. **Login** (`/login`) — full-screen navy, centered glass card, logo + tagline, world-landmarks SVG silhouette footer, Admin/Student pill toggle (gold active), email + password (gold focus ring), gold login button.
2. **Admin layout** — dark navy sidebar with gold logo, nav items (Overview, Manage Users, Question Bank), active item has gold left border + gold text. Uses shadcn sidebar.
3. **Admin Overview** (`/admin`) — 4 stat cards (Total Students, Answered, Pending, Avg AI Readiness) + student grid (initials avatar in gold circle, name, email, status badge, readiness score). Click → student result page.
4. **Manage Users** (`/admin/users`) — table (Name, Email, Created, Status, Delete), gold "Add Student" button opens modal (name/email/password), delete confirm dialog cascades data.
5. **Question Bank** (`/admin/questions`) — 7 accordion sections A–G with count badges, expand to show read-only question cards. Seeded with the 50-question diagnostic across all 7 sections.
6. **Student Questionnaire** (`/assessment`) — gold progress bar (Section X of 7), gold-circle section letter badge + title, MCQ as radios, forced-choice as two large option cards, scale as slider/radio row. Selected = gold border + light gold bg. Next/Submit. On submit: "Analysing your profile with AI…" loader → redirects to results.
7. **Student Result Dashboard** (`/results` for student, `/admin/results/:userId` for admin) — hero with name + color-coded AI Readiness badge (green 60+, amber 30–60, red <30); 4 trait stat cards; Recharts donut (gold/navy/teal/coral); section scores table with score bars + fit badges; Primary career card (gold top border) + Secondary (silver top border) with degrees and job roles; AI risk pills (🟢🟡🔴) with hover advice tooltip; contradiction flags as red-left-border cards; gold-bordered italic AI summary card at bottom.

## Build Order

1. Enable Lovable Cloud, create tables + RLS + roles infrastructure, seed admin user + 50 questions.
2. Design system tokens + reusable components (glass card, gold button, section badge, risk pill, world-map watermark).
3. Login + auth context + role-based routing.
4. Admin shell + Overview + Manage Users + Question Bank.
5. Student questionnaire flow.
6. `generate-result` edge function with Gemini Pro + parallel Flash grounding calls.
7. Result dashboard with Recharts donut + all sections.
8. Polish, loading states, error toasts for 429/402.

## Open Items I'll Decide Sensibly Unless You Object

- **Seed admin credentials:** I'll create `admin@stepsguidance.com` / `Admin123!` and surface them on first run. Change after login.
- **50-question content:** Your brief references the diagnostic but didn't paste it. I'll generate a coherent 50-question set across sections A–G aligned with the trait/behaviour rubric. Send the exact list anytime to replace the seed.
- **Scale-type rendering:** 1–5 radio row (consistent with the academic feel).
