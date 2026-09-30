import { useEffect, useMemo, useState } from 'react';
import { PRIORITIES, PRIORITY_LABELS, TITLE_MAX_LENGTH } from '../../constants/constants';
import { Button } from '../common';

// Editable form fields for the task drawer.
export function TaskForm({
  task,
  list,
  accessibleLists,
  users,
  onSave,
  onDelete,
  onMoveList,
}) {
  const [title, setTitle] = useState(task.title || '');
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState(task.priority || 'normal');
  const [status, setStatus] = useState(task.status);
  const [assigneeIds, setAssigneeIds] = useState(task.assigneeIds || []);
  const [dueDate, setDueDate] = useState(toDateInput(task.dueDate));
  const [moveListId, setMoveListId] = useState(task.primaryListId);
  const [titleError, setTitleError] = useState('');

  useEffect(() => {
    setTitle(task.title || '');
    setDescription(task.description || '');
    setPriority(task.priority || 'normal');
    setStatus(task.status);
    setAssigneeIds(task.assigneeIds || []);
    setDueDate(toDateInput(task.dueDate));
    setMoveListId(task.primaryListId);
    setTitleError('');
  }, [task]);

  // Statuses follow the currently selected target list, not the task's original list.
  const targetList = useMemo(
    () => accessibleLists.find((item) => item.id === moveListId) || list,
    [accessibleLists, moveListId, list],
  );
  const statuses = useMemo(
    () => [...(targetList?.statuses || [])].sort((a, b) => a.position - b.position),
    [targetList],
  );
  const listChanged = Boolean(moveListId) && moveListId !== task.primaryListId;

  // Picks a status in the new list: same id, else same category, else the first one.
  function handleListChange(nextListId) {
    setMoveListId(nextListId);
    const next = accessibleLists.find((item) => item.id === nextListId);
    if (!next?.statuses?.length) return;
    const sorted = [...next.statuses].sort((a, b) => a.position - b.position);
    const current = (list?.statuses || []).find((s) => s.id === status);
    const mapped =
      sorted.find((s) => s.id === status) ||
      (current && sorted.find((s) => s.category === current.category)) ||
      sorted[0];
    setStatus(mapped.id);
  }

  function toggleAssignee(userId) {
    setAssigneeIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  }

  function validateTitleValue(value) {
    const trimmed = value.trim();
    if (!trimmed) return 'Title is required';
    if (trimmed.length > TITLE_MAX_LENGTH) {
      return `Title must be at most ${TITLE_MAX_LENGTH} characters`;
    }
    return '';
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const err = validateTitleValue(title);
    setTitleError(err);
    if (err) return;

    if (listChanged) {
      const moved = await onMoveList(moveListId, status);
      if (moved === false) return;
    }

    await onSave({
      taskId: task.id,
      title,
      description,
      priority,
      assigneeIds,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      // Status was already applied by the move when the list changed.
      ...(listChanged ? {} : { status }),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <label className="block text-sm font-medium text-text">
          Title
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setTitleError(validateTitleValue(e.target.value));
            }}
            className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          />
          {titleError ? <span className="mt-1 block text-xs text-danger">{titleError}</span> : null}
        </label>

        <label className="block text-sm font-medium text-text">
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          />
        </label>

        <label className="block text-sm font-medium text-text">
          Status
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            {statuses.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium text-text">
          Priority
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
        </label>

        <fieldset>
          <legend className="text-sm font-medium text-text">Assignees</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {users.map((user) => {
              const active = assigneeIds.includes(user.id);
              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => toggleAssignee(user.id)}
                  className={`rounded-md border px-2 py-1 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                    active
                      ? 'border-brand bg-brand-muted text-brand'
                      : 'border-border bg-surface text-text-muted hover:bg-surface-muted'
                  }`}
                >
                  {user.name}
                </button>
              );
            })}
          </div>
        </fieldset>

        <label className="block text-sm font-medium text-text">
          Due date
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          />
        </label>

        <label className="block text-sm font-medium text-text">
          Move to list
          <select
            value={moveListId}
            onChange={(e) => handleListChange(e.target.value)}
            className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            {accessibleLists.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-border p-4">
        <Button type="button" variant="danger" onClick={onDelete}>
          Delete
        </Button>
        <Button type="submit">Save changes</Button>
      </div>
    </form>
  );
}

// Converts an ISO date to YYYY-MM-DD for date inputs.
function toDateInput(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}
