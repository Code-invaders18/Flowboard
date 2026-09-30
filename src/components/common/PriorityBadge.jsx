import { PRIORITY_STYLES, PRIORITY_LABELS } from '../../constants/constants';

// Shared priority badge used on kanban cards and list rows.
export function PriorityBadge({ priority }) {
  const key = priority || 'none';
  const classes = PRIORITY_STYLES[key] || PRIORITY_STYLES.none;
  const label = PRIORITY_LABELS[key] || PRIORITY_LABELS.none;

  return (
    <span className={`inline-flex rounded-md px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide ${classes}`}>
      {label}
    </span>
  );
}
