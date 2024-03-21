import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const DynamicMassActionsAddToAppealModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "MassActionsAddToAppealModal" */ './MassActionsAddToAppealModal'
    ).then(({ MassActionsAddToAppealModal }) => MassActionsAddToAppealModal),
  { loading: DynamicModalPlaceholder },
);
