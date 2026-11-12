import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const preloadAddMpdCoachModal = () =>
  import(/* webpackChunkName: "AddMpdCoachModal" */ './AddMpdCoachModal').then(
    ({ AddMpdCoachModal }) => AddMpdCoachModal,
  );

export const DynamicAddMpdCoachModal = dynamic(preloadAddMpdCoachModal, {
  loading: DynamicModalPlaceholder,
});
