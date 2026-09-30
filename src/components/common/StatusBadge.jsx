import { STATUS_STYLES } from '../../constants/constants';

// Shared status badge used on kanban cards and list rows.
export function StatusBadge({ name, category }) {
  const classes = STATUS_STYLES[category] || STATUS_STYLES.todo;

  return (
    <span className={`inline-flex rounded-md px-1.5 py-0.5 text-[11px] font-medium ${classes}`}>
      {name}
    </span>
  );
}
