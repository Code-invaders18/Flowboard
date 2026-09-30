import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { SIMULATED_DELAY_MS } from '../constants/constants';
import * as service from '../services/service';
import { upsertContainers } from './slices/containersSlice';
import { upsertTasks, removeTasks } from './slices/tasksSlice';

// Resolves simulated network delay (zero in tests).
function delayMs() {
  if (import.meta.env.MODE === 'test') return 0;
  return SIMULATED_DELAY_MS;
}

// Sleeps for the configured simulated latency.
function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// Assembles the pure-service state snapshot from the Redux store.
export function selectServiceState(rootState) {
  return {
    containers: rootState.containers,
    tasks: rootState.tasks,
    users: rootState.users.users,
    grants: rootState.grants,
    currentUserId: rootState.users.currentUserId,
  };
}

// Applies mutation upserts/removals returned by the service layer.
function applyMutationResult(dispatch, data) {
  if (data.upsertContainers?.length) {
    dispatch(upsertContainers(data.upsertContainers));
  }
  if (data.upsertTasks?.length) {
    dispatch(upsertTasks(data.upsertTasks));
  }
  if (data.removeTaskIds?.length) {
    dispatch(removeTasks(data.removeTaskIds));
  }
}

// Converts a service result into an RTK Query queryFn response.
function toQueryResult(result) {
  if (result.error) {
    return { error: result.error };
  }
  return { data: result.data };
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Tree', 'Tasks'],
  endpoints: (builder) => ({
    getTree: builder.query({
      async queryFn(_arg, api) {
        await wait(delayMs());
        const state = selectServiceState(api.getState());
        return toQueryResult(service.getVisibleTree(state));
      },
      providesTags: ['Tree'],
    }),
    getTasksByList: builder.query({
      async queryFn(listId, api) {
        await wait(delayMs());
        const state = selectServiceState(api.getState());
        return toQueryResult(service.getTasksByList(state, listId));
      },
      providesTags: (_result, _err, listId) => [{ type: 'Tasks', id: listId }],
    }),
    createContainer: builder.mutation({
      async queryFn(payload, api) {
        const state = selectServiceState(api.getState());
        const result = service.createContainer(state, payload);
        if (result.error) return { error: result.error };
        applyMutationResult(api.dispatch, result.data);
        return { data: result.data.result };
      },
      invalidatesTags: ['Tree'],
    }),
    renameContainer: builder.mutation({
      async queryFn(payload, api) {
        const state = selectServiceState(api.getState());
        const result = service.renameContainer(state, payload);
        if (result.error) return { error: result.error };
        applyMutationResult(api.dispatch, result.data);
        return { data: result.data.result };
      },
      invalidatesTags: ['Tree'],
    }),
    reorderContainer: builder.mutation({
      async queryFn(payload, api) {
        const state = selectServiceState(api.getState());
        const result = service.reorderContainer(state, payload);
        if (result.error) return { error: result.error };
        applyMutationResult(api.dispatch, result.data);
        return { data: result.data.result };
      },
      invalidatesTags: ['Tree'],
    }),
    archiveContainer: builder.mutation({
      async queryFn(payload, api) {
        const state = selectServiceState(api.getState());
        const result = service.archiveContainer(state, payload);
        if (result.error) return { error: result.error };
        applyMutationResult(api.dispatch, result.data);
        return { data: result.data.result };
      },
      invalidatesTags: ['Tree', 'Tasks'],
    }),
    createTask: builder.mutation({
      async queryFn(payload, api) {
        const state = selectServiceState(api.getState());
        const result = service.createTask(state, payload);
        if (result.error) return { error: result.error };
        applyMutationResult(api.dispatch, result.data);
        return { data: result.data.result };
      },
      invalidatesTags: (_r, _e, arg) => [{ type: 'Tasks', id: arg.listId }],
    }),
    updateTask: builder.mutation({
      async queryFn(payload, api) {
        const state = selectServiceState(api.getState());
        const result = service.updateTask(state, payload);
        if (result.error) return { error: result.error };
        applyMutationResult(api.dispatch, result.data);
        return { data: result.data.result };
      },
      invalidatesTags: ['Tasks'],
    }),
    moveTask: builder.mutation({
      async queryFn(payload, api) {
        const state = selectServiceState(api.getState());
        const result = service.moveTask(state, payload);
        if (result.error) return { error: result.error };
        applyMutationResult(api.dispatch, result.data);
        return { data: result.data.result };
      },
      invalidatesTags: ['Tasks'],
    }),
    deleteTask: builder.mutation({
      async queryFn(payload, api) {
        const state = selectServiceState(api.getState());
        const result = service.deleteTask(state, payload);
        if (result.error) return { error: result.error };
        applyMutationResult(api.dispatch, result.data);
        return { data: result.data.result };
      },
      invalidatesTags: ['Tasks'],
    }),
  }),
});

export const {
  useGetTreeQuery,
  useGetTasksByListQuery,
  useCreateContainerMutation,
  useRenameContainerMutation,
  useReorderContainerMutation,
  useArchiveContainerMutation,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useMoveTaskMutation,
  useDeleteTaskMutation,
} = api;
