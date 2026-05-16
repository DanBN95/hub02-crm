# Screen 05 — Command palette

**Goal:** Jump to anything or do anything in <2 seconds without leaving the keyboard.

## Layout

```
            ┌─────────────────────────────────────────────────────────────┐
            │ ⌕  type a command or search…                       esc  ⎋  │
            ├─────────────────────────────────────────────────────────────┤
            │ Tasks                                                       │
            │   H-128  Wire OAuth callback                  ●P0   ▶       │
            │   H-125  Add j/k row nav                      ●P2   ▶       │
            │   H-099  Audit Prisma migrations              ●P1   ◼       │
            │                                                             │
            │ Sprints                                                     │
            │   S-07   Current sprint                                     │
            │   S-06   Closed · last week                                 │
            │                                                             │
            │ People                                                      │
            │   ◌ dan ledger                                              │
            │   ◌ noa avraham                                             │
            │                                                             │
            │ Actions                                                     │
            │   + New task                                       n        │
            │   ⤴ Go to Sprint board                             g s      │
            │   ◐ Toggle theme                                   t        │
            ├─────────────────────────────────────────────────────────────┤
            │ ↑↓ navigate   ↵ open   ⌘↵ open in new pane   esc close      │
            └─────────────────────────────────────────────────────────────┘
```

## Component breakdown

- **Container**: 640px wide, top-anchored at 12% viewport height. `--color-surface`, `--radius-xl`, 1px `--color-border`, `--shadow-overlay`. Scrim `oklch(0% 0 0 / 0.4)`.
- **Search input**: borderless, 44px tall, `--text-lg`, leading magnifier icon, trailing `esc` kbd hint.
- **Result groups**: section title in `--text-xs` uppercase letterspaced `--color-fg-muted`.
- **Result row**: 32px tall, leading icon/ID (mono), label, optional trailing metadata (priority badge, status icon, kbd shortcut).
- **Footer hint row**: 32px, `--color-fg-subtle`, `--text-xs`, kbd glyphs.

## Tokens

- Active row: `--color-surface-2` bg + 2px left accent rail.
- Match highlight: weight 600, color `--color-fg` (unmatched chars stay `--color-fg-muted`).
- Animation: scrim fades 180ms; panel slides 8px up + fades 220ms (`--ease-out`). Exit: 160ms (`--ease-in`).

## Interaction

- Open: `cmd+k` / `ctrl+k` from anywhere (except text inputs unless modifier is held).
- `↑/↓` and `tab`/`shift+tab` move between rows (skipping group headers).
- `enter` activates the row. `cmd+enter` opens task/sprint in a side pane instead of replacing context.
- `esc` closes; if query is non-empty, first `esc` clears the query, second closes.
- Empty query: show **Recent** (max 6) — recently viewed tasks/sprints/people. Mixed group.
- Async results: fuzzy match runs locally first; remote search after 180ms debounce, results merge in-place (no flicker — replace only changed rows).
- Errors: inline footer pill in `--color-danger`, *"Search is offline — showing local matches."*

## Empty state

> Nothing matches `{query}`. Try fewer words, or press `↵` to create a task with this title.

## A11y

- `role="dialog"` `aria-modal="true"` `aria-label="Command palette"`.
- Input is `role="combobox"` with `aria-expanded`, `aria-controls` pointing at the listbox.
- Results list is `role="listbox"`; each row is `role="option"` with `aria-selected`.
- `aria-activedescendant` mirrors the keyboard cursor so the input keeps focus and AT announces the active option.
- Restores focus to the previously focused element on close.
