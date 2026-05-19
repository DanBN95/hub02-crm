import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import type { TaskFilters } from '../tasks.api';
import { activeFilterCount } from '../useTaskFilters';

const STATUSES = [
  { value: 'BACKLOG',     label: 'Backlog',      color: 'oklch(55% 0 0)' },
  { value: 'TODO',        label: 'To Do',        color: 'oklch(65% 0.14 250)' },
  { value: 'IN_PROGRESS', label: 'In Progress',  color: 'oklch(72% 0.16 75)' },
  { value: 'IN_REVIEW',   label: 'In Review',    color: 'oklch(65% 0.18 270)' },
  { value: 'DONE',        label: 'Done',         color: 'oklch(65% 0.16 155)' },
];

const PRIORITIES = [
  { value: 'P0', label: 'Critical', color: 'oklch(62% 0.22 25)', icon: '◆' },
  { value: 'P1', label: 'High',     color: 'oklch(68% 0.18 50)', icon: '▲' },
  { value: 'P2', label: 'Medium',   color: 'oklch(72% 0.16 90)', icon: '●' },
  { value: 'P3', label: 'Low',      color: 'oklch(55% 0 0)',     icon: '—' },
];

interface Member { id: string; name: string; email: string; avatarUrl: string | null }

interface Props {
  filters: TaskFilters;
  members: Member[];
  onFilter: (patch: Partial<TaskFilters>) => void;
  onClear: () => void;
}

const selectSx = {
  fontSize: 12,
  height: 32,
  minWidth: 110,
  '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-accent)', borderWidth: 1 },
  '.MuiSelect-select': { py: '5px', px: '10px', fontSize: 12 },
  background: 'rgba(255,255,255,0.03)',
};

export function TaskFilterBar({ filters, members, onFilter, onClear }: Props) {
  const count = activeFilterCount(filters);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
      {/* Free-text search */}
      <TextField
        size="small"
        placeholder="Search tasks…"
        value={filters.q ?? ''}
        onChange={(e) => onFilter({ q: e.target.value || undefined })}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
              </InputAdornment>
            ),
          },
        }}
        sx={{
          width: 180,
          '.MuiOutlinedInput-root': { height: 32, fontSize: 12 },
          '.MuiOutlinedInput-input': { py: '5px', px: '8px', fontSize: 12 },
        }}
      />

      {/* Status */}
      <FormControl size="small">
        <Select
          displayEmpty
          value={filters.status ?? ''}
          onChange={(e) => onFilter({ status: e.target.value || undefined })}
          sx={selectSx}
          renderValue={(val) => {
            if (!val) return <span style={{ color: 'var(--color-fg-subtle)', fontSize: 12 }}>Status</span>;
            const s = STATUSES.find((s) => s.value === val);
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: s?.color, display: 'inline-block', flexShrink: 0 }} />
                <span style={{ fontSize: 12 }}>{s?.label}</span>
              </Box>
            );
          }}
        >
          <MenuItem value=""><em style={{ fontSize: 12 }}>Any status</em></MenuItem>
          {STATUSES.map((s) => (
            <MenuItem key={s.value} value={s.value}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
                {s.label}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Priority */}
      <FormControl size="small">
        <Select
          displayEmpty
          value={filters.priority ?? ''}
          onChange={(e) => onFilter({ priority: e.target.value || undefined })}
          sx={selectSx}
          renderValue={(val) => {
            if (!val) return <span style={{ color: 'var(--color-fg-subtle)', fontSize: 12 }}>Priority</span>;
            const p = PRIORITIES.find((p) => p.value === val);
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <span style={{ color: p?.color, fontSize: 10 }}>{p?.icon}</span>
                <span style={{ fontSize: 12 }}>{p?.label}</span>
              </Box>
            );
          }}
        >
          <MenuItem value=""><em style={{ fontSize: 12 }}>Any priority</em></MenuItem>
          {PRIORITIES.map((p) => (
            <MenuItem key={p.value} value={p.value}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span style={{ color: p.color, fontSize: 11 }}>{p.icon}</span>
                {p.label}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Assignee */}
      {members.length > 0 && (
        <FormControl size="small">
          <Select
            displayEmpty
            value={filters.assigneeId ?? ''}
            onChange={(e) => onFilter({ assigneeId: e.target.value || undefined })}
            sx={selectSx}
            renderValue={(val) => {
              if (!val) return <span style={{ color: 'var(--color-fg-subtle)', fontSize: 12 }}>Assignee</span>;
              return <span style={{ fontSize: 12 }}>{members.find((m) => m.id === val)?.name ?? val}</span>;
            }}
          >
            <MenuItem value=""><em style={{ fontSize: 12 }}>Anyone</em></MenuItem>
            {members.map((m) => (
              <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Active filter chip — clear all */}
      {count > 0 && (
        <Chip
          icon={<TuneIcon sx={{ fontSize: '13px !important' }} />}
          label={`${count} active`}
          onDelete={onClear}
          size="small"
          sx={{
            height: 28,
            fontSize: 11,
            background: 'rgba(124,127,245,0.15)',
            color: 'var(--color-accent)',
            border: '1px solid rgba(124,127,245,0.3)',
            '.MuiChip-deleteIcon': { color: 'var(--color-accent)', opacity: 0.7, fontSize: 14 },
          }}
        />
      )}
    </Box>
  );
}
