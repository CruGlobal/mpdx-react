import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const preloadEditDonationModal = () =>
  import(
    /* webpackChunkName: "EditDonationModal" */ './EditDonationModal'
  ).then(({ EditDonationModal }) => EditDonationModal);

export const DynamicEditDonationModal = dynamic(preloadEditDonationModal, {
  loading: DynamicModalPlaceholder,
});
