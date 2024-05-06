import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const preloadDeleteContactModal = () =>
  import(
    /* webpackChunkName: "DeleteContactModal" */ './DeleteContactModal'
  ).then(({ DeleteContactModal }) => DeleteContactModal);

export const DynamicDeleteContactModal = dynamic(preloadDeleteContactModal, {
  loading: DynamicModalPlaceholder,
});
