# Sprint 2 — Sprint Board (Kanban View): Design Spec

> Working spec for the dev agent. Covers every interaction surface of the Kanban board: sprint selector, columns, task cards, drag-and-drop, task detail slideover, and empty states. Cross-reference `docs/design-system.md` for all tokens.

---

## 1. Sprint Selector (Top Bar)

**Goal:** Orient the user to the active sprint at a glance, expose progress, and make switching sprints a one-click action.

### Layout sketch

```
┌─ Sprint Board ──────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                          │
│  Sprint 2 · May 12 – May 25  ▾     ████████████████░░░░░░░░  14 / 20 tasks done     [+ New sprint]      │
│                                                                                                          │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
   ↑                              ↑                              ↑                     ↑
   Sprint name + date range       Progress bar (filled/empty)    Count label           Action button
   click → sprint switcher
   dropdown
```

### Component breakdown

- **Bar container**: `position: sticky; top: 0`, 56px tall, `--color-surface` bg, 1px bottom border `--color-border`, `z-index: var(--z-sticky)`, full-width, `padding: 0 var(--space-6)` (0 24px), flex row, `align-items: center`, `gap: var(--space-5)` (20px)
- **Sprint name trigger**: `<button>` — sprint name in `--text-lg` (16px) weight 600 `--color-fg`, separator `·` in `--color-fg-subtle`, date range in `--text-base` (13px) `--color-fg-muted`, trailing chevron-down icon 12px `--color-fg-subtle`. Hover: bg `--color-surface-2`, `--radius-sm`. Click: opens sprint switcher dropdown (see §1.1)
- **Progress bar**: 160px wide, 6px tall, `--radius-full`. Track: `--color-surface-2`. Fill: `--color-accent`. Fill width is `(doneTasks / totalTasks) * 100%`, min fill 0%, max 100%. If sprint is complete (100%): fill switches to `--color-success`. Animated on mount: width `0 → final`, `--duration-layout` (240ms), `--ease-out`
- **Count label**: `{done} / {total} tasks done` — `--text-sm` (12px), `--color-fg-muted`
- **Spacer**: `flex: 1` (pushes button to right edge)
- **"New sprint" button**: secondary variant, sm size, `+ New sprint` label. Click: opens "Create sprint" dialog (out of scope for this sprint — button exists, emits `onNewSprint` event, no further spec here)

### Sprint switcher dropdown (§1.1)

Clicking the sprint name trigger opens a popover anchored below-left of the trigger:

```
┌─────────────────────────────────────────────────┐
│  Sprint 1  May 1 – May 11     ✓ complete         │
│  Sprint 2  May 12 – May 25    ● active  ✓        │  ← current sprint, checkmark
│  Sprint 3  May 26 – Jun 8     ○ planned           │
│ ─────────────────────────────────────────────── │
│  + New sprint                                    │
└─────────────────────────────────────────────────┘
```

- Popover: `--shadow-pop`, `--radius-md`, `--color-surface` bg, 1px border `--color-border`, min-width 280px, `--z-dropdown`
- Each sprint row: 36px tall, padding `0 --space-3` (12px), flex row, `align-items: center`, `gap: --space-3`
  - Sprint name: `--text-base` (13px), `--color-fg`, weight 500
  - Date range: `--text-sm` (12px), `--color-fg-muted`
  - Status pill: `--text-xs` (11px) uppercase, `--radius-full`, 4px horizontal padding. Complete: `--color-success` bg, `--color-success-fg` text. Active: `--color-accent` bg, `--color-accent-fg` text. Planned: `--color-surface-2` bg, `--color-fg-muted` text
  - Checkmark: 12px, `--color-accent`, trailing, visible only on selected sprint
  - Row hover: bg `--color-surface-2`, transition `--duration-fast`
- Divider: 1px `--color-border`, `margin: --space-1 0`
- "+ New sprint" footer item: `--text-base`, `--color-accent`, leading `+` icon

### Token usage

| Property | Token |
|----------|-------|
| Bar bg | `--color-surface` |
| Bar border-bottom | 1px `--color-border` |
| Bar height | 56px |
| Bar padding | `0 var(--space-6)` (0 24px) |
| Bar z-index | `var(--z-sticky)` |
| Sprint name | `--text-lg` (16px), weight 600, `--color-fg` |
| Date range | `--text-base` (13px), `--color-fg-muted` |
| Progress bar track | `--color-surface-2` |
| Progress bar fill | `--color-accent` |
| Progress bar fill (100%) | `--color-success` |
| Progress bar height | 6px |
| Progress bar width | 160px |
| Progress bar radius | `--radius-full` |
| Count label | `--text-sm` (12px), `--color-fg-muted` |
| Dropdown shadow | `--shadow-pop` |
| Dropdown radius | `--radius-md` |
| Dropdown row height | 36px |

### Keyboard shortcuts

| Key | Action |
|-----|--------|
| `s` | Open sprint switcher dropdown |
| `↑ / ↓` (in dropdown) | Navigate sprint options |
| `Enter` (in dropdown) | Switch to focused sprint |
| `Escape` | Close dropdown, return focus to trigger |

### Accessibility notes

