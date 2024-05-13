import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const preloadMassActionsAddToAppealModal = () =>
  import(
    /* webpackChunkName: "MassActionsAddToAppealModal" */ './MassActionsAddToAppealModal'
  ).then(({ MassActionsAddToAppealModal }) => MassActionsAddToAppealModal);

export const DynamicMassActionsAddToAppealModal = dynamic(
  preloadMassActionsAddToAppealModal,
  { loading: DynamicModalPlaceholder },
);
