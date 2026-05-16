# Sprint 1 — Task CRUD: Design Spec

> Working spec for the dev agent. Covers every interaction surface needed to create, read, update, and delete tasks in the Backlog view. Cross-reference `docs/design-system.md` for all tokens.

---

## 1. Backlog Table

**Goal:** Scan, sort, and triage every open task in under two seconds. Inline-edit without leaving the list.

### Layout sketch

```
┌─ Backlog · 48 tasks ──────────────────────────────────────────────────── [+ New  n] ──┐
│                                                                                        │
│  ☐ │ ID ↕      │ Title ↕                          │ Status ↕  │ Pri ↕ │ Assignee │ Due ↕    │ Updated ↕  │ ···  │
│ ───┼────────────┼──────────────────────────────────┼───────────┼───────┼──────────┼──────────┼────────────┼───── │
│  ☐ │ HUB-001   │ Wire OAuth callback               │ ▶ DOING   │ ● P0  │ ◌ dan    │ May 23   │ 2h ago     │      │
│  ☐ │ HUB-002   │ Audit Prisma migrations            │ ◼ BACKLOG │ ● P1  │ ◌ noa    │ May 27   │ 1d ago     │      │
│  ☑ │ HUB-003   │ Refactor slideover animation      │ ◼ BACKLOG │ ● P2  │ ◌ liv    │ —        │ 3d ago     │      │
│  ☐ │ HUB-004   │ Add j/k keyboard row navigation   │ ▶ DOING   │ ● P2  │ ◌ dan    │ May 30   │ 4d ago     │      │
│  ☐ │ HUB-005   │ Empty state for /inbox             │ ◼ BACKLOG │ ● P3  │ —        │ —        │ 5d ago     │  ✎ 🗑 │  ← hover row: trailing icons appear
│    │            │                                   │           │       │          │          │            │      │
│    ·  ·  ·                                                                                                        │
│                                                                                                                    │
│  [empty state when 0 rows — see §1.5]                                                                             │
│  [skeleton rows when loading — see §1.6]                                                                           │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

  ╔══════════════════════════════════════════════════════════╗
  ║  3 tasks selected    [Change status ▾]  [Change priority ▾]  [Delete]  ║   ← bulk bar, floats at bottom
  ╚══════════════════════════════════════════════════════════╝
```

### Column order and widths

| # | Column | Width | Notes |
|---|--------|-------|-------|
| 1 | Checkbox | 32px fixed | `<input type="checkbox">` |
| 2 | Identifier | 88px fixed | `HUB-001`, JetBrains Mono, `--text-sm`, `--color-fg-muted` |
| 3 | Title | flex 1 (min 240) | Primary content cell, inline-editable |
| 4 | Status | 100px | Badge, click → dropdown |
| 5 | Priority | 76px | Badge, click → dropdown |
| 6 | Assignee | 80px | Avatar (24px) + name truncated, or `—` |
| 7 | Due date | 88px | Relative when <7d ("in 2d", "yesterday"), absolute otherwise. Red if past due |
| 8 | Updated | 80px | Relative timestamp, `--color-fg-subtle` |
| 9 | Actions | 64px fixed | Hidden by default; appears on row hover |

### Component breakdown

- `<table>` with `<thead>` / `<tbody>` — semantic HTML, not a div grid
- Column headers: `<th scope="col">` with sort button inside; `aria-sort="ascending|descending|none"`
- Sort arrows: 12px chevron icon, `--color-fg-subtle` when inactive, `--color-accent` when active
- Row: `<tr>` with `data-selected` attribute drives selected styling
- Checkbox cell: `<input type="checkbox">` with `aria-label="Select HUB-001"`
- ID cell: `<code>` element, monospace
- Status badge: custom `<Badge variant="status">` (see design-system §7.4)
- Priority badge: custom `<Badge variant="priority">` (see design-system §7.4)
- Assignee: `<Avatar size="sm">` (20px) + name span, or em-dash
- Due date: `<time datetime="...">` element
- Action icons (edit, delete): `<button aria-label="...">` wrapping 16px icon, ghost variant

### Token usage

