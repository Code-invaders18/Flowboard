import { useDispatch } from 'react-redux';
import { addToast } from '../store/slices/uiSlice';

// Wraps an RTK Query mutation trigger with success/error toasts.
export function useRunMutation() {
  const dispatch = useDispatch();

  return async function runMutation(trigger, arg, successMessage) {
    try {
      await trigger(arg).unwrap();
      if (successMessage) {
        dispatch(addToast({ type: 'success', message: successMessage }));
      }
      return true;
    } catch (err) {
      dispatch(
        addToast({
          type: 'error',
          message: err?.message || 'Something went wrong',
        }),
      );
      return false;
    }
  };
}
