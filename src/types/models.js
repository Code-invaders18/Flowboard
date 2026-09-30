// JSDoc type definitions for the client data layer (project is JavaScript-only by design).

/**
 * @typedef {'admin' | 'member'} UserRole
 * @typedef {{ id: string, name: string, role: UserRole, color: string }} User
 */

/**
 * @typedef {'todo' | 'in_progress' | 'done'} StatusCategory
 * @typedef {{ id: string, name: string, category: StatusCategory, color: string, position: number }} Status
 */

/**
 * @typedef {'workspace' | 'space' | 'folder' | 'list'} NodeType
 * @typedef {'public' | 'private'} Visibility
 * @typedef {Object} Container
 * @property {string} id
 * @property {string} name
 * @property {NodeType} type
 * @property {string | null} parentId
 * @property {number} position
 * @property {Visibility} visibility
 * @property {string | null} archivedAt ISO timestamp when soft-deleted, else null.
 * @property {Status[]} [statuses] Only present on lists.
 */

/**
 * @typedef {'urgent' | 'high' | 'normal' | 'low' | 'none'} Priority
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} title Required, max 500 chars.
 * @property {string} description
 * @property {string} status Id of a status defined on the task's list.
 * @property {Priority} priority
 * @property {string[]} assigneeIds
 * @property {string | null} dueDate ISO datetime.
 * @property {number} position Order within the status column.
 * @property {string} primaryListId
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {{ resourceId: string, userId: string, mode: 'allow' | 'deny' }} Grant
 * @typedef {{ error: { code: string, message: string } }} ServiceError
 */

export {};
