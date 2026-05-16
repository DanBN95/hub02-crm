# hub02-crm — Design System

> Internal CRM for the Hub02 team. Dark-first. Keyboard-first. Dense but breathable.
> Reference points: **Linear** (chrome), **Vercel** dashboard (surfaces), **Notion** (density), **Height** (motion).

---

## 1. Design principles

From the `hub02-designer` skill — these are non-negotiable:

1. **Function first, beauty earned.** Every screen answers: *what action will the user take in <2 seconds?*
2. **Dense but breathable.** Tight vertical rhythm (4/8/12/16/24px). Body text 13–14px. Whitespace groups; it does not pad for its own sake.
3. **Keyboard-first.** Every primary action has a shortcut. `?` opens cheat-sheet. `cmd+k` is global palette. `n` = new task, `/` = focus search, `e` = edit.
4. **Optimistic everywhere.** UI updates instantly; rollback subtly on failure. No spinners on actions <500ms.
5. **Motion is meaning.** 120–180ms for state, 220–280ms for layout. Ease-out for entrance, ease-in for exit. Never bounce.
6. **Accessibility is default.** WCAG AA contrast. `focus-visible:ring-2` always. Color is never the only signal.

---

## 2. Theming model

- **Dark is default.** Light is opt-in via `<html data-theme="light">`.
- Theme is decided once at app boot from `localStorage("theme")` with `prefers-color-scheme` as fallback, then written to the `<html>` attribute. No flash, no live MQ listener (productivity UIs hate surprise switches).
- All variants and components read CSS variables, so theme switching is a single attribute flip.

---

## 3. Color tokens

All values authored in **OKLCH** for perceptually uniform steps and natural dark/light parity.

| Token | Dark | Light | Usage | Contrast vs fg |
| --- | --- | --- | --- | --- |
| `--color-bg` | `oklch(15% 0 0)` | `oklch(98% 0 0)` | App canvas | — |
| `--color-surface` | `oklch(18% 0 0)` | `oklch(100% 0 0)` | Default panel / table | AA |
| `--color-surface-2` | `oklch(21% 0 0)` | `oklch(96% 0 0)` | Row hover, input bg | AA |
| `--color-border` | `oklch(28% 0 0 / 0.6)` | `oklch(85% 0 0 / 0.8)` | Dividers, default border | n/a |
| `--color-border-strong` | `oklch(38% 0 0 / 0.9)` | `oklch(72% 0 0 / 0.9)` | Focused/active border | n/a |
| `--color-fg` | `oklch(96% 0 0)` | `oklch(18% 0 0)` | Body text | AAA on bg |
| `--color-fg-muted` | `oklch(72% 0 0)` | `oklch(40% 0 0)` | Secondary text | AA on bg |
| `--color-fg-subtle` | `oklch(54% 0 0)` | `oklch(58% 0 0)` | Disabled, captions | AA Large only — never for body |
| `--color-accent` | `oklch(65% 0.18 270)` | `oklch(54% 0.18 270)` | Primary action, focus ring | AA with `--color-accent-fg` |
| `--color-accent-fg` | `oklch(98% 0 0)` | `oklch(98% 0 0)` | Text on accent | — |
| `--color-success` | `oklch(70% 0.16 150)` | `oklch(52% 0.16 150)` | Done, success toast | AA |
| `--color-warning` | `oklch(78% 0.15 75)` | `oklch(62% 0.15 75)` | Due-soon, warning | AA Large |
| `--color-danger` | `oklch(62% 0.22 25)` | `oklch(52% 0.22 25)` | Destructive, error toast | AA |
| `--color-info` | `oklch(70% 0.12 230)` | `oklch(52% 0.12 230)` | Info badges, hints | AA |

### Priority colors

Always paired with the priority **label** (`P0`, `P1`, `P2`, `P3`) — never color alone.

| Token | Value | Use |
| --- | --- | --- |
| `--color-priority-p0` | `oklch(58% 0.23 25)` | Critical — blocking |
| `--color-priority-p1` | `oklch(70% 0.18 50)` | High — this sprint |
| `--color-priority-p2` | `oklch(82% 0.16 90)` | Medium — soon |
| `--color-priority-p3` | `oklch(60% 0 0)` | Low — nice-to-have |

---

## 4. Type scale

Font stacks: `--font-sans` = Inter, `--font-mono` = JetBrains Mono.

| Token | Size | Weight | Line-height | Use |
| --- | --- | --- | --- | --- |
| `--text-xs` | 11px | 500 | 1.25 | Meta, kbd hints, badge |
| `--text-sm` | 12px | 500 | 1.3 | Secondary, table header |
| `--text-base` | 13px | 400 | 1.4 | **Table cell (default)** |
| `--text-body` | 14px | 400 | 1.45 | Default UI body |
| `--text-lg` | 16px | 600 | 1.35 | Section heading |
| `--text-xl` | 20px | 600 | 1.3 | Page title |
| `--text-2xl` | 24px | 700 | 1.25 | Empty-state header |

