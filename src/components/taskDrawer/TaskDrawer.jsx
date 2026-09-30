import { useMemo, useState } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useDispatch, useSelector } from 'react-redux';
import { TaskForm } from './TaskForm';
import { ConfirmDialog } from '../common';
import {
  useUpdateTaskMutation,
  useMoveTaskMutation,
  useDeleteTaskMutation,
} from '../../store/api';
import {
  selectOpenTaskId,
  selectTasks,
  selectContainers,
  selectUsers,
  selectGrants,
  selectCurrentUserId,
} from '../../store/selectors';
import { setOpenTaskId } from '../../store/slices/uiSlice';
import { useRunMutation } from '../../hooks/useRunMutation';
import { getAccessibleLists } from '../../services/service';
import { NODE_TYPES } from '../../constants/constants';

// Right-side Headless UI Dialog for editing a task.
export function TaskDrawer() {
  const openTaskId = useSelector(selectOpenTaskId);
  const tasks = useSelector(selectTasks);
  const containers = useSelector(selectContainers);
  const users = useSelector(selectUsers);
  const grants = useSelector(selectGrants);
  const currentUserId = useSelector(selectCurrentUserId);
  const dispatch = useDispatch();
  const runMutation = useRunMutation();

  const [updateTask] = useUpdateTaskMutation();
  const [moveTask] = useMoveTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const task = useMemo(
    () => tasks.find((t) => t.id === openTaskId) || null,
    [tasks, openTaskId],
  );

  const list = useMemo(
    () =>
      task
        ? containers.find((c) => c.id === task.primaryListId && c.type === NODE_TYPES.LIST)
        : null,
    [containers, task],
  );

  const accessibleLists = useMemo(() => {
    const result = getAccessibleLists({
      containers,
      tasks,
      users,
      grants,
      currentUserId,
    });
    return result.data || [];
  }, [containers, tasks, users, grants, currentUserId]);

  function close() {
    dispatch(setOpenTaskId(null));
    setConfirmDelete(false);
  }

  async function handleSave(payload) {
    const ok = await runMutation(updateTask, payload, 'Task updated');
    if (ok) close();
  }

  async function handleMoveList(toListId, toStatusId) {
    if (!task) return false;
    return runMutation(
      moveTask,
      {
        taskId: task.id,
        toListId,
        toStatusId,
        toIndex: 0,
      },
      'Task moved to list',
    );
  }

  async function handleDelete() {
    if (!task) return;
    const ok = await runMutation(deleteTask, { taskId: task.id }, 'Task deleted');
    if (ok) close();
  }

  return (
    <>
      <Dialog open={Boolean(openTaskId && task)} onClose={close} className="relative z-50">
        <div className="fixed inset-0 bg-surface-overlay" aria-hidden="true" />
        <div className="fixed inset-0 flex justify-end">
          <DialogPanel className="flex h-full w-full max-w-md flex-col bg-surface shadow-drawer">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <DialogTitle className="text-base font-semibold text-text">
                Task details
              </DialogTitle>
              <button
                type="button"
                aria-label="Close task drawer"
                onClick={close}
                className="rounded-md px-2 py-1 text-sm text-text-muted hover:bg-surface-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                Esc
              </button>
            </div>
            {task && list ? (
              <TaskForm
                task={task}
                list={list}
                accessibleLists={accessibleLists}
                users={users}
                onSave={handleSave}
                onDelete={() => setConfirmDelete(true)}
                onMoveList={handleMoveList}
              />
            ) : null}
          </DialogPanel>
        </div>
      </Dialog>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete task?"
        message="This permanently removes the task. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
