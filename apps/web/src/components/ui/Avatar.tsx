const AVATAR_COLORS = [
  'oklch(60% 0.18 25)',
  'oklch(62% 0.18 270)',
  'oklch(65% 0.16 155)',
  'oklch(68% 0.16 50)',
  'oklch(60% 0.15 310)',
];

export function avatarColor(name: string): string {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length] ?? AVATAR_COLORS[0]!;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return (parts[0]?.slice(0, 2) ?? '??').toUpperCase();
  return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase();
}

interface AvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: number;
  className?: string;
}

export function Avatar({ name, avatarUrl, size = 24, className = '' }: AvatarProps) {
  const style = { width: size, height: size, minWidth: size, minHeight: size, fontSize: size * 0.38 };

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        style={style}
        className={`rounded-full object-cover shrink-0 ${className}`}
      />
    );
  }

  return (
    <span
      style={{ ...style, background: avatarColor(name) }}
      className={`rounded-full flex items-center justify-center font-semibold text-white shrink-0 select-none ${className}`}
    >
      {initials(name)}
    </span>
  );
}
