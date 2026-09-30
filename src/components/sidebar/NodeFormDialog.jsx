import { useState } from 'react';
import { Button } from '../common';
import { NODE_TYPES, TITLE_MAX_LENGTH } from '../../constants/constants';

const CHILD_TYPE = {
  [NODE_TYPES.WORKSPACE]: NODE_TYPES.SPACE,
  [NODE_TYPES.SPACE]: NODE_TYPES.FOLDER,
  [NODE_TYPES.FOLDER]: NODE_TYPES.LIST,
};

// Dialog for creating or renaming a container node.
export function NodeFormDialog({ open, mode, parentNode, node, onSubmit, onCancel }) {
  const [name, setName] = useState(node?.name || '');
  const [error, setError] = useState('');

  if (!open) return null;

  const childType = mode === 'create' ? CHILD_TYPE[parentNode?.type] : null;
  const title =
    mode === 'rename'
      ? `Rename ${node?.type}`
      : `Add ${childType || 'node'}`;

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Name is required');
      return;
    }
    if (trimmed.length > TITLE_MAX_LENGTH) {
      setError(`Name must be at most ${TITLE_MAX_LENGTH} characters`);
      return;
    }
    onSubmit(trimmed);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        aria-label="Dismiss dialog"
        className="absolute inset-0 bg-surface-overlay"
        onClick={onCancel}
      />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-sm rounded-xl bg-surface p-5 shadow-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="node-form-title"
      >
        <h2 id="node-form-title" className="text-base font-semibold text-text">
          {title}
        </h2>
        <label className="mt-3 block text-sm text-text-muted">
          Name
          <input
            autoFocus
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          />
        </label>
        {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{mode === 'rename' ? 'Save' : 'Create'}</Button>
        </div>
      </form>
    </div>
  );
}
