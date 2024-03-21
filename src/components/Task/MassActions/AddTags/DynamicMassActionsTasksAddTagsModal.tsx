import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const DynamicMassActionsTasksAddTagsModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "MassActionsTasksAddTagsModal" */ './MassActionsTasksAddTagsModal'
    ).then(({ MassActionsTasksAddTagsModal }) => MassActionsTasksAddTagsModal),
  { loading: DynamicModalPlaceholder },
);