Numeric data uses `font-variant-numeric: tabular-nums`. IDs and slugs are mono.

---

## 5. Spacing scale

Strict adherence — no off-grid spacing.

| Token | px | Where |
| --- | --- | --- |
| `--space-1` | 4 | Icon ↔ label inside a chip |
| `--space-2` | 8 | Default inline gap |
| `--space-3` | 12 | Compact stack gap |
| `--space-4` | 16 | Standard padding |
| `--space-5` | 20 | Card padding |
| `--space-6` | 24 | Section gap |
| `--space-8` | 32 | Major section gap |
| `--space-10` | 40 | Page gutter (compact) |
| `--space-14` | 56 | Page gutter (wide) |
| `--space-18` | 72 | Empty-state vertical breathing |

---

## 6. Radius / shadow / motion

**Radius**: `xs 3` · `sm 4` · `md 6` (default) · `lg 8` (cards) · `xl 12` (slideovers) · `full`.

**Shadow** (minimal):

- `--shadow-pop` — dropdowns, popovers.
- `--shadow-overlay` — slideovers, command palette.
- Cards have **no** shadow; rely on `--color-border`.

**Motion**:

| Token | Use |
| --- | --- |
| `--duration-fast` 120ms / `--ease-out` | Hover, press, badge flip |
| `--duration-base` 180ms / `--ease-out` | Default UI state, toast |
| `--duration-layout` 240ms / `--ease-std` | Row insert, column reorder |
| `--duration-overlay` 280ms / `--ease-out` (in) / `--ease-in` (out) | Slideover, palette |

Reduced motion is honored globally — all transitions collapse to ~0ms.

---

## 7. Component patterns

### 7.1 Button

| Variant | Use | Spec |
| --- | --- | --- |
| `primary` | One per view max (commit, save, send) | `bg-accent`, `accent-fg`, no border |
| `secondary` | Most actions (filter, sort, add) | `surface-2`, `border`, hover lifts border |
| `ghost` | Tertiary / icon-in-row | transparent, hover `surface-2` |
| `danger` | Destructive — always paired with confirm | `bg-danger`, `danger-fg` |

| Size | Height | Padding | Text |
| --- | --- | --- | --- |
| `sm` | 24 | 8 | 12px |
| `md` (default) | 28 | 12 | 13px |
| `lg` | 32 | 16 | 14px |

States: default → hover (filled bg shift) → active (1px Y translate) → focus-visible (2px ring, 2px offset) → disabled (50% opacity, no cursor) → loading (`aria-busy`, spinner replaces leading icon).

### 7.2 Input

- Height matches Button md (28).
- `bg: surface-2`, `border: border`. On focus: `border-strong` + 2px accent ring with no offset (so the ring hugs the field).
- Placeholder is `fg-subtle`. Error variant adds 1px danger border + helper text below in `--color-danger`.
- All inputs have a visible label (or `aria-label`) — placeholder is never the label.

### 7.3 Select / Combobox

- Trigger looks identical to Input.
- Listbox is a `--shadow-pop` popover, max-height 320, scroll inside.
- Active option: `surface-2` bg + 2px left accent rail. Selected: checkmark trailing.
- `cmd+enter` confirms, `esc` closes, `↑/↓` navigates.

### 7.4 Badge

Two flavors:

- **Priority** — pill, 18px tall, 11px text, leading colored dot + `P0/P1/P2/P3` label.
- **Status** — rectangular, 4px radius, 11px text uppercase letterspaced (`tracking-wide`). Colors map to status family (`backlog → fg-subtle`, `in-progress → accent`, `review → info`, `done → success`, `blocked → danger`).

### 7.5 Avatar

- Sizes: `xs 16` · `sm 20` · `md 24` (default) · `lg 32`.
- Square with `--radius-md` (Linear-style). Initials when no image — color seeded by user id hash.
- Always has `aria-label="<user name>"`.

### 7.6 AvatarStack

- Max **5** visible, overlap by 6px.
- Overflow rendered as a neutral `+N` chip matching avatar size.
- The whole stack is a single focusable group; activating opens a popover list of names.

### 7.7 Tooltip

- 180ms open delay, 60ms close.
- `--color-surface-2` bg, 1px `--color-border`, 11px text, max-width 240.
- Never use a tooltip to host actionable controls — those go in a popover.

### 7.8 Dropdown menu

- `--shadow-pop`, `--radius-md`, 6px outer padding.
- Items: 28px tall, 13px text, optional leading icon (16) and trailing `<kbd>` for shortcut.
- Section dividers are 1px `--color-border` with 4px vertical breathing.
- Destructive items render in `--color-danger`.

### 7.9 Slideover (task detail)

- Right-anchored, 480px (compact) / 640px (default) / 920px (wide). User-resizable.
- Enters with `--duration-overlay` / `--ease-out`, exits with `--ease-in`.
- Scrim is `oklch(0% 0 0 / 0.32)` and **does not** close on outside click for tasks with unsaved edits (prevents accidental data loss).
- `esc` closes; `cmd+enter` saves and closes.

