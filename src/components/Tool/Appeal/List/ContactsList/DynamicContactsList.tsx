import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const DynamicContactsList = dynamic(
  () =>
    import(/* webpackChunkName: "ContactsList" */ './ContactsList').then(
      ({ ContactsList }) => ContactsList,
    ),
  { loading: DynamicComponentPlaceholder },
);
