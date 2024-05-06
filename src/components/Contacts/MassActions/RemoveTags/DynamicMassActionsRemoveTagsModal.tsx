import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const preloadMassActionsRemoveTagsModal = () =>
  import(
    /* webpackChunkName: "MassActionsRemoveTagsModal" */ './MassActionsRemoveTagsModal'
  ).then(({ MassActionsRemoveTagsModal }) => MassActionsRemoveTagsModal);

export const DynamicMassActionsRemoveTagsModal = dynamic(
  preloadMassActionsRemoveTagsModal,
  { loading: DynamicModalPlaceholder },
);
