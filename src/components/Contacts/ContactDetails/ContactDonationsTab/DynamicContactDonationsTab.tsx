import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicComponentPlaceholder/DynamicComponentPlaceholder';

export const DynamicContactDonationsTab = dynamic(
  () =>
    import(
      /* webpackChunkName: "ContactDonationsTab" */ './ContactDonationsTab'
    ).then(({ ContactDonationsTab }) => ContactDonationsTab),
  {
    loading: () => <DynamicComponentPlaceholder />,
  },
);
