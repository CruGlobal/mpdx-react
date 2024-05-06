import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const preloadMassActionsAddTagsModal = () =>
  import(
    /* webpackChunkName: "MassActionsAddTagsModal" */ './MassActionsAddTagsModal'
  ).then(({ MassActionsAddTagsModal }) => MassActionsAddTagsModal);

export const DynamicMassActionsAddTagsModal = dynamic(
  preloadMassActionsAddTagsModal,
  { loading: DynamicModalPlaceholder },
);
