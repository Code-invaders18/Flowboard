import { TaskRow } from './TaskRow';
import { seedUsers, seedContainers, seedTasks } from '../../data/seedData';

const usersById = Object.fromEntries(seedUsers.map((u) => [u.id, u]));
const list = seedContainers.find((c) => c.id === 'li-backlog');
const task = seedTasks.find((t) => t.primaryListId === list.id);
const status = list.statuses.find((s) => s.id === task.status);

export default {
  title: 'ListView/TaskRow',
  component: TaskRow,
  args: { task, status, usersById, onOpen: () => {} },
  decorators: [
    (Story) => (
      <table className="w-full bg-surface">
        <tbody>
          <Story />
        </tbody>
      </table>
    ),
  ],
};

export const Default = {};
export const Overdue = { args: { task: { ...task, dueDate: '2020-01-01T00:00:00.000Z' } } };
