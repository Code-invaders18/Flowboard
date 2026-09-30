import {
  ERROR_CODES,
  NODE_TYPES,
  DEFAULT_LIST_STATUSES,
  STATUS_CATEGORIES,
  VISIBILITY,
} from '../constants/constants';
import { makeError, ok } from './errors';
import { isAdmin, canViewNode, canEditTask } from './permissions';
import {
  validateTitle,
  validateParent,
  validateStatus,
  validateAssignees,
  validateDueDate,
  validatePriority,
} from './validators';

// Looks up the current user from state.
function getCurrentUser(state) {
  return state.users.find((u) => u.id === state.currentUserId) || null;
}

// Finds a container by id.
function findContainer(containers, id) {
  return containers.find((c) => c.id === id) || null;
}

// Finds a task by id.
function findTask(tasks, id) {
  return tasks.find((t) => t.id === id) || null;
}

// Creates a unique-enough id for new entities.
function createId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// Returns ISO timestamp for created/updated fields.
function nowIso() {
  return new Date().toISOString();
}

// Deep-clones a plain object/array without mutating the source.
function clone(value) {
  return structuredClone(value);
}

// Sorts siblings by position ascending.
function sortByPosition(items) {
  return [...items].sort((a, b) => a.position - b.position);
}

// Reindexes an array of items to contiguous 0..n-1 positions.
function reindex(items) {
  return items.map((item, index) => ({ ...item, position: index }));
}

// Collects a node and all descendant container ids.
function collectDescendantIds(containers, rootId) {
  const ids = [rootId];
  let changed = true;
  while (changed) {
    changed = false;
    for (const c of containers) {
      if (c.parentId && ids.includes(c.parentId) && !ids.includes(c.id)) {
        ids.push(c.id);
        changed = true;
      }
    }
  }
  return ids;
}

// Maps a status onto a target list by category, else first status.
function mapStatusToList(fromStatus, targetList) {
  if (!targetList.statuses?.length) return null;
  if (fromStatus) {
    const sameId = targetList.statuses.find((s) => s.id === fromStatus.id);
    if (sameId) return sameId;
    const byCategory = targetList.statuses.find((s) => s.category === fromStatus.category);
    if (byCategory) return byCategory;
  }
  return sortByPosition(targetList.statuses)[0];
}

// Finds the first todo-category status on a list.
function firstTodoStatus(list) {
  const sorted = sortByPosition(list.statuses || []);
  return sorted.find((s) => s.category === STATUS_CATEGORIES.TODO) || sorted[0] || null;
}

// Builds default statuses for a newly created list.
function buildDefaultStatuses() {
  return DEFAULT_LIST_STATUSES.map((s, index) => ({
    ...s,
    id: createId('status'),
    position: index,
  }));
}

// Returns mutation success payload with optional upserts/removals.
function mutationOk(result, extras = {}) {
  return ok({
    result,
    upsertContainers: extras.upsertContainers || [],
    upsertTasks: extras.upsertTasks || [],
    removeTaskIds: extras.removeTaskIds || [],
  });
}

// Detects an active sibling with the same name (case-insensitive) under a parent.
function hasSiblingNamed(containers, parentId, name, excludeId = null) {
  const wanted = name.trim().toLowerCase();
  return containers.some(
    (c) =>
      c.parentId === parentId &&
      !c.archivedAt &&
      c.id !== excludeId &&
      c.name.trim().toLowerCase() === wanted,
  );
}

// Creates a space, folder, or list under a valid parent (admin only).
export function createContainer(state, payload) {
  const user = getCurrentUser(state);
  if (!isAdmin(user)) {
    return makeError(ERROR_CODES.FORBIDDEN, 'Only admins can create containers');
  }

  const { type, parentId, name } = payload || {};
  if (type === NODE_TYPES.WORKSPACE) {
    return makeError(ERROR_CODES.VALIDATION, 'Workspace cannot be created');
  }

  const titleResult = validateTitle(name);
  if (titleResult.error) return titleResult;

  const parentResult = validateParent(state.containers, type, parentId);
  if (parentResult.error) return parentResult;

  if (hasSiblingNamed(state.containers, parentId, titleResult.data)) {
    return makeError(ERROR_CODES.CONFLICT, `A ${type} named "${titleResult.data}" already exists here`);
  }

  const siblings = state.containers.filter((c) => c.parentId === parentId && !c.archivedAt);
  const container = {
    id: createId(type.slice(0, 2)),
    name: titleResult.data,
    type,
    parentId,
    position: siblings.length,
    visibility: VISIBILITY.PUBLIC,
    archivedAt: null,
  };
  if (type === NODE_TYPES.LIST) {
    container.statuses = buildDefaultStatuses();
  }

  return mutationOk(container, { upsertContainers: [container] });
}

