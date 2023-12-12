import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const DynamicContactsRightPanel = dynamic(
  () =>
    import(
      /* webpackChunkName: "ContactsRightPanel" */ './ContactsRightPanel'
    ).then(({ ContactsRightPanel }) => ContactsRightPanel),
  { loading: DynamicComponentPlaceholder },
);
