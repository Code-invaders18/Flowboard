import { Avatar } from './Avatar';

export default {
  title: 'Common/Avatar',
  component: Avatar,
  args: { name: 'Alice', color: '#2563eb', size: 'md' },
  argTypes: { size: { control: 'select', options: ['sm', 'md', 'lg'] } },
};

export const Default = {};
export const Bob = { args: { name: 'Bob', color: '#16a34a' } };
export const Carol = { args: { name: 'Carol', color: '#db2777' } };
