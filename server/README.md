# Steps Guidance — API server

Express + MongoDB + Gemini backend for the Steps Guidance frontend.

## Local setup

```bash
cd server
npm install
cp .env.example .env
# edit .env: set MONGODB_URI, JWT_SECRET, GEMINI_API_KEY
npm run seed     # one time: creates admin + 50 questions
npm run dev      # http://localhost:5000
```

Default admin (created by seed):
- email: `admin@stepsguidance.com`
- password: `Admin123!`

## Connect the frontend

In the **frontend** project root, create a `.env` file:

```
VITE_API_BASE_URL=http://localhost:5000
```

Restart `npm run dev`. The frontend stops using mocks and calls this server.

## Deploy to Render

1. Push this repo to GitHub.
2. Render → New → Web Service → pick the repo, root = `server`.
3. Build command: `npm install`. Start command: `npm start`.
4. Environment vars: copy everything from `.env.example` with your real values.
5. After deploy, set `VITE_API_BASE_URL` in your frontend host (or in Lovable project env vars) to the Render URL.

## Endpoints

| Method | Path                          | Auth         |
|--------|-------------------------------|--------------|
| POST   | /api/auth/login               | public       |
| GET    | /api/admin/users              | admin        |
| POST   | /api/admin/users              | admin        |
| DELETE | /api/admin/users/:id          | admin        |
| GET    | /api/questions                | any auth     |
| POST   | /api/responses/submit         | student      |
| GET    | /api/results/:userId          | self / admin |
