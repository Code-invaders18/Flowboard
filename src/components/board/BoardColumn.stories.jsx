import { BoardColumn } from './BoardColumn';
import { seedUsers, seedContainers, seedTasks } from '../../data/seedData';

const usersById = Object.fromEntries(seedUsers.map((u) => [u.id, u]));
const list = seedContainers.find((c) => c.id === 'li-backlog');
const status = list.statuses[0];
const tasks = seedTasks.filter((t) => t.primaryListId === list.id && t.status === status.id);
const noop = () => {};

export default {
  title: 'Board/BoardColumn',
  component: BoardColumn,
  args: {
    status,
    tasks,
    usersById,
    isOver: false,
    draggingTaskId: null,
    onOpenTask: noop,
    onDragStartCard: noop,
    onDragOverColumn: noop,
    onDropOnColumn: noop,
    onDragOverCard: noop,
    onDropOnCard: noop,
    onAddTask: async () => true,
  },
};

export const Default = {};
export const DropTarget = { args: { isOver: true } };
export const Empty = { args: { tasks: [] } };
