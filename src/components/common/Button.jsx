// Primary action button with consistent focus and hover styles.
export function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  className = '',
  'aria-label': ariaLabel,
}) {
  const variants = {
    primary:
      'bg-brand text-text-inverse hover:bg-brand-hover focus-visible:ring-brand active:bg-brand-hover',
    secondary:
      'bg-surface text-text border border-border hover:bg-surface-muted focus-visible:ring-brand active:bg-surface-muted',
    danger:
      'bg-danger text-text-inverse hover:bg-danger focus-visible:ring-danger active:opacity-90',
    ghost:
      'bg-transparent text-text-muted hover:bg-surface-muted hover:text-text focus-visible:ring-brand',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant] || variants.primary} ${className}`}
    >
      {children}
    </button>
  );
}