- Sprint name trigger: `<button aria-haspopup="listbox" aria-expanded="true|false" aria-controls="sprint-switcher-list">`
- Dropdown: `role="listbox"` `aria-label="Switch sprint"`, each option `role="option"` `aria-selected="true|false"`
- Active sprint option: `aria-selected="true"`
- Progress bar: `<div role="progressbar" aria-valuenow="{done}" aria-valuemin="0" aria-valuemax="{total}" aria-label="Sprint progress: {done} of {total} tasks done">`
- Count label paired with progress bar via `aria-describedby`

---

## 2. Kanban Columns

**Goal:** Present all five workflow statuses as scannable vertical lanes. Each column is independently scrollable. Columns do not scroll horizontally away — the board itself scrolls if needed.

### Layout sketch

```
┌─ Board canvas (overflow-x: auto, full height below top bar) ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                                                                                                      │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐                                                                      │
│  │ BACKLOG    [  3] │   │ TODO       [  5] │   │ IN PROGRESS [ 4]│   │ IN REVIEW  [  2]│   │ DONE       [  6]│                                                                      │
│  ├─────────────────┤   ├─────────────────┤   ├─────────────────┤   ├─────────────────┤   ├─────────────────┤                                                                      │
│  │ ┌─────────────┐ │   │ ┌─────────────┐ │   │ ┌─────────────┐ │   │ ┌─────────────┐ │   │ ┌─────────────┐ │                                                                      │
│  │ │  Task card  │ │   │ │  Task card  │ │   │ │  Task card  │ │   │ │  Task card  │ │   │ │  Task card  │ │                                                                      │
│  │ └─────────────┘ │   │ └─────────────┘ │   │ └─────────────┘ │   │ └─────────────┘ │   │ └─────────────┘ │                                                                      │
│  │ ┌─────────────┐ │   │ ┌─────────────┐ │   │ ┌─────────────┐ │   │ ┌─────────────┐ │   │ ┌─────────────┐ │                                                                      │
│  │ │  Task card  │ │   │ │  Task card  │ │   │ │  Task card  │ │   │ │  Task card  │ │   │ │  Task card  │ │                                                                      │
│  │ └─────────────┘ │   │ └─────────────┘ │   │ └─────────────┘ │   │ └─────────────┘ │   │ └─────────────┘ │                                                                      │
│  │                 │   │                 │   │                 │   │                 │   │                 │                                                                      │
│  │ [empty state]   │   │    · · ·        │   │    · · ·        │   │    · · ·        │   │    · · ·        │                                                                      │
│  │                 │   │                 │   │                 │   │                 │   │                 │                                                                      │
│  ├─────────────────┤   ├─────────────────┤   ├─────────────────┤   ├─────────────────┤   ├─────────────────┤                                                                      │
│  │  + Add task     │   │  + Add task     │   │  + Add task     │   │  + Add task     │   │  + Add task     │                                                                      │
│  └─────────────────┘   └─────────────────┘   └─────────────────┘   └─────────────────┘   └─────────────────┘                                                                      │
│                                                                                                                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Column structure

- **Board canvas**: `display: flex; flex-direction: row; gap: var(--space-3)` (12px); `padding: var(--space-4)` (16px); `overflow-x: auto; min-height: calc(100vh - 56px - header-height)`. Background: `--color-bg`
- **Column**: `display: flex; flex-direction: column; width: 280px; flex-shrink: 0; border-radius: var(--radius-lg)`; `background: --color-surface`; 1px border `--color-border`. Column height: fills board canvas, no fixed height — card list scrolls within

#### Column header

- Height: 40px, `padding: 0 var(--space-3)` (12px), flex row, `align-items: center`, `gap: var(--space-2)` (8px), border-bottom 1px `--color-border`
- **Status label**: `--text-xs` (11px), `letter-spacing: var(--tracking-wide)` (0.02em), `text-transform: uppercase`, `font-weight: 600`, `--color-fg-muted`
- **Count badge**: pill, `--radius-full`, min-width 20px, height 18px, `padding: 0 6px`, `--text-xs` (11px), `font-weight: 600`, centered text. Background: `--color-surface-2`. Text: `--color-fg-muted`. When count > 0 and column is IN_PROGRESS: badge bg `--color-accent`, text `--color-accent-fg` to signal active work
- Spacer: `flex: 1`
- **Column menu** (optional): icon-only ghost button, 24px, `⋯` (ellipsis), `--color-fg-subtle`, visible on column hover. Opens a small popover: "Sort by priority" / "Sort by due date" / "Collapse column" (all deferred — button exists in Sprint 2, actions fire `console.warn` stub)

#### Column body

- `flex: 1; overflow-y: auto; padding: var(--space-2)` (8px); `display: flex; flex-direction: column; gap: var(--space-2)` (8px)
- Scrollbar: styled — track `transparent`, thumb `--color-border`, `width: 4px`, appears only on hover of the column body
- **Drop zone state** (while dragging a card): column body gets `outline: 2px solid var(--color-accent); outline-offset: -2px; border-radius: var(--radius-md); background: oklch(65% 0.18 270 / 0.06)`, transition `--duration-fast`

#### Column footer

- Height: 36px, `padding: 0 var(--space-2)` (8px), flex row, `align-items: center`, border-top 1px `--color-border`
- Collapsed state: `+ Add task` as a ghost-like text button — `--text-sm` (12px), `--color-fg-subtle`, leading `+` icon 12px. Full-width. Hover: text `--color-accent`, bg `--color-surface-2`, transition `--duration-fast`
- Expanded state (on click): footer expands to 52px; inline `<input>` appears at full column width, `--text-base` (13px), `--color-fg`, bg `--color-surface-2`, 1px border `--color-accent`, `--radius-sm`, `padding: --space-2 --space-3`. Trailing `[Esc]` dim hint. `Enter` creates task with title = input value, status = this column's status, sprint = active sprint. `Escape` collapses. On create: card appears at bottom of column with a 600ms accent highlight pulse

### Column status mapping

| Column | Status constant | Label | Header text color | Count badge variant |
|--------|----------------|-------|-------------------|---------------------|
| 1 | `BACKLOG` | Backlog | `--color-fg-muted` | default |
| 2 | `TODO` | To Do | `--color-fg-muted` | default |
| 3 | `IN_PROGRESS` | In Progress | `--color-fg-muted` | accent (`--color-accent` bg) |
| 4 | `IN_REVIEW` | In Review | `--color-fg-muted` | default |
| 5 | `DONE` | Done | `--color-fg-muted` | default |

### Token usage

| Property | Token |
|----------|-------|
| Board canvas bg | `--color-bg` |
| Board canvas padding | `var(--space-4)` (16px) |
| Column gap | `var(--space-3)` (12px) |
| Column width | 280px |
| Column bg | `--color-surface` |
| Column border | 1px `--color-border` |
| Column radius | `--radius-lg` (8px) |
| Header height | 40px |
| Header label | `--text-xs`, uppercase, `--tracking-wide`, weight 600, `--color-fg-muted` |
| Count badge bg | `--color-surface-2` |
| Count badge text | `--color-fg-muted` |
| Count badge (IN_PROGRESS) | bg `--color-accent`, text `--color-accent-fg` |
| Body padding | `var(--space-2)` (8px) |
| Card gap | `var(--space-2)` (8px) |
| Drop zone outline | 2px `--color-accent`, `--radius-md` |
| Drop zone bg | `oklch(65% 0.18 270 / 0.06)` |
| Footer height | 36px |
| Footer "Add task" text | `--text-sm`, `--color-fg-subtle` |
| Footer hover text | `--color-accent` |
| Inline input border | 1px `--color-accent` |
| Inline input bg | `--color-surface-2` |

### Keyboard shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Move focus between columns (column header receives focus) |
| `n` | Open "Add task" inline input in the currently focused column |
| `Enter` (on inline input) | Create task |
| `Escape` (on inline input) | Collapse inline input |

### Accessibility notes

- Each column is a `<section aria-label="{Status name} — {count} tasks">`
- Column header is an `<h2>` (or `<h3>` if page-level heading exists for "Sprint Board")
- Card list is `role="list"` inside the column body; each card is `role="listitem"`
- The board as a whole is `role="region" aria-label="Sprint board"` wrapping all columns
- `aria-live="polite"` on count badges — announces when a card moves into/out of that column
- Drop zones: `aria-dropeffect="move"` on column body while a drag is active (HTML5 DnD spec)
- Inline input: `aria-label="New task title for {Status name}"`, `aria-expanded` on footer trigger button

---

## 3. Task Card

**Goal:** Surface the most scannable task fields in the least vertical space. Clicking anywhere opens the full detail slideover.

### Layout sketch

```
┌──────────────────────────────────────────┐
│  ● P1  Wire OAuth redirect callback      │   ← priority dot + title
│                                          │
│  ◌ dan          May 23                   │   ← assignee avatar + name  |  due date badge
└──────────────────────────────────────────┘
  ↑ 8px padding all sides
