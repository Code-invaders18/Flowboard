import { StatusBadge } from './StatusBadge';
import { STATUS_CATEGORIES } from '../../constants/constants';

export default {
  title: 'Common/StatusBadge',
  component: StatusBadge,
  args: { name: 'In Progress', category: STATUS_CATEGORIES.IN_PROGRESS },
  argTypes: { category: { control: 'select', options: Object.values(STATUS_CATEGORIES) } },
};

export const Default = {};

export const AllCategories = {
  render: () => (
    <div className="flex gap-2">
      <StatusBadge name="Todo" category={STATUS_CATEGORIES.TODO} />
      <StatusBadge name="In Progress" category={STATUS_CATEGORIES.IN_PROGRESS} />
      <StatusBadge name="Done" category={STATUS_CATEGORIES.DONE} />
    </div>
  ),
};
