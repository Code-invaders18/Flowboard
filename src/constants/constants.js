// Node hierarchy types and valid parent relationships.
export const NODE_TYPES = {
  WORKSPACE: 'workspace',
  SPACE: 'space',
  FOLDER: 'folder',
  LIST: 'list',
};

export const VALID_PARENT = {
  [NODE_TYPES.SPACE]: NODE_TYPES.WORKSPACE,
  [NODE_TYPES.FOLDER]: NODE_TYPES.SPACE,
  [NODE_TYPES.LIST]: NODE_TYPES.FOLDER,
};

// Child type created under each container type (inverse of VALID_PARENT, plus workspace).
export const CHILD_TYPE = {
  [NODE_TYPES.WORKSPACE]: NODE_TYPES.SPACE,
  [NODE_TYPES.SPACE]: NODE_TYPES.FOLDER,
  [NODE_TYPES.FOLDER]: NODE_TYPES.LIST,
};

// Task priority values and shared Tailwind class strings.
export const PRIORITIES = ['urgent', 'high', 'normal', 'low', 'none'];

export const PRIORITY_STYLES = {
  urgent: 'bg-priority-urgent-bg text-priority-urgent-text',
  high: 'bg-priority-high-bg text-priority-high-text',
  normal: 'bg-priority-normal-bg text-priority-normal-text',
  low: 'bg-priority-low-bg text-priority-low-text',
  none: 'bg-priority-none-bg text-priority-none-text',
};

export const PRIORITY_LABELS = {
  urgent: 'Urgent',
  high: 'High',
  normal: 'Normal',
  low: 'Low',
  none: 'None',
};

export const PRIORITY_RANK = {
  urgent: 0,
  high: 1,
  normal: 2,
  low: 3,
  none: 4,
};

// Status categories and shared color styles.
export const STATUS_CATEGORIES = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
};

export const STATUS_STYLES = {
  todo: 'bg-status-todo-bg text-status-todo-text',
  in_progress: 'bg-status-in_progress-bg text-status-in_progress-text',
  done: 'bg-status-done-bg text-status-done-text',
};

export const DEFAULT_LIST_STATUSES = [
  { name: 'Todo', category: STATUS_CATEGORIES.TODO, color: '#94a3b8', position: 0 },
  { name: 'In Progress', category: STATUS_CATEGORIES.IN_PROGRESS, color: '#3b82f6', position: 1 },
  { name: 'Done', category: STATUS_CATEGORIES.DONE, color: '#22c55e', position: 2 },
];

// Roles and grant modes.
export const USER_ROLES = {
  ADMIN: 'admin',
  MEMBER: 'member',
};

export const GRANT_MODES = {
  ALLOW: 'allow',
  DENY: 'deny',
};

export const VISIBILITY = {
  PUBLIC: 'public',
  PRIVATE: 'private',
};

// Service error codes.
export const ERROR_CODES = {
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION: 'VALIDATION',
  INVALID_PARENT: 'INVALID_PARENT',
  INVALID_STATUS: 'INVALID_STATUS',
  CONFLICT: 'CONFLICT',
};

export const TITLE_MAX_LENGTH = 500;
export const TOAST_DURATION_MS = 3000;
export const SIMULATED_DELAY_MS = 350;

export const VIEW_MODES = {
  BOARD: 'board',
  LIST: 'list',
};
