import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const preloadAddAppealModal = () =>
  import(/* webpackChunkName: "AddAppealModal" */ './AddAppealModal').then(
    ({ AddAppealModal }) => AddAppealModal,
  );

export const DynamicAddAppealModal = dynamic(preloadAddAppealModal, {
  loading: DynamicModalPlaceholder,
});
