// Maps seed avatar hex colors to full Tailwind class strings.
const AVATAR_BG = {
  '#2563eb': 'bg-brand',
  '#16a34a': 'bg-success',
  '#db2777': 'bg-[#db2777]',
};

// Renders circular initials avatar tinted with the user color.
export function Avatar({ name, color, size = 'sm' }) {
  const initials = (name || '?')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const sizes = {
    sm: 'h-6 w-6 text-[10px]',
    md: 'h-8 w-8 text-xs',
    lg: 'h-10 w-10 text-sm',
  };

  const bg = AVATAR_BG[color] || 'bg-brand';

  return (
    <span
      title={name}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-text-inverse ${sizes[size] || sizes.sm} ${bg}`}
    >
      {initials}
    </span>
  );
}
