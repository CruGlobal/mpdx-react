import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const DynamicMassActionsEditTasksModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "MassActionsEditTasksModal" */ './MassActionsEditTasksModal'
    ).then(({ MassActionsEditTasksModal }) => MassActionsEditTasksModal),
  { loading: DynamicModalPlaceholder },
);
