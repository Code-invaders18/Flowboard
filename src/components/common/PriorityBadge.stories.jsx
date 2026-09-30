import { PriorityBadge } from './PriorityBadge';
import { PRIORITIES } from '../../constants/constants';

export default {
  title: 'Common/PriorityBadge',
  component: PriorityBadge,
  args: { priority: 'urgent' },
  argTypes: { priority: { control: 'select', options: PRIORITIES } },
};

export const Default = {};

export const AllPriorities = {
  render: () => (
    <div className="flex gap-2">
      {PRIORITIES.map((p) => (
        <PriorityBadge key={p} priority={p} />
      ))}
    </div>
  ),
};
