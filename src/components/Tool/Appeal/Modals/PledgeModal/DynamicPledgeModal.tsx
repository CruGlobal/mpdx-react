import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const preloadPledgeModal = () =>
  import(/* webpackChunkName: "PledgeModal" */ './PledgeModal').then(
    ({ PledgeModal }) => PledgeModal,
  );

export const DynamicPledgeModal = dynamic(preloadPledgeModal, {
  loading: DynamicModalPlaceholder,
});
