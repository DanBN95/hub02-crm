# Sprint 0: Monorepo Skeleton

## What
Establishes the full project skeleton — a working pnpm monorepo with `apps/web` (React 19 + Vite), `apps/api` (NestJS 11 + Prisma), and `packages/shared` (zod contracts + inferred types). No CRM business features; all subsequent PRs build on this.

## Why
Validates the full pipeline: install → typecheck → lint → test → (later) Vercel + Railway deploy. Establishes architectural patterns (repository, DTO, shared contracts) before they proliferate.

## What's included
- **pnpm workspaces** with TypeScript strict across all packages
- **apps/web**: React 19 + Vite + Tailwind v4 + TanStack Query + TanStack Router + zustand + react-hook-form + zod + axios. Vitest smoke test passes.
- **apps/api**: NestJS 11 + `@nestjs/jwt` + Passport (Google + JWT strategies) + nestjs-pino + class-validator. Modules: health, auth, users, prisma. Jest unit test on HealthController passes.
- **Prisma schema**: `User`, `Workspace`, `WorkspaceMember`, `Sprint`, `Task`, `Comment`. Indexes on all FK columns. Enums `Priority` (P0–P3) and `Status` (BACKLOG→DONE).
- **packages/shared**: Zod schemas + inferred TS types for all domain entities. Consumed by both web and api.
- **Auth scaffold**: Google OAuth2 + JWT httpOnly cookie. Routes: `GET /auth/google`, `GET /auth/google/callback`, `GET /auth/me`, `POST /auth/logout`. Protected with `JwtAuthGuard`.
- **CI**: GitHub Actions on PR → install → typecheck → lint → test (Node 22, pnpm cache).
- **vercel.json** at root for frontend deploy.
- **railway.toml** at `apps/api` for backend deploy.

## Design note
Design tokens (`tokens.css`, `globals.css`) are stub files on this branch — they are replaced by the content from `feat/sprint-0-design-system`. **Merge the design branch first, then this one** — or merge both and take design branch content during conflict resolution on the stub files.

## How tested
- `pnpm typecheck` → green
- `pnpm lint` → green  
- `pnpm test` → web Vitest smoke + api Jest unit test, both pass

## Deviations from spec
- **TanStack Router chosen over React Router v7**: React Router v7 has breaking SSR changes in v7 that add complexity with Vite; TanStack Router has better TS integration for this use case.
- **Jest for api, Vitest for web**: NestJS testing utilities (`@nestjs/testing`) are Jest-first. Using Vitest for NestJS requires non-trivial adapter setup. Vitest used on the web side only.

## Risk
- Low: no business logic, no migrations applied. Schema migration (`init`) is created with `--create-only`.
- Auth routes exist but are not connected to a real Google OAuth app yet — harmless until credentials are added to env.