```

Wider view with all fields:

```
┌───────────────────────────────────────────────────────┐
│  ● P0  ·  Migrate Prisma schema before deploy          │   row 1: priority dot · title
│                                                        │
│  ◌ liv                              ⚠ May 10           │   row 2: assignee   (spacer)  due date (overdue = red)
└───────────────────────────────────────────────────────┘
```

### Component breakdown

- **Card root**: `<div role="button" tabindex="0">` (since the whole card is clickable). `background: --color-surface-2`. `border: 1px solid --color-border`. `border-radius: var(--radius-md)` (6px). `padding: var(--space-2) var(--space-3)` (8px 12px). `display: flex; flex-direction: column; gap: var(--space-1)` (4px). `cursor: pointer`
- **Row 1 — Priority + Title**:
  - `display: flex; align-items: flex-start; gap: var(--space-1)` (4px)
  - **Priority dot**: 8px circle, `border-radius: --radius-full`, `flex-shrink: 0`, `margin-top: 4px` (optical center with text). Color: `--color-priority-p0/p1/p2/p3`
  - **Title**: `--text-base` (13px), weight 500, `--color-fg`, `line-height: --leading-snug` (1.35), max 2 lines then `overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical`
- **Row 2 — Assignee + Due date**:
  - `display: flex; align-items: center; gap: var(--space-2)` (8px)
  - **Assignee**: 20px circle avatar (`border-radius: --radius-full`, bg `--color-accent`, text `--color-accent-fg`, `--text-xs` (11px) initials, weight 600) + name truncated `--text-sm` (12px) `--color-fg-muted`. When unassigned: dash `—`, `--color-fg-subtle`
  - **Spacer**: `flex: 1`
  - **Due date badge**: only rendered if `dueAt` is set. Format: "May 23" (month + day, `--text-xs` 11px). Normal: `--color-fg-subtle`. Overdue (past today): `--color-danger`, leading warning icon 10px. Due within 3 days: `--color-warning`

### Card states

- **Default**: as above
- **Hover**: `border-color: --color-border-strong`, `background: oklch(21% 0 0 / 0.9)` (slightly lighter surface-2), shadow `0 2px 8px -2px oklch(0% 0 0 / 0.3)`, transition `--duration-fast` (120ms)
- **Focus** (keyboard): `outline: var(--ring-width) solid var(--color-accent); outline-offset: var(--ring-offset)` — standard focus ring, no custom box-shadow needed
- **Dragging** (card being dragged): original position shows a placeholder — a ghost slot of same height as the card, `background: --color-surface-2`, `border: 2px dashed --color-border`, `border-radius: --radius-md`, `opacity: 0.4`. The floating drag preview: card rendered at 60% opacity, `box-shadow: --shadow-overlay`, `transform: rotate(1.5deg)` to signal "picked up"
- **Pressed** (`mousedown` / `pointerdown`): `transform: scale(0.98)`, `--duration-fast`

### Token usage

| Property | Token |
|----------|-------|
| Card bg | `--color-surface-2` |
| Card border | 1px `--color-border` |
| Card radius | `--radius-md` (6px) |
| Card padding | `var(--space-2) var(--space-3)` (8px 12px) |
| Card hover border | `--color-border-strong` |
| Card hover shadow | `0 2px 8px -2px oklch(0% 0 0 / 0.3)` |
| Card hover transition | `--duration-fast` (120ms) |
| Card drag opacity | 60% |
| Card drag rotation | `rotate(1.5deg)` |
| Card drag shadow | `--shadow-overlay` |
| Placeholder border | 2px dashed `--color-border` |
| Placeholder opacity | 0.4 |
| Title | `--text-base` (13px), weight 500, `--color-fg` |
| Title line clamp | 2 lines |
| Priority dot size | 8px |
| Priority P0 | `--color-priority-p0` |
| Priority P1 | `--color-priority-p1` |
| Priority P2 | `--color-priority-p2` |
| Priority P3 | `--color-priority-p3` |
| Assignee avatar size | 20px |
| Assignee avatar bg | `--color-accent` |
| Assignee name | `--text-sm` (12px), `--color-fg-muted` |
| Due date normal | `--text-xs` (11px), `--color-fg-subtle` |
| Due date overdue | `--color-danger` |
| Due date soon (≤3d) | `--color-warning` |
| Focus ring | `var(--ring-width)` solid `var(--color-accent)`, offset `var(--ring-offset)` |

### Keyboard shortcuts (card-level)

| Key | Action |
|-----|--------|
| `Enter` or `Space` | Open task detail slideover |
| `Escape` | Return focus to column (deselect card) |

### Accessibility notes

- Card root: `role="button" tabindex="0" aria-label="{title}, {priority}, assigned to {assignee}, due {dueAt}"` — rich label gives screen reader context without visual clutter
- Priority dot: `aria-hidden="true"` — color is supplementary; priority value is in the `aria-label` above
- Overdue due date: `aria-label="Due date: May 10, overdue"` — not relying on color alone
- Drag operation: see §4 for full drag-and-drop accessibility treatment

---

## 4. Drag and Drop

**Goal:** Move a card between columns (status change) or within a column (reorder by position) with immediate optimistic feedback and graceful rollback.

### Interaction model

The board uses the HTML5 Drag and Drop API wrapped in a `useDragAndDrop` hook. Cards are `draggable="true"`. Columns and the card list within them are valid drop targets.

### Drag lifecycle

```
1. pointerdown  →  no action yet (could be a click)
2. pointermove > 4px  →  drag starts
   - original card slot: replace with dashed placeholder (same height)
   - drag preview: card clone, 60% opacity, rotate(1.5deg), --shadow-overlay
   - cursor: grabbing
