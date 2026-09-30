import { memo } from 'react';
import { Avatar, PriorityBadge, StatusBadge } from '../common';

// Formats due date for the dense table row.
function formatDue(dueDate) {
  if (!dueDate) return { label: '—', overdue: false };
  const date = new Date(dueDate);
  return {
    label: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    overdue: date.getTime() < Date.now(),
  };
}

// Dense table row for a single task.
export const TaskRow = memo(function TaskRow({ task, status, usersById, onOpen }) {
  const due = formatDue(task.dueDate);
  const assignees = (task.assigneeIds || [])
    .map((id) => usersById[id])
    .filter(Boolean);

  return (
    <tr
      tabIndex={0}
      onClick={() => onOpen(task.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(task.id);
        }
      }}
      className="cursor-pointer border-b border-border hover:bg-surface-muted focus:outline-none focus-visible:bg-brand-muted active:bg-surface-muted"
    >
      <td className="px-3 py-2 text-sm font-medium text-text">{task.title}</td>
      <td className="px-3 py-2">
        {status ? (
          <StatusBadge name={status.name} category={status.category} />
        ) : (
          <span className="text-xs text-text-muted">—</span>
        )}
      </td>
      <td className="px-3 py-2">
        <div className="flex -space-x-1">
          {assignees.length
            ? assignees.map((user) => (
                <Avatar key={user.id} name={user.name} color={user.color} />
              ))
            : <span className="text-xs text-text-muted">—</span>}
        </div>
      </td>
      <td className="px-3 py-2">
        <PriorityBadge priority={task.priority} />
      </td>
      <td className={`px-3 py-2 text-sm ${due.overdue ? 'font-semibold text-danger' : 'text-text-muted'}`}>
        {due.label}
      </td>
    </tr>
  );
});
