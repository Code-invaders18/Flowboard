import { describe, it, expect } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { Sidebar } from './Sidebar';
import { createStore } from '../../store/store';
import { createSeedState } from '../../data/seedData';
import { ToastContainer } from '../common';
import { setCurrentUser } from '../../store/slices/usersSlice';
import { api } from '../../store/api';

// Renders the sidebar against a fresh seeded store.
function renderSidebar(store) {
  return render(
    <Provider store={store}>
      <Sidebar />
      <ToastContainer />
    </Provider>,
  );
}

describe('Sidebar', () => {
  it('shows Marketing for Alice and hides it for Bob after switching users', async () => {
    const store = createStore(createSeedState());
    const user = userEvent.setup();
    renderSidebar(store);

    expect(await screen.findByText('Marketing')).toBeInTheDocument();
    await user.click(screen.getByText('Engineering'));

    await act(async () => {
      store.dispatch(setCurrentUser('u-bob'));
      store.dispatch(api.util.resetApiState());
    });

    await waitFor(() => {
      expect(screen.queryByText('Marketing')).not.toBeInTheDocument();
    });
    expect(await screen.findByText('Engineering')).toBeInTheDocument();
  });
});