// Renames any container type the admin can manage.
export function renameContainer(state, payload) {
  const user = getCurrentUser(state);
  if (!isAdmin(user)) {
    return makeError(ERROR_CODES.FORBIDDEN, 'Only admins can rename containers');
  }

  const { containerId, name } = payload || {};
  const existing = findContainer(state.containers, containerId);
  if (!existing || existing.archivedAt) {
    return makeError(ERROR_CODES.NOT_FOUND, 'Container not found');
  }

  const titleResult = validateTitle(name);
  if (titleResult.error) return titleResult;

  if (hasSiblingNamed(state.containers, existing.parentId, titleResult.data, existing.id)) {
    return makeError(ERROR_CODES.CONFLICT, `"${titleResult.data}" already exists here`);
  }

  const updated = { ...existing, name: titleResult.data };
  return mutationOk(updated, { upsertContainers: [updated] });
}

// Moves a container among same-parent siblings to a new index.
export function reorderContainer(state, payload) {
  const user = getCurrentUser(state);
  if (!isAdmin(user)) {
    return makeError(ERROR_CODES.FORBIDDEN, 'Only admins can reorder containers');
  }

  const { containerId, toIndex } = payload || {};
  const existing = findContainer(state.containers, containerId);
  if (!existing || existing.archivedAt) {
    return makeError(ERROR_CODES.NOT_FOUND, 'Container not found');
  }

  const siblings = sortByPosition(
    state.containers.filter(
      (c) => c.parentId === existing.parentId && !c.archivedAt,
    ),
  );
  const fromIndex = siblings.findIndex((c) => c.id === containerId);
  if (fromIndex < 0) {
    return makeError(ERROR_CODES.NOT_FOUND, 'Container not found among siblings');
  }

  const targetIndex = Math.max(0, Math.min(Number(toIndex), siblings.length - 1));
  const next = [...siblings];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(targetIndex, 0, moved);
  const upsertContainers = reindex(next);
  return mutationOk(upsertContainers.find((c) => c.id === containerId), { upsertContainers });
}

// Soft-archives a container and cascades to all descendants.
export function archiveContainer(state, payload) {
  const user = getCurrentUser(state);
  if (!isAdmin(user)) {
    return makeError(ERROR_CODES.FORBIDDEN, 'Only admins can archive containers');
  }

  const { containerId } = payload || {};
  const existing = findContainer(state.containers, containerId);
  if (!existing || existing.archivedAt) {
    return makeError(ERROR_CODES.NOT_FOUND, 'Container not found');
  }
  if (existing.type === NODE_TYPES.WORKSPACE) {
    return makeError(ERROR_CODES.VALIDATION, 'Workspace cannot be archived');
  }

  const stamp = nowIso();
  const ids = collectDescendantIds(state.containers, containerId);
  const upsertContainers = state.containers
    .filter((c) => ids.includes(c.id))
    .map((c) => ({ ...c, archivedAt: stamp }));

  return mutationOk({ archivedIds: ids }, { upsertContainers });
}

// Returns the visible hierarchy tree for the current user.
export function getVisibleTree(state) {
  const user = getCurrentUser(state);
  if (!user) {
    return makeError(ERROR_CODES.FORBIDDEN, 'No current user');
  }

  const visible = state.containers.filter((node) =>
    canViewNode(node, user, state.containers, state.grants),
  );

  const byParent = new Map();
  for (const node of visible) {
    const key = node.parentId || 'root';
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(node);
  }

  function build(parentId) {
    const key = parentId || 'root';
    const children = sortByPosition(byParent.get(key) || []);
    return children.map((node) => ({
      ...clone(node),
      children: build(node.id),
    }));
  }

  return ok(build(null));
}

