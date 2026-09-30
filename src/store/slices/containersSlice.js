import { createSlice } from '@reduxjs/toolkit';

const containersSlice = createSlice({
  name: 'containers',
  initialState: [],
  reducers: {
    // Upserts containers by id into the flat array.
    upsertMany(state, action) {
      for (const item of action.payload || []) {
        const index = state.findIndex((c) => c.id === item.id);
        if (index >= 0) state[index] = item;
        else state.push(item);
      }
    },
    // Removes containers whose ids are listed in the payload.
    removeMany(state, action) {
      const ids = new Set(action.payload || []);
      return state.filter((c) => !ids.has(c.id));
    },
  },
});

export const { upsertMany: upsertContainers, removeMany: removeContainers } = containersSlice.actions;
export default containersSlice.reducer;
