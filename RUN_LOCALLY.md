# Run Steps Guidance locally

The project has two parts:

```
.
├── src/        ← React frontend (this repo's root)
└── server/     ← Express + MongoDB + Gemini backend
```

You can run the frontend by itself (it falls back to **mock data** so all screens work),
or run both together against your real MongoDB + Gemini.

---

## 1. Frontend only (mock mode — fastest)

```bash
git clone <your-repo-url>
cd <repo>
npm install
npm run dev          # http://localhost:8080
```

Login screen → click **"Use demo admin credentials"** or **"Use demo student credentials"**.
Demo admin: `admin@stepsguidance.com` / `Admin123!`
Demo student: any email + any password.

Everything (admin overview, manage users, question bank, assessment, results dashboard)
is wired up against in-memory mock data — perfect for previewing the UI.

---

## 2. Frontend + Backend (real data)

### a. Start the backend

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env`:

```
PORT=5000
CLIENT_ORIGIN=http://localhost:8080
MONGODB_URI=<your real MongoDB Atlas connection string>
JWT_SECRET=<any long random string, e.g. `openssl rand -hex 32`>
GEMINI_API_KEY=<your real Gemini API key>
```

Seed the database **once** (creates the admin + 50 questions):

```bash
npm run seed
```

Start the API:

```bash
npm run dev          # http://localhost:5000
```

### b. Point the frontend at it

In the **repo root** (not in `server/`), create `.env`:

```
VITE_API_BASE_URL=http://localhost:5000
```

Then in another terminal:

```bash
npm install          # if you haven't already
npm run dev          # http://localhost:8080
```

Open http://localhost:8080/login and sign in with:

- Admin: `admin@stepsguidance.com` / `Admin123!`
- Students: created from the **Manage Users** page in the admin console.

When a student submits the assessment, the backend calls Gemini to score the
profile and analyse AI risk for each suggested career, then stores the result
in MongoDB.

---

## Troubleshooting

- **"Mongo connection failed"** — double-check `MONGODB_URI` and that your IP is
  allowed in Atlas (Network Access → Add IP).
- **CORS error in browser** — set `CLIENT_ORIGIN` in `server/.env` to the exact
  origin your frontend is served from (no trailing slash).
- **Frontend still shows mock data** — make sure `.env` exists at the repo root
  (not inside `src/`) and you restarted `npm run dev` after creating it.
- **Gemini errors** — verify the API key has the Generative Language API enabled
  in Google AI Studio.

## Deploying to Vercel — important env-var note

Vercel only deploys the **frontend** (the `server/` folder is not run there).
For the deployed site to talk to a real backend you must:

1. Host the Node backend separately (Render, Fly.io, Railway, your own VPS).
2. On the Vercel project, set:
   - `VITE_API_BASE_URL=https://your-backend-host` (no trailing slash)
   - **Make sure `VITE_USE_MOCKS` is NOT set** (or set it to `false`).
     If `VITE_USE_MOCKS=true` is configured on Vercel the deployed site will
     silently use fake data and admin/student lists will look broken.

You can confirm which mode the deployed build is in by opening the browser
console — mock mode prints a yellow `[apiClient] MOCK MODE ACTIVE` banner.

## Seeding demo students

By default the seed script only creates the admin account. To also create
3 demo students (password `demo123`):

```bash
cd server
node scripts/seed.js --with-demo-students
```
