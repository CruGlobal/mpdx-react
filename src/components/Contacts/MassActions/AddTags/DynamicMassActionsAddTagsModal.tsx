import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const DynamicMassActionsAddTagsModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "MassActionsAddTagsModal" */ './MassActionsAddTagsModal'
    ).then(({ MassActionsAddTagsModal }) => MassActionsAddTagsModal),
  { loading: DynamicModalPlaceholder },
);
