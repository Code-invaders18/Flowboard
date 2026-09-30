import { memo } from 'react';
import { Avatar, PriorityBadge } from '../common';

// Formats a due date and flags overdue items in red.
function formatDue(dueDate) {
  if (!dueDate) return null;
  const date = new Date(dueDate);
  const label = date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
  const overdue = date.getTime() < Date.now() && !Number.isNaN(date.getTime());
  return { label, overdue };
}

// Draggable kanban card showing title, priority, assignees, and due date.
export const TaskCard = memo(function TaskCard({
  task,
  usersById,
  onOpen,
  onDragStart,
  dragging,
}) {
  const due = formatDue(task.dueDate);
  const assignees = (task.assigneeIds || [])
    .map((id) => usersById[id])
    .filter(Boolean);

  return (
    <button
      type="button"
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onClick={() => onOpen(task.id)}
      className={`w-full rounded-lg border border-border bg-surface p-3 text-left shadow-card transition hover:border-border-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-brand active:bg-surface-muted ${
        dragging ? 'opacity-40' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-text">{task.title}</p>
        <PriorityBadge priority={task.priority} />
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex -space-x-1">
          {assignees.map((user) => (
            <Avatar key={user.id} name={user.name} color={user.color} />
          ))}
        </div>
        {due ? (
          <span className={`text-xs ${due.overdue ? 'font-semibold text-danger' : 'text-text-muted'}`}>
            {due.label}
          </span>
        ) : null}
      </div>
    </button>
  );
});
