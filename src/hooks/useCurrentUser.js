import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/selectors';

// Returns the currently switched mock user.
export function useCurrentUser() {
  return useSelector(selectCurrentUser);
}
