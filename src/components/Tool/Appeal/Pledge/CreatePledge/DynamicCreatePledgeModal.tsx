import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const preloadCreatePledgeModal = () =>
  import(
    /* webpackChunkName: "CreatePledgeModal" */ './CreatePledgeModal'
  ).then(({ CreatePledgeModal }) => CreatePledgeModal);

export const DynamicCreatePledgeModal = dynamic(preloadCreatePledgeModal, {
  loading: DynamicModalPlaceholder,
});
