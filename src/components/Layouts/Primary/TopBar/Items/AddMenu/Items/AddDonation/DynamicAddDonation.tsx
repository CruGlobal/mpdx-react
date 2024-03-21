import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicComponentPlaceholder/DynamicComponentPlaceholder';

export const DynamicAddDonation = dynamic(
  () =>
    import(/* webpackChunkName: "AddDonation" */ './AddDonation').then(
      ({ AddDonation }) => AddDonation,
    ),
  {
    loading: () => <DynamicComponentPlaceholder />,
  },
);
