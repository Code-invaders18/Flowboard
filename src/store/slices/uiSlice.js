import { createSlice } from '@reduxjs/toolkit';
import { VIEW_MODES, TOAST_DURATION_MS } from '../../constants/constants';

let toastSeq = 0;

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    selectedListId: null,
    view: VIEW_MODES.BOARD,
    expandedNodeIds: [],
    openTaskId: null,
    searchQuery: '',
    toasts: [],
  },
  reducers: {
    // Selects the list shown in the main pane.
    setSelectedListId(state, action) {
      state.selectedListId = action.payload;
      state.searchQuery = '';
    },
    // Sets the client-side task search text.
    setSearchQuery(state, action) {
      state.searchQuery = action.payload || '';
    },
    // Toggles between board and list views.
    setView(state, action) {
      state.view = action.payload;
    },
    // Replaces the set of expanded sidebar node ids.
    setExpandedNodeIds(state, action) {
      state.expandedNodeIds = action.payload || [];
    },
    // Toggles a single node id in the expanded set.
    toggleExpandedNode(state, action) {
      const id = action.payload;
      if (state.expandedNodeIds.includes(id)) {
        state.expandedNodeIds = state.expandedNodeIds.filter((n) => n !== id);
      } else {
        state.expandedNodeIds.push(id);
      }
    },
    // Opens the task drawer for a task id (or closes with null).
    setOpenTaskId(state, action) {
      state.openTaskId = action.payload;
    },
    // Pushes a toast notification onto the queue.
    addToast(state, action) {
      toastSeq += 1;
      state.toasts.push({
        id: `toast-${toastSeq}`,
        type: action.payload.type || 'info',
        message: action.payload.message,
        duration: action.payload.duration ?? TOAST_DURATION_MS,
      });
    },
    // Removes a toast by id after auto-dismiss or manual close.
    removeToast(state, action) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const {
  setSelectedListId,
  setView,
  setSearchQuery,
  setExpandedNodeIds,
  toggleExpandedNode,
  setOpenTaskId,
  addToast,
  removeToast,
} = uiSlice.actions;

export default uiSlice.reducer;
