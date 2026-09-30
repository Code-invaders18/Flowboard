import { useDispatch, useSelector } from 'react-redux';
import { AppLayout } from './components/layout';
import { Board } from './components/board';
import { ListView } from './components/listView';
import { TaskDrawer } from './components/taskDrawer';
import { EmptyState, Button } from './components/common';
import {
  selectSelectedList,
  selectSelectedListId,
  selectView,
  selectContainers,
  selectUsers,
  selectGrants,
  selectCurrentUserId,
} from './store/selectors';
import { setSelectedListId } from './store/slices/uiSlice';
import { useGetTreeQuery } from './store/api';
import { canViewNode } from './services/permissions';
import { useErrorToast } from './hooks/useErrorToast';
import { VIEW_MODES } from './constants/constants';

function App() {
  const dispatch = useDispatch();
  const selectedListId = useSelector(selectSelectedListId);
  const selectedList = useSelector(selectSelectedList);
  const view = useSelector(selectView);
  const containers = useSelector(selectContainers);
  const users = useSelector(selectUsers);
  const grants = useSelector(selectGrants);
  const currentUserId = useSelector(selectCurrentUserId);
  const { isFetching } = useGetTreeQuery();

  const currentUser = users.find((u) => u.id === currentUserId) || null;
  const listStillVisible = Boolean(
    selectedList && canViewNode(selectedList, currentUser, containers, grants),
  );
  const accessDenied = Boolean(selectedListId && selectedList && !listStillVisible);

  useErrorToast(
    accessDenied,
    `403: You don't have access to "${selectedList?.name ?? 'this list'}"`,
  );

  let content;
  if (!selectedListId) {
    content = (
      <EmptyState
        title="Select a list"
        description="Choose a list from the sidebar to open its board or table view."
      />
    );
  } else if (accessDenied) {
    content = (
      <div className="flex flex-col items-center gap-3 py-10">
        <EmptyState
          title="You don't have access to this list"
          description="Switch user or pick another list from the sidebar."
        />
        <Button
          variant="secondary"
          onClick={() => dispatch(setSelectedListId(null))}
        >
          Clear selection
        </Button>
      </div>
    );
  } else if (!selectedList) {
    content = (
      <EmptyState
        title="List not found"
        description="The selected list may have been archived."
      />
    );
  } else if (view === VIEW_MODES.LIST) {
    content = <ListView list={selectedList} />;
  } else {
    content = <Board list={selectedList} />;
  }

  return (
    <AppLayout>
      <div className="relative h-full" aria-busy={isFetching ? 'true' : undefined}>
        {content}
      </div>
      <TaskDrawer />
    </AppLayout>
  );
}

export default App;
