import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const preloadContactDonationsTab = () =>
  import(
    /* webpackChunkName: "ContactDonationsTab" */ './ContactDonationsTab'
  ).then(({ ContactDonationsTab }) => ContactDonationsTab);

export const DynamicContactDonationsTab = dynamic(preloadContactDonationsTab, {
  loading: DynamicComponentPlaceholder,
});
