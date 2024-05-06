import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const DynamicContactsMap = dynamic(
  () =>
    import(/* webpackChunkName: "ContactsMap" */ './ContactsMap').then(
      ({ ContactsMap }) => ContactsMap,
    ),
  { loading: DynamicComponentPlaceholder },
);
