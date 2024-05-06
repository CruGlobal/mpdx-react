import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const preloadMassActionsEditTasksModal = () =>
  import(
    /* webpackChunkName: "MassActionsEditTasksModal" */ './MassActionsEditTasksModal'
  ).then(({ MassActionsEditTasksModal }) => MassActionsEditTasksModal);

export const DynamicMassActionsEditTasksModal = dynamic(
  preloadMassActionsEditTasksModal,
  { loading: DynamicModalPlaceholder },
);