| Property | Token |
|----------|-------|
| Table background | `--color-surface` |
| Header row background | `--color-surface` (sticky, same bg) |
| Header text | `--text-sm`, `--color-fg-muted`, `letter-spacing: 0.04em`, uppercase |
| Cell text | `--text-base` (13px), `--color-fg` |
| Cell padding | `0 --space-3` (12px horizontal), row height 32px |
| Row divider | 1px `--color-border` |
| Row hover | `background: --color-surface-2`, transition `--duration-fast` |
| Row selected | 2px left accent rail (`--color-accent`), `background: oklch(65% 0.18 270 / 0.07)` |
| Focused row (j/k) | 2px left rail `--color-accent` at 40% opacity |
| Due date overdue | `--color-danger` |
| Due date soon (≤3d) | `--color-warning` |

### Interaction notes

**Hover:**
- Row bg shifts to `--color-surface-2` at `--duration-fast` (120ms)
- Action icons (edit pencil + delete trash) appear in the trailing cell — opacity 0 → 1, 120ms. No layout shift (column width is always reserved)
- Non-hovered action column cells stay empty (no layout jump)

**Click behavior by cell:**
- Checkbox cell: toggles row select only
- ID cell: opens task detail slideover
- Title cell: activates inline edit (contenteditable) — see §3
- Status badge: opens inline dropdown — see §3
- Priority badge: opens inline dropdown — see §3
- Assignee cell: opens assignee picker popover
- Due date cell: opens date picker popover
- Updated cell: no action (tooltip on hover showing exact timestamp)
- Actions cell: edit icon → open slideover; delete icon → inline delete confirm popover (see §4)

**Keyboard navigation:**
| Key | Action |
|-----|--------|
| `j` | Move focus to next row |
| `k` | Move focus to previous row |
| `Enter` | Open detail slideover for focused row |
| `x` | Toggle select on focused row |
| `Shift+x` | Extend selection to focused row |
| `e` | Open detail slideover (same as Enter) |
| `n` | Open Create Task slideover |
| `Delete` / `Backspace` | Trigger delete confirm for selected rows (if ≥1 selected) |
| `Escape` | Clear selection / close any open popover |
| `/` | Focus global search |

**Sort:**
- Click column header to sort ascending; click again for descending; third click removes sort
- Only one column sorted at a time (no multi-sort in Sprint 1)
- Sorted column header shows directional chevron in `--color-accent`

**Optimistic mutations:**
- Status/priority badge flips immediately on select
- On API error: badge rolls back with a translateX shake (`±2px, 120ms × 2`) + error toast
- Toast: "Couldn't save — changes reverted. Retry?" with retry action, `role="alert"`

### Empty state (§1.5)

Render when `tasks.length === 0` and no active filters:

```
┌──────────────────────────────────────────────────┐
│                                                    │
│              ⬚                                     │   ← 32px neutral icon (ClipboardList or similar)
│        Backlog is empty                            │   ← --text-xl, --color-fg, weight 600
│   Press n to add the first task.                  │   ← --text-body, --color-fg-muted
│                                                    │
│              [ + Create task ]                     │   ← primary button, lg size
│                                                    │
└──────────────────────────────────────────────────┘
```

- Icon: `--color-fg-subtle`, 32px
- Heading: `--text-xl` (20px), weight 600, `--color-fg`
- Subtext: `--text-body` (14px), `--color-fg-muted`
- CTA: primary button, `lg` size, same action as `n` shortcut
- Vertical centering: `margin-top: --space-18` (72px) from table header

When filters are active and 0 results:
- Heading: "Nothing matches your filters"
- Subtext: "Try clearing a filter, or create a task that matches."
- CTA: secondary "Clear filters" button

### Loading state (§1.6)

Render 4 skeleton rows while initial data fetches:

```
│  ☐ │ ████████  │ ████████████████████████████   │ ███████  │ ████  │ ██████  │ ███████  │ ██████  │
│  ☐ │ ████████  │ ████████████████████            │ ███████  │ ████  │ ██████  │ ███████  │ ██████  │
│  ☐ │ ████████  │ ███████████████████████████████ │ ███████  │ ████  │ ██████  │ ███████  │ ██████  │
│  ☐ │ ████████  │ ██████████████████████          │ ███████  │ ████  │ ██████  │ ███████  │ ██████  │
```

