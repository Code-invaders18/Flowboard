import { useDispatch, useSelector } from 'react-redux';
import { UserSwitcher } from '../userSwitcher';
import { selectBreadcrumb, selectView, selectSearchQuery, selectSelectedListId } from '../../store/selectors';
import { setView, setSearchQuery } from '../../store/slices/uiSlice';
import { VIEW_MODES } from '../../constants/constants';

// App top bar with brand, breadcrumb, view toggle, and user switcher.
export function TopBar() {
  const breadcrumb = useSelector(selectBreadcrumb);
  const view = useSelector(selectView);
  const searchQuery = useSelector(selectSearchQuery);
  const selectedListId = useSelector(selectSelectedListId);
  const dispatch = useDispatch();

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-surface px-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <h1 className="text-lg font-bold tracking-tight text-brand">Flowboard</h1>
        {breadcrumb.length > 0 ? (
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1 text-sm text-text-muted">
            {breadcrumb.map((node, index) => (
              <span key={node.id} className="flex min-w-0 items-center gap-1">
                {index > 0 ? <span aria-hidden="true">/</span> : null}
                <span
                  className={`truncate ${
                    index === breadcrumb.length - 1 ? 'font-medium text-text' : ''
                  }`}
                >
                  {node.name}
                </span>
              </span>
            ))}
          </nav>
        ) : (
          <span className="text-sm text-text-muted">Select a list</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {selectedListId ? (
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            placeholder="Search tasks…"
            aria-label="Search tasks"
            className="w-48 rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          />
        ) : null}
        <div className="inline-flex rounded-md border border-border p-0.5" role="group" aria-label="View mode">
          <button
            type="button"
            onClick={() => dispatch(setView(VIEW_MODES.BOARD))}
            className={`rounded px-2.5 py-1 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
              view === VIEW_MODES.BOARD
                ? 'bg-brand text-text-inverse'
                : 'text-text-muted hover:bg-surface-muted hover:text-text'
            }`}
          >
            Board
          </button>
          <button
            type="button"
            onClick={() => dispatch(setView(VIEW_MODES.LIST))}
            className={`rounded px-2.5 py-1 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
              view === VIEW_MODES.LIST
                ? 'bg-brand text-text-inverse'
                : 'text-text-muted hover:bg-surface-muted hover:text-text'
            }`}
          >
            List
          </button>
        </div>
        <UserSwitcher />
      </div>
    </header>
  );
}
