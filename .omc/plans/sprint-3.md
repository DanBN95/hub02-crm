# Sprint 3 Plan — hub02-crm
**Status:** pending approval  
**Created:** 2026-05-18  
**Scope:** Next sprint features

---

## Context & Current State

What's shipped through Sprint 2 + post-sprint work:

| Area | State |
|---|---|
| Tasks API | Full CRUD, bulk ops, board endpoint |
| Sprints API | CRUD, activate, timeline |
| Comments API | Per-task feed, delete own |
| Auth | `POST /auth/dev-login` (demo only); Google OAuth **stubbed** (placeholder creds) |
| Members | Only seeded demo user; `GET /workspaces/:id/members` returns 1 person |
| Frontend | Sidebar nav, TasksView (groups), SprintsTable, TaskDetailPanel, all 4 inline cells |

**Critical gap:** The app requires `ALLOW_DEV_LOGIN=true` on Railway to work at all — no real user can log in without Google OAuth credentials configured.

---

## Sprint 3 Features (prioritized)

### Feature 1 — Google SSO (Blocker)
**Why first:** Nothing else matters for real users until auth works end-to-end.

**Acceptance criteria:**
- [ ] User clicks "Sign in with Google" on the frontend → redirected to Google consent screen
- [ ] After consent, user is redirected back to the app and sees their workspace
- [ ] JWT cookie set with `SameSite=None; Secure=true` (cross-origin Railway → Vercel)
- [ ] `GET /auth/me` returns the authenticated Google user
- [ ] New users (first Google login) are auto-provisioned and added to the first available workspace as `member`
- [ ] `ALLOW_DEV_LOGIN` remains available for local dev; `dev-login` blocked in prod by default

**Implementation steps:**
1. **Railway env vars** (user action): Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL=https://hub02-crm.up.railway.app/auth/google/callback` in Railway dashboard
2. **Frontend login page** — `apps/web/src/features/auth/LoginPage.tsx`: centered card with "Sign in with Google" button → `href={VITE_API_URL}/auth/google`. Show when `WorkspaceContext` returns no workspace.
3. **WorkspaceContext** (`apps/web/src/context/WorkspaceContext.tsx`): Replace dev-login fallback with redirect to login page on 401 (in production). Keep dev-login for `import.meta.env.DEV`.
4. **Auth callback** (`apps/api/src/modules/auth/auth.controller.ts`): `googleCallback` already exists. Verify redirect goes to `WEB_ORIGIN` after cookie is set. ✓ already wired.
5. **Auto-provision workspace membership** (`apps/api/src/modules/auth/auth.service.ts`): After `validateGoogle`, if user has 0 workspace memberships, add them to the first workspace as `member`. Add `findFirstWorkspace()` to `WorkspacesRepository`.
6. **Vercel env var**: Set `VITE_API_URL=https://hub02-crm.up.railway.app` in Vercel project settings.

**Risk:** Google OAuth requires verified redirect URI; Railway URL must match exactly what's registered in Google Cloud Console.  
**Mitigation:** Use a fixed Railway URL (not preview). Document the exact callback URL in README.

---

### Feature 2 — Workspace Member Invitations
**Why second:** The `OwnerCell` currently shows only the demo user. Invitations unlock real team use.

**Acceptance criteria:**
- [ ] Workspace owner can type an email and send an invite from the workspace settings panel
- [ ] Invite creates a pending `WorkspaceInvitation` record with a secure token (24h expiry)
- [ ] Recipient clicks a link (`/invite/:token`) → auto-signed-in (Google SSO) → added to workspace
- [ ] Invited member appears in `GET /workspaces/:id/members` and the OwnerCell dropdown
- [ ] Duplicate invite to same email is idempotent (returns existing pending invite)

**Schema addition** (`apps/api/prisma/schema.prisma`):
```prisma
model WorkspaceInvitation {
  id          String   @id @default(cuid())
  workspaceId String
  email       String
  token       String   @unique @default(cuid())
  role        String   @default("member")
  expiresAt   DateTime
  acceptedAt  DateTime?
  createdAt   DateTime @default(now())

  workspace   Workspace @relation(...)
  @@index([workspaceId])
  @@index([token])
}
```

**New files:**
- `apps/api/src/modules/invitations/` — controller, service, repository, DTOs
- `POST /workspaces/:id/invitations` — create invite (owner only)
- `GET /invitations/:token/accept` — accept invite, add user to workspace, redirect to app
- `apps/web/src/features/settings/WorkspaceSettings.tsx` — invite form + pending invites list

**Risk:** Email delivery (need SMTP/SendGrid). Sprint 3 ships invite link in API response and copies to clipboard; email delivery deferred to Sprint 4.

---

### Feature 3 — Task Search & Filter Bar
**Why third:** The task list grows fast. Filtering is day-1 productivity.

**Acceptance criteria:**
- [ ] Filter bar above the task groups in TasksView: "Status", "Priority", "Assignee" dropdowns + free-text search
- [ ] Active filters shown as removable chips
- [ ] URL search params persist filter state (refresh-safe)
- [ ] API already supports all these params via `TaskFiltersDto` — frontend just needs to wire them
- [ ] Filtered view shows matching tasks across all groups (sprint + backlog)

