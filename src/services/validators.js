import {
  ERROR_CODES,
  TITLE_MAX_LENGTH,
  VALID_PARENT,
  PRIORITIES,
} from '../constants/constants';
import { makeError, ok } from './errors';

// Validates a required trimmed title within the max length.
export function validateTitle(title) {
  if (typeof title !== 'string') {
    return makeError(ERROR_CODES.VALIDATION, 'Title is required');
  }
  const trimmed = title.trim();
  if (!trimmed) {
    return makeError(ERROR_CODES.VALIDATION, 'Title is required');
  }
  if (trimmed.length > TITLE_MAX_LENGTH) {
    return makeError(ERROR_CODES.VALIDATION, `Title must be at most ${TITLE_MAX_LENGTH} characters`);
  }
  return ok(trimmed);
}

// Ensures parent exists, is not archived, and matches the valid-parent map.
export function validateParent(containers, childType, parentId) {
  const expectedParentType = VALID_PARENT[childType];
  if (!expectedParentType) {
    return makeError(ERROR_CODES.INVALID_PARENT, `Cannot create type ${childType}`);
  }
  const parent = containers.find((c) => c.id === parentId);
  if (!parent || parent.archivedAt) {
    return makeError(ERROR_CODES.INVALID_PARENT, 'Parent not found or archived');
  }
  if (parent.type !== expectedParentType) {
    return makeError(
      ERROR_CODES.INVALID_PARENT,
      `${childType} must be under a ${expectedParentType}`,
    );
  }
  return ok(parent);
}

// Confirms a status id belongs to the given list.
export function validateStatus(list, statusId) {
  if (!list || !Array.isArray(list.statuses)) {
    return makeError(ERROR_CODES.INVALID_STATUS, 'List has no statuses');
  }
  const status = list.statuses.find((s) => s.id === statusId);
  if (!status) {
    return makeError(ERROR_CODES.INVALID_STATUS, 'Status does not belong to this list');
  }
  return ok(status);
}

// Ensures every assignee id maps to an existing user.
export function validateAssignees(users, assigneeIds) {
  if (!Array.isArray(assigneeIds)) {
    return makeError(ERROR_CODES.VALIDATION, 'Assignees must be an array');
  }
  const ids = new Set(users.map((u) => u.id));
  for (const id of assigneeIds) {
    if (!ids.has(id)) {
      return makeError(ERROR_CODES.VALIDATION, `Unknown assignee: ${id}`);
    }
  }
  return ok([...assigneeIds]);
}

// Accepts null or a parseable ISO datetime string.
export function validateDueDate(dueDate) {
  if (dueDate === null || dueDate === undefined || dueDate === '') {
    return ok(null);
  }
  if (typeof dueDate !== 'string') {
    return makeError(ERROR_CODES.VALIDATION, 'Due date must be an ISO string or null');
  }
  const parsed = Date.parse(dueDate);
  if (Number.isNaN(parsed)) {
    return makeError(ERROR_CODES.VALIDATION, 'Due date is not a valid ISO datetime');
  }
  return ok(new Date(parsed).toISOString());
}

// Confirms priority is one of the allowed values.
export function validatePriority(priority) {
  if (!PRIORITIES.includes(priority)) {
    return makeError(ERROR_CODES.VALIDATION, 'Invalid priority');
  }
  return ok(priority);
}