3. dragover column  →  column body gets drop zone highlight (accent outline + tinted bg)
   - insert indicator line: 2px `--color-accent` horizontal line between cards where the drop would land
4. drop
   a. Same column: reorder — update `position` field for affected cards optimistically
   b. Different column: update `status` optimistically + position in new column
   - placeholder animates to height 0 (--duration-base 180ms)
   - card "snaps" into new slot (drop animation: translateY from ghost position, --duration-base, --ease-out)
5. Error (API failure)
   - card returns to original position with shake animation (translateX ±4px, 100ms × 2)
   - toast: "Couldn't move task — changes reverted."
```

### Visual states detail

**Drag preview (ghost card floating with cursor):**
```
┌──────────────────────────────────────────┐   ← box-shadow: --shadow-overlay
│  ● P1  Wire OAuth redirect callback      │   ← opacity: 0.6
│                                          │   ← transform: rotate(1.5deg)
│  ◌ dan          May 23                   │
└──────────────────────────────────────────┘
   (follows cursor with ~2px offset from grab point)
```

**Drop indicator (insertion line between cards):**
```
│ [card above]          │
│                       │
│ ━━━━━━━━━━━━━━━━━━━━━ │   ← 2px --color-accent horizontal rule, full column width minus padding
│                       │
│ [card below]          │
```

**Active drop zone column:**
```
┌─────────────────┐
│ IN PROGRESS [ 4]│   ← column header unchanged
├─────────────────┤
│                 │   ← column body: outline 2px --color-accent, bg tinted
│ [card]          │
│ ━━━━━━━━━━━━━━━ │   ← insertion line
│ [card]          │
│                 │
└─────────────────┘
```

**Placeholder where card was picked up:**
```
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐   ← dashed border --color-border, opacity 0.4
   (same height as original card)
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```

### Animation spec

| Event | Animation |
|-------|-----------|
| Drag start | Placeholder appears instantly; ghost fades in `opacity: 0 → 0.6`, `--duration-fast` (120ms) |
| Drag over new column | Drop zone highlight fades in, `--duration-fast` |
| Drop | Ghost disappears; card materializes in new slot — `translateY(-8px) → translateY(0)`, `--duration-base` (180ms), `--ease-out` |
| Cancel (Escape / drop outside) | Ghost returns to origin: `translate back, opacity 0.6 → 1`, `--duration-base`, `--ease-out`; placeholder collapses `height → 0`, `--duration-base` |
| API error | Card shakes `translateX ±4px` × 2, 100ms each, then returns to pre-drag position |

### Token usage

| Property | Token |
|----------|-------|
| Drop zone outline | 2px `--color-accent` |
| Drop zone outline offset | -2px |
| Drop zone bg tint | `oklch(65% 0.18 270 / 0.06)` |
| Insertion line | 2px solid `--color-accent` |
| Ghost opacity | 60% |
| Ghost rotation | `rotate(1.5deg)` |
| Ghost shadow | `--shadow-overlay` |
| Placeholder border | 2px dashed `--color-border` |
| Placeholder opacity | 0.4 |
| Drop animation | `translateY(-8px) → 0`, `--duration-base` (180ms), `--ease-out` |
| Cancel animation | translate back, `--duration-base`, `--ease-out` |
| Error shake | `±4px`, 100ms × 2 |

### Optimistic update rules

1. On drop: mutate local state immediately (`status` and/or `position` update)
2. Fire API call in background (`PATCH /tasks/{id}` with `{ status, position }`)
3. On success: no-op (local state already correct)
4. On error: revert all affected cards to pre-drag state, show error toast

**Position recalculation on reorder within column:**
- Cards store a `position` integer. On drop between card A (position 100) and card B (position 200), assign dropped card `position = Math.round((100 + 200) / 2) = 150`
- When gap is too small (< 2), trigger a batch normalization call that spreads all positions to multiples of 1000 (background, transparent to user)

### Accessibility notes (keyboard drag-and-drop)

Drag-and-drop is mouse/touch only. Keyboard users have an alternative:

- Focused card: `Space` opens a "Move card" context menu:
  ```
  ┌─────────────────────────────┐
  │ Move to…                    │
  │   Backlog                   │
  │   To Do                     │
  │   In Progress    ✓ current  │
  │   In Review                 │
  │   Done                      │
  └─────────────────────────────┘
  ```
  - `role="menu"` `aria-label="Move task to column"`, items are `role="menuitem"`
  - Selecting a column fires the same optimistic status update
  - `Escape` closes without action; `Enter` / `Space` selects focused item
- `aria-grabbed="true"` on the drag source during HTML5 drag (deprecated but retained for legacy AT support)
- `aria-dropeffect="move"` on valid drop targets
- Live region `role="status"` announces moves: "Wire OAuth callback moved to In Review"

---

## 5. Task Detail Slideover

**Goal:** View and edit all task fields in context without losing the board. The panel slides in from the right, overlaying (not pushing) the board.

### Layout sketch

```
                                          ┌──────────────────────────────────────────────────────┐
                                          │                                            ✕ esc       │  ← 48px header
                                          │ ─────────────────────────────────────────────────── │
                                          │                                                       │
                                          │  Wire OAuth redirect callback                         │  ← h2, click-to-edit title
                                          │                                                       │
                                          │  ┌─────────────────────────────────────────────────┐ │
                                          │  │ Add a description…                              │ │  ← textarea, auto-grow
                                          │  │                                                 │ │
                                          │  └─────────────────────────────────────────────────┘ │
                                          │                                                       │
                                          │  Status              Priority                         │
                                          │  ┌──────────────┐   ┌───────────────────┐            │
                                          │  │ ▶ In Progress│   │ ● P1 · High       │            │  ← click → popover
                                          │  └──────────────┘   └───────────────────┘            │
                                          │                                                       │
                                          │  Assignee                                             │
                                          │  ◌ dan  Danielle Benita                ▾             │  ← avatar picker row
                                          │                                                       │
                                          │  Sprint                                               │
                                          │  ┌─────────────────────────────────────────────────┐ │
                                          │  │ Sprint 2 · May 12 – 25                      ▾   │ │
                                          │  └─────────────────────────────────────────────────┘ │
                                          │                                                       │
                                          │  Due date                                             │
                                          │  ┌─────────────────────────────────────────────────┐ │
                                          │  │ May 23                                      📅  │ │
                                          │  └─────────────────────────────────────────────────┘ │
                                          │                                                       │
                                          ├───────────────────────────────────────────────────────┤
                                          │  [Delete task]                    [Cancel] [Save ⌘↵] │  ← sticky footer
                                          └──────────────────────────────────────────────────────┘
                                              ↑ danger, left                    ↑ ghost  ↑ primary
                                                                                          (disabled when no changes)
