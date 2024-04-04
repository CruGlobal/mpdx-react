import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const preloadContactDetailsTab = () =>
  import(
    /* webpackChunkName: "ContactDetailsTab" */ './ContactDetailsTab'
  ).then(({ ContactDetailsTab }) => ContactDetailsTab);

export const DynamicContactDetailsTab = dynamic(preloadContactDetailsTab, {
  loading: DynamicComponentPlaceholder,
});
