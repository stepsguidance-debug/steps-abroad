## Plan — 4 Changes

### Change 1: Save & Resume Assessment

**Frontend (`src/pages/Assessment.tsx`)**
- On every answer change / `next()`, write to `localStorage` under `assessment_progress_${user._id}`:
  ```json
  { userId, currentSection, currentQuestionIndex, answers: { [qId]: { selectedValue, selectedLabel } }, savedAt }
  ```
- On mount: check localStorage. If exists and `savedAt` < 7 days old → render a top banner:
  > "You have a saved attempt from [date]. Would you like to continue where you left off?" `[Continue]` `[Start fresh]`
- Continue → restore `idx`, `answers`, `customAnswers`. Start fresh → delete entry.
- If localStorage missing, fetch `GET /api/responses/draft` and hydrate from server draft.
- On every `next()` also call `PATCH /api/responses/draft` (debounced) with current partial answers.
- On successful submit → delete localStorage entry.

**Backend**
- `server/models/Response.js`: add `isDraft: { type: Boolean, default: false }` and make `answers` allow partial saves (loosen validation when draft).
- `server/routes/responses.js`:
  - `PATCH /draft` — upsert `{ userId, isDraft: true, answers }`.
  - `GET /draft` — return current draft for the logged-in student.
  - Update existing `POST /submit`: when finalizing, set `isDraft: false`; if a draft exists for the user, overwrite it instead of 409-ing.
- `apiClient.ts`: add `getDraft()`, `saveDraft(answers)`.

---

### Change 2: Student Name + Avatar in Header

- New shared component `src/components/UserBadge.tsx`:
  - Avatar circle (gold initials on dark navy bg). Initials = first letter of first + last name; if single name → first 2 letters.
  - Renders `name` + `[Logout]` button.
- Use in:
  - `src/pages/Assessment.tsx` header (replaces "Save & exit" link area).
  - `src/pages/Results.tsx` header.
  - `src/pages/admin/AdminLayout.tsx` top header — show "Admin" with shield icon + initials.
- Pulls `user.name` from `useAuth()` (already in context). No backend change needed.

---

### Change 3: Dark / Light Theme Toggle

- `index.html`: add inline pre-React script that reads `localStorage.steps_theme` (default `dark`) and sets `data-theme` on `<html>`.
- `src/index.css`: convert the `:root` block into `[data-theme="dark"] { ... }` (keeping existing HSL tokens) and add a parallel `[data-theme="light"] { ... }` block with light navy/cream tokens that map to the same token names (`--background`, `--foreground`, `--card`, `--border`, `--primary`, etc.) so all existing Tailwind classes auto-switch.
- New `src/hooks/useTheme.ts`: read/write `steps_theme`, toggle `data-theme` attribute.
- New `src/components/ThemeToggle.tsx`: sun/moon button (lucide `Sun`/`Moon`), placed inside `UserBadge` (so it appears next to name on every page).

---

### Change 4: Admin System Status + Gemini Rate-Limit Queue

**New admin page** `src/pages/admin/SystemStatus.tsx` at route `/admin/system`:
- Sidebar nav entry with pulsing dot (green = all healthy, red = any failing).
- On load, calls `GET /api/health/full` and renders rows for: Mongo Admin DB, Mongo Students DB, Gemini 2.5 Pro, Gemini 2.5 Flash (search grounding), JWT Auth, Backend API. Each row shows status, response time ms, extra detail (model name / token expiry / uptime).
- Static "Gemini API Usage Limits (Free Tier)" panel listing the RPM/RPD/TPM table from the spec + the explanatory note about 1 Pro + 6 Flash per submission.

**Backend new endpoints**
- `GET /api/health` → `{ status: "ok", uptime: process.uptime() }` (public).
- `GET /api/health/full` (admin JWT) → runs all 6 checks in parallel with timing:
  - Admin DB: `AdminAccount.countDocuments()`
  - Students DB: `Result.countDocuments()`
  - Gemini Pro: minimal `"Reply with the word OK only"` prompt
  - Gemini Flash with `tools: [{ googleSearch: {} }]`
  - JWT: decode caller's token, return expiry
  - API: returns own uptime
- `GET /api/results/queue-status` → `{ position, isProcessing }` for the calling user.

**Queue in `server/services/resultService.js`**
- Add the in-memory FIFO queue exactly as specified: `queuedGenerate(userId)`, 35s gap between jobs, single concurrency.
- Track per-user position so `queue-status` can answer.
- Update `server/routes/responses.js` and `server/routes/results.js` to call `queuedGenerate` instead of `generateResultForUser` directly.

**Frontend wait UX (`Assessment.tsx` submit overlay)**
- Replace current overlay with: "Analysing your profile with AI… This may take up to 60 seconds." + spinner.
- After submit, poll `GET /api/results/queue-status` every 5s; if `position > 0` show "You are number X in the queue. Please wait…". When result returns from submit promise, navigate to `/results`.

---

### Files to be created
- `src/components/UserBadge.tsx`, `src/components/ThemeToggle.tsx`
- `src/hooks/useTheme.ts`
- `src/pages/admin/SystemStatus.tsx`
- `server/routes/health.js`

### Files to be edited
- `src/App.tsx` (add `/admin/system` route)
- `src/pages/Assessment.tsx`, `src/pages/Results.tsx`, `src/pages/admin/AdminLayout.tsx`
- `src/lib/apiClient.ts`, `src/lib/types.ts`
- `src/index.css`, `index.html`
- `server/index.js` (mount health route)
- `server/models/Response.js` (add `isDraft`)
- `server/routes/responses.js`, `server/routes/results.js`
- `server/services/resultService.js` (queue)

### Notes / assumptions
- Mock mode (`USING_MOCKS`) will simulate draft save/load and queue-status with no-op + `position: 0` so the preview keeps working without the backend.
- Light theme will reuse existing token names so no component-level color rewrites are required; only `index.css` changes.
- Queue is in-process memory only — restarting the Node server clears it (acceptable for current scope).
