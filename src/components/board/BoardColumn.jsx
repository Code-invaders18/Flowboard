import { useState } from 'react';
import { TaskCard } from './TaskCard';
import { EmptyState, Button } from '../common';

// Single kanban column for one list status with DnD drop target.
export function BoardColumn({
  status,
  tasks,
  usersById,
  isOver,
  onOpenTask,
  onDragStartCard,
  onDragOverColumn,
  onDropOnColumn,
  onDragOverCard,
  onDropOnCard,
  draggingTaskId,
  onAddTask,
}) {
  const [draft, setDraft] = useState('');
  const [adding, setAdding] = useState(false);

  async function handleAdd(event) {
    event.preventDefault();
    const title = draft.trim();
    if (!title) return;
    const ok = await onAddTask(status.id, title);
    if (ok) {
      setDraft('');
      setAdding(false);
    }
  }

  return (
    <section
      onDragOver={(e) => onDragOverColumn(e, status.id)}
      onDrop={(e) => onDropOnColumn(e, status.id)}
      className={`flex w-72 shrink-0 flex-col rounded-xl border bg-surface-muted ${
        isOver ? 'border-brand ring-2 ring-brand/30' : 'border-border'
      }`}
    >
      <header className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
        <h3 className="text-sm font-semibold text-text">{status.name}</h3>
        <span className="rounded-md bg-surface px-1.5 py-0.5 text-xs text-text-muted">
          {tasks.length}
        </span>
      </header>

      <div className="flex min-h-[8rem] flex-1 flex-col gap-2 overflow-y-auto p-2">
        {tasks.length === 0 ? (
          <EmptyState title="No tasks" description="Drop a card here or add one below." />
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              onDragOver={(e) => onDragOverCard(e, status.id, task)}
              onDrop={(e) => onDropOnCard(e, status.id, task)}
            >
              <TaskCard
                task={task}
                usersById={usersById}
                onOpen={onOpenTask}
                onDragStart={onDragStartCard}
                dragging={draggingTaskId === task.id}
              />
            </div>
          ))
        )}
      </div>

      <div className="border-t border-border p-2">
        {adding ? (
          <form onSubmit={handleAdd} className="flex flex-col gap-2">
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Task title"
              className="w-full rounded-md border border-border px-2 py-1.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            />
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Add
              </Button>
              <Button type="button" variant="ghost" onClick={() => setAdding(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setAdding(true)}
          >
            + Add task
          </Button>
        )}
      </div>
    </section>
  );
}
