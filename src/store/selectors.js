import { createSelector } from '@reduxjs/toolkit';

// Store selectors (state shape lives in store.js).
export const selectUsers = (state) => state.users.users;
export const selectCurrentUserId = (state) => state.users.currentUserId;
export const selectContainers = (state) => state.containers;
export const selectTasks = (state) => state.tasks;
export const selectGrants = (state) => state.grants;
export const selectSelectedListId = (state) => state.ui.selectedListId;
export const selectSearchQuery = (state) => state.ui.searchQuery;
export const selectView = (state) => state.ui.view;
export const selectExpandedNodeIds = (state) => state.ui.expandedNodeIds;
export const selectOpenTaskId = (state) => state.ui.openTaskId;
export const selectToasts = (state) => state.ui.toasts;

// Returns the current user object.
export const selectCurrentUser = createSelector(
  [selectUsers, selectCurrentUserId],
  (users, currentUserId) => users.find((u) => u.id === currentUserId) || null,
);

// Returns the currently selected list container.
export const selectSelectedList = createSelector(
  [selectContainers, selectSelectedListId],
  (containers, listId) => containers.find((c) => c.id === listId) || null,
);

// Returns breadcrumb path names for the selected list.
export const selectBreadcrumb = createSelector(
  [selectContainers, selectSelectedListId],
  (containers, listId) => {
    if (!listId) return [];
    const path = [];
    let current = containers.find((c) => c.id === listId) || null;
    while (current) {
      path.unshift(current);
      current = current.parentId
        ? containers.find((c) => c.id === current.parentId) || null
        : null;
    }
    return path;
  },
);
