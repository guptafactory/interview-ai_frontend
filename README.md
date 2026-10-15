# Interview AI — Frontend

A React + Vite single-page application for the **Interview AI** MERN project. Users paste a target job description, upload a resume (or write a short self-description), and the app asks the AI backend to generate a personalized **interview strategy**: technical & behavioral questions with model answers, a multi-day preparation roadmap, a match score with skill gaps — plus a downloadable, AI-generated resume PDF.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Project Structure](#project-structure)
- [Routing](#routing)
- [Architecture &amp; Data Flow](#architecture--data-flow)
- [Backend API Contract](#backend-api-contract)
- [Styling Conventions](#styling-conventions)
- [Build &amp; Deploy Notes](#build--deploy-notes)

---

## Features

| Area                  | What it does                                                                                                                                        |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Auth**              | Register / Login / Logout with **cookie-based sessions** (`withCredentials: true`); session restored on boot via `GET /auth/get-me`.                |
| **Route protection**  | `Protected` wrapper shows a loading state while the session resolves, then redirects unauthenticated users to `/login`.                             |
| **Plan generation**   | Two-panel form: target job description (required, ≤ 5000 chars) **and** either a resume upload **or** a quick self-description.                     |
| **Report history**    | Home lists previously generated plans with job title, creation date, and color-coded match score (≥80 high / ≥60 mid / else low).                   |
| **Report viewer**     | `/interview/:reportId` — left nav (Technical / Behavioral / Roadmap) + center accordion content + right sidebar (match score ring, skill-gap tags). |
| **Resume download**   | Generates a resume PDF server-side and triggers a client-side blob download (`resume_<reportId>.pdf`).                                              |
| **Config validation** | `VITE_API_BASE_URL` is validated at boot with **Zod**; an invalid/missing value fails fast with a prettified error.                                 |

## Tech Stack

- **React 19** (function components + hooks, `StrictMode`)
- **Vite 8** + `@vitejs/plugin-react` (ESM, HMR)
- **react-router 8** (`createBrowserRouter` / `RouterProvider` — note: the `react-router` package, not `react-router-dom`)
- **axios** — two thin service modules (`auth.api.js`, `interview.api.js`), both `withCredentials: true`
- **Zod 4** — runtime validation of environment config
- **Sass (SCSS)** — feature-scoped stylesheets, BEM-ish class naming, dark theme
- **ESLint 10** flat config (recommended + `react-hooks` + `react-refresh`)

State management is plain **React Context + hooks** (no Redux/Zustand/React Query).

## Getting Started

### Prerequisites

- Node.js ≥ 20 (Vite 8 requirement)
- The **Interview AI backend** running and reachable (default `http://localhost:3000/api/v1`)

### Setup

```bash
# 1. Clone and install
git clone https://github.com/guptafactory/interview-ai_frontend.git
cd interview-ai_frontend
npm install

# 2. Configure environment
copy .env.example .env        # Windows (use `cp .env.example .env` on macOS/Linux)
#    then edit .env and set a REAL backend URL (see Environment Variables)

# 3. Start dev server (opens http://localhost:5173)
npm run dev
```

> ⚠️ The placeholder in `.env.example` is intentionally blank and **must** be replaced — `src/config/env.js` rejects non-URL values at startup.

## Environment Variables

| Key                 | Required | Example                        | Description                                                                                                         |
| ------------------- | -------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL` | ✅       | `http://localhost:3000/api/v1` | Base URL of the backend REST API. Validated by `z.url()` in `src/config/env.js`; the app throws on boot if invalid. |

Notes:

- Only `VITE_`-prefixed variables are exposed to the browser — **never put secrets here**.
- Vite loads `.env` natively; the `dotenv` package listed in `dependencies` is not needed (see finding **SEC-02**).

## Scripts

| Command           | Description                        |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Start Vite dev server with HMR     |
| `npm run build`   | Production build to `dist/`        |
| `npm run preview` | Serve the production build locally |
| `npm run lint`    | ESLint over the whole project      |

## Project Structure

```
interview-ai_frontend/
├── public/
│   ├── favicon.svg
│   └── icons.svg                  # sprite (currently unused by components)
├── src/
│   ├── main.jsx                   # React root (StrictMode)
│   ├── App.jsx                    # AuthProvider > InterviewProvider > RouterProvider
│   ├── app.routes.jsx             # Route table
│   ├── style.scss                 # Global styles + shared button styles
│   ├── styles/
│   │   └── button.scss            # .btn / .btn-primary
│   ├── config/
│   │   └── env.js                 # Zod-validated runtime config (env.apiBaseUrl)
│   └── features/                  # Feature-sliced modules
│       ├── auth/
│       │   ├── components/Protected.jsx     # Auth route guard
│       │   ├── contexts/auth.context.js
│       │   ├── providers/auth.provider.jsx  # Session restore (get-me)
│       │   ├── hooks/useAuth.js             # login / register / logout
│       │   ├── services/auth.api.js         # axios instance + auth endpoints
│       │   ├── pages/{Login,Register}.jsx
│       │   └── styles/auth.form.scss
│       └── interview/
│           ├── contexts/interview.context.js
│           ├── providers/interview.provider.jsx  # loading / report / reports
│           ├── hooks/useInterview.js             # fetch/generate/download + route effect
│           ├── services/interview.api.js         # axios instance + interview endpoints
│           ├── pages/{Home,Interview}.jsx
│           └── styles/{home,interview}.scss
├── .env / .env.example
├── eslint.config.js
├── vite.config.js
└── index.html
```

**Convention:** each feature owns its `components / contexts / hooks / pages / providers / services / styles`, so pages never call axios directly — they go through a hook, which goes through a service.

## Routing

| Path                   | Guard       | Component   | Purpose                                     |
| ---------------------- | ----------- | ----------- | ------------------------------------------- |
| `/login`               | public      | `Login`     | Email + password sign-in                    |
| `/register`            | public      | `Register`  | Username + email + password sign-up         |
| `/`                    | `Protected` | `Home`      | Generate a plan + list recent reports       |
| `/interview/:reportId` | `Protected` | `Interview` | View one report (questions, roadmap, score) |
| `*`                    | —           | **missing** | No catch-all/404 route yet                  |

## Architecture & Data Flow

```
main.jsx
 └─ App.jsx
     ├─ AuthProvider      → user, loading; calls getMe() once on mount
     ├─ InterviewProvider → loading, report, reports
     └─ RouterProvider (app.routes.jsx)
         └─ Page (Home / Interview)
             └─ useInterview()  ──►  interview.api.js (axios, cookies)
                    │                     └─ VITE_API_BASE_URL (Zod-validated)
                    └─ useEffect: reportId ? getReportById(id) : getReports()
```

- **Auth state** lives in `AuthProvider` (`user`, `loading`); `useAuth()` exposes `handleLogin / handleRegister / handleLogout` and returns booleans so pages can decide whether to navigate.
- **Interview state** lives in `InterviewProvider`; `useInterview()` performs all fetching and memoizes callbacks with `useCallback`, so the route effect only re-runs when `reportId` changes.
- **Guard flow:** `Protected` → `loading ? spinner : user ? children : <Navigate to="/login" replace />`.
- **PDF download:** `POST` with `responseType: "blob"` → `URL.createObjectURL` → temporary `<a download>` click → `revokeObjectURL`.

## Backend API Contract

The frontend expects a REST API at `VITE_API_BASE_URL` with **cookie auth** (`Set-Cookie` on login/register; CORS must send `Access-Control-Allow-Credentials: true` and a specific origin).

| Method | Endpoint                      | Body / Params                                                                | Success response                    |
| ------ | ----------------------------- | ---------------------------------------------------------------------------- | ----------------------------------- |
| POST   | `/auth/register`              | `{ username, email, password }`                                              | `{ user }` (sets session cookie)    |
| POST   | `/auth/login`                 | `{ email, password }`                                                        | `{ user }` (sets session cookie)    |
| POST   | `/auth/logout`                | —                                                                            | clears cookie                       |
| GET    | `/auth/get-me`                | —                                                                            | `{ user }`; **401** when no session |
| POST   | `/interview/report/create`    | `multipart/form-data`: `jobDescription`, `selfDescription`, `resume?` (file) | `{ interviewReport }`               |
| GET    | `/interview/report/:reportId` | —                                                                            | `{ interviewReport }`               |
| GET    | `/interview/report/all`       | —                                                                            | `{ interviewReports: [...] }`       |
| POST   | `/interview/resume/:reportId` | —                                                                            | `application/pdf` (blob)            |

**Report shape used by the UI:** `_id`, `jobTitle`, `createdAt`, `matchScore`, `technicalQuestions[]`, `behavioralQuestions[]`, `preparationPlan[]` (`{ day, focus, tasks[] }`), `skillGaps[]` (`{ skill, severity }`); each question is `{ question, intention, answer }`.

## Styling Conventions

- Global reset + dark base theme in `src/style.scss` (`rgb(47, 46, 46)` background, `whitesmoke` text); shared `.btn` / `.btn-primary` in `src/styles/button.scss`.
- One SCSS file per feature page (`home.scss`, `interview.scss`, `auth.form.scss`), imported by the component that needs it.
- **BEM-ish naming**: `.block__element--modifier` (e.g. `.q-card__header`, `.interview-nav__item--active`, `.skill-tag--high`).
- Score colors use the same thresholds everywhere: `≥ 80 → score--high`, `≥ 60 → score--mid`, else `score--low`.
- Icons are inline SVG (Lucide-style strokes); `public/icons.svg` exists but is not currently referenced.

## Build & Deploy Notes

- `npm run build` outputs a static SPA to `dist/` — deploy to any static host/CDN or serve behind the backend.
- **SPA fallback is required:** rewrite unknown paths to `/index.html`, otherwise deep links such as `/interview/<id>` 404 on refresh.
- Serve over **HTTPS** in production: cookie-based `withCredentials` sessions need `Secure`/`SameSite` cookies plus a non-`*` CORS origin on the backend.
- Provide production config via `VITE_API_BASE_URL` at **build time** (e.g. `.env.production`); it is baked into the bundle.
- There is no route-level code splitting yet, so the whole app ships as one JS chunk

---
