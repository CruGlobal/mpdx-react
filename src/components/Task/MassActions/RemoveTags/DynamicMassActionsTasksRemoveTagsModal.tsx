import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const preloadMassActionsTasksRemoveTagsModal = () =>
  import(
    /* webpackChunkName: "MassActionsTasksRemoveTagsModal" */ './MassActionsTasksRemoveTagsModal'
  ).then(
    ({ MassActionsTasksRemoveTagsModal }) => MassActionsTasksRemoveTagsModal,
  );

export const DynamicMassActionsTasksRemoveTagsModal = dynamic(
  preloadMassActionsTasksRemoveTagsModal,
  { loading: DynamicModalPlaceholder },
);
