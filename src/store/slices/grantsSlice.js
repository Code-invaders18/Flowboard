import { createSlice } from '@reduxjs/toolkit';

const grantsSlice = createSlice({
  name: 'grants',
  initialState: [],
  reducers: {
    // Replaces all grants (seed hydration).
    setGrants(_state, action) {
      return action.payload || [];
    },
  },
});

export const { setGrants } = grantsSlice.actions;
export default grantsSlice.reducer;
