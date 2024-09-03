import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const preloadDeletePledgeModal = () =>
  import(
    /* webpackChunkName: "DeletePledgeModal" */ './DeletePledgeModal'
  ).then(({ DeletePledgeModal }) => DeletePledgeModal);

export const DynamicDeletePledgeModal = dynamic(preloadDeletePledgeModal, {
  loading: DynamicModalPlaceholder,
});
