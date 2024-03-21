import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicComponentPlaceholder/DynamicComponentPlaceholder';

export const DynamicEditDonationModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "EditDonationModal" */ './EditDonationModal'
    ).then(({ EditDonationModal }) => EditDonationModal),
  {
    loading: () => <DynamicComponentPlaceholder />,
  },
);
