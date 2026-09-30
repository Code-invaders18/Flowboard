import { EmptyState } from './EmptyState';

export default {
  title: 'Common/EmptyState',
  component: EmptyState,
  args: { title: 'No tasks', description: 'Drop a card here or add one below.' },
};

export const Default = {};
export const TitleOnly = { args: { description: undefined } };
