import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const preloadFailedTransferModal = () =>
  import(
    /* webpackChunkName: "FailedTransferModal" */ './FailedTransferModal'
  ).then(({ FailedTransferModal }) => FailedTransferModal);

export const DynamicFailedTransferModal = dynamic(preloadFailedTransferModal, {
  loading: DynamicComponentPlaceholder,
});
