import { useCallback, useSyncExternalStore } from 'react';
import type { TaskFilters } from './tasks.api';

const FILTER_KEYS = ['status', 'priority', 'assigneeId', 'q'] as const;
type FilterKey = (typeof FILTER_KEYS)[number];

// ── tiny URL-search-param store (no router required) ────────────────────────

function getSnapshot() {
  return window.location.search;
}

function getServerSnapshot() {
  return '';
}

const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener('popstate', cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('popstate', cb);
  };
}

function updateUrl(params: URLSearchParams) {
  const search = params.toString();
  window.history.replaceState(null, '', search ? `?${search}` : window.location.pathname);
  listeners.forEach((cb) => cb());
}

// ── hook ─────────────────────────────────────────────────────────────────────

export function useTaskFilters(): [TaskFilters, (patch: Partial<TaskFilters>) => void, () => void] {
  const search = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const filters: TaskFilters = {};
  const params = new URLSearchParams(search);
  for (const key of FILTER_KEYS) {
    const val = params.get(key);
    if (val) (filters as Record<string, string>)[key] = val;
  }

  const setFilters = useCallback((patch: Partial<TaskFilters>) => {
    const next = new URLSearchParams(window.location.search);
    for (const [k, v] of Object.entries(patch)) {
      if (v === undefined || v === null || v === '') {
        next.delete(k);
      } else {
        next.set(k, String(v));
      }
    }
    updateUrl(next);
  }, []);

  const clearFilters = useCallback(() => {
    const next = new URLSearchParams(window.location.search);
    for (const key of FILTER_KEYS) next.delete(key);
    updateUrl(next);
  }, []);

  return [filters, setFilters, clearFilters];
}

export function activeFilterCount(filters: TaskFilters): number {
  return FILTER_KEYS.filter((k) => !!(filters as Record<string, unknown>)[k]).length;
}
