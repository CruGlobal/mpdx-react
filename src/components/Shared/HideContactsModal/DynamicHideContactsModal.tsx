import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const preloadHideContactsModal = () =>
  import(
    /* webpackChunkName: "HideContactsModal" */ './HideContactsModal'
  ).then(({ HideContactsModal }) => HideContactsModal);

export const DynamicHideContactsModal = dynamic(preloadHideContactsModal, {
  loading: DynamicModalPlaceholder,
});
