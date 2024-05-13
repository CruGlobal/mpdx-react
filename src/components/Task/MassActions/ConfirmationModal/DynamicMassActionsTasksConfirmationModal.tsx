import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const preloadMassActionsTasksConfirmationModal = () =>
  import(
    /* webpackChunkName: "MassActionsTasksConfirmationModal" */ './MassActionsTasksConfirmationModal'
  ).then(
    ({ MassActionsTasksConfirmationModal }) =>
      MassActionsTasksConfirmationModal,
  );

export const DynamicMassActionsTasksConfirmationModal = dynamic(
  preloadMassActionsTasksConfirmationModal,
  { loading: DynamicModalPlaceholder },
);
