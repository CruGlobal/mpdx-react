import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const DynamicMassActionsTasksConfirmationModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "MassActionsTasksConfirmationModal" */ './MassActionsTasksConfirmationModal'
    ).then(
      ({ MassActionsTasksConfirmationModal }) =>
        MassActionsTasksConfirmationModal,
    ),
  { loading: DynamicModalPlaceholder },
);
