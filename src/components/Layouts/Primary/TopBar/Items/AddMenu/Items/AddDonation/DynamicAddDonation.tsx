import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const preloadAddDonation = () =>
  import(/* webpackChunkName: "AddDonation" */ './AddDonation').then(
    ({ AddDonation }) => AddDonation,
  );

export const DynamicAddDonation = dynamic(preloadAddDonation, {
  loading: DynamicComponentPlaceholder,
});
