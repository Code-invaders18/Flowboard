import { describe, it, expect } from 'vitest';
import { createSeedState } from '../data/seedData';
import {
  getVisibleTree,
  createContainer,
  getTasksByList,
  createTask,
  updateTask,
  moveTask,
  deleteTask,
  archiveContainer,
  renameContainer,
} from './service';
import { NODE_TYPES, ERROR_CODES } from '../constants/constants';

// Builds an isolated service state from cloned seed data.
function freshState(overrides = {}) {
  return { ...createSeedState(), ...overrides };
}

// Flattens a tree into a list of node names for easier assertions.
function collectNames(nodes, acc = []) {
  for (const node of nodes) {
    acc.push(node.name);
    if (node.children?.length) collectNames(node.children, acc);
  }
  return acc;
}

// Finds a node by name in a tree.
function findInTree(nodes, name) {
  for (const node of nodes) {
    if (node.name === name) return node;
    const nested = findInTree(node.children || [], name);
    if (nested) return nested;
  }
  return null;
}

describe('getVisibleTree', () => {
  it('lets Alice see everything including Marketing and Sprint Board', () => {
    const state = freshState({ currentUserId: 'u-alice' });
    const result = getVisibleTree(state);
    expect(result.error).toBeUndefined();
    const names = collectNames(result.data);
    expect(names).toContain('Marketing');
    expect(names).toContain('Sprint Board');
    expect(names).toContain('Backlog');
    expect(names).toContain('Content Plan');
  });

  it('lets Bob see Engineering lists including private Sprint Board via allow grant', () => {
    const state = freshState({ currentUserId: 'u-bob' });
    const result = getVisibleTree(state);
    const names = collectNames(result.data);
    expect(names).toContain('Engineering');
    expect(names).toContain('Backlog');
    expect(names).toContain('Sprint Board');
    expect(names).not.toContain('Marketing');
  });

  it('hides Backlog from Carol via deny grant and shows Marketing via allow', () => {
    const state = freshState({ currentUserId: 'u-carol' });
    const result = getVisibleTree(state);
    const names = collectNames(result.data);
    expect(names).toContain('Marketing');
    expect(names).toContain('Content Plan');
    expect(names).toContain('Q2 Launch');
    expect(names).not.toContain('Sprint Board');
    expect(names).not.toContain('Backlog');
    const q2 = findInTree(result.data, 'Q2 Launch');
    expect(q2.children).toHaveLength(0);
  });
});

describe('permissions and validations', () => {
  it('returns FORBIDDEN when a member creates a container', () => {
    const state = freshState({ currentUserId: 'u-bob' });
    const result = createContainer(state, {
      type: NODE_TYPES.SPACE,
      parentId: 'ws-acme',
      name: 'Secret',
    });
    expect(result.error.code).toBe(ERROR_CODES.FORBIDDEN);
  });

  it('returns FORBIDDEN when reading a denied list', () => {
    const state = freshState({ currentUserId: 'u-carol' });
    const result = getTasksByList(state, 'li-backlog');
    expect(result.error.code).toBe(ERROR_CODES.FORBIDDEN);
  });

  it('returns INVALID_PARENT when nesting a list under a space', () => {
    const state = freshState({ currentUserId: 'u-alice' });
    const result = createContainer(state, {
      type: NODE_TYPES.LIST,
      parentId: 'sp-eng',
      name: 'Bad List',
    });
    expect(result.error.code).toBe(ERROR_CODES.INVALID_PARENT);
  });

  it('rejects empty titles and titles over 500 chars', () => {
    const state = freshState({ currentUserId: 'u-alice' });
    const empty = createTask(state, { listId: 'li-backlog', title: '   ' });
    expect(empty.error.code).toBe(ERROR_CODES.VALIDATION);

    const tooLong = createTask(state, {
      listId: 'li-backlog',
      title: 'x'.repeat(501),
    });
    expect(tooLong.error.code).toBe(ERROR_CODES.VALIDATION);
  });

  it('returns INVALID_STATUS for unknown status ids', () => {
    const state = freshState({ currentUserId: 'u-alice' });
    const created = createTask(state, { listId: 'li-backlog', title: 'Temp' });
    const task = created.data.result;
    const nextState = {
      ...state,
      tasks: [...state.tasks, task],
    };
    const result = updateTask(nextState, {
      taskId: task.id,
      status: 'does-not-exist',
    });
    expect(result.error.code).toBe(ERROR_CODES.INVALID_STATUS);
  });
});

