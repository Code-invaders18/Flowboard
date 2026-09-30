import { TaskForm } from './TaskForm';
import { seedUsers, seedContainers, seedTasks } from '../../data/seedData';

const lists = seedContainers.filter((c) => c.type === 'list');
const list = lists[0];
const task = seedTasks.find((t) => t.primaryListId === list.id);

export default {
  title: 'TaskDrawer/TaskForm',
  component: TaskForm,
  args: {
    task,
    list,
    accessibleLists: lists,
    users: seedUsers,
    onSave: async () => {},
    onDelete: () => {},
    onMoveList: async () => true,
  },
  decorators: [(Story) => <div className="h-[40rem] w-96 bg-surface"><Story /></div>],
};

export const Default = {};
