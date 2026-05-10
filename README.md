# P-Ionna Travel

> Plan, book and manage trips with a personalized AI-powered travel assistant.

P-Ionna Travel is a full-stack prototype demonstrating a clean, modular,
production-shaped architecture for a modern mobile-first travel app:

- 🧳 **Travel Wallet** — trips, expenses, budgets, balances
- 🪐 **P-IONNA AI Assistant** — chat-style travel agent (mocked, swap-in ready)
- ✈️ **Booking** — searchable flight & hotel inventory + booking management
- 🔐 **JWT auth** with bcrypt password hashing
- 📱 **Mobile-first UI** styled to match the iONNA mockups

---

## Tech stack

| Layer        | Stack                                                                 |
| ------------ | --------------------------------------------------------------------- |
| Frontend     | React 18 · Vite · TypeScript · Tailwind CSS · React Router · Zustand · Axios · React Hook Form + Zod · Lucide |
| Backend      | Node.js · Express · TypeScript · Prisma ORM · Zod · helmet · CORS · rate-limit |
| Database     | SQLite (via Prisma) — schema is portable to PostgreSQL                |
| Auth         | JWT + bcrypt, email/password only                                     |
| Tests        | Vitest · React Testing Library · Supertest                            |
| Dev / DevOps | npm workspaces · Docker · docker-compose                              |

---

## Project structure

```
p-ionna-travel/
├── backend/                      # Express API
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── controllers/          # HTTP handlers
│       ├── routes/               # Express routers + Zod schemas
│       ├── middleware/           # auth, validation, rate-limit, errors
│       ├── services/             # business logic (auth, wallet, bookings, ai…)
│       ├── utils/                # prisma client, jwt, asyncHandler
│       ├── types/                # cross-cutting types (AuthRequest)
│       ├── app.ts                # Express app factory (testable)
│       └── server.ts             # entrypoint
├── frontend/                     # React app (Vite)
│   └── src/
│       ├── components/           # ui kit + ProtectedRoute
│       ├── features/             # feature modules (auth, wallet, booking, chat)
│       ├── pages/                # route-level components
│       ├── layouts/              # AppLayout, TopBar, BottomNav
│       ├── services/             # axios client + per-domain APIs
│       ├── store/                # zustand stores (auth, wallet, booking, chat)
│       ├── hooks/  utils/  types/
│       └── App.tsx · main.tsx
├── docker-compose.yml            # full-stack one-command run
├── package.json                  # workspace root scripts
└── README.md
```

---

## Quick start (local, no Docker)

Prereqs: **Node ≥ 20** and **npm ≥ 9**.

```bash
# 1. install everything (root + workspaces)
npm install
npm install --workspace backend
npm install --workspace frontend

# 2. configure env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. set up the database (SQLite file is created in backend/prisma/dev.db)
npm run db:migrate         # creates the schema (prisma migrate dev)
npm run db:seed            # populates demo trips, bookings, chat, etc.

# 4. run dev servers in parallel
npm run dev
# Backend → http://localhost:4000   (health: /api/health)
# Frontend → http://localhost:5173
```

The seed script creates two users — sign in with:

```
ana@ionna.travel   /  Password123!
demo@ionna.travel  /  Password123!
```

---

## Environment variables

`backend/.env`

| Name              | Default                  | Notes                                     |
| ----------------- | ------------------------ | ----------------------------------------- |
| `NODE_ENV`        | `development`            |                                           |
| `PORT`            | `4000`                   | API port                                  |
| `DATABASE_URL`    | `file:./dev.db`          | SQLite file (Prisma resolves relative to `prisma/`) |
| `JWT_SECRET`      | _change me_              | **Required in production**                |
| `JWT_EXPIRES_IN`  | `7d`                     |                                           |
| `CORS_ORIGIN`     | `http://localhost:5173`  | Comma-separated list allowed              |

`frontend/.env`

| Name           | Default                       | Notes                       |
| -------------- | ----------------------------- | --------------------------- |
| `VITE_API_URL` | `http://localhost:4000/api`   | Where the SPA hits the API  |

---

## Database / Prisma

```bash
# from repo root
npm run db:migrate    # prisma migrate dev --name init
npm run db:seed       # tsx prisma/seed.ts
npm run db:reset      # wipe + migrate + seed (destructive)

# from inside ./backend
npx prisma studio     # GUI to browse the SQLite DB
npx prisma generate   # regenerate Prisma client (after schema edits)
npx prisma db push    # push schema without a migration (good for prototypes)
```

### Migrating to PostgreSQL later

The schema only uses portable types. To switch:

1. Set `provider = "postgresql"` in `backend/prisma/schema.prisma`
2. Set `DATABASE_URL=postgres://...`
3. `npx prisma migrate dev --name init`

No application code changes required.

---

## Testing

```bash
# all suites
npm test

# backend (vitest + supertest, hits a local SQLite test.db)
npm run test --workspace backend

# frontend (vitest + jsdom + RTL)
npm run test --workspace frontend
```

Backend tests cover: auth signup/login/me, wallet CRUD, validation rejection.
Frontend tests cover: `Button` interactions and `format` utilities.

---

## Docker

The fastest way to run the whole thing:

```bash
# from repo root
docker-compose up --build

# Backend → http://localhost:4000
# Frontend → http://localhost:5173
```

The backend image:

- runs `prisma db push` on boot (creates the SQLite schema)
- runs the seed script
- starts the Express server

The frontend image builds the SPA and serves it via nginx.

To pass a custom JWT secret:

