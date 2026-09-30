import { ConfirmDialog } from './ConfirmDialog';

export default {
  title: 'Common/ConfirmDialog',
  component: ConfirmDialog,
  args: {
    open: true,
    title: 'Delete task?',
    message: 'This permanently removes the task. This cannot be undone.',
    confirmLabel: 'Delete',
  },
};

export const Default = {};
