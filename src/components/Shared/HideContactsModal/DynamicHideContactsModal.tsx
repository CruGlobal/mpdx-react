import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const DynamicHideContactsModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "HideContactsModal" */ './HideContactsModal'
    ).then(({ HideContactsModal }) => HideContactsModal),
  { loading: DynamicModalPlaceholder },
);
