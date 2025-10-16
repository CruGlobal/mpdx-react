import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const preloadTransferModal = () =>
  import(/* webpackChunkName: "TransferModal" */ './TransferModal').then(
    ({ TransferModal }) => TransferModal,
  );

export const DynamicTransferModal = dynamic(preloadTransferModal, {
  loading: DynamicComponentPlaceholder,
});
