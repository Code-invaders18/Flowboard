import { Button } from './Button';

export default {
  title: 'Common/Button',
  component: Button,
  args: { children: 'Button' },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'danger', 'ghost'] },
  },
};

export const Primary = {};
export const Secondary = { args: { variant: 'secondary' } };
export const Danger = { args: { variant: 'danger', children: 'Delete' } };
export const Ghost = { args: { variant: 'ghost' } };
export const Disabled = { args: { disabled: true } };
