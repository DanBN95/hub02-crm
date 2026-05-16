# Sprint 0 — Design system foundation

Establishes the visual foundation for hub02-crm so feature PRs have tokens, components, and screen specs to build against. Content-only branch — no dependencies installed, no build config touched (the dev agent owns those in the parallel skeleton PR).

## What's in this PR

### Tokens & styles (`apps/web/src/styles/`)
- **`tokens.css`** — Tailwind v4 `@theme` block. Dark-first OKLCH palette (bg, surface, surface-2, borders, fg ladder, accent indigo, semantic success/warning/danger/info, priority P0–P3). Type scale 11→24, spacing scale `4/8/12/16/20/24/32/40/56/72`, radius (xs→xl + full), shadow (pop / overlay only), motion (fast/base/layout/overlay × ease-out/in/std). Light theme via `[data-theme="light"]` override.
- **`globals.css`** — modern reset, base body, `:focus-visible` ring, dark-friendly scrollbars, `prefers-reduced-motion` honored globally, `kbd` styling.

### Tailwind config (`apps/web/tailwind.config.ts`)
Minimal v4 config — content roots only; theme is sourced from `@theme`. Light-mode opt-in via `data-theme="light"`.

### Reference component (`apps/web/src/components/ui/Button.tsx`)
React 19 component (`forwardRef`, ref-as-prop ready) that consumes the tokens via CSS vars. Four variants (`primary` / `secondary` / `ghost` / `danger`) × three sizes (`sm` / `md` / `lg`). Proves the system works end-to-end. The dev agent can lift this into Storybook / app shell as-is.

### Docs (`docs/`)
- **`design-system.md`** — full spec: principles, all token tables (with contrast notes), component patterns for Button / Input / Select / Badge / Avatar / AvatarStack / Tooltip / Dropdown / Slideover / CommandPalette / DataTable / KanbanCard, keyboard cheat-sheet, empty-state copy bank, toast copy patterns, a11y checklist.
- **`screens/01-login.md`** → **`05-command-palette.md`** — ASCII wireframes + component breakdown + tokens + interactions + a11y for Login, Backlog, Sprint board, Task detail slideover, Command palette.

## Three design decisions worth flagging

1. **Dark-first with explicit `data-theme` opt-in (not `prefers-color-scheme` auto-switch).** Productivity UIs hate surprise theme flips mid-session. Theme is read once at boot from `localStorage` (falling back to system), written to `<html>`, and never changes until the user toggles `t`. This keeps the contract between tokens and components dead simple — one CSS attribute flip.

2. **OKLCH for every color.** Gives us perceptually uniform stepped scales for the gray ladder (so dark/light parity is real, not eyeballed), and saturated-yet-accessible chroma for the accent/priority palette. All contrast notes in the spec are checked against `--color-fg` / `--color-fg-muted` on the canonical surface tokens.

3. **One accent, never two.** The whole app uses a single indigo `oklch(65% 0.18 270)` as accent. Priority gets its own dedicated red/orange/yellow/neutral, and semantic toasts use success/warning/danger/info — but the *brand* color appears only on primary CTAs, focus rings, and selected-row rails. This is what gives Linear-class apps their composed, non-noisy feel; we'd lose it the moment we let teams reach for a second brand color.

## Out of scope

- No dependencies installed (the dev agent's skeleton PR owns `package.json` / lockfile).
- No `index.css` (dev creates that and imports `./styles/tokens.css` + `./styles/globals.css`).
- No build / lint / TS config — all owned by the parallel skeleton PR.
- Storybook intentionally deferred; reference Button + screen specs are enough to unblock feature PRs.

## Test plan

- [ ] Visual smoke once dev's skeleton lands: import `tokens.css` + `globals.css` from `apps/web/src/index.css`; mount `<Button>` variants in App shell; confirm dark renders + `[data-theme="light"]` flips correctly.
- [ ] `:focus-visible` ring shows on `Tab`, hidden on mouse click.
- [ ] Reduced-motion preference collapses transitions.
- [ ] Spec review by R&D manager against the `hub02-designer` skill principles.
