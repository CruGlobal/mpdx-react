import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const DynamicMassActionsRemoveTagsModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "MassActionsRemoveTagsModal" */ './MassActionsRemoveTagsModal'
    ).then(({ MassActionsRemoveTagsModal }) => MassActionsRemoveTagsModal),
  { loading: DynamicModalPlaceholder },
);
