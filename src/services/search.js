// Pure client-side task search over title and description (case-insensitive, all terms must match).
export function filterTasksByQuery(tasks, query) {
  const terms = (query || '').toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return tasks;
  return tasks.filter((task) => {
    const haystack = `${task.title || ''} ${task.description || ''}`.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}
