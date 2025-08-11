import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const preloadDeleteTransferModal = () =>
  import(
    /* webpackChunkName: "DeleteTransferModal" */ './DeleteTransferModal'
  ).then(({ DeleteTransferModal }) => DeleteTransferModal);

export const DynamicDeleteTransferModal = dynamic(preloadDeleteTransferModal, {
  loading: DynamicComponentPlaceholder,
});
