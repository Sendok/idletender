# TenderHub — Freelance Tender Marketplace

> Proposal-based freelance marketplace where quality wins, not bidding wars.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) + TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui + Framer Motion |
| Database | SQLite (Prisma ORM) |
| Auth | JWT (bcryptjs + jsonwebtoken) |
| State | Zustand (persisted auth + client-side routing) |

## Prerequisites

- **Node.js** ≥ 18
- **Bun** (recommended) or npm/pnpm/yarn

## Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd my-project

# 2. Install dependencies
bun install

# 3. Setup environment variables
cp .env.example .env
# Edit .env if needed (default values work out of the box):
#   DATABASE_URL="file:./db/custom.db"
#   JWT_SECRET="dev-secret-change-me"

# 4. Push database schema & generate Prisma client
bun run db:push

# 5. Seed the database with demo data
bun run db:seed

# 6. Start the development server
bun run dev
```

The app will be available at **http://localhost:3000**

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Worker | alice@example.com | password123 |
| Worker | bob@example.com | password123 |
| Worker | carol@example.com | password123 |
| Job Provider | david@example.com | password123 |
| Job Provider | eve@example.com | password123 |

## Project Structure

```
├── prisma/
│   ├── schema.prisma          # Database schema (7 models)
│   └── seed.ts                # Seed script with demo data
├── db/
│   └── custom.db              # SQLite database file
├── src/
│   ├── app/
│   │   ├── page.tsx           # Main SPA (all pages rendered client-side)
│   │   ├── layout.tsx         # Root layout
│   │   └── api/               # Next.js API Routes
│   │       ├── auth/          # Login, Register, Me
│   │       ├── jobs/          # CRUD, Select Worker, Start, Complete
│   │       ├── proposals/     # Create, My Proposals, Update Status
│   │       ├── notifications/ # List, Mark Read, Mark All Read
│   │       ├── dashboard/     # Worker Stats, Provider Stats
│   │       ├── reviews/       # Create, Get by Job
│   │       └── users/         # Profile, Update, Reviews
│   ├── components/ui/         # shadcn/ui components
│   └── lib/
│       ├── api.ts             # API client (fetch wrapper)
│       ├── auth.ts            # JWT & bcrypt utilities
│       ├── db.ts              # Prisma client singleton
│       ├── store.ts           # Zustand stores (auth + router)
│       └── utils.ts           # Utility functions
├── Caddyfile                  # Gateway config (port 81 → 3000)
└── package.json
```

## Features

### Public Pages
- **Home** — Hero section, stats, testimonials, featured jobs, CTA
- **Browse Jobs** — Search, filter by category/status/budget, sort, pagination
- **Job Detail** — Full job info, proposals, review system

### Worker Pages
- **Dashboard** — Stats overview, recent proposals, active jobs
- **My Proposals** — List all proposals, withdraw submitted ones
- **My Jobs** — Active & completed assignments
- **Profile** — Edit bio, skills, location; view received reviews
- **Notifications** — Real-time notification feed

### Job Provider Pages
- **Dashboard** — Stats overview, recent jobs, quick actions
- **Post Job** — Create new job with budget range & deadline
- **My Jobs** — Manage all jobs, cancel eligible ones
- **View Proposals** — Review, shortlist, accept/reject, select worker
- **Profile** — Edit company info, view received reviews

### Core Functionality
- JWT-based authentication with role-based access
- Full job lifecycle: OPEN → PROPOSALS_RECEIVED → WORKER_SELECTED → IN_PROGRESS → COMPLETED / CANCELLED
- Proposal workflow: SUBMITTED → SHORTLISTED → ACCEPTED / REJECTED / WITHDRAWN
- Star rating & review system for completed jobs
- Activity logging & notification system
- Client-side SPA routing with Zustand

## Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server (port 3000) |
| `bun run lint` | Run ESLint checks |
| `bun run db:push` | Push schema changes to database |
| `bun run db:generate` | Regenerate Prisma client |
| `bun run db:seed` | Seed database with demo data |
| `bun run db:reset` | Reset database and re-seed |

## API Overview

All API routes are under `/api/`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & get JWT token |
| GET | `/api/auth/me` | Get current user (requires auth) |
| GET | `/api/jobs` | List jobs (search, filter, paginate) |
| POST | `/api/jobs` | Create job (provider only) |
| GET | `/api/jobs/:id` | Get job detail with proposals |
| POST | `/api/jobs/:id/select-worker` | Select worker for job |
| POST | `/api/jobs/:id/start` | Start job progress |
| POST | `/api/jobs/:id/complete` | Complete a job |
| POST | `/api/proposals` | Submit a proposal (worker only) |
| GET | `/api/my-proposals` | Get worker's proposals |
| PUT | `/api/proposals/:id/status` | Update proposal status |
| GET | `/api/notifications` | List notifications |
| PUT | `/api/notifications/:id/read` | Mark notification read |
| PUT | `/api/notifications/read-all` | Mark all notifications read |
| GET | `/api/dashboard/worker` | Worker dashboard stats |
| GET | `/api/dashboard/provider` | Provider dashboard stats |
| GET | `/api/users/:id` | Get user profile |
| PUT | `/api/users/profile` | Update own profile |
| GET | `/api/users/:id/reviews` | Get user's reviews |
| POST | `/api/reviews` | Submit a review |
| GET | `/api/reviews/job/:id` | Get reviews for a job |

## License

Private — All rights reserved.