```bash
JWT_SECRET=$(openssl rand -hex 32) docker-compose up --build
```

---

## Architecture notes

### Backend

- **Express app factory** (`createApp()`) returns the configured app — used both
  by the `server.ts` entrypoint and by the Vitest + Supertest suite.
- **Service layer** owns the business logic; controllers stay thin and only
  translate HTTP ↔ service calls.
- **Validation** is done with Zod schemas (`routes/schemas.ts`) wired through a
  reusable `validate(schema, source)` middleware. Every error funnels through
  the central `errorHandler` (handles `ZodError`, `HttpError`, JWT errors).
- **Auth** is JWT-based via `requireAuth` middleware. Tokens carry `userId` and
  `email`; passwords are bcrypt-hashed.
- **Rate limiting** is applied globally (`apiLimiter`) and tightened on auth
  endpoints (`authLimiter`).
- **AI** lives behind `services/ai.service.ts` — a pattern-matching mock with
  the same async interface a real provider (Claude/OpenAI/etc.) would use.
  Swap in a real implementation without touching `chat.service.ts`.

### Frontend

- **Feature folders** (`features/auth`, `features/wallet`, …) keep page-level
  composition, while `pages/` only does routing/layout glue.
- **Service layer** (`services/*.ts`) is the only place that talks to the
  backend — UI never imports `axios` directly.
- **Zustand stores** are domain-scoped (`auth`, `wallet`, `booking`, `chat`)
  and call into the services. State is intentionally simple — no middleware,
  no persistence beyond the JWT (in `localStorage`).
- **Forms** use React Hook Form + Zod resolvers; error messages flow into the
  reusable `<Input>` component.
- **Routing** uses a `<ProtectedRoute>` wrapper around the `<AppLayout>` so
  every authenticated screen gets the same shell (top bar, bottom nav).

### Reusable UI

`components/ui/` is the design system: `Button`, `Input`, `Card`, `Modal`,
`Spinner`, `EmptyState`, `Logo`. Tailwind + `tailwind-merge` (`cn` helper) keep
class composition tidy.

---

## API reference (cheatsheet)

| Method | Path                              | Auth | Description                           |
| ------ | --------------------------------- | ---- | ------------------------------------- |
| GET    | `/api/health`                     | —    | Health probe                          |
| POST   | `/api/auth/signup`                | —    | Create user, returns `{ token, user }` |
| POST   | `/api/auth/login`                 | —    | Authenticate, returns `{ token, user }` |
| GET    | `/api/auth/me`                    | ✅   | Current user                          |
| GET    | `/api/trips`                      | ✅   | List user's trips                     |
| POST   | `/api/trips`                      | ✅   | Create trip                           |
| GET    | `/api/trips/:id`                  | ✅   | Trip detail (with wallet + bookings)  |
| PATCH  | `/api/trips/:id`                  | ✅   | Update trip                           |
| DELETE | `/api/trips/:id`                  | ✅   | Delete trip                           |
| GET    | `/api/wallet`                     | ✅   | List entries (`?tripId=` filter)      |
| GET    | `/api/wallet/summary`             | ✅   | Totals & by-category breakdown        |
| POST   | `/api/wallet`                     | ✅   | Create entry                          |
| PATCH  | `/api/wallet/:id`                 | ✅   | Update entry                          |
| DELETE | `/api/wallet/:id`                 | ✅   | Delete entry                          |
| GET    | `/api/bookings`                   | ✅   | List bookings                         |
| POST   | `/api/bookings`                   | ✅   | Create booking                        |
| PATCH  | `/api/bookings/:id`               | ✅   | Update booking                        |
| DELETE | `/api/bookings/:id`               | ✅   | Cancel booking                        |
| GET    | `/api/bookings/search/flights`    | ✅   | Mock flight search                    |
| GET    | `/api/bookings/search/hotels`     | ✅   | Mock hotel search                     |
| GET    | `/api/chat`                       | ✅   | Chat history                          |
| POST   | `/api/chat`                       | ✅   | Send message; returns user + AI reply |
| DELETE | `/api/chat`                       | ✅   | Clear chat history                    |

---

## Troubleshooting

**`Error: P1003: Database file does not exist`**
Run `npm run db:migrate` (or `npm run db:push --workspace backend`) first.

**Frontend shows network errors / 401 on every request**
Make sure `backend/.env` has `CORS_ORIGIN=http://localhost:5173` and that the
backend is running. Confirm with `curl http://localhost:4000/api/health`.

**Port already in use**
Change `PORT` in `backend/.env` and `VITE_API_URL` in `frontend/.env`
(or set the `port` in `vite.config.ts`).

**Prisma client out of date**
After editing `schema.prisma` run `npm run prisma:generate --workspace backend`.

**Docker: backend keeps restarting**
Look at `docker-compose logs backend`. The most common cause is a missing
`JWT_SECRET` (the compose file falls back to a placeholder, but production
should always provide one).

**Tests can't find the database**
The backend tests set `DATABASE_URL=file:./test.db`. Run `cd backend &&
DATABASE_URL=file:./test.db npx prisma db push` once before the first run.

---

## Replacing the mock AI

`backend/src/services/ai.service.ts` exposes a single function:

```ts
aiService.respond(userMessage: string, history: AiHistoryItem[]): Promise<{ content, metadata }>
```

To wire up a real provider, replace the body of `respond` with an SDK call
(e.g. `@anthropic-ai/sdk` or `openai`). No changes to `chat.service.ts`,
controllers, routes or the frontend store are required.

---

## License

Prototype — © 2025 iONNA Travel. All rights reserved.
