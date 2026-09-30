import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ToastContainer } from './ToastContainer';
import { addToast } from '../../store/slices/uiSlice';

// Dispatches one toast of each type (long duration so they stay visible).
function ToastDemo() {
  const dispatch = useDispatch();
  useEffect(() => {
    const duration = 600000;
    dispatch(addToast({ type: 'success', message: 'Task updated', duration }));
    dispatch(addToast({ type: 'error', message: 'You cannot edit this task', duration }));
    dispatch(addToast({ type: 'info', message: 'Heads up', duration }));
  }, [dispatch]);
  return <ToastContainer />;
}

export default { title: 'Common/ToastContainer', component: ToastContainer };

export const AllTones = { render: () => <ToastDemo /> };
