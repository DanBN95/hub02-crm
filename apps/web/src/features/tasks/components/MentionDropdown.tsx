import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useEffect, useRef, useState } from 'react';
import { Avatar } from '../../../components/ui/Avatar';

interface Member {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

interface Props {
  open: boolean;
  query: string;
  members: Member[];
  onSelect: (name: string) => void;
  onClose: () => void;
}

export function MentionDropdown({ open, query, members, onSelect, onClose }: Props) {
  const filtered = members
    .filter((m) => m.name.toLowerCase().startsWith(query.toLowerCase()))
    .slice(0, 6);

  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  // Reset index when query changes
  useEffect(() => { setActiveIndex(0); }, [query]);

  // Keyboard handling — attach to window so it intercepts before textarea
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        if (filtered[activeIndex]) {
          e.preventDefault();
          e.stopPropagation();
          onSelect(filtered[activeIndex]!.name);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handler, { capture: true });
    return () => window.removeEventListener('keydown', handler, { capture: true });
  }, [open, filtered, activeIndex, onSelect, onClose]);

  if (!open || filtered.length === 0) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'absolute',
        bottom: '100%',
        left: 0,
        right: 0,
        mb: 0.5,
        zIndex: 1400,
        border: '1px solid rgba(255,255,255,0.1)',
        background: 'color-mix(in oklch, var(--color-surface) 92%, transparent)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 -8px 32px oklch(0% 0 0 / 0.3)',
        borderRadius: 1.5,
        overflow: 'hidden',
        maxHeight: 240,
        overflowY: 'auto',
      }}
      ref={listRef}
    >
      <Box sx={{ p: 0.75 }}>
        {filtered.map((member, i) => (
          <Box
            key={member.id}
            onMouseDown={(e) => { e.preventDefault(); onSelect(member.name); }}
            onMouseEnter={() => setActiveIndex(i)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 1.5,
              py: 1,
              borderRadius: 1,
              cursor: 'pointer',
              background: i === activeIndex ? 'rgba(124,127,245,0.12)' : 'transparent',
              transition: 'background 80ms',
            }}
          >
            <Avatar name={member.name} avatarUrl={member.avatarUrl} size={24} />
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 13, fontWeight: i === activeIndex ? 500 : 400, lineHeight: 1.2 }}>
                {member.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled', lineHeight: 1.2 }}>
                {member.email}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