```

### Component breakdown

**Panel shell:**
- `position: fixed; right: 0; top: 0; height: 100vh; width: 520px`
- `background: --color-bg`
- `border-left: 1px solid --color-border`
- `border-radius: var(--radius-xl) 0 0 var(--radius-xl)` (12px on left edges only)
- `box-shadow: --shadow-overlay`
- `z-index: var(--z-overlay)` (40)
- Entrance: `translateX(100%) → translateX(0)`, `--duration-overlay` (280ms), `--ease-out`
- Exit: `translateX(0) → translateX(100%)`, 220ms, `--ease-in`

**Backdrop:**
- `position: fixed; inset: 0; background: oklch(0% 0 0 / 0.32); z-index: var(--z-overlay) - 1`
- Fade in: `opacity: 0 → 1`, `--duration-overlay`, simultaneously with panel slide
- Fade out: `opacity: 1 → 0`, 220ms
- Click on backdrop: close slideover. Guard: if dirty (unsaved changes) → show inline discard confirmation (see §5.1)

**Header (48px):**
- Flex row, `align-items: center`, `padding: 0 var(--space-5)` (0 20px), border-bottom 1px `--color-border`
- Left: task ID in monospace `--text-sm`, `--color-fg-subtle` (e.g. `HUB-007`)
- Spacer: `flex: 1`
- Close button: ghost icon-only, 28px, `×` icon, `aria-label="Close task detail"`. `Escape` key also closes

**Form body (scrollable):**
- `flex: 1; overflow-y: auto; padding: var(--space-5)` (20px); `display: flex; flex-direction: column; gap: var(--space-5)` (20px)

**5a. Title field:**
- Rendered as `<h2>` by default, `--text-xl` (20px), weight 600, `--color-fg`, `line-height: --leading-tight`
- Click → switches to `<textarea>` (single-line behavior via `rows=1` + `resize: none` + `overflow: hidden`; auto-expands for long titles)
- Editing: `border: 1px solid --color-accent`, bg `--color-surface-2`, `--radius-sm`, `padding: --space-1 --space-2`, same font as `<h2>` for visual continuity
- `Escape`: revert, collapse back to `<h2>`
- `Enter`: commit title (do NOT insert newline), collapse back to `<h2>`
- `blur`: commit if non-empty, else revert
- Empty title: revert to previous, brief `border-color: --color-danger` flash (120ms)
- Changes tracked in `dirtyFields` set — drives Save button state

**5b. Description field:**
- `<textarea>`, full width, `min-height: 80px`, auto-grows up to `240px` then scrolls
- `placeholder: "Add a description…"`, `--text-body` (14px), `--color-fg`
- Idle: no visible border (ghost style) — focus: 1px border `--color-accent` + focus ring
- `blur` commits change to `dirtyFields`

**5c. Status badge (click-to-edit):**
- Rendered as a pill badge using same `TaskStatusBadge` component as BacklogView
- Click → opens a popover (same design as §3b in Sprint 1 spec, anchored below the badge)
- Status options: BACKLOG / TODO / IN_PROGRESS / IN_REVIEW / DONE
- Selecting an option closes popover, updates badge immediately, marks status dirty

**5d. Priority badge (click-to-edit):**
- `TaskPriorityBadge` component
- Click → opens popover (same design as §3c in Sprint 1 spec)
- Priority options: P0 Critical / P1 High / P2 Medium / P3 Low
- Selecting an option closes popover, updates badge immediately, marks priority dirty

**Status + Priority layout:**
- Side-by-side in a 2-column grid: `display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3)` (12px)
- Each cell: `display: flex; flex-direction: column; gap: var(--space-1)` (4px)
- Field label above badge: `--text-sm` (12px), weight 500, `--color-fg-muted`

**5e. Assignee picker:**
- Rendered as: avatar (20px) + name + trailing chevron. Full-width trigger, `--radius-md`, `padding: --space-2 --space-3`, bg `--color-surface-2`, 1px border `--color-border`
- Click → opens an assignee popover (dropdown list of workspace members):
  ```
  ┌──────────────────────────────────┐
  │ 🔍 Search members…               │   ← input, autofocus
  ├──────────────────────────────────┤
  │ ◌ dan   Danielle Benita    ✓    │   ← current
  │ ◌ noa   Noa Raviv                │
  │ ◌ liv   Livia Stern               │
  │ ─────────────────────────────── │
  │   Unassign                        │
  └──────────────────────────────────┘
  ```
  - Search input: autofocus, filters list by name substring
  - Each member row: 32px tall, 20px avatar + name `--text-base`, checkmark on current assignee
  - "Unassign" footer item removes assignee (shows `—` in trigger)
  - Popover: `--shadow-pop`, `--radius-md`, `--color-surface` bg, 1px `--color-border`, `z-index: var(--z-dropdown)`, width 240px

**5f. Sprint selector:**
- Same dropdown as §1.1 sprint switcher, constrained to the panel width
- Trigger: sprint name + date range + chevron, `--color-surface-2` bg, 1px `--color-border`, `--radius-md`
- Options show all sprints; selecting changes the sprint field; marks sprint dirty

**5g. Due date picker:**
- Trigger: date string or "No due date" placeholder, `--color-fg-muted` if empty, trailing calendar icon 14px `--color-fg-subtle`
- Click → opens a calendar popover:
  - Month grid, `--shadow-pop`, `--radius-md`, 280px wide
  - Current date highlighted with `--color-accent` dot beneath
  - Selected date: `background: --color-accent`, text `--color-accent-fg`, `--radius-full`
  - Navigation: prev/next month buttons (chevron icons, ghost style)
  - "Clear" link below calendar removes due date
  - Keyboard: `↑↓←→` moves day selection, `Enter` confirms, `Escape` closes without change

**Sticky footer (48px):**
- `position: sticky; bottom: 0`, `background: --color-surface`, border-top 1px `--color-border`, `padding: 0 var(--space-5)` (0 20px), flex row, `align-items: center`
- Left: **Delete task** — danger text-button (not a full button variant — just `color: --color-danger`, `--text-body`, `font-weight: 500`, hover underline). Click: opens inline delete confirmation popover anchored above the button (same pattern as Sprint 1 §4, copy: "Delete this task?" / "This can't be undone." / Cancel + Delete). On delete: slideover closes, card removed from board with collapse animation, toast "Task deleted. Undo"
- Right group: `gap: var(--space-2)` (8px)
  - **Cancel** — ghost variant, md size. Click: if no dirty fields → close immediately. If dirty fields → show discard confirmation (see §5.1)
  - **Save** — primary variant, md size, trailing `⌘↵` `<kbd>` hint. Disabled state when `dirtyFields.size === 0` — `opacity: 0.4`, `cursor: not-allowed`. Active when ≥1 field changed. Click or `Cmd+Enter`: save all dirty fields, close slideover, show success toast

### Dirty state guard (§5.1)

If the user tries to close the panel (backdrop click, Escape, Cancel) while `dirtyFields.size > 0`:

```
                                                         ┌──────────────────────────────┐
                                                         │ Discard changes?              │
                                                         │ You have unsaved edits.       │
                                                         │                               │
                                                         │       [Keep editing] [Discard]│
                                                         └──────────────────────────────┘