### 7.10 Command Palette

- Triggered by `cmd+k` / `ctrl+k` globally.
- 640px wide, top-anchored at 12% viewport height. `--shadow-overlay`, `--radius-xl`.
- Single input row + grouped results: **Tasks · Sprints · People · Actions**.
- Fuzzy match with bold highlight on matched chars. Action items show their shortcut as trailing `<kbd>`.
- Empty query shows recent items (max 6).

### 7.11 DataTable row

- Row height 32px. Cells 12px horizontal padding.
- Header row: 28px, 12px text, `--color-fg-muted`, sticky.
- Row hover: `--color-surface-2`. Selected: 2px left accent rail + faint accent tint.
- Inline edit on cell click; `enter` commits, `esc` reverts.
- `j/k` navigates rows, `x` toggles select, `shift+x` extends selection, `e` opens slideover.

### 7.12 KanbanCard

- Width fills column (min 240, max 320). Padding 12. Radius `lg`.
- Top row: priority pill (left) + due indicator (right, only if `dueAt <= now + 3d`).
- Title: `--text-body`, 2-line clamp, weight 500.
- Bottom row: AvatarStack (assignees) + comment count + subtask count (each with a leading icon for non-color signal).
- Hover: `--color-surface-2` + cursor grab. Dragging: `--shadow-pop`, 1deg tilt (subtle).

---

## 8. Keyboard shortcuts (cheat-sheet)

| Scope | Keys | Action |
| --- | --- | --- |
| Global | `cmd+k` / `ctrl+k` | Open command palette |
| Global | `?` | Show shortcuts |
| Global | `g` then `b` | Go to Backlog |
| Global | `g` then `s` | Go to Sprint board |
| Global | `g` then `i` | Go to Inbox |
| Global | `/` | Focus search |
| Global | `n` | New task |
| Global | `t` | Toggle theme |
| List | `j` / `k` | Next / previous row |
| List | `x` | Toggle select |
| List | `shift+x` | Extend selection |
| List | `e` | Open detail slideover |
| List | `cmd+enter` | Mark done |
| Detail | `esc` | Close slideover |
| Detail | `cmd+enter` | Save + close |
| Detail | `c` | Focus comment composer |

---

## 9. Empty-state copy bank

Never "No data". Each state offers a next step.

1. **Backlog empty** — *"Backlog is empty. Press `n` to add the first task."*
2. **Sprint empty** — *"No tasks in this sprint yet. Drag from the backlog, or press `n`."*
3. **No search results** — *"Nothing matches `{query}`. Try fewer words, or `cmd+k` for actions."*
4. **No assigned tasks** — *"You're caught up. Take a walk, or pick from the backlog."*
5. **No comments** — *"Be the first to comment — `c` to start typing."*

---

## 10. Toast copy patterns

| Kind | Pattern | Example |
| --- | --- | --- |
| Loading | (avoid; show inline) | — |
| Success | Past-tense, no exclamation | "Task created" · "Sprint closed" · "3 tasks moved" |
| Error | Plain, what + how to recover | "Couldn't save — your changes are kept. Retry?" |
| Info | One line, no emoji | "You're viewing a closed sprint." |
| Undo | Append `Undo` action, 6s lifetime | "Task archived. Undo" |

Style: `--color-surface-2` bg, 1px `--color-border`, `--shadow-pop`, `--radius-md`, max-width 360, bottom-right anchor. Stack up to 3, then collapse to `+N`.

---

## 11. Accessibility checklist

- [ ] Every interactive element reachable by `Tab` in logical order.
- [ ] Focus ring (`:focus-visible`) is visible against the element's background.
- [ ] Color contrast ≥ 4.5:1 for body text, ≥ 3:1 for UI / large text.
- [ ] Color is never the only signal — pair with icon or text.
- [ ] All form fields have an associated `<label>` or `aria-label`.
- [ ] Icon-only buttons have `aria-label`. Decorative icons have `aria-hidden`.
- [ ] Live regions: toasts use `role="status"`, errors use `role="alert"`.
- [ ] Slideovers and dialogs trap focus and restore it on close.
- [ ] Drag-and-drop has a keyboard alternative (Space to pick up, arrows to move, Space to drop, Esc to cancel).
- [ ] Animations respect `prefers-reduced-motion`.
- [ ] `lang` is set on `<html>`. Page titles are unique and meaningful.

---

## 12. File map

```
apps/web/
├── tailwind.config.ts
└── src/
    ├── styles/
    │   ├── tokens.css      ← all tokens (@theme)
    │   └── globals.css     ← reset, base, focus, scrollbars
    └── components/
        └── ui/
            └── Button.tsx  ← reference implementation
docs/
├── design-system.md        ← this file
└── screens/
    ├── 01-login.md
    ├── 02-backlog.md
    ├── 03-sprint-board.md
    ├── 04-task-detail.md
    └── 05-command-palette.md
```
