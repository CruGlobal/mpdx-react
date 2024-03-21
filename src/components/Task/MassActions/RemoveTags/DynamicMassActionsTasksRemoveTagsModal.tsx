import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const DynamicMassActionsTasksRemoveTagsModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "MassActionsTasksRemoveTagsModal" */ './MassActionsTasksRemoveTagsModal'
    ).then(
      ({ MassActionsTasksRemoveTagsModal }) => MassActionsTasksRemoveTagsModal,
    ),
  { loading: DynamicModalPlaceholder },
);
