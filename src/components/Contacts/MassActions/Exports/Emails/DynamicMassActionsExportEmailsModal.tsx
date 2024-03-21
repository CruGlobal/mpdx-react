import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const DynamicMassActionsExportEmailsModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "MassActionsExportEmailsModal" */ './MassActionsExportEmailsModal'
    ).then(({ MassActionsExportEmailsModal }) => MassActionsExportEmailsModal),
  { loading: DynamicModalPlaceholder },
);
