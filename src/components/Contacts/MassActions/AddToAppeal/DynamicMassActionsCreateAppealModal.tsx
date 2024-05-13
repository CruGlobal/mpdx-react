import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const preloadMassActionsCreateAppealModal = () =>
  import(
    /* webpackChunkName: "MassActionsCreateAppealModal" */ './MassActionsCreateAppealModal'
  ).then(({ MassActionsCreateAppealModal }) => MassActionsCreateAppealModal);

export const DynamicMassActionsCreateAppealModal = dynamic(
  preloadMassActionsCreateAppealModal,
  { loading: DynamicModalPlaceholder },
);
