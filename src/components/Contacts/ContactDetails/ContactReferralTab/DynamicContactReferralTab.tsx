import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicComponentPlaceholder/DynamicComponentPlaceholder';

export const DynamicContactReferralTab = dynamic(
  () =>
    import(
      /* webpackChunkName: "ContactReferralTab" */ './ContactReferralTab'
    ).then(({ ContactReferralTab }) => ContactReferralTab),
  {
    loading: () => <DynamicComponentPlaceholder />,
  },
);