// Creates a task in a viewable list with default todo status.
export function createTask(state, payload) {
  const user = getCurrentUser(state);
  const { listId, title, description = '', priority = 'normal', assigneeIds = [], dueDate = null, statusId } =
    payload || {};

  const list = findContainer(state.containers, listId);
  if (!list || list.type !== NODE_TYPES.LIST || list.archivedAt) {
    return makeError(ERROR_CODES.NOT_FOUND, 'List not found');
  }
  if (!canEditTask(list, user, state.containers, state.grants)) {
    return makeError(ERROR_CODES.FORBIDDEN, 'You cannot create tasks in this list');
  }

  const titleResult = validateTitle(title);
  if (titleResult.error) return titleResult;

  const priorityResult = validatePriority(priority);
  if (priorityResult.error) return priorityResult;

  const assigneesResult = validateAssignees(state.users, assigneeIds);
  if (assigneesResult.error) return assigneesResult;

  const dueResult = validateDueDate(dueDate);
  if (dueResult.error) return dueResult;

  let status;
  if (statusId) {
    const statusResult = validateStatus(list, statusId);
    if (statusResult.error) return statusResult;
    status = statusResult.data;
  } else {
    status = firstTodoStatus(list);
    if (!status) {
      return makeError(ERROR_CODES.INVALID_STATUS, 'List has no statuses');
    }
  }

  const columnTasks = state.tasks.filter(
    (t) => t.primaryListId === listId && t.status === status.id,
  );
  const stamp = nowIso();
  const task = {
    id: createId('task'),
    title: titleResult.data,
    description: typeof description === 'string' ? description : '',
    status: status.id,
    priority: priorityResult.data,
    assigneeIds: assigneesResult.data,
    dueDate: dueResult.data,
    position: columnTasks.length,
    primaryListId: listId,
    createdAt: stamp,
    updatedAt: stamp,
  };

  return mutationOk(task, { upsertTasks: [task] });
}

// Updates editable fields on a task.
export function updateTask(state, payload) {
  const user = getCurrentUser(state);
  const { taskId, title, description, priority, assigneeIds, dueDate, status } = payload || {};

  const existing = findTask(state.tasks, taskId);
  if (!existing) {
    return makeError(ERROR_CODES.NOT_FOUND, 'Task not found');
  }

  const list = findContainer(state.containers, existing.primaryListId);
  if (!list || list.archivedAt) {
    return makeError(ERROR_CODES.NOT_FOUND, 'List not found');
  }
  if (!canEditTask(list, user, state.containers, state.grants)) {
    return makeError(ERROR_CODES.FORBIDDEN, 'You cannot edit this task');
  }

  const next = { ...existing, updatedAt: nowIso() };

  if (title !== undefined) {
    const titleResult = validateTitle(title);
    if (titleResult.error) return titleResult;
    next.title = titleResult.data;
  }
  if (description !== undefined) {
    next.description = typeof description === 'string' ? description : '';
  }
  if (priority !== undefined) {
    const priorityResult = validatePriority(priority);
    if (priorityResult.error) return priorityResult;
    next.priority = priorityResult.data;
  }
  if (assigneeIds !== undefined) {
    const assigneesResult = validateAssignees(state.users, assigneeIds);
    if (assigneesResult.error) return assigneesResult;
    next.assigneeIds = assigneesResult.data;
  }
  if (dueDate !== undefined) {
    const dueResult = validateDueDate(dueDate);
    if (dueResult.error) return dueResult;
    next.dueDate = dueResult.data;
  }

  let upsertTasks = [next];

  if (status !== undefined && status !== existing.status) {
    const statusResult = validateStatus(list, status);
    if (statusResult.error) return statusResult;

    const fromColumn = sortByPosition(
      state.tasks.filter(
        (t) => t.primaryListId === existing.primaryListId && t.status === existing.status && t.id !== existing.id,
      ),
    );
    const toColumn = sortByPosition(
      state.tasks.filter(
        (t) => t.primaryListId === existing.primaryListId && t.status === status,
      ),
    );
    next.status = status;
    next.position = toColumn.length;
    upsertTasks = [
      ...reindex(fromColumn),
      ...reindex([...toColumn, next]),
    ];
  }

  return mutationOk(next, { upsertTasks });
}

