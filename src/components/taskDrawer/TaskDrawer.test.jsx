import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { TaskDrawer } from './TaskDrawer';
import { createStore } from '../../store/store';
import { createSeedState } from '../../data/seedData';
import { setOpenTaskId } from '../../store/slices/uiSlice';
import { ToastContainer } from '../common';

// Opens the drawer for a seeded task inside a fresh store.
function renderDrawer(taskId = 't-1') {
  const store = createStore(createSeedState());
  store.dispatch(setOpenTaskId(taskId));
  render(
    <Provider store={store}>
      <TaskDrawer />
      <ToastContainer />
    </Provider>,
  );
  return store;
}

describe('TaskDrawer', () => {
  it('closes on Escape', async () => {
    const user = userEvent.setup();
    const store = renderDrawer('t-1');

    expect(await screen.findByText('Task details')).toBeInTheDocument();
    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(store.getState().ui.openTaskId).toBeNull();
    });
  });

  it('closes when the overlay is clicked', async () => {
    const user = userEvent.setup();
    const store = renderDrawer('t-1');

    await screen.findByText('Task details');
    await user.click(document.querySelector('.bg-surface-overlay'));

    await waitFor(() => {
      expect(store.getState().ui.openTaskId).toBeNull();
    });
  });

  it('shows a validation message for an empty title', async () => {
    const user = userEvent.setup();
    renderDrawer('t-1');

    const titleInput = await screen.findByDisplayValue('Define API contracts');
    await user.clear(titleInput);
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Title is required')).toBeInTheDocument();
  });
});
