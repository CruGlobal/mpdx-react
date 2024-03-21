import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const DynamicEditDonationModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "EditDonationModal" */ './EditDonationModal'
    ).then(({ EditDonationModal }) => EditDonationModal),
  { loading: DynamicModalPlaceholder },
);
