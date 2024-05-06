import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const preloadContactReferralTab = () =>
  import(
    /* webpackChunkName: "ContactReferralTab" */ './ContactReferralTab'
  ).then(({ ContactReferralTab }) => ContactReferralTab);

export const DynamicContactReferralTab = dynamic(preloadContactReferralTab, {
  loading: DynamicComponentPlaceholder,
});