- Skeleton color: `--color-surface-2` with a shimmer animation (`background-position` slide, 1.2s linear infinite)
- Title column: varying widths (60%, 80%, 95%, 70%) to look natural
- No skeleton for header row — render real headers immediately
- `aria-busy="true"` on `<tbody>` while loading; remove on data arrival

### Accessibility note

- `<table>` semantics required — not a CSS grid. Screen readers announce row/col position.
- `<th scope="col">` on all headers; `<th scope="row">` on ID cell if desired.
- Sort buttons inside `<th>`: `aria-sort` attribute on the `<th>`, not the button.
- Checkbox column: header checkbox = "Select all tasks" (`aria-label`); row checkboxes = "Select HUB-001".
- Action icons in trailing cell: always `aria-label="Edit HUB-001"` / `"Delete HUB-001"` — never icon-only without label.
- Due date colors (red/amber) paired with text ("Overdue" / "Due soon") for non-color signal — append visually-hidden span if truncated.
- Row focus (j/k nav) sets `aria-selected` on `<tr>` + `tabindex="0"` on the row.

---

## 2. Create Task Slideover

**Goal:** Create a new task with the minimum required fields without leaving the backlog context.

### Layout sketch

```
                                    ┌──────────────────────────────────────────────────┐
                                    │ New task                                   ✕ esc  │  ← header, --color-surface bg
                                    ├──────────────────────────────────────────────────┤
                                    │                                                    │
                                    │  Title *                                           │
                                    │  ┌──────────────────────────────────────────────┐ │
                                    │  │ Task title…                                  │ │  ← autofocus, required
                                    │  └──────────────────────────────────────────────┘ │
                                    │  ⚠ Title is required                              │  ← error, hidden until submit attempt
                                    │                                                    │
                                    │  Description                                       │
                                    │  ┌──────────────────────────────────────────────┐ │
                                    │  │                                              │ │
                                    │  │                                              │ │  ← textarea, min 80px, grows to 160px
                                    │  │                                              │ │
                                    │  └──────────────────────────────────────────────┘ │
                                    │                                                    │
                                    │  Status                Priority                    │
                                    │  ┌─────────────────┐  ┌──────────────────────┐   │
                                    │  │ Backlog       ▾ │  │ P2 · Medium       ▾  │   │  ← side-by-side
                                    │  └─────────────────┘  └──────────────────────┘   │
                                    │                                                    │
                                    │  Assignee                                          │
                                    │  ┌──────────────────────────────────────────────┐ │
                                    │  │ Unassigned                               ▾   │ │
                                    │  └──────────────────────────────────────────────┘ │
                                    │                                                    │
                                    │  Sprint                                            │
                                    │  ┌──────────────────────────────────────────────┐ │
                                    │  │ No sprint                                ▾   │ │
                                    │  └──────────────────────────────────────────────┘ │
                                    │                                                    │
                                    │  Due date                                          │
                                    │  ┌──────────────────────────────────────────────┐ │
                                    │  │ Pick a date…                             📅  │ │
                                    │  └──────────────────────────────────────────────┘ │
                                    │                                                    │
                                    ├──────────────────────────────────────────────────┤
                                    │                         [Cancel]  [Create task ⌘↵]│  ← sticky footer
                                    └──────────────────────────────────────────────────┘
```

### Component breakdown

