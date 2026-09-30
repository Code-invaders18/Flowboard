import { USER_ROLES, GRANT_MODES, VISIBILITY } from '../constants/constants';

// Returns true when the user has the admin role.
export function isAdmin(user) {
  return Boolean(user && user.role === USER_ROLES.ADMIN);
}

// Evaluates whether a user may view a container node given parent visibility.
export function canViewNode(node, user, containers, grants) {
  if (!node || !user) return false;
  if (node.archivedAt) return false;
  if (isAdmin(user)) return true;

  if (node.parentId) {
    const parent = containers.find((c) => c.id === node.parentId);
    if (!canViewNode(parent, user, containers, grants)) return false;
  }

  const grant = grants.find((g) => g.resourceId === node.id && g.userId === user.id);
  if (grant) return grant.mode === GRANT_MODES.ALLOW;
  if (node.visibility === VISIBILITY.PRIVATE) return false;
  return true;
}

// Members may edit tasks only in lists they can view; admins always can.
export function canEditTask(list, user, containers, grants) {
  if (!user) return false;
  if (isAdmin(user)) return true;
  return canViewNode(list, user, containers, grants);
}