describe('moveTask', () => {
  it('reorders positions within a column', () => {
    const state = freshState({ currentUserId: 'u-alice' });
    const column = state.tasks
      .filter((t) => t.primaryListId === 'li-backlog' && t.status === 'backlog-s-todo')
      .sort((a, b) => a.position - b.position);
    expect(column.length).toBeGreaterThan(1);

    const moving = column[column.length - 1];
    const result = moveTask(state, {
      taskId: moving.id,
      toListId: 'li-backlog',
      toStatusId: 'backlog-s-todo',
      toIndex: 0,
    });
    expect(result.error).toBeUndefined();
    const updated = result.data.upsertTasks.find((t) => t.id === moving.id);
    expect(updated.position).toBe(0);
    const positions = result.data.upsertTasks.map((t) => t.position).sort((a, b) => a - b);
    expect(positions).toEqual(positions.map((_, i) => i));
  });

  it('places a card after its neighbour when dragged down within a column', () => {
    const state = freshState({ currentUserId: 'u-alice' });
    const column = state.tasks
      .filter((t) => t.primaryListId === 'li-backlog' && t.status === 'backlog-s-todo')
      .sort((a, b) => a.position - b.position);
    expect(column.length).toBeGreaterThan(2);

    // Drop index 2 is measured with the card still in the column (between items 1 and 2).
    const result = moveTask(state, {
      taskId: column[0].id,
      toListId: 'li-backlog',
      toStatusId: 'backlog-s-todo',
      toIndex: 2,
    });
    const ordered = [...result.data.upsertTasks].sort((a, b) => a.position - b.position);
    expect(ordered[1].id).toBe(column[0].id);
    expect(ordered[0].id).toBe(column[1].id);
  });

  it('forbids a member from updating, moving, or deleting tasks in a denied list', () => {
    const state = freshState({ currentUserId: 'u-carol' });
    const task = state.tasks.find((t) => t.primaryListId === 'li-backlog');
    expect(updateTask(state, { taskId: task.id, title: 'x' }).error.code).toBe(ERROR_CODES.FORBIDDEN);
    expect(
      moveTask(state, { taskId: task.id, toListId: 'li-backlog', toStatusId: 'backlog-s-done', toIndex: 0 })
        .error.code,
    ).toBe(ERROR_CODES.FORBIDDEN);
    expect(deleteTask(state, { taskId: task.id }).error.code).toBe(ERROR_CODES.FORBIDDEN);
  });

  it('changes status when moving across columns', () => {
    const state = freshState({ currentUserId: 'u-alice' });
    const task = state.tasks.find(
      (t) => t.primaryListId === 'li-backlog' && t.status === 'backlog-s-todo',
    );
    const result = moveTask(state, {
      taskId: task.id,
      toListId: 'li-backlog',
      toStatusId: 'backlog-s-done',
      toIndex: 0,
    });
    expect(result.data.result.status).toBe('backlog-s-done');
  });

  it('remaps status by category when moving across lists', () => {
    const state = freshState({ currentUserId: 'u-alice' });
    const task = state.tasks.find(
      (t) => t.primaryListId === 'li-backlog' && t.status === 'backlog-s-ip',
    );
    const result = moveTask(state, {
      taskId: task.id,
      toListId: 'li-content',
      toStatusId: 'missing-on-purpose',
      toIndex: 0,
    });
    expect(result.error).toBeUndefined();
    expect(result.data.result.primaryListId).toBe('li-content');
    expect(result.data.result.status).toBe('content-s-ip');
  });
});

describe('archive and delete', () => {
  it('archives a container and cascades to descendants', () => {
    const state = freshState({ currentUserId: 'u-alice' });
    const result = archiveContainer(state, { containerId: 'fd-q2' });
    expect(result.error).toBeUndefined();
    const ids = result.data.upsertContainers.map((c) => c.id);
    expect(ids).toEqual(expect.arrayContaining(['fd-q2', 'li-backlog', 'li-sprint']));
    expect(result.data.upsertContainers.every((c) => c.archivedAt)).toBe(true);

    const nextState = {
      ...state,
      containers: state.containers.map((c) => {
        const updated = result.data.upsertContainers.find((u) => u.id === c.id);
        return updated || c;
      }),
    };
    const tree = getVisibleTree(nextState);
    expect(collectNames(tree.data)).not.toContain('Q2 Launch');
  });

  it('hard-deletes a task', () => {
    const state = freshState({ currentUserId: 'u-alice' });
    const result = deleteTask(state, { taskId: 't-1' });
    expect(result.data.removeTaskIds).toContain('t-1');
  });

  it('does not mutate input state arguments', () => {
    const state = freshState({ currentUserId: 'u-alice' });
    const snapshot = structuredClone(state);
    createTask(state, { listId: 'li-backlog', title: 'Immutable check' });
    moveTask(state, {
      taskId: 't-1',
      toListId: 'li-backlog',
      toStatusId: 'backlog-s-done',
      toIndex: 0,
    });
    expect(state).toEqual(snapshot);
  });
});

describe('duplicate sibling names', () => {
  it('rejects creating or renaming to an existing sibling name with CONFLICT', () => {
    const state = freshState({ currentUserId: 'u-alice' });
    const created = createContainer(state, { type: NODE_TYPES.SPACE, parentId: 'ws-acme', name: 'engineering' });
    expect(created.error.code).toBe(ERROR_CODES.CONFLICT);

    const renamed = renameContainer(state, { containerId: 'sp-mkt', name: 'Engineering' });
    expect(renamed.error.code).toBe(ERROR_CODES.CONFLICT);
  });
});
