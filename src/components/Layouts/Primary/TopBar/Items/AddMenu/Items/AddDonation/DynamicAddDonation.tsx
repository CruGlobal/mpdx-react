import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const DynamicAddDonation = dynamic(
  () =>
    import(/* webpackChunkName: "AddDonation" */ './AddDonation').then(
      ({ AddDonation }) => AddDonation,
    ),
  { loading: DynamicComponentPlaceholder },
);
