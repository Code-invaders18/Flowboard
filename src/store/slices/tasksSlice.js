import { createSlice } from '@reduxjs/toolkit';

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: [],
  reducers: {
    // Upserts tasks by id into the flat array.
    upsertMany(state, action) {
      for (const item of action.payload || []) {
        const index = state.findIndex((t) => t.id === item.id);
        if (index >= 0) state[index] = item;
        else state.push(item);
      }
    },
    // Removes tasks whose ids are listed in the payload.
    removeMany(state, action) {
      const ids = new Set(action.payload || []);
      return state.filter((t) => !ids.has(t.id));
    },
  },
});

export const { upsertMany: upsertTasks, removeMany: removeTasks } = tasksSlice.actions;
export default tasksSlice.reducer;
