import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const preloadMassActionsTasksAddTagsModal = () =>
  import(
    /* webpackChunkName: "MassActionsTasksAddTagsModal" */ './MassActionsTasksAddTagsModal'
  ).then(({ MassActionsTasksAddTagsModal }) => MassActionsTasksAddTagsModal);

export const DynamicMassActionsTasksAddTagsModal = dynamic(
  preloadMassActionsTasksAddTagsModal,
  { loading: DynamicModalPlaceholder },
);
