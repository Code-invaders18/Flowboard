import { PRIORITY_RANK } from '../../constants/constants';

// Pure helper: sorts tasks by due date ascending/descending (nulls last).
export function sortTasksByDueDate(tasks, direction = 'asc') {
  const factor = direction === 'desc' ? -1 : 1;
  return [...tasks].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    const diff = Date.parse(a.dueDate) - Date.parse(b.dueDate);
    return diff * factor;
  });
}

// Pure helper: sorts tasks by priority rank ascending/descending.
export function sortTasksByPriority(tasks, direction = 'asc') {
  const factor = direction === 'desc' ? -1 : 1;
  return [...tasks].sort((a, b) => {
    const left = PRIORITY_RANK[a.priority] ?? PRIORITY_RANK.none;
    const right = PRIORITY_RANK[b.priority] ?? PRIORITY_RANK.none;
    return (left - right) * factor;
  });
}
