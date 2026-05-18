import { useRef, useState } from 'react';
import { useOnClickOutside } from '../../../hooks/useOnClickOutside';
import type { TaskFilters } from '../tasks.api';
import { activeFilterCount } from '../useTaskFilters';

// ── shared constants (mirrors StatusCell / PriorityCell) ─────────────────────

const STATUSES = [
  { value: 'BACKLOG',     label: 'Backlog',     color: 'oklch(55% 0 0)',      bg: 'oklch(55% 0 0 / 0.12)' },
  { value: 'TODO',        label: 'To Do',       color: 'oklch(65% 0.14 250)', bg: 'oklch(65% 0.14 250 / 0.12)' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'oklch(72% 0.16 75)',  bg: 'oklch(72% 0.16 75 / 0.12)' },
  { value: 'IN_REVIEW',   label: 'In Review',   color: 'oklch(65% 0.18 270)', bg: 'oklch(65% 0.18 270 / 0.12)' },
  { value: 'DONE',        label: 'Done',        color: 'oklch(65% 0.16 155)', bg: 'oklch(65% 0.16 155 / 0.12)' },
] as const;

const PRIORITIES = [
  { value: 'P0', label: 'Critical', color: 'oklch(62% 0.22 25)', icon: '◆' },
  { value: 'P1', label: 'High',     color: 'oklch(68% 0.18 50)', icon: '▲' },
  { value: 'P2', label: 'Medium',   color: 'oklch(72% 0.16 90)', icon: '●' },
  { value: 'P3', label: 'Low',      color: 'oklch(55% 0 0)',     icon: '—' },
] as const;

// ── tiny inline dropdown ─────────────────────────────────────────────────────

function FilterDropdown<T extends string>({
  label,
  value,
  options,
  onSelect,
  renderOption,
  renderValue,
}: {
  label: string;
  value: T | undefined;
  options: { value: T; label: string }[];
  onSelect: (v: T | undefined) => void;
  renderOption?: (opt: { value: T; label: string }) => React.ReactNode;
  renderValue?: (opt: { value: T; label: string }) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, () => setOpen(false));

  const active = options.find((o) => o.value === value);
  const isActive = !!active;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={[
          'flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-sm)] text-[12px] font-medium',
          'border transition-colors duration-100',
          isActive
            ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-white'
            : 'bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:border-[var(--color-border-strong,var(--color-border))]',
        ].join(' ')}
      >
        {active && renderValue ? renderValue(active) : (active?.label ?? label)}
        {isActive && (
          <span
            className="ml-0.5 opacity-70 hover:opacity-100"
            onClick={(e) => { e.stopPropagation(); onSelect(undefined); }}
            role="button"
            aria-label="Clear filter"
          >
            ×
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 min-w-[140px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-[0_8px_24px_oklch(0%_0_0/0.35)] overflow-hidden py-1">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onSelect(opt.value === value ? undefined : opt.value); setOpen(false); }}
              className={[
                'w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-left',
                'hover:bg-[var(--color-surface-2)] transition-colors duration-75',
                opt.value === value ? 'text-[var(--color-fg)]' : 'text-[var(--color-fg-muted)]',
              ].join(' ')}
            >
              {renderOption ? renderOption(opt) : opt.label}
              {opt.value === value && <span className="ml-auto text-[var(--color-accent)]">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── member type ──────────────────────────────────────────────────────────────

interface Member {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

// ── main component ────────────────────────────────────────────────────────────

interface Props {
  filters: TaskFilters;
  members: Member[];
  onFilter: (patch: Partial<TaskFilters>) => void;
  onClear: () => void;
}

export function TaskFilterBar({ filters, members, onFilter, onClear }: Props) {
  const count = activeFilterCount(filters);

  const memberOptions = members.map((m) => ({ value: m.id, label: m.name }));

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* free-text search */}
      <div className="relative">
        <svg
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-fg-subtle)]"
          width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"
        >
          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.099zm-5.242 1.156a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/>
        </svg>
        <input
          type="text"
          placeholder="Search tasks…"
          value={filters.q ?? ''}
          onChange={(e) => onFilter({ q: e.target.value || undefined })}
          className="pl-7 pr-3 py-1 text-[12px] rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-fg)] placeholder:text-[var(--color-fg-subtle)] focus:outline-none focus:border-[var(--color-accent)] w-44 transition-colors"
        />
      </div>

      {/* Status */}
      <FilterDropdown
        label="Status"
        value={filters.status as (typeof STATUSES)[number]['value'] | undefined}
        options={STATUSES as unknown as { value: string; label: string }[]}
        onSelect={(v) => onFilter({ status: v })}
        renderOption={(opt) => {
          const s = STATUSES.find((s) => s.value === opt.value);
          return (
            <span className="flex items-center gap-2">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ background: s?.color }}
              />
              {opt.label}
            </span>
          );
        }}
      />

      {/* Priority */}
      <FilterDropdown
        label="Priority"
        value={filters.priority as (typeof PRIORITIES)[number]['value'] | undefined}
        options={PRIORITIES as unknown as { value: string; label: string }[]}
        onSelect={(v) => onFilter({ priority: v })}
        renderOption={(opt) => {
          const p = PRIORITIES.find((p) => p.value === opt.value);
          return (
            <span className="flex items-center gap-2">
              <span style={{ color: p?.color }}>{p?.icon}</span>
              {opt.label}
            </span>
          );
        }}
        renderValue={(opt) => {
          const p = PRIORITIES.find((p) => p.value === opt.value);
          return (
            <span className="flex items-center gap-1.5">
              <span>{p?.icon}</span>
              {opt.label}
            </span>
          );
        }}
      />

      {/* Assignee */}
      {memberOptions.length > 0 && (
        <FilterDropdown
          label="Assignee"
          value={filters.assigneeId}
          options={memberOptions}
          onSelect={(v) => onFilter({ assigneeId: v })}
        />
      )}

      {/* Active filter count + clear */}
      {count > 0 && (
        <button
          onClick={onClear}
          className="flex items-center gap-1 px-2 py-1 text-[11px] text-[var(--color-fg-muted)] hover:text-[var(--color-danger)] transition-colors"
        >
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[var(--color-accent)] text-white text-[10px] font-semibold">
            {count}
          </span>
          Clear
        </button>
      )}
    </div>
  );
}
