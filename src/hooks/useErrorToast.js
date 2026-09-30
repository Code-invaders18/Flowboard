import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addToast } from '../store/slices/uiSlice';

// Shows an error toast once whenever `active` flips on (e.g. access denied or failed query).
export function useErrorToast(active, message) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (active && message) {
      dispatch(addToast({ type: 'error', message }));
    }
  }, [active, message, dispatch]);
}
