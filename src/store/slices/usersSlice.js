import { createSlice } from '@reduxjs/toolkit';

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    users: [],
    currentUserId: null,
  },
  reducers: {
    // Switches the active mock user id.
    setCurrentUser(state, action) {
      state.currentUserId = action.payload;
    },
  },
});

export const { setCurrentUser } = usersSlice.actions;
export default usersSlice.reducer;
