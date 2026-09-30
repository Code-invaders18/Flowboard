import { TopBar } from './TopBar';
import { Sidebar } from '../sidebar';
import { ToastContainer } from '../common';

// Shell layout: sidebar + top bar + main content + toasts.
export function AppLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-surface-muted font-sans text-text">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="min-h-0 flex-1 overflow-auto">{children}</main>
      </div>
      <ToastContainer />
    </div>
  );
}
