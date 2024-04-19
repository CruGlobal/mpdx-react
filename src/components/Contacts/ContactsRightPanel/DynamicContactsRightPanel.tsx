import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const preloadContactsRightPanel = () =>
  import(
    /* webpackChunkName: "ContactsRightPanel" */ './ContactsRightPanel'
  ).then(({ ContactsRightPanel }) => ContactsRightPanel);

export const DynamicContactsRightPanel = dynamic(preloadContactsRightPanel, {
  loading: DynamicComponentPlaceholder,
});