// Moves a task within/across columns or lists and reindexes positions.
export function moveTask(state, payload) {
  const user = getCurrentUser(state);
  const { taskId, toListId, toStatusId, toIndex } = payload || {};

  const existing = findTask(state.tasks, taskId);
  if (!existing) {
    return makeError(ERROR_CODES.NOT_FOUND, 'Task not found');
  }

  const fromList = findContainer(state.containers, existing.primaryListId);
  const toList = findContainer(state.containers, toListId);
  if (!fromList || fromList.archivedAt || !toList || toList.type !== NODE_TYPES.LIST || toList.archivedAt) {
    return makeError(ERROR_CODES.NOT_FOUND, 'List not found');
  }
  if (!canEditTask(fromList, user, state.containers, state.grants)) {
    return makeError(ERROR_CODES.FORBIDDEN, 'You cannot move this task');
  }
  if (!canEditTask(toList, user, state.containers, state.grants)) {
    return makeError(ERROR_CODES.FORBIDDEN, 'You cannot move tasks into this list');
  }

  const fromStatus = fromList.statuses?.find((s) => s.id === existing.status) || null;
  let targetStatus = toList.statuses?.find((s) => s.id === toStatusId) || null;
  if (!targetStatus) {
    targetStatus = mapStatusToList(fromStatus, toList);
  }
  if (!targetStatus) {
    return makeError(ERROR_CODES.INVALID_STATUS, 'Target list has no statuses');
  }
  const statusCheck = validateStatus(toList, targetStatus.id);
  if (statusCheck.error) return statusCheck;

  const sameColumn =
    existing.primaryListId === toListId && existing.status === targetStatus.id;

  const fromColumn = sortByPosition(
    state.tasks.filter(
      (t) =>
        t.primaryListId === existing.primaryListId &&
        t.status === existing.status &&
        t.id !== existing.id,
    ),
  );

  let toColumn;
  if (sameColumn) {
    toColumn = sortByPosition(
      state.tasks.filter(
        (t) => t.primaryListId === toListId && t.status === targetStatus.id,
      ),
    );
  } else {
    toColumn = sortByPosition(
      state.tasks.filter(
        (t) => t.primaryListId === toListId && t.status === targetStatus.id && t.id !== existing.id,
      ),
    );
  }

  const moved = {
    ...existing,
    primaryListId: toListId,
    status: targetStatus.id,
    updatedAt: nowIso(),
  };

  const insertAt = Math.max(0, Math.min(Number(toIndex) || 0, toColumn.length));
  const nextTo = [...toColumn];
  if (sameColumn) {
    // insertAt is measured with the card still in the column; adjust after removing it.
    const fromIndex = nextTo.findIndex((t) => t.id === existing.id);
    const adjustedAt = fromIndex >= 0 && fromIndex < insertAt ? insertAt - 1 : insertAt;
    const without = nextTo.filter((t) => t.id !== existing.id);
    without.splice(adjustedAt, 0, moved);
    const upsertTasks = reindex(without);
    return mutationOk(upsertTasks.find((t) => t.id === taskId), { upsertTasks });
  }

  nextTo.splice(insertAt, 0, moved);
  const upsertTasks = [...reindex(fromColumn), ...reindex(nextTo)];
  return mutationOk(upsertTasks.find((t) => t.id === taskId), { upsertTasks });
}

// Hard-deletes a task after permission checks.
export function deleteTask(state, payload) {
  const user = getCurrentUser(state);
  const { taskId } = payload || {};
  const existing = findTask(state.tasks, taskId);
  if (!existing) {
    return makeError(ERROR_CODES.NOT_FOUND, 'Task not found');
  }

  const list = findContainer(state.containers, existing.primaryListId);
  if (!list || list.archivedAt) {
    return makeError(ERROR_CODES.NOT_FOUND, 'List not found');
  }
  if (!canEditTask(list, user, state.containers, state.grants)) {
    return makeError(ERROR_CODES.FORBIDDEN, 'You cannot delete this task');
  }

  const remaining = sortByPosition(
    state.tasks.filter(
      (t) =>
        t.primaryListId === existing.primaryListId &&
        t.status === existing.status &&
        t.id !== existing.id,
    ),
  );

  return mutationOk({ id: taskId }, {
    removeTaskIds: [taskId],
    upsertTasks: reindex(remaining),
  });
}

// Returns tasks for a list the current user can view.
export function getTasksByList(state, listId) {
  const user = getCurrentUser(state);
  const list = findContainer(state.containers, listId);
  if (!list || list.type !== NODE_TYPES.LIST || list.archivedAt) {
    return makeError(ERROR_CODES.NOT_FOUND, 'List not found');
  }
  if (!canViewNode(list, user, state.containers, state.grants)) {
    return makeError(ERROR_CODES.FORBIDDEN, 'You do not have access to this list');
  }

  const tasks = sortByPosition(
    state.tasks.filter((t) => t.primaryListId === listId),
  ).map(clone);

  return ok(tasks);
}

// Returns lists the current user can access (for move-to-list UI).
export function getAccessibleLists(state) {
  const user = getCurrentUser(state);
  if (!user) return ok([]);
  const lists = state.containers.filter(
    (c) =>
      c.type === NODE_TYPES.LIST &&
      !c.archivedAt &&
      canViewNode(c, user, state.containers, state.grants),
  );
  return ok(sortByPosition(lists).map(clone));
}
