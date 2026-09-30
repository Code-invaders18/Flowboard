import { SortControls } from './SortControls';

export default {
  title: 'ListView/SortControls',
  component: SortControls,
  args: { sortKey: 'dueDate', sortDir: 'asc', onChange: () => {} },
};

export const DueDate = {};
export const PriorityDescending = { args: { sortKey: 'priority', sortDir: 'desc' } };
