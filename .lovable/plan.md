# Plan — Fix the 3 bugs

## Bug 1 — Wrong choices showing on every question

### What I found in the code
`src/pages/Assessment.tsx` already renders choices from `q.choices` (line 298), where `q = questions[idx]`. There is no shared/cached choice state in the component itself, so the React-side render is technically correct.

However, two real risks remain that match the screenshots:

1. **No `key` on the question card** — when `idx` changes, React reuses the same DOM nodes. If anything inside ever takes `defaultValue`/uncontrolled inputs (it does for the custom-answer `<input>`), stale values can persist between questions.
2. **Custom-answer input is keyed only by `choice.value`**, not by question — when two different questions share an option `value` (e.g. multiple Section G options reuse `"pre_ug"` — see `server/data/questionBank.js` lines 432-434), the same React element survives the question change and looks "stuck".
3. **`apiClient.getQuestions()` returns the raw API payload** with no shape validation. If the backend ever returns the wrong shape (e.g. an error envelope), the array index lookup silently returns the wrong object.

### What I'll change
- **`src/pages/Assessment.tsx`**
  - Wrap the question card div with `key={q._id}` so React fully remounts it whenever the question changes — this guarantees every piece of internal state (including the custom-answer input) is reset.
  - Add a dedicated `useEffect([q?._id])` that clears any transient per-question UI state.
  - Render the choices list with `key={`${q._id}-${choice.value}`}` instead of just `choice.value` so duplicate values across questions cannot collide.
  - Add a runtime guard: if `apiClient.getQuestions()` returns a non-array or an item without a `choices` array, log to console and show an "Unable to load questions" screen instead of rendering garbage.
- **No backend changes** — `server/data/questionBank.js` is correct, each question has its own `choices` array, and `server/routes/questions.js` returns them via `Question.find().lean()` unmodified.

## Bug 2 — Make sure questions only come from MongoDB

### What I found
- `src/lib/mocks.ts` exports `MOCK_QUESTIONS`, but it is only used in `apiClient.getQuestions()` when `USING_MOCKS === true` (i.e. `VITE_USE_MOCKS=true`).
- No other file in `src/` defines hardcoded questions or imports `MOCK_QUESTIONS` outside of `apiClient.ts`.
- `MOCK_QUESTIONS` does **not** contain the "10th Grade / O-Level / HLCS" choices, so it is not the source of the bleed-over seen in the screenshots.

### What I'll change
- **`src/lib/apiClient.ts`** — add an explicit log when `USING_MOCKS` is true at module load, so it's obvious in the console whether the deployed Vercel build is silently in mock mode.
- **`src/lib/mocks.ts`** — leave the file but add a top-of-file comment that it is dev-only; export a named guard (`assertNotInProd`) that throws if imported at runtime when `VITE_USE_MOCKS !== "true"` and `import.meta.env.PROD === true`.
- **`vercel.json` / build** — verify `VITE_USE_MOCKS` is **not** set on the Vercel deployment (this is documentation only — I'll add a note to `RUN_LOCALLY.md`).

## Bug 3 — `/admin/users` page is blank

### What I found
- Frontend (`src/pages/admin/ManageUsers.tsx`) calls `apiClient.getStudents()` which `GET /api/admin/students` with the `Authorization: Bearer <token>` header (handled in `apiClient.request`). The frontend expects a **plain array** of students.
- Backend (`server/routes/admin.js`) returns a **plain array** as well — shapes match. The route is mounted under `/api/admin` and protected by `verifyJWT, requireAdmin`.
- Most likely real causes for an empty page on the deployed site:
  1. The Vercel build has no Node backend at all → request 404s → frontend silently shows an empty list (the current code has no error UI).
  2. `student_accounts` collection is empty in the connected Mongo — the seed only seeds the admin account, not students.
  3. JWT middleware rejects (e.g. expired token) → the existing `request()` throws but `ManageUsers` doesn't surface the error.

### What I'll change
- **`src/pages/admin/ManageUsers.tsx`**
  - Wrap `refresh()` in try/catch and store an error string in state.
  - When the list is empty (and no error), show: *"No students yet. Create one using the Add Student button."*
  - When the request fails, show the error message and a Retry button (so a 401/404/500 is no longer silent).
- **`src/lib/apiClient.ts`** — make `getStudents()` tolerate both `Array` and `{ students: Array }` response shapes (defensive, in case the backend is later changed).
- **`server/routes/admin.js`** — add a one-line `console.log("[admin] GET /students hit by", req.user?.id)` at the top of the GET handler so deploy logs make it obvious whether the route is reached.
- **`server/scripts/seed.js`** — add an optional `--with-demo-students` flag that seeds 3 demo students (so a freshly seeded DB doesn't look broken). Default seed behaviour unchanged.
- Confirm in `server/db.js` that `StudentAccount` (in `routes/admin.js`) reads from `stepsguidance_admin.student_accounts` — **already correct** (model uses `adminConnection`).

## Files changing

**Frontend**
- `src/pages/Assessment.tsx` — `key={q._id}`, choice key namespacing, payload guard, reset effect
- `src/pages/admin/ManageUsers.tsx` — error state, empty state, retry
- `src/lib/apiClient.ts` — mock-mode console banner, tolerant `getStudents` parsing
- `src/lib/mocks.ts` — prod-import guard + dev-only comment

**Backend**
- `server/routes/admin.js` — debug log on GET /students
- `server/scripts/seed.js` — optional `--with-demo-students` flag

**Docs**
- `RUN_LOCALLY.md` — note about `VITE_USE_MOCKS` env var on Vercel

## Notes
- I will **not** change `server/data/questionBank.js` — it is correct.
- I will **not** restructure the API response shape; only add tolerance on the client.
- The `key={q._id}` fix is the primary fix for Bug 1; everything else is hardening so the same class of bug cannot reappear.
