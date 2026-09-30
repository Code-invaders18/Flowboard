import { memo, useCallback } from 'react';
import { NODE_TYPES, VISIBILITY } from '../../constants/constants';

const TYPE_ICON = {
  [NODE_TYPES.WORKSPACE]: 'W',
  [NODE_TYPES.SPACE]: 'S',
  [NODE_TYPES.FOLDER]: 'F',
  [NODE_TYPES.LIST]: 'L',
};

// Recursive collapsible tree node with admin actions and sibling DnD.
export const TreeNode = memo(function TreeNode({
  node,
  expandedIds,
  selectedListId,
  isAdmin,
  onToggle,
  onSelectList,
  onEmptyNode,
  onAddChild,
  onRename,
  onArchive,
  onDragStart,
  onDragOver,
  onDrop,
  dropIndicator,
}) {
  const isExpanded = expandedIds.includes(node.id);
  const hasChildren = node.children?.length > 0;
  const isList = node.type === NODE_TYPES.LIST;
  const canHaveChild = node.type !== NODE_TYPES.LIST;
  const selected = isList && selectedListId === node.id;
  const showDropBefore = dropIndicator?.nodeId === node.id && dropIndicator?.position === 'before';
  const showDropAfter = dropIndicator?.nodeId === node.id && dropIndicator?.position === 'after';

  const handleToggle = useCallback(
    (event) => {
      event.stopPropagation();
      onToggle(node.id);
    },
    [node.id, onToggle],
  );

  const handleClick = useCallback(() => {
    if (isList) onSelectList(node.id);
    else if (!hasChildren) onEmptyNode(node);
    else onToggle(node.id);
  }, [isList, hasChildren, node, onSelectList, onEmptyNode, onToggle]);

  return (
    <li className="relative">
      {showDropBefore ? (
        <div className="absolute left-2 right-2 top-0 h-0.5 bg-brand" aria-hidden="true" />
      ) : null}
      <div
        draggable={isAdmin}
        onDragStart={(e) => onDragStart(e, node)}
        onDragOver={(e) => onDragOver(e, node)}
        onDrop={(e) => onDrop(e, node)}
        className={`group flex items-center gap-1 rounded-md px-1 py-1 text-sm ${
          selected ? 'bg-brand-muted text-brand' : 'text-text hover:bg-surface'
        }`}
      >
        {canHaveChild || hasChildren ? (
          <button
            type="button"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
            onClick={handleToggle}
            className="flex h-5 w-5 items-center justify-center rounded text-text-muted hover:bg-border focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            {isExpanded ? '▾' : '▸'}
          </button>
        ) : (
          <span className="inline-block w-5" />
        )}
        <button
          type="button"
          onClick={handleClick}
          className="flex min-w-0 flex-1 items-center gap-1.5 rounded px-1 py-0.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-surface text-[10px] font-bold text-text-muted">
            {TYPE_ICON[node.type]}
          </span>
          <span className="truncate font-medium">{node.name}</span>
          {node.visibility === VISIBILITY.PRIVATE ? (
            <span className="shrink-0 text-[10px] uppercase text-text-muted">private</span>
          ) : null}
        </button>
        {isAdmin ? (
          <span className="hidden shrink-0 items-center gap-0.5 group-hover:flex group-focus-within:flex">
            {canHaveChild ? (
              <button
                type="button"
                aria-label={`Add child under ${node.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onAddChild(node);
                }}
                className="rounded px-1 text-xs text-text-muted hover:bg-border hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                +
              </button>
            ) : null}
            <button
              type="button"
              aria-label={`Rename ${node.name}`}
              onClick={(e) => {
                e.stopPropagation();
                onRename(node);
              }}
              className="rounded px-1 text-xs text-text-muted hover:bg-border hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              ✎
            </button>
            {node.type !== NODE_TYPES.WORKSPACE ? (
              <button
                type="button"
                aria-label={`Archive ${node.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onArchive(node);
                }}
                className="rounded px-1 text-xs text-danger hover:bg-danger-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-danger"
              >
                ⌫
              </button>
            ) : null}
          </span>
        ) : null}
      </div>
      {showDropAfter ? (
        <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-brand" aria-hidden="true" />
      ) : null}
      {isExpanded && hasChildren ? (
        <ul className="m-0 list-none p-0 pl-3">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              expandedIds={expandedIds}
              selectedListId={selectedListId}
              isAdmin={isAdmin}
              onToggle={onToggle}
              onSelectList={onSelectList}
              onEmptyNode={onEmptyNode}
              onAddChild={onAddChild}
              onRename={onRename}
              onArchive={onArchive}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
              dropIndicator={dropIndicator}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
});
