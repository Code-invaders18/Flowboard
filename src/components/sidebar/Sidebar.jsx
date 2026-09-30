import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TreeNode } from './TreeNode';
import { SidebarSkeleton } from './SidebarSkeleton';
import { NodeFormDialog } from './NodeFormDialog';
import { ConfirmDialog, EmptyState } from '../common';
import {
  useGetTreeQuery,
  useCreateContainerMutation,
  useRenameContainerMutation,
  useReorderContainerMutation,
  useArchiveContainerMutation,
} from '../../store/api';
import {
  selectExpandedNodeIds,
  selectSelectedListId,
} from '../../store/selectors';
import {
  setExpandedNodeIds,
  setOpenTaskId,
  setSelectedListId,
  toggleExpandedNode,
  addToast,
} from '../../store/slices/uiSlice';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useRunMutation } from '../../hooks/useRunMutation';
import { useErrorToast } from '../../hooks/useErrorToast';
import { CHILD_TYPE, USER_ROLES } from '../../constants/constants';

// Left navigation tree of workspace containers.
export function Sidebar() {
  const { data: tree, isLoading, isError, error } = useGetTreeQuery();
  const dispatch = useDispatch();
  const expandedIds = useSelector(selectExpandedNodeIds);
  const selectedListId = useSelector(selectSelectedListId);
  const currentUser = useCurrentUser();
  const runMutation = useRunMutation();
  useErrorToast(isError, error?.message || 'Unable to load the workspace tree');
  const isAdmin = currentUser?.role === USER_ROLES.ADMIN;

  const [createContainer] = useCreateContainerMutation();
  const [renameContainer] = useRenameContainerMutation();
  const [reorderContainer] = useReorderContainerMutation();
  const [archiveContainer] = useArchiveContainerMutation();

  const [formState, setFormState] = useState(null);
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [dragNode, setDragNode] = useState(null);
  const [dropIndicator, setDropIndicator] = useState(null);

  // Expand root workspace once when tree first loads.
  useEffect(() => {
    if (!tree?.length || expandedIds.length) return;
    const root = tree[0];
    if (root) dispatch(setExpandedNodeIds([root.id]));
  }, [tree, expandedIds.length, dispatch]);

  const roots = useMemo(() => tree || [], [tree]);

  const onToggle = useCallback(
    (id) => dispatch(toggleExpandedNode(id)),
    [dispatch],
  );

  const onSelectList = useCallback(
    (id) => dispatch(setSelectedListId(id)),
    [dispatch],
  );

  // Explains why a container can't be opened: non-admins only see what they were granted.
  const onEmptyNode = useCallback(
    (node) => {
      dispatch(
        addToast({
          type: isAdmin ? 'info' : 'error',
          message: isAdmin
            ? `"${node.name}" has no lists yet`
            : `403: You don't have access to any lists in "${node.name}"`,
        }),
      );
    },
    [dispatch, isAdmin],
  );

  const onAddChild = useCallback((node) => {
    setFormState({ mode: 'create', parentNode: node });
  }, []);

  const onRename = useCallback((node) => {
    setFormState({ mode: 'rename', node });
  }, []);

  const onArchive = useCallback((node) => {
    setArchiveTarget(node);
  }, []);

  const onDragStart = useCallback((event, node) => {
    setDragNode(node);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', node.id);
  }, []);

  const onDragOver = useCallback(
    (event, node) => {
      if (!dragNode || dragNode.id === node.id) return;
      if (dragNode.parentId !== node.parentId) return;
      event.preventDefault();
      const rect = event.currentTarget.getBoundingClientRect();
      const before = event.clientY < rect.top + rect.height / 2;
      setDropIndicator({ nodeId: node.id, position: before ? 'before' : 'after' });
    },
    [dragNode],
  );

  const onDrop = useCallback(
    async (event, node) => {
      event.preventDefault();
      if (!dragNode || dragNode.parentId !== node.parentId || dragNode.id === node.id) {
        setDragNode(null);
        setDropIndicator(null);
        return;
      }
      const siblings = (findSiblings(roots, node.parentId) || []).filter((n) => !n.archivedAt);
      const targetIndex = siblings.findIndex((s) => s.id === node.id);
      const before = dropIndicator?.position === 'before';
      let toIndex = before ? targetIndex : targetIndex + 1;
      const fromIndex = siblings.findIndex((s) => s.id === dragNode.id);
      if (fromIndex < toIndex) toIndex -= 1;
      setDragNode(null);
      setDropIndicator(null);
      await runMutation(
        reorderContainer,
        { containerId: dragNode.id, toIndex },
        'Container reordered',
      );
    },
    [dragNode, dropIndicator, roots, reorderContainer, runMutation],
  );

  async function handleFormSubmit(name) {
    if (formState?.mode === 'create') {
      const type = CHILD_TYPE[formState.parentNode.type];
      const ok = await runMutation(
        createContainer,
        { type, parentId: formState.parentNode.id, name },
        'Container created',
      );
      if (ok) {
        dispatch(toggleExpandedNode(formState.parentNode.id));
        setFormState(null);
      }
      return;
    }
    if (formState?.mode === 'rename') {
      const ok = await runMutation(
        renameContainer,
        { containerId: formState.node.id, name },
        'Container renamed',
      );
      if (ok) setFormState(null);
    }
  }

  async function handleArchiveConfirm() {
    if (!archiveTarget) return;
    const ok = await runMutation(
      archiveContainer,
      { containerId: archiveTarget.id },
      'Container archived',
    );
    if (ok) {
      if (selectedListId && isDescendantList(archiveTarget, selectedListId)) {
        dispatch(setSelectedListId(null));
        dispatch(setOpenTaskId(null));
      }
      setArchiveTarget(null);
    }
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-surface-sidebar">
      <div className="border-b border-border px-3 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
        Workspace
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {isLoading ? <SidebarSkeleton /> : null}
        {!isLoading && isError ? (
          <EmptyState
            title="Unable to load tree"
            description={error?.message || 'Please try switching users.'}
          />
        ) : null}
        {!isLoading && !isError && roots.length === 0 ? (
          <EmptyState
            title="Nothing to show"
            description="You do not have access to any containers."
          />
        ) : null}
        {!isLoading && !isError && roots.length > 0 ? (
          <ul className="m-0 list-none p-0">
            {roots.map((node) => (
              <TreeNode
                key={node.id}
                node={node}
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
      </div>

      {formState ? (
        <NodeFormDialog
          key={`${formState.mode}-${formState.node?.id || formState.parentNode?.id}`}
          open
          mode={formState.mode}
          parentNode={formState.parentNode}
          node={formState.node}
          onSubmit={handleFormSubmit}
          onCancel={() => setFormState(null)}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(archiveTarget)}
        title="Archive container?"
        message={`Archive "${archiveTarget?.name}" and all of its descendants? Tasks in archived lists become unreachable.`}
        confirmLabel="Archive"
        onConfirm={handleArchiveConfirm}
        onCancel={() => setArchiveTarget(null)}
      />
    </aside>
  );
}

// Finds sibling nodes under a parent from the visible tree.
function findSiblings(roots, parentId) {
  if (!parentId) return roots;
  const stack = [...roots];
  while (stack.length) {
    const node = stack.pop();
    if (node.id === parentId) return node.children || [];
    if (node.children) stack.push(...node.children);
  }
  return [];
}

// Checks whether selectedListId lives under an archived subtree root.
function isDescendantList(root, listId) {
  if (root.id === listId) return true;
  const stack = [...(root.children || [])];
  while (stack.length) {
    const node = stack.pop();
    if (node.id === listId) return true;
    if (node.children) stack.push(...node.children);
  }
  return false;
}
