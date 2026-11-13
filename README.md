# VibeWall — Frontend

> Anonymous confessions, community opinion polls, and anonymous Q&A. AI-moderated. Ephemeral & safe.

VibeWall is a modern React + TypeScript web application for an anonymous expression and discussion platform. Users can share confessions, participate in live community opinion polls, ask questions to the community or individual user walls, and chat with an empathetic AI companion. The main Live Wall combines confessions, polls, and Q&A into a randomized discovery stream that changes sequence on every page load.

**Backend repo:** [TornovDutta/VibeWall](https://github.com/TornovDutta/VibeWall) (Spring Boot + MongoDB + Redis)

---

## Features

### 🌟 Core Experience
- **Unified Randomized Live Wall**: Confessions, opinion polls, and Q&A questions are combined into a dynamic stream. The feed applies a Fisher-Yates random shuffle on every load/refresh so content discovery is unpredictable and engaging.
- **Segmented Filter Pills**: Filter the live stream by `✨ All Vibes`, `💬 Confessions`, `🗳️ Polls`, or `❓ Q&A`.
- **Anonymous Confessions**: Post, edit, and delete confessions; react with emoji vibes; leave supportive feedback comments. Confessions vanish after 12 hours.
- **Interactive Opinion Polls**: Create public polls with 2–6 custom options; dynamic percentage distribution bars; single-vote enforcement; category badges (`TECH`, `LIFESTYLE`, `CAMPUS`, `DEEP`); poll expiration countdowns.
- **Anonymous Q&A Walls**:
  - Ask community questions visible to everyone on the Live Wall.
  - Ask directed questions to specific user walls (`/wall/:userId`).
  - Answer questions publicly (showing on wall and live stream) or privately.
  - Quick shareable wall link with copy-to-clipboard.
- **Real-Time In-App Notifications**: Notification bell in the navbar with unread counters for replies, questions, reactions, and feedback.
- **Floating AI Companion Chatbot**: Global floating chat widget offering supportive, empathetic, non-judgmental conversations powered by an LLM backend.
- **User Dashboard**: Dedicated dashboard with 5 tabs:
  - `My Confessions`: Manage personal confessions and feedback responses.
  - `My Q&A`: View Pending Inbox, questions asked by the user, and community Q&A with inline reply modals.
  - `All Feed`: Quick overview of live platform posts.
  - `My Reports`: Manage submitted abuse reports.
  - `Profile`: Edit display name and password, or safely delete account.
- **Safety & Crisis Support Page (`/privacy`, `/security`)**: Dedicated emergency helplines (Tele-MANAS, Vandrevala Foundation, Kiran), safety principles, and platform ethics.
- **Admin Governance Panel (`/admin`)**: Role-gated moderation center to review pending reports, inspect flagged content, approve/reject flags, and manage platform users.
- **Dark/Light Mode Theme Toggle**: Full system-aware theme switcher with persistent preference.
- **Deterministic Anonymous Aliases**: Algorithmic generation of friendly aliases from user IDs (e.g. "Lunar Fox", "Cosmic Phoenix").

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18 + TypeScript |
| **Build Tool** | Vite 5 |
| **Routing** | React Router DOM 6 |
| **Styling** | Tailwind CSS 3 (Custom theme tokens, dark mode) |
| **HTTP Client** | Axios (with automatic JWT interception & silent refresh) |
| **Icons & Badges** | Native emoji & Tailwind SVG iconography |

---

## Project Structure

```
src/
├── api/                      # Axios client + domain API services
│   ├── client.ts             # Base Axios instance, Bearer attach & token refresh interceptors
│   ├── auth.ts               # Login, registration, token refresh, logout
│   ├── confessions.ts        # Confession CRUD & feedback
│   ├── feed.ts               # Public cached feed
│   ├── polls.ts              # Opinion polls list, create, vote, delete
│   ├── qa.ts                 # Community Q&A, wall questions, inbox, replies
│   ├── notifications.ts      # In-app notifications & unread count
│   ├── vibes.ts              # Reactions & community pulse stats
│   ├── reports.ts            # Abuse reporting
│   ├── users.ts              # Profile update & account deletion
│   └── admin.ts              # Admin user & report audit endpoints
├── components/               # Modular UI components
│   ├── Navbar.tsx            # Responsive navigation, notification bell, theme toggle
│   ├── ConfessionCard.tsx    # Confession card with feedback & emoji reactions
│   ├── PollCard.tsx          # Interactive voting card with animated percentage bars
│   ├── QuestionCard.tsx      # Q&A card with public/private answers & reply actions
│   ├── DailyVibeCard.tsx     # Daily emotional prompt / inspiration
│   ├── NotificationBell.tsx  # Notification bell dropdown with badge & read toggles
│   ├── ChatBot.tsx           # Global floating AI companion chatbot
│   ├── AskQuestionModal.tsx  # Modal to ask community or wall questions
│   ├── ReplyQuestionModal.tsx# Modal for wall owners to reply to questions
│   ├── CreateConfessionModal.tsx # Post confession modal
│   ├── CreatePollModal.tsx   # Launch opinion poll modal
│   ├── FeedbackSection.tsx   # Comments & feedback section
│   ├── ReactionButtons.tsx   # Interactive emoji vibes
│   ├── ReportModal.tsx       # Flag content modal
│   ├── ProtectedRoute.tsx    # Route guard by authentication and role
│   ├── ThemeToggle.tsx       # Light / Dark mode toggle
│   └── LoadingSpinner.tsx    # Loading state indicator
├── context/
│   ├── AuthContext.tsx       # Global auth session, token storage & decoded JWT claims
│   └── ThemeContext.tsx      # Theme state & HTML class management
├── pages/
│   ├── FeedPage.tsx          # Main Live Wall (randomized mixed feed of confessions, polls, and Q&A)
│   ├── LandingPage.tsx       # Public hero landing for visitors
│   ├── PollsPage.tsx         # Dedicated community polls explorer
│   ├── QAPage.tsx            # Community Q&A feed & personal user walls (/wall/:userId)
│   ├── DashboardPage.tsx     # User hub (My Confessions, My Q&A, All Feed, Reports, Profile)
│   ├── SafetyPrivacyPage.tsx # Crisis support resources, helplines & safety guide
│   ├── LoginPage.tsx         # User sign-in
│   ├── RegisterPage.tsx      # User registration
│   ├── AdminLoginPage.tsx    # Dedicated admin credentials login
│   └── AdminPage.tsx         # Moderator & administrator control panel
├── types/
│   └── index.ts              # Shared TypeScript interfaces & DTO contracts
├── utils/
│   ├── generateAnonName.ts   # Deterministic pseudonym generator
│   └── events.ts             # Custom DOM events for notification refresh triggers
├── App.tsx                   # Main router hierarchy & global chatbot attachment
└── main.tsx                  # React DOM root entry
```

---

## Route Overview

| Path | Access | Description |
|---|---|---|
| `/` | Public | Live Wall — unified randomized stream of confessions, polls, and Q&A |
| `/polls` | Public | Dedicated opinion polls page with category filters & active polls |
| `/qa` | Authenticated | Anonymous Q&A community feed and personal inbox |
| `/wall/:userId` | Public | Public Q&A wall of a specific user with answered questions |
| `/privacy` / `/security` | Public | Safety guidelines, data privacy principles & 24/7 crisis helplines |
| `/dashboard` | Authenticated (`USER`) | User dashboard with My Confessions, My Q&A, Reports, and Profile |
| `/login` | Public | User login |
| `/register` | Public | User registration |
| `/admin/login` | Public | Dedicated administrative portal login |
| `/admin` | Authenticated (`ADMIN`) | Moderation queue and user management control room |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+ (or pnpm / yarn)
- Backend service running on `http://localhost:8080/api/v3` (see [Backend Readme](../Backend/Readme.md))

### 1. Install dependencies

```bash
cd Frontend
npm install
```

### 2. Run development server

```bash
npm run dev
```

Opens at `http://localhost:5173`.

### 3. Production build

```bash
npm run build
```

Performs strict TypeScript validation (`tsc`) and compiles optimized production assets via Vite.

---

## 👨‍💻 Author

Designed and developed by **Tornov Dutta**.  
Repository: [https://github.com/TornovDutta/VibeWall](https://github.com/TornovDutta/VibeWall)