- **Slideover shell**: right-anchored panel, 480px wide, full viewport height, `--radius-xl` on left edge only, `--shadow-overlay`, `--color-bg` background
- **Backdrop**: `oklch(0% 0 0 / 0.32)` scrim behind the panel — clicking it closes (no unsaved-edit guard here since it's creation, not editing)
- **Header**: 48px, `--text-lg` title "New task", close `×` button (ghost, 24px icon)
- **Form body**: scrollable, `--space-5` (20px) padding, `--space-4` (16px) gap between field groups
- **Title field**: `<Input>` full width, autofocus on open, `placeholder="Task title…"`, `required`
- **Description field**: `<Textarea>` full width, `placeholder="Add more detail…"`, `rows=3`, auto-grows to `rows=6` max
- **Status + Priority**: side-by-side `<Select>` controls in a 2-column grid (`gap: --space-3`)
- **Assignee**: `<Combobox>` with avatar rendering in option list; type to filter by name
- **Sprint**: `<Select>` listing active sprints by name + date range
- **Due date**: `<DateInput>` with calendar popover, `--shadow-pop`
- **Footer**: sticky `position: sticky; bottom: 0`, `--color-surface` bg, 1px top border `--color-border`, 16px padding. Buttons right-aligned
- **Cancel button**: ghost variant, md size
- **Create task button**: primary variant, md size, trailing `⌘↵` `<kbd>` hint

### Field defaults

| Field | Default value |
|-------|--------------|
| Status | Backlog |
| Priority | P2 · Medium |
| Assignee | Unassigned |
| Sprint | No sprint |
| Due date | Empty |

### Token usage

| Property | Token |
|----------|-------|
| Panel width | 480px |
| Panel bg | `--color-bg` |
| Panel left-edge radius | `--radius-xl` (12px) |
| Panel shadow | `--shadow-overlay` |
| Scrim | `oklch(0% 0 0 / 0.32)` |
| Entrance animation | `translateX(100%) → translateX(0)`, `--duration-overlay` (280ms), `--ease-out` |
| Exit animation | `translateX(0) → translateX(100%)`, 220ms, `--ease-in` |
| Field label | `--text-sm` (12px), weight 500, `--color-fg-muted` |
| Field input | `--text-body` (14px), `--color-fg` |
| Error text | `--text-sm`, `--color-danger`, appears below field |
| Footer bg | `--color-surface` |
| Footer border-top | 1px `--color-border` |
| Section gap | `--space-4` (16px) |
| Side-by-side gap | `--space-3` (12px) |

### Interaction notes

**Open:**
- Triggered by `n` key or "New task" button in list header
- Panel slides in 280ms from right, backdrop fades in simultaneously
- Title field receives focus immediately (autofocus) — cursor placed at start

**Validation:**
- Errors shown only after first submit attempt, not on blur
- Title error: "Title is required" — appears below the field, `role="alert"`
- Form is invalid if title is empty; all other fields are optional
- Submit button is never disabled (errors surface on attempt, not preemptively)

**Submit flow:**
- `Cmd+Enter` from any field submits
- Click "Create task" submits
- On submit: optimistic — row appears at top of the backlog immediately with a brief highlight pulse (`--color-accent / 0.15` bg, 1.5s fade out), slideover closes
- Toast: "Task created" (success, `role="status"`)
- On API error: slideover stays open, stays populated, error toast: "Couldn't create task. Try again?"

**Close:**
- `Escape` closes — no confirm needed (creation, no dirty-state guard)
- "Cancel" button closes
- Clicking backdrop closes
- All three routes use same 220ms slide-out

**Assignee combobox:**
- Trigger shows avatar + name when assigned, "Unassigned" with neutral avatar placeholder when empty
- Dropdown lists members with 20px avatars
- Type-to-filter: fuzzy match on name
- Keyboard: `↑/↓` navigate, `Enter` selects, `Esc` closes

### Copy

| Element | Copy |
|---------|------|
| Panel header | "New task" |
| Title label | "Title" (with `*` indicator) |
| Title placeholder | "Task title…" |
| Description label | "Description" |
| Description placeholder | "Add more detail…" |
| Status label | "Status" |
| Priority label | "Priority" |
| Assignee label | "Assignee" |
| Sprint label | "Sprint" |
| Due date label | "Due date" |
| Assignee empty | "Unassigned" |
| Sprint empty | "No sprint" |
| Due date placeholder | "Pick a date…" |
| Title error | "Title is required" |
| Cancel button | "Cancel" |
| Submit button | "Create task" |
| Success toast | "Task created" |
| Error toast | "Couldn't create task. Try again?" |

### Accessibility note

- Slideover is `role="dialog"` `aria-modal="true"` `aria-labelledby="create-task-heading"`
- Focus trap: full — Tab cycles only within the panel while open; Shift+Tab reverses
- On close: focus returns to the element that opened the panel (the "New task" button or the row that had keyboard focus)
- `<form>` element wraps all fields for native submit semantics
- Each field has an associated `<label>` via `htmlFor` — no placeholder-as-label
- Required field: `aria-required="true"` + visible asterisk with `<span aria-hidden="true">*</span>` and a screen-reader note "* Required field" at top of form
- Error messages: `aria-describedby` links field to its error `<p id="title-error">`, error has `role="alert"` so it's announced on insert
- Date picker calendar: full keyboard navigation (`↑/↓/←/→` days, `Enter` selects, `Esc` closes)

---

## 3. Task Row Edit (Inline)

**Goal:** Edit title, status, or priority without opening a full panel — keep the user in scanning mode.

### 3a. Title inline edit

```
Before click:
│  ☐ │ HUB-004 │ Add j/k keyboard row navigation          │ ...

After click on title cell:
│  ☐ │ HUB-004 │ [Add j/k keyboard row navigation       ] │ ...
                  └── contenteditable div, border, cursor ──┘
```

**Behavior:**
- Click on title text activates `contenteditable="true"` on the cell's inner div
- Cell gets a visible border: 1px `--color-border-strong` + 2px `--color-accent` focus ring (same as input focus style)
- All text selected on activation (so typing replaces immediately)
- `Enter` commits, closes edit mode, blurs
- `Escape` reverts to original value, blurs
- `blur` event commits (user clicked elsewhere) — treat same as Enter
- Optimistic: value updates in place; rollback on error restores previous value + shake animation
- Empty title on commit: revert to previous value, brief border flash in `--color-danger` (120ms), no error toast (too disruptive for inline)

**Tokens:**
- Editing border: 1px `--color-border-strong`
- Focus ring: `box-shadow: 0 0 0 2px --color-accent`
- Background: `--color-surface-2` while editing
- Transition: `--duration-fast` (120ms) in/out

### 3b. Status badge inline change

```
Click status badge:
┌─────────────────────────┐
│ ◼ BACKLOG               │  ← currently selected, checkmark
│ ▶ IN PROGRESS           │
│ ◉ IN REVIEW             │
│ ✓ DONE                  │
│ ✕ BLOCKED               │
└─────────────────────────┘
```

**Behavior:**
- Click the status badge on the row opens a popover dropdown anchored below the badge
- Popover: `--shadow-pop`, `--radius-md`, `--color-surface` bg, min-width 160px
- Options list: each status option as a 28px-tall item with leading status dot + label
- Current status has a checkmark trailing icon
- Click option: popover closes immediately, badge updates optimistically (120ms flip)
- Keyboard: `↑/↓` navigate options, `Enter` selects, `Esc` closes without change
- Popover closes on outside click or `Esc`
- Only one popover open at a time (opening a second closes the first)

### 3c. Priority badge inline change

Same popover pattern as status. Options:

```
┌──────────────────────────┐
│ ● P0 · Critical          │
│ ● P1 · High              │
│ ● P2 · Medium  ✓         │  ← current
│ ● P3 · Low               │
└──────────────────────────┘
```

- Leading dot uses `--color-priority-p0/p1/p2/p3`
- Label is "P0 · Critical" not just "P0" — always paired with name for non-color signal
- Same optimistic + rollback behavior as status

### Token usage

| Property | Token |
|----------|-------|
| Inline edit border | 1px `--color-border-strong` |
| Inline edit focus ring | `0 0 0 2px --color-accent` |
| Inline edit bg | `--color-surface-2` |
| Popover bg | `--color-surface` |
| Popover shadow | `--shadow-pop` |
| Popover radius | `--radius-md` |
| Popover item height | 28px |
| Popover item hover | `--color-surface-2` |
| Popover item text | `--text-base` (13px) |
| Active option rail | 2px left `--color-accent` |

### Accessibility note

- Title `contenteditable`: `role="textbox"` `aria-label="Task title, editing"` while active; revert to `role="cell"` when inactive
- Status/priority popovers: `role="listbox"` with `aria-label="Change status"` / `"Change priority"`. Options are `role="option"` with `aria-selected` on current value
- Popover focus: first option receives focus on open; `roving tabindex` pattern for arrow key nav
- Popover returns focus to the triggering badge on close

---

## 4. Delete Confirmation (Inline Popover)

**Goal:** Confirm a destructive action without pulling the user into a modal. Anchored, dismissable, fast.

### Layout sketch

```
Delete icon clicked on HUB-003 row:

│  ☐ │ HUB-003 │ Refactor slideover animation   │ ... │  ✎  🗑  │
                                                          │
                                              ┌───────────▼──────────────┐
                                              │ Delete this task?         │  ← --text-body, --color-fg
                                              │ This can't be undone.     │  ← --text-sm, --color-fg-muted
                                              │                           │
                                              │       [Cancel] [Delete]   │  ← ghost + danger buttons
                                              └───────────────────────────┘
```

**Behavior:**
- Clicking the delete trash icon opens this popover anchored to the icon (below or above, whichever has more room)
- Popover width: 240px
- "Cancel" button: ghost, md — closes popover, no action
- "Delete" button: danger variant, md — closes popover, deletes task optimistically
- Optimistic delete: row slides out upward (`height: 0, opacity: 0`, `--duration-layout` 240ms) then removed from DOM
- Toast: "Task deleted. Undo" (with 6s undo action that restores the task)
- `Esc` closes popover without action
- Clicking outside the popover closes it without action
- Only one delete popover open at a time

**Do NOT use:**
- A full-screen modal for single-row delete
- Icon-only danger button without confirmation

### Token usage

| Property | Token |
|----------|-------|
| Popover bg | `--color-surface` |
| Popover border | 1px `--color-border-strong` |
| Popover shadow | `--shadow-pop` |
| Popover radius | `--radius-md` |
| Popover padding | `--space-4` (16px) |
| Heading text | `--text-body` (14px), weight 500, `--color-fg` |
| Subtext | `--text-sm` (12px), `--color-fg-muted` |
| Cancel button | ghost, md |
| Delete button | danger, md |
| Row exit animation | height+opacity collapse, `--duration-layout` (240ms), `--ease-in` |

### Copy

| Element | Copy |
|---------|------|
| Popover heading | "Delete this task?" |
| Popover subtext | "This can't be undone." |
| Cancel button | "Cancel" |
| Delete button | "Delete" |
| Success toast | "Task deleted. Undo" |
| Undo toast action | "Undo" |

### Accessibility note

- Popover is `role="dialog"` `aria-modal="true"` `aria-labelledby="delete-confirm-heading"`
- Focus trap inside the popover: Tab cycles between Cancel and Delete only
- On open: focus moves to "Cancel" button (safer default — reduces accidental deletes)
- On close (any route): focus returns to the delete icon that triggered it
- Delete button: `aria-label="Confirm delete HUB-003"` to give screen reader context
- Row removal: `aria-live="polite"` region announces "Task HUB-003 deleted" after removal

---

## 5. Bulk Action Bar

**Goal:** Apply the same mutation to multiple tasks in one click after multi-selecting rows.

### Layout sketch

```
  (Table rows above — some checked)

  ╔═══════════════════════════════════════════════════════════════════════════╗
  ║  ✕   3 tasks selected        [Change status ▾]  [Change priority ▾]  [Delete]  ║
  ╚═══════════════════════════════════════════════════════════════════════════╝
                           ↑ floats fixed at bottom, centered, 24px from viewport edge
```

### Detailed anatomy

```
┌────────────────────────────────────────────────────────────────────────┐
│  ✕  │  3 tasks selected  │  [Change status ▾]  │  [Change priority ▾]  │  [Delete]  │
└────────────────────────────────────────────────────────────────────────┘
  ↑      ↑ count             ↑ secondary button      ↑ secondary button     ↑ danger btn
  dismiss
```

**Dimensions:**
- Height: 44px
- Padding: 12px vertical, 16px horizontal
- Max-width: 640px, centered horizontally
- Floats `position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%)`
- `--shadow-overlay` shadow
- `--radius-lg` (8px)

**Elements left to right:**
1. `✕` dismiss button (ghost icon-only, 28px, `aria-label="Clear selection"`) — clears all checkboxes
2. `{N} tasks selected` — `--text-body`, weight 500, `--color-fg`, `--space-4` left margin
3. "Change status" dropdown trigger (secondary button, md) — opens full status listbox above the bar
4. "Change priority" dropdown trigger (secondary button, md) — opens full priority listbox above the bar
5. "Delete" danger button (md) — opens a bulk delete confirm: same inline popover pattern but copy adjusts to "Delete 3 tasks?"

**Appearance/disappearance:**
- Bar enters: `translateY(100%) → translateY(0)`, `--duration-layout` (240ms), `--ease-out`
- Bar exits: `translateY(0) → translateY(100%)`, 180ms, `--ease-in`
- Triggers on: first checkbox selected (>0)
- Dismisses on: all checkboxes cleared, `Esc`, or dismiss button

**Bulk status change dropdown:**
- Same options as row-level status dropdown (§3b) but opens upward (anchored above the bar)
- On select: all selected rows' status badges update optimistically
- Toast: "3 tasks moved to In Progress" (or equivalent)

**Bulk priority change dropdown:**
- Same as priority dropdown (§3c) opening upward
- Toast: "3 tasks set to P1 · High"

**Bulk delete:**
- Popover opens upward from the Delete button
- Copy: "Delete 3 tasks?" / "This can't be undone." / Cancel + Delete
- On confirm: all selected rows collapse out, bar disappears
- Toast: "3 tasks deleted. Undo"
- Undo: restores all 3 tasks, reselects them, bar reappears

### Token usage

| Property | Token |
|----------|-------|
| Bar bg | `--color-surface-2` |
| Bar border | 1px `--color-border-strong` |
| Bar shadow | `--shadow-overlay` |
| Bar radius | `--radius-lg` (8px) |
| Count text | `--text-body`, weight 500, `--color-fg` |
| Enter animation | `translateY(100%) → 0`, `--duration-layout`, `--ease-out` |
| Exit animation | `translateY(0) → 100%`, 180ms, `--ease-in` |
| Dismiss icon | 16px, `--color-fg-muted`, ghost button |

### Copy

| Element | Copy |
|---------|------|
| Count label | "{N} task selected" / "{N} tasks selected" (singular/plural) |
| Status button | "Change status" |
| Priority button | "Change priority" |
| Delete button | "Delete" |
| Bulk delete heading | "Delete {N} tasks?" |
| Bulk delete subtext | "This can't be undone." |
| Bulk status toast | "{N} tasks moved to {Status}" |
| Bulk priority toast | "{N} tasks set to {Priority}" |
| Bulk delete toast | "{N} tasks deleted. Undo" |

### Accessibility note

- Bar is `role="region"` `aria-label="Bulk actions"` `aria-live="polite"` — announces selection count changes
- Count text in a `<span aria-atomic="true">` so the full count reads out on change (not just the diff)
- `Escape` clears selection and removes bar — document-level keydown listener, fires only when no other overlay is open
- Dismiss button: `aria-label="Clear selection"` (not "Close" — the user is clearing state, not closing a panel)
- Dropdowns that open upward: `aria-expanded` on trigger, focus moves into listbox on open, returns to trigger on close
- Bulk delete popover: same a11y treatment as single-row delete (§4), with updated `aria-label="Confirm delete 3 tasks"`

---

## Cross-component notes

### Z-index stack

| Layer | Z-index | Elements |
|-------|---------|----------|
| Table | 0 | Default rows |
| Sticky header | 10 | Table `<thead>` |
| Bulk bar | 30 | Fixed bottom bar |
| Popovers (row-level) | 50 | Status/priority/delete popovers |
| Slideover scrim | 70 | Backdrop |
| Slideover panel | 80 | Create task / task detail panel |
| Toasts | 90 | Bottom-right corner |

### Animation choreography (Create Task)

1. `n` pressed → slideover scrim fades in (280ms), panel slides in (280ms) simultaneously
2. Title field autofocuses — no delay
3. User fills form → `Cmd+Enter` → panel slides out (220ms), scrim fades out
4. New row appears at top of table with accent highlight pulse (opacity 0.15 → 0, 1.5s)
5. Toast "Task created" appears bottom-right

### Rollback pattern (all mutations)

1. Optimistic update applied instantly (0ms)
2. API call in flight
3. On success: no UI change needed
4. On error: revert value → shake animation (translateX ±2px, 60ms × 2) → error toast
5. Toast offers "Retry?" inline action

### Popover anchoring rules

- Default: open below trigger
- If <160px below viewport edge: open above trigger
- If open above/below is ambiguous: prefer above (avoids bulk bar overlap)
- Popovers never overlap the bulk action bar

---

*Last updated: Sprint 1 design pass. Review with dev agent before implementation cutover.*
