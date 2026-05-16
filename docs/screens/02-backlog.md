# Screen 02 — Backlog (table)

**Goal:** Scan and triage every open task. Bulk edit. Open detail without losing context.

## Layout

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ ▣ hub02   [ Backlog ▾ ]   ⌕ search…    ⌘K       ⚙  ●dan          │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Sidebar │ Backlog · 142 tasks                              [+ New  n] [Group ▾] [⋯]   │
│ ─────── │ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ ◉ Inbox │ │ ☐ │ ID    │ Title                          │ Pri │ Status │ Assignee │ … │
│ ▤ Back  │ │───┼───────┼─────────────────────────────────┼─────┼────────┼──────────┤   │
│ ▥ Sprnt │ │ ☐ │ H-128 │ Wire OAuth callback             │ ●P0 │ ▶ Doing│ ◌ dan    │   │
│ ◫ Done  │ │ ☐ │ H-127 │ Audit Prisma migrations         │ ●P1 │ ◼ Back │ ◌ noa    │   │
│ ─────── │ │ ☑ │ H-126 │ Refactor task slideover anim    │ ●P2 │ ◼ Back │ ◌ liv    │   │
│ Sprints │ │ ☐ │ H-125 │ Add j/k row nav                 │ ●P2 │ ▶ Doing│ ◌ dan    │   │
│ ▸ S-07  │ │ ☐ │ H-124 │ Empty state for /inbox          │ ●P3 │ ◼ Back │ —        │   │
│ ▸ S-06  │ │   …                                                                   │   │
│ ─────── │ └──────────────────────────────────────────────────────────────────────────┘ │
│ Labels  │  ┌──────── 1 selected ────────────────────────────────┐                     │
│ ● bug   │  │ [Move to sprint] [Assign…] [Priority ▾] [Archive] │  ← bulk bar         │
│ ● infra │  └────────────────────────────────────────────────────┘                     │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

## Component breakdown

- **TopBar** (48px): logo, workspace switcher, global search, `cmd+k` hint, settings, profile.
- **Sidebar** (220px, collapsible to 56px): nav, sprints tree, labels.
- **List header**: title + count, primary `New` button (kbd hint `n`), grouping select, overflow.
- **DataTable**:
  - Sticky header row, 28px tall.
  - Rows 32px, hover `--color-surface-2`, selected = accent rail + faint tint.
  - Columns: `select`, `id (mono)`, `title (inline-edit)`, `priority (Badge)`, `status (Badge)`, `assignee (Avatar)`, `due`, `updated`. User-reorderable via column header drag.
- **Bulk action bar** (28px tall, floats above bottom of viewport with `--shadow-pop`) appears when ≥1 selected. Disappears on `esc`.

## Tokens

- Table cell text: `--text-base` (13px).
- Header text: `--text-sm`, `--color-fg-muted`, uppercase letterspaced.
- Row dividers: 1px `--color-border`.
- Bulk bar: `--color-surface-2`, `--radius-md`, `--shadow-pop`.

## Interaction

- `j/k`: move cursor (visible 2px left rail in `--color-accent` at 40% opacity).
- `x`: toggle select on cursor row; `shift+x`: range select.
- Click on title cell: inline edit. Click anywhere else on row: select. Double-click row: open slideover. `e` on cursor row: open slideover.
- Group/sort changes animate row reorder over `--duration-layout` with `--ease-std`.
- Optimistic mutations: priority/status change flips the badge immediately; rollback with subtle shake (translateX ±2px, 120ms ×2) on error + toast.

## Empty state

> Backlog is empty. Press `n` to add the first task.

## A11y

- Table uses `<table>` semantics with `<thead>/<tbody>`, sortable headers expose `aria-sort`.
- Row select cells use real `<input type="checkbox">`.
- Bulk bar is `role="region"` `aria-label="Bulk actions"` and announces selection count via `aria-live="polite"`.
- Inline edit field gets focus and selects all text on open.
