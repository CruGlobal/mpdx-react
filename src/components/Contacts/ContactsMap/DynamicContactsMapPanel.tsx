import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const DynamicContactsMapPanel = dynamic(
  () =>
    import(
      /* webpackChunkName: "ContactsMapPanel" */ './ContactsMapPanel'
    ).then(({ ContactsMapPanel }) => ContactsMapPanel),
  { loading: DynamicComponentPlaceholder },
);
