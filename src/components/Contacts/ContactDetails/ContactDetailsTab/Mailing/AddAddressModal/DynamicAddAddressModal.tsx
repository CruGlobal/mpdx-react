import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const DynamicAddAddressModal = dynamic(
  () =>
    import(/* webpackChunkName: "AddAddressModal" */ './AddAddressModal').then(
      ({ AddAddressModal }) => AddAddressModal,
    ),
  { loading: DynamicComponentPlaceholder },
);
