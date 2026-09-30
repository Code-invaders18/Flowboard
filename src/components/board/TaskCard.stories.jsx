import { TaskCard } from './TaskCard';
import { seedUsers, seedTasks } from '../../data/seedData';

const usersById = Object.fromEntries(seedUsers.map((u) => [u.id, u]));
const task = seedTasks[0];

export default {
  title: 'Board/TaskCard',
  component: TaskCard,
  args: {
    task,
    usersById,
    onOpen: () => {},
    onDragStart: () => {},
    dragging: false,
  },
  decorators: [(Story) => <div className="w-72"><Story /></div>],
};

export const Default = {};
export const Dragging = { args: { dragging: true } };
export const Overdue = {
  args: { task: { ...task, dueDate: '2020-01-01T00:00:00.000Z', priority: 'urgent' } },
};
export const NoAssigneesNoDue = { args: { task: { ...task, assigneeIds: [], dueDate: null } } };
