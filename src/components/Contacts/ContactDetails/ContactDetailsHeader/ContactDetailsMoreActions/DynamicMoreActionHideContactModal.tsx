import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const preloadMoreActionHideContactModal = () =>
  import(
    /* webpackChunkName: "MoreActionHideContactModal" */ './MoreActionHideContactModal'
  ).then(({ MoreActionHideContactModal }) => MoreActionHideContactModal);

export const DynamicMoreActionHideContactModal = dynamic(
  preloadMoreActionHideContactModal,
  { loading: DynamicModalPlaceholder },
);
