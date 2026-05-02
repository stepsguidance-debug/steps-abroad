# Steps Guidance — Frontend Guide

This folder is the **website** that students and admins see in the browser. It talks to the **backend** (API) to log in, load questions, save answers, and show results.

---

## 1. What this app does (in plain words)

| Who | What they do here |
|-----|---------------------|
| **Students** | Log in → take the career assessment → see their personalised results dashboard (and admins can export a PDF of that view). |
| **Admins** | Log in → add students → manage questions → view system status → open any student’s result. |

Everything runs in **one web app**. The screen changes based on whether you signed in as a student or an admin.

---

## 2. Tech stack (short)

- **React** — the UI building blocks.
- **TypeScript** — helps catch mistakes in code while developing.
- **Vite** — starts the dev server and builds the production website.
- **Tailwind CSS** + **shadcn/ui** — layout, buttons, forms, and a consistent “navy + gold” look.

You do **not** need to master these to read this document; they are just labels for developers.

---

## 3. Folder map (where things live)

| Path | Role |
|------|------|
| `pages/` | Full screens: login, assessment, results, and admin pages (users, questions, etc.). |
| `components/` | Reusable pieces (buttons, cards, layout). |
| `lib/` | Shared logic: API calls (`apiClient.ts`), types, PDF export, section titles, mock data. |
| `context/` | Keeps “who is logged in” available across the app. |
| `index.css` | Global colours and the “glass card” style. |
| `.env.example` | Lists **environment variable names**; copy to `.env` for local setup (see §6). |

---

## 4. Main user flows

1. **Login** (`Login.tsx`)  
   Chooses student vs admin and sends email/password to the backend.

2. **Assessment** (`Assessment.tsx`)  
   Loads questions from the API, one at a time, saves progress (browser + draft on server), submits when finished.

3. **Results** (`Results.tsx`)  
   Shows scores, traits, career fit, etc., after submission.

4. **Admin area** (`pages/admin/*`)  
   - **Overview** — quick stats  
   - **Manage users** — create/delete students  
   - **Question bank** — add/delete questions (order follows section rules on the server)  
   - **Student result** — view one student like they would see  
   - **System status** — health checks  

---

## 5. How to run locally (developers)

### Requirements

- **Node.js** (LTS recommended)
- The **backend** running and reachable (see `backend/README.md`)

### Commands

From this `frontend/` folder:

```bash
npm install
```

Copy `.env.example` → `.env` and adjust URLs (especially `VITE_API_PROXY_TARGET` to your backend).

```bash
npm run dev
```

The terminal shows the local address (often `http://localhost:8080`). The dev server **proxies** `/api/*` to your backend — so the browser calls same-origin `/api/...`.

### Useful scripts

| Command | Meaning |
|---------|---------|
| `npm run dev` | Live reload during development |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Try the production build locally |
| `npm run lint` | Code style checks |
| `npm test` | Automated tests |

---

## 6. Environment variables (`frontend/.env`)

Use `.env.example` as a template. Typical keys:

| Variable | Plain meaning |
|----------|----------------|
| `VITE_APP_NAME` | Shown in the HTML title/branding spots |
| `VITE_DEFAULT_THEME` | Default dark/light flavour |
| `VITE_USE_MOCKS` | **`false`** for real backend; **`true`** only for offline demos (fake users/questions) |
| `VITE_API_PROXY_TARGET` | Backend base URL **during `npm run dev`** (used by Vite proxy) |
| `VITE_API_BASE_URL` | If you build a site that calls the API from another origin, set the full API URL; often empty when using same-origin `/api` |

**Tip:** If students see old or missing questions, confirm **`VITE_USE_MOCKS=false`** so the app uses the real database.

---

## 7. API communication (big picture)

The file `lib/apiClient.ts` is the **single front door** to the backend:

- Login, students, questions, drafts, submit, results, health, etc.
- Sends the **JWT** token from login in the `Authorization` header.
- Handles **empty responses** (e.g. successful deletes) without breaking.

---

## 8. PDF export (optional detail)

Result PDFs are built in the browser with **`@react-pdf/renderer`** (vector PDF), triggered from admin views that call helpers in `lib/resultPdfExport.ts` and `lib/ResultPdfDocument.tsx`.

---

## 9. Where to get help

- Backend behaviour, database, AI scoring → **`backend/README.md`**
- Copy env templates → **`.env.example`** in this folder and in `backend/`

---

*This document is meant to be readable for product owners and new developers alike. For deep code questions, open the files mentioned above or ask your team’s technical lead.*