**Implementation steps:**
1. `apps/web/src/features/tasks/components/TaskFilterBar.tsx` — filter row using the existing `StatusCell`/`PriorityCell` pattern but in "multi-select" mode
2. `apps/web/src/features/tasks/useTaskFilters.ts` — hook that reads/writes URL search params and returns `TaskFilters` object
3. Pass filters into `useTasksList(workspaceId, filters)` — already accepts `TaskFilters`
4. Count badge on filter chips: "3 active filters" reset button

**Risk:** None significant — API already supports all filter params.

---

### Feature 4 — Command Palette (cmd+k)
**Why fourth:** High UX leverage, low backend cost (reuses existing queries).

**Acceptance criteria:**
- [ ] `cmd+k` (or `ctrl+k`) opens a modal overlay from anywhere in the app
- [ ] Fuzzy search across: tasks (title), sprints (name), workspace members (name/email)
- [ ] Keyboard-navigable results (↑↓, Enter to open, Escape to close)
- [ ] Task result → opens TaskDetailPanel; Sprint result → switches to Sprints view; Member → (future)
- [ ] Results grouped by type: Tasks / Sprints / Members with section labels
- [ ] Empty state: "No results for '…'" with suggestion to create task

**Implementation steps:**
1. `apps/web/src/components/CommandPalette.tsx` — full-screen overlay, search input, result list
2. `apps/web/src/hooks/useCommandPalette.ts` — global `keydown` listener, open/close state
3. Mount in `App.tsx` (outside the nav/main layout so it's always available)
4. Reuse `useTasksList` + `useSprintsList` + `useMembers` with client-side fuzzy filter (no new API endpoint needed for MVP)
5. Fuzzy match: simple `title.toLowerCase().includes(query)` for v1; upgrade to `fuse.js` in Sprint 4

**Risk:** Performance on large lists with client-side filter. Mitigated by debounce (150ms) and limiting results to top 5 per category.

---

### Feature 5 — Home / Dashboard View
**Why last:** Nice-to-have for Sprint 3; can slip to Sprint 4 if time-boxed.

**Acceptance criteria:**
- [ ] "Home" nav item added to sidebar between Tasks and Sprints (or as the default landing)
- [ ] Shows: active sprint progress (tasks done/total, % bar), overdue tasks (red count), tasks assigned to me
- [ ] No new API endpoints — uses existing `/tasks` and `/sprints` queries with client-side aggregation
- [ ] Empty state when no active sprint: "No active sprint — create one in Sprints"

**Implementation steps:**
1. Add `'home'` to `NavKey` in `Sidebar.tsx`
2. `apps/web/src/features/home/HomeView.tsx` — 3-panel layout: My Tasks, Active Sprint, Overdue
3. Reuse `useTasksList`, `useSprintsList`, `useMembers` — no new hooks

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Google OAuth credentials not configured | High | Blocks Feature 1 | Document exact Railway vars needed; keep dev-login as fallback |
| Vercel preview URLs change → CORS breaks | High | Low | Already fixed with `*.vercel.app` wildcard CORS rule |
| Invitation email not sent (no SMTP) | Medium | Medium | Sprint 3 ships clipboard copy of invite link; SMTP in Sprint 4 |
| `prisma db push` destroys data on schema change | Low | High | `WorkspaceInvitation` is additive — no existing table touched |

---

## Verification Steps

1. `pnpm typecheck` passes on both `api` and `web`
2. `pnpm test` — all existing 11 tests pass; add:
   - `invitations.service.spec.ts` — create invite, accept invite, expired token rejection
   - `command-palette.test.tsx` — renders, filters results, keyboard nav
3. Manual E2E smoke (Railway + Vercel):
   - Google SSO sign-in creates a new user and redirects to app
   - cmd+k opens palette, typing "set up" surfaces the seeded "Set up monorepo" task
   - Invite flow: create invite → copy link → open in incognito → accept → user appears in OwnerCell
4. `GET /health/db` returns `{"ok":true}` after deploy

---

## Sprint 4 (deferred)

- SMTP / email delivery for invitations
- `fuse.js` fuzzy search in command palette
- Drag-and-drop task ordering within sprint groups
- Activity log / audit trail
- Real-time updates (WebSocket or polling)

---

## File Impact Summary

| File | Change |
|---|---|
| `apps/api/prisma/schema.prisma` | Add `WorkspaceInvitation` model |
| `apps/api/src/modules/invitations/` | New module (4 files) |
| `apps/api/src/modules/auth/auth.service.ts` | Auto-provision workspace on first login |
| `apps/web/src/context/WorkspaceContext.tsx` | Redirect to LoginPage on 401 in prod |
| `apps/web/src/features/auth/LoginPage.tsx` | New: Google sign-in screen |
| `apps/web/src/features/tasks/components/TaskFilterBar.tsx` | New: filter row |
| `apps/web/src/features/tasks/useTaskFilters.ts` | New: URL param filter hook |
| `apps/web/src/features/settings/WorkspaceSettings.tsx` | New: invite form |
| `apps/web/src/components/CommandPalette.tsx` | New: cmd+k overlay |
| `apps/web/src/features/home/HomeView.tsx` | New: dashboard |
| `apps/web/src/components/layout/Sidebar.tsx` | Add Home nav item |
