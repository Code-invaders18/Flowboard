import { configureStore, createSelector } from '@reduxjs/toolkit';
import { api } from './api';
import containersReducer from './slices/containersSlice';
import tasksReducer from './slices/tasksSlice';
import usersReducer from './slices/usersSlice';
import grantsReducer from './slices/grantsSlice';
import uiReducer from './slices/uiSlice';
import { createSeedState } from '../data/seedData';

// Builds a configured Redux store, optionally from preloaded seed-like state.
export function createStore(preloadedState) {
  const seed = preloadedState || createSeedState();

  return configureStore({
    reducer: {
      containers: containersReducer,
      tasks: tasksReducer,
      users: usersReducer,
      grants: grantsReducer,
      ui: uiReducer,
      [api.reducerPath]: api.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware),
    preloadedState: {
      containers: seed.containers,
      tasks: seed.tasks,
      users: {
        users: seed.users,
        currentUserId: seed.currentUserId,
      },
      grants: seed.grants,
      ...(seed.ui ? { ui: seed.ui } : {}),
    },
  });
}

const defaultStore = createStore();

export default defaultStore;
