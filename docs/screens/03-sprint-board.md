# Screen 03 — Sprint board (Kanban)

**Goal:** See the sprint at a glance. Move work across status with drag or keyboard.

## Layout

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ ▣ hub02   [ Sprint S-07 ▾ ]   ⌕ search…   ⌘K              ⚙  ●dan                     │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Sidebar │ Sprint S-07 · ends in 4d        [+ New  n]  [Filter ▾]  [Group: Status ▾]   │
│         │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                 │
│         │ │ Backlog │ │ Doing   │ │ Review  │ │ Done    │ │ Blocked │                 │
│         │ │   12    │ │   5     │ │   3     │ │   8     │ │   1     │                 │
│         │ ├─────────┤ ├─────────┤ ├─────────┤ ├─────────┤ ├─────────┤                 │
│         │ │┌───────┐│ │┌───────┐│ │┌───────┐│ │┌───────┐│ │┌───────┐│                 │
│         │ ││●P0  ⚠ ││ ││●P1    ││ ││●P2    ││ ││●P3    ││ ││●P0    ││                 │
│         │ ││Wire   ││ ││Audit  ││ ││Refac- ││ ││Init   ││ ││Vendor ││                 │
│         │ ││OAuth  ││ ││Prisma ││ ││tor    ││ ││repo   ││ ││key    ││                 │
│         │ ││ ◌◌◌+2 ││ ││ ◌     ││ ││ ◌◌    ││ ││ ◌     ││ ││ ◌     ││                 │
│         │ ││ 💬3 ✓2 ││ ││ 💬1   ││ ││ 💬0   ││ ││ 💬5   ││ ││ 💬2   ││                 │
│         │ │└───────┘│ │└───────┘│ │└───────┘│ │└───────┘│ │└───────┘│                 │
│         │ │ + add   │ │ + add   │ │ + add   │ │         │ │         │                 │
│         │ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘                 │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

## Component breakdown

- **Sprint header**: name + countdown chip (turns warning at <2d, danger at overdue).
- **Column**: 288px wide, `--color-surface`, `--radius-lg`, 12px inner padding, gap 8 between cards. Header is sticky inside the column.
- **KanbanCard**: see design-system §7.12. Drag handle is the entire card.
- **`+ add`** affordance at column bottom: ghost button that opens an inline composer; `enter` commits, `esc` cancels.
- **Counts** next to column titles update optimistically.

## Tokens

- Column gap: `--space-3` (12px).
- Card gap: `--space-2` (8px).
- Card hover: `--color-surface-2`. Dragging: `--shadow-pop`, 1deg tilt.
- Countdown chip: `--color-info` → `--color-warning` → `--color-danger`.

## Interaction

- Drag with mouse: pointer-based via dnd-kit, 6px activation distance to avoid hijacking text selection.
- Keyboard DnD: `space` picks up the focused card (visible lift + shadow), arrows move between cards/columns with live region announcements ("Card 'Wire OAuth' moved to Doing, position 2"), `space` drops, `esc` cancels and restores.
- Drop animates over `--duration-layout` / `--ease-std`. Successful drop triggers a 120ms accent rail flash on the receiving column header.
- Column scroll is independent; the board scrolls horizontally on overflow with shift+wheel and trackpad gestures.

## Empty state (column)

> Nothing here yet. Drag a card, or press `n`.

## Empty state (sprint)

> No tasks in this sprint yet. Drag from the backlog, or press `n`.

## A11y

- Each column is `role="list"` `aria-label="<status> column"`; cards are `role="listitem"`.
- Live region (`aria-live="polite"`) reports keyboard drag movements.
- Drag handle has `aria-roledescription="draggable"` and `aria-grabbed` is reflected.
- Color of priority/due chip is paired with text or icon (warn triangle for due-soon).
