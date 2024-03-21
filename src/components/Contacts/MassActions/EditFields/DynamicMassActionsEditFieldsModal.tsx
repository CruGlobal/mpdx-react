import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const DynamicMassActionsEditFieldsModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "MassActionsEditFieldsModal" */ './MassActionsEditFieldsModal'
    ).then(({ MassActionsEditFieldsModal }) => MassActionsEditFieldsModal),
  { loading: DynamicModalPlaceholder },
);
