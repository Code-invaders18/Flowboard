import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectToasts } from '../../store/selectors';
import { removeToast } from '../../store/slices/uiSlice';

// Renders and auto-dismisses toast notifications.
export function ToastContainer() {
  const toasts = useSelector(selectToasts);
  const dispatch = useDispatch();

  useEffect(() => {
    const timers = toasts.map((toast) =>
      setTimeout(() => {
        dispatch(removeToast(toast.id));
      }, toast.duration),
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts, dispatch]);

  if (!toasts.length) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-80 flex-col gap-2">
      {toasts.map((toast) => {
        const tone =
          toast.type === 'error'
            ? 'border-danger bg-danger-muted text-danger'
            : toast.type === 'success'
              ? 'border-success bg-success-muted text-success'
              : 'border-border bg-surface text-text';

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto rounded-lg border px-3 py-2 text-sm shadow-card ${tone}`}
          >
            {toast.message}
          </div>
        );
      })}
    </div>
  );
}
