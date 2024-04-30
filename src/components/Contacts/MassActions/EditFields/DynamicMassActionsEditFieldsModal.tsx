import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const preloadMassActionsEditFieldsModal = () =>
  import(
    /* webpackChunkName: "MassActionsEditFieldsModal" */ './MassActionsEditFieldsModal'
  ).then(({ MassActionsEditFieldsModal }) => MassActionsEditFieldsModal);

export const DynamicMassActionsEditFieldsModal = dynamic(
  preloadMassActionsEditFieldsModal,
  { loading: DynamicModalPlaceholder },
);
