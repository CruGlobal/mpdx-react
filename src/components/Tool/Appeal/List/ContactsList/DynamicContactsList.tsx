import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const preloadContactsList = () =>
  import(/* webpackChunkName: "ContactsList" */ './ContactsList').then(
    ({ ContactsList }) => ContactsList,
  );

export const DynamicContactsList = dynamic(preloadContactsList, {
  loading: DynamicComponentPlaceholder,
});
