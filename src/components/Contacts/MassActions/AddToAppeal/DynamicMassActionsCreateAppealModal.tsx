import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const DynamicMassActionsCreateAppealModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "MassActionsCreateAppealModal" */ './MassActionsCreateAppealModal'
    ).then(({ MassActionsCreateAppealModal }) => MassActionsCreateAppealModal),
  { loading: DynamicModalPlaceholder },
);