```

- Popover anchored near the close button or Cancel button, whichever triggered it
- "Keep editing" (ghost, md): closes popover, returns focus to panel — no data lost
- "Discard" (danger, md): closes popover + slideover, reverts all changes
- Not a blocking modal — the user can still scroll/interact outside if the popover is dismissed via `Escape`

### Animation spec

| Event | Animation |
|-------|-----------|
| Open | Panel: `translateX(100%) → 0`, 280ms, `--ease-out`. Backdrop: `opacity 0 → 1`, 280ms |
| Close | Panel: `translateX(0) → 100%`, 220ms, `--ease-in`. Backdrop: `opacity 1 → 0`, 220ms |
| Title toggle (h2 → textarea) | Border fades in `--duration-fast` (120ms); no layout jump (font size identical) |
| Save success | Panel slides out (220ms), board card updates in place with 600ms accent highlight pulse |
| Field popover open | `opacity 0 → 1` + `translateY(-4px) → 0`, `--duration-base` (180ms), `--ease-out` |
| Field popover close | `opacity 1 → 0` + `translateY(0) → -4px`, `--duration-fast` (120ms), `--ease-in` |

### Token usage

| Property | Token |
|----------|-------|
| Panel width | 520px |
| Panel bg | `--color-bg` |
| Panel border-left | 1px `--color-border` |
| Panel left-edge radius | `--radius-xl` (12px) |
| Panel shadow | `--shadow-overlay` |
| Panel z-index | `var(--z-overlay)` (40) |
| Scrim bg | `oklch(0% 0 0 / 0.32)` |
| Scrim z-index | `var(--z-overlay) - 1` (39) |
| Entrance | `translateX(100%) → 0`, `--duration-overlay` (280ms), `--ease-out` |
| Exit | `translateX(0) → 100%`, 220ms, `--ease-in` |
| Header height | 48px |
| Task ID text | `--text-sm` (12px), monospace, `--color-fg-subtle` |
| Title (h2) | `--text-xl` (20px), weight 600, `--color-fg` |
| Title editing border | 1px `--color-accent` |
| Title editing bg | `--color-surface-2` |
| Description | `--text-body` (14px), `--color-fg` |
| Description focus border | 1px `--color-accent` |
| Description min-height | 80px |
| Description max-height | 240px |
| Field label | `--text-sm` (12px), weight 500, `--color-fg-muted` |
| Field section gap | `var(--space-5)` (20px) |
| Status+Priority grid gap | `var(--space-3)` (12px) |
| Assignee trigger bg | `--color-surface-2` |
| Assignee trigger border | 1px `--color-border` |
| Footer bg | `--color-surface` |
| Footer border-top | 1px `--color-border` |
| Footer height | 48px |
| Delete task text | `--color-danger`, `--text-body`, weight 500 |
| Save disabled opacity | 0.4 |

### Keyboard shortcuts

| Key | Action |
|-----|--------|
| `Escape` | Close panel (dirty-state guard if needed) |
| `Cmd+Enter` / `Ctrl+Enter` | Save changes |
| `Tab` | Move focus to next field |
| `Shift+Tab` | Move focus to previous field |
| `Enter` on title `<h2>` | Activate title edit |
| `Enter` on title `<textarea>` | Commit title (no newline) |
| `Escape` on title `<textarea>` | Revert title |

### Accessibility notes

- Panel: `role="dialog" aria-modal="true" aria-labelledby="task-detail-title"`
- `id="task-detail-title"` on the `<h2>` title element
- Focus trap: full — Tab cycles only within the panel while open; Shift+Tab reverses
- On open: focus moves to the title `<h2>` (or first interactive element if title non-editable)
- On close: focus returns to the card that triggered the open
- `<form>` wraps all editable fields for semantic grouping
- Each field: explicit `<label htmlFor="...">` — no placeholder-as-label
- Title (h2 → textarea): `aria-label="Task title, editing"` while textarea is active
- Status/priority badges: `role="button" aria-haspopup="listbox" aria-expanded="..."` — same as backlog row (Sprint 1 §3)
- Assignee popover: `role="listbox" aria-label="Select assignee"`, members `role="option"`
- Calendar: `role="grid"` with `aria-label="Due date picker"`, day cells `role="gridcell"`, selected date `aria-selected="true"`
- Delete danger button: `aria-label="Delete this task"` (descriptive, not just "Delete")
- Save button: `aria-disabled="true"` when no dirty fields (not `disabled` so it remains focusable and announces its state)
- Discard guard popover: `role="alertdialog" aria-modal="true"` (more urgent than `dialog` since unsaved data is at risk)

---

## 6. Empty Column State

**Goal:** Inform the user the column is empty and give them a fast path to add content. Should not feel broken — just ready.

### Layout sketch

```
┌─────────────────┐
│ DONE        [ 0]│   ← column header (unchanged)
├─────────────────┤
│                 │
│                 │
│     ⬚           │   ← 24px icon, --color-fg-subtle
│   No tasks      │   ← --text-sm (12px), --color-fg-subtle
│  + Add task     │   ← --text-sm (12px), --color-accent, cursor pointer, underline on hover
│                 │
│                 │
├─────────────────┤
│  + Add task     │   ← footer (unchanged)
└─────────────────┘
```

### Component breakdown

- **Container**: `flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--space-2)` (8px); `padding: var(--space-6)` (24px); min-height 120px
- **Icon**: status-specific icon, 24px, `--color-fg-subtle`
  - BACKLOG: clipboard icon
  - TODO: check-circle-empty icon
  - IN_PROGRESS: play-circle icon (or loading circle)
  - IN_REVIEW: eye icon
  - DONE: check-circle-filled icon
- **"No tasks" text**: `--text-sm` (12px), `--color-fg-subtle`, `text-align: center`
- **"+ Add task" link**: `--text-sm` (12px), `--color-accent`, no underline by default, underline on hover, `cursor: pointer`. Click: triggers the same inline input as the column footer "+ Add task" (§2, column footer)

### Token usage

| Property | Token |
|----------|-------|
| Container padding | `var(--space-6)` (24px) |
| Container min-height | 120px |
| Icon size | 24px |
| Icon color | `--color-fg-subtle` |
| "No tasks" text | `--text-sm` (12px), `--color-fg-subtle` |
| "+ Add task" link | `--text-sm` (12px), `--color-accent` |
| "+ Add task" hover | underline |

### Accessibility notes

- Empty state container: `aria-label="{Status name} column is empty"` on the region — supplements the column `<section>` label with a richer state description
- "+ Add task" link: `<button>` (not `<a>`) with `aria-label="Add task to {Status name}"` — gives screen readers the column context
- Icon: `aria-hidden="true"` — decorative, not meaningful information

---

## Cross-component notes

### Z-index stack

| Layer | Z-index | Elements |
|-------|---------|----------|
| Board canvas | 0 | Default column / card layout |
| Top bar (sprint selector) | `var(--z-sticky)` (10) | Sticky sprint bar |
| Drag ghost (card preview) | 20 | Card being dragged |
| Column popovers (status, assignee…) | `var(--z-dropdown)` (30) | Field-level popovers within slideover |
| Slideover scrim | 39 | Backdrop behind task detail panel |
| Slideover panel | `var(--z-overlay)` (40) | Task detail right panel |
| Modals (discard guard) | `var(--z-modal)` (50) | Alertdialog for unsaved changes |
| Toasts | `var(--z-toast)` (60) | Bottom-right corner |

### Animation choreography (full open-edit-save flow)

```
1. User clicks card
   → board dims slightly (backdrop opacity 0 → 0.32, 280ms)
   → panel slides in from right (translateX 100% → 0, 280ms, ease-out)
   → focus moves to title h2

2. User edits title, changes status
   → title h2 → textarea transition (120ms)
   → status badge popover opens (180ms ease-out)
   → Save button activates (opacity 0.4 → 1, 120ms)

3. User presses Cmd+Enter
   → panel slides out (220ms, ease-in), backdrop fades (220ms)
   → card in board updates in place: status badge flips immediately
   → card flashes accent highlight (bg 0.15 → 0, 600ms)
   → toast "Changes saved" appears bottom-right
   → focus returns to the card
```

### Optimistic update rules (task detail)

1. On Save: all `dirtyFields` mutations fire immediately in local state
2. One PATCH request per field group (batch if API supports, else sequential)
3. On success: no-op (local state is already correct); toast confirms
4. On error: revert all fields to pre-edit values; toast "Couldn't save — changes reverted. Retry?"
5. Retry action in toast: re-opens slideover with the same dirty-field values pre-populated

### Popover anchoring rules

- Default: open below trigger
- If < 180px below visible area: open above trigger
- Popovers from within the slideover never exceed the slideover's right edge; anchored left-aligned to the trigger
- Sprint switcher dropdown in the top bar: always opens downward (sufficient room guaranteed)

---

*Last updated: Sprint 2 design pass. Review with dev agent before implementation cutover.*
