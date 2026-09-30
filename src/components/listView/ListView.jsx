import { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TaskRow } from './TaskRow';
import { SortControls } from './SortControls';
import { sortTasksByDueDate, sortTasksByPriority } from './sortTasks';
import { EmptyState, Skeleton } from '../common';
import { useGetTasksByListQuery } from '../../store/api';
import { selectUsers, selectSearchQuery } from '../../store/selectors';
import { useErrorToast } from '../../hooks/useErrorToast';
import { filterTasksByQuery } from '../../services/search';
import { setOpenTaskId } from '../../store/slices/uiSlice';

// Dense sortable table view of tasks in the selected list.
export function ListView({ list }) {
  const listId = list?.id;
  const { data: tasks, isLoading, isError, error } = useGetTasksByListQuery(listId, {
    skip: !listId,
  });
  useErrorToast(isError, error?.message);
  const users = useSelector(selectUsers);
  const searchQuery = useSelector(selectSearchQuery);
  const dispatch = useDispatch();
  const [sortKey, setSortKey] = useState('dueDate');
  const [sortDir, setSortDir] = useState('asc');

  const usersById = useMemo(() => {
    const map = {};
    for (const user of users) map[user.id] = user;
    return map;
  }, [users]);

  const statusById = useMemo(() => {
    const map = {};
    for (const status of list?.statuses || []) map[status.id] = status;
    return map;
  }, [list]);

  const sortedTasks = useMemo(() => {
    const source = filterTasksByQuery(tasks || [], searchQuery);
    if (sortKey === 'priority') return sortTasksByPriority(source, sortDir);
    return sortTasksByDueDate(source, sortDir);
  }, [tasks, searchQuery, sortKey, sortDir]);

  const onOpen = useCallback(
    (taskId) => dispatch(setOpenTaskId(taskId)),
    [dispatch],
  );

  if (isLoading) {
    return (
      <div className="space-y-2 p-4" aria-busy="true" aria-label="Loading list">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        title="Unable to load tasks"
        description={error?.message || 'You may not have access to this list.'}
      />
    );
  }

  if (!sortedTasks.length) {
    return (
      <EmptyState
        title={searchQuery.trim() ? 'No matching tasks' : 'No tasks in this list'}
        description={
          searchQuery.trim()
            ? 'Try a different search term.'
            : 'Create a task from the board view or open another list.'
        }
      />
    );
  }

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-3">
        <SortControls
          sortKey={sortKey}
          sortDir={sortDir}
          onChange={(key, dir) => {
            setSortKey(key);
            setSortDir(dir);
          }}
        />
      </div>
      <div className="overflow-auto rounded-xl border border-border bg-surface shadow-card">
        <table className="min-w-full border-collapse text-left">
          <thead className="bg-surface-muted text-xs uppercase tracking-wide text-text-muted">
            <tr>
              <th className="px-3 py-2 font-semibold">Title</th>
              <th className="px-3 py-2 font-semibold">Status</th>
              <th className="px-3 py-2 font-semibold">Assignees</th>
              <th className="px-3 py-2 font-semibold">Priority</th>
              <th className="px-3 py-2 font-semibold">Due</th>
            </tr>
          </thead>
          <tbody>
            {sortedTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                status={statusById[task.status]}
                usersById={usersById}
                onOpen={onOpen}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
