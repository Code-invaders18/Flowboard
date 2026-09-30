import { Button } from '../common';

// Toggle controls for sorting the dense list view.
export function SortControls({ sortKey, sortDir, onChange }) {
  function toggle(key) {
    if (sortKey === key) {
      onChange(key, sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      onChange(key, 'asc');
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-text-muted">Sort:</span>
      <Button
        variant={sortKey === 'dueDate' ? 'primary' : 'secondary'}
        onClick={() => toggle('dueDate')}
        aria-label="Sort by due date"
      >
        Due date {sortKey === 'dueDate' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
      </Button>
      <Button
        variant={sortKey === 'priority' ? 'primary' : 'secondary'}
        onClick={() => toggle('priority')}
        aria-label="Sort by priority"
      >
        Priority {sortKey === 'priority' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
      </Button>
    </div>
  );
}
