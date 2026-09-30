import { useDispatch, useSelector } from 'react-redux';
import { Avatar } from '../common';
import { selectUsers, selectCurrentUserId } from '../../store/selectors';
import { setCurrentUser } from '../../store/slices/usersSlice';
import { setOpenTaskId } from '../../store/slices/uiSlice';
import { api } from '../../store/api';
import { USER_ROLES } from '../../constants/constants';

// Lets the demo switch between Alice, Bob, and Carol.
export function UserSwitcher() {
  const users = useSelector(selectUsers);
  const currentUserId = useSelector(selectCurrentUserId);
  const dispatch = useDispatch();
  const current = users.find((u) => u.id === currentUserId);

  function handleChange(event) {
    const nextId = event.target.value;
    dispatch(setCurrentUser(nextId));
    dispatch(setOpenTaskId(null));
    dispatch(api.util.resetApiState());
  }

  if (!current) return null;

  return (
    <label className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2 py-1.5">
      <Avatar name={current.name} color={current.color} size="md" />
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium text-text">{current.name}</span>
        <span
          className={`text-[10px] font-semibold uppercase tracking-wide ${
            current.role === USER_ROLES.ADMIN ? 'text-brand' : 'text-text-muted'
          }`}
        >
          {current.role}
        </span>
      </span>
      <select
        aria-label="Switch user"
        value={currentUserId}
        onChange={handleChange}
        className="ml-1 max-w-[9rem] rounded-md border border-border bg-surface-muted px-2 py-1 text-sm text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name} ({user.role})
          </option>
        ))}
      </select>
    </label>
  );
}
