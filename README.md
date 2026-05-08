# VibeWall — Frontend

> Anonymous confessions. AI-moderated. Gone in 12 hours.

VibeWall is a React + TypeScript web application for an anonymous confession and discussion platform. Users can post confessions, give feedback, and report inappropriate content. Confessions auto-expire after 12 hours. The platform includes role-based access (USER / ADMIN) and an admin panel for moderation.

**Backend repo:** [TornovDutta/VibeWall](https://github.com/TornovDutta/VibeWall) (Spring Boot + MongoDB + Redis)

---

## Features

- Anonymous confession posting, editing, and deletion
- Live public feed with refresh
- Feedback / comments on confessions
- Reporting system for inappropriate content
- User dashboard (my confessions, feed, reports, profile)
- Admin panel — manage users, view and resolve reports
- JWT authentication with silent refresh (access + refresh tokens)
- Fully dark-themed, responsive UI

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 5 |
| Routing | React Router DOM 6 |
| Styling | Tailwind CSS 3 |
| HTTP Client | Axios (with JWT interceptors) |

---

## Project Structure

```
src/
├── api/              # Axios client + per-resource API modules
│   ├── client.ts     # Base Axios instance, JWT attach & refresh logic
│   ├── auth.ts
│   ├── confessions.ts
│   ├── feed.ts
│   ├── feedback.ts
│   ├── reports.ts
│   ├── users.ts
│   └── admin.ts
├── components/       # Reusable UI components
│   ├── Navbar.tsx
│   ├── ConfessionCard.tsx
│   ├── CreateConfessionModal.tsx
│   ├── FeedbackSection.tsx
│   ├── ReportModal.tsx
│   ├── ProtectedRoute.tsx
│   └── LoadingSpinner.tsx
├── context/
│   └── AuthContext.tsx   # Auth state, token persistence
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── FeedPage.tsx
│   ├── DashboardPage.tsx
│   └── AdminPage.tsx
├── types/
│   └── index.ts      # Shared TypeScript interfaces
├── App.tsx           # Root component + route definitions
└── main.tsx          # Entry point
```

---

## Prerequisites

- Node.js 18+
- npm 9+ (or pnpm / yarn)
- The backend running locally or deployed — see [TornovDutta/VibeWall](https://github.com/TornovDutta/VibeWall)

---

## Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/TornovDutta/vibewall-full-frontend.git
cd vibewall-full-frontend

# 2. Install dependencies
npm install

# 3. Configure environment (see below)
cp .env.example .env   # or create .env manually

# 4. Start the dev server
npm run dev
```

The app runs on `http://localhost:5173` by default.

---

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v3
```

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL for all backend API calls |

For local development against an HTTPS backend, the Vite config also proxies `/api/v3` to `https://localhost:8443`.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with hot reload |
| `npm run build` | Type-check + production build → `dist/` |
| `npm run preview` | Serve the production build locally |

---

## Backend

The frontend requires the VibeWall Spring Boot backend (Java 17, MongoDB, Redis, AI moderation).
For setup instructions, see the backend repo: [TornovDutta/VibeWall](https://github.com/TornovDutta/VibeWall)

### API Surface

| Prefix | Description |
|---|---|
| `/api/v3/auth` | Register, login, token refresh, logout |
| `/api/v3/feed` | Public confession feed |
| `/api/v3/users/confession` | Create / edit / delete confessions |
| `/api/v3/users/feedback` | Add / view feedback |
| `/api/v3/users/report` | Report a confession |
| `/api/v3/admin` | Admin — user and report management |

---

## Authentication Flow

- Tokens are stored in `localStorage` (`vw_jwt`, `vw_refresh`).
- Axios interceptors attach the access token to every request.
- On a `401` response, the client automatically calls the refresh endpoint and retries queued requests.
- Failed refresh redirects the user to `/login`.

---

## License

MIT
