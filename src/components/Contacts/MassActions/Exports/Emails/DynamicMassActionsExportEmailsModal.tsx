import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const preloadMassActionsExportEmailsModal = () =>
  import(
    /* webpackChunkName: "MassActionsExportEmailsModal" */ './MassActionsExportEmailsModal'
  ).then(({ MassActionsExportEmailsModal }) => MassActionsExportEmailsModal);

export const DynamicMassActionsExportEmailsModal = dynamic(
  preloadMassActionsExportEmailsModal,
  { loading: DynamicModalPlaceholder },
);
