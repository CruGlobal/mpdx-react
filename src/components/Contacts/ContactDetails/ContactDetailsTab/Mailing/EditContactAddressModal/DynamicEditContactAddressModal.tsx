import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const DynamicEditContactAddressModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "EditContactAddressModal" */ './EditContactAddressModal'
    ).then(({ EditContactAddressModal }) => EditContactAddressModal),
  { loading: DynamicComponentPlaceholder },
);
