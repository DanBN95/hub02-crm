# Screen 04 — Task detail (slideover)

**Goal:** Read and edit a task without losing the list/board context behind it.

## Layout

```
                                       ┌─────────────────────────────────────────┐
                                       │ H-128                  ⌕ ⤢   ✕ esc      │
                                       ├─────────────────────────────────────────┤
   (backlog table visible              │ # Wire OAuth callback              [✎]  │
    behind a 32% scrim, still          │                                          │
    interactive on click outside       │ Assignee  ◌ dan ledger          [▾]      │
    UNLESS unsaved edits)              │ Priority  ●P0 Critical          [▾]      │
                                       │ Status    ▶ Doing               [▾]      │
                                       │ Sprint    S-07                  [▾]      │
                                       │ Due       Fri, May 23                    │
                                       │ Labels    [infra] [auth] [+]             │
                                       ├─────────────────────────────────────────┤
                                       │ Description                              │
                                       │ ────────────────────────────────         │
                                       │ Markdown editor (inline-edit on click).  │
                                       │ Press e to start. cmd+enter to save.     │
                                       ├─────────────────────────────────────────┤
                                       │ Subtasks   2 of 4                        │
                                       │  ☑ Wire /auth/google                     │
                                       │  ☑ Persist session                       │
                                       │  ☐ Handle non-hub02 accounts             │
                                       │  ☐ Tests                                 │
                                       │  + Add subtask                           │
                                       ├─────────────────────────────────────────┤
                                       │ Activity                                 │
                                       │  · dan moved to Doing · 2h ago           │
                                       │  · noa commented · 4h ago                │
                                       │  ────────                                │
                                       │  Comments                                │
                                       │  ◌ noa  "Blocked on prisma migration"   │
                                       │  ◌ dan  "Migration shipped — unblock"   │
                                       │ ┌─────────────────────────────────────┐  │
                                       │ │ Write a comment…           c        │  │
                                       │ └─────────────────────────────────────┘  │
                                       │                          [Send  ⌘↵]      │
                                       └─────────────────────────────────────────┘
```

## Component breakdown

- **Slideover** (default 640px). Header: ID (mono), search-within-task icon, expand/contract, close.
- **Title row**: inline-editable `<h1>` (`--text-xl`, weight 600). Pencil icon appears on hover.
- **Meta grid**: 2-column key/value. Keys `--color-fg-muted`, values are interactive controls (Select / DatePicker / Combobox).
- **Description**: Markdown editor (read-mode by default, click or `e` to enter edit).
- **Subtasks**: simple checklist; drag to reorder; `enter` on composer adds.
- **Activity + Comments**: reverse-chronological, system events as one-liners, comments as cards with avatar + body + reactions.
- **Composer**: textarea, `cmd+enter` sends, `esc` blurs.

## Tokens

- Slideover bg: `--color-bg`. Scrim: `oklch(0% 0 0 / 0.32)`.
- Section dividers: 1px `--color-border` with 16px breathing.
- Inline-edit hover: faint `--color-surface-2` background to signal affordance.

## Interaction

- Open: 280ms slide-in (`--ease-out`).
- Close: 220ms slide-out (`--ease-in`). `esc` closes; if unsaved edits exist, show confirm: *"Discard your edits?"* with `Discard` (danger) and `Keep editing` (secondary).
- Click outside scrim: same close logic.
- All field changes are optimistic; failed mutations rollback with toast.
- `cmd+enter` from any field saves the current change and closes the slideover.

## Empty states

- No description: *"No description yet. Press `e` to add one."*
- No subtasks: hide the section header — show only the `+ Add subtask` row.
- No comments: *"Be the first to comment — `c` to start typing."*

## A11y

- Slideover is `role="dialog"` `aria-modal="false"` (non-blocking) with `aria-labelledby` on the title.
- Focus trap is **soft**: tabbing past last control wraps within the slideover, but clicks outside still work. `esc` always closes.
- Each meta control has a visible label (the key cell acts as `<label>` via `aria-labelledby`).
- Comments list is `aria-live="polite"` for new arrivals.
