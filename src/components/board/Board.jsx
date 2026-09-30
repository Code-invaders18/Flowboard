import { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BoardColumn } from './BoardColumn';
import { Skeleton, EmptyState } from '../common';
import {
  useGetTasksByListQuery,
  useCreateTaskMutation,
  useMoveTaskMutation,
} from '../../store/api';
import { selectUsers, selectSearchQuery } from '../../store/selectors';
import { useErrorToast } from '../../hooks/useErrorToast';
import { setOpenTaskId } from '../../store/slices/uiSlice';
import { filterTasksByQuery } from '../../services/search';
import { useRunMutation } from '../../hooks/useRunMutation';

// Kanban board for the selected list's statuses.
export function Board({ list }) {
  const listId = list?.id;
  const { data: tasks, isLoading, isError, error } = useGetTasksByListQuery(listId, {
    skip: !listId,
  });
  useErrorToast(isError, error?.message);
  const users = useSelector(selectUsers);
  const searchQuery = useSelector(selectSearchQuery);
  const isFiltering = searchQuery.trim().length > 0;
  const dispatch = useDispatch();
  const runMutation = useRunMutation();
  const [createTask] = useCreateTaskMutation();
  const [moveTask] = useMoveTaskMutation();

  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const [overStatusId, setOverStatusId] = useState(null);
  const [dropIndex, setDropIndex] = useState(0);

  const usersById = useMemo(() => {
    const map = {};
    for (const user of users) map[user.id] = user;
    return map;
  }, [users]);

  const statuses = useMemo(
    () => [...(list?.statuses || [])].sort((a, b) => a.position - b.position),
    [list],
  );

  const tasksByStatus = useMemo(() => {
    const grouped = {};
    for (const status of statuses) grouped[status.id] = [];
    for (const task of filterTasksByQuery(tasks || [], searchQuery)) {
      if (!grouped[task.status]) grouped[task.status] = [];
      grouped[task.status].push(task);
    }
    for (const key of Object.keys(grouped)) {
      grouped[key] = [...grouped[key]].sort((a, b) => a.position - b.position);
    }
    return grouped;
  }, [tasks, statuses, searchQuery]);

  const onOpenTask = useCallback(
    (taskId) => dispatch(setOpenTaskId(taskId)),
    [dispatch],
  );

  const onDragStartCard = useCallback((event, task) => {
    setDraggingTaskId(task.id);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', task.id);
  }, []);

  const onDragOverColumn = useCallback((event, statusId) => {
    event.preventDefault();
    setOverStatusId(statusId);
    const columnTasks = tasksByStatus[statusId] || [];
    setDropIndex(columnTasks.length);
  }, [tasksByStatus]);

  const onDragOverCard = useCallback((event, statusId, task) => {
    event.preventDefault();
    event.stopPropagation();
    setOverStatusId(statusId);
    const columnTasks = tasksByStatus[statusId] || [];
    const index = columnTasks.findIndex((t) => t.id === task.id);
    const rect = event.currentTarget.getBoundingClientRect();
    const after = event.clientY > rect.top + rect.height / 2;
    setDropIndex(after ? index + 1 : index);
  }, [tasksByStatus]);

  const finishDrop = useCallback(
    async (statusId) => {
      if (!draggingTaskId) return;
      const taskId = draggingTaskId;
      setDraggingTaskId(null);
      setOverStatusId(null);
      await runMutation(
        moveTask,
        {
          taskId,
          toListId: listId,
          toStatusId: statusId,
          // Indexes in a filtered column don't map to the full column, so append instead.
          toIndex: isFiltering ? Number.MAX_SAFE_INTEGER : dropIndex,
        },
        'Task moved',
      );
    },
    [draggingTaskId, dropIndex, isFiltering, listId, moveTask, runMutation],
  );

  const onDropOnColumn = useCallback(
    (event, statusId) => {
      event.preventDefault();
      finishDrop(statusId);
    },
    [finishDrop],
  );

  const onDropOnCard = useCallback(
    (event, statusId) => {
      event.preventDefault();
      event.stopPropagation();
      finishDrop(statusId);
    },
    [finishDrop],
  );

  const onAddTask = useCallback(
    async (statusId, title) =>
      runMutation(createTask, { listId, title, statusId }, 'Task created'),
    [createTask, listId, runMutation],
  );

  if (isLoading) {
    return (
      <div className="flex gap-3 p-4" aria-busy="true" aria-label="Loading board">
        <Skeleton className="h-64 w-72" />
        <Skeleton className="h-64 w-72" />
        <Skeleton className="h-64 w-72" />
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

  return (
    <div
      className="flex h-full gap-3 overflow-x-auto p-4"
      onDragEnd={() => {
        setDraggingTaskId(null);
        setOverStatusId(null);
      }}
    >
      {statuses.map((status) => (
        <BoardColumn
          key={status.id}
          status={status}
          tasks={tasksByStatus[status.id] || []}
          usersById={usersById}
          isOver={overStatusId === status.id}
          onOpenTask={onOpenTask}
          onDragStartCard={onDragStartCard}
          onDragOverColumn={onDragOverColumn}
          onDropOnColumn={onDropOnColumn}
          onDragOverCard={onDragOverCard}
          onDropOnCard={onDropOnCard}
          draggingTaskId={draggingTaskId}
          onAddTask={onAddTask}
        />
      ))}
    </div>
  );
}
